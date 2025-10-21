-- =====================================================
-- BLOCO 1.3: API Gateway - Gerenciamento de Integrações
-- Sistema completo para gerenciar APIs externas
-- 
-- FUNCIONALIDADES:
-- - Rate limiting por endpoint e usuário
-- - Circuit breaker (proteção contra falhas em cascata)
-- - Cache inteligente de respostas
-- - Monitoramento de health e performance
-- - Retry automático com backoff exponencial
-- - Logs de requisições para auditoria
-- 
-- APIS GERENCIADAS:
-- - SEFAZ (NF-e, consultas)
-- - ANVISA (validação de registros, rastreabilidade)
-- - CFM (validação de CRM)
-- - Receita Federal (CNPJ, CPF)
-- - ViaCEP (endereços)
-- - Infosimples (validações avançadas)
-- =====================================================

-- =====================================================
-- TABELA: api_endpoints (Endpoints configurados)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(100) NOT NULL UNIQUE, -- Ex: 'sefaz_nfe_emitir', 'anvisa_consultar_registro'
  descricao TEXT,
  
  -- Configuração
  servico VARCHAR(50) NOT NULL, -- 'sefaz', 'anvisa', 'cfm', 'receita_federal', 'viacep', 'infosimples'
  metodo VARCHAR(10) NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  url_base TEXT NOT NULL,
  url_path TEXT NOT NULL,
  
  -- Headers padrão (JSONB para flexibilidade)
  headers_default JSONB DEFAULT '{}',
  
  -- Autenticação
  auth_tipo VARCHAR(20) CHECK (auth_tipo IN ('none', 'api_key', 'bearer', 'basic', 'oauth2', 'certificate')),
  auth_config JSONB, -- Configuração específica de auth
  
  -- Rate Limiting
  rate_limit_requests INTEGER DEFAULT 100, -- Requisições permitidas
  rate_limit_window INTEGER DEFAULT 60, -- Janela em segundos (ex: 100 req/60s)
  rate_limit_per_user BOOLEAN DEFAULT FALSE, -- Se true, limite é por usuário
  
  -- Circuit Breaker
  circuit_breaker_threshold INTEGER DEFAULT 5, -- Falhas consecutivas para abrir circuito
  circuit_breaker_timeout INTEGER DEFAULT 60, -- Segundos antes de tentar reabrir
  circuit_breaker_enabled BOOLEAN DEFAULT TRUE,
  
  -- Cache
  cache_enabled BOOLEAN DEFAULT FALSE,
  cache_ttl INTEGER DEFAULT 300, -- Segundos (5 min default)
  cache_key_fields TEXT[], -- Campos da request para gerar chave de cache
  
  -- Retry
  retry_enabled BOOLEAN DEFAULT TRUE,
  retry_max_attempts INTEGER DEFAULT 3,
  retry_backoff_ms INTEGER DEFAULT 1000, -- Backoff inicial em ms
  
  -- Timeout
  timeout_ms INTEGER DEFAULT 30000, -- 30 segundos default
  
  -- Monitoramento
  health_check_enabled BOOLEAN DEFAULT TRUE,
  health_check_interval INTEGER DEFAULT 300, -- Segundos (5 min)
  
  -- Criticidade (para priorização e alertas)
  criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[], -- Ex: ['fiscal', 'regulatorio', 'validacao']
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  updated_by UUID REFERENCES auth.users(id)
);

-- =====================================================
-- TABELA: api_requests_log (Log de requisições)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_requests_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Endpoint
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  endpoint_nome VARCHAR(100),
  
  -- Usuário (pode ser NULL para chamadas de sistema)
  user_id UUID REFERENCES auth.users(id),
  
  -- Request
  request_method VARCHAR(10),
  request_url TEXT,
  request_headers JSONB,
  request_body JSONB,
  request_params JSONB,
  
  -- Response
  response_status INTEGER,
  response_body JSONB,
  response_headers JSONB,
  response_time_ms INTEGER, -- Tempo de resposta em milissegundos
  
  -- Cache
  from_cache BOOLEAN DEFAULT FALSE,
  
  -- Retry
  retry_attempt INTEGER DEFAULT 0,
  
  -- Circuit Breaker
  circuit_breaker_state VARCHAR(20), -- 'closed', 'open', 'half_open'
  
  -- Erro
  error_message TEXT,
  error_stack TEXT,
  
  -- IP e contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_rate_limits (Controle de rate limiting)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL = rate limit global
  
  -- Contadores
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Status
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(endpoint_id, user_id)
);

-- =====================================================
-- TABELA: api_circuit_breaker (Estado do circuit breaker)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_circuit_breaker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE UNIQUE,
  
  -- Estado
  state VARCHAR(20) NOT NULL DEFAULT 'closed' CHECK (state IN ('closed', 'open', 'half_open')),
  
  -- Contadores
  failure_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  
  -- Timestamps
  last_failure_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE, -- Quando o circuito abriu
  next_attempt_at TIMESTAMP WITH TIME ZONE, -- Quando pode tentar reabrir
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_cache (Cache de respostas)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  
  -- Chave de cache (gerada a partir dos parâmetros da request)
  cache_key VARCHAR(500) NOT NULL,
  
  -- Response cacheada
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  response_headers JSONB,
  
  -- TTL
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_hit_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(endpoint_id, cache_key)
);

-- =====================================================
-- TABELA: api_health_checks (Monitoramento de saúde)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_health_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
  
  -- Status
  is_healthy BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  
  -- Detalhes
  status_code INTEGER,
  error_message TEXT,
  
  -- Timestamp
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABELA: api_alerts (Alertas de problemas)
-- =====================================================
CREATE TABLE IF NOT EXISTS api_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  endpoint_nome VARCHAR(100),
  
  -- Tipo de alerta
  tipo VARCHAR(50) NOT NULL, -- 'high_error_rate', 'circuit_open', 'rate_limit_exceeded', 'slow_response', 'api_down'
  
  -- Severidade
  severidade VARCHAR(20) NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  
  -- Mensagem
  mensagem TEXT NOT NULL,
  detalhes JSONB,
  
  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Notificação
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_channels TEXT[], -- Ex: ['email', 'slack', 'sms']
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_api_endpoints_servico ON api_endpoints(servico);
CREATE INDEX idx_api_endpoints_active ON api_endpoints(is_active);
CREATE INDEX idx_api_requests_log_endpoint_id ON api_requests_log(endpoint_id);
CREATE INDEX idx_api_requests_log_user_id ON api_requests_log(user_id);
CREATE INDEX idx_api_requests_log_created_at ON api_requests_log(created_at);
CREATE INDEX idx_api_requests_log_status ON api_requests_log(response_status);
CREATE INDEX idx_api_rate_limits_endpoint_user ON api_rate_limits(endpoint_id, user_id);
CREATE INDEX idx_api_circuit_breaker_endpoint ON api_circuit_breaker(endpoint_id);
CREATE INDEX idx_api_circuit_breaker_state ON api_circuit_breaker(state);
CREATE INDEX idx_api_cache_endpoint_key ON api_cache(endpoint_id, cache_key);
CREATE INDEX idx_api_cache_expires_at ON api_cache(expires_at);
CREATE INDEX idx_api_health_checks_endpoint ON api_health_checks(endpoint_id);
CREATE INDEX idx_api_health_checks_checked_at ON api_health_checks(checked_at);
CREATE INDEX idx_api_alerts_endpoint ON api_alerts(endpoint_id);
CREATE INDEX idx_api_alerts_resolved ON api_alerts(is_resolved);
CREATE INDEX idx_api_alerts_created_at ON api_alerts(created_at);

-- =====================================================
-- FUNCTION: Verificar rate limit
-- =====================================================
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_endpoint_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_endpoint RECORD;
  v_rate_limit RECORD;
  v_window_expired BOOLEAN;
BEGIN
  -- Obter configuração do endpoint
  SELECT * INTO v_endpoint FROM api_endpoints WHERE id = p_endpoint_id AND is_active = TRUE;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- Endpoint não encontrado ou inativo
  END IF;
  
  -- Verificar se existe registro de rate limit
  SELECT * INTO v_rate_limit FROM api_rate_limits
  WHERE endpoint_id = p_endpoint_id
    AND (user_id = p_user_id OR (user_id IS NULL AND p_user_id IS NULL));
  
  IF NOT FOUND THEN
    -- Criar novo registro
    INSERT INTO api_rate_limits (endpoint_id, user_id, request_count, window_start)
    VALUES (p_endpoint_id, p_user_id, 1, NOW());
    RETURN TRUE;
  END IF;
  
  -- Verificar se janela expirou
  v_window_expired := (EXTRACT(EPOCH FROM (NOW() - v_rate_limit.window_start)) > v_endpoint.rate_limit_window);
  
  IF v_window_expired THEN
    -- Resetar contador
    UPDATE api_rate_limits
    SET request_count = 1, window_start = NOW(), is_blocked = FALSE, blocked_until = NULL
    WHERE id = v_rate_limit.id;
    RETURN TRUE;
  END IF;
  
  -- Verificar se bloqueado
  IF v_rate_limit.is_blocked AND v_rate_limit.blocked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se excedeu limite
  IF v_rate_limit.request_count >= v_endpoint.rate_limit_requests THEN
    -- Bloquear
    UPDATE api_rate_limits
    SET is_blocked = TRUE, blocked_until = NOW() + (v_endpoint.rate_limit_window || ' seconds')::INTERVAL
    WHERE id = v_rate_limit.id;
    RETURN FALSE;
  END IF;
  
  -- Incrementar contador
  UPDATE api_rate_limits
  SET request_count = request_count + 1
  WHERE id = v_rate_limit.id;
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- FUNCTION: Atualizar circuit breaker
-- =====================================================
CREATE OR REPLACE FUNCTION update_circuit_breaker(
  p_endpoint_id UUID,
  p_success BOOLEAN
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_endpoint RECORD;
  v_breaker RECORD;
  v_new_state VARCHAR;
BEGIN
  -- Obter configuração do endpoint
  SELECT * INTO v_endpoint FROM api_endpoints WHERE id = p_endpoint_id;
  
  IF NOT v_endpoint.circuit_breaker_enabled THEN
    RETURN 'disabled';
  END IF;
  
  -- Obter ou criar registro de circuit breaker
  SELECT * INTO v_breaker FROM api_circuit_breaker WHERE endpoint_id = p_endpoint_id;
  
  IF NOT FOUND THEN
    INSERT INTO api_circuit_breaker (endpoint_id, state, failure_count, success_count)
    VALUES (p_endpoint_id, 'closed', 0, 0)
    RETURNING * INTO v_breaker;
  END IF;
  
  v_new_state := v_breaker.state;
  
  IF p_success THEN
    -- Sucesso
    IF v_breaker.state = 'half_open' THEN
      -- Reabrindo circuito
      v_new_state := 'closed';
      UPDATE api_circuit_breaker
      SET state = v_new_state, success_count = success_count + 1, failure_count = 0, last_success_at = NOW(), updated_at = NOW()
      WHERE endpoint_id = p_endpoint_id;
    ELSE
      -- Estado normal
      UPDATE api_circuit_breaker
      SET success_count = success_count + 1, last_success_at = NOW(), updated_at = NOW()
      WHERE endpoint_id = p_endpoint_id;
    END IF;
  ELSE
    -- Falha
    UPDATE api_circuit_breaker
    SET failure_count = failure_count + 1, last_failure_at = NOW(), updated_at = NOW()
    WHERE endpoint_id = p_endpoint_id;
    
    -- Verificar se deve abrir circuito
    IF v_breaker.failure_count + 1 >= v_endpoint.circuit_breaker_threshold THEN
      v_new_state := 'open';
      UPDATE api_circuit_breaker
      SET state = v_new_state,
          opened_at = NOW(),
          next_attempt_at = NOW() + (v_endpoint.circuit_breaker_timeout || ' seconds')::INTERVAL
      WHERE endpoint_id = p_endpoint_id;
      
      -- Criar alerta
      INSERT INTO api_alerts (endpoint_id, endpoint_nome, tipo, severidade, mensagem, detalhes)
      SELECT p_endpoint_id, nome, 'circuit_open', 'alta',
             'Circuit breaker aberto após ' || v_endpoint.circuit_breaker_threshold || ' falhas consecutivas',
             jsonb_build_object('threshold', v_endpoint.circuit_breaker_threshold, 'timeout', v_endpoint.circuit_breaker_timeout)
      FROM api_endpoints WHERE id = p_endpoint_id;
    END IF;
  END IF;
  
  RETURN v_new_state;
END;
$$;

-- =====================================================
-- FUNCTION: Obter do cache ou NULL
-- =====================================================
CREATE OR REPLACE FUNCTION get_from_cache(
  p_endpoint_id UUID,
  p_cache_key VARCHAR
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_cache RECORD;
BEGIN
  SELECT * INTO v_cache FROM api_cache
  WHERE endpoint_id = p_endpoint_id
    AND cache_key = p_cache_key
    AND expires_at > NOW();
  
  IF FOUND THEN
    -- Incrementar hit count
    UPDATE api_cache
    SET hit_count = hit_count + 1, last_hit_at = NOW()
    WHERE id = v_cache.id;
    
    RETURN jsonb_build_object(
      'status', v_cache.response_status,
      'body', v_cache.response_body,
      'headers', v_cache.response_headers
    );
  END IF;
  
  RETURN NULL;
END;
$$;

-- =====================================================
-- FUNCTION: Salvar no cache
-- =====================================================
CREATE OR REPLACE FUNCTION save_to_cache(
  p_endpoint_id UUID,
  p_cache_key VARCHAR,
  p_response_status INTEGER,
  p_response_body JSONB,
  p_response_headers JSONB,
  p_ttl INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO api_cache (endpoint_id, cache_key, response_status, response_body, response_headers, expires_at)
  VALUES (p_endpoint_id, p_cache_key, p_response_status, p_response_body, p_response_headers, NOW() + (p_ttl || ' seconds')::INTERVAL)
  ON CONFLICT (endpoint_id, cache_key)
  DO UPDATE SET
    response_status = EXCLUDED.response_status,
    response_body = EXCLUDED.response_body,
    response_headers = EXCLUDED.response_headers,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();
END;
$$;

-- =====================================================
-- FUNCTION: Limpar cache expirado
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- =====================================================
-- VIEW: vw_api_metrics (Métricas por endpoint)
-- =====================================================
CREATE OR REPLACE VIEW vw_api_metrics AS
SELECT
  e.id AS endpoint_id,
  e.nome AS endpoint_nome,
  e.servico,
  e.criticidade,
  COUNT(rl.id) AS total_requests,
  COUNT(rl.id) FILTER (WHERE rl.response_status >= 200 AND rl.response_status < 300) AS success_count,
  COUNT(rl.id) FILTER (WHERE rl.response_status >= 400) AS error_count,
  ROUND(AVG(rl.response_time_ms)::NUMERIC, 2) AS avg_response_time_ms,
  MAX(rl.response_time_ms) AS max_response_time_ms,
  MIN(rl.response_time_ms) AS min_response_time_ms,
  COUNT(rl.id) FILTER (WHERE rl.from_cache = TRUE) AS cache_hits,
  ROUND(
    (COUNT(rl.id) FILTER (WHERE rl.from_cache = TRUE)::NUMERIC / NULLIF(COUNT(rl.id), 0)) * 100,
    2
  ) AS cache_hit_rate_percent,
  cb.state AS circuit_breaker_state,
  cb.failure_count AS circuit_breaker_failures,
  (SELECT COUNT(*) FROM api_alerts WHERE endpoint_id = e.id AND is_resolved = FALSE) AS active_alerts
FROM api_endpoints e
LEFT JOIN api_requests_log rl ON e.id = rl.endpoint_id
LEFT JOIN api_circuit_breaker cb ON e.id = cb.endpoint_id
GROUP BY e.id, e.nome, e.servico, e.criticidade, cb.state, cb.failure_count;

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_circuit_breaker ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_alerts ENABLE ROW LEVEL SECURITY;

-- Políticas: Admins podem ver tudo
CREATE POLICY "Admins podem gerenciar endpoints" ON api_endpoints FOR ALL
USING (
  EXISTS(
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.nome IN ('admin', 'ti_admin')
      AND ur.is_active = TRUE
  )
);

-- Políticas: Usuários podem ver seus próprios logs
CREATE POLICY "Usuários podem ver seus logs" ON api_requests_log FOR SELECT
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT ur.user_id FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.nome IN ('admin', 'ti_admin', 'auditor_interno')
));

-- =====================================================
-- SEED: Endpoints principais
-- =====================================================
INSERT INTO api_endpoints (nome, descricao, servico, metodo, url_base, url_path, auth_tipo, rate_limit_requests, rate_limit_window, cache_enabled, cache_ttl, criticidade, tags) VALUES
-- SEFAZ
('sefaz_nfe_emitir', 'Emissão de NF-e via SEFAZ', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/NfeAutorizacao/NFeAutorizacao4.asmx', 'certificate', 50, 60, FALSE, 0, 'critica', ARRAY['fiscal', 'nfe']),
('sefaz_nfe_consultar', 'Consulta de NF-e autorizada', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/NfeConsulta/NfeConsulta4.asmx', 'certificate', 100, 60, TRUE, 300, 'alta', ARRAY['fiscal', 'nfe']),
('sefaz_nfe_cancelar', 'Cancelamento de NF-e', 'sefaz', 'POST', 'https://nfe.sefaz.rs.gov.br', '/ws/RecepcaoEvento/RecepcaoEvento4.asmx', 'certificate', 20, 60, FALSE, 0, 'critica', ARRAY['fiscal', 'nfe']),

-- ANVISA
('anvisa_consultar_registro', 'Consultar registro de produto ANVISA', 'anvisa', 'GET', 'https://consultas.anvisa.gov.br', '/api/consulta/medicamentos', 'none', 200, 60, TRUE, 3600, 'alta', ARRAY['regulatorio', 'anvisa']),
('anvisa_rastreabilidade', 'Rastreabilidade de medicamentos/dispositivos', 'anvisa', 'POST', 'https://sngpc.anvisa.gov.br', '/api/rastreabilidade', 'api_key', 100, 60, FALSE, 0, 'critica', ARRAY['regulatorio', 'anvisa', 'rastreabilidade']),

-- CFM
('cfm_consultar_medico', 'Consultar CRM de médico', 'cfm', 'GET', 'https://portal.cfm.org.br', '/busca-medicos', 'none', 50, 60, TRUE, 86400, 'media', ARRAY['validacao', 'cfm']),

-- Receita Federal
('receita_consultar_cnpj', 'Consultar dados de CNPJ', 'receita_federal', 'GET', 'https://brasilapi.com.br', '/api/cnpj/v1/{cnpj}', 'none', 300, 60, TRUE, 86400, 'media', ARRAY['validacao', 'receita']),
('receita_consultar_cpf', 'Consultar dados de CPF', 'receita_federal', 'GET', 'https://brasilapi.com.br', '/api/cpf/v1/{cpf}', 'none', 300, 60, TRUE, 86400, 'media', ARRAY['validacao', 'receita']),

-- ViaCEP
('viacep_consultar', 'Consultar endereço por CEP', 'viacep', 'GET', 'https://viacep.com.br', '/ws/{cep}/json/', 'none', 500, 60, TRUE, 2592000, 'baixa', ARRAY['validacao', 'cep']),

-- Infosimples
('infosimples_cnpj_completo', 'Consulta completa de CNPJ (Infosimples)', 'infosimples', 'GET', 'https://api.infosimples.com', '/api/v2/consultas/receita-federal/cnpj', 'api_key', 100, 60, TRUE, 86400, 'alta', ARRAY['validacao', 'receita', 'premium'])

ON CONFLICT (nome) DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE api_endpoints IS 'Endpoints de APIs externas configurados (SEFAZ, ANVISA, CFM, etc.)';
COMMENT ON TABLE api_requests_log IS 'Log de todas as requisições a APIs externas para auditoria';
COMMENT ON TABLE api_rate_limits IS 'Controle de rate limiting por endpoint e usuário';
COMMENT ON TABLE api_circuit_breaker IS 'Estado do circuit breaker para proteção contra falhas';
COMMENT ON TABLE api_cache IS 'Cache de respostas de APIs para performance';
COMMENT ON TABLE api_health_checks IS 'Monitoramento de saúde dos endpoints externos';
COMMENT ON TABLE api_alerts IS 'Alertas de problemas com APIs externas';

COMMENT ON FUNCTION check_rate_limit IS 'Verifica se pode fazer requisição (rate limit)';
COMMENT ON FUNCTION update_circuit_breaker IS 'Atualiza estado do circuit breaker após requisição';
COMMENT ON FUNCTION get_from_cache IS 'Obtém resposta do cache se disponível';
COMMENT ON FUNCTION save_to_cache IS 'Salva resposta no cache';
COMMENT ON FUNCTION cleanup_expired_cache IS 'Limpa cache expirado (executar periodicamente)';

