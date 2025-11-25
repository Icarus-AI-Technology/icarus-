-- ============================================
-- Migration: 20251120 - Leads Alignment
-- ============================================

BEGIN;

-- 1. Enums
DO $$
BEGIN
  CREATE TYPE public.lead_status_enum AS ENUM ('ativo','inativo','arquivado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE public.lead_origem_enum AS ENUM ('website','indicacao','evento','cold_call','linkedin','outro');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- (Opcional) Enum reservado para uso futuro
DO $$
BEGIN
  CREATE TYPE public.lead_estagio_enum AS ENUM ('novo','contato','qualificado','proposta','negociacao','ganho','perdido','desqualificado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Novas colunas
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS empresa TEXT,
  ADD COLUMN IF NOT EXISTS especialidade TEXT,
  ADD COLUMN IF NOT EXISTS origem public.lead_origem_enum DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS status public.lead_status_enum DEFAULT 'ativo',
  ADD COLUMN IF NOT EXISTS data_contato DATE,
  ADD COLUMN IF NOT EXISTS data_fechamento_prevista DATE,
  ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Normalizar dados existentes
UPDATE public.leads
SET empresa = COALESCE(empresa, empresa_origem, ''),
    especialidade = COALESCE(especialidade, ''),
    origem = COALESCE(origem, 'website'),
    status = COALESCE(status, 'ativo'),
    estagio = COALESCE(estagio, 'novo'),
    valor_estimado = COALESCE(valor_estimado, 0),
    probabilidade = COALESCE(probabilidade, 0),
    observacoes = COALESCE(observacoes, ''),
    tags = COALESCE(tags, '{}'::text[]),
    created_at = COALESCE(created_at, criado_em, NOW()),
    updated_at = COALESCE(updated_at, atualizado_em, NOW());

-- 4. Restrições e defaults
ALTER TABLE public.leads
  ALTER COLUMN empresa SET DEFAULT '',
  ALTER COLUMN empresa SET NOT NULL,
  ALTER COLUMN especialidade SET DEFAULT '',
  ALTER COLUMN especialidade SET NOT NULL,
  ALTER COLUMN origem SET DEFAULT 'website',
  ALTER COLUMN origem SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'ativo',
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN valor_estimado SET DEFAULT 0,
  ALTER COLUMN valor_estimado SET NOT NULL,
  ALTER COLUMN probabilidade SET DEFAULT 0,
  ALTER COLUMN probabilidade SET NOT NULL,
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN tags SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE public.leads
  ALTER COLUMN estagio SET DEFAULT 'novo';

UPDATE public.leads SET estagio = COALESCE(estagio, 'novo');

ALTER TABLE public.leads
  ALTER COLUMN estagio SET NOT NULL;

-- 5. Trigger de sincronização
CREATE OR REPLACE FUNCTION public.sync_leads_alias_columns()
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

  IF NEW.empresa IS NULL THEN
    NEW.empresa := COALESCE(NEW.empresa_origem, '');
  END IF;
  IF NEW.empresa_origem IS NULL THEN
    NEW.empresa_origem := NEW.empresa;
  END IF;

  IF NEW.especialidade IS NULL THEN
    NEW.especialidade := '';
  END IF;

  IF NEW.origem IS NULL THEN
    NEW.origem := 'website';
  END IF;

  IF NEW.status IS NULL THEN
    NEW.status := 'ativo';
  END IF;

  IF NEW.estagio IS NULL THEN
    NEW.estagio := 'novo';
  END IF;

  IF NEW.valor_estimado IS NULL THEN
    NEW.valor_estimado := 0;
  END IF;
  IF NEW.probabilidade IS NULL THEN
    NEW.probabilidade := 0;
  END IF;

  IF NEW.observacoes IS NULL THEN
    NEW.observacoes := '';
  END IF;
  IF NEW.tags IS NULL THEN
    NEW.tags := '{}'::text[];
  END IF;

  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_leads_alias ON public.leads;
CREATE TRIGGER trg_sync_leads_alias
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_leads_alias_columns();

COMMIT;
