-- ============================================
-- Migration: 20251120 - Convenios Alignment
-- ============================================

BEGIN;

-- Disable existing updated_at triggers temporarily
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.convenios'::regclass AND tgname = 'convenios_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.convenios DISABLE TRIGGER convenios_updated_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.convenios'::regclass AND tgname = 'trg_convenios_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.convenios DISABLE TRIGGER trg_convenios_updated';
  END IF;
END $$;

-- Enums
DO $$
BEGIN
  CREATE TYPE public.convenio_tipo_enum AS ENUM ('plano_saude','seguros','publico');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add new columns / aliases
ALTER TABLE public.convenios
  ADD COLUMN IF NOT EXISTS empresa_id UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ans_registro TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS site TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cep TEXT,
  ADD COLUMN IF NOT EXISTS endereco_logradouro TEXT,
  ADD COLUMN IF NOT EXISTS endereco_numero TEXT,
  ADD COLUMN IF NOT EXISTS endereco_complemento TEXT,
  ADD COLUMN IF NOT EXISTS endereco_bairro TEXT,
  ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
  ADD COLUMN IF NOT EXISTS endereco_uf TEXT,
  ADD COLUMN IF NOT EXISTS prazo_pagamento INTEGER,
  ADD COLUMN IF NOT EXISTS taxa_administrativa NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS forma_pagamento TEXT,
  ADD COLUMN IF NOT EXISTS dia_fechamento INTEGER,
  ADD COLUMN IF NOT EXISTS dia_pagamento INTEGER,
  ADD COLUMN IF NOT EXISTS faturamento_eletronico BOOLEAN,
  ADD COLUMN IF NOT EXISTS portal_faturamento TEXT,
  ADD COLUMN IF NOT EXISTS login_portal TEXT,
  ADD COLUMN IF NOT EXISTS senha_portal TEXT,
  ADD COLUMN IF NOT EXISTS exige_autorizacao BOOLEAN,
  ADD COLUMN IF NOT EXISTS prazo_autorizacao INTEGER,
  ADD COLUMN IF NOT EXISTS tabela_preco_id UUID,
  ADD COLUMN IF NOT EXISTS usa_tabela_tuss BOOLEAN,
  ADD COLUMN IF NOT EXISTS percentual_tuss NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS total_faturado NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS total_glosas NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS taxa_glosa NUMERIC(5,2);

-- Normalize existing data
UPDATE public.convenios
SET empresa_id = COALESCE(empresa_id, public.current_empresa()),
    created_at = COALESCE(created_at, COALESCE(criado_em, NOW())),
    updated_at = COALESCE(updated_at, COALESCE(atualizado_em, NOW())),
    telefone = COALESCE(telefone, contato, ''),
    whatsapp = COALESCE(whatsapp, contato, ''),
    email = COALESCE(email, ''),
    site = COALESCE(site, ''),
    endereco_cep = COALESCE(endereco_cep, ''),
    endereco_logradouro = COALESCE(endereco_logradouro, ''),
    endereco_numero = COALESCE(endereco_numero, ''),
    endereco_complemento = COALESCE(endereco_complemento, ''),
    endereco_bairro = COALESCE(endereco_bairro, ''),
    endereco_cidade = COALESCE(endereco_cidade, ''),
    endereco_uf = COALESCE(endereco_uf, ''),
    prazo_pagamento = COALESCE(prazo_pagamento, 30),
    taxa_administrativa = COALESCE(taxa_administrativa, 0),
    forma_pagamento = COALESCE(forma_pagamento, ''),
    dia_fechamento = COALESCE(dia_fechamento, 0),
    dia_pagamento = COALESCE(dia_pagamento, 0),
    faturamento_eletronico = COALESCE(faturamento_eletronico, FALSE),
    portal_faturamento = COALESCE(portal_faturamento, ''),
    login_portal = COALESCE(login_portal, ''),
    senha_portal = COALESCE(senha_portal, ''),
    exige_autorizacao = COALESCE(exige_autorizacao, FALSE),
    prazo_autorizacao = COALESCE(prazo_autorizacao, 0),
    usa_tabela_tuss = COALESCE(usa_tabela_tuss, FALSE),
    percentual_tuss = COALESCE(percentual_tuss, 0),
    ativo = COALESCE(ativo, TRUE),
    observacoes = COALESCE(observacoes, ''),
    total_faturado = COALESCE(total_faturado, 0),
    total_glosas = COALESCE(total_glosas, 0),
    taxa_glosa = COALESCE(taxa_glosa, 0),
    nome = COALESCE(nome, ''),
    cnpj = COALESCE(cnpj, ''),
    tipo = COALESCE(tipo, 'plano_saude');

-- Defaults & constraints
ALTER TABLE public.convenios
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa(),
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN telefone SET DEFAULT '',
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN whatsapp SET DEFAULT '',
  ALTER COLUMN whatsapp SET NOT NULL,
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN endereco_cep SET DEFAULT '',
  ALTER COLUMN endereco_cep SET NOT NULL,
  ALTER COLUMN endereco_logradouro SET DEFAULT '',
  ALTER COLUMN endereco_logradouro SET NOT NULL,
  ALTER COLUMN endereco_numero SET DEFAULT '',
  ALTER COLUMN endereco_numero SET NOT NULL,
  ALTER COLUMN endereco_complemento SET DEFAULT '',
  ALTER COLUMN endereco_bairro SET DEFAULT '',
  ALTER COLUMN endereco_bairro SET NOT NULL,
  ALTER COLUMN endereco_cidade SET DEFAULT '',
  ALTER COLUMN endereco_cidade SET NOT NULL,
  ALTER COLUMN endereco_uf SET DEFAULT '',
  ALTER COLUMN endereco_uf SET NOT NULL,
  ALTER COLUMN prazo_pagamento SET DEFAULT 30,
  ALTER COLUMN prazo_pagamento SET NOT NULL,
  ALTER COLUMN taxa_administrativa SET DEFAULT 0,
  ALTER COLUMN forma_pagamento SET DEFAULT '',
  ALTER COLUMN dia_fechamento SET DEFAULT 0,
  ALTER COLUMN dia_pagamento SET DEFAULT 0,
  ALTER COLUMN faturamento_eletronico SET DEFAULT FALSE,
  ALTER COLUMN faturamento_eletronico SET NOT NULL,
  ALTER COLUMN exige_autorizacao SET DEFAULT FALSE,
  ALTER COLUMN exige_autorizacao SET NOT NULL,
  ALTER COLUMN usa_tabela_tuss SET DEFAULT FALSE,
  ALTER COLUMN usa_tabela_tuss SET NOT NULL,
  ALTER COLUMN ativo SET DEFAULT TRUE,
  ALTER COLUMN ativo SET NOT NULL,
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN total_faturado SET DEFAULT 0,
  ALTER COLUMN total_faturado SET NOT NULL,
  ALTER COLUMN total_glosas SET DEFAULT 0,
  ALTER COLUMN total_glosas SET NOT NULL,
  ALTER COLUMN taxa_glosa SET DEFAULT 0,
  ALTER COLUMN taxa_glosa SET NOT NULL;

-- Ensure FK to tabelas_precos exists when column populated
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tabelas_precos') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.convenios'::regclass AND conname = 'convenios_tabela_preco_id_fkey'
    ) THEN
      ALTER TABLE public.convenios
        ADD CONSTRAINT convenios_tabela_preco_id_fkey FOREIGN KEY (tabela_preco_id)
        REFERENCES public.tabelas_precos(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Convert tipo to enum
ALTER TABLE public.convenios
  ALTER COLUMN tipo TYPE public.convenio_tipo_enum USING (CASE
    WHEN LOWER(tipo) IN ('plano_saude','plano de saude','saude') THEN 'plano_saude'
    WHEN LOWER(tipo) LIKE 'seguro%' THEN 'seguros'
    WHEN LOWER(tipo) LIKE 'public%' THEN 'publico'
    ELSE 'plano_saude'
  END)::public.convenio_tipo_enum,
  ALTER COLUMN tipo SET DEFAULT 'plano_saude',
  ALTER COLUMN tipo SET NOT NULL;

-- Sync trigger
CREATE OR REPLACE FUNCTION public.sync_convenios_alias_columns()
RETURNS trigger
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
  NEW.atualizado_em := NEW.updated_at;

  IF NEW.telefone IS NULL THEN
    NEW.telefone := '';
  END IF;
  IF NEW.whatsapp IS NULL THEN
    NEW.whatsapp := NEW.telefone;
  END IF;
  IF NEW.email IS NULL THEN
    NEW.email := '';
  END IF;
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;
  IF NEW.endereco_cep IS NULL THEN NEW.endereco_cep := ''; END IF;
  IF NEW.endereco_logradouro IS NULL THEN NEW.endereco_logradouro := ''; END IF;
  IF NEW.endereco_numero IS NULL THEN NEW.endereco_numero := ''; END IF;
  IF NEW.endereco_bairro IS NULL THEN NEW.endereco_bairro := ''; END IF;
  IF NEW.endereco_cidade IS NULL THEN NEW.endereco_cidade := ''; END IF;
  IF NEW.endereco_uf IS NULL THEN NEW.endereco_uf := ''; END IF;
  IF NEW.prazo_pagamento IS NULL THEN NEW.prazo_pagamento := 30; END IF;
  IF NEW.taxa_administrativa IS NULL THEN NEW.taxa_administrativa := 0; END IF;
  IF NEW.dia_fechamento IS NULL THEN NEW.dia_fechamento := 0; END IF;
  IF NEW.dia_pagamento IS NULL THEN NEW.dia_pagamento := 0; END IF;
  IF NEW.faturamento_eletronico IS NULL THEN NEW.faturamento_eletronico := FALSE; END IF;
  IF NEW.exige_autorizacao IS NULL THEN NEW.exige_autorizacao := FALSE; END IF;
  IF NEW.usa_tabela_tuss IS NULL THEN NEW.usa_tabela_tuss := FALSE; END IF;
  IF NEW.ativo IS NULL THEN NEW.ativo := TRUE; END IF;
  IF NEW.observacoes IS NULL THEN NEW.observacoes := ''; END IF;
  IF NEW.total_faturado IS NULL THEN NEW.total_faturado := 0; END IF;
  IF NEW.total_glosas IS NULL THEN NEW.total_glosas := 0; END IF;
  IF NEW.taxa_glosa IS NULL THEN NEW.taxa_glosa := 0; END IF;
  IF NEW.tipo IS NULL THEN NEW.tipo := 'plano_saude'; END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_convenios_alias ON public.convenios;
CREATE TRIGGER trg_sync_convenios_alias
  BEFORE INSERT OR UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_convenios_alias_columns();

-- Re-enable triggers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.convenios'::regclass AND tgname = 'convenios_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.convenios ENABLE TRIGGER convenios_updated_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.convenios'::regclass AND tgname = 'trg_convenios_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.convenios ENABLE TRIGGER trg_convenios_updated';
  END IF;
END $$;

COMMIT;
