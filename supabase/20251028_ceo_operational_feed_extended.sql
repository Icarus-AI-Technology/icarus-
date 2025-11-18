-- Migration: 20251028_ceo_operational_feed_extended.sql
-- Extensão das tabelas do CEO Intelligence para suportar feed operacional completo

-- Tabela: ceo_strategic_alerts
-- Armazena alertas estratégicos de alta prioridade para o CEO
CREATE TABLE IF NOT EXISTS public.ceo_strategic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  severidade TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  categoria TEXT NOT NULL, -- 'clinico', 'operacional', 'compras', 'logistica', 'financeiro'
  acoes_recomendadas TEXT[],
  dados_suporte JSONB,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'em_analise', 'resolvido', 'ignorado'
  usuario_responsavel_id UUID REFERENCES auth.users(id),
  data_resolucao TIMESTAMP WITH TIME ZONE,
  notas_resolucao TEXT
);

COMMENT ON TABLE public.ceo_strategic_alerts IS 'Alertas estratégicos de alta prioridade para o CEO.';

-- Índices
CREATE INDEX idx_ceo_strategic_alerts_empresa ON public.ceo_strategic_alerts(empresa_id);
CREATE INDEX idx_ceo_strategic_alerts_severidade ON public.ceo_strategic_alerts(severidade);
CREATE INDEX idx_ceo_strategic_alerts_status ON public.ceo_strategic_alerts(status);
CREATE INDEX idx_ceo_strategic_alerts_categoria ON public.ceo_strategic_alerts(categoria);

-- RLS
ALTER TABLE public.ceo_strategic_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.ceo_strategic_alerts
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for users by company" ON public.ceo_strategic_alerts
FOR INSERT WITH CHECK (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable update for users by company" ON public.ceo_strategic_alerts
FOR UPDATE USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

-- Tabela: ceo_recommendations
-- Armazena recomendações priorizadas por ROI para o CEO
CREATE TABLE IF NOT EXISTS public.ceo_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  area TEXT NOT NULL, -- 'clinico', 'operacional', 'compras', 'logistica'
  prioridade TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  acao TEXT NOT NULL,
  impacto_esperado NUMERIC(18, 2),
  tipo_impacto TEXT, -- 'financial', 'operational', 'compliance', 'efficiency'
  esforco TEXT, -- 'low', 'medium', 'high'
  roi_estimado NUMERIC(10, 2),
  prazo_implementacao_dias INTEGER,
  status TEXT DEFAULT 'pendente', -- 'pendente', 'aprovada', 'em_implementacao', 'concluida', 'rejeitada'
  data_aprovacao TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  usuario_responsavel_id UUID REFERENCES auth.users(id),
  notas TEXT
);

COMMENT ON TABLE public.ceo_recommendations IS 'Recomendações estratégicas priorizadas por ROI para o CEO.';

-- Índices
CREATE INDEX idx_ceo_recommendations_empresa ON public.ceo_recommendations(empresa_id);
CREATE INDEX idx_ceo_recommendations_prioridade ON public.ceo_recommendations(prioridade);
CREATE INDEX idx_ceo_recommendations_roi ON public.ceo_recommendations(roi_estimado DESC);
CREATE INDEX idx_ceo_recommendations_status ON public.ceo_recommendations(status);

-- RLS
ALTER TABLE public.ceo_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.ceo_recommendations
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for users by company" ON public.ceo_recommendations
FOR INSERT WITH CHECK (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable update for users by company" ON public.ceo_recommendations
FOR UPDATE USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

-- Tabela: ceo_dashboard_metrics
-- Armazena snapshots de métricas agregadas para o dashboard CEO
CREATE TABLE IF NOT EXISTS public.ceo_dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  kpis_gerais JSONB, -- KPIs consolidados (saude_clinica, saude_operacional, etc)
  metricas_clinico JSONB,
  metricas_operacional JSONB,
  metricas_compras JSONB,
  metricas_logistica JSONB,
  tendencias JSONB -- Tendências: positiva, estavel, negativa por área
);

COMMENT ON TABLE public.ceo_dashboard_metrics IS 'Snapshots de métricas agregadas para o dashboard CEO.';

-- Índices
CREATE INDEX idx_ceo_dashboard_metrics_empresa ON public.ceo_dashboard_metrics(empresa_id);
CREATE INDEX idx_ceo_dashboard_metrics_timestamp ON public.ceo_dashboard_metrics(timestamp DESC);

-- RLS
ALTER TABLE public.ceo_dashboard_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.ceo_dashboard_metrics
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for users by company" ON public.ceo_dashboard_metrics
FOR INSERT WITH CHECK (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

-- Tabela: agent_actions_log
-- Log de todas as ações dos agentes de IA (já pode existir, criar se não)
CREATE TABLE IF NOT EXISTS public.agent_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  empresa_id UUID REFERENCES public.empresas(id),
  agent_name TEXT NOT NULL, -- 'clinical', 'operations', 'procurement', 'logistics'
  action_type TEXT NOT NULL, -- 'analyze', 'getMetrics', 'getRecommendations', 'reportToCEO'
  module TEXT, -- Módulo relacionado
  input_data JSONB,
  output_data JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER
);

COMMENT ON TABLE public.agent_actions_log IS 'Log de todas as ações executadas pelos agentes de IA.';

-- Índices
CREATE INDEX idx_agent_actions_log_empresa ON public.agent_actions_log(empresa_id);
CREATE INDEX idx_agent_actions_log_agent ON public.agent_actions_log(agent_name);
CREATE INDEX idx_agent_actions_log_created ON public.agent_actions_log(created_at DESC);

-- RLS
ALTER TABLE public.agent_actions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users by company" ON public.agent_actions_log
FOR SELECT USING (
  (SELECT empresa_id FROM public.profiles WHERE id = auth.uid()) = empresa_id
);

CREATE POLICY "Enable insert for authenticated users" ON public.agent_actions_log
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- View: ceo_operational_summary
-- View consolidada com resumo operacional para o CEO
CREATE OR REPLACE VIEW public.ceo_operational_summary AS
SELECT
  f.empresa_id,
  COUNT(DISTINCT f.id) AS total_eventos,
  COUNT(DISTINCT CASE WHEN f.prioridade IN ('critical', 'high') THEN f.id END) AS eventos_criticos,
  jsonb_object_agg(
    f.categoria,
    jsonb_build_object(
      'total', COUNT(f.id),
      'criticos', COUNT(CASE WHEN f.prioridade = 'critical' THEN 1 END),
      'altos', COUNT(CASE WHEN f.prioridade = 'high' THEN 1 END)
    )
  ) AS eventos_por_categoria,
  MAX(f.created_at) AS ultima_atualizacao
FROM public.ceo_operational_feed f
WHERE f.created_at > NOW() - INTERVAL '24 hours'
GROUP BY f.empresa_id;

COMMENT ON VIEW public.ceo_operational_summary IS 'Resumo operacional consolidado das últimas 24h para o CEO.';

-- Function: refresh_ceo_metrics
-- Function para atualizar métricas do CEO sob demanda
CREATE OR REPLACE FUNCTION public.refresh_ceo_metrics(empresa_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta function pode ser chamada por um cron job ou manualmente
  -- Para atualizar as métricas do CEO Dashboard
  
  -- Inserir nova snapshot de métricas
  INSERT INTO public.ceo_dashboard_metrics (empresa_id, kpis_gerais)
  VALUES (
    empresa_uuid,
    jsonb_build_object(
      'timestamp', NOW(),
      'status', 'atualizado'
    )
  );
  
  RAISE NOTICE 'Métricas do CEO atualizadas para empresa %', empresa_uuid;
END;
$$;

COMMENT ON FUNCTION public.refresh_ceo_metrics IS 'Atualiza métricas do dashboard CEO para uma empresa específica.';

-- Grants
GRANT SELECT ON public.ceo_operational_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_ceo_metrics TO authenticated;

