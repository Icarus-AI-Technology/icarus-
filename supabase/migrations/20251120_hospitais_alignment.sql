-- ============================================
-- Migration: 20251120 - Hospitais Alignment
-- Objetivo: alinhar schema de hospitais com expectativas do frontend
-- ============================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.hospitais'::regclass
      AND tgname = 'update_hospitais_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.hospitais DISABLE TRIGGER update_hospitais_updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.hospitais'::regclass
      AND tgname = 'trg_validar_cnpj_hospitais'
  ) THEN
    EXECUTE 'ALTER TABLE public.hospitais DISABLE TRIGGER trigger_validar_cnpj';
  END IF;
END $$;

-- =====================================================
-- 1. Enums para status e tipo
-- =====================================================
DO $$
BEGIN
  CREATE TYPE public.hospital_status_enum AS ENUM ('ativo','inativo');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.hospital_tipo_enum AS ENUM ('publico','privado','filantrópico');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Normalizar valores atuais
ALTER TABLE public.hospitais
  DROP CONSTRAINT IF EXISTS hospitais_status_check,
  DROP CONSTRAINT IF EXISTS hospitais_tipo_check;

UPDATE public.hospitais
SET status = COALESCE(NULLIF(LOWER(status), ''),'ativo');

UPDATE public.hospitais
SET tipo = CASE
  WHEN tipo ILIKE 'priv%' THEN 'privado'
  WHEN tipo ILIKE 'filant%' OR tipo ILIKE 'filantr%' THEN 'filantrópico'
  WHEN tipo ILIKE 'pub%' THEN 'publico'
  ELSE 'publico'
END;

UPDATE public.hospitais
SET cnpj = regexp_replace(cnpj, '[^0-9]', '', 'g')
WHERE cnpj IS NOT NULL;

-- =====================================================
-- 2. Novas colunas e defaults obrigatórios
-- =====================================================
ALTER TABLE public.hospitais
  ADD COLUMN IF NOT EXISTS contato_principal TEXT DEFAULT '';

ALTER TABLE public.hospitais
  ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '';

ALTER TABLE public.hospitais
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.hospitais
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.hospitais
SET contato_principal = COALESCE(contato_principal, ''),
    observacoes = COALESCE(observacoes, ''),
    created_at = COALESCE(created_at, criado_em, NOW()),
    updated_at = COALESCE(updated_at, atualizado_em, NOW()),
    nome = COALESCE(nome, ''),
    cnpj = COALESCE(cnpj, ''),
    endereco = COALESCE(endereco, ''),
    cidade = COALESCE(cidade, ''),
    estado = COALESCE(estado, ''),
    telefone = COALESCE(telefone, ''),
    email = COALESCE(email, ''),
    cep = COALESCE(cep, ''),
    status = COALESCE(status, 'ativo'),
    tipo = COALESCE(tipo, 'publico');

ALTER TABLE public.hospitais
  ALTER COLUMN contato_principal SET NOT NULL,
  ALTER COLUMN contato_principal SET DEFAULT '',
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN nome SET DEFAULT '',
  ALTER COLUMN cnpj SET NOT NULL,
  ALTER COLUMN cnpj SET DEFAULT '',
  ALTER COLUMN endereco SET NOT NULL,
  ALTER COLUMN endereco SET DEFAULT '',
  ALTER COLUMN cidade SET NOT NULL,
  ALTER COLUMN cidade SET DEFAULT '',
  ALTER COLUMN estado SET NOT NULL,
  ALTER COLUMN estado SET DEFAULT '',
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN telefone SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN cep SET NOT NULL,
  ALTER COLUMN cep SET DEFAULT '';

ALTER TABLE public.hospitais
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

ALTER TABLE public.hospitais
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.hospitais
  ALTER COLUMN tipo DROP DEFAULT;

-- =====================================================
-- 3. Converter colunas texto para enums
-- =====================================================
ALTER TABLE public.hospitais
  ALTER COLUMN status TYPE public.hospital_status_enum USING LOWER(status)::public.hospital_status_enum,
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.hospitais
  ALTER COLUMN tipo TYPE public.hospital_tipo_enum USING tipo::public.hospital_tipo_enum,
  ALTER COLUMN tipo SET DEFAULT 'publico',
  ALTER COLUMN tipo SET NOT NULL;

-- =====================================================
-- 4. Trigger de sincronização created/updated
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_hospitais_alias_columns()
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

  IF NEW.contato_principal IS NULL THEN
    NEW.contato_principal := '';
  END IF;
  IF NEW.observacoes IS NULL THEN
    NEW.observacoes := '';
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status := 'ativo';
  END IF;
  IF NEW.tipo IS NULL THEN
    NEW.tipo := 'publico';
  END IF;

  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_hospitais_alias ON public.hospitais;
CREATE TRIGGER trg_sync_hospitais_alias
  BEFORE INSERT OR UPDATE ON public.hospitais
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_hospitais_alias_columns();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.hospitais'::regclass
      AND tgname = 'update_hospitais_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.hospitais ENABLE TRIGGER update_hospitais_updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.hospitais'::regclass
      AND tgname = 'trg_validar_cnpj_hospitais'
  ) THEN
    EXECUTE 'ALTER TABLE public.hospitais ENABLE TRIGGER trg_validar_cnpj_hospitais';
  END IF;
END $$;

COMMIT;
