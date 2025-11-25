-- ============================================
-- Migration: 20251119 - Hospitais Alignment
-- Objetivo: alinhar tabela hospitais com os hooks do frontend
-- ============================================

BEGIN;

-- --------------------------------------------------
-- 1. Tipos enum para status/tipo
-- --------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.hospital_status_enum AS ENUM ('ativo','inativo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.hospital_tipo_enum AS ENUM ('publico','privado','filantrópico');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- --------------------------------------------------
-- 2. Colunas e defaults
-- --------------------------------------------------
ALTER TABLE public.hospitais
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contato_principal TEXT,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

UPDATE public.hospitais
SET
  created_at = COALESCE(created_at, criado_em, NOW()),
  updated_at = COALESCE(updated_at, atualizado_em, NOW()),
  contato_principal = COALESCE(contato_principal, ''),
  observacoes = COALESCE(observacoes, ''),
  nome = COALESCE(NULLIF(nome, ''), 'Hospital sem nome'),
  endereco = COALESCE(endereco, ''),
  cidade = COALESCE(cidade, ''),
  estado = COALESCE(estado, ''),
  telefone = COALESCE(telefone, ''),
  email = COALESCE(email, ''),
  cnpj = COALESCE(NULLIF(regexp_replace(COALESCE(cnpj, ''), '\\D', '', 'g'), ''), '00000000000000'),
  status = COALESCE(status, 'ativo'),
  tipo = COALESCE(tipo, 'privado');

ALTER TABLE public.hospitais
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN contato_principal SET DEFAULT '',
  ALTER COLUMN contato_principal SET NOT NULL,
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN endereco SET DEFAULT '',
  ALTER COLUMN endereco SET NOT NULL,
  ALTER COLUMN cidade SET DEFAULT '',
  ALTER COLUMN cidade SET NOT NULL,
  ALTER COLUMN estado SET DEFAULT '',
  ALTER COLUMN estado SET NOT NULL,
  ALTER COLUMN telefone SET DEFAULT '',
  ALTER COLUMN telefone SET NOT NULL,
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN cnpj SET DEFAULT '00000000000000',
  ALTER COLUMN cnpj SET NOT NULL;

ALTER TABLE public.hospitais
  ALTER COLUMN tipo TYPE public.hospital_tipo_enum USING (
    CASE
      WHEN lower(COALESCE(tipo, '')) = 'publico' THEN 'publico'
      WHEN lower(COALESCE(tipo, '')) = 'privado' THEN 'privado'
      WHEN lower(replace(COALESCE(tipo, ''),'ó','o')) = 'filantropico' THEN 'filantrópico'
      ELSE 'privado'
    END
  )::public.hospital_tipo_enum,
  ALTER COLUMN tipo SET DEFAULT 'privado',
  ALTER COLUMN tipo SET NOT NULL;

ALTER TABLE public.hospitais
  ALTER COLUMN status TYPE public.hospital_status_enum USING (
    CASE
      WHEN lower(COALESCE(status, '')) = 'inativo' THEN 'inativo'
      ELSE 'ativo'
    END
  )::public.hospital_status_enum,
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.hospitais
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

-- --------------------------------------------------
-- 3. Trigger para sincronizar colunas PT/EN
-- --------------------------------------------------
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

  IF NEW.cnpj IS NULL OR NEW.cnpj = '' THEN
    NEW.cnpj := '00000000000000';
  END IF;
  IF NEW.endereco IS NULL THEN
    NEW.endereco := '';
  END IF;
  IF NEW.cidade IS NULL THEN
    NEW.cidade := '';
  END IF;
  IF NEW.estado IS NULL THEN
    NEW.estado := '';
  END IF;
  IF NEW.telefone IS NULL THEN
    NEW.telefone := '';
  END IF;
  IF NEW.email IS NULL THEN
    NEW.email := '';
  END IF;
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
    NEW.tipo := 'privado';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_hospitais_alias ON public.hospitais;
CREATE TRIGGER trg_sync_hospitais_alias
  BEFORE INSERT OR UPDATE ON public.hospitais
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_hospitais_alias_columns();

COMMIT;
