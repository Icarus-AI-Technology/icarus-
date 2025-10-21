/**
 * 🔔 NOTIFICATIONS — MIGRATIONS SUPABASE
 * 
 * Migrações para criar todas as tabelas necessárias para o sistema de notificações
 */

-- ============================================
-- TABELA: notifications (In-App)
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'IN_APP',
  subject TEXT,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  metadata JSONB,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_read (read),
  INDEX idx_notifications_priority (priority),
  INDEX idx_notifications_created (created_at)
);

COMMENT ON TABLE notifications IS 'Notificações in-app para usuários';

-- ============================================
-- TABELA: notification_queue (Agendadas)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_notification_queue_scheduled (scheduled_for)
);

COMMENT ON TABLE notification_queue IS 'Fila de notificações agendadas';

-- ============================================
-- TABELA: notification_retry (Falhas)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_retry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payload JSONB NOT NULL,
  retry_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_notification_retry_retry_at (retry_at),
  INDEX idx_notification_retry_attempts (attempts)
);

COMMENT ON TABLE notification_retry IS 'Fila de retry para notificações que falharam';

-- ============================================
-- TABELA: notification_log (Histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  channel TEXT NOT NULL,
  to_address TEXT NOT NULL, -- email, phone, user_id
  subject TEXT,
  message TEXT NOT NULL,
  priority TEXT,
  status TEXT NOT NULL, -- sent, failed, pending
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  INDEX idx_notification_log_user (user_id),
  INDEX idx_notification_log_channel (channel),
  INDEX idx_notification_log_status (status),
  INDEX idx_notification_log_sent (sent_at)
);

COMMENT ON TABLE notification_log IS 'Log histórico de todas as notificações enviadas';

-- ============================================
-- TABELA: workflow_instances (Instâncias)
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  current_state_id TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to TEXT,
  assigned_to_name TEXT,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  metadata JSONB,
  
  -- Índices
  INDEX idx_workflow_instances_workflow (workflow_id),
  INDEX idx_workflow_instances_entity (entity_type, entity_id),
  INDEX idx_workflow_instances_state (current_state_id),
  INDEX idx_workflow_instances_assigned (assigned_to),
  INDEX idx_workflow_instances_created_by (created_by),
  INDEX idx_workflow_instances_due_date (due_date)
);

COMMENT ON TABLE workflow_instances IS 'Instâncias de workflows em execução';

-- ============================================
-- TABELA: workflow_history (Histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  from_state_id TEXT NOT NULL,
  to_state_id TEXT NOT NULL,
  action_id TEXT,
  executed_by TEXT NOT NULL,
  executed_by_name TEXT NOT NULL,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comment TEXT,
  metadata JSONB,
  
  -- Índices
  INDEX idx_workflow_history_instance (instance_id),
  INDEX idx_workflow_history_executed_by (executed_by),
  INDEX idx_workflow_history_executed_at (executed_at)
);

COMMENT ON TABLE workflow_history IS 'Histórico completo de todas as transições de workflow';

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_workflow_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_instance_updated_at();

-- ============================================
-- TRIGGERS: auto read notification
-- ============================================

CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND OLD.read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_mark_read
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_read();

-- ============================================
-- RLS (ROW LEVEL SECURITY)
-- ============================================

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;

-- Políticas: Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view assigned workflows"
  ON workflow_instances FOR SELECT
  USING (
    auth.uid()::TEXT = assigned_to OR
    auth.uid()::TEXT = created_by OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()::TEXT
      AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can view workflow history"
  ON workflow_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflow_instances
      WHERE id = workflow_history.instance_id
      AND (
        assigned_to = auth.uid()::TEXT OR
        created_by = auth.uid()::TEXT
      )
    )
  );

-- Service role tem acesso total
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_retry ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only service role can access queue"
  ON notification_queue FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access retry"
  ON notification_retry FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can access log"
  ON notification_log FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Notificações não lidas por usuário
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
  user_id,
  COUNT(*) AS unread_count,
  MAX(created_at) AS last_notification_at
FROM notifications
WHERE read = FALSE
GROUP BY user_id;

COMMENT ON VIEW unread_notifications IS 'Contagem de notificações não lidas por usuário';

-- View: Workflows por estado
CREATE OR REPLACE VIEW workflows_by_state AS
SELECT 
  workflow_id,
  current_state_id,
  COUNT(*) AS instance_count,
  COUNT(CASE WHEN priority = 'urgent' THEN 1 END) AS urgent_count,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) AS high_count
FROM workflow_instances
GROUP BY workflow_id, current_state_id;

COMMENT ON VIEW workflows_by_state IS 'Contagem de instâncias por workflow e estado';

-- View: Workflows atrasados
CREATE OR REPLACE VIEW overdue_workflows AS
SELECT 
  wi.*,
  EXTRACT(DAY FROM (NOW() - wi.due_date)) AS days_overdue
FROM workflow_instances wi
WHERE wi.due_date < NOW()
  AND wi.current_state_id NOT IN (
    SELECT id FROM unnest(ARRAY['CONCLUIDA', 'CANCELADA', 'ENCERRADO', 'ARQUIVADO']) AS id
  )
ORDER BY wi.due_date ASC;

COMMENT ON VIEW overdue_workflows IS 'Workflows com prazo vencido';

-- ============================================
-- FUNCTIONS ÚTEIS
-- ============================================

-- Function: Obter métricas de workflow
CREATE OR REPLACE FUNCTION get_workflow_metrics(p_workflow_id TEXT)
RETURNS TABLE (
  total_instances BIGINT,
  active_instances BIGINT,
  completed_instances BIGINT,
  avg_completion_time INTERVAL,
  states_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_instances,
    COUNT(CASE WHEN current_state_id NOT IN ('CONCLUIDA', 'CANCELADA', 'ENCERRADO', 'ARQUIVADO') THEN 1 END) AS active_instances,
    COUNT(CASE WHEN current_state_id IN ('CONCLUIDA', 'ENCERRADO', 'ARQUIVADO') THEN 1 END) AS completed_instances,
    AVG(updated_at - created_at) FILTER (WHERE current_state_id IN ('CONCLUIDA', 'ENCERRADO', 'ARQUIVADO')) AS avg_completion_time,
    jsonb_object_agg(current_state_id, state_count) AS states_distribution
  FROM (
    SELECT
      current_state_id,
      COUNT(*) AS state_count
    FROM workflow_instances
    WHERE workflow_id = p_workflow_id
    GROUP BY current_state_id
  ) AS states
  WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_workflow_metrics IS 'Obter métricas de um workflow';

-- ============================================
-- GRANTS
-- ============================================

-- Permitir que authenticated users acessem as tabelas
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON workflow_instances TO authenticated;
GRANT SELECT ON workflow_history TO authenticated;

-- Service role tem acesso total
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- FIM DA MIGRAÇÃO
-- ============================================

