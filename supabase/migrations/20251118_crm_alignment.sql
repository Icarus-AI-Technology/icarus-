-- ============================================
-- Migration: 20251118 - CRM Alignment (Oportunidades + Views)
-- Objetivo: alinhar o schema real do Supabase com os hooks de CRM no frontend
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Alias columns for oportunidades
-- -------------------------------------------------
ALTER TABLE public.oportunidades
  ADD COLUMN IF NOT EXISTS titulo TEXT,
  ADD COLUMN IF NOT EXISTS valor NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS etapa TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS responsavel_id UUID,
  ADD COLUMN IF NOT EXISTS nota TEXT,
  ADD COLUMN IF NOT EXISTS cliente_segmento TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Temporarily disable existing update trigger to avoid recursion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_oportunidades_updated'
      AND tgrelid = 'public.oportunidades'::regclass
  ) THEN
    EXECUTE 'ALTER TABLE public.oportunidades DISABLE TRIGGER trg_oportunidades_updated';
  END IF;
END$$;

UPDATE public.oportunidades
SET
  titulo = COALESCE(titulo, nome),
  valor = COALESCE(valor, valor_estimado, 0),
  etapa = COALESCE(etapa, estagio),
  status = COALESCE(
    status,
    CASE estagio
      WHEN 'ganho' THEN 'fechada_ganho'
      WHEN 'perdido' THEN 'fechada_perdido'
      WHEN 'fechamento' THEN 'negociacao'
      ELSE 'aberta'
    END
  ),
  responsavel_id = COALESCE(responsavel_id, vendedor_id),
  nota = COALESCE(nota, observacoes),
  cliente_segmento = COALESCE(cliente_segmento, segmento),
  created_at = COALESCE(created_at, criado_em),
  updated_at = COALESCE(updated_at, atualizado_em);

-- Re-enable trigger if it existed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_oportunidades_updated'
      AND tgrelid = 'public.oportunidades'::regclass
  ) THEN
    EXECUTE 'ALTER TABLE public.oportunidades ENABLE TRIGGER trg_oportunidades_updated';
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.sync_oportunidades_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- titulo ↔ nome
  IF NEW.titulo IS NULL THEN
    NEW.titulo := NEW.nome;
  END IF;
  IF NEW.nome IS NULL THEN
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

  -- status sync (derive from etapa/estagio)
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

  NEW.updated_at := COALESCE(NEW.updated_at, NOW());
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
-- 2. New CRM tables used by frontend hooks
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.oportunidade_interacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  tipo TEXT,
  descricao TEXT,
  metadata JSONB,
  usuario_id UUID REFERENCES public.usuarios(id),
  ocorreu_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opp_interacoes_oportunidade ON public.oportunidade_interacoes(oportunidade_id, ocorreu_em DESC);

CREATE TABLE IF NOT EXISTS public.oportunidade_tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status = ANY (ARRAY['pendente','em_andamento','concluida','cancelada'])),
  due_date DATE,
  responsavel_id UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  concluido_em TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_opp_tarefas_oportunidade ON public.oportunidade_tarefas(oportunidade_id, status);

CREATE TABLE IF NOT EXISTS public.oportunidade_propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  numero TEXT,
  valor NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status = ANY (ARRAY['rascunho','enviada','aceita','rejeitada','cancelada'])),
  url_pdf TEXT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_opp_propostas_oportunidade ON public.oportunidade_propostas(oportunidade_id, status);

-- -------------------------------------------------
-- 3. CRM Views
-- -------------------------------------------------
CREATE OR REPLACE VIEW public.view_crm_funil AS
SELECT
  empresa_id,
  COALESCE(etapa, 'desconhecida') AS etapa,
  COUNT(*) AS total,
  COALESCE(SUM(valor), 0)::NUMERIC(12,2) AS valor_total
FROM public.oportunidades
WHERE excluido_em IS NULL
GROUP BY empresa_id, COALESCE(etapa, 'desconhecida');

CREATE OR REPLACE VIEW public.view_crm_pipeline_resumo AS
SELECT
  empresa_id,
  COALESCE(SUM(valor), 0)::NUMERIC(12,2) AS valor_total,
  COUNT(*) AS total_oportunidades,
  COALESCE(AVG(probabilidade), 0)::NUMERIC(5,2) AS probabilidade_media
FROM public.oportunidades
WHERE excluido_em IS NULL
GROUP BY empresa_id;

COMMIT;

