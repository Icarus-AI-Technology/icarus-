-- ============================================
-- Migration: 20251120 - Kits Alignment
-- Objetivo: alinhar tabelas kits/itens_kit com expectativas do frontend
-- ============================================

BEGIN;

-- =====================================================
-- 1. Triggers legacy
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.kits'::regclass
      AND tgname = 'update_kits_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.kits DISABLE TRIGGER update_kits_updated_at';
  END IF;
END $$;

-- Para itens_kit reusamos mesmo trigger se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.itens_kit'::regclass
      AND tgname = 'update_itens_kit_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.itens_kit DISABLE TRIGGER update_itens_kit_updated_at';
  END IF;
END $$;

-- =====================================================
-- 2. Enums & colunas kits
-- =====================================================
DO $$
BEGIN
  CREATE TYPE public.kit_status_enum AS ENUM ('montagem','enviado','em_uso','devolvido','faturado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.kits
  DROP CONSTRAINT IF EXISTS kits_status_check;

ALTER TABLE public.kits
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES public.hospitais(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS codigo_kit TEXT,
  ADD COLUMN IF NOT EXISTS valor_total NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_envio DATE,
  ADD COLUMN IF NOT EXISTS data_devolucao DATE,
  ADD COLUMN IF NOT EXISTS observacoes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.kits
SET codigo_kit = COALESCE(codigo_kit, CONCAT('KIT-', RIGHT(id::text, 6))),
    valor_total = COALESCE(valor_total, 0),
    observacoes = COALESCE(observacoes, ''),
    status = COALESCE(NULLIF(LOWER(status), ''), 'montagem');

ALTER TABLE public.kits
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN nome SET DEFAULT '';

ALTER TABLE public.kits
  ALTER COLUMN codigo_kit SET NOT NULL,
  ALTER COLUMN codigo_kit SET DEFAULT CONCAT('KIT-', RIGHT(gen_random_uuid()::text, 6));

ALTER TABLE public.kits
  ALTER COLUMN valor_total SET NOT NULL,
  ALTER COLUMN valor_total SET DEFAULT 0;

ALTER TABLE public.kits
  ALTER COLUMN observacoes SET NOT NULL,
  ALTER COLUMN observacoes SET DEFAULT '';

ALTER TABLE public.kits
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.kits
  ALTER COLUMN status TYPE public.kit_status_enum USING LOWER(status)::public.kit_status_enum,
  ALTER COLUMN status SET DEFAULT 'montagem',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.kits
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

-- =====================================================
-- 3. itens_kit ajustes
-- =====================================================
ALTER TABLE public.itens_kit
  ADD COLUMN IF NOT EXISTS utilizado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.itens_kit
SET utilizado = COALESCE(utilizado, FALSE),
    quantidade = COALESCE(quantidade, 0);

ALTER TABLE public.itens_kit
  ALTER COLUMN quantidade SET NOT NULL,
  ALTER COLUMN quantidade SET DEFAULT 0,
  ALTER COLUMN quantidade_consumida SET DEFAULT 0;

-- =====================================================
-- 4. Funções de sincronização
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_kits_alias_columns()
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

  IF NEW.status IS NULL THEN
    NEW.status := 'montagem';
  END IF;

  IF NEW.codigo_kit IS NULL THEN
    NEW.codigo_kit := CONCAT('KIT-', RIGHT(COALESCE(NEW.id::text, gen_random_uuid()::text), 6));
  END IF;

  IF NEW.valor_total IS NULL THEN
    NEW.valor_total := 0;
  END IF;

  IF NEW.observacoes IS NULL THEN
    NEW.observacoes := '';
  END IF;

  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_kits_alias ON public.kits;
CREATE TRIGGER trg_sync_kits_alias
  BEFORE INSERT OR UPDATE ON public.kits
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_kits_alias_columns();

CREATE OR REPLACE FUNCTION public.sync_itens_kit_alias()
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

  IF NEW.utilizado IS NULL THEN
    NEW.utilizado := FALSE;
  END IF;

  IF NEW.quantidade IS NULL THEN
    NEW.quantidade := 0;
  END IF;

  IF NEW.quantidade_consumida IS NULL THEN
    NEW.quantidade_consumida := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_itens_kit_alias ON public.itens_kit;
CREATE TRIGGER trg_sync_itens_kit_alias
  BEFORE INSERT OR UPDATE ON public.itens_kit
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_itens_kit_alias();

-- =====================================================
-- 5. Reabilitar triggers legados
-- =====================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.kits'::regclass
      AND tgname = 'update_kits_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.kits ENABLE TRIGGER update_kits_updated_at';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.itens_kit'::regclass
      AND tgname = 'update_itens_kit_updated_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.itens_kit ENABLE TRIGGER update_itens_kit_updated_at';
  END IF;
END $$;

COMMIT;
