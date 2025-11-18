-- ============================================================================
-- ICARUS v5.0 - AGENT ORCHESTRATION SYSTEM
-- Sistema de orquestração de agentes para análise e relatórios OPME
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Índices GIN para JSONB

-- ============================================================================
-- 1. AGENT_TASKS - Tarefas de Agentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hierarquia e contexto
  parent_task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  session_id UUID, -- Pode referenciar edr_research_sessions se necessário
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Consulta e descrição
  query_text TEXT NOT NULL,
  task_description TEXT,
  task_type VARCHAR(100) CHECK (task_type IN (
    'master_planning', 
    'data_internal', 
    'data_external', 
    'benchmark', 
    'compliance', 
    'synthesis', 
    'visualization',
    'notification'
  )),
  
  -- Status e prioridade
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 
    'in_progress', 
    'completed', 
    'failed', 
    'cancelled',
    'waiting_approval'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Configuração
  assigned_agent VARCHAR(100), -- Nome do agente que executará
  parameters JSONB DEFAULT '{}'::jsonb, -- Parâmetros específicos da tarefa
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Metadados e plano
  metadata JSONB DEFAULT '{}'::jsonb,
  master_plan JSONB, -- Plano gerado pelo orquestrador
  subtasks JSONB DEFAULT '[]'::jsonb, -- Array de IDs de subtarefas
  
  -- Resultados
  result_data JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Índices para performance
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status) WHERE status != 'completed';
CREATE INDEX idx_agent_tasks_priority ON agent_tasks(priority DESC, created_at ASC);
CREATE INDEX idx_agent_tasks_parent ON agent_tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_agent_tasks_org ON agent_tasks(organization_id);
CREATE INDEX idx_agent_tasks_type ON agent_tasks(task_type);
CREATE INDEX idx_agent_tasks_created ON agent_tasks(created_at DESC);
CREATE INDEX idx_agent_tasks_session ON agent_tasks(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_agent_tasks_metadata ON agent_tasks USING GIN(metadata);

-- Comentários
COMMENT ON TABLE agent_tasks IS 'Tarefas de agentes para orquestração e análise OPME';
COMMENT ON COLUMN agent_tasks.master_plan IS 'Plano de execução gerado pelo orquestrador master';
COMMENT ON COLUMN agent_tasks.subtasks IS 'Array de UUIDs de subtarefas relacionadas';

-- ============================================================================
-- 2. AGENT_LOGS - Logs de Execução de Agentes
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  
  -- Informações do agente
  agent_name TEXT NOT NULL,
  agent_type VARCHAR(100),
  agent_version VARCHAR(50),
  
  -- Evento
  event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type VARCHAR(100) CHECK (event_type IN (
    'task_started',
    'task_progress',
    'task_completed',
    'task_failed',
    'data_fetched',
    'api_called',
    'error_occurred',
    'warning_issued',
    'human_intervention_required',
    'steering_applied'
  )),
  action TEXT NOT NULL,
  
  -- Detalhes
  details JSONB DEFAULT '{}'::jsonb,
  log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  -- Contexto de execução
  execution_context JSONB,
  stack_trace TEXT,
  
  -- Métricas
  duration_ms INTEGER,
  memory_usage_mb DECIMAL(10,2),
  tokens_used INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Rastreabilidade
  correlation_id UUID, -- Para rastrear fluxos relacionados
  parent_log_id UUID REFERENCES agent_logs(log_id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX idx_agent_logs_task ON agent_logs(task_id, event_time DESC);
CREATE INDEX idx_agent_logs_event_type ON agent_logs(event_type);
CREATE INDEX idx_agent_logs_level ON agent_logs(log_level) WHERE log_level IN ('error', 'critical');
CREATE INDEX idx_agent_logs_time ON agent_logs(event_time DESC);
CREATE INDEX idx_agent_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_correlation ON agent_logs(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_agent_logs_details ON agent_logs USING GIN(details);

-- Particionamento por data para performance (opcional, pode ser implementado depois)
-- CREATE INDEX idx_agent_logs_time_brin ON agent_logs USING BRIN(event_time);

COMMENT ON TABLE agent_logs IS 'Logs detalhados de execução dos agentes para auditoria e debugging';
COMMENT ON COLUMN agent_logs.correlation_id IS 'ID para rastrear múltiplos logs relacionados a um fluxo';

-- ============================================================================
-- 3. AGENT_REPORTS - Relatórios Gerados
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_reports (
  report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Tipo e categoria
  report_type TEXT NOT NULL CHECK (report_type IN (
    'consumo_opme',
    'compliance_summary',
    'previsao_demanda',
    'analise_custo',
    'benchmark_fornecedores',
    'auditoria_rastreabilidade',
    'desempenho_cirurgias',
    'glosas_detectadas',
    'custom'
  )),
  category VARCHAR(100),
  
  -- Conteúdo
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT, -- Markdown ou HTML
  content_format VARCHAR(20) DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'json', 'pdf')),
  
  -- Dados estruturados
  data_snapshot JSONB, -- Snapshot dos dados usados no relatório
  visualizations JSONB DEFAULT '[]'::jsonb, -- Array de configurações de gráficos
  metrics JSONB, -- KPIs e métricas calculadas
  
  -- Arquivos gerados
  pdf_url TEXT,
  excel_url TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Status e workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'pending_review',
    'reviewed',
    'approved',
    'published',
    'archived',
    'rejected'
  )),
  
  -- Controle de versão
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES agent_reports(report_id) ON DELETE SET NULL,
  
  -- Revisão humana
  reviewer_user_id UUID REFERENCES profiles(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Aprovação
  approver_user_id UUID REFERENCES profiles(id),
  approval_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Publicação
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES profiles(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID REFERENCES profiles(id),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Controle de acesso
  is_confidential BOOLEAN DEFAULT false,
  access_level VARCHAR(50) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted'))
);

-- Índices para performance
CREATE INDEX idx_agent_reports_task ON agent_reports(task_id);
CREATE INDEX idx_agent_reports_org ON agent_reports(organization_id);
CREATE INDEX idx_agent_reports_type ON agent_reports(report_type);
CREATE INDEX idx_agent_reports_status ON agent_reports(status);
CREATE INDEX idx_agent_reports_created ON agent_reports(created_at DESC);
CREATE INDEX idx_agent_reports_published ON agent_reports(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_agent_reports_reviewer ON agent_reports(reviewer_user_id) WHERE reviewer_user_id IS NOT NULL;
CREATE INDEX idx_agent_reports_tags ON agent_reports USING GIN(tags);
CREATE INDEX idx_agent_reports_metadata ON agent_reports USING GIN(metadata);
CREATE INDEX idx_agent_reports_version ON agent_reports(version);
CREATE INDEX idx_agent_reports_confidential ON agent_reports(is_confidential, access_level);

-- Full-text search
CREATE INDEX idx_agent_reports_search ON agent_reports USING GIN(
  to_tsvector('portuguese', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, ''))
);

COMMENT ON TABLE agent_reports IS 'Relatórios gerados pelos agentes com controle de workflow e versionamento';
COMMENT ON COLUMN agent_reports.data_snapshot IS 'Snapshot dos dados usados para garantir reprodutibilidade';

-- ============================================================================
-- 4. AGENT_SOURCES - Fontes de Dados Utilizadas
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_sources (
  source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  report_id UUID REFERENCES agent_reports(report_id) ON DELETE SET NULL,
  
  -- Tipo de fonte
  source_type VARCHAR(100) CHECK (source_type IN (
    'database_internal',
    'api_external',
    'iot_sensor',
    'rfid_reader',
    'blockchain_ledger',
    'anvisa_registry',
    'supplier_api',
    'web_scraping',
    'document_upload',
    'manual_input'
  )),
  
  -- Identificação da fonte
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_identifier TEXT, -- ID ou hash único
  
  -- Dados
  data_excerpt JSONB, -- Pequeno trecho dos dados
  data_hash TEXT, -- Hash SHA256 dos dados para verificação
  record_count INTEGER,
  
  -- Qualidade e confiabilidade
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reliability_score DECIMAL(3,2) CHECK (reliability_score >= 0 AND reliability_score <= 1),
  freshness_minutes INTEGER, -- Quão recente são os dados
  
  -- Timestamps
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_timestamp TIMESTAMP WITH TIME ZONE, -- Timestamp dos dados originais
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Rastreabilidade
  correlation_id UUID
);

-- Índices
CREATE INDEX idx_agent_sources_task ON agent_sources(task_id);
CREATE INDEX idx_agent_sources_report ON agent_sources(report_id) WHERE report_id IS NOT NULL;
CREATE INDEX idx_agent_sources_type ON agent_sources(source_type);
CREATE INDEX idx_agent_sources_accessed ON agent_sources(accessed_at DESC);
CREATE INDEX idx_agent_sources_hash ON agent_sources(data_hash) WHERE data_hash IS NOT NULL;

COMMENT ON TABLE agent_sources IS 'Rastreamento de todas as fontes de dados utilizadas pelos agentes';

-- ============================================================================
-- 5. AGENT_METRICS - Métricas de Performance
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(task_id) ON DELETE CASCADE,
  
  -- Identificação
  agent_name TEXT NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) CHECK (metric_category IN ('performance', 'quality', 'cost', 'reliability', 'custom')),
  
  -- Valor
  metric_value DECIMAL(20,4),
  metric_unit VARCHAR(50),
  
  -- Contexto
  measurement_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  measurement_window_minutes INTEGER,
  
  -- Comparação
  baseline_value DECIMAL(20,4),
  threshold_min DECIMAL(20,4),
  threshold_max DECIMAL(20,4),
  is_within_threshold BOOLEAN,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Agregação
  aggregation_type VARCHAR(20) CHECK (aggregation_type IN ('sum', 'avg', 'min', 'max', 'count', 'p50', 'p95', 'p99'))
);

-- Índices
CREATE INDEX idx_agent_metrics_task ON agent_metrics(task_id);
CREATE INDEX idx_agent_metrics_agent ON agent_metrics(agent_name);
CREATE INDEX idx_agent_metrics_name ON agent_metrics(metric_name);
CREATE INDEX idx_agent_metrics_time ON agent_metrics(measurement_time DESC);
CREATE INDEX idx_agent_metrics_category ON agent_metrics(metric_category);
CREATE INDEX idx_agent_metrics_threshold ON agent_metrics(is_within_threshold) WHERE is_within_threshold = false;

COMMENT ON TABLE agent_metrics IS 'Métricas de performance e qualidade dos agentes';

-- ============================================================================
-- 6. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_reports_updated_at
  BEFORE UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Validar transições de status
CREATE OR REPLACE FUNCTION validate_agent_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Não pode voltar de completed/failed para pending sem reset explícito
  IF OLD.status IN ('completed', 'failed', 'cancelled') AND NEW.status = 'pending' THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;
  
  -- Registrar timestamps
  IF NEW.status = 'in_progress' AND OLD.status = 'pending' THEN
    NEW.started_at = NOW();
  END IF;
  
  IF NEW.status IN ('completed', 'failed', 'cancelled') AND OLD.status NOT IN ('completed', 'failed', 'cancelled') THEN
    NEW.completed_at = NOW();
    NEW.execution_time_ms = EXTRACT(EPOCH FROM (NOW() - NEW.started_at)) * 1000;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_agent_task_status
  BEFORE UPDATE OF status ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_agent_task_status_transition();

-- Auto-incrementar versão de relatórios
CREATE OR REPLACE FUNCTION increment_report_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.version = OLD.version + 1;
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_increment_report_version
  BEFORE UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_version();

-- ============================================================================
-- 7. FUNÇÕES DE UTILIDADE
-- ============================================================================

-- Obter métricas agregadas de uma tarefa
CREATE OR REPLACE FUNCTION get_agent_task_metrics(p_task_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_metrics JSONB;
BEGIN
  SELECT jsonb_build_object(
    'task_id', t.task_id,
    'status', t.status,
    'execution_time_ms', t.execution_time_ms,
    'retry_count', t.retry_count,
    'logs_count', (SELECT COUNT(*) FROM agent_logs WHERE task_id = p_task_id),
    'error_logs_count', (SELECT COUNT(*) FROM agent_logs WHERE task_id = p_task_id AND log_level IN ('error', 'critical')),
    'sources_count', (SELECT COUNT(*) FROM agent_sources WHERE task_id = p_task_id),
    'avg_confidence', (SELECT AVG(confidence_score) FROM agent_sources WHERE task_id = p_task_id),
    'subtasks_count', jsonb_array_length(COALESCE(t.subtasks, '[]'::jsonb)),
    'created_at', t.created_at,
    'started_at', t.started_at,
    'completed_at', t.completed_at
  ) INTO v_metrics
  FROM agent_tasks t
  WHERE t.task_id = p_task_id;
  
  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- Obter status consolidado de um relatório
CREATE OR REPLACE FUNCTION get_agent_report_status(p_report_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_status JSONB;
BEGIN
  SELECT jsonb_build_object(
    'report_id', r.report_id,
    'status', r.status,
    'version', r.version,
    'created_at', r.created_at,
    'reviewed', r.reviewed_at IS NOT NULL,
    'approved', r.approved_at IS NOT NULL,
    'published', r.published_at IS NOT NULL,
    'task_status', t.status,
    'sources_count', (SELECT COUNT(*) FROM agent_sources WHERE report_id = p_report_id),
    'visualizations_count', jsonb_array_length(COALESCE(r.visualizations, '[]'::jsonb))
  ) INTO v_status
  FROM agent_reports r
  LEFT JOIN agent_tasks t ON t.task_id = r.task_id
  WHERE r.report_id = p_report_id;
  
  RETURN v_status;
END;
$$ LANGUAGE plpgsql;

-- Criar tarefa de agente com validação
CREATE OR REPLACE FUNCTION create_agent_task(
  p_query_text TEXT,
  p_task_type VARCHAR(100),
  p_organization_id UUID,
  p_priority INTEGER DEFAULT 5,
  p_parameters JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_task_id UUID;
  v_user_id UUID;
BEGIN
  -- Obter usuário atual
  v_user_id := auth.uid();
  
  -- Validar organização
  IF NOT EXISTS (
    SELECT 1 FROM user_organizations 
    WHERE user_id = v_user_id AND organization_id = p_organization_id
  ) THEN
    RAISE EXCEPTION 'User does not have access to organization';
  END IF;
  
  -- Criar tarefa
  INSERT INTO agent_tasks (
    query_text,
    task_type,
    organization_id,
    priority,
    parameters,
    created_by,
    status
  ) VALUES (
    p_query_text,
    p_task_type,
    p_organization_id,
    p_priority,
    p_parameters,
    v_user_id,
    'pending'
  )
  RETURNING task_id INTO v_task_id;
  
  -- Registrar log inicial
  INSERT INTO agent_logs (task_id, agent_name, event_type, action, log_level)
  VALUES (v_task_id, 'system', 'task_started', 'Task created by user', 'info');
  
  RETURN v_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;

-- Policies para agent_tasks
CREATE POLICY "Users can view tasks from their organizations"
  ON agent_tasks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their organizations"
  ON agent_tasks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks they created"
  ON agent_tasks FOR UPDATE
  USING (created_by = auth.uid() OR updated_by = auth.uid());

-- Policies para agent_logs
CREATE POLICY "Users can view logs of their organization's tasks"
  ON agent_logs FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert logs"
  ON agent_logs FOR INSERT
  WITH CHECK (true);

-- Policies para agent_reports
CREATE POLICY "Users can view reports from their organizations"
  ON agent_reports FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports"
  ON agent_reports FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports they created or are reviewers"
  ON agent_reports FOR UPDATE
  USING (
    created_by = auth.uid() OR 
    reviewer_user_id = auth.uid() OR 
    approver_user_id = auth.uid()
  );

-- Policies para agent_sources
CREATE POLICY "Users can view sources of their organization's tasks"
  ON agent_sources FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can manage sources"
  ON agent_sources FOR ALL
  USING (true);

-- Policies para agent_metrics
CREATE POLICY "Users can view metrics of their organization's tasks"
  ON agent_metrics FOR SELECT
  USING (
    task_id IN (
      SELECT task_id FROM agent_tasks WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert metrics"
  ON agent_metrics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 9. REALTIME
-- ============================================================================

-- Habilitar Realtime para tabelas relevantes
ALTER PUBLICATION supabase_realtime ADD TABLE agent_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_reports;

-- ============================================================================
-- 10. VIEWS
-- ============================================================================

-- View de tarefas ativas com métricas
CREATE OR REPLACE VIEW agent_tasks_active AS
SELECT 
  t.task_id,
  t.query_text,
  t.task_type,
  t.status,
  t.priority,
  t.created_at,
  t.started_at,
  t.organization_id,
  COUNT(DISTINCT l.log_id) as logs_count,
  COUNT(DISTINCT CASE WHEN l.log_level = 'error' THEN l.log_id END) as error_count,
  COUNT(DISTINCT s.source_id) as sources_count,
  AVG(s.confidence_score) as avg_confidence
FROM agent_tasks t
LEFT JOIN agent_logs l ON l.task_id = t.task_id
LEFT JOIN agent_sources s ON s.task_id = t.task_id
WHERE t.status NOT IN ('completed', 'cancelled', 'failed')
GROUP BY t.task_id;

-- View de relatórios publicados recentes
CREATE OR REPLACE VIEW agent_reports_published AS
SELECT 
  r.report_id,
  r.title,
  r.report_type,
  r.summary,
  r.status,
  r.version,
  r.published_at,
  r.organization_id,
  t.task_type,
  t.execution_time_ms,
  COUNT(DISTINCT s.source_id) as sources_used
FROM agent_reports r
LEFT JOIN agent_tasks t ON t.task_id = r.task_id
LEFT JOIN agent_sources s ON s.report_id = r.report_id
WHERE r.status = 'published'
GROUP BY r.report_id, t.task_id;

-- View de performance de agentes
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
  t.task_type,
  t.assigned_agent,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
  COUNT(CASE WHEN t.status = 'failed' THEN 1 END) as failed_count,
  AVG(t.execution_time_ms) as avg_execution_time_ms,
  AVG(s.confidence_score) as avg_confidence_score,
  COUNT(DISTINCT r.report_id) as reports_generated
FROM agent_tasks t
LEFT JOIN agent_sources s ON s.task_id = t.task_id
LEFT JOIN agent_reports r ON r.task_id = t.task_id
GROUP BY t.task_type, t.assigned_agent;

-- ============================================================================
-- 11. GRANTS
-- ============================================================================

-- Grant para usuários autenticados
GRANT SELECT, INSERT, UPDATE ON agent_tasks TO authenticated;
GRANT SELECT ON agent_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON agent_reports TO authenticated;
GRANT SELECT ON agent_sources TO authenticated;
GRANT SELECT ON agent_metrics TO authenticated;

-- Grant para views
GRANT SELECT ON agent_tasks_active TO authenticated;
GRANT SELECT ON agent_reports_published TO authenticated;
GRANT SELECT ON agent_performance_summary TO authenticated;

-- Grant para funções
GRANT EXECUTE ON FUNCTION get_agent_task_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_report_status TO authenticated;
GRANT EXECUTE ON FUNCTION create_agent_task TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

