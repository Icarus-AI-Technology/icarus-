-- ============================================
-- Migration: FASE 1 - Tabelas Críticas pt-BR
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- ============================================
-- Descrição:
-- Cria 10 tabelas CRÍTICAS para operação básica do ICARUS v5.0
-- NOMENCLATURA: 100% pt-BR snake_case
-- SEM RLS (aplicar por último)
-- ============================================

-- ============================================
-- 1. PACIENTES (dados sensíveis LGPD)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados pessoais (criptografados)
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'outro', 'nao_informado')),
  
  -- Contato
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  -- Endereço
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  
  -- Dados clínicos
  peso DECIMAL(5, 2),
  altura DECIMAL(3, 2),
  tipo_sanguineo TEXT CHECK (tipo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  alergias TEXT,
  comorbidades TEXT,
  medicamentos_uso TEXT,
  observacoes_medicas TEXT,
  
  -- LGPD
  consentimento_lgpd BOOLEAN DEFAULT FALSE,
  data_consentimento TIMESTAMPTZ,
  
  -- Metadata
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'anonimizado')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_pacientes_empresa ON public.pacientes(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON public.pacientes USING gin(to_tsvector('portuguese', nome_completo)) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON public.pacientes(cpf) WHERE excluido_em IS NULL AND cpf IS NOT NULL;

COMMENT ON TABLE public.pacientes IS 'Cadastro de pacientes (LGPD sensível)';

-- ============================================
-- 2. CONVENIOS (planos de saúde)
-- ============================================
CREATE TABLE IF NOT EXISTS public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Dados do convênio
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT,
  ans_registro TEXT, -- Registro ANS
  tipo TEXT CHECK (tipo IN ('plano_saude', 'operadora', 'autogestao', 'cooperativa', 'particular')) DEFAULT 'plano_saude',
  
  -- Contato
  telefone TEXT,
  email TEXT,
  site TEXT,
  
  -- Endereço
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  
  -- Configurações comerciais
  prazo_pagamento_dias INTEGER DEFAULT 30,
  percentual_desconto DECIMAL(5, 2) DEFAULT 0,
  observacoes TEXT,
  
  -- Metadata
  status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso', 'em_negociacao')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, cnpj)
);

CREATE INDEX IF NOT EXISTS idx_convenios_empresa ON public.convenios(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_convenios_nome ON public.convenios USING gin(to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.convenios IS 'Cadastro de convênios e planos de saúde';

-- ============================================
-- 3. CIRURGIA_MATERIAIS (materiais por cirurgia)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cirurgia_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE RESTRICT,
  
  -- Quantidades
  quantidade_prevista INTEGER NOT NULL DEFAULT 1,
  quantidade_utilizada INTEGER DEFAULT 0,
  quantidade_devolvida INTEGER DEFAULT 0,
  
  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  desconto_percentual DECIMAL(5, 2) DEFAULT 0,
  desconto_valor DECIMAL(12, 2) DEFAULT 0,
  
  -- Status OPME
  status TEXT CHECK (status IN ('solicitado', 'separado', 'entregue', 'utilizado', 'devolvido', 'faturado')) DEFAULT 'solicitado',
  tipo_origem TEXT CHECK (tipo_origem IN ('estoque', 'consignacao', 'compra_direta')) DEFAULT 'estoque',
  
  -- Rastreabilidade ANVISA
  numero_serie TEXT,
  data_uso TIMESTAMPTZ,
  responsavel_uso UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_cirurgia_materiais_cirurgia ON public.cirurgia_materiais(cirurgia_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cirurgia_materiais_produto ON public.cirurgia_materiais(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cirurgia_materiais_lote ON public.cirurgia_materiais(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_cirurgia_materiais_status ON public.cirurgia_materiais(status, tipo_origem) WHERE excluido_em IS NULL;

COMMENT ON TABLE public.cirurgia_materiais IS 'Materiais utilizados por cirurgia (OPME)';

-- ============================================
-- 4. CIRURGIA_EVENTOS (timeline da cirurgia)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cirurgia_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cirurgia_id UUID NOT NULL REFERENCES public.cirurgias(id) ON DELETE CASCADE,
  
  -- Tipo de evento
  tipo TEXT CHECK (tipo IN (
    'agendamento', 'confirmacao', 'alteracao_data', 'cancelamento',
    'inicio_cirurgia', 'fim_cirurgia', 'alta_paciente',
    'material_solicitado', 'material_entregue', 'material_usado',
    'complicacao', 'intercorrencia', 'observacao', 'outro'
  )) NOT NULL,
  
  -- Dados do evento
  titulo TEXT NOT NULL,
  descricao TEXT,
  dados_json JSONB, -- Dados estruturados específicos do evento
  
  -- Responsável
  usuario_id UUID REFERENCES public.usuarios(id),
  usuario_nome TEXT, -- Desnormalizado para histórico
  
  -- Metadata
  ocorrido_em TIMESTAMPTZ DEFAULT NOW(),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cirurgia_eventos_cirurgia ON public.cirurgia_eventos(cirurgia_id);
CREATE INDEX IF NOT EXISTS idx_cirurgia_eventos_tipo ON public.cirurgia_eventos(tipo, ocorrido_em DESC);
CREATE INDEX IF NOT EXISTS idx_cirurgia_eventos_usuario ON public.cirurgia_eventos(usuario_id);

COMMENT ON TABLE public.cirurgia_eventos IS 'Timeline de eventos das cirurgias (audit trail)';

-- ============================================
-- 5. ESTOQUE (posição de estoque)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  
  -- Localização
  localizacao TEXT, -- Ex: "Almoxarifado Central - Prateleira A3"
  secao TEXT,
  corredor TEXT,
  prateleira TEXT,
  
  -- Quantidades
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_disponivel >= 0),
  quantidade_reservada INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_reservada >= 0),
  quantidade_minima INTEGER DEFAULT 10, -- Ponto de reposição
  quantidade_maxima INTEGER, -- Estoque máximo
  
  -- Custos
  custo_unitario DECIMAL(12, 2),
  custo_medio DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  
  -- Metadata
  ultima_movimentacao TIMESTAMPTZ,
  status TEXT CHECK (status IN ('ativo', 'bloqueado', 'inventario', 'vencido')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  
  UNIQUE(empresa_id, produto_id, lote_id, localizacao)
);

CREATE INDEX IF NOT EXISTS idx_estoque_empresa ON public.estoque(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_estoque_produto ON public.estoque(produto_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_estoque_lote ON public.estoque(lote_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_estoque_quantidade ON public.estoque(quantidade_disponivel) WHERE quantidade_disponivel < quantidade_minima;

COMMENT ON TABLE public.estoque IS 'Posição de estoque por produto/lote/localização';

-- ============================================
-- 6. ESTOQUE_MOVIMENTACOES (histórico de movimentações)
-- ============================================
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  estoque_id UUID NOT NULL REFERENCES public.estoque(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES public.lotes(id) ON DELETE SET NULL,
  
  -- Tipo de movimentação
  tipo TEXT CHECK (tipo IN (
    'entrada_compra', 'entrada_devolucao', 'entrada_transferencia', 'entrada_ajuste',
    'saida_venda', 'saida_consignacao', 'saida_transferencia', 'saida_perda', 'saida_ajuste',
    'reserva', 'liberacao_reserva', 'inventario'
  )) NOT NULL,
  
  -- Quantidades
  quantidade INTEGER NOT NULL,
  quantidade_anterior INTEGER,
  quantidade_posterior INTEGER,
  
  -- Valores
  valor_unitario DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  
  -- Referências
  documento_tipo TEXT, -- Ex: "pedido_compra", "cirurgia", "remessa_consignacao"
  documento_id UUID, -- ID do documento de origem
  documento_numero TEXT, -- Número legível humano
  
  -- Observações
  motivo TEXT,
  observacoes TEXT,
  
  -- Metadata
  data_movimentacao TIMESTAMPTZ DEFAULT NOW(),
  usuario_id UUID REFERENCES public.usuarios(id),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_estoque_mov_empresa ON public.estoque_movimentacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_estoque ON public.estoque_movimentacoes(estoque_id);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_produto ON public.estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_tipo ON public.estoque_movimentacoes(tipo, data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_mov_documento ON public.estoque_movimentacoes(documento_tipo, documento_id);

COMMENT ON TABLE public.estoque_movimentacoes IS 'Histórico de todas movimentações de estoque (imutável)';

-- ============================================
-- 7. CONTRATOS_CONSIGNACAO (contratos de consignação)
-- ============================================
CREATE TABLE IF NOT EXISTS public.contratos_consignacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE RESTRICT,
  
  -- Dados do contrato
  numero_contrato TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('consignacao_pura', 'consignacao_venda_garantida', 'comodato')) DEFAULT 'consignacao_pura',
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE,
  prazo_meses INTEGER,
  renovacao_automatica BOOLEAN DEFAULT FALSE,
  
  -- Condições comerciais
  prazo_pagamento_dias INTEGER DEFAULT 30,
  percentual_desconto DECIMAL(5, 2) DEFAULT 0,
  prazo_devolucao_dias INTEGER DEFAULT 7,
  valor_minimo_faturamento DECIMAL(12, 2),
  
  -- Responsabilidades
  responsavel_estoque TEXT, -- Quem gerencia o estoque
  responsavel_contrato_id UUID REFERENCES public.usuarios(id),
  observacoes TEXT,
  
  -- Documentos
  anexo_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'ativo', 'suspenso', 'encerrado', 'cancelado')) DEFAULT 'rascunho',
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, numero_contrato)
);

CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_empresa ON public.contratos_consignacao(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_fornecedor ON public.contratos_consignacao(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_status ON public.contratos_consignacao(status) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_contratos_consignacao_vigencia ON public.contratos_consignacao(data_inicio, data_fim) WHERE status = 'ativo';

COMMENT ON TABLE public.contratos_consignacao IS 'Contratos de consignação com fornecedores';

-- ============================================
-- 8. NOTAS_FISCAIS (notas fiscais de entrada/saída)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  
  -- Tipo e dados da nota
  tipo TEXT CHECK (tipo IN ('entrada', 'saida', 'devolucao')) NOT NULL,
  modelo TEXT, -- Ex: "55" (NF-e), "65" (NFC-e)
  serie TEXT,
  numero TEXT NOT NULL,
  chave_acesso TEXT, -- 44 dígitos da NF-e
  
  -- Emitente/Destinatário
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  fornecedor_cnpj TEXT,
  fornecedor_nome TEXT,
  destinatario_cnpj TEXT,
  destinatario_nome TEXT,
  
  -- Datas
  data_emissao DATE NOT NULL,
  data_entrada_saida DATE,
  data_vencimento DATE,
  
  -- Valores
  valor_produtos DECIMAL(12, 2) NOT NULL DEFAULT 0,
  valor_frete DECIMAL(12, 2) DEFAULT 0,
  valor_seguro DECIMAL(12, 2) DEFAULT 0,
  valor_desconto DECIMAL(12, 2) DEFAULT 0,
  valor_outras_despesas DECIMAL(12, 2) DEFAULT 0,
  valor_icms DECIMAL(12, 2) DEFAULT 0,
  valor_ipi DECIMAL(12, 2) DEFAULT 0,
  valor_pis DECIMAL(12, 2) DEFAULT 0,
  valor_cofins DECIMAL(12, 2) DEFAULT 0,
  valor_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Referências
  documento_origem_tipo TEXT, -- Ex: "pedido_compra", "cirurgia", "remessa"
  documento_origem_id UUID,
  
  -- XML e PDF
  xml_url TEXT,
  pdf_url TEXT,
  danfe_url TEXT,
  
  -- Status SEFAZ
  status_sefaz TEXT CHECK (status_sefaz IN ('pendente', 'autorizada', 'cancelada', 'denegada', 'rejeitada')) DEFAULT 'pendente',
  protocolo_autorizacao TEXT,
  data_autorizacao TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  natureza_operacao TEXT,
  cfop TEXT,
  
  -- Metadata
  status TEXT CHECK (status IN ('rascunho', 'emitida', 'recebida', 'cancelada')) DEFAULT 'rascunho',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  criado_por UUID REFERENCES public.usuarios(id),
  atualizado_por UUID REFERENCES public.usuarios(id),
  
  UNIQUE(empresa_id, tipo, numero, serie)
);

CREATE INDEX IF NOT EXISTS idx_notas_fiscais_empresa ON public.notas_fiscais(empresa_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_fornecedor ON public.notas_fiscais(fornecedor_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_numero ON public.notas_fiscais(numero, serie) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_chave ON public.notas_fiscais(chave_acesso) WHERE chave_acesso IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_data ON public.notas_fiscais(data_emissao DESC);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_status ON public.notas_fiscais(status, status_sefaz);

COMMENT ON TABLE public.notas_fiscais IS 'Notas fiscais de entrada e saída';

-- ============================================
-- 9. PROFILES (extensão de auth.users para Supabase)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  
  -- Dados pessoais
  nome_completo TEXT,
  avatar_url TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Configurações
  tema TEXT CHECK (tema IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  idioma TEXT CHECK (idioma IN ('pt-BR', 'en-US', 'es-ES')) DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  
  -- Preferências
  notificacoes_email BOOLEAN DEFAULT TRUE,
  notificacoes_push BOOLEAN DEFAULT TRUE,
  notificacoes_sms BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  ultimo_acesso TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_empresa ON public.profiles(empresa_id);

COMMENT ON TABLE public.profiles IS 'Perfis de usuário estendidos (Supabase Auth)';

-- ============================================
-- 10. NOTIFICACOES (notificações in-app)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  
  -- Tipo e prioridade
  tipo TEXT CHECK (tipo IN (
    'info', 'sucesso', 'aviso', 'erro', 'alerta',
    'tarefa', 'lembrete', 'aprovacao', 'sistema'
  )) NOT NULL DEFAULT 'info',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  
  -- Conteúdo
  titulo TEXT NOT NULL,
  mensagem TEXT,
  icone TEXT,
  cor TEXT,
  
  -- Referências
  entidade_tipo TEXT, -- Ex: "cirurgia", "pedido_compra", "estoque"
  entidade_id UUID,
  url TEXT, -- URL para navegação
  
  -- Ações disponíveis
  acoes_json JSONB, -- Ex: [{"label": "Aprovar", "action": "approve"}, {"label": "Rejeitar", "action": "reject"}]
  
  -- Status
  lida BOOLEAN DEFAULT FALSE,
  lida_em TIMESTAMPTZ,
  arquivada BOOLEAN DEFAULT FALSE,
  arquivada_em TIMESTAMPTZ,
  
  -- Validade
  expira_em TIMESTAMPTZ,
  
  -- Metadata
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_empresa ON public.notificacoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON public.notificacoes(usuario_id) WHERE NOT lida AND NOT arquivada;
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON public.notificacoes(tipo, prioridade);
CREATE INDEX IF NOT EXISTS idx_notificacoes_entidade ON public.notificacoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_criado ON public.notificacoes(criado_em DESC);

COMMENT ON TABLE public.notificacoes IS 'Notificações in-app para usuários';

-- ============================================
-- TRIGGERS update_updated_at (se não existir)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_updated
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_convenios_updated
  BEFORE UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cirurgia_materiais_updated
  BEFORE UPDATE ON public.cirurgia_materiais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_estoque_updated
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_contratos_consignacao_updated
  BEFORE UPDATE ON public.contratos_consignacao
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_notas_fiscais_updated
  BEFORE UPDATE ON public.notas_fiscais
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DA MIGRATION FASE 1
-- ============================================
-- Total: 10 tabelas críticas
-- Próximo: FASE 2 (20 tabelas core business)
-- RLS: Aplicar POR ÚLTIMO após schema completo!
-- ============================================

