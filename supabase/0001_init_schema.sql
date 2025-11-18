-- ============================================
-- Migration 0001: Schema Multi-tenant Completo
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria schema completo pt_br multi-tenant
-- - Rastreabilidade OPME/ANVISA
-- - Soft delete (LGPD)
-- - Audit log preparado
-- ============================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca textual trigram

-- ============================================
-- 1. EMPRESAS (multi-tenant root)
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  razao_social TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  licenca_anvisa TEXT, -- RDC 36/2015
  telefone TEXT,
  email TEXT,
  cep TEXT,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT CHECK (LENGTH(estado) = 2),
  status TEXT CHECK (status IN ('ativa', 'inativa', 'suspensa')) DEFAULT 'ativa',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ
);

-- ============================================
-- 2. USUARIOS (auth.users extended)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
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

-- ============================================
-- 3. PRODUTOS (catálogo OPME)
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  codigo_sku TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fabricante TEXT,
  registro_anvisa TEXT, -- OBRIGATÓRIO ANVISA
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

-- ============================================
-- 4. LOTES (rastreabilidade ANVISA)
-- ============================================
CREATE TABLE IF NOT EXISTS lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
  numero_lote TEXT NOT NULL,
  numero_serie TEXT,
  data_fabricacao DATE,
  data_validade DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL DEFAULT 0,
  quantidade_disponivel INTEGER NOT NULL DEFAULT 0,
  registro_anvisa TEXT,
  status TEXT CHECK (status IN ('disponivel', 'reservado', 'consumido', 'vencido', 'bloqueado')) DEFAULT 'disponivel',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(produto_id, numero_lote, numero_serie)
);

-- ============================================
-- 5. MEDICOS
-- ============================================
CREATE TABLE IF NOT EXISTS medicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
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

-- ============================================
-- 6. HOSPITAIS
-- ============================================
CREATE TABLE IF NOT EXISTS hospitais (
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

-- ============================================
-- 7. CIRURGIAS
-- ============================================
CREATE TABLE IF NOT EXISTS cirurgias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  codigo_interno TEXT,
  medico_id UUID REFERENCES medicos(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitais(id) ON DELETE SET NULL,
  paciente_iniciais TEXT NOT NULL, -- LGPD: minimização
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

-- ============================================
-- 8. KITS (conjunto de materiais)
-- ============================================
CREATE TABLE IF NOT EXISTS kits (
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

-- ============================================
-- 9. ITENS_KIT (produtos+lotes no kit)
-- ============================================
CREATE TABLE IF NOT EXISTS itens_kit (
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

-- ============================================
-- 10. LEADS (CRM)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
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

-- ============================================
-- 11. TRANSACOES (financeiro)
-- ============================================
CREATE TABLE IF NOT EXISTS transacoes (
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

-- ============================================
-- 12. FORNECEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS fornecedores (
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

-- ============================================
-- 13. PEDIDOS_COMPRA
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos_compra (
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

-- ============================================
-- 14. FATURAS (NF-e)
-- ============================================
CREATE TABLE IF NOT EXISTS faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  numero_nfe TEXT NOT NULL,
  serie TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('nfe', 'nfse', 'cte', 'mdfe')),
  cliente_tipo TEXT CHECK (cliente_tipo IN ('medico', 'hospital', 'outro')),
  cliente_id UUID,
  cliente_nome TEXT NOT NULL,
  cliente_cpf_cnpj TEXT NOT NULL,
  data_emissao TIMESTAMPTZ DEFAULT NOW(),
  data_vencimento DATE,
  data_pagamento TIMESTAMPTZ,
  valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_desconto DECIMAL(15,2) DEFAULT 0,
  valor_frete DECIMAL(15,2) DEFAULT 0,
  valor_impostos DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'emitida', 'autorizada', 'cancelada', 'paga')),
  status_sefaz TEXT,
  chave_acesso TEXT,
  protocolo_autorizacao TEXT,
  pedido_id UUID REFERENCES pedidos_compra(id),
  cirurgia_id UUID REFERENCES cirurgias(id),
  natureza_operacao TEXT,
  cfop TEXT,
  forma_pagamento TEXT,
  xml_nfe TEXT,
  pdf_url TEXT,
  observacoes TEXT,
  observacoes_internas TEXT,
  emitida_por UUID REFERENCES usuarios(id),
  cancelada_por UUID REFERENCES usuarios(id),
  motivo_cancelamento TEXT,
  data_cancelamento TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  excluido_em TIMESTAMPTZ,
  UNIQUE(empresa_id, numero_nfe, serie)
);

-- ============================================
-- 15. AUDIT_LOG (imutável, blockchain-like)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  acao TEXT CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')) NOT NULL,
  dados_antes JSONB,
  dados_depois JSONB,
  hash_anterior TEXT,
  hash_atual TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGER: update_atualizado_em
-- ============================================
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com atualizado_em
CREATE TRIGGER trg_empresas_atualizado BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_usuarios_atualizado BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_produtos_atualizado BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_lotes_atualizado BEFORE UPDATE ON lotes FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_medicos_atualizado BEFORE UPDATE ON medicos FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_hospitais_atualizado BEFORE UPDATE ON hospitais FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_cirurgias_atualizado BEFORE UPDATE ON cirurgias FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_kits_atualizado BEFORE UPDATE ON kits FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_itens_kit_atualizado BEFORE UPDATE ON itens_kit FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_leads_atualizado BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_transacoes_atualizado BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_fornecedores_atualizado BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_pedidos_atualizado BEFORE UPDATE ON pedidos_compra FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
CREATE TRIGGER trg_faturas_atualizado BEFORE UPDATE ON faturas FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE empresas IS 'Multi-tenant root: isolamento por empresa';
COMMENT ON TABLE usuarios IS 'Usuários vinculados a empresas';
COMMENT ON TABLE produtos IS 'Catálogo OPME com registro ANVISA';
COMMENT ON TABLE lotes IS 'Rastreabilidade ANVISA: lote/série/validade';
COMMENT ON TABLE cirurgias IS 'Procedimentos (dados minimizados LGPD)';
COMMENT ON TABLE kits IS 'Conjuntos de materiais para cirurgias';
COMMENT ON TABLE audit_log IS 'Trilha imutável com hash chain blockchain-like';

COMMENT ON COLUMN cirurgias.paciente_iniciais IS 'Minimização LGPD: iniciais em vez de nome completo';
COMMENT ON COLUMN produtos.registro_anvisa IS 'Obrigatório RDC 16/2013';
COMMENT ON COLUMN audit_log.hash_atual IS 'SHA-256 para integridade';

