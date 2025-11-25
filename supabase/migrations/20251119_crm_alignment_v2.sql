-- ============================================
-- Migration: 20251119 - CRM Alignment v2
-- Objetivo: alinhar schema de Oportunidades com o frontend (aliases e defaults)
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Suporte à geração automática de números
-- -------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.oportunidade_numero_seq;

CREATE OR REPLACE FUNCTION public.next_oportunidade_numero()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_seq bigint;
BEGIN
  v_seq := nextval('public.oportunidade_numero_seq');
  RETURN 'OP-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(v_seq::text, 6, '0');
END;
$$;

-- Preencher números faltantes antes de aplicar default/constraints
UPDATE public.oportunidades
SET numero = public.next_oportunidade_numero()
WHERE numero IS NULL OR btrim(numero) = '';

-- -------------------------------------------------
-- 2. Ajustes de colunas obrigatórias / defaults
-- -------------------------------------------------
ALTER TABLE public.oportunidades
  ALTER COLUMN numero SET DEFAULT public.next_oportunidade_numero(),
  ALTER COLUMN nome DROP NOT NULL,
  ALTER COLUMN cliente_nome DROP NOT NULL,
  ALTER COLUMN vendedor_id DROP NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- -------------------------------------------------
-- 3. Atualizar função de sincronização de aliases
-- -------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_oportunidades_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_default_titulo TEXT := 'Oportunidade sem título';
BEGIN
  -- número sequencial
  IF NEW.numero IS NULL OR btrim(NEW.numero) = '' THEN
    NEW.numero := public.next_oportunidade_numero();
  END IF;

  -- titulo ↔ nome
  IF NEW.titulo IS NULL OR btrim(NEW.titulo) = '' THEN
    NEW.titulo := COALESCE(NULLIF(NEW.nome, ''), v_default_titulo);
  END IF;
  IF NEW.nome IS NULL OR btrim(NEW.nome) = '' THEN
    NEW.nome := NEW.titulo;
  END IF;

  -- valor ↔ valor_estimado
  IF NEW.valor IS NULL THEN
    NEW.valor := COALESCE(NEW.valor_estimado, 0);
  END IF;
  IF NEW.valor_estimado IS NULL THEN
    NEW.valor_estimado := NEW.valor;
  END IF;

  -- etapa ↔ estagio
  IF NEW.etapa IS NULL THEN
    NEW.etapa := NEW.estagio;
  END IF;
  IF NEW.estagio IS NULL THEN
    NEW.estagio := COALESCE(NEW.etapa, 'qualificacao');
  END IF;

  -- status derivado
  IF NEW.status IS NULL THEN
    NEW.status := CASE NEW.estagio
      WHEN 'ganho' THEN 'fechada_ganho'
      WHEN 'perdido' THEN 'fechada_perdido'
      WHEN 'negociacao' THEN 'negociacao'
      WHEN 'fechamento' THEN 'fechamento'
      ELSE 'aberta'
    END;
  END IF;

  IF NEW.status = 'fechada_ganho' THEN
    NEW.estagio := 'ganho';
  ELSIF NEW.status = 'fechada_perdido' THEN
    NEW.estagio := 'perdido';
  ELSIF NEW.status = 'congelada' THEN
    NEW.estagio := 'negociacao';
  ELSIF NEW.status = 'aberta' THEN
    NEW.estagio := COALESCE(NEW.estagio, 'qualificacao');
  END IF;

  -- responsavel_id ↔ vendedor_id
  IF NEW.responsavel_id IS NULL THEN
    NEW.responsavel_id := NEW.vendedor_id;
  END IF;
  IF NEW.vendedor_id IS NULL THEN
    NEW.vendedor_id := NEW.responsavel_id;
  END IF;

  -- nota ↔ observacoes
  IF NEW.nota IS NULL THEN
    NEW.nota := NEW.observacoes;
  END IF;
  IF NEW.observacoes IS NULL THEN
    NEW.observacoes := NEW.nota;
  END IF;

  -- cliente_segmento ↔ segmento
  IF NEW.cliente_segmento IS NULL THEN
    NEW.cliente_segmento := NEW.segmento;
  END IF;
  IF NEW.segmento IS NULL THEN
    NEW.segmento := NEW.cliente_segmento;
  END IF;

  -- timestamps
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_oportunidades_alias ON public.oportunidades;
CREATE TRIGGER trg_sync_oportunidades_alias
  BEFORE INSERT OR UPDATE ON public.oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_oportunidades_alias_columns();

-- -------------------------------------------------
-- 4. Metadata das interações
-- -------------------------------------------------
UPDATE public.oportunidade_interacoes
SET metadata = '{}'::jsonb
WHERE metadata IS NULL;

ALTER TABLE public.oportunidade_interacoes
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb,
  ALTER COLUMN metadata SET NOT NULL;

COMMIT;

