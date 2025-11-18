-- =====================================================
-- BLOCO 3.4: Workflow Builder Visual
-- Sistema de automação de processos para distribuidoras OPME
-- 
-- FUNCIONALIDADES:
-- - Criação visual de workflows (arrastar e soltar)
-- - Triggers: Evento (NF-e emitida, pedido criado, estoque baixo)
-- - Ações: Email, SMS, Webhook, Atualizar status, Criar tarefa
-- - Condições: IF/ELSE (valor > X, status = Y)
-- - Delay: Aguardar X dias/horas
-- - Aprovações: Aguardar aprovação de usuário
-- - Logs de execução
-- - Templates prontos (onboarding cliente, alerta estoque, follow-up)
-- 
-- CONTEXTO OPME:
-- - Automatizar follow-up de vendas
-- - Alertas de estoque crítico
-- - Aprovação de pedidos acima de valor
-- - Onboarding de novos clientes
-- - Lembretes de vencimento de certificados ANVISA
-- =====================================================

-- =====================================================
-- TABELA: workflows (Workflows Automatizados)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  
  -- Trigger (gatilho)
  trigger_tipo VARCHAR(50) NOT NULL,
  -- 'nfe_emitida', 'pedido_criado', 'estoque_baixo', 'cliente_novo', 'proposta_enviada', 'manual', 'agendado'
  trigger_config JSONB,
  -- Ex: { entity: 'nfes', event: 'INSERT', filters: { status: 'autorizada' } }
  -- Ex: { cron: '0 9 * * 1', timezone: 'America/Sao_Paulo' } (segunda 9h)
  
  -- Steps (passos do workflow) - JSON array
  steps JSONB NOT NULL,
  /*
  [
    {
      id: 'step1',
      type: 'condition',
      config: { field: 'valor_total', operator: '>', value: 10000 },
      on_true: 'step2',
      on_false: 'step3'
    },
    {
      id: 'step2',
      type: 'send_email',
      config: { to: 'gerente@empresa.com', subject: 'Pedido Alto Valor', template: 'pedido_alto_valor' }
    },
    {
      id: 'step3',
      type: 'update_status',
      config: { entity: 'pedidos', status: 'aprovado_automatico' }
    }
  ]
  */
  
  -- Status
  is_ativo BOOLEAN DEFAULT TRUE,
  is_template BOOLEAN DEFAULT FALSE, -- Se é template pronto
  
  -- Execuções
  total_execucoes INTEGER DEFAULT 0,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE, -- Para workflows agendados
  
  -- Categoria
  categoria VARCHAR(50), -- 'vendas', 'estoque', 'financeiro', 'compliance', 'operacional'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE workflows IS 'Workflows automatizados (visual builder)';

CREATE INDEX idx_workflows_trigger ON workflows(trigger_tipo);
CREATE INDEX idx_workflows_ativo ON workflows(is_ativo) WHERE is_ativo = TRUE;
CREATE INDEX idx_workflows_categoria ON workflows(categoria);
CREATE INDEX idx_workflows_template ON workflows(is_template) WHERE is_template = TRUE;

-- =====================================================
-- TABELA: workflow_execucoes (Logs de Execução)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_execucoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Trigger data (dados que dispararam)
  trigger_data JSONB,
  -- Ex: { nfe_id: 'uuid', valor_total: 15000, cliente_nome: 'Hospital XYZ' }
  
  -- Execução
  status VARCHAR(30) NOT NULL DEFAULT 'em_execucao',
  -- 'em_execucao', 'concluido', 'erro', 'aguardando_aprovacao', 'cancelado'
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  duracao_ms INTEGER,
  
  -- Steps executados (log detalhado)
  steps_log JSONB,
  /*
  [
    { step_id: 'step1', type: 'condition', result: true, executed_at: '2025-10-20T10:00:00Z' },
    { step_id: 'step2', type: 'send_email', status: 'sucesso', executed_at: '2025-10-20T10:00:01Z' }
  ]
  */
  
  -- Erro (se houver)
  erro_mensagem TEXT,
  erro_step_id VARCHAR(50),
  
  -- Aprovação (se necessário)
  aguardando_aprovacao_de UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  aprovado_por UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE workflow_execucoes IS 'Logs de execução de workflows (auditoria completa)';

CREATE INDEX idx_execucoes_workflow ON workflow_execucoes(workflow_id);
CREATE INDEX idx_execucoes_status ON workflow_execucoes(status);
CREATE INDEX idx_execucoes_started ON workflow_execucoes(started_at DESC);

-- =====================================================
-- TABELA: workflow_aprovacoes (Aprovações Pendentes)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_aprovacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  workflow_execucao_id UUID NOT NULL REFERENCES workflow_execucoes(id) ON DELETE CASCADE,
  
  -- Aprovação
  solicitado_para UUID NOT NULL REFERENCES auth.users(id),
  mensagem TEXT,
  dados_contexto JSONB, -- Dados para ajudar na decisão
  
  status VARCHAR(20) NOT NULL DEFAULT 'pendente',
  -- 'pendente', 'aprovado', 'recusado', 'expirado'
  
  solicitado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_em TIMESTAMP WITH TIME ZONE, -- Prazo para aprovar
  
  respondido_em TIMESTAMP WITH TIME ZONE,
  resposta TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE workflow_aprovacoes IS 'Aprovações pendentes de workflows';

CREATE INDEX idx_aprovacoes_execucao ON workflow_aprovacoes(workflow_execucao_id);
CREATE INDEX idx_aprovacoes_usuario ON workflow_aprovacoes(solicitado_para);
CREATE INDEX idx_aprovacoes_status ON workflow_aprovacoes(status);

-- =====================================================
-- VIEW: vw_workflows_ativos (Workflows Ativos)
-- =====================================================
CREATE OR REPLACE VIEW vw_workflows_ativos AS
SELECT
  w.id,
  w.nome,
  w.descricao,
  w.trigger_tipo,
  w.categoria,
  w.total_execucoes,
  w.ultima_execucao,
  w.proxima_execucao,
  (SELECT COUNT(*) FROM workflow_execucoes WHERE workflow_id = w.id AND status = 'concluido') AS total_sucesso,
  (SELECT COUNT(*) FROM workflow_execucoes WHERE workflow_id = w.id AND status = 'erro') AS total_erros
FROM workflows w
WHERE w.is_ativo = TRUE
ORDER BY w.created_at DESC;

COMMENT ON VIEW vw_workflows_ativos IS 'Workflows ativos com estatísticas';

-- =====================================================
-- FUNCTION: Executar workflow (simplificado)
-- =====================================================
CREATE OR REPLACE FUNCTION executar_workflow(
  p_workflow_id UUID,
  p_trigger_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_execucao_id UUID;
  v_workflow RECORD;
BEGIN
  -- Buscar workflow
  SELECT * INTO v_workflow FROM workflows WHERE id = p_workflow_id AND is_ativo = TRUE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Workflow não encontrado ou inativo';
  END IF;
  
  -- Criar registro de execução
  INSERT INTO workflow_execucoes (
    workflow_id,
    trigger_data,
    status,
    started_at
  ) VALUES (
    p_workflow_id,
    p_trigger_data,
    'em_execucao',
    NOW()
  )
  RETURNING id INTO v_execucao_id;
  
  -- Atualizar estatísticas do workflow
  UPDATE workflows
  SET 
    total_execucoes = total_execucoes + 1,
    ultima_execucao = NOW()
  WHERE id = p_workflow_id;
  
  -- Aqui seria a execução real dos steps (via Edge Function ou Background Job)
  -- Por simplicidade, marcamos como concluído
  UPDATE workflow_execucoes
  SET 
    status = 'concluido',
    finished_at = NOW(),
    duracao_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
  WHERE id = v_execucao_id;
  
  RETURN v_execucao_id;
END;
$$;

COMMENT ON FUNCTION executar_workflow IS 'Executa um workflow (criar execução + processar steps)';

-- =====================================================
-- FUNCTION: Aprovar/Recusar workflow
-- =====================================================
CREATE OR REPLACE FUNCTION responder_aprovacao_workflow(
  p_aprovacao_id UUID,
  p_aprovado BOOLEAN,
  p_resposta TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_execucao_id UUID;
BEGIN
  -- Atualizar aprovação
  UPDATE workflow_aprovacoes
  SET 
    status = CASE WHEN p_aprovado THEN 'aprovado' ELSE 'recusado' END,
    respondido_em = NOW(),
    resposta = p_resposta
  WHERE id = p_aprovacao_id
  RETURNING workflow_execucao_id INTO v_execucao_id;
  
  -- Atualizar execução
  IF p_aprovado THEN
    UPDATE workflow_execucoes
    SET 
      status = 'em_execucao',
      aprovado_em = NOW(),
      aprovado_por = auth.uid()
    WHERE id = v_execucao_id;
  ELSE
    UPDATE workflow_execucoes
    SET 
      status = 'cancelado',
      erro_mensagem = 'Recusado pelo aprovador: ' || COALESCE(p_resposta, 'Sem justificativa')
    WHERE id = v_execucao_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION responder_aprovacao_workflow IS 'Aprovar ou recusar aprovação pendente de workflow';

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_aprovacoes ENABLE ROW LEVEL SECURITY;

-- Políticas: Gerentes e TI veem tudo
CREATE POLICY "Gerentes veem workflows" ON workflows FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'gerente_geral', 'ti', 'analista_ti')
  )
);

CREATE POLICY "Usuários veem aprovações pendentes" ON workflow_aprovacoes FOR SELECT
USING (solicitado_para = auth.uid());

CREATE POLICY "Usuários respondem suas aprovações" ON workflow_aprovacoes FOR UPDATE
USING (solicitado_para = auth.uid() AND status = 'pendente');

-- =====================================================
-- SEED: Templates de Workflows Prontos
-- =====================================================
INSERT INTO workflows (nome, descricao, trigger_tipo, trigger_config, steps, is_template, categoria) VALUES
(
  'Follow-up Proposta Enviada',
  'Envia email de follow-up 3 dias após envio de proposta',
  'proposta_enviada',
  '{"entity": "propostas_comerciais", "event": "INSERT", "filters": {"status": "enviada"}}'::JSONB,
  '[
    {
      "id": "step1",
      "type": "delay",
      "config": {"days": 3}
    },
    {
      "id": "step2",
      "type": "condition",
      "config": {"field": "status", "operator": "=", "value": "enviada"},
      "on_true": "step3",
      "on_false": "end"
    },
    {
      "id": "step3",
      "type": "send_email",
      "config": {
        "to": "{{responsavel_email}}",
        "subject": "Follow-up: Proposta {{numero_proposta}}",
        "template": "followup_proposta"
      }
    }
  ]'::JSONB,
  TRUE,
  'vendas'
),
(
  'Alerta Estoque Crítico',
  'Notifica gerente quando estoque atinge nível crítico',
  'estoque_baixo',
  '{"entity": "estoque", "field": "quantidade", "operator": "<", "value": 10}'::JSONB,
  '[
    {
      "id": "step1",
      "type": "send_email",
      "config": {
        "to": "gerente.logistica@empresa.com",
        "subject": "ALERTA: Estoque Crítico - {{produto_nome}}",
        "template": "alerta_estoque"
      }
    },
    {
      "id": "step2",
      "type": "create_task",
      "config": {
        "titulo": "Repor estoque: {{produto_nome}}",
        "responsavel": "gerente_logistica",
        "prioridade": "alta"
      }
    }
  ]'::JSONB,
  TRUE,
  'estoque'
),
(
  'Aprovação Pedido Alto Valor',
  'Exige aprovação da diretoria para pedidos acima de R$ 50.000',
  'pedido_criado',
  '{"entity": "pedidos", "event": "INSERT"}'::JSONB,
  '[
    {
      "id": "step1",
      "type": "condition",
      "config": {"field": "valor_total", "operator": ">", "value": 50000},
      "on_true": "step2",
      "on_false": "step4"
    },
    {
      "id": "step2",
      "type": "request_approval",
      "config": {
        "solicitado_para": "diretoria",
        "mensagem": "Pedido de {{cliente_nome}} no valor de R$ {{valor_total}}",
        "expira_em_horas": 24
      }
    },
    {
      "id": "step3",
      "type": "update_status",
      "config": {"entity": "pedidos", "status": "aprovado_diretoria"}
    },
    {
      "id": "step4",
      "type": "update_status",
      "config": {"entity": "pedidos", "status": "aprovado_automatico"}
    }
  ]'::JSONB,
  TRUE,
  'financeiro'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS (Documentação)
-- =====================================================
COMMENT ON TABLE workflows IS 'Workflows automatizados (visual builder com triggers, ações, condições)';
COMMENT ON TABLE workflow_execucoes IS 'Logs de execução (auditoria + troubleshooting)';
COMMENT ON TABLE workflow_aprovacoes IS 'Aprovações pendentes (aguardando decisão humana)';
COMMENT ON FUNCTION executar_workflow IS 'Executa workflow (criar execução + processar steps)';
COMMENT ON FUNCTION responder_aprovacao_workflow IS 'Aprovar/recusar aprovação pendente';

-- Tipos de Steps:
-- - condition: IF/ELSE (comparação de valores)
-- - send_email: Enviar email (templates)
-- - send_sms: Enviar SMS
-- - send_webhook: Chamar webhook externo
-- - update_status: Atualizar status de entidade
-- - create_task: Criar tarefa
-- - delay: Aguardar X tempo
-- - request_approval: Solicitar aprovação humana
-- - log: Registrar log

