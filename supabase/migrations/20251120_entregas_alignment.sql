-- ============================================
-- Migration: 20251120 - Entregas Alignment
-- ============================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Disable existing triggers that touch updated_at/status history while we reshape columns
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'update_entregas_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas DISABLE TRIGGER update_entregas_updated_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'trg_entregas_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas DISABLE TRIGGER trg_entregas_updated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'entrega_status_history'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas DISABLE TRIGGER entrega_status_history';
  END IF;
END $$;

-- Enums
DO $$
BEGIN
  CREATE TYPE public.entrega_status_enum AS ENUM (
    'pendente','coletado','em_transito','saiu_entrega','entregue','devolvido','cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.entrega_origem_tipo_enum AS ENUM ('deposito','fornecedor','hospital');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.entrega_destino_tipo_enum AS ENUM ('hospital','medico','clinica','deposito');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.entrega_modalidade_enum AS ENUM ('normal','expressa','urgente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure empresa_id tracking exists
ALTER TABLE public.entregas
  ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- Normalize existing data
UPDATE public.entregas
SET
  empresa_id = COALESCE(empresa_id, public.current_empresa()),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, created_at),
  codigo_rastreio = CASE
    WHEN codigo_rastreio IS NULL OR codigo_rastreio = '' THEN 'ENT-' || substr(md5(id::text || NOW()::text), 1, 8)
    ELSE codigo_rastreio
  END,
  origem_tipo = CASE
    WHEN origem_tipo ILIKE 'fornecedor%' THEN 'fornecedor'
    WHEN origem_tipo ILIKE 'hosp%' THEN 'hospital'
    ELSE 'deposito'
  END,
  destino_tipo = CASE
    WHEN destino_tipo ILIKE 'med%' THEN 'medico'
    WHEN destino_tipo ILIKE 'clin%' THEN 'clinica'
    WHEN destino_tipo ILIKE 'deposit%' THEN 'deposito'
    ELSE 'hospital'
  END,
  tipo_entrega = COALESCE(NULLIF(LOWER(tipo_entrega), ''), 'normal'),
  status = COALESCE(NULLIF(LOWER(status), ''), 'pendente'),
  destino_cep = COALESCE(destino_cep, ''),
  destino_cidade = COALESCE(destino_cidade, ''),
  destino_estado = COALESCE(destino_estado, ''),
  origem_cep = COALESCE(origem_cep, ''),
  origem_cidade = COALESCE(origem_cidade, ''),
  origem_estado = COALESCE(origem_estado, ''),
  telefone_contato = COALESCE(telefone_contato, ''),
  motorista = COALESCE(motorista, ''),
  veiculo_placa = COALESCE(veiculo_placa, ''),
  observacoes = COALESCE(observacoes, ''),
  ocorrencias = COALESCE(ocorrencias, ''),
  valor_frete = COALESCE(valor_frete, 0),
  peso_kg = COALESCE(peso_kg, 0),
  volumes = COALESCE(volumes, 0);

DELETE FROM public.entrega_historico
WHERE entrega_id IS NULL;

UPDATE public.entrega_historico
SET
  created_at = COALESCE(created_at, NOW()),
  status = COALESCE(NULLIF(LOWER(status), ''), 'pendente')
WHERE created_at IS NULL OR status IS NULL OR status = '';

-- Apply defaults and constraints on entregas
ALTER TABLE public.entregas
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa(),
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL,
  ALTER COLUMN valor_frete SET DEFAULT 0,
  ALTER COLUMN valor_frete SET NOT NULL,
  ALTER COLUMN peso_kg SET DEFAULT 0,
  ALTER COLUMN peso_kg SET NOT NULL,
  ALTER COLUMN volumes SET DEFAULT 0,
  ALTER COLUMN volumes SET NOT NULL,
  ALTER COLUMN observacoes SET DEFAULT '',
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN ocorrencias SET DEFAULT '',
  ALTER COLUMN ocorrencias SET NOT NULL,
  ALTER COLUMN telefone_contato SET DEFAULT '',
  ALTER COLUMN telefone_contato SET NOT NULL,
  ALTER COLUMN motorista SET DEFAULT '',
  ALTER COLUMN motorista SET NOT NULL,
  ALTER COLUMN veiculo_placa SET DEFAULT '',
  ALTER COLUMN veiculo_placa SET NOT NULL,
  ALTER COLUMN destino_cep SET DEFAULT '',
  ALTER COLUMN destino_cep SET NOT NULL,
  ALTER COLUMN destino_cidade SET DEFAULT '',
  ALTER COLUMN destino_cidade SET NOT NULL,
  ALTER COLUMN destino_estado SET DEFAULT '',
  ALTER COLUMN destino_estado SET NOT NULL,
  ALTER COLUMN origem_cep SET DEFAULT '',
  ALTER COLUMN origem_cep SET NOT NULL,
  ALTER COLUMN origem_cidade SET DEFAULT '',
  ALTER COLUMN origem_cidade SET NOT NULL,
  ALTER COLUMN origem_estado SET DEFAULT '',
  ALTER COLUMN origem_estado SET NOT NULL,
  ALTER COLUMN codigo_rastreio SET NOT NULL,
  ALTER COLUMN origem_nome SET NOT NULL,
  ALTER COLUMN origem_endereco SET NOT NULL,
  ALTER COLUMN destino_nome SET NOT NULL,
  ALTER COLUMN destino_endereco SET NOT NULL;

ALTER TABLE public.entregas
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.entregas
  ALTER COLUMN status TYPE public.entrega_status_enum USING COALESCE(NULLIF(LOWER(status::text), ''), 'pendente')::public.entrega_status_enum,
  ALTER COLUMN status SET DEFAULT 'pendente';

ALTER TABLE public.entregas
  ALTER COLUMN origem_tipo DROP DEFAULT;

ALTER TABLE public.entregas
  ALTER COLUMN origem_tipo TYPE public.entrega_origem_tipo_enum USING COALESCE(origem_tipo, 'deposito')::public.entrega_origem_tipo_enum,
  ALTER COLUMN origem_tipo SET DEFAULT 'deposito';

ALTER TABLE public.entregas
  ALTER COLUMN destino_tipo DROP DEFAULT;

ALTER TABLE public.entregas
  ALTER COLUMN destino_tipo TYPE public.entrega_destino_tipo_enum USING COALESCE(destino_tipo, 'hospital')::public.entrega_destino_tipo_enum,
  ALTER COLUMN destino_tipo SET DEFAULT 'hospital';

ALTER TABLE public.entregas
  ALTER COLUMN tipo_entrega DROP DEFAULT;

ALTER TABLE public.entregas
  ALTER COLUMN tipo_entrega TYPE public.entrega_modalidade_enum USING COALESCE(tipo_entrega, 'normal')::public.entrega_modalidade_enum,
  ALTER COLUMN tipo_entrega SET DEFAULT 'normal',
  ALTER COLUMN tipo_entrega SET NOT NULL;

-- entrega_historico constraints
ALTER TABLE public.entrega_historico
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.entrega_historico
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN entrega_id SET NOT NULL,
  ALTER COLUMN status TYPE public.entrega_status_enum USING COALESCE(NULLIF(LOWER(status::text), ''), 'pendente')::public.entrega_status_enum,
  ALTER COLUMN status SET DEFAULT 'pendente',
  ALTER COLUMN status SET NOT NULL;

-- Sync trigger to guarantee defaults on future writes
CREATE OR REPLACE FUNCTION public.sync_entregas_defaults()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  IF TG_OP = 'UPDATE' OR NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;
  IF NEW.codigo_rastreio IS NULL OR NEW.codigo_rastreio = '' THEN
    NEW.codigo_rastreio := 'ENT-' || substr(md5(COALESCE(NEW.id::text, gen_random_uuid()::text) || NOW()::text), 1, 8);
  END IF;
  IF NEW.status IS NULL THEN
    NEW.status := 'pendente';
  END IF;
  IF NEW.tipo_entrega IS NULL THEN
    NEW.tipo_entrega := 'normal';
  END IF;
  IF NEW.origem_tipo IS NULL THEN
    NEW.origem_tipo := 'deposito';
  END IF;
  IF NEW.destino_tipo IS NULL THEN
    NEW.destino_tipo := 'hospital';
  END IF;
  IF NEW.telefone_contato IS NULL THEN
    NEW.telefone_contato := '';
  END IF;
  IF NEW.motorista IS NULL THEN
    NEW.motorista := '';
  END IF;
  IF NEW.veiculo_placa IS NULL THEN
    NEW.veiculo_placa := '';
  END IF;
  IF NEW.observacoes IS NULL THEN
    NEW.observacoes := '';
  END IF;
  IF NEW.ocorrencias IS NULL THEN
    NEW.ocorrencias := '';
  END IF;
  IF NEW.destino_cep IS NULL THEN
    NEW.destino_cep := '';
  END IF;
  IF NEW.destino_cidade IS NULL THEN
    NEW.destino_cidade := '';
  END IF;
  IF NEW.destino_estado IS NULL THEN
    NEW.destino_estado := '';
  END IF;
  IF NEW.origem_cep IS NULL THEN
    NEW.origem_cep := '';
  END IF;
  IF NEW.origem_cidade IS NULL THEN
    NEW.origem_cidade := '';
  END IF;
  IF NEW.origem_estado IS NULL THEN
    NEW.origem_estado := '';
  END IF;
  IF NEW.valor_frete IS NULL THEN
    NEW.valor_frete := 0;
  END IF;
  IF NEW.peso_kg IS NULL THEN
    NEW.peso_kg := 0;
  END IF;
  IF NEW.volumes IS NULL THEN
    NEW.volumes := 0;
  END IF;
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_entregas_defaults ON public.entregas;
CREATE TRIGGER trg_sync_entregas_defaults
  BEFORE INSERT OR UPDATE ON public.entregas
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_entregas_defaults();

-- Re-enable original triggers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'update_entregas_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas ENABLE TRIGGER update_entregas_updated_at';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'trg_entregas_updated'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas ENABLE TRIGGER trg_entregas_updated';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgrelid = 'public.entregas'::regclass AND tgname = 'entrega_status_history'
  ) THEN
    EXECUTE 'ALTER TABLE public.entregas ENABLE TRIGGER entrega_status_history';
  END IF;
END $$;

COMMIT;
