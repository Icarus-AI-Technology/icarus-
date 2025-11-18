-- ============================================
-- Migration: 20251118 - Supply Alignment (Materiais + Médicos)
-- Objetivo: alinhar schema com hooks de Materiais e Médicos
-- ============================================

BEGIN;

-- =====================================================
-- 1. Materiais OPME - alias columns
-- =====================================================
ALTER TABLE public.materiais_opme
  ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'consumivel',
  ADD COLUMN IF NOT EXISTS fornecedor_id UUID,
  ADD COLUMN IF NOT EXISTS registro_anvisa TEXT,
  ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER,
  ADD COLUMN IF NOT EXISTS quantidade_minima INTEGER,
  ADD COLUMN IF NOT EXISTS localizacao TEXT,
  ADD COLUMN IF NOT EXISTS lote TEXT,
  ADD COLUMN IF NOT EXISTS validade DATE,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

UPDATE public.materiais_opme
SET
  tipo = COALESCE(tipo, 'consumivel'),
  quantidade_estoque = COALESCE(quantidade_estoque, estoque_atual, 0),
  quantidade_minima = COALESCE(quantidade_minima, estoque_minimo, 0);

CREATE OR REPLACE FUNCTION public.sync_materiais_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quantidade_estoque IS NULL THEN
    NEW.quantidade_estoque := COALESCE(NEW.estoque_atual, 0);
  END IF;
  IF NEW.estoque_atual IS NULL THEN
    NEW.estoque_atual := NEW.quantidade_estoque;
  END IF;

  IF NEW.quantidade_minima IS NULL THEN
    NEW.quantidade_minima := COALESCE(NEW.estoque_minimo, 0);
  END IF;
  IF NEW.estoque_minimo IS NULL THEN
    NEW.estoque_minimo := NEW.quantidade_minima;
  END IF;

  IF NEW.tipo IS NULL THEN
    NEW.tipo := COALESCE(NEW.categoria, 'consumivel');
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_materiais_alias ON public.materiais_opme;
CREATE TRIGGER trg_sync_materiais_alias
  BEFORE INSERT OR UPDATE ON public.materiais_opme
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_materiais_alias_columns();

-- =====================================================
-- 2. Médicos - alias columns e ajustes
-- =====================================================
ALTER TABLE public.medicos
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS taxa_sucesso NUMERIC(5,2);

UPDATE public.medicos
SET
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em),
  taxa_sucesso = COALESCE(taxa_sucesso, 0);

CREATE OR REPLACE FUNCTION public.sync_medicos_alias_columns()
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_medicos_alias ON public.medicos;
CREATE TRIGGER trg_sync_medicos_alias
  BEFORE INSERT OR UPDATE ON public.medicos
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_medicos_alias_columns();

UPDATE public.medicos SET telefone = '' WHERE telefone IS NULL;
ALTER TABLE public.medicos ALTER COLUMN telefone SET DEFAULT '';
ALTER TABLE public.medicos ALTER COLUMN telefone SET NOT NULL;

COMMIT;

