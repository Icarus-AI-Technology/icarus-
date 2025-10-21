-- ============================================
-- Migration: FASE 2 - Core Business (Parte 3/4)
-- MÓDULO FINANCEIRO - 6 tabelas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Expande módulo Financeiro com gestão completa:
-- - Contas a pagar e receber
-- - Fluxo de caixa
-- - Contas bancárias
-- - Centros de custo
-- - Lançamentos contábeis
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. CONTAS_PAGAR (contas a pagar)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('fornecedor', 'folha', 'tributo', 'servico', 'aluguel', 'financiamento', 'outro')) DEFAULT 'fornecedor',
  
  -- Fornecedor
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  fornecedor_nome TEXT,
  fornecedor_cnpj TEXT,
  
  -- Documento origem
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  pedido_compra_id UUID REFERENCES public.pedidos_compra(id),
  numero_documento TEXT,
  
  -- Valores
  valor_original DECIMAL(12, 2) NOT NULL,
  valor_juros DECIMAL(12, 2) DEFAULT 0,
  valor_multa DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_pago DECIMAL(12, 2) DEFAULT 0,
  valor_saldo DECIMAL(12, 2) GENERATED ALWAYS AS (valor_original + valor_juros + valor_multa - valor_desconto - valor_pago) STORED,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  
  -- Classificação
  centro_custo_id UUID,
  categoria TEXT,
  plano_contas_id UUID,
  
  -- Pagamento
  forma_pagamento TEXT CHECK (forma_pagamento IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')) DEFAULT 'transferencia',
  banco_id UUID,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'agendado', 'pago', 'atrasado', 'cancelado', 'parcial')) DEFAULT 'pendente',
  
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

CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa ON public.contas_pagar(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON public.contas_pagar(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status, data_vencimento) WHERE status NOT IN ('pago', 'cancelado');
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON public.contas_pagar(data_vencimento) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_contas_pagar_centro_custo ON public.contas_pagar(centro_custo_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.contas_pagar IS 'Contas a pagar (fornecedores, despesas)';

-- ============================================
-- 2. CONTAS_RECEBER (contas a receber)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('venda', 'servico', 'consignacao', 'aluguel', 'outro')) DEFAULT 'venda',
  
  -- Cliente
  cliente_nome TEXT NOT NULL,
  cliente_cnpj TEXT,
  cliente_id UUID, -- Pode ser lead, oportunidade, etc
  
  -- Documento origem
  nota_fiscal_id UUID REFERENCES public.notas_fiscais(id),
  fatura_id UUID REFERENCES public.faturas(id),
  numero_documento TEXT,
  
  -- Valores
  valor_original DECIMAL(12, 2) NOT NULL,
  valor_juros DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_recebido DECIMAL(12, 2) DEFAULT 0,
  valor_saldo DECIMAL(12, 2) GENERATED ALWAYS AS (valor_original + valor_juros - valor_desconto - valor_recebido) STORED,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  
  -- Classificação
  centro_custo_id UUID,
  categoria TEXT,
  plano_contas_id UUID,
  
  -- Recebimento
  forma_recebimento TEXT CHECK (forma_recebimento IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')) DEFAULT 'transferencia',
  banco_id UUID,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'recebido', 'atrasado', 'cancelado', 'parcial', 'protesto')) DEFAULT 'pendente',
  
  -- Cobrança
  boleto_url TEXT,
  boleto_nosso_numero TEXT,
  data_protesto DATE,
  
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

CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa ON public.contas_receber(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contas_receber_cliente ON public.contas_receber(cliente_nome) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON public.contas_receber(status, data_vencimento) WHERE status NOT IN ('recebido', 'cancelado');
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON public.contas_receber(data_vencimento) WHERE status = 'pendente';
CREATE INDEX IF NOT EXISTS idx_contas_receber_centro_custo ON public.contas_receber(centro_custo_id) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.contas_receber IS 'Contas a receber (clientes, receitas)';

-- ============================================
-- 3. FLUXO_CAIXA (movimentações de caixa)
-- ============================================
CREATE TABLE IF NOT EXISTS public.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo de movimentação
  tipo TEXT CHECK (tipo IN ('entrada', 'saida', 'transferencia')) NOT NULL,
  categoria TEXT NOT NULL,
  
  -- Descrição
  descricao TEXT NOT NULL,
  observacoes TEXT,
  
  -- Conta bancária
  banco_id UUID,
  banco_nome TEXT,
  
  -- Valores
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  saldo_anterior DECIMAL(12, 2),
  saldo_atual DECIMAL(12, 2),
  
  -- Origem
  origem_tipo TEXT, -- Ex: "conta_pagar", "conta_receber", "estoque"
  origem_id UUID,
  documento_numero TEXT,
  
  -- Classificação
  centro_custo_id UUID,
  plano_contas_id UUID,
  
  -- Forma de pagamento/recebimento
  forma TEXT CHECK (forma IN ('dinheiro', 'pix', 'boleto', 'transferencia', 'cartao_credito', 'cartao_debito', 'cheque')),
  
  -- Data
  data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_compensacao DATE,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'cancelado')) DEFAULT 'confirmado',
  conciliado BOOLEAN DEFAULT FALSE,
  data_conciliacao DATE,
  
  -- Transferência
  conta_destino_id UUID,
  
  -- Metadata
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_empresa ON public.fluxo_caixa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_banco ON public.fluxo_caixa(banco_id);
CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_tipo ON public.fluxo_caixa(tipo, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_data ON public.fluxo_caixa(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_origem ON public.fluxo_caixa(origem_tipo, origem_id);
CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_conciliacao ON public.fluxo_caixa(conciliado, banco_id) WHERE NOT conciliado;

COMMENT ON TABLE public.fluxo_caixa IS 'Movimentações financeiras (entradas e saídas)';

-- ============================================
-- 4. BANCOS (contas bancárias)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bancos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados do banco
  codigo_banco TEXT NOT NULL,
  nome_banco TEXT NOT NULL,
  
  -- Conta
  agencia TEXT NOT NULL,
  agencia_digito TEXT,
  conta TEXT NOT NULL,
  conta_digito TEXT,
  tipo_conta TEXT CHECK (tipo_conta IN ('corrente', 'poupanca', 'investimento')) DEFAULT 'corrente',
  
  -- Identificação
  apelido TEXT NOT NULL,
  
  -- Saldos
  saldo_inicial DECIMAL(12, 2) DEFAULT 0,
  saldo_atual DECIMAL(12, 2) DEFAULT 0,
  data_saldo DATE DEFAULT CURRENT_DATE,
  
  -- Limites
  limite_cheque_especial DECIMAL(12, 2) DEFAULT 0,
  limite_usado DECIMAL(12, 2) DEFAULT 0,
  
  -- PIX
  chave_pix TEXT,
  tipo_chave_pix TEXT CHECK (tipo_chave_pix IN ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  
  -- Integração bancária
  pluggy_item_id TEXT,
  pluggy_account_id TEXT,
  sincronizacao_automatica BOOLEAN DEFAULT FALSE,
  ultima_sincronizacao TIMESTAMPTZ,
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  conta_principal BOOLEAN DEFAULT FALSE,
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo_banco, agencia, conta)
);

CREATE INDEX IF NOT EXISTS idx_bancos_empresa ON public.bancos(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_bancos_ativo ON public.bancos(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_bancos_principal ON public.bancos(empresa_id, conta_principal) WHERE conta_principal = TRUE;

COMMENT ON TABLE public.bancos IS 'Contas bancárias da empresa';

-- ============================================
-- 5. CENTROS_CUSTO (centros de custo)
-- ============================================
CREATE TABLE IF NOT EXISTS public.centros_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  
  -- Hierarquia
  centro_custo_pai_id UUID REFERENCES public.centros_custo(id),
  nivel INTEGER DEFAULT 1,
  caminho TEXT, -- Ex: "Matriz/Administrativo/TI"
  
  -- Tipo
  tipo TEXT CHECK (tipo IN ('receita', 'despesa', 'investimento')) DEFAULT 'despesa',
  
  -- Orçamento
  orcamento_mensal DECIMAL(12, 2),
  orcamento_anual DECIMAL(12, 2),
  
  -- Responsável
  responsavel_id UUID REFERENCES public.usuarios(id),
  
  -- Status
  ativo BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, codigo)
);

CREATE INDEX IF NOT EXISTS idx_centros_custo_empresa ON public.centros_custo(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_centros_custo_pai ON public.centros_custo(centro_custo_pai_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_centros_custo_ativo ON public.centros_custo(ativo) WHERE ativo = TRUE;

COMMENT ON TABLE public.centros_custo IS 'Centros de custo para controle gerencial';

-- ============================================
-- 6. LANCAMENTOS_CONTABEIS (lançamentos contábeis)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lancamentos_contabeis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  numero_lancamento TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('debito', 'credito')) NOT NULL,
  
  -- Conta contábil (simplificado)
  plano_contas_codigo TEXT NOT NULL,
  plano_contas_nome TEXT,
  
  -- Descrição
  historico TEXT NOT NULL,
  complemento TEXT,
  
  -- Valor
  valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
  
  -- Classificação
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  
  -- Origem
  documento_tipo TEXT, -- Ex: "nota_fiscal", "conta_pagar", "fluxo_caixa"
  documento_id UUID,
  documento_numero TEXT,
  
  -- Data
  data_lancamento DATE NOT NULL,
  data_competencia DATE,
  
  -- Lote
  lote_id UUID, -- Para agrupar lançamentos relacionados
  
  -- Status
  status TEXT CHECK (status IN ('provisorio', 'definitivo', 'cancelado')) DEFAULT 'definitivo',
  
  -- Conciliação
  conciliado BOOLEAN DEFAULT FALSE,
  data_conciliacao DATE,
  
  -- Metadata
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_empresa ON public.lancamentos_contabeis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_conta ON public.lancamentos_contabeis(plano_contas_codigo, data_lancamento DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_tipo ON public.lancamentos_contabeis(tipo, data_lancamento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_data ON public.lancamentos_contabeis(data_lancamento DESC);
CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_lote ON public.lancamentos_contabeis(lote_id) WHERE lote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lancamentos_contabeis_documento ON public.lancamentos_contabeis(documento_tipo, documento_id);

COMMENT ON TABLE public.lancamentos_contabeis IS 'Lançamentos contábeis (débito e crédito)';

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_contas_pagar_updated
  BEFORE UPDATE ON public.contas_pagar
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contas_receber_updated
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_fluxo_caixa_updated
  BEFORE UPDATE ON public.fluxo_caixa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bancos_updated
  BEFORE UPDATE ON public.bancos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_centros_custo_updated
  BEFORE UPDATE ON public.centros_custo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_lancamentos_contabeis_updated
  BEFORE UPDATE ON public.lancamentos_contabeis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM MÓDULO FINANCEIRO (6 tabelas)
-- ============================================

