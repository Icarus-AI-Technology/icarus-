-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Bloco 01 de 10                                          ║
-- ║  Linhas: 1 → 6288                                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝

-- ╔════════════════════════════════════════════════════════════════════════╗
-- ║  ICARUS v5.0 - Migrações Consolidadas Supabase                         ║
-- ║  Data: 2025-11-18T04:46:54.761Z                                      ║
-- ╚════════════════════════════════════════════════════════════════════════╝


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0001_init_schema.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0002_rls_policies.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0002: RLS Multi-tenant Policies
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria funções JWT helpers
-- - Policies multi-tenant por empresa_id
-- - Filtros por perfil (admin/operador/etc)
-- - Trigger auto-criação de usuário
-- ============================================

-- ============================================
-- FUNÇÕES JWT HELPERS
-- ============================================

-- Retorna empresa_id do JWT
CREATE OR REPLACE FUNCTION public.current_empresa()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid;
$$;

-- Retorna perfil do JWT
CREATE OR REPLACE FUNCTION public.current_perfil()
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'perfil',
    'operador'
  );
$$;

-- Retorna user_id do JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT auth.uid();
$$;

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_kit ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: empresas
-- ============================================

-- SELECT: Usuário vê apenas sua empresa
CREATE POLICY pol_empresas_select ON empresas
  FOR SELECT
  USING (id = public.current_empresa() AND excluido_em IS NULL);

-- UPDATE: Apenas admin da própria empresa
CREATE POLICY pol_empresas_update ON empresas
  FOR UPDATE
  USING (id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (id = public.current_empresa());

-- ============================================
-- POLICIES: usuarios
-- ============================================

-- SELECT: Usuários da mesma empresa
CREATE POLICY pol_usuarios_select ON usuarios
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Apenas admin
CREATE POLICY pol_usuarios_insert ON usuarios
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() = 'admin'
  );

-- UPDATE: Admin ou próprio perfil
CREATE POLICY pol_usuarios_update ON usuarios
  FOR UPDATE
  USING (
    (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin') OR
    (id = auth.uid())
  )
  WITH CHECK (empresa_id = public.current_empresa());

-- DELETE: Apenas admin (soft delete)
CREATE POLICY pol_usuarios_delete ON usuarios
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (excluido_em IS NOT NULL);

-- ============================================
-- POLICIES: produtos
-- ============================================

-- SELECT: Mesma empresa, não excluídos
CREATE POLICY pol_produtos_select ON produtos
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Admin, comercial ou estoque
CREATE POLICY pol_produtos_insert ON produtos
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- UPDATE: Admin, comercial ou estoque
CREATE POLICY pol_produtos_update ON produtos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- DELETE: Apenas admin (soft delete)
CREATE POLICY pol_produtos_delete ON produtos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (excluido_em IS NOT NULL);

-- ============================================
-- POLICIES: lotes
-- ============================================

-- SELECT: Via produto da mesma empresa
CREATE POLICY pol_lotes_select ON lotes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND excluido_em IS NULL
  );

-- INSERT/UPDATE/DELETE: Estoque ou admin
CREATE POLICY pol_lotes_insert ON lotes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_lotes_update ON lotes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'estoque')
  );

-- ============================================
-- POLICIES: medicos
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_medicos_select ON medicos
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_medicos_insert ON medicos
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_medicos_update ON medicos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: hospitais
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_hospitais_select ON hospitais
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_hospitais_insert ON hospitais
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_hospitais_update ON hospitais
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: cirurgias
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_cirurgias_select ON cirurgias
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Admin ou operador
CREATE POLICY pol_cirurgias_insert ON cirurgias
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'operador', 'comercial')
  );

-- UPDATE: Admin ou operador
CREATE POLICY pol_cirurgias_update ON cirurgias
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'operador', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: kits
-- ============================================

-- SELECT: Via empresa
CREATE POLICY pol_kits_select ON kits
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin, operador ou estoque
CREATE POLICY pol_kits_insert ON kits
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

CREATE POLICY pol_kits_update ON kits
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'operador', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: itens_kit
-- ============================================

-- SELECT: Via kit da mesma empresa
CREATE POLICY pol_itens_kit_select ON itens_kit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    )
  );

-- INSERT/UPDATE: Admin, operador ou estoque
CREATE POLICY pol_itens_kit_insert ON itens_kit
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

CREATE POLICY pol_itens_kit_update ON itens_kit
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

-- ============================================
-- POLICIES: leads
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_leads_select ON leads
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_leads_insert ON leads
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_leads_update ON leads
  FOR UPDATE
  USING (
    empresa_id = public.current_empresa() AND
    (public.current_perfil() IN ('admin', 'comercial') OR responsavel_id = auth.uid())
  )
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: transacoes
-- ============================================

-- SELECT: Financeiro ou admin
CREATE POLICY pol_transacoes_select ON transacoes
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Financeiro ou admin
CREATE POLICY pol_transacoes_insert ON transacoes
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

CREATE POLICY pol_transacoes_update ON transacoes
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: fornecedores
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_fornecedores_select ON fornecedores
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou estoque
CREATE POLICY pol_fornecedores_insert ON fornecedores
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_fornecedores_update ON fornecedores
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: pedidos_compra
-- ============================================

-- SELECT: Estoque, financeiro ou admin
CREATE POLICY pol_pedidos_select ON pedidos_compra
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Estoque ou admin
CREATE POLICY pol_pedidos_insert ON pedidos_compra
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_pedidos_update ON pedidos_compra
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'estoque', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: faturas
-- ============================================

-- SELECT: Financeiro ou admin
CREATE POLICY pol_faturas_select ON faturas
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Financeiro ou admin
CREATE POLICY pol_faturas_insert ON faturas
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

CREATE POLICY pol_faturas_update ON faturas
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: audit_log (somente leitura)
-- ============================================

-- SELECT: Admin apenas
CREATE POLICY pol_audit_log_select ON audit_log
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() = 'admin'
  );

-- INSERT: Via trigger apenas (sistema)
CREATE POLICY pol_audit_log_insert ON audit_log
  FOR INSERT
  WITH CHECK (true); -- Triggers têm permissão SECURITY DEFINER

-- ============================================
-- TRIGGER: Auto-criar usuário no signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Extrair empresa_id e perfil do metadata
  INSERT INTO public.usuarios (id, empresa_id, email, nome_completo, avatar_url, perfil)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'empresa_id')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid -- placeholder
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'operador')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.current_empresa() IS 'Retorna empresa_id do JWT token';
COMMENT ON FUNCTION public.current_perfil() IS 'Retorna perfil do usuário do JWT';
COMMENT ON POLICY pol_produtos_select ON produtos IS 'Isolamento multi-tenant por empresa_id';
COMMENT ON POLICY pol_audit_log_select ON audit_log IS 'Apenas admins podem ler audit_log';




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0003_indexes_perf.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0003: Índices de Performance
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Índices compostos para queries multi-tenant
-- - Índices parciais (WHERE excluido_em IS NULL)
-- - GIN trigram para busca textual
-- - Índices para ordenação DESC (keyset pagination)
-- Meta: p95 < 250ms para 50 usuários simultâneos
-- ============================================

-- ============================================
-- ÍNDICES: empresas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: usuarios
-- ============================================
-- Composto: empresa + perfil (filtragem comum)
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_perfil ON usuarios(empresa_id, perfil) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_criado ON usuarios(empresa_id, criado_em DESC) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: produtos
-- ============================================
-- Composto: empresa + status (listagens filtradas)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_status ON produtos(empresa_id, status) WHERE excluido_em IS NULL;

-- Composto: empresa + codigo_sku (busca rápida)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_sku ON produtos(empresa_id, codigo_sku) WHERE excluido_em IS NULL;

-- GIN trigram: busca textual em descrição
CREATE INDEX IF NOT EXISTS idx_produtos_descricao_gin ON produtos USING GIN (to_tsvector('portuguese', descricao)) WHERE excluido_em IS NULL;

-- Índice para ordenação (keyset pagination)
CREATE INDEX IF NOT EXISTS idx_produtos_empresa_criado ON produtos(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- Registro ANVISA
CREATE INDEX IF NOT EXISTS idx_produtos_registro_anvisa ON produtos(registro_anvisa) WHERE excluido_em IS NULL AND registro_anvisa IS NOT NULL;

-- ============================================
-- ÍNDICES: lotes
-- ============================================
-- Composto: produto + status
CREATE INDEX IF NOT EXISTS idx_lotes_produto_status ON lotes(produto_id, status) WHERE excluido_em IS NULL;

-- Lotes vencidos (alerta)
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON lotes(data_validade) WHERE excluido_em IS NULL AND data_validade >= CURRENT_DATE;

-- Lotes disponíveis
CREATE INDEX IF NOT EXISTS idx_lotes_disponiveis ON lotes(produto_id, status, quantidade_disponivel) WHERE excluido_em IS NULL AND status = 'disponivel' AND quantidade_disponivel > 0;

-- Número de lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS idx_lotes_numero ON lotes(numero_lote, numero_serie) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: medicos
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_medicos_empresa_status ON medicos(empresa_id, status) WHERE excluido_em IS NULL;

-- CRM (busca)
CREATE INDEX IF NOT EXISTS idx_medicos_crm ON medicos(crm, crm_uf) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_medicos_nome_gin ON medicos USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Especialidade (filtro comum)
CREATE INDEX IF NOT EXISTS idx_medicos_especialidade ON medicos(empresa_id, especialidade) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: hospitais
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_hospitais_empresa_status ON hospitais(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS idx_hospitais_cnpj ON hospitais(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_hospitais_nome_gin ON hospitais USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: cirurgias
-- ============================================
-- Composto: empresa + status + data (dashboard principal)
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_status_data ON cirurgias(empresa_id, status, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Composto: empresa + data (calendário)
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_data ON cirurgias(empresa_id, data_cirurgia DESC, hora_cirurgia) WHERE excluido_em IS NULL;

-- Médico (filtro)
CREATE INDEX IF NOT EXISTS idx_cirurgias_medico ON cirurgias(medico_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Hospital (filtro)
CREATE INDEX IF NOT EXISTS idx_cirurgias_hospital ON cirurgias(hospital_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Prioridade (urgências)
CREATE INDEX IF NOT EXISTS idx_cirurgias_prioridade ON cirurgias(empresa_id, prioridade, status) WHERE excluido_em IS NULL AND status IN ('agendada', 'confirmada');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_criado ON cirurgias(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: kits
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_kits_empresa_status ON kits(empresa_id, status) WHERE excluido_em IS NULL;

-- Cirurgia
CREATE INDEX IF NOT EXISTS idx_kits_cirurgia ON kits(cirurgia_id, status) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_kits_empresa_criado ON kits(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: itens_kit
-- ============================================
-- Composto: kit (JOIN comum)
CREATE INDEX IF NOT EXISTS idx_itens_kit_kit ON itens_kit(kit_id);

-- Produto (rastreabilidade)
CREATE INDEX IF NOT EXISTS idx_itens_kit_produto ON itens_kit(produto_id);

-- Lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS idx_itens_kit_lote ON itens_kit(lote_id);

-- ============================================
-- ÍNDICES: leads
-- ============================================
-- Composto: empresa + estagio (pipeline CRM)
CREATE INDEX IF NOT EXISTS idx_leads_empresa_estagio ON leads(empresa_id, estagio) WHERE excluido_em IS NULL;

-- Responsável
CREATE INDEX IF NOT EXISTS idx_leads_responsavel ON leads(responsavel_id, estagio) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_leads_nome_gin ON leads USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_leads_empresa_criado ON leads(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: transacoes
-- ============================================
-- Composto: empresa + tipo + status (dashboard financeiro)
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_tipo_status ON transacoes(empresa_id, tipo, status) WHERE excluido_em IS NULL;

-- Data vencimento (alertas)
CREATE INDEX IF NOT EXISTS idx_transacoes_vencimento ON transacoes(empresa_id, data_vencimento) WHERE excluido_em IS NULL AND status = 'pendente';

-- Vencidas
CREATE INDEX IF NOT EXISTS idx_transacoes_vencidas ON transacoes(empresa_id, status) WHERE excluido_em IS NULL AND status = 'vencido';

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_transacoes_empresa_criado ON transacoes(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: fornecedores
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_fornecedores_empresa_status ON fornecedores(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome_gin ON fornecedores USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: pedidos_compra
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_status ON pedidos_compra(empresa_id, status) WHERE excluido_em IS NULL;

-- Fornecedor
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedor ON pedidos_compra(fornecedor_id, status) WHERE excluido_em IS NULL;

-- Urgência
CREATE INDEX IF NOT EXISTS idx_pedidos_urgencia ON pedidos_compra(empresa_id, urgencia, status) WHERE excluido_em IS NULL AND status IN ('aguardando', 'aprovado');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_pedidos_empresa_criado ON pedidos_compra(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: faturas
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_status ON faturas(empresa_id, status) WHERE excluido_em IS NULL;

-- Número NF-e (busca)
CREATE INDEX IF NOT EXISTS idx_faturas_numero ON faturas(empresa_id, numero_nfe, serie) WHERE excluido_em IS NULL;

-- Chave de acesso (rastreabilidade fiscal)
CREATE INDEX IF NOT EXISTS idx_faturas_chave ON faturas(chave_acesso) WHERE excluido_em IS NULL AND chave_acesso IS NOT NULL;

-- Cliente CPF/CNPJ
CREATE INDEX IF NOT EXISTS idx_faturas_cliente ON faturas(empresa_id, cliente_cpf_cnpj) WHERE excluido_em IS NULL;

-- Data emissão (relatórios)
CREATE INDEX IF NOT EXISTS idx_faturas_emissao ON faturas(empresa_id, data_emissao DESC) WHERE excluido_em IS NULL;

-- Pedido/Cirurgia (relacionamentos)
CREATE INDEX IF NOT EXISTS idx_faturas_pedido ON faturas(pedido_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_faturas_cirurgia ON faturas(cirurgia_id) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS idx_faturas_empresa_criado ON faturas(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: audit_log
-- ============================================
-- Composto: empresa + tabela + criado (consultas de auditoria)
CREATE INDEX IF NOT EXISTS idx_audit_empresa_tabela_criado ON audit_log(empresa_id, tabela, criado_em DESC);

-- Registro auditado
CREATE INDEX IF NOT EXISTS idx_audit_registro ON audit_log(tabela, registro_id, criado_em DESC);

-- Usuário (quem fez a ação)
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id, criado_em DESC);

-- Hash chain (verificação de integridade)
CREATE INDEX IF NOT EXISTS idx_audit_hash ON audit_log(criado_em ASC, id);

-- ============================================
-- VIEWS MATERIALIZADAS (KPIs)
-- ============================================

-- Dashboard: KPIs por empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpis_empresa AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  -- Cirurgias
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status = 'agendada' THEN c.id END) AS cirurgias_agendadas,
  COUNT(DISTINCT CASE WHEN c.status = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  -- Produtos
  COUNT(DISTINCT p.id) AS total_produtos,
  SUM(CASE WHEN l.status = 'disponivel' THEN l.quantidade_disponivel ELSE 0 END) AS estoque_disponivel,
  -- Financeiro
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS receitas_pagas,
  SUM(CASE WHEN t.tipo = 'despesa' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pendente' THEN t.valor ELSE 0 END) AS receitas_pendentes,
  -- Leads
  COUNT(DISTINCT ld.id) AS total_leads,
  COUNT(DISTINCT CASE WHEN ld.estagio = 'fechamento' THEN ld.id END) AS leads_fechamento,
  -- Timestamp
  NOW() AS atualizado_em
FROM empresas e
LEFT JOIN cirurgias c ON c.empresa_id = e.id AND c.excluido_em IS NULL
LEFT JOIN produtos p ON p.empresa_id = e.id AND p.excluido_em IS NULL
LEFT JOIN lotes l ON l.produto_id = p.id AND l.excluido_em IS NULL
LEFT JOIN transacoes t ON t.empresa_id = e.id AND t.excluido_em IS NULL
LEFT JOIN leads ld ON ld.empresa_id = e.id AND ld.excluido_em IS NULL
WHERE e.excluido_em IS NULL
GROUP BY e.id, e.nome;

-- Índice na MV
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_kpis_empresa ON mv_kpis_empresa(empresa_id);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON INDEX idx_produtos_descricao_gin IS 'Busca textual full-text em descrição de produtos';
COMMENT ON INDEX idx_cirurgias_empresa_status_data IS 'Índice composto para dashboard principal de cirurgias';
COMMENT ON INDEX idx_lotes_disponiveis IS 'Índice parcial para lotes disponíveis (performance)';
COMMENT ON MATERIALIZED VIEW mv_kpis_empresa IS 'KPIs agregados por empresa (refresh periódico via job)';

-- ============================================
-- FUNÇÃO: Refresh MV (executar via cron/BullMQ)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_mv_kpis()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpis_empresa;
END;
$$;

COMMENT ON FUNCTION refresh_mv_kpis() IS 'Atualiza MVs de KPIs (executar a cada 5min via job)';




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0004_functions_triggers.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0004: Funções & Triggers
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Audit log com hash chain (blockchain-like)
-- - Triggers de auditoria em tabelas críticas
-- - Funções LGPD (anonimização, exportação)
-- - Funções de negócio (reservar_kit, consumir_kit)
-- - Validações ANVISA (lotes vencidos)
-- ============================================

-- ============================================
-- AUDIT LOG: Hash Chain (blockchain-like)
-- ============================================

-- Função: Computar hash SHA-256 do registro de audit
CREATE OR REPLACE FUNCTION compute_audit_hash(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB,
  p_hash_anterior TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_payload TEXT;
BEGIN
  -- Concatenar dados para hash
  v_payload := CONCAT(
    COALESCE(p_empresa_id::text, ''),
    '|',
    COALESCE(p_usuario_id::text, ''),
    '|',
    p_tabela,
    '|',
    p_registro_id::text,
    '|',
    p_acao,
    '|',
    COALESCE(p_dados_antes::text, ''),
    '|',
    COALESCE(p_dados_depois::text, ''),
    '|',
    COALESCE(p_hash_anterior, '')
  );
  
  -- Retornar SHA-256
  RETURN encode(digest(v_payload, 'sha256'), 'hex');
END;
$$;

-- Função: Inserir log de auditoria com hash chain
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash_anterior TEXT;
  v_hash_atual TEXT;
BEGIN
  -- Buscar último hash da cadeia
  SELECT hash_atual INTO v_hash_anterior
  FROM audit_log
  ORDER BY criado_em DESC, id DESC
  LIMIT 1;
  
  -- Computar hash atual
  v_hash_atual := compute_audit_hash(
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior
  );
  
  -- Inserir registro
  INSERT INTO audit_log (
    empresa_id,
    usuario_id,
    tabela,
    registro_id,
    acao,
    dados_antes,
    dados_depois,
    hash_anterior,
    hash_atual
  ) VALUES (
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior,
    v_hash_atual
  );
END;
$$;

COMMENT ON FUNCTION compute_audit_hash IS 'Computa SHA-256 para hash chain de auditoria';
COMMENT ON FUNCTION insert_audit_log IS 'Insere log de auditoria com hash chain blockchain-like';

-- ============================================
-- TRIGGER: Auditoria automática
-- ============================================

-- Função genérica de trigger de auditoria
CREATE OR REPLACE FUNCTION trigger_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_empresa_id UUID;
  v_usuario_id UUID;
  v_acao TEXT;
  v_dados_antes JSONB;
  v_dados_depois JSONB;
BEGIN
  -- Determinar empresa_id (se existe na tabela)
  IF TG_OP = 'DELETE' THEN
    v_empresa_id := (to_jsonb(OLD)->>'empresa_id')::uuid;
  ELSE
    v_empresa_id := (to_jsonb(NEW)->>'empresa_id')::uuid;
  END IF;
  
  -- Capturar usuario_id do JWT
  BEGIN
    v_usuario_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
  END;
  
  -- Definir ação e dados
  CASE TG_OP
    WHEN 'INSERT' THEN
      v_acao := 'INSERT';
      v_dados_antes := NULL;
      v_dados_depois := to_jsonb(NEW);
    WHEN 'UPDATE' THEN
      v_acao := 'UPDATE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := to_jsonb(NEW);
    WHEN 'DELETE' THEN
      v_acao := 'DELETE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := NULL;
  END CASE;
  
  -- Inserir audit log
  PERFORM insert_audit_log(
    v_empresa_id,
    v_usuario_id,
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW)->>'id')::uuid, (to_jsonb(OLD)->>'id')::uuid),
    v_acao,
    v_dados_antes,
    v_dados_depois
  );
  
  -- Retornar registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Aplicar trigger de auditoria em tabelas críticas
CREATE TRIGGER trg_audit_produtos AFTER INSERT OR UPDATE OR DELETE ON produtos FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_lotes AFTER INSERT OR UPDATE OR DELETE ON lotes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_cirurgias AFTER INSERT OR UPDATE OR DELETE ON cirurgias FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_kits AFTER INSERT OR UPDATE OR DELETE ON kits FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_itens_kit AFTER INSERT OR UPDATE OR DELETE ON itens_kit FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_transacoes AFTER INSERT OR UPDATE OR DELETE ON transacoes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_faturas AFTER INSERT OR UPDATE OR DELETE ON faturas FOR EACH ROW EXECUTE FUNCTION trigger_audit();

COMMENT ON FUNCTION trigger_audit IS 'Trigger genérico para auditoria com hash chain';

-- ============================================
-- LGPD: Funções de Compliance
-- ============================================

-- Função: Exportar dados do usuário (Art. 18 LGPD)
CREATE OR REPLACE FUNCTION exportar_dados_usuario(p_usuario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  -- Verificar permissão (próprio usuário ou admin)
  IF auth.uid() != p_usuario_id AND auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão para exportar dados de outro usuário';
  END IF;
  
  -- Agregar dados do usuário
  SELECT jsonb_build_object(
    'usuario', (SELECT row_to_json(u.*) FROM usuarios u WHERE u.id = p_usuario_id),
    'leads_responsavel', (SELECT jsonb_agg(row_to_json(l.*)) FROM leads l WHERE l.responsavel_id = p_usuario_id AND l.excluido_em IS NULL),
    'audit_log', (SELECT jsonb_agg(row_to_json(a.*)) FROM audit_log a WHERE a.usuario_id = p_usuario_id ORDER BY a.criado_em DESC LIMIT 100)
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Função: Anonimizar dados do usuário (LGPD)
CREATE OR REPLACE FUNCTION anonimizar_dados_usuario(p_usuario_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissão (admin apenas)
  IF auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Apenas admins podem anonimizar usuários';
  END IF;
  
  -- Anonimizar dados sensíveis
  UPDATE usuarios
  SET
    nome_completo = 'Usuário Anonimizado',
    email = CONCAT('anonimizado_', id::text, '@example.com'),
    avatar_url = NULL,
    excluido_em = NOW()
  WHERE id = p_usuario_id;
  
  -- Limpar leads associados
  UPDATE leads
  SET responsavel_id = NULL
  WHERE responsavel_id = p_usuario_id;
  
  RAISE NOTICE 'Usuário % anonimizado com sucesso', p_usuario_id;
END;
$$;

COMMENT ON FUNCTION exportar_dados_usuario IS 'Exporta dados do usuário (Art. 18 LGPD - portabilidade)';
COMMENT ON FUNCTION anonimizar_dados_usuario IS 'Anonimiza dados do usuário (LGPD - direito ao esquecimento)';

-- ============================================
-- ANVISA: Validações de rastreabilidade
-- ============================================

-- Função: Validar lote (verificar validade + registro)
CREATE OR REPLACE FUNCTION validar_lote(p_lote_id UUID)
RETURNS TABLE(
  valido BOOLEAN,
  motivo TEXT,
  lote_id UUID,
  produto_descricao TEXT,
  numero_lote TEXT,
  data_validade DATE,
  registro_anvisa TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN FALSE
      WHEN p.registro_anvisa IS NULL THEN FALSE
      WHEN l.status = 'bloqueado' THEN FALSE
      WHEN l.quantidade_disponivel <= 0 THEN FALSE
      ELSE TRUE
    END AS valido,
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN 'Lote vencido'
      WHEN p.registro_anvisa IS NULL THEN 'Produto sem registro ANVISA'
      WHEN l.status = 'bloqueado' THEN 'Lote bloqueado'
      WHEN l.quantidade_disponivel <= 0 THEN 'Lote sem estoque'
      ELSE 'Lote válido'
    END AS motivo,
    l.id AS lote_id,
    p.descricao AS produto_descricao,
    l.numero_lote,
    l.data_validade,
    COALESCE(l.registro_anvisa, p.registro_anvisa) AS registro_anvisa
  FROM lotes l
  JOIN produtos p ON l.produto_id = p.id
  WHERE l.id = p_lote_id;
END;
$$;

-- Função: Bloquear lotes vencidos (job diário)
CREATE OR REPLACE FUNCTION bloquear_lotes_vencidos()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE lotes
  SET status = 'vencido'
  WHERE data_validade < CURRENT_DATE
    AND status NOT IN ('vencido', 'consumido')
    AND excluido_em IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RAISE NOTICE '% lotes marcados como vencidos', v_count;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION validar_lote IS 'Valida lote (validade + registro ANVISA + disponibilidade)';
COMMENT ON FUNCTION bloquear_lotes_vencidos IS 'Bloqueia lotes vencidos (executar diariamente via cron)';

-- ============================================
-- NEGÓCIO: Funções operacionais
-- ============================================

-- Função: Reservar kit (decrementa estoque)
CREATE OR REPLACE FUNCTION reservar_kit(p_kit_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item RECORD;
  v_lote_valido BOOLEAN;
BEGIN
  -- Validar status do kit
  IF NOT EXISTS (
    SELECT 1 FROM kits
    WHERE id = p_kit_id AND status = 'planejamento' AND excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Kit não está em status planejamento ou não existe';
  END IF;
  
  -- Iterar sobre itens do kit
  FOR v_item IN
    SELECT ik.id, ik.lote_id, ik.quantidade
    FROM itens_kit ik
    WHERE ik.kit_id = p_kit_id
  LOOP
    -- Validar lote
    SELECT valido INTO v_lote_valido
    FROM validar_lote(v_item.lote_id);
    
    IF NOT v_lote_valido THEN
      RAISE EXCEPTION 'Lote % inválido para reserva', v_item.lote_id;
    END IF;
    
    -- Decrementar estoque
    UPDATE lotes
    SET
      quantidade_disponivel = quantidade_disponivel - v_item.quantidade,
      status = CASE
        WHEN quantidade_disponivel - v_item.quantidade <= 0 THEN 'reservado'
        ELSE status
      END
    WHERE id = v_item.lote_id;
  END LOOP;
  
  -- Atualizar status do kit
  UPDATE kits
  SET status = 'reservado'
  WHERE id = p_kit_id;
  
  RETURN TRUE;
END;
$$;

-- Função: Consumir kit (marca como consumido)
CREATE OR REPLACE FUNCTION consumir_kit(
  p_kit_id UUID,
  p_quantidades_consumidas JSONB -- {item_kit_id: quantidade}
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_id UUID;
  v_qtd_consumida INTEGER;
BEGIN
  -- Validar status do kit
  IF NOT EXISTS (
    SELECT 1 FROM kits
    WHERE id = p_kit_id AND status IN ('reservado', 'montado', 'despachado') AND excluido_em IS NULL
  ) THEN
    RAISE EXCEPTION 'Kit não está em status válido para consumo';
  END IF;
  
  -- Atualizar quantidades consumidas
  FOR v_item_id, v_qtd_consumida IN
    SELECT * FROM jsonb_each_text(p_quantidades_consumidas)
  LOOP
    UPDATE itens_kit
    SET quantidade_consumida = v_qtd_consumida::integer
    WHERE id = v_item_id::uuid AND kit_id = p_kit_id;
    
    -- Marcar lote como consumido se quantidade zerada
    UPDATE lotes l
    SET status = 'consumido'
    WHERE l.id IN (
      SELECT lote_id FROM itens_kit
      WHERE id = v_item_id::uuid
    ) AND l.quantidade_disponivel = 0;
  END LOOP;
  
  -- Atualizar kit
  UPDATE kits
  SET
    status = 'consumido',
    data_consumo = NOW()
  WHERE id = p_kit_id;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION reservar_kit IS 'Reserva kit e decrementa estoque de lotes';
COMMENT ON FUNCTION consumir_kit IS 'Marca kit como consumido e atualiza quantidades';

-- ============================================
-- FUNÇÃO: Verificar integridade do hash chain
-- ============================================
CREATE OR REPLACE FUNCTION verificar_integridade_audit_log()
RETURNS TABLE(
  registro_id UUID,
  hash_esperado TEXT,
  hash_registrado TEXT,
  integro BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH audit_ordenado AS (
    SELECT
      id,
      empresa_id,
      usuario_id,
      tabela,
      registro_id AS reg_id,
      acao,
      dados_antes,
      dados_depois,
      hash_anterior,
      hash_atual,
      LAG(hash_atual) OVER (ORDER BY criado_em, id) AS hash_anterior_real
    FROM audit_log
    ORDER BY criado_em, id
  )
  SELECT
    ao.id AS registro_id,
    ao.hash_anterior_real AS hash_esperado,
    ao.hash_anterior AS hash_registrado,
    COALESCE(ao.hash_anterior = ao.hash_anterior_real, ao.hash_anterior IS NULL) AS integro
  FROM audit_ordenado ao
  WHERE ao.hash_anterior_real IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION verificar_integridade_audit_log IS 'Verifica integridade da cadeia de hashes (blockchain-like)';

-- ============================================
-- TRIGGER: Validar criação de cirurgia
-- ============================================
CREATE OR REPLACE FUNCTION validar_cirurgia()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar data futura
  IF NEW.data_cirurgia < CURRENT_DATE THEN
    RAISE EXCEPTION 'Data da cirurgia não pode ser no passado';
  END IF;
  
  -- Validar médico ativo
  IF NEW.medico_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM medicos
      WHERE id = NEW.medico_id AND status = 'ativo' AND excluido_em IS NULL
    ) THEN
      RAISE EXCEPTION 'Médico inativo ou inexistente';
    END IF;
  END IF;
  
  -- Validar hospital ativo
  IF NEW.hospital_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM hospitais
      WHERE id = NEW.hospital_id AND status = 'ativo' AND excluido_em IS NULL
    ) THEN
      RAISE EXCEPTION 'Hospital inativo ou inexistente';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_cirurgia
  BEFORE INSERT OR UPDATE ON cirurgias
  FOR EACH ROW
  EXECUTE FUNCTION validar_cirurgia();

COMMENT ON FUNCTION validar_cirurgia IS 'Valida dados da cirurgia antes de INSERT/UPDATE';




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0005_storage_policies.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0005: Storage Policies
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Buckets para documentos (NF-e, romaneios, DANFE)
-- - Policies RLS multi-tenant para storage
-- - Validação de tipo/tamanho de arquivo
-- - Nomenclatura padronizada
-- ============================================

-- ============================================
-- BUCKET: documentos_cirurgias
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_cirurgias',
  'documentos_cirurgias',
  FALSE, -- Privado
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: documentos_fiscais
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos_fiscais',
  'documentos_fiscais',
  FALSE,
  52428800, -- 50MB (XML NF-e pode ser grande)
  ARRAY['application/pdf', 'application/xml', 'text/xml']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: anexos_produtos
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anexos_produtos',
  'anexos_produtos',
  FALSE,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUCKET: avatares (público)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatares',
  'avatares',
  TRUE, -- Público
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLICIES: documentos_cirurgias
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_cirurgias_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, operador
CREATE POLICY pol_storage_cirurgias_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- UPDATE: Admin, operador
CREATE POLICY pol_storage_cirurgias_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'operador')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_cirurgias_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_cirurgias' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: documentos_fiscais
-- ============================================

-- SELECT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- INSERT: Admin, financeiro
CREATE POLICY pol_storage_fiscais_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- UPDATE: Admin, financeiro
CREATE POLICY pol_storage_fiscais_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_fiscais_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documentos_fiscais' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: anexos_produtos
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_storage_produtos_select
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text
  );

-- INSERT: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- UPDATE: Admin, comercial, estoque
CREATE POLICY pol_storage_produtos_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- DELETE: Admin apenas
CREATE POLICY pol_storage_produtos_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'anexos_produtos' AND
    (storage.foldername(name))[1] = public.current_empresa()::text AND
    public.current_perfil() = 'admin'
  );

-- ============================================
-- POLICIES: avatares (público)
-- ============================================

-- SELECT: Público
CREATE POLICY pol_storage_avatares_select
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatares');

-- INSERT: Próprio usuário
CREATE POLICY pol_storage_avatares_insert
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE: Próprio usuário
CREATE POLICY pol_storage_avatares_update
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: Próprio usuário
CREATE POLICY pol_storage_avatares_delete
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatares' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- FUNÇÃO: Validar upload de arquivo
-- ============================================
CREATE OR REPLACE FUNCTION validar_upload_arquivo(
  p_bucket TEXT,
  p_nome_arquivo TEXT,
  p_tamanho BIGINT,
  p_mime_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_bucket_config RECORD;
  v_mime_permitido BOOLEAN;
BEGIN
  -- Buscar configuração do bucket
  SELECT * INTO v_bucket_config
  FROM storage.buckets
  WHERE id = p_bucket;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bucket % não existe', p_bucket;
  END IF;
  
  -- Validar tamanho
  IF p_tamanho > v_bucket_config.file_size_limit THEN
    RAISE EXCEPTION 'Arquivo excede tamanho máximo de % bytes', v_bucket_config.file_size_limit;
  END IF;
  
  -- Validar MIME type
  IF v_bucket_config.allowed_mime_types IS NOT NULL THEN
    SELECT p_mime_type = ANY(v_bucket_config.allowed_mime_types) INTO v_mime_permitido;
    
    IF NOT v_mime_permitido THEN
      RAISE EXCEPTION 'Tipo de arquivo % não permitido no bucket %', p_mime_type, p_bucket;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION validar_upload_arquivo IS 'Valida upload de arquivo (tamanho + MIME type)';

-- ============================================
-- FUNÇÃO: Gerar caminho padronizado para storage
-- ============================================
CREATE OR REPLACE FUNCTION gerar_caminho_storage(
  p_empresa_id UUID,
  p_entidade TEXT,
  p_registro_id UUID,
  p_extensao TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_caminho TEXT;
  v_timestamp TEXT;
BEGIN
  -- Formato: empresa_id/entidade/registro_id/timestamp.extensao
  v_timestamp := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  v_caminho := CONCAT(
    p_empresa_id::text,
    '/',
    p_entidade,
    '/',
    p_registro_id::text,
    '/',
    v_timestamp,
    '.',
    p_extensao
  );
  
  RETURN v_caminho;
END;
$$;

COMMENT ON FUNCTION gerar_caminho_storage IS 'Gera caminho padronizado: empresa_id/entidade/registro_id/timestamp.ext';

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY pol_storage_cirurgias_select ON storage.objects IS 'Isolamento multi-tenant para documentos de cirurgias';
COMMENT ON POLICY pol_storage_fiscais_select ON storage.objects IS 'Apenas financeiro/admin acessam documentos fiscais';
COMMENT ON POLICY pol_storage_avatares_insert ON storage.objects IS 'Usuário pode fazer upload apenas do próprio avatar';




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0006_seed_minimo.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0006: Seed Mínimo
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Dados mínimos para desenvolvimento/teste
-- - Empresa de demonstração
-- - Produtos e lotes OPME exemplo
-- - Médicos e hospitais demo
-- - NÃO executar em produção
-- ============================================

-- ============================================
-- EMPRESA DEMO
-- ============================================
INSERT INTO empresas (
  id,
  nome,
  razao_social,
  cnpj,
  inscricao_estadual,
  licenca_anvisa,
  email,
  telefone,
  cidade,
  estado,
  status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'ICARUS Distribuidora OPME',
  'ICARUS Distribuidora de Materiais OPME Ltda',
  '12.345.678/0001-90',
  '123.456.789.123',
  'ANV-123456',
  'contato@icarus-opme.com.br',
  '(11) 3456-7890',
  'São Paulo',
  'SP',
  'ativa'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUTOS OPME DEMO
-- ============================================
INSERT INTO produtos (id, empresa_id, codigo_sku, descricao, fabricante, registro_anvisa, categoria, valor_unitario, status) VALUES
-- Ortopedia
('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'ORT-001', 'Prótese de Joelho Total - Modelo Advanced', 'Stryker', '80149300234', 'Ortopedia', 18500.00, 'ativo'),
('00000001-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111111', 'ORT-002', 'Placa de Fixação Coluna Cervical', 'DePuy Synthes', '80149300567', 'Ortopedia', 12800.00, 'ativo'),
('00000001-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111111', 'ORT-003', 'Parafuso Pedicular Titânio 6.5mm', 'Medtronic', '80149300891', 'Ortopedia', 450.00, 'ativo'),
-- Cardiologia
('00000001-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111111', 'CAR-001', 'Stent Coronário Drug-Eluting 3.0x18mm', 'Abbott', '80340100123', 'Cardiologia', 9200.00, 'ativo'),
('00000001-0001-0001-0001-000000000005', '11111111-1111-1111-1111-111111111111', 'CAR-002', 'Balão de Angioplastia 3.5x20mm', 'Boston Scientific', '80340100456', 'Cardiologia', 2800.00, 'ativo'),
-- Neurocirurgia
('00000001-0001-0001-0001-000000000006', '11111111-1111-1111-1111-111111111111', 'NEU-001', 'Sistema de Derivação Ventricular Programável', 'Medtronic', '80342300789', 'Neurocirurgia', 15600.00, 'ativo')
ON CONFLICT (empresa_id, codigo_sku) DO NOTHING;

-- ============================================
-- LOTES OPME DEMO
-- ============================================
INSERT INTO lotes (produto_id, numero_lote, numero_serie, data_fabricacao, data_validade, quantidade_inicial, quantidade_disponivel, status) VALUES
-- Prótese Joelho
('00000001-0001-0001-0001-000000000001', 'LOT2024-001', 'SN-PKA-2024-001', '2024-01-15', '2029-01-15', 5, 5, 'disponivel'),
('00000001-0001-0001-0001-000000000001', 'LOT2024-002', 'SN-PKA-2024-002', '2024-02-20', '2029-02-20', 3, 3, 'disponivel'),
-- Placa Coluna
('00000001-0001-0001-0001-000000000002', 'LOT2024-010', 'SN-PFC-2024-010', '2024-03-10', '2029-03-10', 10, 10, 'disponivel'),
-- Parafusos
('00000001-0001-0001-0001-000000000003', 'LOT2024-050', NULL, '2024-04-05', '2028-04-05', 100, 98, 'disponivel'),
-- Stents
('00000001-0001-0001-0001-000000000004', 'LOT2024-100', 'SN-STN-2024-100', '2024-05-12', '2027-05-12', 20, 18, 'disponivel'),
('00000001-0001-0001-0001-000000000004', 'LOT2024-101', 'SN-STN-2024-101', '2024-06-08', '2027-06-08', 15, 15, 'disponivel'),
-- Balões
('00000001-0001-0001-0001-000000000005', 'LOT2024-150', NULL, '2024-07-15', '2026-07-15', 50, 47, 'disponivel'),
-- Derivação
('00000001-0001-0001-0001-000000000006', 'LOT2024-200', 'SN-DVP-2024-200', '2024-08-20', '2029-08-20', 8, 8, 'disponivel')
ON CONFLICT (produto_id, numero_lote, numero_serie) DO NOTHING;

-- ============================================
-- MÉDICOS DEMO
-- ============================================
INSERT INTO medicos (empresa_id, nome, crm, crm_uf, especialidade, telefone, email, hospital_principal, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Roberto Silva Santos', '123456', 'SP', 'Ortopedia', '(11) 98765-4321', 'roberto.silva@hospital.com', 'Hospital São Lucas', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dra. Ana Paula Costa', '234567', 'SP', 'Cardiologia', '(11) 97654-3210', 'ana.costa@hospital.com', 'Hospital Sírio-Libanês', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dr. Carlos Eduardo Mendes', '345678', 'SP', 'Neurocirurgia', '(11) 96543-2109', 'carlos.mendes@hospital.com', 'Hospital Israelita Albert Einstein', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Dra. Maria Santos Oliveira', '456789', 'RJ', 'Ortopedia', '(21) 95432-1098', 'maria.santos@hospital.com', 'Hospital Copa D''Or', 'ativo')
ON CONFLICT (empresa_id, crm, crm_uf) DO NOTHING;

-- ============================================
-- HOSPITAIS DEMO
-- ============================================
INSERT INTO hospitais (empresa_id, nome, cnpj, cidade, estado, tipo, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Hospital São Lucas', '12.345.678/0001-10', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Sírio-Libanês', '23.456.789/0001-11', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Israelita Albert Einstein', '34.567.890/0001-12', 'São Paulo', 'SP', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Hospital Copa D''Or', '45.678.900/0001-13', 'Rio de Janeiro', 'RJ', 'hospital', 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Centro Cirúrgico Avançado', '56.789.012/0001-14', 'São Paulo', 'SP', 'centro_cirurgico', 'ativo')
ON CONFLICT (empresa_id, cnpj) DO NOTHING;

-- ============================================
-- FORNECEDORES DEMO
-- ============================================
INSERT INTO fornecedores (empresa_id, nome, cnpj, categoria, rating, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Stryker do Brasil', '10.123.456/0001-90', 'Ortopedia', 4.8, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'DePuy Synthes Brasil', '20.234.567/0001-91', 'Ortopedia', 4.7, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Medtronic Brasil', '30.345.678/0001-92', 'Cardiologia', 4.9, 'ativo'),
('11111111-1111-1111-1111-111111111111', 'Abbott Vascular Brasil', '40.456.789/0001-93', 'Cardiologia', 4.6, 'ativo')
ON CONFLICT (empresa_id, cnpj) DO NOTHING;

-- ============================================
-- CIRURGIAS DEMO (próximas 7 dias)
-- ============================================
INSERT INTO cirurgias (
  empresa_id,
  codigo_interno,
  medico_id,
  hospital_id,
  paciente_iniciais,
  procedimento,
  data_cirurgia,
  hora_cirurgia,
  sala,
  status,
  prioridade,
  valor_estimado
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-001',
  (SELECT id FROM medicos WHERE crm = '123456' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital São Lucas' LIMIT 1),
  'J.S.',
  'Artroplastia Total de Joelho',
  CURRENT_DATE + INTERVAL '2 days',
  '08:00',
  'Sala 3',
  'agendada',
  'media',
  22000.00
),
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-002',
  (SELECT id FROM medicos WHERE crm = '234567' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital Sírio-Libanês' LIMIT 1),
  'M.A.',
  'Angioplastia Coronária com Stent',
  CURRENT_DATE + INTERVAL '3 days',
  '10:30',
  'Sala 1 - Hemodinâmica',
  'confirmada',
  'alta',
  12500.00
),
(
  '11111111-1111-1111-1111-111111111111',
  'CIR-2025-003',
  (SELECT id FROM medicos WHERE crm = '345678' AND crm_uf = 'SP' LIMIT 1),
  (SELECT id FROM hospitais WHERE nome = 'Hospital Israelita Albert Einstein' LIMIT 1),
  'R.P.',
  'Derivação Ventrículo-Peritoneal',
  CURRENT_DATE + INTERVAL '5 days',
  '14:00',
  'Sala 2',
  'agendada',
  'urgente',
  18900.00
)
ON CONFLICT (empresa_id, codigo_interno) DO NOTHING;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE empresas IS 'Seed: 1 empresa demo';
COMMENT ON TABLE produtos IS 'Seed: 6 produtos OPME (ortopedia, cardiologia, neurocirurgia)';
COMMENT ON TABLE lotes IS 'Seed: 8 lotes com rastreabilidade ANVISA';
COMMENT ON TABLE medicos IS 'Seed: 4 médicos especialistas';
COMMENT ON TABLE hospitais IS 'Seed: 5 hospitais/centros cirúrgicos';
COMMENT ON TABLE cirurgias IS 'Seed: 3 cirurgias agendadas (próximos dias)';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Este seed é para DESENVOLVIMENTO apenas.
-- Em produção, criar empresa real via signup.
-- UUIDs fixos facilitam testes, mas NÃO usar em prod.




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0007_dpo_encarregado.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration 0007: DPO (Encarregado de Dados)
-- Data: 2025-10-18
-- Versão: 1.0
-- Descrição: Adiciona campos de DPO conforme LGPD Art. 41
-- ============================================

-- ============================================
-- ADICIONAR CAMPOS DPO NA TABELA EMPRESAS
-- ============================================

ALTER TABLE empresas 
ADD COLUMN IF NOT EXISTS dpo_nome TEXT,
ADD COLUMN IF NOT EXISTS dpo_email TEXT,
ADD COLUMN IF NOT EXISTS dpo_telefone TEXT,
ADD COLUMN IF NOT EXISTS dpo_cpf TEXT,
ADD COLUMN IF NOT EXISTS dpo_nomeado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dpo_tipo TEXT CHECK (dpo_tipo IN ('interno', 'externo')) DEFAULT 'interno';

-- Comentários
COMMENT ON COLUMN empresas.dpo_nome IS 'Nome completo do Encarregado de Proteção de Dados (LGPD Art. 41)';
COMMENT ON COLUMN empresas.dpo_email IS 'E-mail público de contato do DPO (obrigatório publicar)';
COMMENT ON COLUMN empresas.dpo_telefone IS 'Telefone do DPO (opcional)';
COMMENT ON COLUMN empresas.dpo_cpf IS 'CPF do DPO (interno apenas)';
COMMENT ON COLUMN empresas.dpo_nomeado_em IS 'Data de nomeação formal do DPO';
COMMENT ON COLUMN empresas.dpo_tipo IS 'Tipo: interno (funcionário) ou externo (consultoria)';

-- ============================================
-- CRIAR ÍNDICE PARA BUSCA DE DPO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_empresas_dpo_email ON empresas(dpo_email) WHERE dpo_email IS NOT NULL;

-- ============================================
-- FUNÇÃO: Validar DPO configurado
-- ============================================

CREATE OR REPLACE FUNCTION validar_dpo_configurado(p_empresa_id UUID)
RETURNS TABLE(
  configurado BOOLEAN,
  mensagem TEXT,
  dpo_nome TEXT,
  dpo_email TEXT,
  dias_desde_nomeacao INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (e.dpo_nome IS NOT NULL AND e.dpo_email IS NOT NULL) AS configurado,
    CASE
      WHEN e.dpo_nome IS NULL THEN 'DPO não nomeado (obrigatório LGPD Art. 41)'
      WHEN e.dpo_email IS NULL THEN 'E-mail do DPO não configurado'
      WHEN e.dpo_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN 'E-mail do DPO inválido'
      ELSE '✅ DPO configurado corretamente'
    END AS mensagem,
    e.dpo_nome,
    e.dpo_email,
    EXTRACT(DAY FROM NOW() - e.dpo_nomeado_em)::INTEGER AS dias_desde_nomeacao
  FROM empresas e
  WHERE e.id = p_empresa_id;
END;
$$;

COMMENT ON FUNCTION validar_dpo_configurado IS 'Valida se DPO está corretamente configurado (LGPD Art. 41)';

-- ============================================
-- TRIGGER: Alerta de DPO não configurado
-- ============================================

CREATE OR REPLACE FUNCTION check_dpo_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Avisar se empresa criada sem DPO
  IF NEW.dpo_email IS NULL THEN
    RAISE WARNING 'Empresa criada sem DPO. Configure em até 30 dias (LGPD Art. 41)';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_dpo_empresas
  AFTER INSERT ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION check_dpo_on_insert();

-- ============================================
-- VIEW: Empresas sem DPO configurado
-- ============================================

CREATE OR REPLACE VIEW view_empresas_sem_dpo AS
SELECT
  id,
  nome,
  cnpj,
  email,
  criado_em,
  EXTRACT(DAY FROM NOW() - criado_em)::INTEGER AS dias_desde_criacao,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 30 THEN '🔴 CRÍTICO (>30 dias)'
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 15 THEN '🟡 URGENTE (>15 dias)'
    ELSE '🟢 OK (<15 dias)'
  END AS alerta
FROM empresas
WHERE (dpo_nome IS NULL OR dpo_email IS NULL)
  AND excluido_em IS NULL
  AND status = 'ativa';

COMMENT ON VIEW view_empresas_sem_dpo IS 'Lista empresas sem DPO configurado (compliance check)';

-- ============================================
-- SEED: Atualizar empresa demo com DPO
-- ============================================

-- Exemplo: Atualizar empresa demo (ajustar conforme necessário)
UPDATE empresas
SET
  dpo_nome = 'DPO Provisório',
  dpo_email = 'dpo@icarus-opme.com.br',
  dpo_telefone = '(11) 99999-9999',
  dpo_tipo = 'interno',
  dpo_nomeado_em = NOW()
WHERE id = '11111111-1111-1111-1111-111111111111'
  AND dpo_email IS NULL;  -- Só atualiza se ainda não tem

-- ============================================
-- DADOS DE EXEMPLO (comentado - descomentar para testar)
-- ============================================

/*
-- Exemplo de nomeação de DPO interno
UPDATE empresas
SET
  dpo_nome = 'João Silva Santos',
  dpo_email = 'joao.silva@empresa.com.br',
  dpo_telefone = '(11) 98765-4321',
  dpo_cpf = '123.456.789-00',
  dpo_tipo = 'interno',
  dpo_nomeado_em = NOW()
WHERE cnpj = '12.345.678/0001-90';

-- Exemplo de DPO externo (consultoria)
UPDATE empresas
SET
  dpo_nome = 'DataPrivacy Brasil Consultoria',
  dpo_email = 'contato@dataprivacy.com.br',
  dpo_telefone = '(11) 3456-7890',
  dpo_tipo = 'externo',
  dpo_nomeado_em = NOW()
WHERE cnpj = '98.765.432/0001-10';
*/

-- ============================================
-- VALIDAÇÃO
-- ============================================

-- Verificar empresas sem DPO
DO $$
DECLARE
  empresas_sem_dpo INTEGER;
BEGIN
  SELECT COUNT(*) INTO empresas_sem_dpo
  FROM view_empresas_sem_dpo;
  
  IF empresas_sem_dpo > 0 THEN
    RAISE NOTICE '⚠️  % empresa(s) sem DPO configurado', empresas_sem_dpo;
    RAISE NOTICE 'Execute: SELECT * FROM view_empresas_sem_dpo;';
  ELSE
    RAISE NOTICE '✅ Todas as empresas têm DPO configurado';
  END IF;
END $$;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0008_storage_icarus_new.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- Migration: Storage Bucket icarus_new
-- Data: 2025-10-18
-- Versão: 1.1
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria bucket icarus_new para armazenamento geral
-- - Policies RLS multi-tenant por empresa_id
-- - Estrutura de pastas: {empresa_id}/{categoria}/{arquivo}
-- ============================================

-- ============================================
-- 1. CRIAR BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'icarus_new',
  'icarus_new',
  false, -- privado, requer autenticação
  52428800, -- 50MB limite por arquivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. POLICIES RLS - SELECT (visualizar)
-- ============================================
CREATE POLICY "icarus_new_select_own_empresa"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 3. POLICIES RLS - INSERT (upload)
-- ============================================
CREATE POLICY "icarus_new_insert_own_empresa"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 4. POLICIES RLS - UPDATE (atualizar)
-- ============================================
CREATE POLICY "icarus_new_update_own_empresa"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
)
WITH CHECK (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa()
);

-- ============================================
-- 5. POLICIES RLS - DELETE (excluir)
-- ============================================
CREATE POLICY "icarus_new_delete_admin_only"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'icarus_new' AND
  (storage.foldername(name))[1]::uuid = public.current_empresa() AND
  public.current_perfil() IN ('admin', 'comercial')
);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "icarus_new_select_own_empresa" ON storage.objects IS 
  'Permite visualizar arquivos da própria empresa (multi-tenant)';

COMMENT ON POLICY "icarus_new_insert_own_empresa" ON storage.objects IS 
  'Permite upload de arquivos para a própria empresa';

COMMENT ON POLICY "icarus_new_delete_admin_only" ON storage.objects IS 
  'Permite exclusão apenas para admin e comercial';

-- ============================================
-- ESTRUTURA DE PASTAS SUGERIDA
-- ============================================
-- {empresa_id}/cirurgias/{cirurgia_id}/documento.pdf
-- {empresa_id}/produtos/{produto_id}/imagem.jpg
-- {empresa_id}/usuarios/{usuario_id}/avatar.png
-- {empresa_id}/documentos/contrato.pdf
-- {empresa_id}/nfe/{numero_nfe}.xml
-- {empresa_id}/nfe/{numero_nfe}.pdf




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0009_tutores_economia_corrigido.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🚀 MIGRAÇÃO 0009 — TUTORES IA & ECONOMIA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Equipe: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
-- Objetivo: Criar tabelas para Feature Flags, RAG, Tutores IA e Compliance
-- Estratégia: IF NOT EXISTS para evitar conflitos
-- RLS: Removido (será implementado na Fase S4)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 0. EXTENSION VECTOR (DEVE VIR PRIMEIRO!)
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. FEATURE FLAGS (A/B Testing)
-- ============================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  user_segments TEXT[],
  description TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE feature_flags IS 'Sistema de feature flags para A/B testing e rollout gradual';

-- ============================================
-- 2. BASE DE CONHECIMENTO (RAG)
-- ============================================

CREATE TABLE IF NOT EXISTS conhecimento_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id TEXT NOT NULL,
  conteudo_texto TEXT NOT NULL,
  embedding VECTOR(1536),
  categoria TEXT NOT NULL,
  modulo TEXT,
  tags TEXT[],
  url_origem TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conhecimento_embedding ON conhecimento_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_conhecimento_categoria ON conhecimento_base(categoria);
CREATE INDEX IF NOT EXISTS idx_conhecimento_modulo ON conhecimento_base(modulo);

COMMENT ON TABLE conhecimento_base IS 'Base de conhecimento para RAG (Retrieval Augmented Generation)';

-- ============================================
-- 3. LOGS DE TUTORES IA
-- ============================================

CREATE TABLE IF NOT EXISTS tutor_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  modulo TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  feedback INTEGER CHECK (feedback >= 1 AND feedback <= 5),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tutor_logs_usuario ON tutor_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_modulo ON tutor_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_tutor_logs_criado ON tutor_logs(criado_em DESC);

COMMENT ON TABLE tutor_logs IS 'Histórico de interações com tutores IA para melhoria contínua';

-- ============================================
-- 4. CERTIFICAÇÕES DE USUÁRIOS
-- ============================================

CREATE TABLE IF NOT EXISTS certificacoes_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  papel TEXT NOT NULL,
  data_certificacao TIMESTAMPTZ DEFAULT NOW(),
  data_validade TIMESTAMPTZ,
  evidencia_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_usuario ON certificacoes_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cert_validade ON certificacoes_usuario(data_validade);

COMMENT ON TABLE certificacoes_usuario IS 'Certificações e treinamentos dos usuários nos módulos';

-- ============================================
-- 5. ATUALIZAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS legislacao_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leg_data ON legislacao_updates(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_leg_status ON legislacao_updates(status);

COMMENT ON TABLE legislacao_updates IS 'Atualizações de legislação (ANVISA, RFB, etc) capturadas automaticamente';

-- ============================================
-- 6. NOTIFICAÇÕES DE LEGISLAÇÃO
-- ============================================

CREATE TABLE IF NOT EXISTS notificacoes_legislacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  legislacao_id UUID REFERENCES legislacao_updates(id),
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_usuario ON notificacoes_legislacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notif_lida ON notificacoes_legislacao(lida);

COMMENT ON TABLE notificacoes_legislacao IS 'Notificações de mudanças legislativas para usuários';

-- ============================================
-- 7. ATUALIZAR TABELA EXISTENTE (se existir)
-- ============================================

DO $$
BEGIN
  -- Adicionar colunas em documentos_regulatorios se a tabela existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documentos_regulatorios') THEN
    
    -- Adicionar coluna analise_ia_jsonb
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'analise_ia_jsonb'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN analise_ia_jsonb JSONB;
    END IF;
    
    -- Adicionar coluna status_conformidade
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'documentos_regulatorios' 
        AND column_name = 'status_conformidade'
    ) THEN
      ALTER TABLE documentos_regulatorios ADD COLUMN status_conformidade TEXT;
    END IF;
    
  END IF;
END $$;

-- ============================================
-- 8. TRIGGERS DE UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas relevantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at'
  ) THEN
    CREATE TRIGGER update_feature_flags_updated_at
      BEFORE UPDATE ON feature_flags
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conhecimento_updated_at'
  ) THEN
    CREATE TRIGGER update_conhecimento_updated_at
      BEFORE UPDATE ON conhecimento_base
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_legislacao_updated_at'
  ) THEN
    CREATE TRIGGER update_legislacao_updated_at
      BEFORE UPDATE ON legislacao_updates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

-- Verificação final
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'feature_flags',
      'conhecimento_base',
      'tutor_logs',
      'certificacoes_usuario',
      'legislacao_updates',
      'notificacoes_legislacao'
    );
  
  RAISE NOTICE 'Migração 0009 concluída! Tabelas criadas: %', table_count;
  RAISE NOTICE 'RLS será implementado na Fase S4 (Auth & Security)';
END $$;



-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0010_fulltext_search.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔍 MIGRAÇÃO 0010 — FULL-TEXT SEARCH (PostgreSQL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Implementar busca nativa PostgreSQL (sem Meilisearch/Docker)
-- Substitui: Meilisearch
-- Economia: US$ 600-1.2k/ano
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. HABILITAR EXTENSÕES
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS unaccent; -- Remove acentos

-- ============================================
-- 2. CRIAR ÍNDICES FULL-TEXT SEARCH
-- ============================================

-- Índice para conhecimento_base (busca em português)
CREATE INDEX IF NOT EXISTS idx_conhecimento_fts 
ON conhecimento_base 
USING GIN (to_tsvector('portuguese', conteudo_texto));

-- Índice trigram para busca aproximada
CREATE INDEX IF NOT EXISTS idx_conhecimento_trgm 
ON conhecimento_base 
USING GIN (conteudo_texto gin_trgm_ops);

-- Índice para legislacao_updates
CREATE INDEX IF NOT EXISTS idx_legislacao_fts 
ON legislacao_updates 
USING GIN (to_tsvector('portuguese', 
  COALESCE(titulo, '') || ' ' || COALESCE(descricao, '')));

-- ============================================
-- 3. FUNÇÃO DE BUSCA INTELIGENTE
-- ============================================

CREATE OR REPLACE FUNCTION buscar_conhecimento(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10,
  min_rank REAL DEFAULT 0.1
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  rank REAL,
  relevancia TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    ts_rank(
      to_tsvector('portuguese', cb.conteudo_texto), 
      plainto_tsquery('portuguese', query_text)
    ) as rank,
    CASE 
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.5 
        THEN 'alta'
      WHEN ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                   plainto_tsquery('portuguese', query_text)) > 0.2 
        THEN 'media'
      ELSE 'baixa'
    END as relevancia
  FROM conhecimento_base cb
  WHERE to_tsvector('portuguese', cb.conteudo_texto) 
        @@ plainto_tsquery('portuguese', query_text)
        AND ts_rank(to_tsvector('portuguese', cb.conteudo_texto), 
                    plainto_tsquery('portuguese', query_text)) >= min_rank
  ORDER BY rank DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_conhecimento IS 'Busca full-text em português na base de conhecimento com ranking';

-- ============================================
-- 4. FUNÇÃO DE BUSCA APROXIMADA (TYPOS)
-- ============================================

CREATE OR REPLACE FUNCTION buscar_similar(
  query_text TEXT,
  min_similarity REAL DEFAULT 0.3,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  documento_id TEXT,
  conteudo_texto TEXT,
  categoria TEXT,
  modulo TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.id,
    cb.documento_id,
    cb.conteudo_texto,
    cb.categoria,
    cb.modulo,
    similarity(cb.conteudo_texto, query_text) as similarity
  FROM conhecimento_base cb
  WHERE cb.conteudo_texto % query_text
        AND similarity(cb.conteudo_texto, query_text) >= min_similarity
  ORDER BY similarity DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_similar IS 'Busca por similaridade (tolera typos)';

-- ============================================
-- 5. FUNÇÃO DE BUSCA EM LEGISLAÇÃO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_legislacao(
  query_text TEXT,
  limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  data_publicacao DATE,
  link_oficial TEXT,
  impacto_modulos TEXT[],
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lu.id,
    lu.titulo,
    lu.descricao,
    lu.data_publicacao,
    lu.link_oficial,
    lu.impacto_modulos,
    ts_rank(
      to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')), 
      plainto_tsquery('portuguese', query_text)
    ) as rank
  FROM legislacao_updates lu
  WHERE to_tsvector('portuguese', 
        COALESCE(lu.titulo, '') || ' ' || COALESCE(lu.descricao, '')) 
        @@ plainto_tsquery('portuguese', query_text)
  ORDER BY rank DESC, lu.data_publicacao DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_legislacao IS 'Busca full-text em atualizações de legislação';

-- ============================================
-- 6. VIEW MATERIALIZADA PARA PERFORMANCE
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_busca_rapida AS
SELECT 
  id,
  documento_id,
  conteudo_texto,
  categoria,
  modulo,
  to_tsvector('portuguese', conteudo_texto) as tsv
FROM conhecimento_base;

CREATE INDEX IF NOT EXISTS idx_mv_busca_fts 
ON mv_busca_rapida USING GIN (tsv);

-- Função para refresh da view
CREATE OR REPLACE FUNCTION refresh_busca_cache()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_busca_rapida;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_busca_cache IS 'Atualiza cache de busca (executar periodicamente)';

-- ============================================
-- 7. FUNÇÃO DE AUTOCOMPLETE/SUGESTÕES
-- ============================================

CREATE OR REPLACE FUNCTION sugerir_termos(
  prefix_text TEXT,
  limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  sugestao TEXT,
  frequencia BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    word as sugestao,
    COUNT(*) as frequencia
  FROM (
    SELECT unnest(tsvector_to_array(to_tsvector('portuguese', conteudo_texto))) as word
    FROM conhecimento_base
  ) words
  WHERE word LIKE prefix_text || '%'
  GROUP BY word
  ORDER BY frequencia DESC, word
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sugerir_termos IS 'Autocomplete de termos de busca';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%_fts';
  
  RAISE NOTICE 'Migração 0010 concluída! Índices FTS criados: %', index_count;
  RAISE NOTICE 'Substituindo Meilisearch por PostgreSQL FTS (economia: US$ 600-1.2k/ano)';
END $$;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0011_cadastros_completo.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- MIGRATION: Cadastros Completos (Médicos, Hospitais, Pacientes, Convênios)
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Cadastros Inteligentes
-- ============================================================================

-- ============================================================================
-- 1. TABELA: pacientes
-- ============================================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  nome_completo TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  sexo TEXT CHECK (sexo IN ('M', 'F', 'Outro')),
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  
  -- Filiação
  nome_mae TEXT NOT NULL,
  nome_pai TEXT,
  
  -- Contato
  telefone TEXT,
  celular TEXT,
  email TEXT,
  
  -- Endereço (JSONB)
  endereco JSONB,
  
  -- Dados do Convênio
  convenio_id UUID REFERENCES convenios(id),
  numero_carteirinha TEXT,
  validade_plano DATE,
  plano TEXT,
  tipo_atendimento TEXT CHECK (tipo_atendimento IN ('ambulatorial', 'hospitalar', 'completo')),
  
  -- Informações Médicas
  grupo_sanguineo TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  observacoes_saude TEXT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  consentimento_lgpd BOOLEAN DEFAULT false,
  consentimento_lgpd_data TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  -- Índices e Constraints
  CONSTRAINT pacientes_numero_carteirinha_convenio_uk UNIQUE (numero_carteirinha, convenio_id)
);

-- Índices
CREATE INDEX idx_pacientes_empresa ON pacientes(empresa_id);
CREATE INDEX idx_pacientes_cpf ON pacientes(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_pacientes_nome ON pacientes USING gin(to_tsvector('portuguese', nome_completo));
CREATE INDEX idx_pacientes_convenio ON pacientes(convenio_id);
CREATE INDEX idx_pacientes_ativo ON pacientes(ativo);

-- Trigger para updated_at
CREATE TRIGGER pacientes_updated_at BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pacientes IS 'Cadastro de pacientes para cirurgias OPME';

-- ============================================================================
-- 2. TABELA: convenios
-- ============================================================================
CREATE TABLE IF NOT EXISTS convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  ans_registro TEXT,
  tipo TEXT CHECK (tipo IN ('plano_saude', 'seguros', 'publico')),
  
  -- Contato
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  site TEXT,
  
  -- Dados Financeiros
  prazo_pagamento INT DEFAULT 30,
  taxa_administrativa NUMERIC(5,2) DEFAULT 0,
  forma_pagamento TEXT CHECK (forma_pagamento IN ('ted', 'boleto', 'pix', 'cheque')),
  dia_fechamento INT,
  dia_pagamento INT,
  
  -- Configurações de Faturamento
  faturamento_eletronico BOOLEAN DEFAULT false,
  portal_faturamento TEXT,
  login_portal TEXT,
  exige_autorizacao BOOLEAN DEFAULT false,
  prazo_autorizacao INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT convenios_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_convenios_empresa ON convenios(empresa_id);
CREATE INDEX idx_convenios_cnpj ON convenios(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_convenios_ans ON convenios(ans_registro) WHERE ans_registro IS NOT NULL;
CREATE INDEX idx_convenios_ativo ON convenios(ativo);

-- Trigger
CREATE TRIGGER convenios_updated_at BEFORE UPDATE ON convenios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE convenios IS 'Cadastro de convênios e planos de saúde';

-- ============================================================================
-- 3. TABELA: equipes_medicas
-- ============================================================================
CREATE TABLE IF NOT EXISTS equipes_medicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Identificação
  nome TEXT NOT NULL,
  medico_responsavel_id UUID NOT NULL REFERENCES medicos(id),
  especialidade TEXT,
  hospital_id UUID REFERENCES hospitais(id),
  
  -- Configurações Operacionais
  dias_atuacao TEXT[], -- ['Segunda', 'Terça', ...]
  horarios_preferencia TEXT,
  cirurgias_semana_media INT,
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT equipes_medicas_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_equipes_medicas_empresa ON equipes_medicas(empresa_id);
CREATE INDEX idx_equipes_medicas_responsavel ON equipes_medicas(medico_responsavel_id);
CREATE INDEX idx_equipes_medicas_hospital ON equipes_medicas(hospital_id);
CREATE INDEX idx_equipes_medicas_ativo ON equipes_medicas(ativo);

-- Trigger
CREATE TRIGGER equipes_medicas_updated_at BEFORE UPDATE ON equipes_medicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE equipes_medicas IS 'Cadastro de equipes médicas';

-- ============================================================================
-- 4. TABELA: membros_equipe
-- ============================================================================
CREATE TABLE IF NOT EXISTS membros_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES equipes_medicas(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  funcao TEXT CHECK (funcao IN ('cirurgiao_principal', 'cirurgiao_auxiliar', 'anestesista', 'instrumentador', 'auxiliar_enfermagem')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT membros_equipe_uk UNIQUE (equipe_id, medico_id)
);

-- Índices
CREATE INDEX idx_membros_equipe_equipe ON membros_equipe(equipe_id);
CREATE INDEX idx_membros_equipe_medico ON membros_equipe(medico_id);

COMMENT ON TABLE membros_equipe IS 'Membros das equipes médicas';

-- ============================================================================
-- 5. TABELA: transportadoras
-- ============================================================================
CREATE TABLE IF NOT EXISTS transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Dados Institucionais
  nome TEXT NOT NULL,
  cnpj TEXT,
  tipo TEXT CHECK (tipo IN ('rodoviario', 'aereo', 'courier', 'multimodal')),
  
  -- Contato
  telefone TEXT,
  email TEXT,
  site TEXT,
  
  -- Endereço
  endereco JSONB,
  
  -- Dados Operacionais
  prazo_entrega_medio INT, -- dias
  custo_km NUMERIC(10,2),
  raio_atendimento INT, -- km
  horario_coleta TEXT,
  
  -- Integração API
  possui_api BOOLEAN DEFAULT false,
  api_url TEXT,
  api_token TEXT,
  api_auth_type TEXT CHECK (api_auth_type IN ('bearer', 'basic', 'api_key', 'oauth2')),
  
  -- Avaliação
  avaliacao NUMERIC(2,1) CHECK (avaliacao >= 0 AND avaliacao <= 5),
  
  -- Metadados
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT transportadoras_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_transportadoras_empresa ON transportadoras(empresa_id);
CREATE INDEX idx_transportadoras_cnpj ON transportadoras(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_transportadoras_tipo ON transportadoras(tipo);
CREATE INDEX idx_transportadoras_ativo ON transportadoras(ativo);

-- Trigger
CREATE TRIGGER transportadoras_updated_at BEFORE UPDATE ON transportadoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE transportadoras IS 'Cadastro de transportadoras para logística';

-- ============================================================================
-- 6. TABELA: grupos_produtos
-- ============================================================================
CREATE TABLE IF NOT EXISTS grupos_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT grupos_produtos_nome_uk UNIQUE (empresa_id, nome)
);

-- Índices
CREATE INDEX idx_grupos_produtos_empresa ON grupos_produtos(empresa_id);
CREATE INDEX idx_grupos_produtos_ativo ON grupos_produtos(ativo);

COMMENT ON TABLE grupos_produtos IS 'Grupos de produtos OPME para organização';

-- ============================================================================
-- VIEWS: Cadastros KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_cadastros_kpis AS
SELECT
  e.id AS empresa_id,
  COUNT(DISTINCT m.id) FILTER (WHERE m.ativo = true) AS medicos_ativos,
  COUNT(DISTINCT h.id) FILTER (WHERE h.ativo = true) AS hospitais_ativos,
  COUNT(DISTINCT p.id) AS total_pacientes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.ativo = true) AS convenios_ativos,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) AS fornecedores_ativos,
  COUNT(DISTINCT pr.id) AS produtos_opme,
  COUNT(DISTINCT eq.id) FILTER (WHERE eq.ativo = true) AS equipes_medicas_ativas,
  COUNT(DISTINCT t.id) FILTER (WHERE t.ativo = true) AS transportadoras_ativas
FROM empresas e
LEFT JOIN medicos m ON m.empresa_id = e.id
LEFT JOIN hospitais h ON h.empresa_id = e.id
LEFT JOIN pacientes p ON p.empresa_id = e.id
LEFT JOIN convenios c ON c.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
LEFT JOIN produtos pr ON pr.empresa_id = e.id
LEFT JOIN equipes_medicas eq ON eq.empresa_id = e.id
LEFT JOIN transportadoras t ON t.empresa_id = e.id
GROUP BY e.id;

COMMENT ON VIEW v_cadastros_kpis IS 'KPIs consolidados de cadastros';

-- ============================================================================
-- GRANTS (RLS configurado separadamente)
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON convenios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON equipes_medicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON membros_equipe TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transportadoras TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON grupos_produtos TO authenticated;
GRANT SELECT ON v_cadastros_kpis TO authenticated;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0011_seed_conhecimento.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📚 SEED INICIAL — BASE DE CONHECIMENTO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Popula conhecimento_base com conteúdo inicial dos módulos ICARUS
-- Data: 2025-10-20
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. MÓDULO CIRURGIAS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'cirurgias-001',
  'Gestão de Cirurgias - O módulo de cirurgias permite o agendamento completo de procedimentos cirúrgicos, incluindo sala, equipe médica, materiais OPME e anestesistas. Integra com estoque de consignação e faturamento TISS.',
  'documentacao',
  'cirurgias',
  ARRAY['agendamento', 'opme', 'tiss', 'equipe-medica']
),
(
  'cirurgias-002',
  'Checklist ANVISA - Antes de cada cirurgia, o sistema exige preenchimento do checklist de segurança cirúrgica conforme protocolo ANVISA/OMS. Inclui verificação de paciente, sítio cirúrgico, consentimento e disponibilidade de materiais.',
  'compliance',
  'cirurgias',
  ARRAY['anvisa', 'seguranca', 'protocolo', 'checklist']
),
(
  'cirurgias-003',
  'Rastreabilidade OPME - Todo material ortopédico (OPME) utilizado em cirurgia deve ter rastreabilidade completa: lote, validade, fornecedor, número de série. Sistema gera etiquetas e vincula ao prontuário do paciente.',
  'compliance',
  'cirurgias',
  ARRAY['opme', 'rastreabilidade', 'anvisa', 'lote']
);

-- ============================================
-- 2. MÓDULO COMPLIANCE
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'compliance-001',
  'LGPD - Lei Geral de Proteção de Dados. O sistema ICARUS implementa minimização de dados, consentimento explícito, direito ao esquecimento (soft delete), anonimização e criptografia. Todos os acessos são auditados.',
  'regulatorio',
  'compliance',
  ARRAY['lgpd', 'privacidade', 'dados-pessoais', 'auditoria']
),
(
  'compliance-002',
  'ANVISA RDC 36/2013 - Resolve sobre segurança do paciente e qualidade em serviços de saúde. Estabelece ações para redução de riscos de incidentes, eventos adversos e infecções relacionadas à assistência à saúde.',
  'regulatorio',
  'compliance',
  ARRAY['anvisa', 'rdc-36', 'seguranca-paciente', 'qualidade']
),
(
  'compliance-003',
  'ISO 9001 - Sistema de gestão da qualidade. ICARUS documenta processos, não-conformidades, ações corretivas e preventivas. Inclui indicadores de qualidade e satisfação do cliente.',
  'regulatorio',
  'compliance',
  ARRAY['iso-9001', 'qualidade', 'processos', 'indicadores']
);

-- ============================================
-- 3. MÓDULO ESTOQUE & CONSIGNAÇÃO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'estoque-001',
  'Consignação de OPME - Sistema para gestão de materiais em consignação (comodato). Controla entrada, saída, devoluções, cobranças e faturamento. Integra com fornecedores e NFe.',
  'documentacao',
  'estoque',
  ARRAY['consignacao', 'opme', 'fornecedor', 'nfe']
),
(
  'estoque-002',
  'Curva ABC - Classificação de produtos por valor (A: 80% do valor, B: 15%, C: 5%). Sistema calcula automaticamente e sugere políticas de estoque mínimo/máximo por categoria.',
  'documentacao',
  'estoque',
  ARRAY['curva-abc', 'gestao', 'estoque-minimo', 'compras']
),
(
  'estoque-003',
  'Validade de Materiais - Sistema alerta sobre vencimentos próximos (30, 15, 7 dias). Bloqueia uso de materiais vencidos em cirurgias. Gera relatórios de perdas por validade.',
  'documentacao',
  'estoque',
  ARRAY['validade', 'vencimento', 'alertas', 'perdas']
);

-- ============================================
-- 4. MÓDULO FINANCEIRO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'financeiro-001',
  'Contas a Receber - Controle de faturamento de cirurgias, consultas e procedimentos. Emite boletos, PIX, cartão. Integra com operadoras de saúde (TISS) e bancos.',
  'documentacao',
  'financeiro',
  ARRAY['contas-receber', 'faturamento', 'tiss', 'cobranca']
),
(
  'financeiro-002',
  'Contas a Pagar - Gestão de fornecedores, boletos, pagamentos programados. Controla fluxo de caixa, centro de custos e aprovações. Integra com bancos para remessa/retorno.',
  'documentacao',
  'financeiro',
  ARRAY['contas-pagar', 'fornecedor', 'fluxo-caixa', 'aprovacao']
),
(
  'financeiro-003',
  'DRE - Demonstração do Resultado do Exercício. Relatório gerencial com receitas, custos, despesas e lucro líquido. Comparativo mensal/anual com gráficos e indicadores.',
  'documentacao',
  'financeiro',
  ARRAY['dre', 'relatorio', 'lucro', 'indicadores']
);

-- ============================================
-- 5. LEGISLAÇÃO & REGULAMENTAÇÕES
-- ============================================

INSERT INTO legislacao_updates (titulo, descricao, data_publicacao, link_oficial, impacto_modulos, status)
VALUES 
(
  'RDC 36/2013 - Segurança do Paciente',
  'Institui ações para a segurança do paciente em serviços de saúde e dá outras providências',
  '2013-07-25',
  'https://www.gov.br/anvisa/pt-br/assuntos/servicosdesaude/seguranca-do-paciente',
  ARRAY['cirurgias', 'compliance', 'qualidade'],
  'vigente'
),
(
  'Lei 13.709/2018 - LGPD',
  'Lei Geral de Proteção de Dados Pessoais. Dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais',
  '2018-08-14',
  'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',
  ARRAY['compliance', 'cadastros', 'todos'],
  'vigente'
),
(
  'IN DIOPES 76/2021 - TISS',
  'Padrão TISS - Troca de Informações na Saúde Suplementar. Define padrões de comunicação entre prestadores e operadoras',
  '2021-12-01',
  'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss',
  ARRAY['faturamento', 'cirurgias', 'financeiro'],
  'vigente'
);

-- ============================================
-- 6. REFRESH CACHE DE BUSCA
-- ============================================

REFRESH MATERIALIZED VIEW mv_busca_rapida;

-- ============================================
-- ✅ SEED CONCLUÍDO
-- ============================================

DO $$
DECLARE
  doc_count INTEGER;
  leg_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO doc_count FROM conhecimento_base;
  SELECT COUNT(*) INTO leg_count FROM legislacao_updates;
  
  RAISE NOTICE 'Seed concluído! Documentos: %, Legislações: %', doc_count, leg_count;
  RAISE NOTICE 'Cache de busca atualizado!';
END $$;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0012_compras_completo.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================================================
-- MIGRATION: Compras e Fornecedores Completo
-- Versão: 5.0.0
-- Data: Outubro 2025
-- Descrição: Estrutura completa para Gestão de Compras e Fornecedores
-- ============================================================================

-- ============================================================================
-- 1. TABELA: solicitacoes_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitacoes_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Solicitação
  solicitante_id UUID NOT NULL REFERENCES usuarios(id),
  departamento TEXT,
  justificativa TEXT,
  urgencia TEXT CHECK (urgencia IN ('normal', 'urgente', 'emergencia')) DEFAULT 'normal',
  
  -- Status e Aprovação
  status TEXT CHECK (status IN ('rascunho', 'aguardando_aprovacao', 'aprovada', 'rejeitada', 'cancelada')) DEFAULT 'rascunho',
  aprovador_id UUID REFERENCES usuarios(id),
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT solicitacoes_compra_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_solicitacoes_compra_empresa ON solicitacoes_compra(empresa_id);
CREATE INDEX idx_solicitacoes_compra_solicitante ON solicitacoes_compra(solicitante_id);
CREATE INDEX idx_solicitacoes_compra_status ON solicitacoes_compra(status);
CREATE INDEX idx_solicitacoes_compra_urgencia ON solicitacoes_compra(urgencia);

-- Trigger
CREATE TRIGGER solicitacoes_compra_updated_at BEFORE UPDATE ON solicitacoes_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE solicitacoes_compra IS 'Solicitações de compra internas';

-- ============================================================================
-- 2. TABELA: itens_solicitacao_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_solicitacao_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_solicitacao_solicitacao ON itens_solicitacao_compra(solicitacao_id);
CREATE INDEX idx_itens_solicitacao_produto ON itens_solicitacao_compra(produto_id);

COMMENT ON TABLE itens_solicitacao_compra IS 'Itens das solicitações de compra';

-- ============================================================================
-- 3. TABELA: cotacoes
-- ============================================================================
CREATE TABLE IF NOT EXISTS cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Cotação
  solicitacao_id UUID REFERENCES solicitacoes_compra(id),
  responsavel_id UUID NOT NULL REFERENCES usuarios(id),
  prazo_resposta INT DEFAULT 48, -- horas
  validade_cotacao INT DEFAULT 7, -- dias
  
  -- Status
  status TEXT CHECK (status IN ('rascunho', 'enviada', 'em_analise', 'concluida', 'cancelada')) DEFAULT 'rascunho',
  
  -- Datas
  data_envio TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  
  -- Metadados
  observacoes TEXT,
  especificacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT cotacoes_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_cotacoes_empresa ON cotacoes(empresa_id);
CREATE INDEX idx_cotacoes_solicitacao ON cotacoes(solicitacao_id);
CREATE INDEX idx_cotacoes_responsavel ON cotacoes(responsavel_id);
CREATE INDEX idx_cotacoes_status ON cotacoes(status);
CREATE INDEX idx_cotacoes_data_envio ON cotacoes(data_envio);

-- Trigger
CREATE TRIGGER cotacoes_updated_at BEFORE UPDATE ON cotacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE cotacoes IS 'Cotações com fornecedores';

-- ============================================================================
-- 4. TABELA: itens_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  preco_referencia NUMERIC(15,2),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_cotacao_cotacao ON itens_cotacao(cotacao_id);
CREATE INDEX idx_itens_cotacao_produto ON itens_cotacao(produto_id);

COMMENT ON TABLE itens_cotacao IS 'Itens das cotações';

-- ============================================================================
-- 5. TABELA: cotacoes_fornecedores
-- ============================================================================
CREATE TABLE IF NOT EXISTS cotacoes_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Status da Resposta
  status TEXT CHECK (status IN ('aguardando', 'respondida', 'nao_respondeu', 'recusada')) DEFAULT 'aguardando',
  data_envio TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  
  -- Metadados
  observacoes_fornecedor TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT cotacoes_fornecedores_uk UNIQUE (cotacao_id, fornecedor_id)
);

-- Índices
CREATE INDEX idx_cotacoes_fornecedores_cotacao ON cotacoes_fornecedores(cotacao_id);
CREATE INDEX idx_cotacoes_fornecedores_fornecedor ON cotacoes_fornecedores(fornecedor_id);
CREATE INDEX idx_cotacoes_fornecedores_status ON cotacoes_fornecedores(status);

COMMENT ON TABLE cotacoes_fornecedores IS 'Relação entre cotações e fornecedores';

-- ============================================================================
-- 6. TABELA: propostas_cotacao
-- ============================================================================
CREATE TABLE IF NOT EXISTS propostas_cotacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_fornecedor_id UUID NOT NULL REFERENCES cotacoes_fornecedores(id) ON DELETE CASCADE,
  item_cotacao_id UUID NOT NULL REFERENCES itens_cotacao(id) ON DELETE CASCADE,
  
  -- Proposta
  preco_unitario NUMERIC(15,2) NOT NULL,
  quantidade_disponivel NUMERIC(10,2),
  prazo_entrega INT, -- dias
  condicoes_pagamento TEXT,
  validade_proposta DATE,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT propostas_cotacao_uk UNIQUE (cotacao_fornecedor_id, item_cotacao_id)
);

-- Índices
CREATE INDEX idx_propostas_cotacao_fornecedor ON propostas_cotacao(cotacao_fornecedor_id);
CREATE INDEX idx_propostas_cotacao_item ON propostas_cotacao(item_cotacao_id);

COMMENT ON TABLE propostas_cotacao IS 'Propostas dos fornecedores por item';

-- ============================================================================
-- 7. TABELA: compras_internacionais
-- ============================================================================
CREATE TABLE IF NOT EXISTS compras_internacionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero TEXT NOT NULL,
  
  -- Dados da Importação
  fornecedor_id UUID REFERENCES fornecedores(id),
  fornecedor_internacional TEXT,
  pais_origem TEXT,
  
  -- Valores
  valor_fob NUMERIC(15,2),
  valor_frete_internacional NUMERIC(15,2),
  valor_seguro NUMERIC(15,2),
  
  -- Tributos
  imposto_importacao NUMERIC(15,2),
  ipi NUMERIC(15,2),
  pis NUMERIC(15,2),
  cofins NUMERIC(15,2),
  icms NUMERIC(15,2),
  
  -- Status
  status TEXT CHECK (status IN ('analise_viabilidade', 'aprovado', 'licenca_importacao', 'embarque', 'desembaraco', 'entregue', 'cancelado')) DEFAULT 'analise_viabilidade',
  
  -- Documentos
  licenca_importacao TEXT,
  numero_di TEXT, -- Declaração de Importação
  data_embarque DATE,
  previsao_chegada DATE,
  data_desembaraco DATE,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT compras_internacionais_numero_uk UNIQUE (empresa_id, numero)
);

-- Índices
CREATE INDEX idx_compras_internacionais_empresa ON compras_internacionais(empresa_id);
CREATE INDEX idx_compras_internacionais_fornecedor ON compras_internacionais(fornecedor_id);
CREATE INDEX idx_compras_internacionais_status ON compras_internacionais(status);
CREATE INDEX idx_compras_internacionais_pais ON compras_internacionais(pais_origem);

-- Trigger
CREATE TRIGGER compras_internacionais_updated_at BEFORE UPDATE ON compras_internacionais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE compras_internacionais IS 'Gestão de compras internacionais (importação)';

-- ============================================================================
-- 8. TABELA: notas_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS notas_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  pedido_compra_id UUID REFERENCES pedidos_compra(id),
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  
  -- Dados da NF-e
  numero_nota TEXT NOT NULL,
  serie TEXT,
  chave_acesso TEXT,
  data_emissao TIMESTAMPTZ NOT NULL,
  
  -- Valores
  valor_produtos NUMERIC(15,2) NOT NULL,
  valor_frete NUMERIC(15,2) DEFAULT 0,
  valor_seguro NUMERIC(15,2) DEFAULT 0,
  valor_desconto NUMERIC(15,2) DEFAULT 0,
  valor_outros NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Impostos
  valor_icms NUMERIC(15,2) DEFAULT 0,
  valor_ipi NUMERIC(15,2) DEFAULT 0,
  valor_pis NUMERIC(15,2) DEFAULT 0,
  valor_cofins NUMERIC(15,2) DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('pendente', 'conferida', 'divergencia', 'entrada_efetuada', 'cancelada')) DEFAULT 'pendente',
  data_entrada TIMESTAMPTZ,
  
  -- XML
  xml_nfe TEXT,
  
  -- Metadados
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id),
  updated_by UUID REFERENCES usuarios(id),
  
  CONSTRAINT notas_compra_chave_uk UNIQUE (chave_acesso)
);

-- Índices
CREATE INDEX idx_notas_compra_empresa ON notas_compra(empresa_id);
CREATE INDEX idx_notas_compra_pedido ON notas_compra(pedido_compra_id);
CREATE INDEX idx_notas_compra_fornecedor ON notas_compra(fornecedor_id);
CREATE INDEX idx_notas_compra_status ON notas_compra(status);
CREATE INDEX idx_notas_compra_numero ON notas_compra(numero_nota);
CREATE INDEX idx_notas_compra_data_emissao ON notas_compra(data_emissao);

-- Trigger
CREATE TRIGGER notas_compra_updated_at BEFORE UPDATE ON notas_compra
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notas_compra IS 'Notas fiscais de entrada (compra)';

-- ============================================================================
-- 9. TABELA: itens_nota_compra
-- ============================================================================
CREATE TABLE IF NOT EXISTS itens_nota_compra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_compra_id UUID NOT NULL REFERENCES notas_compra(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id),
  
  -- Dados do Item
  codigo_produto TEXT,
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade_medida TEXT,
  
  -- Valores
  valor_unitario NUMERIC(15,2) NOT NULL,
  valor_total NUMERIC(15,2) NOT NULL,
  
  -- Rastreabilidade
  lote TEXT,
  validade DATE,
  numero_serie TEXT,
  
  -- Status
  produto_encontrado BOOLEAN DEFAULT false,
  entrada_efetuada BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_itens_nota_compra_nota ON itens_nota_compra(nota_compra_id);
CREATE INDEX idx_itens_nota_compra_produto ON itens_nota_compra(produto_id);
CREATE INDEX idx_itens_nota_compra_lote ON itens_nota_compra(lote);

COMMENT ON TABLE itens_nota_compra IS 'Itens das notas fiscais de compra';

-- ============================================================================
-- VIEWS: Compras KPIs
-- ============================================================================

CREATE OR REPLACE VIEW v_compras_kpis AS
WITH mes_atual AS (
  SELECT 
    empresa_id,
    COUNT(*) as total_compras,
    SUM(valor_total) as valor_total
  FROM pedidos_compra
  WHERE status NOT IN ('cancelado')
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
  GROUP BY empresa_id
),
pedidos_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('rascunho', 'aguardando_aprovacao', 'aprovado', 'enviado')) as pedidos_pendentes
  FROM pedidos_compra
  GROUP BY empresa_id
),
cotacoes_stats AS (
  SELECT
    empresa_id,
    COUNT(*) FILTER (WHERE status IN ('enviada', 'em_analise')) as cotacoes_abertas
  FROM cotacoes
  GROUP BY empresa_id
)
SELECT
  e.id AS empresa_id,
  COALESCE(ma.total_compras, 0) as compras_mes,
  COALESCE(ma.valor_total, 0) as valor_total_mes,
  COALESCE(ps.pedidos_pendentes, 0) as pedidos_pendentes,
  COALESCE(cs.cotacoes_abertas, 0) as cotacoes_abertas,
  COUNT(DISTINCT f.id) FILTER (WHERE f.ativo = true) as fornecedores_ativos
FROM empresas e
LEFT JOIN mes_atual ma ON ma.empresa_id = e.id
LEFT JOIN pedidos_stats ps ON ps.empresa_id = e.id
LEFT JOIN cotacoes_stats cs ON cs.empresa_id = e.id
LEFT JOIN fornecedores f ON f.empresa_id = e.id
GROUP BY e.id, ma.total_compras, ma.valor_total, ps.pedidos_pendentes, cs.cotacoes_abertas;

COMMENT ON VIEW v_compras_kpis IS 'KPIs consolidados de compras';

-- ============================================================================
-- FUNCTIONS: Cálculo de Viabilidade de Importação
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_custo_importacao(
  p_valor_fob NUMERIC,
  p_valor_frete NUMERIC,
  p_valor_seguro NUMERIC,
  p_aliquota_ii NUMERIC DEFAULT 14, -- Imposto de Importação
  p_aliquota_ipi NUMERIC DEFAULT 5,
  p_aliquota_pis NUMERIC DEFAULT 2.1,
  p_aliquota_cofins NUMERIC DEFAULT 9.65,
  p_aliquota_icms NUMERIC DEFAULT 18
) RETURNS JSONB AS $$
DECLARE
  v_base_calculo NUMERIC;
  v_ii NUMERIC;
  v_ipi NUMERIC;
  v_pis_cofins NUMERIC;
  v_icms NUMERIC;
  v_custo_total NUMERIC;
  v_resultado JSONB;
BEGIN
  -- Base de cálculo
  v_base_calculo := p_valor_fob + p_valor_frete + p_valor_seguro;
  
  -- Imposto de Importação
  v_ii := v_base_calculo * (p_aliquota_ii / 100);
  
  -- IPI
  v_ipi := (v_base_calculo + v_ii) * (p_aliquota_ipi / 100);
  
  -- PIS/COFINS
  v_pis_cofins := v_base_calculo * ((p_aliquota_pis + p_aliquota_cofins) / 100);
  
  -- ICMS
  v_icms := (v_base_calculo + v_ii + v_ipi + v_pis_cofins) * (p_aliquota_icms / 100);
  
  -- Custo Total
  v_custo_total := v_base_calculo + v_ii + v_ipi + v_pis_cofins + v_icms;
  
  -- Montar resultado
  v_resultado := jsonb_build_object(
    'valor_fob', p_valor_fob,
    'valor_frete', p_valor_frete,
    'valor_seguro', p_valor_seguro,
    'base_calculo', v_base_calculo,
    'imposto_importacao', v_ii,
    'ipi', v_ipi,
    'pis_cofins', v_pis_cofins,
    'icms', v_icms,
    'custo_total', v_custo_total,
    'acrescimo_percentual', ROUND(((v_custo_total - p_valor_fob) / p_valor_fob) * 100, 2)
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calcular_custo_importacao IS 'Calcula custo total de importação incluindo todos os tributos';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON solicitacoes_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_solicitacao_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cotacoes_fornecedores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON propostas_cotacao TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON compras_internacionais TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notas_compra TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON itens_nota_compra TO authenticated;
GRANT SELECT ON v_compras_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION calcular_custo_importacao TO authenticated;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0012_seed_opme_especializado.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📚 SEED ESPECIALIZADO — CONHECIMENTO OPME
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Base de conhecimento para Tutor IA especializado em OPME
-- Data: 2025-10-20
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- 1. DOCUMENTAÇÃO OPME — CONCEITOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-001',
  'OPME - Órteses, Próteses e Materiais Especiais. São dispositivos médicos implantáveis ou de uso único utilizados em procedimentos cirúrgicos. Incluem: placas, parafusos, pinos, stents, válvulas cardíacas, próteses articulares, malhas cirúrgicas, entre outros. A ANS regula o fornecimento de OPME através do Rol de Procedimentos.',
  'documentacao',
  'opme',
  ARRAY['conceito', 'ans', 'definicao', 'dispositivos-medicos']
),
(
  'opme-002',
  'Rastreabilidade OPME - ANVISA RDC 36/2013. Todo material OPME deve ter: número de lote, data de validade, número de série (quando aplicável), registro ANVISA, nome do fabricante. A rastreabilidade é obrigatória e deve ser mantida por no mínimo 5 anos após o uso. Etiquetas devem ser coladas no prontuário do paciente.',
  'compliance',
  'opme',
  ARRAY['rastreabilidade', 'anvisa', 'rdc-36', 'lote', 'validade']
),
(
  'opme-003',
  'Classificação de Risco OPME - ANVISA. Classe I (baixo risco): não invasivos. Classe II (médio risco): invasivos temporários. Classe III (alto risco): invasivos de longo prazo. Classe IV (altíssimo risco): implantáveis ativos ou que sustentam vida. Cada classe tem requisitos regulatórios específicos.',
  'compliance',
  'opme',
  ARRAY['classificacao', 'risco', 'anvisa', 'regulatorio']
);

-- ============================================
-- 2. JUSTIFICATIVA MÉDICA — TEMPLATES
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-just-001',
  'Justificativa Médica para OPME - Estrutura obrigatória: 1) Identificação do paciente (nome, idade, convênio, carteirinha). 2) Diagnóstico CID-10 completo e detalhado. 3) Indicação cirúrgica clara. 4) Descrição dos materiais solicitados com marca, modelo e quantidade. 5) Justificativa técnica para cada material. 6) Alternativas consideradas e por que foram descartadas. 7) Riscos caso material não seja fornecido. 8) Data, carimbo e assinatura do médico responsável com CRM.',
  'documentacao',
  'opme',
  ARRAY['justificativa', 'template', 'estrutura', 'obrigatorio']
),
(
  'opme-just-002',
  'Justificativa para Prótese de Joelho - Exemplo: "Paciente com 65 anos, portador de gonartrose grave bilateral (CID M17.0), com falha no tratamento conservador (fisioterapia, AINEs, infiltrações). Limitação funcional importante (EVA 8/10). Indicado artroplastia total de joelho. Materiais: Prótese Total de Joelho com Cimentação, componente femoral, tibial e patelar. Marca/Modelo necessários devido compatibilidade com instrumental disponível e experiência da equipe. Sem o material, paciente permanecerá com dor incapacitante e perda de qualidade de vida."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'joelho', 'protese', 'ortopedia']
),
(
  'opme-just-003',
  'Justificativa para Material de Síntese - Exemplo: "Paciente vítima de trauma, fratura exposta de tíbia Gustilo IIIB (CID S82.2). Indicado RAFI (Redução Aberta e Fixação Interna). Materiais: Placa bloqueada de tíbia, parafusos corticais e esponjosos. Justificativa: Fratura instável que requer estabilização rígida para consolidação óssea. Placa bloqueada indicada devido ao traço de fratura e qualidade óssea. Alternativas como hastes intramedulares não aplicáveis neste caso devido localização e complexidade da fratura."',
  'exemplo',
  'opme',
  ARRAY['justificativa', 'sintese', 'trauma', 'fratura']
);

-- ============================================
-- 3. GLOSAS — PREVENÇÃO E MOTIVOS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-glosa-001',
  'Glosas em OPME - Principais motivos: 1) Justificativa médica ausente ou incompleta. 2) Material não previsto no Rol ANS. 3) Falta de orçamentos (mínimo 3 fornecedores). 4) Preço acima da tabela Simpro/Brasíndice. 5) Falta de autorização prévia. 6) Documentação incompleta (nota fiscal, etiquetas). 7) CID incompatível com procedimento. 8) Material usado sem necessidade comprovada.',
  'documentacao',
  'opme',
  ARRAY['glosa', 'prevencao', 'motivos', 'auditoria']
),
(
  'opme-glosa-002',
  'Como evitar glosas OPME: 1) Sempre solicitar pré-autorização com antecedência. 2) Justificativa médica detalhada e personalizada (não usar templates genéricos). 3) Anexar exames que comprovem necessidade (RX, RM, TC). 4) Cotação de no mínimo 3 fornecedores. 5) Verificar se material está no Rol ANS. 6) Conferir validade, lote e registro ANVISA. 7) Fotografar etiquetas e colar no prontuário. 8) Documentar todo o processo cirúrgico.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'prevencao', 'checklist', 'boas-praticas']
),
(
  'opme-glosa-003',
  'Recurso de Glosa OPME - Passos: 1) Identificar motivo da glosa na negativa. 2) Reunir documentação: justificativa original, exames, relatório cirúrgico, nota fiscal, etiquetas. 3) Elaborar contra-argumentação técnica com literatura científica. 4) Reforçar CID e correlação com material. 5) Demonstrar que material é essencial e sem alternativa. 6) Anexar guidelines ou protocolos médicos. 7) Enviar recurso dentro do prazo (geralmente 30 dias). 8) Acompanhar via ANS se negado novamente.',
  'procedimento',
  'opme',
  ARRAY['glosa', 'recurso', 'contestacao', 'ans']
);

-- ============================================
-- 4. TABELAS DE PREÇOS — REFERÊNCIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-preco-001',
  'Tabelas de Preço OPME - Referências: 1) Simpro (Sistema Integrado de Processos): tabela oficial governo federal, atualizada mensalmente. 2) Brasíndice: índice de preços de medicamentos e materiais médicos. 3) Banco de Preços em Saúde (BPS): comparativo de preços praticados. Operadoras usam essas tabelas como teto para autorização. Preços acima requerem justificativa adicional.',
  'documentacao',
  'opme',
  ARRAY['preco', 'tabela', 'simpro', 'brasindice']
),
(
  'opme-preco-002',
  'Negociação de Preços OPME - Boas práticas: 1) Solicitar múltiplos orçamentos (mínimo 3). 2) Verificar se fornecedor é credenciado pela operadora. 3) Conferir preço na tabela Simpro/Brasíndice. 4) Negociar descontos para materiais de alto custo. 5) Considerar pacotes (kit cirúrgico) quando vantajoso. 6) Documentar negociação para auditoria. 7) Atentar para prazo de entrega e validade.',
  'procedimento',
  'opme',
  ARRAY['preco', 'negociacao', 'orcamento', 'fornecedor']
);

-- ============================================
-- 5. TIPOS DE MATERIAIS — CATÁLOGO
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-cat-001',
  'Materiais de Síntese Óssea: Placas (retas, em T, em L, bloqueadas, não bloqueadas), parafusos (corticais 3.5mm, 4.5mm; esponjosos 4.0mm, 6.5mm; canulados), fios de Kirschner, pinos intramedulares, hastes bloqueadas, fixadores externos, âncoras. Indicações: fraturas, osteotomias, artrodeses. Materiais mais comuns: titânio, aço inoxidável, PEEK.',
  'catalogo',
  'opme',
  ARRAY['sintese-ossea', 'trauma', 'ortopedia', 'materiais']
),
(
  'opme-cat-002',
  'Próteses Articulares: Quadril (total, parcial, revisão), Joelho (total, unicompartimental, revisão), Ombro (total, reversa), Tornozelo, Cotovelo. Componentes: acetábulo, cabeça femoral, haste femoral (cimentada/não cimentada), bandeja tibial, componente femoral, polietileno. Indicações: artrose avançada, necrose óssea, fraturas complexas em idosos.',
  'catalogo',
  'opme',
  ARRAY['protese', 'articular', 'quadril', 'joelho', 'ortopedia']
),
(
  'opme-cat-003',
  'Materiais para Coluna: Parafusos pediculares, hastes, cages intersomáticos (PEEK, titânio), placas cervicais, ganchos, conectores, enxerto ósseo (autólogo, homólogo, sintético - BMP). Indicações: fraturas vertebrais, hérnias discais com instabilidade, espondilolistese, escoliose, tumores. Sistemas: posterior, anterior, minimamente invasivo.',
  'catalogo',
  'opme',
  ARRAY['coluna', 'pedicular', 'cage', 'artrodese']
),
(
  'opme-cat-004',
  'Materiais Cardiovasculares: Stents coronarianos (farmacológicos, convencionais), stents periféricos, válvulas cardíacas (mecânicas, biológicas, TAVI), marcapassos, CDI (cardiodesfibrilador implantável), cateteres, introdutores, guias, balões. Indicações: DAC, valvopatias, arritmias. Alta regulação ANS.',
  'catalogo',
  'opme',
  ARRAY['cardiovascular', 'stent', 'valvula', 'marcapasso']
),
(
  'opme-cat-005',
  'Materiais para Videolaparoscopia/Cirurgia Geral: Grampeadores lineares, circulares, trocateres, clipes de titânio, malhas (polipropileno, compostas), telas para hérnia, dispositivos de sutura mecânica, bisturi harmônico, LigaSure. Indicações: colecistectomia, herniorrafia, bariátrica, colectomia.',
  'catalogo',
  'opme',
  ARRAY['videolaparoscopia', 'grampeador', 'malha', 'hernia']
);

-- ============================================
-- 6. ROL ANS — COBERTURA OBRIGATÓRIA
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ans-001',
  'Rol de Procedimentos ANS - OPME: Lista taxativa de materiais de cobertura obrigatória pelos planos de saúde. Atualizado periodicamente. Inclui: próteses articulares, síntese óssea, stents, válvulas, marcapassos, malhas, grampeadores. Materiais fora do Rol podem ser negados, mas há jurisprudência favorável ao paciente em casos de urgência ou única alternativa.',
  'regulatorio',
  'opme',
  ARRAY['ans', 'rol', 'cobertura', 'obrigatoriedade']
),
(
  'opme-ans-002',
  'Negativa de OPME pelo Plano - Direitos: Se material está no Rol ANS e há justificativa médica adequada, a negativa é ilegal. Passos: 1) Solicitar negativa por escrito com motivo. 2) Apresentar recurso administrativo. 3) Acionar ouvidoria da operadora. 4) Registrar reclamação na ANS (0800 701 9656 ou site). 5) Em urgências, buscar tutela judicial (liminar geralmente concedida em 24h).',
  'regulatorio',
  'opme',
  ARRAY['ans', 'negativa', 'direitos', 'recurso']
);

-- ============================================
-- 7. CONSIGNAÇÃO OPME
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-consig-001',
  'Consignação de OPME - Conceito: Material cedido temporariamente pelo fornecedor ao hospital/clínica sem custo inicial. Cobrança ocorre apenas após uso efetivo em cirurgia. Vantagens: não imobiliza capital, evita estoque parado, reduz perdas por validade. Controle rigoroso necessário: entrada, saída, devoluções, faturamento.',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'estoque', 'fornecedor', 'gestao']
),
(
  'opme-consig-002',
  'Gestão de Consignação OPME - Fluxo: 1) Contrato com fornecedor (prazos, devolução, reposição). 2) Entrada com conferência (nota de remessa, validade, lote). 3) Armazenamento adequado (temperatura, umidade). 4) Reserva para cirurgia (kit cirúrgico). 5) Confirmação de uso (etiquetas, relatório cirúrgico). 6) Faturamento (nota fiscal de venda). 7) Devolução de não usados. 8) Auditoria mensal (físico x sistema).',
  'procedimento',
  'opme',
  ARRAY['consignacao', 'fluxo', 'controle', 'auditoria']
);

-- ============================================
-- 8. LEGISLAÇÃO E COMPLIANCE
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-leg-001',
  'RDC 185/2001 ANVISA - Registro de Produtos Médicos: Todo OPME deve ter registro na ANVISA antes da comercialização. Produtos importados requerem petição de empresa brasileira. Registro válido por 5 anos (renováveis). Uso de material sem registro é crime. Sempre verificar status do registro no site da ANVISA antes de usar.',
  'regulatorio',
  'opme',
  ARRAY['anvisa', 'rdc-185', 'registro', 'legislacao']
),
(
  'opme-leg-002',
  'Lei 12.842/2013 - Ato Médico: Indicação de OPME é ato privativo do médico. Apenas o médico pode prescrever, indicar e decidir sobre materiais a serem utilizados. Fornecedores, representantes e hospitais não podem influenciar ou determinar a escolha. Ética médica proíbe recebimento de vantagens por indicação de produtos.',
  'regulatorio',
  'opme',
  ARRAY['ato-medico', 'etica', 'prescricao', 'legislacao']
);

-- ============================================
-- 9. RECONHECIMENTO DE DOCUMENTOS (OCR)
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-ocr-001',
  'Documentos OPME para OCR - Tipos: 1) Pedido médico (receituário, justificativa). 2) Nota fiscal (DANFE, NFe). 3) Etiquetas de material (lote, validade, código de barras). 4) Embalagens (descritivos, instruções de uso). 5) Certificados (registro ANVISA, ISO). 6) Orçamentos (fornecedores). 7) Laudos de auditoria. Sistema deve extrair: texto, datas, valores, códigos, CID.',
  'documentacao',
  'opme',
  ARRAY['ocr', 'documentos', 'digitalizacao', 'automacao']
),
(
  'opme-ocr-002',
  'Extração de Dados de Etiquetas OPME - Campos obrigatórios: Nome do produto, Fabricante, Registro ANVISA (número), Lote, Validade, Código de barras (EAN/DUN), REF (referência do fabricante), Número de série (quando aplicável). OCR deve ser capaz de ler mesmo com qualidade baixa (foto de celular, etiqueta amassada). Validação cruzada com banco de dados de produtos.',
  'tecnico',
  'opme',
  ARRAY['ocr', 'etiqueta', 'extracao', 'rastreabilidade']
);

-- ============================================
-- 10. BOAS PRÁTICAS E DICAS
-- ============================================

INSERT INTO conhecimento_base (documento_id, conteudo_texto, categoria, modulo, tags)
VALUES 
(
  'opme-dicas-001',
  'Checklist Pré-Cirúrgico OPME: ✓ Pré-autorização aprovada. ✓ Justificativa médica completa. ✓ Material entregue e conferido (validade, lote, integridade). ✓ Etiquetas prontas para colar no prontuário. ✓ Notas fiscais conferidas. ✓ Kit cirúrgico completo e esterilizado. ✓ Representante do fornecedor confirmado (se necessário). ✓ Backup de material disponível. ✓ Documentação fotográfica das embalagens.',
  'procedimento',
  'opme',
  ARRAY['checklist', 'pre-operatorio', 'boas-praticas', 'seguranca']
),
(
  'opme-dicas-002',
  'Documentação Pós-Cirúrgica OPME: 1) Colar todas as etiquetas no prontuário. 2) Preencher relatório cirúrgico detalhando materiais usados. 3) Fotografar campo cirúrgico com material implantado. 4) Anotar intercorrências ou trocas de material. 5) Conferir que material cobrado = material usado. 6) Enviar documentação para faturamento em até 24h. 7) Arquivar cópia de segurança (escaneado) por no mínimo 20 anos.',
  'procedimento',
  'opme',
  ARRAY['pos-operatorio', 'documentacao', 'prontuario', 'faturamento']
);

-- ============================================
-- 11. ATUALIZAR CACHE
-- ============================================

REFRESH MATERIALIZED VIEW mv_busca_rapida;

-- ============================================
-- ✅ SEED OPME CONCLUÍDO
-- ============================================

DO $$
DECLARE
  total_opme INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_opme 
  FROM conhecimento_base 
  WHERE modulo = 'opme';
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ SEED OPME CONCLUÍDO!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📚 Documentos OPME criados: %', total_opme;
  RAISE NOTICE '';
  RAISE NOTICE 'Categorias:';
  RAISE NOTICE '  • Conceitos e definições';
  RAISE NOTICE '  • Justificativas médicas (templates e exemplos)';
  RAISE NOTICE '  • Prevenção e recurso de glosas';
  RAISE NOTICE '  • Tabelas de preços';
  RAISE NOTICE '  • Catálogo de materiais';
  RAISE NOTICE '  • Rol ANS e cobertura';
  RAISE NOTICE '  • Consignação e gestão';
  RAISE NOTICE '  • Legislação e compliance';
  RAISE NOTICE '  • OCR e reconhecimento de documentos';
  RAISE NOTICE '  • Boas práticas e checklists';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para Tutor IA especializado!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;




-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 0013_observabilidade_comportamental.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 MIGRAÇÃO 0013 — OBSERVABILIDADE & INTELIGÊNCIA COMPORTAMENTAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Data: 2025-10-20
-- Objetivo: Sistema completo de treinamento, análise comportamental e alertas
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Ativar extensão necessária para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. ATIVIDADES DE USUÁRIOS (LOG COMPLETO)
-- ============================================

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  modulo TEXT NOT NULL,
  sub_modulo TEXT,
  rota TEXT,
  metodo TEXT CHECK (metodo IN ('CREATE', 'READ', 'UPDATE', 'DELETE', 'NAVIGATE', 'SEARCH', 'EXPORT', 'IMPORT')),
  dados_entrada JSONB,
  dados_saida JSONB,
  tempo_execucao INTEGER,
  sucesso BOOLEAN DEFAULT true,
  erro_mensagem TEXT,
  erro_stack TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  localizacao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activities_usuario ON user_activities(usuario_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_modulo ON user_activities(modulo);
CREATE INDEX IF NOT EXISTS idx_user_activities_criado ON user_activities(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_sucesso ON user_activities(sucesso) WHERE sucesso = false;

COMMENT ON TABLE user_activities IS 'Log completo de todas atividades dos usuários no sistema';

-- ============================================
-- 2. PERFIL COMPORTAMENTAL DO USUÁRIO
-- ============================================

CREATE TABLE IF NOT EXISTS user_behavior_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  modulos_mais_usados JSONB,
  acoes_mais_frequentes JSONB,
  horarios_ativos JSONB,
  dias_semana_ativos JSONB,
  tempo_medio_por_modulo JSONB,
  funcionalidades_dominadas TEXT[],
  funcionalidades_com_dificuldade TEXT[],
  taxa_erro_geral REAL DEFAULT 0,
  total_atividades INTEGER DEFAULT 0,
  total_erros INTEGER DEFAULT 0,
  ultima_atividade TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_usuario ON user_behavior_profile(usuario_id);

COMMENT ON TABLE user_behavior_profile IS 'Perfil comportamental agregado de cada usuário';

-- ============================================
-- 3. TRANSFERÊNCIA DE RESPONSABILIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS user_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_sainte_id UUID REFERENCES auth.users(id),
  usuario_substituto_id UUID REFERENCES auth.users(id),
  motivo TEXT NOT NULL CHECK (motivo IN ('ferias', 'licenca', 'demissao', 'transferencia', 'outro')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  responsabilidades_transferidas TEXT[],
  modulos_transferidos TEXT[],
  instrucoes_especiais TEXT,
  documentacao_gerada_url TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handovers_sainte ON user_handovers(usuario_sainte_id);
CREATE INDEX IF NOT EXISTS idx_handovers_substituto ON user_handovers(usuario_substituto_id);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON user_handovers(status);

COMMENT ON TABLE user_handovers IS 'Registro de transferências de responsabilidades entre usuários';

-- ============================================
-- 4. ERROS E ALERTAS
-- ============================================

CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('erro_aplicacao', 'erro_validacao', 'erro_permissao', 'erro_rede', 'erro_banco', 'erro_integracao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('baixa', 'media', 'alta', 'critica')),
  modulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  stack_trace TEXT,
  contexto JSONB,
  impacto TEXT,
  solucao_sugerida TEXT,
  notificado_admin BOOLEAN DEFAULT false,
  notificado_ceo BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  resolvido_por UUID REFERENCES auth.users(id),
  resolvido_em TIMESTAMPTZ,
  notas_resolucao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_errors_usuario ON system_errors(usuario_id);
CREATE INDEX IF NOT EXISTS idx_errors_severidade ON system_errors(severidade);
CREATE INDEX IF NOT EXISTS idx_errors_resolvido ON system_errors(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS idx_errors_criado ON system_errors(criado_em DESC);

COMMENT ON TABLE system_errors IS 'Registro centralizado de todos erros do sistema';

-- ============================================
-- 5. ALERTAS E PREDIÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('prazo_vencendo', 'erro_recorrente', 'comportamento_anomalo', 'performance_baixa', 'tentativa_acesso_nao_autorizado', 'predicao_erro', 'autocorrecao')),
  severidade TEXT NOT NULL CHECK (severidade IN ('info', 'atencao', 'urgente', 'critico')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  usuario_afetado_id UUID REFERENCES auth.users(id),
  modulo TEXT,
  dados JSONB,
  acao_sugerida TEXT,
  destinatarios TEXT[] DEFAULT ARRAY['admin', 'ceo'],
  notificado BOOLEAN DEFAULT false,
  lido BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_tipo ON system_alerts(tipo);
CREATE INDEX IF NOT EXISTS idx_alerts_severidade ON system_alerts(severidade);
CREATE INDEX IF NOT EXISTS idx_alerts_resolvido ON system_alerts(resolvido) WHERE resolvido = false;
CREATE INDEX IF NOT EXISTS idx_alerts_criado ON system_alerts(criado_em DESC);

COMMENT ON TABLE system_alerts IS 'Alertas inteligentes e predições do sistema';

-- ============================================
-- 6. TREINAMENTO E ONBOARDING
-- ============================================

CREATE TABLE IF NOT EXISTS user_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  licao TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('tutorial', 'video', 'documentacao', 'quiz', 'pratico')),
  concluido BOOLEAN DEFAULT false,
  pontuacao INTEGER,
  tempo_gasto INTEGER,
  tentativas INTEGER DEFAULT 0,
  ultima_tentativa TIMESTAMPTZ,
  concluido_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_usuario ON user_training(usuario_id);
CREATE INDEX IF NOT EXISTS idx_training_modulo ON user_training(modulo);
CREATE INDEX IF NOT EXISTS idx_training_concluido ON user_training(concluido);

COMMENT ON TABLE user_training IS 'Progresso de treinamento dos usuários';

-- ============================================
-- 7. HISTÓRICO DE SESSÕES
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT,
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  navegador TEXT,
  sistema_operacional TEXT,
  localizacao TEXT,
  duracao INTEGER,
  paginas_visitadas INTEGER DEFAULT 0,
  acoes_realizadas INTEGER DEFAULT 0,
  inicio_em TIMESTAMPTZ DEFAULT NOW(),
  termino_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_usuario ON user_sessions(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_inicio ON user_sessions(inicio_em DESC);

COMMENT ON TABLE user_sessions IS 'Histórico de sessões de usuários';

-- ============================================
-- 8. FUNÇÃO: ATUALIZAR PERFIL COMPORTAMENTAL
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_perfil_comportamental()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_behavior_profile (
    usuario_id,
    total_atividades,
    total_erros,
    taxa_erro_geral,
    ultima_atividade
  )
  VALUES (
    NEW.usuario_id,
    1,
    CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    CASE WHEN NEW.sucesso = false THEN 1.0 ELSE 0.0 END,
    NEW.criado_em
  )
  ON CONFLICT (usuario_id) DO UPDATE SET
    total_atividades = user_behavior_profile.total_atividades + 1,
    total_erros = user_behavior_profile.total_erros + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END,
    taxa_erro_geral = (user_behavior_profile.total_erros::REAL + CASE WHEN NEW.sucesso = false THEN 1 ELSE 0 END::REAL) / 
                      (user_behavior_profile.total_atividades::REAL + 1),
    ultima_atividade = NEW.criado_em,
    atualizado_em = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_perfil ON user_activities;
CREATE TRIGGER trigger_atualizar_perfil
  AFTER INSERT ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_perfil_comportamental();

-- ============================================
-- 9. FUNÇÃO: CRIAR ALERTA DE ERRO CRÍTICO
-- ============================================

CREATE OR REPLACE FUNCTION criar_alerta_erro_critico()
RETURNS TRIGGER AS $$
DECLARE
  v_alert_severidade TEXT;
  v_titulo TEXT;
BEGIN
  IF NEW.severidade IN ('alta', 'critica') THEN
    v_alert_severidade := CASE 
      WHEN NEW.severidade = 'critica' THEN 'critico'
      WHEN NEW.severidade = 'alta' THEN 'urgente'
      ELSE 'atencao'
    END;
    
    v_titulo := 'Erro ' || NEW.severidade || ' detectado';
    
    INSERT INTO system_alerts (
      tipo,
      severidade,
      titulo,
      descricao,
      usuario_afetado_id,
      modulo,
      dados,
      acao_sugerida,
      destinatarios
    ) VALUES (
      'erro_recorrente',
      v_alert_severidade,
      v_titulo,
      NEW.mensagem,
      NEW.usuario_id,
      NEW.modulo,
      jsonb_build_object(
        'erro_id', NEW.id,
        'tipo', NEW.tipo,
        'stack_trace', NEW.stack_trace
      ),
      NEW.solucao_sugerida,
      CASE 
        WHEN NEW.severidade = 'critica' THEN ARRAY['admin', 'ceo', 'devops']
        ELSE ARRAY['admin']
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_alerta_erro ON system_errors;
CREATE TRIGGER trigger_alerta_erro
  AFTER INSERT ON system_errors
  FOR EACH ROW
  EXECUTE FUNCTION criar_alerta_erro_critico();

-- ============================================
-- 10. FUNÇÃO: BUSCAR ATIVIDADES DO USUÁRIO
-- ============================================

CREATE OR REPLACE FUNCTION buscar_atividades_usuario(
  p_usuario_email TEXT,
  p_dias_historico INTEGER DEFAULT 90
)
RETURNS TABLE (
  modulo TEXT,
  total_acoes BIGINT,
  acoes_unicas TEXT[],
  tempo_medio_ms NUMERIC,
  taxa_sucesso NUMERIC,
  periodo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.modulo,
    COUNT(*) as total_acoes,
    array_agg(DISTINCT ua.acao) as acoes_unicas,
    ROUND(AVG(ua.tempo_execucao)::NUMERIC, 2) as tempo_medio_ms,
    ROUND((COUNT(*) FILTER (WHERE ua.sucesso = true)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as taxa_sucesso,
    ('Ultimos ' || p_dias_historico || ' dias')::TEXT as periodo
  FROM user_activities ua
  JOIN auth.users u ON u.id = ua.usuario_id
  WHERE u.email = p_usuario_email
    AND ua.criado_em >= NOW() - (p_dias_historico || ' days')::INTERVAL
  GROUP BY ua.modulo
  ORDER BY total_acoes DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION buscar_atividades_usuario IS 'Busca resumo de atividades de um usuario por email';

-- ============================================
-- 11. FUNÇÃO: COMPARAR USUÁRIOS (HANDOVER)
-- ============================================

CREATE OR REPLACE FUNCTION comparar_usuarios_handover(
  p_usuario_sainte_email TEXT,
  p_usuario_substituto_email TEXT
)
RETURNS TABLE (
  modulo TEXT,
  experiencia_sainte BIGINT,
  experiencia_substituto BIGINT,
  diferenca_experiencia BIGINT,
  precisa_treinamento BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH sainte_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_sainte_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  ),
  substituto_stats AS (
    SELECT ua.modulo, COUNT(*) as total
    FROM user_activities ua
    JOIN auth.users u ON u.id = ua.usuario_id
    WHERE u.email = p_usuario_substituto_email
      AND ua.criado_em >= NOW() - INTERVAL '90 days'
    GROUP BY ua.modulo
  )
  SELECT 
    COALESCE(s.modulo, sub.modulo) as modulo,
    COALESCE(s.total, 0) as experiencia_sainte,
    COALESCE(sub.total, 0) as experiencia_substituto,
    COALESCE(s.total, 0) - COALESCE(sub.total, 0) as diferenca_experiencia,
    CASE 
      WHEN COALESCE(sub.total, 0) < (COALESCE(s.total, 0) * 0.3) THEN true
      ELSE false
    END as precisa_treinamento
  FROM sainte_stats s
  FULL OUTER JOIN substituto_stats sub ON s.modulo = sub.modulo
  ORDER BY COALESCE(s.total, 0) DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION comparar_usuarios_handover IS 'Compara experiencia entre usuario que sai e substituto';

-- ============================================
-- 12. FUNÇÃO: DETECTAR COMPORTAMENTO ANÔMALO
-- ============================================

CREATE OR REPLACE FUNCTION detectar_comportamento_anomalo()
RETURNS TABLE (
  usuario_id UUID,
  anomalia TEXT,
  detalhes TEXT,
  severidade TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ubp.usuario_id,
    'taxa_erro_alta'::TEXT as anomalia,
    'Taxa de erro de ' || ROUND((ubp.taxa_erro_geral * 100)::NUMERIC, 2)::TEXT || '% esta acima do normal' as detalhes,
    'atencao'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.taxa_erro_geral > 0.3
    AND ubp.total_atividades > 10
  
  UNION ALL
  
  SELECT 
    ubp.usuario_id,
    'inatividade_prolongada'::TEXT as anomalia,
    'Sem atividade ha ' || EXTRACT(day FROM (NOW() - ubp.ultima_atividade))::INTEGER::TEXT || ' dias' as detalhes,
    'info'::TEXT as severidade
  FROM user_behavior_profile ubp
  WHERE ubp.ultima_atividade < NOW() - INTERVAL '7 days'
    AND ubp.total_atividades > 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION detectar_comportamento_anomalo IS 'Detecta padroes anomalos de comportamento';

-- ============================================
-- ✅ MIGRAÇÃO CONCLUÍDA
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN (
      'user_activities',
      'user_behavior_profile',
      'user_handovers',
      'system_errors',
      'system_alerts',
      'user_training',
      'user_sessions'
    );
  
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ MIGRACAO 0013 CONCLUIDA!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas criadas: %', table_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Recursos implementados:';
  RAISE NOTICE '  ✅ Log completo de atividades';
  RAISE NOTICE '  ✅ Perfil comportamental';
  RAISE NOTICE '  ✅ Transferencia de responsabilidades';
  RAISE NOTICE '  ✅ Sistema de erros e alertas';
  RAISE NOTICE '  ✅ Alertas inteligentes e predicoes';
  RAISE NOTICE '  ✅ Sistema de treinamento';
  RAISE NOTICE '  ✅ Historico de sessoes';
  RAISE NOTICE '  ✅ Funcoes de analise comportamental';
  RAISE NOTICE '  ✅ Triggers automaticos';
  RAISE NOTICE '';
  RAISE NOTICE '🤖 Pronto para IA comportamental!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;



-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migração: 20250126_consolidated_all_tables.sql
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ============================================
-- ICARUS-PRO: Migration Consolidada Completa
-- Data: 26/01/2025
-- Total: 92 migrations consolidadas
-- Tratamento de duplicidades: IF NOT EXISTS
-- ============================================

-- Garantir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA public;


-- ============================================
-- Source: 0001_init_schema.sql
-- ============================================

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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS empresas (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS usuarios (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS produtos (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS lotes (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS medicos (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS hospitais (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS cirurgias (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS kits (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS itens_kit (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS leads (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS transacoes (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS fornecedores (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS pedidos_compra (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS faturas (
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
CREATE TABLE IF NOT EXISTS IF NOT EXISTS audit_log (
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



-- ============================================
-- Source: 0002_rls_policies.sql
-- ============================================

-- ============================================
-- Migration 0002: RLS Multi-tenant Policies
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Cria funções JWT helpers
-- - Policies multi-tenant por empresa_id
-- - Filtros por perfil (admin/operador/etc)
-- - Trigger auto-criação de usuário
-- ============================================

-- ============================================
-- FUNÇÕES JWT HELPERS
-- ============================================

-- Retorna empresa_id do JWT
CREATE OR REPLACE FUNCTION public.current_empresa()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::jsonb->>'empresa_id',
    ''
  )::uuid;
$$;

-- Retorna perfil do JWT
CREATE OR REPLACE FUNCTION public.current_perfil()
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'perfil',
    'operador'
  );
$$;

-- Retorna user_id do JWT
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT auth.uid();
$$;

-- ============================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_kit ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: empresas
-- ============================================

-- SELECT: Usuário vê apenas sua empresa
CREATE POLICY pol_empresas_select ON empresas
  FOR SELECT
  USING (id = public.current_empresa() AND excluido_em IS NULL);

-- UPDATE: Apenas admin da própria empresa
CREATE POLICY pol_empresas_update ON empresas
  FOR UPDATE
  USING (id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (id = public.current_empresa());

-- ============================================
-- POLICIES: usuarios
-- ============================================

-- SELECT: Usuários da mesma empresa
CREATE POLICY pol_usuarios_select ON usuarios
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Apenas admin
CREATE POLICY pol_usuarios_insert ON usuarios
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() = 'admin'
  );

-- UPDATE: Admin ou próprio perfil
CREATE POLICY pol_usuarios_update ON usuarios
  FOR UPDATE
  USING (
    (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin') OR
    (id = auth.uid())
  )
  WITH CHECK (empresa_id = public.current_empresa());

-- DELETE: Apenas admin (soft delete)
CREATE POLICY pol_usuarios_delete ON usuarios
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (excluido_em IS NOT NULL);

-- ============================================
-- POLICIES: produtos
-- ============================================

-- SELECT: Mesma empresa, não excluídos
CREATE POLICY pol_produtos_select ON produtos
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Admin, comercial ou estoque
CREATE POLICY pol_produtos_insert ON produtos
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial', 'estoque')
  );

-- UPDATE: Admin, comercial ou estoque
CREATE POLICY pol_produtos_update ON produtos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- DELETE: Apenas admin (soft delete)
CREATE POLICY pol_produtos_delete ON produtos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() = 'admin')
  WITH CHECK (excluido_em IS NOT NULL);

-- ============================================
-- POLICIES: lotes
-- ============================================

-- SELECT: Via produto da mesma empresa
CREATE POLICY pol_lotes_select ON lotes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND excluido_em IS NULL
  );

-- INSERT/UPDATE/DELETE: Estoque ou admin
CREATE POLICY pol_lotes_insert ON lotes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_lotes_update ON lotes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM produtos p
      WHERE p.id = lotes.produto_id AND p.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'estoque')
  );

-- ============================================
-- POLICIES: medicos
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_medicos_select ON medicos
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_medicos_insert ON medicos
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_medicos_update ON medicos
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: hospitais
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_hospitais_select ON hospitais
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_hospitais_insert ON hospitais
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_hospitais_update ON hospitais
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: cirurgias
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_cirurgias_select ON cirurgias
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT: Admin ou operador
CREATE POLICY pol_cirurgias_insert ON cirurgias
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'operador', 'comercial')
  );

-- UPDATE: Admin ou operador
CREATE POLICY pol_cirurgias_update ON cirurgias
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'operador', 'comercial'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: kits
-- ============================================

-- SELECT: Via empresa
CREATE POLICY pol_kits_select ON kits
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin, operador ou estoque
CREATE POLICY pol_kits_insert ON kits
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

CREATE POLICY pol_kits_update ON kits
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'operador', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: itens_kit
-- ============================================

-- SELECT: Via kit da mesma empresa
CREATE POLICY pol_itens_kit_select ON itens_kit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    )
  );

-- INSERT/UPDATE: Admin, operador ou estoque
CREATE POLICY pol_itens_kit_insert ON itens_kit
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

CREATE POLICY pol_itens_kit_update ON itens_kit
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kits k
      WHERE k.id = itens_kit.kit_id AND k.empresa_id = public.current_empresa()
    ) AND public.current_perfil() IN ('admin', 'operador', 'estoque')
  );

-- ============================================
-- POLICIES: leads
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_leads_select ON leads
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou comercial
CREATE POLICY pol_leads_insert ON leads
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'comercial')
  );

CREATE POLICY pol_leads_update ON leads
  FOR UPDATE
  USING (
    empresa_id = public.current_empresa() AND
    (public.current_perfil() IN ('admin', 'comercial') OR responsavel_id = auth.uid())
  )
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: transacoes
-- ============================================

-- SELECT: Financeiro ou admin
CREATE POLICY pol_transacoes_select ON transacoes
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Financeiro ou admin
CREATE POLICY pol_transacoes_insert ON transacoes
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

CREATE POLICY pol_transacoes_update ON transacoes
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: fornecedores
-- ============================================

-- SELECT: Mesma empresa
CREATE POLICY pol_fornecedores_select ON fornecedores
  FOR SELECT
  USING (empresa_id = public.current_empresa() AND excluido_em IS NULL);

-- INSERT/UPDATE: Admin ou estoque
CREATE POLICY pol_fornecedores_insert ON fornecedores
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_fornecedores_update ON fornecedores
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'estoque'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: pedidos_compra
-- ============================================

-- SELECT: Estoque, financeiro ou admin
CREATE POLICY pol_pedidos_select ON pedidos_compra
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Estoque ou admin
CREATE POLICY pol_pedidos_insert ON pedidos_compra
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'estoque')
  );

CREATE POLICY pol_pedidos_update ON pedidos_compra
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'estoque', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: faturas
-- ============================================

-- SELECT: Financeiro ou admin
CREATE POLICY pol_faturas_select ON faturas
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro') AND
    excluido_em IS NULL
  );

-- INSERT/UPDATE: Financeiro ou admin
CREATE POLICY pol_faturas_insert ON faturas
  FOR INSERT
  WITH CHECK (
    empresa_id = public.current_empresa() AND
    public.current_perfil() IN ('admin', 'financeiro')
  );

CREATE POLICY pol_faturas_update ON faturas
  FOR UPDATE
  USING (empresa_id = public.current_empresa() AND public.current_perfil() IN ('admin', 'financeiro'))
  WITH CHECK (empresa_id = public.current_empresa());

-- ============================================
-- POLICIES: audit_log (somente leitura)
-- ============================================

-- SELECT: Admin apenas
CREATE POLICY pol_audit_log_select ON audit_log
  FOR SELECT
  USING (
    empresa_id = public.current_empresa() AND
    public.current_perfil() = 'admin'
  );

-- INSERT: Via trigger apenas (sistema)
CREATE POLICY pol_audit_log_insert ON audit_log
  FOR INSERT
  WITH CHECK (true); -- Triggers têm permissão SECURITY DEFINER

-- ============================================
-- TRIGGER: Auto-criar usuário no signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Extrair empresa_id e perfil do metadata
  INSERT INTO public.usuarios (id, empresa_id, email, nome_completo, avatar_url, perfil)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'empresa_id')::uuid,
      '00000000-0000-0000-0000-000000000000'::uuid -- placeholder
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'perfil', 'operador')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auth_user_created ON auth.users;
CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.current_empresa() IS 'Retorna empresa_id do JWT token';
COMMENT ON FUNCTION public.current_perfil() IS 'Retorna perfil do usuário do JWT';
COMMENT ON POLICY pol_produtos_select ON produtos IS 'Isolamento multi-tenant por empresa_id';
COMMENT ON POLICY pol_audit_log_select ON audit_log IS 'Apenas admins podem ler audit_log';



-- ============================================
-- Source: 0003_indexes_perf.sql
-- ============================================

-- ============================================
-- Migration 0003: Índices de Performance
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Índices compostos para queries multi-tenant
-- - Índices parciais (WHERE excluido_em IS NULL)
-- - GIN trigram para busca textual
-- - Índices para ordenação DESC (keyset pagination)
-- Meta: p95 < 250ms para 50 usuários simultâneos
-- ============================================

-- ============================================
-- ÍNDICES: empresas
-- ============================================
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_empresas_status ON empresas(status) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: usuarios
-- ============================================
-- Composto: empresa + perfil (filtragem comum)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_usuarios_empresa_perfil ON usuarios(empresa_id, perfil) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_usuarios_email ON usuarios(email) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_usuarios_empresa_criado ON usuarios(empresa_id, criado_em DESC) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: produtos
-- ============================================
-- Composto: empresa + status (listagens filtradas)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_produtos_empresa_status ON produtos(empresa_id, status) WHERE excluido_em IS NULL;

-- Composto: empresa + codigo_sku (busca rápida)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_produtos_empresa_sku ON produtos(empresa_id, codigo_sku) WHERE excluido_em IS NULL;

-- GIN trigram: busca textual em descrição
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_produtos_descricao_gin ON produtos USING GIN (to_tsvector('portuguese', descricao)) WHERE excluido_em IS NULL;

-- Índice para ordenação (keyset pagination)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_produtos_empresa_criado ON produtos(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- Registro ANVISA
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_produtos_registro_anvisa ON produtos(registro_anvisa) WHERE excluido_em IS NULL AND registro_anvisa IS NOT NULL;

-- ============================================
-- ÍNDICES: lotes
-- ============================================
-- Composto: produto + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_produto_status ON lotes(produto_id, status) WHERE excluido_em IS NULL;

-- Lotes vencidos (alerta)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_validade ON lotes(data_validade) WHERE excluido_em IS NULL AND data_validade >= CURRENT_DATE;

-- Lotes disponíveis
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_disponiveis ON lotes(produto_id, status, quantidade_disponivel) WHERE excluido_em IS NULL AND status = 'disponivel' AND quantidade_disponivel > 0;

-- Número de lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_lotes_numero ON lotes(numero_lote, numero_serie) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: medicos
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_empresa_status ON medicos(empresa_id, status) WHERE excluido_em IS NULL;

-- CRM (busca)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_crm ON medicos(crm, crm_uf) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_nome_gin ON medicos USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Especialidade (filtro comum)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_medicos_especialidade ON medicos(empresa_id, especialidade) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: hospitais
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_hospitais_empresa_status ON hospitais(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_hospitais_cnpj ON hospitais(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_hospitais_nome_gin ON hospitais USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: cirurgias
-- ============================================
-- Composto: empresa + status + data (dashboard principal)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_empresa_status_data ON cirurgias(empresa_id, status, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Composto: empresa + data (calendário)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_empresa_data ON cirurgias(empresa_id, data_cirurgia DESC, hora_cirurgia) WHERE excluido_em IS NULL;

-- Médico (filtro)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_medico ON cirurgias(medico_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Hospital (filtro)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_hospital ON cirurgias(hospital_id, data_cirurgia DESC) WHERE excluido_em IS NULL;

-- Prioridade (urgências)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_prioridade ON cirurgias(empresa_id, prioridade, status) WHERE excluido_em IS NULL AND status IN ('agendada', 'confirmada');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_cirurgias_empresa_criado ON cirurgias(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: kits
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kits_empresa_status ON kits(empresa_id, status) WHERE excluido_em IS NULL;

-- Cirurgia
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kits_cirurgia ON kits(cirurgia_id, status) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_kits_empresa_criado ON kits(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: itens_kit
-- ============================================
-- Composto: kit (JOIN comum)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_kit_kit ON itens_kit(kit_id);

-- Produto (rastreabilidade)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_kit_produto ON itens_kit(produto_id);

-- Lote (rastreabilidade ANVISA)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_itens_kit_lote ON itens_kit(lote_id);

-- ============================================
-- ÍNDICES: leads
-- ============================================
-- Composto: empresa + estagio (pipeline CRM)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leads_empresa_estagio ON leads(empresa_id, estagio) WHERE excluido_em IS NULL;

-- Responsável
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leads_responsavel ON leads(responsavel_id, estagio) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leads_nome_gin ON leads USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_leads_empresa_criado ON leads(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: transacoes
-- ============================================
-- Composto: empresa + tipo + status (dashboard financeiro)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_transacoes_empresa_tipo_status ON transacoes(empresa_id, tipo, status) WHERE excluido_em IS NULL;

-- Data vencimento (alertas)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_transacoes_vencimento ON transacoes(empresa_id, data_vencimento) WHERE excluido_em IS NULL AND status = 'pendente';

-- Vencidas
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_transacoes_vencidas ON transacoes(empresa_id, status) WHERE excluido_em IS NULL AND status = 'vencido';

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_transacoes_empresa_criado ON transacoes(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: fornecedores
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_empresa_status ON fornecedores(empresa_id, status) WHERE excluido_em IS NULL;

-- CNPJ
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(empresa_id, cnpj) WHERE excluido_em IS NULL;

-- GIN trigram: busca por nome
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_fornecedores_nome_gin ON fornecedores USING GIN (to_tsvector('portuguese', nome)) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: pedidos_compra
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pedidos_empresa_status ON pedidos_compra(empresa_id, status) WHERE excluido_em IS NULL;

-- Fornecedor
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pedidos_fornecedor ON pedidos_compra(fornecedor_id, status) WHERE excluido_em IS NULL;

-- Urgência
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pedidos_urgencia ON pedidos_compra(empresa_id, urgencia, status) WHERE excluido_em IS NULL AND status IN ('aguardando', 'aprovado');

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_pedidos_empresa_criado ON pedidos_compra(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: faturas
-- ============================================
-- Composto: empresa + status
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_empresa_status ON faturas(empresa_id, status) WHERE excluido_em IS NULL;

-- Número NF-e (busca)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_numero ON faturas(empresa_id, numero_nfe, serie) WHERE excluido_em IS NULL;

-- Chave de acesso (rastreabilidade fiscal)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_chave ON faturas(chave_acesso) WHERE excluido_em IS NULL AND chave_acesso IS NOT NULL;

-- Cliente CPF/CNPJ
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_cliente ON faturas(empresa_id, cliente_cpf_cnpj) WHERE excluido_em IS NULL;

-- Data emissão (relatórios)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_emissao ON faturas(empresa_id, data_emissao DESC) WHERE excluido_em IS NULL;

-- Pedido/Cirurgia (relacionamentos)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_pedido ON faturas(pedido_id) WHERE excluido_em IS NULL;
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_cirurgia ON faturas(cirurgia_id) WHERE excluido_em IS NULL;

-- Keyset pagination
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_faturas_empresa_criado ON faturas(empresa_id, criado_em DESC, id) WHERE excluido_em IS NULL;

-- ============================================
-- ÍNDICES: audit_log
-- ============================================
-- Composto: empresa + tabela + criado (consultas de auditoria)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_audit_empresa_tabela_criado ON audit_log(empresa_id, tabela, criado_em DESC);

-- Registro auditado
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_audit_registro ON audit_log(tabela, registro_id, criado_em DESC);

-- Usuário (quem fez a ação)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_audit_usuario ON audit_log(usuario_id, criado_em DESC);

-- Hash chain (verificação de integridade)
CREATE INDEX IF NOT EXISTS IF NOT EXISTS idx_audit_hash ON audit_log(criado_em ASC, id);

-- ============================================
-- VIEWS MATERIALIZADAS (KPIs)
-- ============================================

-- Dashboard: KPIs por empresa
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_kpis_empresa AS
SELECT
  e.id AS empresa_id,
  e.nome AS empresa_nome,
  -- Cirurgias
  COUNT(DISTINCT c.id) AS total_cirurgias,
  COUNT(DISTINCT CASE WHEN c.status = 'agendada' THEN c.id END) AS cirurgias_agendadas,
  COUNT(DISTINCT CASE WHEN c.status = 'concluida' THEN c.id END) AS cirurgias_concluidas,
  -- Produtos
  COUNT(DISTINCT p.id) AS total_produtos,
  SUM(CASE WHEN l.status = 'disponivel' THEN l.quantidade_disponivel ELSE 0 END) AS estoque_disponivel,
  -- Financeiro
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS receitas_pagas,
  SUM(CASE WHEN t.tipo = 'despesa' AND t.status = 'pago' THEN t.valor ELSE 0 END) AS despesas_pagas,
  SUM(CASE WHEN t.tipo = 'receita' AND t.status = 'pendente' THEN t.valor ELSE 0 END) AS receitas_pendentes,
  -- Leads
  COUNT(DISTINCT ld.id) AS total_leads,
  COUNT(DISTINCT CASE WHEN ld.estagio = 'fechamento' THEN ld.id END) AS leads_fechamento,
  -- Timestamp
  NOW() AS atualizado_em
FROM empresas e
LEFT JOIN cirurgias c ON c.empresa_id = e.id AND c.excluido_em IS NULL
LEFT JOIN produtos p ON p.empresa_id = e.id AND p.excluido_em IS NULL
LEFT JOIN lotes l ON l.produto_id = p.id AND l.excluido_em IS NULL
LEFT JOIN transacoes t ON t.empresa_id = e.id AND t.excluido_em IS NULL
LEFT JOIN leads ld ON ld.empresa_id = e.id AND ld.excluido_em IS NULL
WHERE e.excluido_em IS NULL
GROUP BY e.id, e.nome;

-- Índice na MV
CREATE UNIQUE INDEX IF NOT EXISTS IF NOT EXISTS idx_mv_kpis_empresa ON mv_kpis_empresa(empresa_id);

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON INDEX idx_produtos_descricao_gin IS 'Busca textual full-text em descrição de produtos';
COMMENT ON INDEX idx_cirurgias_empresa_status_data IS 'Índice composto para dashboard principal de cirurgias';
COMMENT ON INDEX idx_lotes_disponiveis IS 'Índice parcial para lotes disponíveis (performance)';
COMMENT ON MATERIALIZED VIEW mv_kpis_empresa IS 'KPIs agregados por empresa (refresh periódico via job)';

-- ============================================
-- FUNÇÃO: Refresh MV (executar via cron/BullMQ)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_mv_kpis()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpis_empresa;
END;
$$;

COMMENT ON FUNCTION refresh_mv_kpis() IS 'Atualiza MVs de KPIs (executar a cada 5min via job)';



-- ============================================
-- Source: 0004_functions_triggers.sql
-- ============================================

-- ============================================
-- Migration 0004: Funções & Triggers
-- Data: 2025-10-18
-- Versão: 1.0
-- Autor: Agente Sênior BD
-- ============================================
-- Descrição:
-- - Audit log com hash chain (blockchain-like)
-- - Triggers de auditoria em tabelas críticas
-- - Funções LGPD (anonimização, exportação)
-- - Funções de negócio (reservar_kit, consumir_kit)
-- - Validações ANVISA (lotes vencidos)
-- ============================================

-- ============================================
-- AUDIT LOG: Hash Chain (blockchain-like)
-- ============================================

-- Função: Computar hash SHA-256 do registro de audit
CREATE OR REPLACE FUNCTION compute_audit_hash(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB,
  p_hash_anterior TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_payload TEXT;
BEGIN
  -- Concatenar dados para hash
  v_payload := CONCAT(
    COALESCE(p_empresa_id::text, ''),
    '|',
    COALESCE(p_usuario_id::text, ''),
    '|',
    p_tabela,
    '|',
    p_registro_id::text,
    '|',
    p_acao,
    '|',
    COALESCE(p_dados_antes::text, ''),
    '|',
    COALESCE(p_dados_depois::text, ''),
    '|',
    COALESCE(p_hash_anterior, '')
  );
  
  -- Retornar SHA-256
  RETURN encode(digest(v_payload, 'sha256'), 'hex');
END;
$$;

-- Função: Inserir log de auditoria com hash chain
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_empresa_id UUID,
  p_usuario_id UUID,
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB,
  p_dados_depois JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hash_anterior TEXT;
  v_hash_atual TEXT;
BEGIN
  -- Buscar último hash da cadeia
  SELECT hash_atual INTO v_hash_anterior
  FROM audit_log
  ORDER BY criado_em DESC, id DESC
  LIMIT 1;
  
  -- Computar hash atual
  v_hash_atual := compute_audit_hash(
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior
  );
  
  -- Inserir registro
  INSERT INTO audit_log (
    empresa_id,
    usuario_id,
    tabela,
    registro_id,
    acao,
    dados_antes,
    dados_depois,
    hash_anterior,
    hash_atual
  ) VALUES (
    p_empresa_id,
    p_usuario_id,
    p_tabela,
    p_registro_id,
    p_acao,
    p_dados_antes,
    p_dados_depois,
    v_hash_anterior,
    v_hash_atual
  );
END;
$$;

COMMENT ON FUNCTION compute_audit_hash IS 'Computa SHA-256 para hash chain de auditoria';
COMMENT ON FUNCTION insert_audit_log IS 'Insere log de auditoria com hash chain blockchain-like';

-- ============================================
-- TRIGGER: Auditoria automática
-- ============================================

-- Função genérica de trigger de auditoria
CREATE OR REPLACE FUNCTION trigger_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_empresa_id UUID;
  v_usuario_id UUID;
  v_acao TEXT;
  v_dados_antes JSONB;
  v_dados_depois JSONB;
BEGIN
  -- Determinar empresa_id (se existe na tabela)
  IF TG_OP = 'DELETE' THEN
    v_empresa_id := (to_jsonb(OLD)->>'empresa_id')::uuid;
  ELSE
    v_empresa_id := (to_jsonb(NEW)->>'empresa_id')::uuid;
  END IF;
  
  -- Capturar usuario_id do JWT
  BEGIN
    v_usuario_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
  END;
  
  -- Definir ação e dados
  CASE TG_OP
    WHEN 'INSERT' THEN
      v_acao := 'INSERT';
      v_dados_antes := NULL;
      v_dados_depois := to_jsonb(NEW);
    WHEN 'UPDATE' THEN
      v_acao := 'UPDATE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := to_jsonb(NEW);
    WHEN 'DELETE' THEN
      v_acao := 'DELETE';
      v_dados_antes := to_jsonb(OLD);
      v_dados_depois := NULL;
  END CASE;
  
  -- Inserir audit log
  PERFORM insert_audit_log(
    v_empresa_id,
    v_usuario_id,
    TG_TABLE_NAME,
    COALESCE((to_jsonb(NEW)->>'id')::uuid, (to_jsonb(OLD)->>'id')::uuid),
    v_acao,
    v_dados_antes,
    v_dados_depois
  );
  
  -- Retornar registro apropriado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Aplicar trigger de auditoria em tabelas críticas
CREATE TRIGGER trg_audit_produtos AFTER INSERT OR UPDATE OR DELETE ON produtos FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_lotes AFTER INSERT OR UPDATE OR DELETE ON lotes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_cirurgias AFTER INSERT OR UPDATE OR DELETE ON cirurgias FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_kits AFTER INSERT OR UPDATE OR DELETE ON kits FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_itens_kit AFTER INSERT OR UPDATE OR DELETE ON itens_kit FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_transacoes AFTER INSERT OR UPDATE OR DELETE ON transacoes FOR EACH ROW EXECUTE FUNCTION trigger_audit();
CREATE TRIGGER trg_audit_faturas AFTER INSERT OR UPDATE OR DELETE ON faturas FOR EACH ROW EXECUTE FUNCTION trigger_audit();

COMMENT ON FUNCTION trigger_audit IS 'Trigger genérico para auditoria com hash chain';

-- ============================================
-- LGPD: Funções de Compliance
-- ============================================

-- Função: Exportar dados do usuário (Art. 18 LGPD)
CREATE OR REPLACE FUNCTION exportar_dados_usuario(p_usuario_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado JSONB;
BEGIN
  -- Verificar permissão (próprio usuário ou admin)
  IF auth.uid() != p_usuario_id AND auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Sem permissão para exportar dados de outro usuário';
  END IF;
  
  -- Agregar dados do usuário
  SELECT jsonb_build_object(
    'usuario', (SELECT row_to_json(u.*) FROM usuarios u WHERE u.id = p_usuario_id),
    'leads_responsavel', (SELECT jsonb_agg(row_to_json(l.*)) FROM leads l WHERE l.responsavel_id = p_usuario_id AND l.excluido_em IS NULL),
    'audit_log', (SELECT jsonb_agg(row_to_json(a.*)) FROM audit_log a WHERE a.usuario_id = p_usuario_id ORDER BY a.criado_em DESC LIMIT 100)
  ) INTO v_resultado;
  
  RETURN v_resultado;
END;
$$;

-- Função: Anonimizar dados do usuário (LGPD)
CREATE OR REPLACE FUNCTION anonimizar_dados_usuario(p_usuario_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar permissão (admin apenas)
  IF auth.current_perfil() != 'admin' THEN
    RAISE EXCEPTION 'Apenas admins podem anonimizar usuários';
  END IF;
  
  -- Anonimizar dados sensíveis
  UPDATE usuarios
  SET
    nome_completo = 'Usuário Anonimizado',
    email = CONCAT('anonimizado_', id::text, '@example.com'),
    avatar_url = NULL,
    excluido_em = NOW()
  WHERE id = p_usuario_id;
  
  -- Limpar leads associados
  UPDATE leads
  SET responsavel_id = NULL
  WHERE responsavel_id = p_usuario_id;
  
  RAISE NOTICE 'Usuário % anonimizado com sucesso', p_usuario_id;
END;
$$;

COMMENT ON FUNCTION exportar_dados_usuario IS 'Exporta dados do usuário (Art. 18 LGPD - portabilidade)';
COMMENT ON FUNCTION anonimizar_dados_usuario IS 'Anonimiza dados do usuário (LGPD - direito ao esquecimento)';

-- ============================================
-- ANVISA: Validações de rastreabilidade
-- ============================================

-- Função: Validar lote (verificar validade + registro)
CREATE OR REPLACE FUNCTION validar_lote(p_lote_id UUID)
RETURNS TABLE(
  valido BOOLEAN,
  motivo TEXT,
  lote_id UUID,
  produto_descricao TEXT,
  numero_lote TEXT,
  data_validade DATE,
  registro_anvisa TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN FALSE
      WHEN p.registro_anvisa IS NULL THEN FALSE
      WHEN l.status = 'bloqueado' THEN FALSE
      WHEN l.quantidade_disponivel <= 0 THEN FALSE
      ELSE TRUE
    END AS valido,
    CASE
      WHEN l.data_validade < CURRENT_DATE THEN 'Lote vencido'
      WHEN p.registro_anvisa IS NULL THEN 'Produto sem registro ANVISA'
      WHEN l.status = 'bloqueado' THEN 'Lote bloqueado'
      WHEN l.quantidade_disponivel <= 0 THEN 'Lote sem estoque'
      ELSE 'Lote válido'
    END AS motivo,
    l.id AS lote_id,
    p.descricao AS produto_descricao,
    l.numero_lote,
    l.data_validade,
    COALESCE(l.registro_anvisa, p.registro_anvisa) AS registro_anvisa
  FROM lotes l
  JOIN produtos p ON l.produto_id = p.id
  WHERE l.id = p_lote_id;
END;
$$;

-- Função: Bloquear lotes vencidos (job diário)
