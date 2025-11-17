-- ============================================================================
-- ICARUS v5.0 - SISTEMA DE WEBHOOKS
-- Notificações em tempo real via webhooks
-- Data: 2025-10-26
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. WEBHOOK_ENDPOINTS - Endpoints Cadastrados
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_endpoints (
  endpoint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identificação
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configuração
  url TEXT NOT NULL,
  method VARCHAR(10) DEFAULT 'POST' CHECK (method IN ('POST', 'PUT', 'PATCH')),
  
  -- Autenticação
  auth_type VARCHAR(50) CHECK (auth_type IN ('none', 'basic', 'bearer', 'api_key', 'hmac')),
  auth_config JSONB DEFAULT '{}'::jsonb,
  secret_key TEXT, -- Para HMAC signature
  
  -- Headers customizados
  custom_headers JSONB DEFAULT '{}'::jsonb,
  
  -- Eventos que este webhook deve receber
  events TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Retry configuration
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~ '^https?://'),
  CONSTRAINT valid_events CHECK (array_length(events, 1) > 0)
);

-- Índices
CREATE INDEX idx_webhook_endpoints_org ON webhook_endpoints(organization_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_endpoints_events ON webhook_endpoints USING GIN(events);
CREATE INDEX idx_webhook_endpoints_last_triggered ON webhook_endpoints(last_triggered_at DESC);

COMMENT ON TABLE webhook_endpoints IS 'Endpoints de webhooks cadastrados para notificações em tempo real';

-- ============================================================================
-- 2. WEBHOOK_DELIVERIES - Entregas de Webhooks
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID REFERENCES webhook_endpoints(endpoint_id) ON DELETE CASCADE,
  
  -- Evento
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Request
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) NOT NULL,
  request_headers JSONB,
  request_body JSONB,
  request_signature TEXT,
  
  -- Response
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sending',
    'success',
    'failed',
    'retrying',
    'cancelled'
  )),
  
  -- Retry
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Error
  error_message TEXT,
  error_code VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX idx_webhook_deliveries_endpoint ON webhook_deliveries(endpoint_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status) WHERE status != 'success';
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) 
  WHERE status = 'retrying' AND next_retry_at IS NOT NULL;

-- Particionamento por data (opcional, para grande volume)
-- CREATE INDEX idx_webhook_deliveries_created_brin ON webhook_deliveries USING BRIN(created_at);

COMMENT ON TABLE webhook_deliveries IS 'Histórico de entregas de webhooks com status e retry';

-- ============================================================================
-- 3. WEBHOOK_EVENTS - Tipos de Eventos
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  event_type VARCHAR(100) PRIMARY KEY,
  
  -- Descrição
  name TEXT NOT NULL,
  description TEXT,
  
  -- Schema do payload (JSON Schema)
  payload_schema JSONB,
  
  -- Categoria
  category VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE webhook_events IS 'Catálogo de tipos de eventos disponíveis para webhooks';

-- Inserir eventos padrão
INSERT INTO webhook_events (event_type, name, description, category) VALUES
  ('task.created', 'Tarefa Criada', 'Disparado quando uma nova tarefa de agente é criada', 'agent'),
  ('task.started', 'Tarefa Iniciada', 'Disparado quando uma tarefa inicia execução', 'agent'),
  ('task.completed', 'Tarefa Concluída', 'Disparado quando uma tarefa é concluída com sucesso', 'agent'),
  ('task.failed', 'Tarefa Falhou', 'Disparado quando uma tarefa falha', 'agent'),
  ('report.draft', 'Relatório em Rascunho', 'Disparado quando um relatório é criado em rascunho', 'report'),
  ('report.pending_review', 'Relatório Pendente Revisão', 'Disparado quando relatório está aguardando revisão', 'report'),
  ('report.approved', 'Relatório Aprovado', 'Disparado quando relatório é aprovado', 'report'),
  ('report.published', 'Relatório Publicado', 'Disparado quando relatório é publicado', 'report'),
  ('compliance.low_score', 'Score de Compliance Baixo', 'Disparado quando score de compliance < 80%', 'compliance'),
  ('compliance.validation_failed', 'Validação Falhou', 'Disparado quando validação ANVISA falha', 'compliance'),
  ('iot.device_offline', 'Dispositivo Offline', 'Disparado quando dispositivo IoT fica offline', 'iot'),
  ('iot.alert_triggered', 'Alerta IoT Disparado', 'Disparado quando um alerta IoT é acionado', 'iot'),
  ('integration.sync_completed', 'Sincronização Completa', 'Disparado quando sincronização com fornecedor completa', 'integration'),
  ('integration.sync_failed', 'Sincronização Falhou', 'Disparado quando sincronização falha', 'integration')
ON CONFLICT (event_type) DO NOTHING;

-- ============================================================================
-- 4. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Atualizar updated_at
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Disparar webhook quando tarefa completa
CREATE OR REPLACE FUNCTION trigger_webhook_on_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM dispatch_webhook(
      'task.completed',
      jsonb_build_object(
        'task_id', NEW.task_id,
        'query_text', NEW.query_text,
        'execution_time_ms', NEW.execution_time_ms,
        'completed_at', NEW.completed_at,
        'result_data', NEW.result_data
      ),
      NEW.organization_id
    );
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    PERFORM dispatch_webhook(
      'task.failed',
      jsonb_build_object(
        'task_id', NEW.task_id,
        'query_text', NEW.query_text,
        'error_message', NEW.error_message,
        'completed_at', NEW.completed_at
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_task_completion
  AFTER UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook_on_task_completion();

-- Disparar webhook quando relatório é publicado
CREATE OR REPLACE FUNCTION trigger_webhook_on_report_published()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    PERFORM dispatch_webhook(
      'report.published',
      jsonb_build_object(
        'report_id', NEW.report_id,
        'title', NEW.title,
        'report_type', NEW.report_type,
        'published_at', NEW.published_at,
        'pdf_url', NEW.pdf_url
      ),
      NEW.organization_id
    );
  ELSIF NEW.status = 'pending_review' AND OLD.status = 'draft' THEN
    PERFORM dispatch_webhook(
      'report.pending_review',
      jsonb_build_object(
        'report_id', NEW.report_id,
        'title', NEW.title,
        'report_type', NEW.report_type
      ),
      NEW.organization_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_report_published
  AFTER UPDATE ON agent_reports
  FOR EACH ROW
  EXECUTE FUNCTION trigger_webhook_on_report_published();

-- ============================================================================
-- 5. FUNÇÃO PARA DESPACHAR WEBHOOK
-- ============================================================================

CREATE OR REPLACE FUNCTION dispatch_webhook(
  p_event_type VARCHAR(100),
  p_event_data JSONB,
  p_organization_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_endpoint RECORD;
BEGIN
  -- Buscar todos webhooks ativos que escutam este evento
  FOR v_endpoint IN
    SELECT *
    FROM webhook_endpoints
    WHERE organization_id = p_organization_id
      AND is_active = true
      AND p_event_type = ANY(events)
  LOOP
    -- Criar delivery pendente
    INSERT INTO webhook_deliveries (
      endpoint_id,
      event_type,
      event_data,
      request_url,
      request_method,
      status
    ) VALUES (
      v_endpoint.endpoint_id,
      p_event_type,
      p_event_data,
      v_endpoint.url,
      v_endpoint.method,
      'pending'
    );
    
    -- Atualizar last_triggered_at
    UPDATE webhook_endpoints
    SET last_triggered_at = NOW()
    WHERE endpoint_id = v_endpoint.endpoint_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION dispatch_webhook IS 'Despacha webhook para todos endpoints que escutam o evento';

-- ============================================================================
-- 6. FUNÇÃO PARA PROCESSAR FILA DE WEBHOOKS
-- ============================================================================

CREATE OR REPLACE FUNCTION process_webhook_queue(p_batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
  delivery_id UUID,
  endpoint_id UUID,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.delivery_id,
    d.endpoint_id,
    d.status::TEXT
  FROM webhook_deliveries d
  WHERE d.status IN ('pending', 'retrying')
    AND (d.next_retry_at IS NULL OR d.next_retry_at <= NOW())
  ORDER BY d.created_at ASC
  LIMIT p_batch_size;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================================

-- Habilitar RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policies para webhook_endpoints
CREATE POLICY "Users can view their organization's webhooks"
  ON webhook_endpoints FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create webhooks"
  ON webhook_endpoints FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization's webhooks"
  ON webhook_endpoints FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

-- Policies para webhook_deliveries
CREATE POLICY "Users can view deliveries of their webhooks"
  ON webhook_deliveries FOR SELECT
  USING (
    endpoint_id IN (
      SELECT endpoint_id FROM webhook_endpoints WHERE organization_id IN (
        SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Policies para webhook_events (todos podem ver)
CREATE POLICY "Anyone can view webhook events"
  ON webhook_events FOR SELECT
  USING (true);

-- ============================================================================
-- 8. VIEWS ÚTEIS
-- ============================================================================

-- View de estatísticas de webhooks
CREATE OR REPLACE VIEW webhook_statistics AS
SELECT 
  e.endpoint_id,
  e.name,
  e.url,
  e.is_active,
  COUNT(d.delivery_id) as total_deliveries,
  COUNT(CASE WHEN d.status = 'success' THEN 1 END) as successful_deliveries,
  COUNT(CASE WHEN d.status = 'failed' THEN 1 END) as failed_deliveries,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_deliveries,
  AVG(d.response_time_ms) as avg_response_time_ms,
  MAX(d.created_at) as last_delivery_at,
  CASE 
    WHEN COUNT(d.delivery_id) > 0 
    THEN (COUNT(CASE WHEN d.status = 'success' THEN 1 END)::FLOAT / COUNT(d.delivery_id) * 100)
    ELSE 0
  END as success_rate
FROM webhook_endpoints e
LEFT JOIN webhook_deliveries d ON d.endpoint_id = e.endpoint_id
GROUP BY e.endpoint_id;

-- View de deliveries recentes com falha
CREATE OR REPLACE VIEW webhook_failed_deliveries AS
SELECT 
  d.delivery_id,
  d.endpoint_id,
  e.name as endpoint_name,
  e.url,
  d.event_type,
  d.status,
  d.retry_count,
  d.error_message,
  d.created_at,
  d.next_retry_at
FROM webhook_deliveries d
JOIN webhook_endpoints e ON e.endpoint_id = d.endpoint_id
WHERE d.status IN ('failed', 'retrying')
ORDER BY d.created_at DESC;

-- ============================================================================
-- 9. GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON webhook_endpoints TO authenticated;
GRANT SELECT ON webhook_deliveries TO authenticated;
GRANT SELECT ON webhook_events TO authenticated;
GRANT SELECT ON webhook_statistics TO authenticated;
GRANT SELECT ON webhook_failed_deliveries TO authenticated;

GRANT EXECUTE ON FUNCTION dispatch_webhook TO authenticated;
GRANT EXECUTE ON FUNCTION process_webhook_queue TO authenticated;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

