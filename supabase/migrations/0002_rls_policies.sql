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

