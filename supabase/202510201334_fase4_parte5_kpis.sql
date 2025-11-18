-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 5/5)
-- MÓDULO KPIs - 2 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. KPI_METAS
CREATE TABLE IF NOT EXISTS public.kpi_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN ('financeiro', 'operacional', 'qualidade', 'vendas', 'estoque', 'compliance')),
  tipo_metrica TEXT CHECK (tipo_metrica IN ('percentual', 'valor', 'quantidade', 'tempo', 'taxa')),
  unidade TEXT,
  periodicidade TEXT CHECK (periodicidade IN ('diaria', 'semanal', 'mensal', 'trimestral', 'anual')),
  meta_valor DECIMAL(12, 2) NOT NULL,
  meta_minima DECIMAL(12, 2),
  meta_ideal DECIMAL(12, 2),
  sentido TEXT CHECK (sentido IN ('crescente', 'decrescente', 'neutro')) DEFAULT 'crescente',
  formula TEXT,
  responsavel_id UUID REFERENCES public.usuarios(id),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_kpi_metas_empresa ON public.kpi_metas(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_kpi_metas_categoria ON public.kpi_metas(categoria);

-- 2. KPI_REALIZACOES
CREATE TABLE IF NOT EXISTS public.kpi_realizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_meta_id UUID NOT NULL REFERENCES public.kpi_metas(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  valor_realizado DECIMAL(12, 2) NOT NULL,
  valor_meta DECIMAL(12, 2),
  percentual_atingido DECIMAL(5, 2),
  status TEXT CHECK (status IN ('abaixo', 'proximo', 'atingido', 'superado')),
  tendencia TEXT CHECK (tendencia IN ('piorando', 'estavel', 'melhorando')),
  observacoes TEXT,
  calculado_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kpi_realizacoes_meta ON public.kpi_realizacoes(kpi_meta_id, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_realizacoes_empresa ON public.kpi_realizacoes(empresa_id, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_realizacoes_periodo ON public.kpi_realizacoes(periodo_inicio, periodo_fim);

CREATE TRIGGER trg_kpi_metas_updated BEFORE UPDATE ON public.kpi_metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.kpi_metas IS 'Metas de KPIs (Key Performance Indicators)';
COMMENT ON TABLE public.kpi_realizacoes IS 'Realizações de KPIs (valores atingidos)';

-- ============================================
-- FIM FASE 4 - 20 TABELAS COMPLETAS
-- Chatbot: 4, Workflows: 4, API Gateway: 4, BI: 6, KPIs: 2
-- ============================================

