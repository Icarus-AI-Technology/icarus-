-- ============================================
-- Migration: 20251119 - Lotes de Faturamento
-- Objetivo: disponibilizar tabela utilizada pelos hooks de faturamento
-- ============================================

BEGIN;

-- -------------------------------------------------
-- 1. Tipos ENUM necessários
-- -------------------------------------------------
DO $$
BEGIN
  CREATE TYPE public.lote_faturamento_status_enum AS ENUM (
    'rascunho',
    'fechado',
    'enviado',
    'processando',
    'aprovado',
    'glosado',
    'pago',
    'cancelado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

DO $$
BEGIN
  CREATE TYPE public.lote_faturamento_risco_enum AS ENUM ('baixo','médio','alto');
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- -------------------------------------------------
-- 2. Tabela principal
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lotes_faturamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  numero_lote TEXT NOT NULL,
  convenio_id UUID NOT NULL REFERENCES public.convenios(id) ON DELETE RESTRICT,
  convenio_nome TEXT NOT NULL,
  mes_referencia TEXT NOT NULL,
  data_fechamento TIMESTAMPTZ,
  data_envio TIMESTAMPTZ,
  data_retorno TIMESTAMPTZ,
  quantidade_itens INTEGER NOT NULL DEFAULT 0,
  valor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_glosado NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_aprovado NUMERIC(14,2) NOT NULL DEFAULT 0,
  valor_pago NUMERIC(14,2) NOT NULL DEFAULT 0,
  status public.lote_faturamento_status_enum NOT NULL DEFAULT 'rascunho',
  possui_glosas BOOLEAN NOT NULL DEFAULT false,
  quantidade_glosas INTEGER NOT NULL DEFAULT 0,
  motivos_glosas JSONB DEFAULT '[]'::jsonb,
  risco_glosa public.lote_faturamento_risco_enum,
  score_qualidade NUMERIC(5,2),
  arquivo_envio_url TEXT,
  arquivo_retorno_url TEXT,
  observacoes TEXT,
  itens JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (empresa_id, numero_lote)
);

-- -------------------------------------------------
-- 3. Índices para filtros comuns
-- -------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lotes_faturamento_empresa ON public.lotes_faturamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lotes_faturamento_convenio ON public.lotes_faturamento(convenio_id);
CREATE INDEX IF NOT EXISTS idx_lotes_faturamento_status ON public.lotes_faturamento(status);
CREATE INDEX IF NOT EXISTS idx_lotes_faturamento_mes ON public.lotes_faturamento(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_lotes_faturamento_glosas ON public.lotes_faturamento(possui_glosas);

-- -------------------------------------------------
-- 4. Trigger para updated_at
-- -------------------------------------------------
DROP TRIGGER IF EXISTS trg_lotes_faturamento_updated ON public.lotes_faturamento;
CREATE TRIGGER trg_lotes_faturamento_updated
  BEFORE UPDATE ON public.lotes_faturamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;

