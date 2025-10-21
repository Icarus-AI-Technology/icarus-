-- ============================================
-- Migration: FASE 4 - Features Avançadas (Parte 2/5)
-- MÓDULO WORKFLOWS - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Sistema de workflows automatizados:
-- - Definição de workflows
-- - Etapas e condições
-- - Execuções e histórico
-- - Logs detalhados
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. WORKFLOWS (definição de workflows)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT CHECK (categoria IN (
    'aprovacao', 'notificacao', 'automacao', 
    'integracao', 'agendamento', 'validacao', 'outro'
  )),
  
  -- Trigger (gatilho)
  trigger_tipo TEXT CHECK (trigger_tipo IN (
    'manual', 'evento', 'agendado', 'webhook', 'condicional'
  )) NOT NULL,
  trigger_evento TEXT, -- Ex: "cirurgia.criada", "estoque.baixo"
  trigger_condicao_json JSONB, -- Condições para disparo
  
  -- Agendamento (se tipo = agendado)
  cron_expressao TEXT, -- Ex: "0 9 * * *"
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Configurações
  versao INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT FALSE,
  modo_teste BOOLEAN DEFAULT FALSE,
  
  -- Prioridade
  prioridade INTEGER DEFAULT 5 CHECK (prioridade BETWEEN 1 AND 10),
  
  -- Timeout e retry
  timeout_segundos INTEGER DEFAULT 300,
  max_tentativas INTEGER DEFAULT 3,
  intervalo_retry_segundos INTEGER DEFAULT 60,
  
  -- Variáveis globais
  variaveis_json JSONB, -- Variáveis disponíveis para todas as etapas
  
  -- Estatísticas
  total_execucoes INTEGER DEFAULT 0,
  total_sucesso INTEGER DEFAULT 0,
  total_erro INTEGER DEFAULT 0,
  taxa_sucesso DECIMAL(5, 2),
  tempo_medio_execucao_segundos INTEGER,
  
  -- Responsável
  criado_por_id UUID REFERENCES public.usuarios(id),
  modificado_por_id UUID REFERENCES public.usuarios(id),
  
  -- Datas
  ultima_execucao TIMESTAMPTZ,
  proxima_execucao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  documentacao_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_workflows_empresa ON public.workflows(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_ativo ON public.workflows(ativo, prioridade DESC) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_workflows_trigger ON public.workflows(trigger_tipo, trigger_evento);
CREATE INDEX IF NOT EXISTS idx_workflows_agendado ON public.workflows(proxima_execucao) WHERE trigger_tipo = 'agendado' AND ativo = TRUE;

COMMENT ON TABLE public.workflows IS 'Definição de workflows automatizados';

-- ============================================
-- 2. WORKFLOWS_ETAPAS (etapas do workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Ordem e hierarquia
  ordem INTEGER NOT NULL,
  etapa_pai_id UUID REFERENCES public.workflows_etapas(id), -- Para sub-etapas
  nivel INTEGER DEFAULT 1,
  
  -- Tipo de ação
  tipo_acao TEXT CHECK (tipo_acao IN (
    'aprovacao_manual', 'notificacao_email', 'notificacao_push',
    'webhook', 'funcao_edge', 'query_database', 
    'criar_registro', 'atualizar_registro', 'enviar_api',
    'aguardar', 'condicional', 'loop', 'paralelo', 'outro'
  )) NOT NULL,
  
  -- Configuração da ação
  configuracao_json JSONB NOT NULL,
  
  -- Entrada e saída
  input_schema_json JSONB, -- Schema JSON das variáveis de entrada
  output_schema_json JSONB, -- Schema JSON das variáveis de saída
  mapear_output BOOLEAN DEFAULT TRUE,
  
  -- Condições
  condicao_execucao_json JSONB, -- Quando executar esta etapa
  executar_se TEXT CHECK (executar_se IN ('sempre', 'sucesso_anterior', 'erro_anterior', 'condicional')),
  
  -- Aprovação manual
  requer_aprovacao BOOLEAN DEFAULT FALSE,
  aprovadores_ids UUID[], -- IDs dos usuários aprovadores
  aprovacao_minima INTEGER DEFAULT 1, -- Quantos aprovadores são necessários
  
  -- Timeout específico
  timeout_segundos INTEGER,
  
  -- Retry específico
  tentativas_maximas INTEGER DEFAULT 3,
  
  -- Tratamento de erro
  acao_erro TEXT CHECK (acao_erro IN ('parar', 'continuar', 'retry', 'pular', 'rollback')),
  etapa_erro_id UUID REFERENCES public.workflows_etapas(id), -- Etapa para ir em caso de erro
  
  -- Status
  ativa BOOLEAN DEFAULT TRUE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_etapas_workflow ON public.workflows_etapas(workflow_id, ordem);
CREATE INDEX IF NOT EXISTS idx_workflows_etapas_pai ON public.workflows_etapas(etapa_pai_id) WHERE etapa_pai_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_etapas_tipo ON public.workflows_etapas(tipo_acao);

COMMENT ON TABLE public.workflows_etapas IS 'Etapas individuais dos workflows';

-- ============================================
-- 3. WORKFLOWS_EXECUCOES (execuções do workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_execucao INTEGER NOT NULL,
  
  -- Trigger
  disparado_por TEXT CHECK (disparado_por IN ('manual', 'automatico', 'evento', 'agendado', 'webhook')),
  disparado_por_usuario_id UUID REFERENCES public.usuarios(id),
  evento_origem TEXT,
  
  -- Contexto
  contexto_tipo TEXT, -- Ex: "cirurgia", "pedido_compra"
  contexto_id UUID,
  contexto_dados_json JSONB,
  
  -- Variáveis de entrada
  input_json JSONB,
  
  -- Status
  status TEXT CHECK (status IN (
    'iniciando', 'em_andamento', 'aguardando_aprovacao',
    'pausado', 'concluido', 'erro', 'cancelado', 'timeout'
  )) DEFAULT 'iniciando',
  
  -- Progresso
  etapa_atual_id UUID REFERENCES public.workflows_etapas(id),
  etapa_atual_numero INTEGER,
  total_etapas INTEGER,
  progresso_percentual INTEGER DEFAULT 0,
  
  -- Resultados
  sucesso BOOLEAN,
  output_json JSONB,
  erro_mensagem TEXT,
  erro_etapa_id UUID REFERENCES public.workflows_etapas(id),
  
  -- Tempo
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ,
  duracao_segundos INTEGER,
  
  -- Retry
  tentativa INTEGER DEFAULT 1,
  execucao_original_id UUID REFERENCES public.workflows_execucoes(id), -- Se for retry
  
  -- Aprovações
  aprovacoes_pendentes INTEGER DEFAULT 0,
  aprovacoes_concedidas INTEGER DEFAULT 0,
  aprovacoes_negadas INTEGER DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_empresa ON public.workflows_execucoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_workflow ON public.workflows_execucoes(workflow_id, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_status ON public.workflows_execucoes(status, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_contexto ON public.workflows_execucoes(contexto_tipo, contexto_id);
CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_usuario ON public.workflows_execucoes(disparado_por_usuario_id) WHERE disparado_por_usuario_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_execucoes_aguardando ON public.workflows_execucoes(status) WHERE status = 'aguardando_aprovacao';

COMMENT ON TABLE public.workflows_execucoes IS 'Execuções de workflows (histórico)';

-- ============================================
-- 4. WORKFLOWS_LOGS (logs detalhados)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workflows_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execucao_id UUID NOT NULL REFERENCES public.workflows_execucoes(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.workflows_etapas(id),
  
  -- Timestamp
  ocorrido_em TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tipo de log
  tipo TEXT CHECK (tipo IN (
    'info', 'debug', 'warning', 'error', 
    'etapa_iniciada', 'etapa_concluida', 'etapa_erro',
    'aprovacao_solicitada', 'aprovacao_concedida', 'aprovacao_negada',
    'retry', 'timeout', 'cancelamento', 'webhook_chamado'
  )) NOT NULL,
  
  -- Nível de severidade
  severidade INTEGER DEFAULT 1 CHECK (severidade BETWEEN 1 AND 5),
  
  -- Mensagem
  mensagem TEXT NOT NULL,
  detalhes TEXT,
  
  -- Dados estruturados
  dados_json JSONB,
  
  -- Request/Response (se aplicável)
  request_json JSONB,
  response_json JSONB,
  response_status_code INTEGER,
  response_time_ms INTEGER,
  
  -- Erro
  erro_stack_trace TEXT,
  erro_codigo TEXT,
  
  -- Usuário (se ação manual)
  usuario_id UUID REFERENCES public.usuarios(id),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflows_logs_execucao ON public.workflows_logs(execucao_id, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_logs_etapa ON public.workflows_logs(etapa_id) WHERE etapa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_logs_tipo ON public.workflows_logs(tipo, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_logs_erro ON public.workflows_logs(tipo, severidade DESC) WHERE tipo = 'error';

COMMENT ON TABLE public.workflows_logs IS 'Logs detalhados das execuções de workflows';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_workflows_updated
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_workflows_etapas_updated
  BEFORE UPDATE ON public.workflows_etapas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_workflows_execucoes_updated
  BEFORE UPDATE ON public.workflows_execucoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO WORKFLOWS (4 tabelas)
-- ============================================

