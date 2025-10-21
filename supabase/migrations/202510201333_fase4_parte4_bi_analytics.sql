-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 4/5)
-- MÓDULO BI/ANALYTICS - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- ============================================

-- 1. BI_DIMENSAO_TEMPO
CREATE TABLE IF NOT EXISTS public.bi_dimensao_tempo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  ano INTEGER NOT NULL,
  trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  semana INTEGER CHECK (semana BETWEEN 1 AND 53),
  dia INTEGER CHECK (dia BETWEEN 1 AND 31),
  dia_semana INTEGER CHECK (dia_semana BETWEEN 0 AND 6),
  dia_ano INTEGER CHECK (dia_ano BETWEEN 1 AND 366),
  nome_mes TEXT,
  nome_dia_semana TEXT,
  fim_semana BOOLEAN,
  feriado BOOLEAN DEFAULT FALSE,
  nome_feriado TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_dimensao_tempo_data ON public.bi_dimensao_tempo(data DESC);
CREATE INDEX IF NOT EXISTS idx_bi_dimensao_tempo_ano_mes ON public.bi_dimensao_tempo(ano, mes);

-- 2. BI_DIMENSAO_PRODUTO
CREATE TABLE IF NOT EXISTS public.bi_dimensao_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES public.produtos(id),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  codigo_sku TEXT,
  descricao TEXT,
  categoria TEXT,
  subcategoria TEXT,
  fabricante TEXT,
  valor_medio DECIMAL(12, 2),
  ativo BOOLEAN,
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(produto_id)
);

CREATE INDEX IF NOT EXISTS idx_bi_dimensao_produto_empresa ON public.bi_dimensao_produto(empresa_id);

-- 3. BI_FATO_VENDAS
CREATE TABLE IF NOT EXISTS public.bi_fato_vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  data_id UUID REFERENCES public.bi_dimensao_tempo(id),
  produto_id UUID REFERENCES public.bi_dimensao_produto(id),
  cliente_nome TEXT,
  quantidade DECIMAL(10, 3),
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  valor_custo DECIMAL(12, 2),
  margem DECIMAL(12, 2),
  origem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_empresa ON public.bi_fato_vendas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_vendas_data ON public.bi_fato_vendas(data_id);

-- 4. BI_FATO_ESTOQUE
CREATE TABLE IF NOT EXISTS public.bi_fato_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  data_id UUID REFERENCES public.bi_dimensao_tempo(id),
  produto_id UUID REFERENCES public.bi_dimensao_produto(id),
  quantidade_inicial INTEGER,
  entradas INTEGER DEFAULT 0,
  saidas INTEGER DEFAULT 0,
  quantidade_final INTEGER,
  valor_medio DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_fato_estoque_empresa ON public.bi_fato_estoque(empresa_id);
CREATE INDEX IF NOT EXISTS idx_bi_fato_estoque_data ON public.bi_fato_estoque(data_id);

-- 5. DASHBOARDS
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('operacional', 'gerencial', 'executivo', 'personalizado')),
  layout_json JSONB,
  publico BOOLEAN DEFAULT FALSE,
  criado_por_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboards_empresa ON public.dashboards(empresa_id);

-- 6. WIDGETS
CREATE TABLE IF NOT EXISTS public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID REFERENCES public.dashboards(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('grafico', 'tabela', 'kpi', 'mapa', 'lista', 'texto')) NOT NULL,
  query_sql TEXT,
  configuracao_json JSONB,
  posicao_x INTEGER,
  posicao_y INTEGER,
  largura INTEGER,
  altura INTEGER,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_widgets_dashboard ON public.widgets(dashboard_id);

CREATE TRIGGER trg_dashboards_updated BEFORE UPDATE ON public.dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_widgets_updated BEFORE UPDATE ON public.widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dimensao_tempo IS 'Dimensão tempo para análises BI';
COMMENT ON TABLE public.bi_dimensao_produto IS 'Dimensão produto para análises BI';
COMMENT ON TABLE public.bi_fato_vendas IS 'Fatos de vendas (star schema)';
COMMENT ON TABLE public.bi_fato_estoque IS 'Fatos de estoque (star schema)';
COMMENT ON TABLE public.dashboards IS 'Dashboards personalizados';
COMMENT ON TABLE public.widgets IS 'Widgets dos dashboards';

