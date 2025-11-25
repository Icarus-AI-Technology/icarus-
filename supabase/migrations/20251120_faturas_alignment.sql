-- ============================================
-- Migration: 20251120 - Faturas (Notas Fiscais) Alignment
-- ============================================

BEGIN;

-- Ensure helper extension exists for UUID generation (if needed later)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Disable existing triggers while we reshape the table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.notas_fiscais'::regclass AND tgname = 'trg_notas_fiscais_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.notas_fiscais DISABLE TRIGGER trg_notas_fiscais_updated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.notas_fiscais'::regclass AND tgname = 'trg_sync_notas_fiscais_alias'
  ) THEN
    EXECUTE 'ALTER TABLE public.notas_fiscais DISABLE TRIGGER trg_sync_notas_fiscais_alias';
  END IF;
END $$;

-- Enums for app-facing status, customer type and document type
DO $$
BEGIN
  CREATE TYPE public.nota_status_app_enum AS ENUM ('rascunho','pendente','emitida','autorizada','cancelada','paga');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.nota_cliente_tipo_enum AS ENUM ('hospital','medico','outro');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.nota_documento_tipo_enum AS ENUM ('nfe','nfse','cte','mdfe');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- New alias / helper columns expected by the frontend
ALTER TABLE public.notas_fiscais
  ADD COLUMN IF NOT EXISTS numero_nfe TEXT,
  ADD COLUMN IF NOT EXISTS cliente_id UUID,
  ADD COLUMN IF NOT EXISTS cliente_tipo public.nota_cliente_tipo_enum DEFAULT 'hospital',
  ADD COLUMN IF NOT EXISTS cliente_nome TEXT,
  ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT,
  ADD COLUMN IF NOT EXISTS cliente_email TEXT,
  ADD COLUMN IF NOT EXISTS cliente_telefone TEXT,
  ADD COLUMN IF NOT EXISTS data_pagamento DATE,
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS valor_impostos NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Drop legacy constraints that conflict with new enums
ALTER TABLE public.notas_fiscais
  DROP CONSTRAINT IF EXISTS notas_fiscais_status_check,
  DROP CONSTRAINT IF EXISTS notas_fiscais_tipo_check;

-- Normalize existing records
UPDATE public.notas_fiscais
SET
  numero_nfe = COALESCE(numero_nfe, numero, '0'),
  cliente_nome = COALESCE(cliente_nome, destinatario_nome, fornecedor_nome, ''),
  cliente_cpf_cnpj = COALESCE(cliente_cpf_cnpj, destinatario_cpf_cnpj, destinatario_cnpj, fornecedor_cnpj, ''),
  cliente_email = COALESCE(cliente_email, ''),
  cliente_telefone = COALESCE(cliente_telefone, ''),
  cliente_tipo = COALESCE(cliente_tipo, 'hospital'::public.nota_cliente_tipo_enum),
  forma_pagamento = COALESCE(forma_pagamento, ''),
  valor_impostos = COALESCE(valor_impostos, COALESCE(valor_icms,0) + COALESCE(valor_pis,0) + COALESCE(valor_cofins,0) + COALESCE(valor_ipi,0), 0),
  created_at = COALESCE(created_at, COALESCE(criado_em, NOW())),
  updated_at = COALESCE(updated_at, COALESCE(atualizado_em, created_at, NOW()));

-- Enforce defaults / constraints
ALTER TABLE public.notas_fiscais
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa(),
  ALTER COLUMN empresa_id SET NOT NULL,
  ALTER COLUMN numero_nfe SET DEFAULT '0',
  ALTER COLUMN numero_nfe SET NOT NULL,
  ALTER COLUMN cliente_nome SET DEFAULT '',
  ALTER COLUMN cliente_nome SET NOT NULL,
  ALTER COLUMN cliente_cpf_cnpj SET DEFAULT '',
  ALTER COLUMN cliente_cpf_cnpj SET NOT NULL,
  ALTER COLUMN cliente_email SET DEFAULT '',
  ALTER COLUMN cliente_email SET NOT NULL,
  ALTER COLUMN cliente_telefone SET DEFAULT '',
  ALTER COLUMN cliente_telefone SET NOT NULL,
  ALTER COLUMN forma_pagamento SET DEFAULT '',
  ALTER COLUMN forma_pagamento SET NOT NULL,
  ALTER COLUMN valor_impostos SET DEFAULT 0,
  ALTER COLUMN valor_impostos SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.notas_fiscais
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.notas_fiscais
  ALTER COLUMN status TYPE public.nota_status_app_enum USING (
    CASE
      WHEN COALESCE(status::text,'') ILIKE 'rascunho' THEN 'rascunho'
      WHEN COALESCE(status::text,'') ILIKE 'pend%' THEN 'pendente'
      WHEN COALESCE(status::text,'') ILIKE 'emit%' THEN 'emitida'
      WHEN COALESCE(status::text,'') ILIKE 'autori%' THEN 'autorizada'
      WHEN COALESCE(status::text,'') ILIKE 'cancel%' THEN 'cancelada'
      WHEN COALESCE(status::text,'') ILIKE 'paga%' THEN 'paga'
      ELSE 'pendente'
    END
  )::public.nota_status_app_enum,
  ALTER COLUMN status SET DEFAULT 'pendente';

ALTER TABLE public.notas_fiscais
  ALTER COLUMN tipo DROP DEFAULT;

ALTER TABLE public.notas_fiscais
  ALTER COLUMN tipo TYPE public.nota_documento_tipo_enum USING (
    CASE
      WHEN COALESCE(tipo::text,'') ILIKE 'nfe' THEN 'nfe'
      WHEN COALESCE(tipo::text,'') ILIKE 'nfse' THEN 'nfse'
      WHEN COALESCE(tipo::text,'') ILIKE 'cte' THEN 'cte'
      WHEN COALESCE(tipo::text,'') ILIKE 'mdfe' THEN 'mdfe'
      ELSE 'nfe'
    END
  )::public.nota_documento_tipo_enum,
  ALTER COLUMN tipo SET DEFAULT 'nfe';

-- Updated trigger to keep alias columns in sync
CREATE OR REPLACE FUNCTION public.sync_notas_fiscais_alias_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.criado_em, NOW());
  END IF;
  IF NEW.criado_em IS NULL THEN
    NEW.criado_em := NEW.created_at;
  END IF;

  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;
  IF NEW.atualizado_em IS NULL THEN
    NEW.atualizado_em := NEW.updated_at;
  END IF;

  IF COALESCE(NEW.numero_nfe, '') = '' THEN
    NEW.numero_nfe := COALESCE(NEW.numero, '0');
  END IF;
  IF COALESCE(NEW.numero, '') = '' THEN
    NEW.numero := NEW.numero_nfe;
  END IF;

  IF COALESCE(NEW.cliente_nome, '') = '' THEN
    NEW.cliente_nome := COALESCE(NEW.destinatario_nome, NEW.fornecedor_nome, '');
  END IF;
  IF COALESCE(NEW.cliente_cpf_cnpj, '') = '' THEN
    NEW.cliente_cpf_cnpj := COALESCE(NEW.destinatario_cpf_cnpj, NEW.destinatario_cnpj, NEW.fornecedor_cnpj, '');
  END IF;
  IF NEW.cliente_tipo IS NULL THEN
    NEW.cliente_tipo := 'hospital';
  END IF;
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;
  IF NEW.forma_pagamento IS NULL THEN
    NEW.forma_pagamento := '';
  END IF;
  IF NEW.valor_impostos IS NULL THEN
    NEW.valor_impostos := 0;
  END IF;
  IF NEW.status IS NULL THEN
    NEW.status := 'pendente';
  END IF;
  IF NEW.tipo IS NULL THEN
    NEW.tipo := 'nfe';
  END IF;

  -- Mirror protocolo alias from previous migration
  IF NEW.protocolo IS NULL AND NEW.protocolo_autorizacao IS NOT NULL THEN
    NEW.protocolo := NEW.protocolo_autorizacao;
  ELSIF NEW.protocolo IS NOT NULL AND COALESCE(NEW.protocolo_autorizacao, '') = '' THEN
    NEW.protocolo_autorizacao := NEW.protocolo;
  END IF;

  IF NEW.destinatario_cpf_cnpj IS NULL AND NEW.destinatario_cnpj IS NOT NULL THEN
    NEW.destinatario_cpf_cnpj := NEW.destinatario_cnpj;
  ELSIF NEW.destinatario_cpf_cnpj IS NOT NULL AND COALESCE(NEW.destinatario_cnpj, '') = '' THEN
    NEW.destinatario_cnpj := NEW.destinatario_cpf_cnpj;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_notas_fiscais_alias ON public.notas_fiscais;
CREATE TRIGGER trg_sync_notas_fiscais_alias
  BEFORE INSERT OR UPDATE ON public.notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_notas_fiscais_alias_columns();

-- Re-enable triggers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.notas_fiscais'::regclass AND tgname = 'trg_notas_fiscais_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.notas_fiscais ENABLE TRIGGER trg_notas_fiscais_updated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.notas_fiscais'::regclass AND tgname = 'trg_sync_notas_fiscais_alias'
  ) THEN
    EXECUTE 'ALTER TABLE public.notas_fiscais ENABLE TRIGGER trg_sync_notas_fiscais_alias';
  END IF;
END $$;

COMMIT;
