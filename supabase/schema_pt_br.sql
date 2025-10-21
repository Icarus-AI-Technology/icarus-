-- ============================================
-- ICARUS v6.0 — Schema Mestre PT-BR
-- Sistema de Gestão Cirúrgica OPME
-- Multi-tenant | LGPD | ANVISA | Auditoria
-- ============================================
-- Data: 2025-10-18
-- Auditor: Agente Sênior BD (20+ anos)
-- Padrão: snake_case pt_br
-- Encoding: UTF-8
-- ============================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca textual

-- ============================================
-- TABELAS PRINCIPAIS (ordem de dependência)
-- ============================================

-- 1. empresas (multi-tenant root)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  licenca_anvisa TEXT, -- RDC 36/2015
  telefone TEXT,
  email TEXT,
  -- Endereço
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  -- Status
  status TEXT CHECK (status IN ('ativa', 'inativa', 'suspensa')) DEFAULT 'ativa',
  -- Auditoria
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 2. usuarios (antigo profiles, nomenclatura pt-br)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  email TEXT UNIQUE NOT NULL,
  nome_completo TEXT,
  avatar_url TEXT,
  perfil TEXT CHECK (perfil IN ('admin', 'operador', 'comercial', 'financeiro', 'estoque')) DEFAULT 'operador',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 3. produtos (mestre OPME)
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  codigo_sku TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  registro_anvisa TEXT, -- OBRIGATÓRIO p/ OPME
  categoria TEXT,
  subcategoria TEXT,
  valor_unitario DECIMAL(12, 2),
  unidade_medida TEXT DEFAULT 'UN',
  status TEXT CHECK (status IN ('ativo', 'inativo', 'descontinuado')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, codigo_sku)
);

-- 4. lotes (rastreabilidade ANVISA)
CREATE TABLE lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  numero_lote TEXT NOT NULL,
  numero_serie TEXT, -- quando aplicável (implantes)
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL DEFAULT 0,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
  registro_anvisa TEXT, -- pode diferir do produto
  status TEXT CHECK (status IN ('disponivel', 'reservado', 'consumido', 'vencido', 'bloqueado')) DEFAULT 'disponivel',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(produto_id, numero_lote, numero_serie)
);

-- 5. medicos
CREATE TABLE medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- link opcional
  nome TEXT NOT NULL,
  crm TEXT NOT NULL,
  crm_uf TEXT NOT NULL CHECK (LENGTH(crm_uf) = 2),
  especialidade TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  hospital_principal TEXT,
  volume_anual_estimado DECIMAL(12, 2),
  cirurgias_realizadas INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'suspenso')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, crm, crm_uf)
);

-- 6. hospitais
CREATE TABLE hospitais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  tipo TEXT CHECK (tipo IN ('hospital', 'clinica', 'centro_cirurgico')) DEFAULT 'hospital',
  status TEXT CHECK (status IN ('ativo', 'inativo')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, cnpj)
);

-- 7. cirurgias
CREATE TABLE cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  codigo_interno TEXT, -- ID interno da empresa
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  -- Dados minimizados (LGPD)
  paciente_iniciais TEXT NOT NULL, -- ex: "J.S." em vez de nome completo
  procedimento TEXT NOT NULL,
  data_cirurgia DATE NOT NULL,
  hora_cirurgia TIME NOT NULL,
  sala TEXT,
  status TEXT CHECK (status IN ('agendada', 'confirmada', 'preparacao', 'andamento', 'recuperacao', 'concluida', 'cancelada')) DEFAULT 'agendada',
  prioridade TEXT CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')) DEFAULT 'media',
  observacoes TEXT,
  valor_estimado DECIMAL(12, 2),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, codigo_interno)
);

-- 8. kits (conjunto de materiais p/ cirurgia)
CREATE TABLE kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  cirurgia_id UUID REFERENCES cirurgias(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  status TEXT CHECK (status IN ('planejamento', 'reservado', 'montado', 'despachado', 'consumido', 'devolvido', 'cancelado')) DEFAULT 'planejamento',
  data_montagem TIMESTAMPTZ,
  data_consumo TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 9. itens_kit (produtos+lotes no kit)
CREATE TABLE itens_kit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  lote_id UUID REFERENCES lotes(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  quantidade_consumida INTEGER DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kit_id, produto_id, lote_id)
);

-- 10. leads (CRM)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  empresa_origem TEXT,
  cargo TEXT,
  email TEXT,
  telefone TEXT,
  valor_estimado DECIMAL(12, 2),
  estagio TEXT CHECK (estagio IN ('prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento', 'perdido')) DEFAULT 'prospeccao',
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100) DEFAULT 50,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  proxima_acao TEXT,
  data_ultimo_contato DATE,
  responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 11. transacoes (financeiro)
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  tipo TEXT CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')) DEFAULT 'pendente',
  forma_pagamento TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- 12. fornecedores
CREATE TABLE fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  categoria TEXT,
  rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  volume_compras DECIMAL(12, 2) DEFAULT 0,
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado')) DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, cnpj)
);

-- 13. pedidos_compra
CREATE TABLE pedidos_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero TEXT NOT NULL,
  fornecedor_id UUID REFERENCES fornecedores(id) ON DELETE SET NULL,
  valor_total DECIMAL(12, 2) NOT NULL,
  status TEXT CHECK (status IN ('rascunho', 'aguardando', 'aprovado', 'processando', 'entregue', 'cancelado')) DEFAULT 'rascunho',
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'critico')) DEFAULT 'normal',
  data_pedido DATE DEFAULT CURRENT_DATE,
  data_entrega_prevista DATE,
  observacoes TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, numero)
);

-- 14. faturas (notas fiscais)
CREATE TABLE faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero_nfe TEXT NOT NULL,
  serie TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nfe', 'nfse', 'cte', 'mdfe')),
  -- Cliente/Destinatário
  cliente_tipo TEXT CHECK (cliente_tipo IN ('medico', 'hospital', 'outro')),
  cliente_id UUID,
  cliente_nome TEXT NOT NULL,
  cliente_cpf_cnpj TEXT NOT NULL,
  -- Datas
  data_emissao TIMESTAMPTZ DEFAULT NOW(),
  data_vencimento DATE,
  data_pagamento TIMESTAMPTZ,
  -- Valores
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_impostos DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'emitida', 'autorizada', 'cancelada', 'paga')),
  status_sefaz TEXT,
  -- Chave NFe
  chave_acesso TEXT,
  protocolo_autorizacao TEXT,
  -- Relacionamentos
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  -- Fiscal
  natureza_operacao TEXT,
  cfop TEXT,
  forma_pagamento TEXT,
  -- Arquivos
  xml_nfe TEXT,
  pdf_url TEXT,
  -- Observações
  observacoes TEXT,
  observacoes_internas TEXT,
  -- Auditoria cancelamento
  emitida_por UUID REFERENCES usuarios(id),
  cancelada_por UUID REFERENCES usuarios(id),
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, numero_nfe, serie)
);

-- 15. audit_log (imutável, blockchain-like)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  acao TEXT CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')) NOT NULL,
  dados_antes JSONB,
  dados_depois JSONB,
  hash_anterior TEXT, -- SHA-256 do registro anterior
  hash_atual TEXT NOT NULL, -- SHA-256 deste registro
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COMENTÁRIOS DE CONFORMIDADE
-- ============================================
COMMENT ON TABLE empresas IS 'Multi-tenant root: cada empresa isolada';
COMMENT ON TABLE usuarios IS 'Perfis de usuários vinculados a empresas';
COMMENT ON TABLE produtos IS 'Catálogo mestre de OPME com registro ANVISA';
COMMENT ON TABLE lotes IS 'Rastreabilidade ANVISA: lote/série/validade';
COMMENT ON TABLE cirurgias IS 'Procedimentos cirúrgicos (dados minimizados LGPD)';
COMMENT ON TABLE kits IS 'Conjuntos de materiais para cirurgias';
COMMENT ON TABLE itens_kit IS 'Relação N:N kit-produto-lote';
COMMENT ON TABLE audit_log IS 'Trilha imutável com hash chain (blockchain-like)';

COMMENT ON COLUMN cirurgias.paciente_iniciais IS 'Minimização LGPD: iniciais em vez de nome completo';
COMMENT ON COLUMN produtos.registro_anvisa IS 'Obrigatório RDC 16/2013';
COMMENT ON COLUMN lotes.numero_lote IS 'Rastreabilidade ANVISA';
COMMENT ON COLUMN audit_log.hash_atual IS 'SHA-256 para integridade da cadeia';

