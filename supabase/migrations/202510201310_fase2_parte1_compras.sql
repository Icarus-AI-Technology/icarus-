-- ============================================
-- Migration: FASE 2 - Core Business (Parte 1/4)
-- MÓDULO COMPRAS - 5 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo de Compras com ciclo completo:
-- - Solicitações de compra
-- - Cotações e comparativos
-- - Relacionamento fornecedor-produto
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. SOLICITACOES_COMPRA (requisições internas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('normal', 'urgente', 'programada', 'consignacao')) DEFAULT 'normal',
  
  -- Solicitante
  solicitante_id UUID NOT NULL REFERENCES public.usuarios(id),
  departamento TEXT,
  centro_custo TEXT,
  
  -- Justificativa
  justificativa TEXT NOT NULL,
  observacoes TEXT,
  
  -- Datas
  data_solicitacao DATE DEFAULT CURRENT_DATE,
  data_necessidade DATE NOT NULL,
  data_aprovacao DATE,
  
  -- Aprovação
  aprovador_id UUID REFERENCES public.usuarios(id),
  status TEXT CHECK (status IN ('rascunho', 'pendente', 'aprovada', 'rejeitada', 'convertida', 'cancelada')) DEFAULT 'rascunho',
  motivo_rejeicao TEXT,
  
  -- Valores estimados
  valor_estimado DECIMAL(12, 2),
  valor_aprovado DECIMAL(12, 2),
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_empresa ON public.solicitacoes_compra(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_solicitante ON public.solicitacoes_compra(solicitante_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_status ON public.solicitacoes_compra(status, data_solicitacao DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_necessidade ON public.solicitacoes_compra(data_necessidade) WHERE status IN ('aprovada', 'pendente');

COMMENT ON TABLE public.solicitacoes_compra IS 'Solicitações de compra internas (requisições)';

-- ============================================
-- 2. ITENS_PEDIDO_COMPRA (itens dos pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_pedido_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_compra_id UUID NOT NULL REFERENCES public.pedidos_compra(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  
  -- Quantidades
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  quantidade_recebida INTEGER DEFAULT 0 CHECK (quantidade_recebida >= 0),
  quantidade_pendente INTEGER GENERATED ALWAYS AS (quantidade - quantidade_recebida) STORED,
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Impostos
  aliquota_ipi DECIMAL(5, 2) DEFAULT 0,
  valor_ipi DECIMAL(12, 2) DEFAULT 0,
  aliquota_icms DECIMAL(5, 2) DEFAULT 0,
  valor_icms DECIMAL(12, 2) DEFAULT 0,
  
  -- Entrega
  data_entrega_prevista DATE,
  data_entrega_realizada DATE,
  
  -- Referências
  solicitacao_compra_id UUID REFERENCES public.solicitacoes_compra(id),
  numero_item INTEGER,
  
  -- Observações
  observacoes TEXT,
  especificacoes_tecnicas TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'parcial', 'recebido', 'cancelado')) DEFAULT 'pendente',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_pedido ON public.itens_pedido_compra(pedido_compra_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_produto ON public.itens_pedido_compra(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_status ON public.itens_pedido_compra(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_pedido_compra_entrega ON public.itens_pedido_compra(data_entrega_prevista) WHERE status = 'pendente';

COMMENT ON TABLE public.itens_pedido_compra IS 'Itens detalhados dos pedidos de compra';

-- ============================================
-- 3. COTACOES (cotações de preços)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('preco', 'proposta', 'orcamento')) DEFAULT 'preco',
  
  -- Origem
  solicitacao_compra_id UUID REFERENCES public.solicitacoes_compra(id),
  
  -- Responsável
  comprador_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Datas
  data_abertura DATE DEFAULT CURRENT_DATE,
  data_fechamento DATE NOT NULL,
  data_limite_resposta DATE,
  
  -- Condições
  condicoes_pagamento TEXT,
  prazo_entrega_dias INTEGER,
  local_entrega TEXT,
  observacoes TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'finalizada', 'cancelada')) DEFAULT 'rascunho',
  
  -- Resultado
  fornecedor_vencedor_id UUID REFERENCES public.fornecedores(id),
  valor_total_vencedor DECIMAL(12, 2),
  motivo_escolha TEXT,
  data_decisao DATE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_cotacoes_empresa ON public.cotacoes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cotacoes_comprador ON public.cotacoes(comprador_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON public.cotacoes(status, data_abertura DESC) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cotacoes_fechamento ON public.cotacoes(data_fechamento) WHERE status = 'enviada';

COMMENT ON TABLE public.cotacoes IS 'Cotações de preços com fornecedores';

-- ============================================
-- 4. ITENS_COTACAO (itens e respostas por fornecedor)
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  
  -- Solicitação
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  especificacao_solicitada TEXT,
  
  -- Resposta do fornecedor
  valor_unitario DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2),
  prazo_entrega_dias INTEGER,
  marca_oferecida TEXT,
  modelo_oferecido TEXT,
  observacoes_fornecedor TEXT,
  
  -- Impostos
  aliquota_ipi DECIMAL(5, 2),
  aliquota_icms DECIMAL(5, 2),
  
  -- Avaliação
  pontuacao_qualidade INTEGER CHECK (pontuacao_qualidade BETWEEN 1 AND 5),
  pontuacao_preco INTEGER CHECK (pontuacao_preco BETWEEN 1 AND 5),
  pontuacao_prazo INTEGER CHECK (pontuacao_prazo BETWEEN 1 AND 5),
  pontuacao_total DECIMAL(5, 2),
  
  -- Status
  status TEXT CHECK (status IN ('aguardando', 'respondido', 'selecionado', 'rejeitado', 'sem_resposta')) DEFAULT 'aguardando',
  data_resposta TIMESTAMPTZ,
  selecionado BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cotacao_id, fornecedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_itens_cotacao_cotacao ON public.itens_cotacao(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_itens_cotacao_fornecedor ON public.itens_cotacao(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_itens_cotacao_produto ON public.itens_cotacao(produto_id);
CREATE INDEX IF NOT EXISTS idx_itens_cotacao_selecionados ON public.itens_cotacao(cotacao_id, selecionado) WHERE selecionado = TRUE;

COMMENT ON TABLE public.itens_cotacao IS 'Itens cotados por fornecedor (mapa de cotação)';

-- ============================================
-- 5. FORNECEDORES_PRODUTOS (relacionamento N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS public.fornecedores_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  
  -- Dados comerciais
  codigo_fornecedor TEXT, -- Código do produto no catálogo do fornecedor
  descricao_fornecedor TEXT,
  marca TEXT,
  modelo TEXT,
  
  -- Preços
  preco_unitario DECIMAL(12, 2),
  preco_ultima_compra DECIMAL(12, 2),
  data_ultima_compra DATE,
  
  -- Condições
  prazo_entrega_dias INTEGER,
  quantidade_minima INTEGER DEFAULT 1,
  quantidade_multiplo INTEGER DEFAULT 1,
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  
  -- Qualificação
  fornecedor_preferencial BOOLEAN DEFAULT FALSE,
  ultima_avaliacao INTEGER CHECK (ultima_avaliacao BETWEEN 1 AND 5),
  observacoes TEXT,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, fornecedor_id, produto_id)
);

CREATE INDEX IF NOT EXISTS idx_fornecedores_produtos_empresa ON public.fornecedores_produtos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_fornecedores_produtos_fornecedor ON public.fornecedores_produtos(fornecedor_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_fornecedores_produtos_produto ON public.fornecedores_produtos(produto_id) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_fornecedores_produtos_preferencial ON public.fornecedores_produtos(produto_id, fornecedor_preferencial) WHERE fornecedor_preferencial = TRUE;

COMMENT ON TABLE public.fornecedores_produtos IS 'Catálogo de produtos por fornecedor';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_solicitacoes_compra_updated
  BEFORE UPDATE ON public.solicitacoes_compra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_pedido_compra_updated
  BEFORE UPDATE ON public.itens_pedido_compra
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cotacoes_updated
  BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_cotacao_updated
  BEFORE UPDATE ON public.itens_cotacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fornecedores_produtos_updated
  BEFORE UPDATE ON public.fornecedores_produtos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO COMPRAS (5 tabelas)
-- ============================================

