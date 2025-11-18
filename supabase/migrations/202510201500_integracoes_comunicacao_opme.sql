-- Migration: Configurações de Integrações de Comunicação e Fabricantes OPME
-- Data: 20/10/2025
-- Descrição: Adiciona endpoints e configurações para Twilio, WhatsApp, SendGrid, Mailchimp e Fabricantes OPME

-- =====================================================
-- TABELA API_ENDPOINTS
-- =====================================================

CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  servico TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  url_base TEXT NOT NULL,
  url_path TEXT NOT NULL,
  auth_tipo TEXT CHECK (auth_tipo IN ('none', 'basic', 'bearer', 'api_key', 'oauth2')),
  auth_config JSONB DEFAULT '{}'::jsonb,
  rate_limit_requests INTEGER DEFAULT 100,
  rate_limit_window INTEGER DEFAULT 60,
  circuit_breaker_enabled BOOLEAN DEFAULT true,
  cache_enabled BOOLEAN DEFAULT false,
  cache_ttl INTEGER DEFAULT 0,
  retry_enabled BOOLEAN DEFAULT true,
  retry_max_attempts INTEGER DEFAULT 3,
  retry_backoff_ms INTEGER DEFAULT 1000,
  timeout_ms INTEGER DEFAULT 10000,
  criticidade TEXT DEFAULT 'media' CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_api_endpoints_servico ON api_endpoints(servico);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_ativo ON api_endpoints(ativo);

-- =====================================================
-- SERVIÇOS DE COMUNICAÇÃO
-- =====================================================

-- 1. TWILIO (SMS)
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'twilio_send_sms',
  'Enviar SMS via Twilio',
  'twilio',
  'POST',
  'https://api.twilio.com',
  '/2010-04-01/Accounts/{accountSid}/Messages.json',
  'basic',
  jsonb_build_object(
    'username', '{{TWILIO_ACCOUNT_SID}}',
    'password', '{{TWILIO_AUTH_TOKEN}}'
  ),
  100,
  60,
  true,
  false,
  0,
  true,
  3,
  1000,
  10000,
  'alta'
);

-- 2. WHATSAPP BUSINESS API
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'whatsapp_send_message',
  'Enviar mensagem via WhatsApp Business',
  'whatsapp',
  'POST',
  'https://graph.facebook.com',
  '/v18.0/{phoneNumberId}/messages',
  'bearer',
  jsonb_build_object(
    'token', '{{WHATSAPP_ACCESS_TOKEN}}'
  ),
  80,
  60,
  true,
  false,
  0,
  true,
  3,
  1500,
  15000,
  'alta'
);

-- 3. SENDGRID (Email)
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'sendgrid_send_email',
  'Enviar email via SendGrid',
  'sendgrid',
  'POST',
  'https://api.sendgrid.com',
  '/v3/mail/send',
  'bearer',
  jsonb_build_object(
    'token', '{{SENDGRID_API_KEY}}'
  ),
  500,
  60,
  true,
  false,
  0,
  true,
  3,
  1000,
  10000,
  'alta'
);

-- 4. MAILCHIMP
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'mailchimp_send_campaign',
  'Enviar campanha via Mailchimp',
  'mailchimp',
  'POST',
  'https://{{dc}}.api.mailchimp.com',
  '/3.0/campaigns/{campaignId}/actions/send',
  'bearer',
  jsonb_build_object(
    'token', '{{MAILCHIMP_API_KEY}}',
    'dc', '{{MAILCHIMP_DC}}'
  ),
  120,
  60,
  true,
  false,
  0,
  true,
  3,
  2000,
  15000,
  'media'
);

-- =====================================================
-- FABRICANTES OPME - RASTREABILIDADE
-- =====================================================

-- 5. ABBOTT TRACK&TRACE
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'abbott_track_device',
  'Rastrear dispositivo Abbott',
  'abbott_tracktrace',
  'GET',
  'https://api.abbott.com',
  '/v1/track-trace/devices/{serialNumber}',
  'api_key',
  jsonb_build_object(
    'header', 'X-API-Key',
    'key', '{{ABBOTT_API_KEY}}'
  ),
  200,
  60,
  true,
  true,
  300,
  true,
  3,
  2000,
  10000,
  'critica'
);

-- 6. MEDTRONIC VISION
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'medtronic_verify_device',
  'Verificar dispositivo Medtronic VISION',
  'medtronic_vision',
  'POST',
  'https://vision.medtronic.com',
  '/api/v2/devices/verify',
  'oauth2',
  jsonb_build_object(
    'client_id', '{{MEDTRONIC_CLIENT_ID}}',
    'client_secret', '{{MEDTRONIC_CLIENT_SECRET}}',
    'token_url', 'https://auth.medtronic.com/oauth/token'
  ),
  150,
  60,
  true,
  true,
  600,
  true,
  3,
  2000,
  15000,
  'critica'
);

-- 7. J&J TRACELINK
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'jj_tracelink_query',
  'Consultar dispositivo J&J TraceLink',
  'jj_tracelink',
  'GET',
  'https://api.tracelink.com',
  '/v1/serialization/query/{gtin}/{serialNumber}',
  'bearer',
  jsonb_build_object(
    'token', '{{JJ_TRACELINK_TOKEN}}'
  ),
  180,
  60,
  true,
  true,
  900,
  true,
  3,
  1500,
  12000,
  'critica'
);

-- 8. STRYKER CONNECT
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'stryker_device_lookup',
  'Consultar dispositivo Stryker Connect',
  'stryker_connect',
  'GET',
  'https://connect.stryker.com',
  '/api/devices/{deviceId}',
  'api_key',
  jsonb_build_object(
    'header', 'Authorization',
    'prefix', 'ApiKey',
    'key', '{{STRYKER_API_KEY}}'
  ),
  200,
  60,
  true,
  true,
  600,
  true,
  3,
  2000,
  10000,
  'critica'
);

-- 9. BOSTON SCIENTIFIC iTrace
INSERT INTO api_endpoints (
  nome,
  descricao,
  servico,
  metodo,
  url_base,
  url_path,
  auth_tipo,
  auth_config,
  rate_limit_requests,
  rate_limit_window,
  circuit_breaker_enabled,
  cache_enabled,
  cache_ttl,
  retry_enabled,
  retry_max_attempts,
  retry_backoff_ms,
  timeout_ms,
  criticidade
) VALUES (
  'bostonsci_itrace_verify',
  'Verificar dispositivo Boston Scientific iTrace',
  'bostonsci_itrace',
  'POST',
  'https://api.bostonscientific.com',
  '/itrace/v1/verify',
  'bearer',
  jsonb_build_object(
    'token', '{{BOSTON_SCIENTIFIC_TOKEN}}'
  ),
  150,
  60,
  true,
  true,
  300,
  true,
  3,
  1500,
  12000,
  'critica'
);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE api_endpoints IS 'Configurações centralizadas de APIs externas';
COMMENT ON COLUMN api_endpoints.auth_config IS 'Configuração de autenticação em JSONB. Tokens reais devem estar em variáveis de ambiente ({{VAR_NAME}})';
COMMENT ON COLUMN api_endpoints.rate_limit_requests IS 'Número máximo de requisições permitidas';
COMMENT ON COLUMN api_endpoints.rate_limit_window IS 'Janela de tempo em segundos para rate limiting';
COMMENT ON COLUMN api_endpoints.circuit_breaker_enabled IS 'Se habilitado, circuito abre após falhas consecutivas';
COMMENT ON COLUMN api_endpoints.cache_enabled IS 'Se habilitado, respostas são cacheadas';
COMMENT ON COLUMN api_endpoints.cache_ttl IS 'Time-to-live do cache em segundos';
COMMENT ON COLUMN api_endpoints.criticidade IS 'Criticidade do endpoint: baixa, media, alta, critica';

