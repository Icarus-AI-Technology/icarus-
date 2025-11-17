-- ============================================================================
-- ENTERPRISE DEEP RESEARCH (EDR) - SCHEMA SUPABASE
-- Sistema multiagente para pesquisa profunda empresarial
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy

-- ============================================================================
-- TABELAS PRINCIPAIS
-- ============================================================================

-- Research Sessions
CREATE TABLE IF NOT EXISTS edr_research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'researching', 'analyzing', 'completed', 'failed')),
  master_plan JSONB,
  constraints JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Research Results
CREATE TABLE IF NOT EXISTS edr_research_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('general', 'academic', 'github', 'linkedin', 'database')),
  subtask_id TEXT,
  data JSONB NOT NULL,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  execution_time INTEGER, -- ms
  sources TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Gaps
CREATE TABLE IF NOT EXISTS edr_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  gap_description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  suggested_actions JSONB,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'addressing', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Human Feedback
CREATE TABLE IF NOT EXISTS edr_human_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  gap_id UUID REFERENCES edr_knowledge_gaps(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('redirect', 'refine', 'approve', 'reject', 'guidance')),
  content TEXT,
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visualizations
CREATE TABLE IF NOT EXISTS edr_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chart', 'graph', 'table', 'timeline', 'network', 'heatmap')),
  data JSONB NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Performance Metrics
CREATE TABLE IF NOT EXISTS edr_agent_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value FLOAT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Commands
CREATE TABLE IF NOT EXISTS edr_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  command_type TEXT NOT NULL CHECK (command_type IN ('redirect', 'refine', 'stop', 'resume', 'prioritize')),
  payload JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Research Sessions
CREATE INDEX idx_edr_sessions_status ON edr_research_sessions(status);
CREATE INDEX idx_edr_sessions_created_by ON edr_research_sessions(created_by);
CREATE INDEX idx_edr_sessions_created_at ON edr_research_sessions(created_at DESC);

-- Research Results
CREATE INDEX idx_edr_results_session ON edr_research_results(session_id);
CREATE INDEX idx_edr_results_agent_type ON edr_research_results(agent_type);
CREATE INDEX idx_edr_results_confidence ON edr_research_results(confidence_score DESC);

-- Knowledge Gaps
CREATE INDEX idx_edr_gaps_session ON edr_knowledge_gaps(session_id);
CREATE INDEX idx_edr_gaps_status ON edr_knowledge_gaps(status);
CREATE INDEX idx_edr_gaps_severity ON edr_knowledge_gaps(severity);

-- Human Feedback
CREATE INDEX idx_edr_feedback_session ON edr_human_feedback(session_id);
CREATE INDEX idx_edr_feedback_type ON edr_human_feedback(feedback_type);

-- Visualizations
CREATE INDEX idx_edr_viz_session ON edr_visualizations(session_id);
CREATE INDEX idx_edr_viz_type ON edr_visualizations(type);

-- Agent Metrics
CREATE INDEX idx_edr_metrics_session ON edr_agent_metrics(session_id);
CREATE INDEX idx_edr_metrics_agent ON edr_agent_metrics(agent_type);

-- Commands
CREATE INDEX idx_edr_commands_session ON edr_commands(session_id);
CREATE INDEX idx_edr_commands_status ON edr_commands(status);

-- ============================================================================
-- FUNÇÕES
-- ============================================================================

-- Atualizar timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_edr_sessions_updated_at
  BEFORE UPDATE ON edr_research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular métricas agregadas
CREATE OR REPLACE FUNCTION edr_get_session_metrics(session_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  metrics JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_results', COUNT(*),
    'avg_confidence', AVG(confidence_score),
    'total_execution_time', SUM(execution_time),
    'agents_used', array_agg(DISTINCT agent_type),
    'total_gaps', (SELECT COUNT(*) FROM edr_knowledge_gaps WHERE session_id = session_uuid),
    'open_gaps', (SELECT COUNT(*) FROM edr_knowledge_gaps WHERE session_id = session_uuid AND status = 'open')
  ) INTO metrics
  FROM edr_research_results
  WHERE session_id = session_uuid;
  
  RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Função para obter resultados consolidados
CREATE OR REPLACE FUNCTION edr_get_consolidated_results(session_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  consolidated JSONB;
BEGIN
  SELECT jsonb_build_object(
    'session', row_to_json(s.*),
    'results', (
      SELECT jsonb_agg(row_to_json(r.*))
      FROM edr_research_results r
      WHERE r.session_id = session_uuid
    ),
    'gaps', (
      SELECT jsonb_agg(row_to_json(g.*))
      FROM edr_knowledge_gaps g
      WHERE g.session_id = session_uuid
    ),
    'feedback', (
      SELECT jsonb_agg(row_to_json(f.*))
      FROM edr_human_feedback f
      WHERE f.session_id = session_uuid
    ),
    'visualizations', (
      SELECT jsonb_agg(row_to_json(v.*))
      FROM edr_visualizations v
      WHERE v.session_id = session_uuid
    ),
    'metrics', edr_get_session_metrics(session_uuid)
  ) INTO consolidated
  FROM edr_research_sessions s
  WHERE s.id = session_uuid;
  
  RETURN consolidated;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE edr_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_knowledge_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_human_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE edr_commands ENABLE ROW LEVEL SECURITY;

-- Policies para research_sessions
CREATE POLICY "Users can view their own sessions"
  ON edr_research_sessions FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create sessions"
  ON edr_research_sessions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own sessions"
  ON edr_research_sessions FOR UPDATE
  USING (auth.uid() = created_by);

-- Policies para research_results
CREATE POLICY "Users can view results of their sessions"
  ON edr_research_results FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert results"
  ON edr_research_results FOR INSERT
  WITH CHECK (true);

-- Policies para knowledge_gaps
CREATE POLICY "Users can view gaps of their sessions"
  ON edr_knowledge_gaps FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "System can manage gaps"
  ON edr_knowledge_gaps FOR ALL
  USING (true);

-- Policies para human_feedback
CREATE POLICY "Users can view feedback of their sessions"
  ON edr_human_feedback FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback"
  ON edr_human_feedback FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Policies para visualizations
CREATE POLICY "Users can view visualizations of their sessions"
  ON edr_visualizations FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "System can create visualizations"
  ON edr_visualizations FOR INSERT
  WITH CHECK (true);

-- Policies para agent_metrics
CREATE POLICY "Users can view metrics of their sessions"
  ON edr_agent_metrics FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "System can insert metrics"
  ON edr_agent_metrics FOR INSERT
  WITH CHECK (true);

-- Policies para commands
CREATE POLICY "Users can view commands of their sessions"
  ON edr_commands FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM edr_research_sessions WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create commands"
  ON edr_commands FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Habilitar Realtime para tabelas relevantes
ALTER PUBLICATION supabase_realtime ADD TABLE edr_research_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE edr_research_results;
ALTER PUBLICATION supabase_realtime ADD TABLE edr_knowledge_gaps;
ALTER PUBLICATION supabase_realtime ADD TABLE edr_human_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE edr_commands;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View de sessões ativas
CREATE OR REPLACE VIEW edr_active_sessions AS
SELECT 
  s.*,
  COUNT(DISTINCT r.id) as total_results,
  AVG(r.confidence_score) as avg_confidence,
  COUNT(DISTINCT g.id) as total_gaps,
  SUM(CASE WHEN g.status = 'open' THEN 1 ELSE 0 END) as open_gaps
FROM edr_research_sessions s
LEFT JOIN edr_research_results r ON r.session_id = s.id
LEFT JOIN edr_knowledge_gaps g ON g.session_id = s.id
WHERE s.status IN ('planning', 'researching', 'analyzing')
GROUP BY s.id;

-- View de métricas por agente
CREATE OR REPLACE VIEW edr_agent_performance AS
SELECT 
  agent_type,
  COUNT(*) as total_executions,
  AVG(confidence_score) as avg_confidence,
  AVG(execution_time) as avg_execution_time,
  MIN(confidence_score) as min_confidence,
  MAX(confidence_score) as max_confidence
FROM edr_research_results
GROUP BY agent_type;

-- ============================================================================
-- DADOS DE EXEMPLO (DESENVOLVIMENTO)
-- ============================================================================

-- Inserir sessão de exemplo
-- INSERT INTO edr_research_sessions (query, status, master_plan, created_by)
-- VALUES (
--   'Análise de tendências de IA em 2025',
--   'completed',
--   '{"objective": "Pesquisar tendências de IA", "subtasks": []}'::jsonb,
--   auth.uid()
-- );

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE edr_research_sessions IS 'Sessões de pesquisa profunda do EDR';
COMMENT ON TABLE edr_research_results IS 'Resultados coletados por agentes especializados';
COMMENT ON TABLE edr_knowledge_gaps IS 'Lacunas de conhecimento identificadas pelo mecanismo de reflexão';
COMMENT ON TABLE edr_human_feedback IS 'Feedback humano para orientação do sistema';
COMMENT ON TABLE edr_visualizations IS 'Visualizações geradas para os resultados';
COMMENT ON TABLE edr_agent_metrics IS 'Métricas de performance dos agentes';
COMMENT ON TABLE edr_commands IS 'Comandos em tempo real para controle da pesquisa';

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

