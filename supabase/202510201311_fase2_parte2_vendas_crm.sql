-- ============================================
-- Migration: FASE 2 - Core Business (Parte 2/4)
-- MÓDULO VENDAS/CRM - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo de Vendas/CRM com pipeline completo:
-- - Oportunidades de negócio
-- - Propostas comerciais
-- - Negociações e histórico
-- - Atividades/tarefas
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. OPORTUNIDADES (pipeline de vendas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Cliente
  lead_id UUID REFERENCES public.leads(id),
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_email TEXT,
  cliente_telefone TEXT,
  
  -- Vendedor
  vendedor_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Classificação
  origem TEXT CHECK (origem IN ('inbound', 'outbound', 'indicacao', 'evento', 'website', 'midia_social', 'outro')) DEFAULT 'inbound',
  tipo TEXT CHECK (tipo IN ('nova_venda', 'upsell', 'cross_sell', 'renovacao')) DEFAULT 'nova_venda',
  segmento TEXT,
  
  -- Pipeline
  estagio TEXT CHECK (estagio IN ('qualificacao', 'apresentacao', 'proposta', 'negociacao', 'fechamento', 'ganho', 'perdido')) DEFAULT 'qualificacao',
  probabilidade INTEGER CHECK (probabilidade BETWEEN 0 AND 100) DEFAULT 50,
  
  -- Valores
  valor_estimado DECIMAL(12, 2),
  valor_fechado DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  
  -- Datas
  data_abertura DATE DEFAULT CURRENT_DATE,
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  
  -- Resultado
  motivo_ganho TEXT,
  motivo_perda TEXT,
  concorrente TEXT,
  
  -- Observações
  observacoes TEXT,
  proximos_passos TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_empresa ON public.oportunidades(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_oportunidades_vendedor ON public.oportunidades(vendedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_oportunidades_estagio ON public.oportunidades(estagio, probabilidade DESC) WHERE estagio NOT IN ('ganho', 'perdido');
CREATE INDEX IF NOT EXISTS idx_oportunidades_lead ON public.oportunidades(lead_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_oportunidades_fechamento ON public.oportunidades(data_fechamento_prevista) WHERE estagio NOT IN ('ganho', 'perdido');

COMMENT ON TABLE public.oportunidades IS 'Oportunidades de negócio (pipeline CRM)';

-- ============================================
-- 2. PROPOSTAS (propostas comerciais)
-- ============================================
CREATE TABLE IF NOT EXISTS public.propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  versao INTEGER DEFAULT 1,
  
  -- Relacionamentos
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_contato TEXT,
  
  -- Responsável
  elaborada_por_id UUID NOT NULL REFERENCES public.usuarios(id),
  aprovada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Condições comerciais
  validade_dias INTEGER DEFAULT 30,
  data_validade DATE,
  condicoes_pagamento TEXT,
  prazo_entrega TEXT,
  garantia TEXT,
  
  -- Valores
  valor_produtos DECIMAL(12, 2) DEFAULT 0,
  valor_servicos DECIMAL(12, 2) DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  valor_impostos DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2),
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'aprovada', 'rejeitada', 'aceita', 'expirada', 'cancelada')) DEFAULT 'rascunho',
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Documentos
  pdf_url TEXT,
  template_usado TEXT,
  
  -- Observações
  observacoes_internas TEXT,
  observacoes_cliente TEXT,
  motivo_rejeicao TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero, versao)
);

CREATE INDEX IF NOT EXISTS idx_propostas_empresa ON public.propostas(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_oportunidade ON public.propostas(oportunidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_elaborada_por ON public.propostas(elaborada_por_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_status ON public.propostas(status, data_envio DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_propostas_validade ON public.propostas(data_validade) WHERE status = 'enviada';

COMMENT ON TABLE public.propostas IS 'Propostas comerciais enviadas a clientes';

-- ============================================
-- 3. ITENS_PROPOSTA (produtos/serviços da proposta)
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_proposta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES public.propostas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id),
  
  -- Item
  numero_item INTEGER NOT NULL,
  tipo TEXT CHECK (tipo IN ('produto', 'servico', 'taxa', 'desconto')) DEFAULT 'produto',
  codigo TEXT,
  descricao TEXT NOT NULL,
  especificacoes TEXT,
  
  -- Quantidades
  quantidade DECIMAL(10, 3) NOT NULL DEFAULT 1,
  unidade TEXT DEFAULT 'UN',
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  aliquota_imposto DECIMAL(5, 2) DEFAULT 0,
  valor_imposto DECIMAL(12, 2) DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  imagem_url TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(proposta_id, numero_item)
);

CREATE INDEX IF NOT EXISTS idx_itens_proposta_proposta ON public.itens_proposta(proposta_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_proposta_produto ON public.itens_proposta(produto_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.itens_proposta IS 'Itens detalhados das propostas comerciais';

-- ============================================
-- 4. NEGOCIACOES (histórico de negociações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.negociacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  oportunidade_id UUID NOT NULL REFERENCES public.oportunidades(id) ON DELETE CASCADE,
  proposta_id UUID REFERENCES public.propostas(id),
  
  -- Negociação
  tipo TEXT CHECK (tipo IN ('email', 'telefone', 'reuniao', 'videoconferencia', 'whatsapp', 'presencial', 'outro')) NOT NULL,
  assunto TEXT NOT NULL,
  descricao TEXT,
  
  -- Participantes
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  participantes_internos TEXT[],
  participantes_cliente TEXT[],
  
  -- Resultado
  resultado TEXT CHECK (resultado IN ('positivo', 'neutro', 'negativo', 'pendente')) DEFAULT 'pendente',
  proxima_acao TEXT,
  data_proxima_acao DATE,
  
  -- Valores negociados
  valor_inicial DECIMAL(12, 2),
  valor_proposto DECIMAL(12, 2),
  valor_contraproposta DECIMAL(12, 2),
  
  -- Documentos
  anexos_urls TEXT[],
  gravacao_url TEXT,
  
  -- Data e duração
  data_negociacao TIMESTAMPTZ DEFAULT NOW(),
  duracao_minutos INTEGER,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negociacoes_empresa ON public.negociacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_oportunidade ON public.negociacoes(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_proposta ON public.negociacoes(proposta_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_responsavel ON public.negociacoes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_negociacoes_data ON public.negociacoes(data_negociacao DESC);

COMMENT ON TABLE public.negociacoes IS 'Histórico de negociações e interações comerciais';

-- ============================================
-- 5. ATIVIDADES_CRM (tarefas e follow-ups)
-- ============================================
CREATE TABLE IF NOT EXISTS public.atividades_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('tarefa', 'ligacao', 'email', 'reuniao', 'lembrete', 'acompanhamento', 'outro')) NOT NULL,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Conteúdo
  titulo TEXT NOT NULL,
  descricao TEXT,
  
  -- Relacionamentos
  oportunidade_id UUID REFERENCES public.oportunidades(id),
  lead_id UUID REFERENCES public.leads(id),
  proposta_id UUID REFERENCES public.propostas(id),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  criada_por_id UUID REFERENCES public.usuarios(id),
  
  -- Datas
  data_vencimento TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  data_lembrete TIMESTAMPTZ,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada', 'atrasada')) DEFAULT 'pendente',
  
  -- Resultado
  resultado TEXT,
  tempo_gasto_minutos INTEGER,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_atividades_crm_empresa ON public.atividades_crm(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_atividades_crm_responsavel ON public.atividades_crm(responsavel_id) WHERE status IN ('pendente', 'em_andamento');
CREATE INDEX IF NOT EXISTS idx_atividades_crm_oportunidade ON public.atividades_crm(oportunidade_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_atividades_crm_vencimento ON public.atividades_crm(data_vencimento) WHERE status IN ('pendente', 'em_andamento');
CREATE INDEX IF NOT EXISTS idx_atividades_crm_lembrete ON public.atividades_crm(data_lembrete) WHERE status = 'pendente';

COMMENT ON TABLE public.atividades_crm IS 'Atividades, tarefas e follow-ups do CRM';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_oportunidades_updated
  BEFORE UPDATE ON public.oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_propostas_updated
  BEFORE UPDATE ON public.propostas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_proposta_updated
  BEFORE UPDATE ON public.itens_proposta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_negociacoes_updated
  BEFORE UPDATE ON public.negociacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_atividades_crm_updated
  BEFORE UPDATE ON public.atividades_crm
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO VENDAS/CRM (5 tabelas)
-- ============================================

