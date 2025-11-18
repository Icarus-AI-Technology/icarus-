-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 3/5)
-- MÓDULO API GATEWAY - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Gateway de APIs com controle completo:
-- - Endpoints registrados
-- - Chaves de API
-- - Logs de requisições
-- - Rate limiting
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. API_ENDPOINTS (endpoints registrados)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  versao TEXT DEFAULT 'v1',
  
  -- Endpoint
  metodo TEXT CHECK (metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')) NOT NULL,
  path TEXT NOT NULL, -- Ex: "/api/v1/cirurgias"
  path_parametros TEXT[], -- Ex: ["id", "status"]
  
  -- Categoria
  categoria TEXT CHECK (categoria IN (
    'publico', 'privado', 'interno', 'webhook', 'integracao'
  )) DEFAULT 'privado',
  
  -- Autenticação
  requer_autenticacao BOOLEAN DEFAULT TRUE,
  tipo_autenticacao TEXT CHECK (tipo_autenticacao IN (
    'api_key', 'bearer_token', 'basic_auth', 'oauth2', 'nenhuma'
  )) DEFAULT 'api_key',
  
  -- Permissões
  permissoes_requeridas TEXT[], -- Ex: ["cirurgias.read", "cirurgias.write"]
  roles_permitidos TEXT[],
  
  -- Rate limiting
  rate_limit_habilitado BOOLEAN DEFAULT TRUE,
  rate_limit_requests INTEGER DEFAULT 100, -- Requests por janela
  rate_limit_janela_segundos INTEGER DEFAULT 60,
  
  -- Validação
  valida_input BOOLEAN DEFAULT TRUE,
  input_schema_json JSONB,
  valida_output BOOLEAN DEFAULT FALSE,
  output_schema_json JSONB,
  
  -- Timeout
  timeout_segundos INTEGER DEFAULT 30,
  
  -- Cache
  cache_habilitado BOOLEAN DEFAULT FALSE,
  cache_ttl_segundos INTEGER DEFAULT 300,
  
  -- Webhook
  webhook_url TEXT, -- Se for chamar webhook externo
  webhook_headers_json JSONB,
  webhook_retry_count INTEGER DEFAULT 3,
  
  -- Documentação
  documentacao_markdown TEXT,
  exemplos_json JSONB,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  manutencao BOOLEAN DEFAULT FALSE,
  deprecated BOOLEAN DEFAULT FALSE,
  data_depreciacao DATE,
  
  -- Estatísticas
  total_chamadas INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  tempo_medio_ms INTEGER,
  ultima_chamada TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo, versao)
);

CREATE INDEX IF NOT EXISTS idx_api_endpoints_empresa ON public.api_endpoints(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_endpoints_path ON public.api_endpoints(metodo, path) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_endpoints_ativo ON public.api_endpoints(ativo, manutencao) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_endpoints_categoria ON public.api_endpoints(categoria) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.api_endpoints IS 'Endpoints de API registrados no gateway';

-- ============================================
-- 2. API_KEYS (chaves de API)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Chave
  chave TEXT NOT NULL UNIQUE, -- Hash da chave (não armazenar plain text!)
  prefixo TEXT NOT NULL, -- Prefixo visível (ex: "sk_live_")
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('producao', 'teste', 'desenvolvimento')) DEFAULT 'teste',
  
  -- Escopo
  escopo TEXT CHECK (escopo IN ('full', 'readonly', 'limitado')) DEFAULT 'limitado',
  permissoes TEXT[], -- Permissões específicas
  endpoints_permitidos UUID[], -- IDs de api_endpoints
  
  -- Proprietário
  usuario_id UUID REFERENCES public.usuarios(id),
  aplicacao TEXT, -- Nome da aplicação usando a chave
  
  -- Restrições
  ips_permitidos INET[], -- Lista de IPs permitidos
  dominios_permitidos TEXT[], -- Lista de domínios (CORS)
  
  -- Rate limiting
  rate_limit_override BOOLEAN DEFAULT FALSE,
  rate_limit_custom INTEGER,
  rate_limit_janela_segundos INTEGER,
  
  -- Validade
  data_expiracao TIMESTAMPTZ,
  expira BOOLEAN DEFAULT FALSE,
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  bloqueada BOOLEAN DEFAULT FALSE,
  motivo_bloqueio TEXT,
  
  -- Estatísticas
  total_requisicoes INTEGER DEFAULT 0,
  ultima_requisicao TIMESTAMPTZ,
  ultima_requisicao_ip INET,
  
  -- Rotação
  rotacionada_de_id UUID REFERENCES public.api_keys(id), -- Chave anterior (se rotacionada)
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_empresa ON public.api_keys(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_chave ON public.api_keys(chave) WHERE ativa = TRUE;
CREATE INDEX IF NOT EXISTS idx_api_keys_usuario ON public.api_keys(usuario_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_ativa ON public.api_keys(ativa, bloqueada) WHERE ativa = TRUE AND NOT bloqueada;
CREATE INDEX IF NOT EXISTS idx_api_keys_expiracao ON public.api_keys(data_expiracao) WHERE expira = TRUE AND ativa = TRUE;

COMMENT ON TABLE public.api_keys IS 'Chaves de autenticação de API';

-- ============================================
-- 3. API_LOGS (logs de requisições)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.api_endpoints(id),
  api_key_id UUID REFERENCES public.api_keys(id),
  
  -- Request
  request_id TEXT NOT NULL UNIQUE, -- UUID da requisição
  metodo TEXT NOT NULL,
  path TEXT NOT NULL,
  query_params_json JSONB,
  request_headers_json JSONB,
  request_body_json JSONB,
  request_size_bytes INTEGER,
  
  -- Cliente
  ip_origem INET NOT NULL,
  user_agent TEXT,
  referer TEXT,
  
  -- Usuário (se autenticado)
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Response
  response_status_code INTEGER,
  response_headers_json JSONB,
  response_body_json JSONB,
  response_size_bytes INTEGER,
  response_time_ms INTEGER,
  
  -- Resultado
  sucesso BOOLEAN,
  erro_mensagem TEXT,
  erro_tipo TEXT,
  erro_stack_trace TEXT,
  
  -- Rate limiting
  rate_limit_hit BOOLEAN DEFAULT FALSE,
  rate_limit_remaining INTEGER,
  
  -- Cache
  cache_hit BOOLEAN DEFAULT FALSE,
  
  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Geolocalização (opcional)
  pais TEXT,
  regiao TEXT,
  cidade TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_empresa ON public.api_logs(empresa_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON public.api_logs(endpoint_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_api_key ON public.api_logs(api_key_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_request_id ON public.api_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON public.api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON public.api_logs(response_status_code, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_erro ON public.api_logs(sucesso, timestamp DESC) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS idx_api_logs_ip ON public.api_logs(ip_origem, timestamp DESC);

COMMENT ON TABLE public.api_logs IS 'Logs de requisições de API (auditoria completa)';

-- ============================================
-- 4. API_RATE_LIMITS (controle de rate limiting)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificador do limite
  chave_limite TEXT NOT NULL, -- Ex: "api_key:abc123:endpoint:/cirurgias"
  
  -- Referências
  api_key_id UUID REFERENCES public.api_keys(id),
  endpoint_id UUID REFERENCES public.api_endpoints(id),
  ip_origem INET,
  
  -- Janela de tempo
  janela_inicio TIMESTAMPTZ NOT NULL,
  janela_fim TIMESTAMPTZ NOT NULL,
  janela_duracao_segundos INTEGER NOT NULL,
  
  -- Limites
  limite_requests INTEGER NOT NULL,
  requests_consumidos INTEGER DEFAULT 0,
  requests_restantes INTEGER,
  
  -- Status
  limite_atingido BOOLEAN DEFAULT FALSE,
  data_limite_atingido TIMESTAMPTZ,
  
  -- Reset
  proxima_janela TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(chave_limite, janela_inicio)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_chave ON public.api_rate_limits(chave_limite, janela_fim DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_api_key ON public.api_rate_limits(api_key_id, janela_fim DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_endpoint ON public.api_rate_limits(endpoint_id, janela_fim DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_ip ON public.api_rate_limits(ip_origem, janela_fim DESC);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_atingido ON public.api_rate_limits(limite_atingido, proxima_janela) WHERE limite_atingido = TRUE;

COMMENT ON TABLE public.api_rate_limits IS 'Controle de rate limiting por API key/endpoint/IP';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_api_endpoints_updated
  BEFORE UPDATE ON public.api_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_api_keys_updated
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_api_rate_limits_updated
  BEFORE UPDATE ON public.api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO API GATEWAY (4 tabelas)
-- ============================================

