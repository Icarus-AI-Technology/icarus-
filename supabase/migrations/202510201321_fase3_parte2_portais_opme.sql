-- ============================================
-- Migration: FASE 3 - Compliance & Integrações (Parte 2/4)
-- MÓDULO PORTAIS OPME - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Integração com portais de OPME (hospitais/convênios):
-- - Configurações de acesso
-- - Solicitações de materiais
-- - Respostas e aprovações
-- - Logs de integração
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. PORTAIS_OPME_CONFIG (configurações dos portais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portais_opme_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação do portal
  nome TEXT NOT NULL,
  codigo TEXT NOT NULL, -- Identificador único do portal
  tipo TEXT CHECK (tipo IN ('hospital', 'convenio', 'operadora', 'marketplace')) NOT NULL,
  
  -- Hospital/Convênio relacionado
  hospital_id UUID REFERENCES public.hospitais(id),
  convenio_id UUID REFERENCES public.convenios(id),
  entidade_nome TEXT NOT NULL,
  entidade_cnpj TEXT,
  
  -- Dados de acesso
  url_portal TEXT NOT NULL,
  url_api TEXT,
  metodo_integracao TEXT CHECK (metodo_integracao IN (
    'api_rest', 'api_soap', 'sftp', 'email', 'portal_web', 'outro'
  )) DEFAULT 'portal_web',
  
  -- Credenciais (criptografadas)
  usuario TEXT,
  senha_hash TEXT, -- Armazenar criptografado
  token_api TEXT,
  certificado_digital_url TEXT,
  
  -- Configurações da API
  api_versao TEXT,
  api_timeout INTEGER DEFAULT 30, -- segundos
  api_retry_count INTEGER DEFAULT 3,
  api_headers_json JSONB,
  
  -- Regras de negócio
  requer_pre_aprovacao BOOLEAN DEFAULT TRUE,
  prazo_resposta_horas INTEGER DEFAULT 48,
  permite_fracionamento BOOLEAN DEFAULT FALSE,
  exige_laudo_medico BOOLEAN DEFAULT TRUE,
  
  -- Campos obrigatórios
  campos_obrigatorios TEXT[],
  validacoes_json JSONB,
  
  -- Sincronização
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  intervalo_sincronizacao_minutos INTEGER DEFAULT 60,
  ultima_sincronizacao TIMESTAMPTZ,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  homologacao BOOLEAN DEFAULT FALSE, -- Modo teste
  
  -- Contatos
  contato_nome TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  suporte_email TEXT,
  suporte_telefone TEXT,
  
  -- Observações
  observacoes TEXT,
  documentacao_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_portais_opme_config_empresa ON public.portais_opme_config(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_config_hospital ON public.portais_opme_config(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_config_convenio ON public.portais_opme_config(convenio_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_config_ativo ON public.portais_opme_config(ativo, homologacao) WHERE ativo = TRUE;

COMMENT ON TABLE public.portais_opme_config IS 'Configurações de integração com portais OPME';

-- ============================================
-- 2. PORTAIS_OPME_SOLICITACOES (solicitações enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portais_opme_solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  portal_config_id UUID NOT NULL REFERENCES public.portais_opme_config(id) ON DELETE RESTRICT,
  
  -- Identificação interna
  numero_interno TEXT NOT NULL,
  
  -- Identificação no portal
  numero_portal TEXT,
  protocolo_portal TEXT,
  
  -- Cirurgia relacionada
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE RESTRICT,
  
  -- Paciente (dados mínimos)
  paciente_id UUID REFERENCES public.pacientes(id),
  paciente_nome TEXT NOT NULL,
  paciente_carteirinha TEXT,
  
  -- Médico
  medico_id UUID REFERENCES public.medicos(id),
  medico_nome TEXT NOT NULL,
  medico_crm TEXT,
  
  -- Hospital/Convênio
  hospital_id UUID REFERENCES public.hospitais(id),
  convenio_id UUID REFERENCES public.convenios(id),
  
  -- Dados da cirurgia
  procedimento TEXT NOT NULL,
  data_cirurgia_prevista DATE NOT NULL,
  urgencia TEXT CHECK (urgencia IN ('eletiva', 'urgencia', 'emergencia')) DEFAULT 'eletiva',
  
  -- Materiais solicitados
  materiais_json JSONB NOT NULL, -- Array de materiais com quantidade e valores
  valor_total_solicitado DECIMAL(12, 2) NOT NULL,
  
  -- Documentos anexados
  laudo_medico_url TEXT,
  pedido_medico_url TEXT,
  orcamento_url TEXT,
  outros_documentos_urls TEXT[],
  
  -- Envio
  data_envio TIMESTAMPTZ,
  enviado_por_id UUID REFERENCES public.usuarios(id),
  metodo_envio TEXT CHECK (metodo_envio IN ('api', 'portal_web', 'email', 'manual')),
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'enviada', 'em_analise', 
    'aprovada', 'aprovada_parcial', 'negada', 
    'expirada', 'cancelada'
  )) DEFAULT 'rascunho',
  
  -- Datas de controle
  data_prazo_resposta TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  motivo_cancelamento TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_interno)
);

CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_empresa ON public.portais_opme_solicitacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_portal ON public.portais_opme_solicitacoes(portal_config_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_cirurgia ON public.portais_opme_solicitacoes(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_status ON public.portais_opme_solicitacoes(status, data_envio DESC) WHERE status NOT IN ('cancelada', 'expirada');
CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_prazo ON public.portais_opme_solicitacoes(data_prazo_resposta) WHERE status = 'em_analise';
CREATE INDEX IF NOT EXISTS idx_portais_opme_solicitacoes_protocolo ON public.portais_opme_solicitacoes(protocolo_portal) WHERE protocolo_portal IS NOT NULL;

COMMENT ON TABLE public.portais_opme_solicitacoes IS 'Solicitações de OPME enviadas aos portais';

-- ============================================
-- 3. PORTAIS_OPME_RESPOSTAS (respostas recebidas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portais_opme_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.portais_opme_solicitacoes(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_resposta TEXT,
  tipo_resposta TEXT CHECK (tipo_resposta IN (
    'aprovacao', 'aprovacao_parcial', 'negacao', 
    'pendencia', 'informacao', 'cancelamento'
  )) NOT NULL,
  
  -- Data e origem
  data_resposta TIMESTAMPTZ DEFAULT NOW(),
  origem TEXT CHECK (origem IN ('portal', 'email', 'telefone', 'manual')) DEFAULT 'portal',
  
  -- Resultado
  aprovado BOOLEAN,
  parcialmente_aprovado BOOLEAN DEFAULT FALSE,
  
  -- Itens aprovados/negados
  itens_aprovados_json JSONB, -- Materiais aprovados com quantidades
  itens_negados_json JSONB, -- Materiais negados com motivos
  
  -- Valores
  valor_aprovado DECIMAL(12, 2),
  valor_negado DECIMAL(12, 2),
  valor_glosa DECIMAL(12, 2) DEFAULT 0,
  
  -- Justificativas
  motivo_negacao TEXT,
  motivo_glosa TEXT,
  observacoes_portal TEXT,
  
  -- Pendências
  pendencias TEXT[],
  documentos_pendentes TEXT[],
  prazo_regularizacao DATE,
  
  -- Autorização
  numero_autorizacao TEXT,
  codigo_autorizacao TEXT,
  validade_autorizacao DATE,
  
  -- Responsável no portal
  responsavel_portal TEXT,
  auditor_portal TEXT,
  
  -- Documentos anexados na resposta
  documentos_urls TEXT[],
  
  -- Integração
  payload_resposta_json JSONB, -- Resposta completa da API
  
  -- Processamento interno
  processada BOOLEAN DEFAULT FALSE,
  data_processamento TIMESTAMPTZ,
  processada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Observações
  observacoes_internas TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portais_opme_respostas_solicitacao ON public.portais_opme_respostas(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_portais_opme_respostas_tipo ON public.portais_opme_respostas(tipo_resposta, data_resposta DESC);
CREATE INDEX IF NOT EXISTS idx_portais_opme_respostas_autorizacao ON public.portais_opme_respostas(numero_autorizacao) WHERE numero_autorizacao IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_respostas_processada ON public.portais_opme_respostas(processada, data_resposta DESC) WHERE NOT processada;

COMMENT ON TABLE public.portais_opme_respostas IS 'Respostas recebidas dos portais OPME';

-- ============================================
-- 4. PORTAIS_OPME_LOGS (logs de integração)
-- ============================================
CREATE TABLE IF NOT EXISTS public.portais_opme_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  portal_config_id UUID NOT NULL REFERENCES public.portais_opme_config(id) ON DELETE CASCADE,
  
  -- Solicitação relacionada (opcional)
  solicitacao_id UUID REFERENCES public.portais_opme_solicitacoes(id),
  
  -- Tipo de operação
  operacao TEXT CHECK (operacao IN (
    'envio_solicitacao', 'consulta_status', 'recebimento_resposta',
    'sincronizacao', 'autenticacao', 'download_documento', 'outro'
  )) NOT NULL,
  
  -- Método HTTP (se API)
  metodo_http TEXT CHECK (metodo_http IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  url_chamada TEXT,
  
  -- Request
  request_headers_json JSONB,
  request_body_json JSONB,
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Response
  response_status_code INTEGER,
  response_headers_json JSONB,
  response_body_json JSONB,
  response_timestamp TIMESTAMPTZ,
  response_time_ms INTEGER, -- Tempo de resposta em milissegundos
  
  -- Resultado
  sucesso BOOLEAN NOT NULL,
  mensagem_erro TEXT,
  erro_codigo TEXT,
  erro_detalhes TEXT,
  
  -- Retry
  tentativa INTEGER DEFAULT 1,
  max_tentativas INTEGER,
  
  -- IP e User Agent
  ip_origem INET,
  user_agent TEXT,
  
  -- Usuário responsável
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_empresa ON public.portais_opme_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_portal ON public.portais_opme_logs(portal_config_id);
CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_solicitacao ON public.portais_opme_logs(solicitacao_id) WHERE solicitacao_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_operacao ON public.portais_opme_logs(operacao, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_sucesso ON public.portais_opme_logs(sucesso, criado_em DESC) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS idx_portais_opme_logs_data ON public.portais_opme_logs(criado_em DESC);

COMMENT ON TABLE public.portais_opme_logs IS 'Logs de integração com portais OPME (auditoria de API)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_portais_opme_config_updated
  BEFORE UPDATE ON public.portais_opme_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portais_opme_solicitacoes_updated
  BEFORE UPDATE ON public.portais_opme_solicitacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_portais_opme_respostas_updated
  BEFORE UPDATE ON public.portais_opme_respostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO PORTAIS OPME (4 tabelas)
-- ============================================

