-- ============================================
-- Migration: Correção de Tabelas Faltantes
-- Aplicação de tabelas que não foram migradas corretamente
-- Data: 2025-10-20
-- ============================================

-- 1. MATERIAIS (tabela faltante do CORE)
CREATE TABLE IF NOT EXISTS public.materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  registro_anvisa TEXT,
  categoria TEXT,
  subcategoria TEXT,
  unidade_medida TEXT DEFAULT 'UN',
  valor_unitario DECIMAL(12, 2),
  consignado BOOLEAN DEFAULT FALSE,
  controlado_anvisa BOOLEAN DEFAULT FALSE,
  lote_obrigatorio BOOLEAN DEFAULT TRUE,
  validade_obrigatoria BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_materiais_empresa ON public.materiais(empresa_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_materiais_codigo ON public.materiais(codigo);
CREATE INDEX IF NOT EXISTS idx_materiais_anvisa ON public.materiais(registro_anvisa) WHERE registro_anvisa IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_materiais_consignado ON public.materiais(consignado) WHERE consignado = TRUE;

CREATE TRIGGER trg_materiais_updated BEFORE UPDATE ON public.materiais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.materiais IS 'Catálogo de materiais OPME';

-- 2. ITENS_REMESSA_CONSIGNACAO (tabela faltante do módulo Consignação)
CREATE TABLE IF NOT EXISTS public.itens_remessa_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remessa_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario DECIMAL(12, 2) NOT NULL,
  lote TEXT,
  validade DATE,
  status TEXT CHECK (status IN ('enviado', 'em_uso', 'devolvido', 'faturado')) DEFAULT 'enviado',
  quantidade_utilizada INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_remessa_remessa ON public.itens_remessa_consignacao(remessa_id);
CREATE INDEX IF NOT EXISTS idx_itens_remessa_material ON public.itens_remessa_consignacao(material_id);
CREATE INDEX IF NOT EXISTS idx_itens_remessa_status ON public.itens_remessa_consignacao(status);
CREATE INDEX IF NOT EXISTS idx_itens_remessa_validade ON public.itens_remessa_consignacao(validade) WHERE validade IS NOT NULL;

CREATE TRIGGER trg_itens_remessa_updated BEFORE UPDATE ON public.itens_remessa_consignacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.itens_remessa_consignacao IS 'Itens individuais das remessas de consignação';

-- 3. ITENS_SOLICITACAO_COMPRA (tabela faltante do módulo Compras)
CREATE TABLE IF NOT EXISTS public.itens_solicitacao_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  descricao TEXT NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  unidade TEXT DEFAULT 'UN',
  especificacoes TEXT,
  justificativa TEXT,
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  valor_estimado DECIMAL(12, 2),
  urgente BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_solicitacao ON public.itens_solicitacao_compra(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_produto ON public.itens_solicitacao_compra(produto_id);
CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_centro_custo ON public.itens_solicitacao_compra(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_itens_solicitacao_urgente ON public.itens_solicitacao_compra(urgente) WHERE urgente = TRUE;

CREATE TRIGGER trg_itens_solicitacao_updated BEFORE UPDATE ON public.itens_solicitacao_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.itens_solicitacao_compra IS 'Itens das solicitações de compra';

-- 4. CHATBOT_PESQUISAS_GPT (tabela faltante do módulo Chatbot)
CREATE TABLE IF NOT EXISTS public.chatbot_pesquisas_gpt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  conversa_id UUID REFERENCES public.chatbot_conversas(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  fontes_consultadas JSONB,
  resultado TEXT,
  tempo_execucao_ms INTEGER,
  tokens_utilizados INTEGER,
  custo_estimado DECIMAL(10, 4),
  sucesso BOOLEAN DEFAULT TRUE,
  erro_mensagem TEXT,
  arquivos_gerados TEXT[],
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_pesquisas_usuario ON public.chatbot_pesquisas_gpt(usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_pesquisas_conversa ON public.chatbot_pesquisas_gpt(conversa_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_pesquisas_sucesso ON public.chatbot_pesquisas_gpt(sucesso) WHERE NOT sucesso;
CREATE INDEX IF NOT EXISTS idx_chatbot_pesquisas_data ON public.chatbot_pesquisas_gpt(criado_em DESC);

COMMENT ON TABLE public.chatbot_pesquisas_gpt IS 'Pesquisas realizadas via GPT Researcher';

-- 5. WORKFLOW_ETAPAS (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS public.workflow_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_acao TEXT CHECK (tipo_acao IN ('aprovar', 'notificar', 'executar', 'validar', 'aguardar')) NOT NULL,
  responsavel_id UUID REFERENCES public.usuarios(id),
  responsavel_role_id UUID REFERENCES public.roles(id),
  automatica BOOLEAN DEFAULT FALSE,
  prazo_sla INTEGER,
  configuracao_acao JSONB,
  condicao_execucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_etapas_workflow ON public.workflow_etapas(workflow_id, ordem);
CREATE INDEX IF NOT EXISTS idx_workflow_etapas_responsavel ON public.workflow_etapas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_workflow_etapas_role ON public.workflow_etapas(responsavel_role_id);

CREATE TRIGGER trg_workflow_etapas_updated BEFORE UPDATE ON public.workflow_etapas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workflow_etapas IS 'Etapas dos workflows';

-- 6. WORKFLOW_EXECUCOES (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS public.workflow_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE RESTRICT,
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  status TEXT CHECK (status IN ('iniciado', 'em_andamento', 'concluido', 'cancelado', 'erro')) DEFAULT 'iniciado',
  etapa_atual_id UUID REFERENCES public.workflow_etapas(id),
  iniciado_por_id UUID REFERENCES public.usuarios(id),
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  concluido_em TIMESTAMPTZ,
  resultado JSONB,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_workflow ON public.workflow_execucoes(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_entidade ON public.workflow_execucoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_status ON public.workflow_execucoes(status, iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_execucoes_etapa ON public.workflow_execucoes(etapa_atual_id) WHERE status = 'em_andamento';

CREATE TRIGGER trg_workflow_execucoes_updated BEFORE UPDATE ON public.workflow_execucoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.workflow_execucoes IS 'Execuções de workflows';

-- 7. WORKFLOW_LOGS (tabela faltante do módulo Workflows)
CREATE TABLE IF NOT EXISTS public.workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execucao_id UUID NOT NULL REFERENCES public.workflow_execucoes(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.workflow_etapas(id),
  usuario_id UUID REFERENCES public.usuarios(id),
  acao TEXT NOT NULL,
  resultado TEXT,
  observacoes TEXT,
  dados_json JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_logs_execucao ON public.workflow_logs(execucao_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_etapa ON public.workflow_logs(etapa_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_usuario ON public.workflow_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_data ON public.workflow_logs(criado_em DESC);

COMMENT ON TABLE public.workflow_logs IS 'Logs de execução de workflows';

-- ============================================
-- 8. STORAGE BUCKETS FALTANTES
-- ============================================

-- Nota: Storage buckets devem ser criados via Supabase Dashboard ou API
-- Aqui documentamos os buckets que devem existir:

-- BUCKET: cirurgias
-- Descrição: Documentos e anexos de cirurgias
-- Public: false
-- File Size Limit: 50MB
-- Allowed MIME Types: image/*, application/pdf

-- BUCKET: faturamento
-- Descrição: Notas fiscais e documentos de faturamento
-- Public: false
-- File Size Limit: 20MB
-- Allowed MIME Types: application/pdf, image/*, application/xml

-- BUCKET: compliance
-- Descrição: Evidências e documentos de compliance
-- Public: false
-- File Size Limit: 50MB
-- Allowed MIME Types: image/*, application/pdf, application/*, video/*

-- BUCKET: consignacao
-- Descrição: Comprovantes e documentos de consignação
-- Public: false
-- File Size Limit: 20MB
-- Allowed MIME Types: image/*, application/pdf

-- BUCKET: uploads
-- Descrição: Uploads gerais do sistema
-- Public: false
-- File Size Limit: 100MB
-- Allowed MIME Types: *

-- ============================================
-- FIM DA MIGRATION DE CORREÇÃO
-- 8 tabelas adicionadas
-- ============================================

