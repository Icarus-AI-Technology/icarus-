-- =====================================================
-- BLOCO 4: ADVANCED FEATURES - Consolidado
-- Sistema completo de funcionalidades avançadas
-- 
-- MÓDULOS INTEGRADOS:
-- 4.1: System Health Dashboard - Monitoramento infraestrutura
-- 4.2: Notificações Inteligentes - Push/Email/SMS
-- 4.3: Logs & Auditoria Avançada - Rastreabilidade completa
-- 4.4: Backup & Recovery - Proteção de dados
-- 4.5: Performance Metrics - APM (Application Performance Monitoring)
-- 4.6: Segurança Avançada - 2FA, IP Whitelist, Rate Limiting
-- =====================================================

-- =====================================================
-- 4.1: SYSTEM HEALTH - Monitoramento de Infraestrutura
-- =====================================================

CREATE TABLE IF NOT EXISTS system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CPU & Memória (do servidor)
  cpu_usage_percent DECIMAL(5,2),
  memory_usage_percent DECIMAL(5,2),
  disk_usage_percent DECIMAL(5,2),
  
  -- Banco de Dados (Supabase)
  db_connections_active INTEGER,
  db_connections_idle INTEGER,
  db_size_mb DECIMAL(15,2),
  db_query_avg_time_ms DECIMAL(10,2),
  
  -- APIs Externas
  api_sefaz_status VARCHAR(20), -- 'online', 'offline', 'degraded'
  api_anvisa_status VARCHAR(20),
  api_sefaz_response_time_ms INTEGER,
  api_anvisa_response_time_ms INTEGER,
  
  -- Aplicação
  total_users_online INTEGER,
  total_requests_per_minute INTEGER,
  error_rate_percent DECIMAL(5,2),
  
  -- Storage (Supabase Storage)
  storage_usage_gb DECIMAL(10,2),
  storage_limit_gb DECIMAL(10,2)
);

CREATE INDEX idx_health_timestamp ON system_health_metrics(timestamp DESC);

-- =====================================================
-- 4.2: NOTIFICAÇÕES INTELIGENTES
-- =====================================================

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Destinatário
  user_id UUID REFERENCES auth.users(id),
  
  -- Tipo
  tipo VARCHAR(30) NOT NULL, -- 'info', 'warning', 'error', 'success'
  canal VARCHAR(30) NOT NULL, -- 'in_app', 'email', 'sms', 'push'
  
  -- Conteúdo
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  
  -- Ação (link para clicar)
  action_url TEXT,
  action_label VARCHAR(100),
  
  -- Contexto (para agrupamento)
  contexto VARCHAR(50), -- 'pedido', 'nfe', 'licitacao', 'estoque'
  contexto_id UUID,
  
  -- Status
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMP WITH TIME ZONE,
  
  -- Envio
  enviada BOOLEAN DEFAULT FALSE,
  enviada_em TIMESTAMP WITH TIME ZONE,
  erro_envio TEXT,
  
  -- Prioridade
  prioridade VARCHAR(20) DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'urgente'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Expira após X dias
);

CREATE INDEX idx_notificacoes_user ON notificacoes(user_id, lida);
CREATE INDEX idx_notificacoes_created ON notificacoes(created_at DESC);
CREATE INDEX idx_notificacoes_contexto ON notificacoes(contexto, contexto_id);

-- =====================================================
-- 4.3: LOGS & AUDITORIA AVANÇADA
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs_advanced (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usuário
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  user_ip_address INET,
  user_agent TEXT,
  
  -- Ação
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT'
  resource_type VARCHAR(50) NOT NULL, -- 'nfe', 'pedido', 'usuario', 'licitacao'
  resource_id UUID,
  
  -- Dados
  old_data JSONB, -- Estado anterior (UPDATE/DELETE)
  new_data JSONB, -- Estado novo (CREATE/UPDATE)
  changes JSONB, -- Apenas campos alterados
  
  -- Contexto
  session_id UUID,
  request_id UUID,
  
  -- Resultado
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'denied'
  error_message TEXT,
  
  -- Compliance (LGPD)
  data_retention_until DATE -- Data até quando manter log
);

CREATE INDEX idx_audit_timestamp ON audit_logs_advanced(timestamp DESC);
CREATE INDEX idx_audit_user ON audit_logs_advanced(user_id);
CREATE INDEX idx_audit_resource ON audit_logs_advanced(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_logs_advanced(action);

-- =====================================================
-- 4.4: BACKUP & RECOVERY
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(30) NOT NULL, -- 'full', 'incremental', 'differential'
  
  -- Escopo
  tabelas TEXT[], -- Tabelas incluídas no backup
  total_registros BIGINT,
  tamanho_bytes BIGINT,
  
  -- Storage
  storage_url TEXT NOT NULL, -- Supabase Storage ou S3
  storage_hash VARCHAR(64), -- SHA-256 para verificação
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'em_progresso',
  -- 'em_progresso', 'concluido', 'erro', 'corrompido'
  
  -- Tempos
  iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluido_em TIMESTAMP WITH TIME ZONE,
  duracao_segundos INTEGER,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  
  -- Retenção
  expires_at TIMESTAMP WITH TIME ZONE -- Expira após X dias
);

CREATE INDEX idx_backups_tipo ON backups(tipo);
CREATE INDEX idx_backups_status ON backups(status);
CREATE INDEX idx_backups_created ON backups(iniciado_em DESC);

-- =====================================================
-- 4.5: PERFORMANCE METRICS (APM)
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timestamp
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Request
  route VARCHAR(200) NOT NULL, -- '/api/pedidos', '/api/nfes'
  method VARCHAR(10) NOT NULL, -- 'GET', 'POST', 'PUT', 'DELETE'
  
  -- Tempos (milliseconds)
  response_time_ms INTEGER NOT NULL,
  db_query_time_ms INTEGER,
  external_api_time_ms INTEGER,
  
  -- Status
  status_code INTEGER NOT NULL, -- 200, 404, 500, etc.
  
  -- Usuário (opcional)
  user_id UUID REFERENCES auth.users(id),
  
  -- Erro (se houver)
  error_message TEXT,
  error_stack TEXT
);

CREATE INDEX idx_perf_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX idx_perf_route ON performance_metrics(route);
CREATE INDEX idx_perf_status ON performance_metrics(status_code);

-- =====================================================
-- 4.6: SEGURANÇA AVANÇADA
-- =====================================================

-- 2FA (Two-Factor Authentication)
CREATE TABLE IF NOT EXISTS user_2fa (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  secret VARCHAR(100) NOT NULL, -- TOTP secret
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[], -- Códigos de backup
  
  enabled_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- IP Whitelist
CREATE TABLE IF NOT EXISTS ip_whitelist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  ip_address INET NOT NULL UNIQUE,
  descricao VARCHAR(200),
  
  is_ativo BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Rate Limiting (por usuário)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  
  route VARCHAR(200) NOT NULL,
  
  -- Contadores
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Limites
  max_requests_per_minute INTEGER DEFAULT 60,
  
  -- Bloqueio
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_rate_limits_user ON rate_limits(user_id, route);
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);

-- =====================================================
-- VIEWS
-- =====================================================

-- System Health (últimos 5 minutos)
CREATE OR REPLACE VIEW vw_system_health_current AS
SELECT
  AVG(cpu_usage_percent) AS avg_cpu,
  AVG(memory_usage_percent) AS avg_memory,
  AVG(disk_usage_percent) AS avg_disk,
  MAX(db_connections_active) AS max_db_connections,
  AVG(db_query_avg_time_ms) AS avg_query_time,
  SUM(total_requests_per_minute) AS total_requests,
  AVG(error_rate_percent) AS avg_error_rate
FROM system_health_metrics
WHERE timestamp >= NOW() - INTERVAL '5 minutes';

-- Notificações não lidas por usuário
CREATE OR REPLACE VIEW vw_notificacoes_nao_lidas AS
SELECT
  user_id,
  COUNT(*) AS total_nao_lidas,
  COUNT(*) FILTER (WHERE prioridade = 'urgente') AS urgentes,
  COUNT(*) FILTER (WHERE prioridade = 'alta') AS altas
FROM notificacoes
WHERE lida = FALSE AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY user_id;

-- Performance lenta (> 1 segundo)
CREATE OR REPLACE VIEW vw_slow_queries AS
SELECT
  route,
  method,
  AVG(response_time_ms) AS avg_response_time,
  MAX(response_time_ms) AS max_response_time,
  COUNT(*) AS total_requests
FROM performance_metrics
WHERE timestamp >= NOW() - INTERVAL '1 hour'
  AND response_time_ms > 1000
GROUP BY route, method
ORDER BY avg_response_time DESC;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Criar notificação
CREATE OR REPLACE FUNCTION criar_notificacao(
  p_user_id UUID,
  p_tipo VARCHAR,
  p_canal VARCHAR,
  p_titulo VARCHAR,
  p_mensagem TEXT,
  p_contexto VARCHAR DEFAULT NULL,
  p_contexto_id UUID DEFAULT NULL,
  p_prioridade VARCHAR DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notificacao_id UUID;
BEGIN
  INSERT INTO notificacoes (
    user_id, tipo, canal, titulo, mensagem,
    contexto, contexto_id, prioridade,
    expires_at
  ) VALUES (
    p_user_id, p_tipo, p_canal, p_titulo, p_mensagem,
    p_contexto, p_contexto_id, p_prioridade,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO v_notificacao_id;
  
  RETURN v_notificacao_id;
END;
$$;

-- Marcar notificação como lida
CREATE OR REPLACE FUNCTION marcar_notificacao_lida(p_notificacao_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notificacoes
  SET lida = TRUE, lida_em = NOW()
  WHERE id = p_notificacao_id AND user_id = auth.uid();
END;
$$;

-- Registrar log de auditoria
CREATE OR REPLACE FUNCTION log_audit(
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs_advanced (
    user_id, user_email, action, resource_type, resource_id,
    old_data, new_data, status,
    data_retention_until
  )
  SELECT
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_data,
    p_new_data,
    'success',
    NOW() + INTERVAL '5 years' -- LGPD: 5 anos
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Criar backup
CREATE OR REPLACE FUNCTION criar_backup(
  p_nome VARCHAR,
  p_tipo VARCHAR,
  p_tabelas TEXT[]
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_backup_id UUID;
BEGIN
  INSERT INTO backups (
    nome, tipo, tabelas, status,
    created_by, expires_at
  ) VALUES (
    p_nome, p_tipo, p_tabelas, 'em_progresso',
    auth.uid(), NOW() + INTERVAL '90 days'
  )
  RETURNING id INTO v_backup_id;
  
  -- Aqui seria acionado um job para executar o backup real
  
  RETURN v_backup_id;
END;
$$;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_advanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Usuários veem apenas suas notificações
CREATE POLICY "Usuários veem suas notificações" ON notificacoes FOR SELECT
USING (user_id = auth.uid());

-- Apenas admins veem audit logs
CREATE POLICY "Admins veem audit logs" ON audit_logs_advanced FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'auditor_interno', 'ti')
  )
);

-- Apenas admins gerenciam backups
CREATE POLICY "Admins gerenciam backups" ON backups FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'ti')
  )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE system_health_metrics IS 'Métricas de saúde do sistema (CPU, memória, DB, APIs)';
COMMENT ON TABLE notificacoes IS 'Notificações inteligentes (in-app, email, SMS, push)';
COMMENT ON TABLE audit_logs_advanced IS 'Logs de auditoria avançados (LGPD Art. 37)';
COMMENT ON TABLE backups IS 'Backups automáticos e manuais';
COMMENT ON TABLE performance_metrics IS 'APM - Application Performance Monitoring';
COMMENT ON TABLE user_2fa IS '2FA - Two-Factor Authentication (TOTP)';
COMMENT ON TABLE ip_whitelist IS 'IP Whitelist para acesso restrito';
COMMENT ON TABLE rate_limits IS 'Rate limiting por usuário/IP';

