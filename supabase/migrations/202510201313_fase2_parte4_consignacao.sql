-- ============================================
-- Migration: FASE 2 - Core Business (Parte 4/4)
-- MÓDULO CONSIGNAÇÃO - 4 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Completa módulo de Consignação com operação detalhada:
-- - Remessas de consignação
-- - Itens consignados
-- - Devoluções
-- - Reservas de estoque
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. REMESSAS_CONSIGNACAO (remessas enviadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.remessas_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('envio', 'reposicao', 'transferencia')) DEFAULT 'envio',
  
  -- Contrato
  contrato_consignacao_id UUID NOT NULL REFERENCES public.contratos_consignacao(id) ON DELETE RESTRICT,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Destino
  hospital_id UUID REFERENCES public.hospitais(id),
  local_destino TEXT NOT NULL,
  endereco_entrega TEXT,
  
  -- Cirurgia relacionada (opcional)
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  medico_id UUID REFERENCES public.medicos(id),
  
  -- Datas
  data_remessa DATE DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE NOT NULL,
  data_entrega_realizada DATE,
  data_vencimento_devolucao DATE,
  
  -- Responsáveis
  responsavel_envio_id UUID REFERENCES public.usuarios(id),
  responsavel_recebimento TEXT,
  
  -- Valores
  valor_total_materiais DECIMAL(12, 2) DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2),
  
  -- Transporte
  transportadora TEXT,
  rastreamento TEXT,
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  
  -- Status
  status TEXT CHECK (status IN (
    'preparacao', 'enviada', 'em_transito', 'entregue', 
    'parcialmente_devolvida', 'totalmente_devolvida', 
    'faturada', 'cancelada'
  )) DEFAULT 'preparacao',
  
  -- Observações
  observacoes TEXT,
  condicoes_especiais TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_empresa ON public.remessas_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_contrato ON public.remessas_consignacao(contrato_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_fornecedor ON public.remessas_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_hospital ON public.remessas_consignacao(hospital_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_cirurgia ON public.remessas_consignacao(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_remessas_consignacao_status ON public.remessas_consignacao(status, data_remessa DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.remessas_consignacao IS 'Remessas de materiais em consignação';

-- ============================================
-- 2. ITENS_CONSIGNACAO (itens da remessa)
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remessa_consignacao_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Identificação do item
  numero_item INTEGER NOT NULL,
  numero_serie TEXT,
  
  -- Quantidades
  quantidade_enviada INTEGER NOT NULL CHECK (quantidade_enviada > 0),
  quantidade_utilizada INTEGER DEFAULT 0 CHECK (quantidade_utilizada >= 0),
  quantidade_devolvida INTEGER DEFAULT 0 CHECK (quantidade_devolvida >= 0),
  quantidade_pendente INTEGER GENERATED ALWAYS AS (quantidade_enviada - quantidade_utilizada - quantidade_devolvida) STORED,
  
  -- Valores
  valor_unitario DECIMAL(12, 2) NOT NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  
  -- Rastreabilidade ANVISA
  data_validade DATE,
  registro_anvisa TEXT,
  
  -- Utilização
  cirurgia_material_id UUID REFERENCES public.cirurgia_materiais(id),
  data_utilizacao TIMESTAMPTZ,
  responsavel_utilizacao UUID REFERENCES public.usuarios(id),
  
  -- Devolução
  data_devolucao TIMESTAMPTZ,
  motivo_devolucao TEXT,
  condicao_devolucao TEXT CHECK (condicao_devolucao IN ('perfeito', 'avariado', 'vencido', 'incompleto')),
  
  -- Status
  status TEXT CHECK (status IN (
    'disponivel', 'reservado', 'utilizado', 
    'devolvido', 'faturado', 'perdido'
  )) DEFAULT 'disponivel',
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_itens_consignacao_remessa ON public.itens_consignacao(remessa_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_consignacao_produto ON public.itens_consignacao(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_consignacao_lote ON public.itens_consignacao(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_consignacao_status ON public.itens_consignacao(status) WHERE status IN ('disponivel', 'reservado');
CREATE INDEX IF NOT EXISTS idx_itens_consignacao_serie ON public.itens_consignacao(numero_serie) WHERE numero_serie IS NOT NULL;

COMMENT ON TABLE public.itens_consignacao IS 'Itens individuais das remessas em consignação';

-- ============================================
-- 3. DEVOLUCOES_CONSIGNACAO (devoluções agrupadas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.devolucoes_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  
  -- Remessa origem
  remessa_consignacao_id UUID NOT NULL REFERENCES public.remessas_consignacao(id) ON DELETE RESTRICT,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Datas
  data_devolucao DATE DEFAULT CURRENT_DATE,
  data_coleta_prevista DATE,
  data_coleta_realizada DATE,
  
  -- Responsáveis
  responsavel_devolucao_id UUID REFERENCES public.usuarios(id),
  recebido_por TEXT,
  
  -- Valores
  valor_total_devolvido DECIMAL(12, 2) DEFAULT 0,
  valor_desconto_avaria DECIMAL(12, 2) DEFAULT 0,
  valor_liquido DECIMAL(12, 2),
  
  -- Transporte
  transportadora TEXT,
  rastreamento TEXT,
  nota_fiscal_devolucao_id UUID REFERENCES public.notas_fiscais(id),
  
  -- Motivo
  motivo TEXT CHECK (motivo IN (
    'nao_utilizado', 'excedente', 'vencimento_proximo', 
    'troca', 'avaria', 'outro'
  )) NOT NULL,
  motivo_detalhado TEXT,
  
  -- Status
  status TEXT CHECK (status IN (
    'rascunho', 'aguardando_coleta', 'em_transito', 
    'recebida_fornecedor', 'conferida', 'cancelada'
  )) DEFAULT 'rascunho',
  
  -- Conferência
  conferido BOOLEAN DEFAULT FALSE,
  data_conferencia DATE,
  conferido_por TEXT,
  divergencias TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_devolucoes_consignacao_empresa ON public.devolucoes_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_devolucoes_consignacao_remessa ON public.devolucoes_consignacao(remessa_consignacao_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_devolucoes_consignacao_fornecedor ON public.devolucoes_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_devolucoes_consignacao_status ON public.devolucoes_consignacao(status, data_devolucao DESC) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.devolucoes_consignacao IS 'Devoluções de materiais consignados';

-- ============================================
-- 4. ESTOQUE_RESERVAS (reservas de estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estoque_reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  estoque_id UUID NOT NULL REFERENCES public.estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Quantidade
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  quantidade_consumida INTEGER DEFAULT 0 CHECK (quantidade_consumida >= 0),
  quantidade_disponivel INTEGER GENERATED ALWAYS AS (quantidade - quantidade_consumida) STORED,
  
  -- Motivo da reserva
  tipo_reserva TEXT CHECK (tipo_reserva IN (
    'cirurgia', 'pedido_venda', 'transferencia', 
    'manutencao', 'demonstracao', 'outro'
  )) NOT NULL,
  
  -- Referência
  referencia_tipo TEXT, -- Ex: "cirurgia", "proposta", "pedido"
  referencia_id UUID,
  cirurgia_id UUID REFERENCES public.cirurgias(id),
  
  -- Responsável
  responsavel_id UUID NOT NULL REFERENCES public.usuarios(id),
  
  -- Datas
  data_reserva TIMESTAMPTZ DEFAULT NOW(),
  data_validade_reserva TIMESTAMPTZ NOT NULL,
  data_liberacao TIMESTAMPTZ,
  
  -- Status
  status TEXT CHECK (status IN (
    'ativa', 'consumida', 'liberada', 'expirada', 'cancelada'
  )) DEFAULT 'ativa',
  
  -- Motivo liberação/cancelamento
  motivo_liberacao TEXT,
  
  -- Observações
  observacoes TEXT,
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  liberado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_estoque_reservas_empresa ON public.estoque_reservas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_estoque ON public.estoque_reservas(estoque_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_produto ON public.estoque_reservas(produto_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_cirurgia ON public.estoque_reservas(cirurgia_id) WHERE cirurgia_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_status ON public.estoque_reservas(status, data_validade_reserva);
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_responsavel ON public.estoque_reservas(responsavel_id) WHERE status = 'ativa';
CREATE INDEX IF NOT EXISTS idx_estoque_reservas_referencia ON public.estoque_reservas(referencia_tipo, referencia_id);

COMMENT ON TABLE public.estoque_reservas IS 'Reservas de estoque para cirurgias e outras finalidades';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_remessas_consignacao_updated
  BEFORE UPDATE ON public.remessas_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_itens_consignacao_updated
  BEFORE UPDATE ON public.itens_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_devolucoes_consignacao_updated
  BEFORE UPDATE ON public.devolucoes_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_estoque_reservas_updated
  BEFORE UPDATE ON public.estoque_reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO CONSIGNAÇÃO (4 tabelas)
-- ============================================
-- FASE 2 COMPLETA: 20 tabelas
-- - Compras: 5 tabelas
-- - Vendas/CRM: 5 tabelas
-- - Financeiro: 6 tabelas
-- - Consignação: 4 tabelas
-- ============================================

