-- ============================================
-- Migration: Módulo BI/Analytics Completo
-- 6 tabelas para Business Intelligence
-- Data: 2025-10-20
-- ============================================

-- 1. BI_DIMENSOES - Dimensões analíticas
CREATE TABLE IF NOT EXISTS public.bi_dimensoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tempo', 'produto', 'cliente', 'fornecedor', 'regiao', 'equipe', 'custom')) NOT NULL,
  tabela_origem TEXT,
  campos_mapeados JSONB,
  hierarquia TEXT[],
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_bi_dimensoes_empresa ON public.bi_dimensoes(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_bi_dimensoes_tipo ON public.bi_dimensoes(tipo);

CREATE TRIGGER trg_bi_dimensoes_updated BEFORE UPDATE ON public.bi_dimensoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dimensoes IS 'Dimensões para análise multidimensional (OLAP)';

-- 2. BI_FATOS - Tabelas de fatos
CREATE TABLE IF NOT EXISTS public.bi_fatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tabela_origem TEXT,
  metricas JSONB NOT NULL,
  dimensoes_relacionadas UUID[],
  grao TEXT,
  query_sql TEXT,
  atualizado_em TIMESTAMPTZ,
  periodicidade_atualizacao TEXT CHECK (periodicidade_atualizacao IN ('tempo_real', 'horaria', 'diaria', 'semanal', 'mensal')),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_bi_fatos_empresa ON public.bi_fatos(empresa_id) WHERE ativo = TRUE;

COMMENT ON TABLE public.bi_fatos IS 'Tabelas de fatos para análises (medidas quantitativas)';

-- 3. BI_DASHBOARDS - Dashboards BI
CREATE TABLE IF NOT EXISTS public.bi_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  proprietario_id UUID NOT NULL REFERENCES public.usuarios(id),
  publico BOOLEAN DEFAULT FALSE,
  compartilhado_com UUID[],
  layout_config JSONB,
  filtros_globais JSONB,
  auto_refresh BOOLEAN DEFAULT FALSE,
  refresh_interval INTEGER,
  favorito BOOLEAN DEFAULT FALSE,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bi_dashboards_empresa ON public.bi_dashboards(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_bi_dashboards_proprietario ON public.bi_dashboards(proprietario_id);
CREATE INDEX IF NOT EXISTS idx_bi_dashboards_publico ON public.bi_dashboards(publico) WHERE publico = TRUE;
CREATE INDEX IF NOT EXISTS idx_bi_dashboards_categoria ON public.bi_dashboards(categoria);

CREATE TRIGGER trg_bi_dashboards_updated BEFORE UPDATE ON public.bi_dashboards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_dashboards IS 'Dashboards de Business Intelligence';

-- 4. BI_WIDGETS - Widgets dos dashboards
CREATE TABLE IF NOT EXISTS public.bi_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('grafico_linha', 'grafico_barra', 'grafico_pizza', 'grafico_area', 'tabela', 'kpi', 'mapa', 'heatmap', 'gauge', 'texto')) NOT NULL,
  titulo TEXT NOT NULL,
  posicao_x INTEGER NOT NULL,
  posicao_y INTEGER NOT NULL,
  largura INTEGER NOT NULL CHECK (largura > 0),
  altura INTEGER NOT NULL CHECK (altura > 0),
  fato_id UUID REFERENCES public.bi_fatos(id),
  query_sql TEXT,
  configuracao_visual JSONB,
  filtros JSONB,
  drilldown_enabled BOOLEAN DEFAULT FALSE,
  atualizado_em TIMESTAMPTZ,
  dados_cache JSONB,
  cache_valido_ate TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_widgets_dashboard ON public.bi_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_bi_widgets_fato ON public.bi_widgets(fato_id);
CREATE INDEX IF NOT EXISTS idx_bi_widgets_cache ON public.bi_widgets(cache_valido_ate) WHERE cache_valido_ate IS NOT NULL;

COMMENT ON TABLE public.bi_widgets IS 'Widgets individuais (gráficos, tabelas, KPIs)';

-- 5. BI_RELATORIOS - Relatórios salvos
CREATE TABLE IF NOT EXISTS public.bi_relatorios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  proprietario_id UUID NOT NULL REFERENCES public.usuarios(id),
  query_sql TEXT NOT NULL,
  parametros JSONB,
  formato TEXT CHECK (formato IN ('pdf', 'excel', 'csv', 'html', 'json')) DEFAULT 'pdf',
  agendamento_cron TEXT,
  agendamento_ativo BOOLEAN DEFAULT FALSE,
  destinatarios_email TEXT[],
  destinatarios_ids UUID[],
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  total_execucoes INTEGER DEFAULT 0,
  publico BOOLEAN DEFAULT FALSE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bi_relatorios_empresa ON public.bi_relatorios(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_bi_relatorios_proprietario ON public.bi_relatorios(proprietario_id);
CREATE INDEX IF NOT EXISTS idx_bi_relatorios_categoria ON public.bi_relatorios(categoria);
CREATE INDEX IF NOT EXISTS idx_bi_relatorios_agendamento ON public.bi_relatorios(agendamento_ativo, proxima_execucao) WHERE agendamento_ativo = TRUE;

CREATE TRIGGER trg_bi_relatorios_updated BEFORE UPDATE ON public.bi_relatorios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_relatorios IS 'Relatórios customizados de BI';

-- 6. BI_FONTES_DADOS - Fontes de dados externas
CREATE TABLE IF NOT EXISTS public.bi_fontes_dados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('postgresql', 'mysql', 'mssql', 'api_rest', 'api_graphql', 'csv', 'excel', 'custom')) NOT NULL,
  descricao TEXT,
  connection_string TEXT,
  credenciais_encrypted TEXT,
  headers JSONB,
  configuracao JSONB,
  ultima_sincronizacao TIMESTAMPTZ,
  proxima_sincronizacao TIMESTAMPTZ,
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  intervalo_sincronizacao INTEGER,
  status TEXT CHECK (status IN ('conectada', 'desconectada', 'erro', 'sincronizando')) DEFAULT 'desconectada',
  erro_mensagem TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nome)
);

CREATE INDEX IF NOT EXISTS idx_bi_fontes_empresa ON public.bi_fontes_dados(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_bi_fontes_tipo ON public.bi_fontes_dados(tipo);
CREATE INDEX IF NOT EXISTS idx_bi_fontes_status ON public.bi_fontes_dados(status);
CREATE INDEX IF NOT EXISTS idx_bi_fontes_sync ON public.bi_fontes_dados(sincronizacao_automatica, proxima_sincronizacao) WHERE sincronizacao_automatica = TRUE;

CREATE TRIGGER trg_bi_fontes_updated BEFORE UPDATE ON public.bi_fontes_dados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.bi_fontes_dados IS 'Fontes de dados externas para BI';

-- ============================================
-- FIM MÓDULO BI - 6 TABELAS COMPLETAS
-- ============================================

