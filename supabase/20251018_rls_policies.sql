-- ============================================
-- ICARUS v5.0 - Row Level Security (RLS)
-- Políticas de Segurança Supabase
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitais ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais_opme ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos_compra ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS: profiles
-- ============================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: medicos
-- ============================================

-- Todos usuários autenticados podem ler médicos
CREATE POLICY "Usuários autenticados podem ler médicos"
  ON medicos FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e usuários financeiros podem criar médicos
CREATE POLICY "Admins/Financeiro podem criar médicos"
  ON medicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas admins e usuários financeiros podem atualizar médicos
CREATE POLICY "Admins/Financeiro podem atualizar médicos"
  ON medicos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas admins podem deletar médicos
CREATE POLICY "Apenas admins podem deletar médicos"
  ON medicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: hospitais
-- ============================================

-- Todos usuários autenticados podem ler hospitais
CREATE POLICY "Usuários autenticados podem ler hospitais"
  ON hospitais FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem criar/atualizar/deletar hospitais
CREATE POLICY "Apenas admins podem gerenciar hospitais"
  ON hospitais FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: cirurgias
-- ============================================

-- Usuários autenticados podem ler cirurgias
CREATE POLICY "Usuários autenticados podem ler cirurgias"
  ON cirurgias FOR SELECT
  TO authenticated
  USING (true);

-- Médicos podem criar cirurgias
CREATE POLICY "Médicos podem criar cirurgias"
  ON cirurgias FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico')
    )
  );

-- Médicos e admins podem atualizar cirurgias
CREATE POLICY "Médicos/Admins podem atualizar cirurgias"
  ON cirurgias FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico')
    )
  );

-- Apenas admins podem deletar cirurgias
CREATE POLICY "Apenas admins podem deletar cirurgias"
  ON cirurgias FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: materiais_opme
-- ============================================

-- Todos usuários autenticados podem ler materiais
CREATE POLICY "Usuários autenticados podem ler materiais"
  ON materiais_opme FOR SELECT
  TO authenticated
  USING (true);

-- Apenas usuários de estoque e admins podem gerenciar materiais
CREATE POLICY "Estoque/Admins podem gerenciar materiais"
  ON materiais_opme FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: cirurgia_materiais
-- ============================================

-- Usuários autenticados podem ler materiais de cirurgias
CREATE POLICY "Usuários autenticados podem ler cirurgia_materiais"
  ON cirurgia_materiais FOR SELECT
  TO authenticated
  USING (true);

-- Médicos e estoque podem criar vínculos
CREATE POLICY "Médicos/Estoque podem criar cirurgia_materiais"
  ON cirurgia_materiais FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'medico', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: leads
-- ============================================

-- Usuários de vendas podem ler todos os leads
CREATE POLICY "Vendas podem ler leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendas')
    )
  );

-- Vendedores podem criar leads
CREATE POLICY "Vendas podem criar leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'vendas')
    )
  );

-- Vendedores podem atualizar seus próprios leads
CREATE POLICY "Vendas podem atualizar próprios leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (
    responsavel_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS: transacoes
-- ============================================

-- Usuários financeiros e admins podem ler transações
CREATE POLICY "Financeiro/Admins podem ler transações"
  ON transacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas usuários financeiros e admins podem criar transações
CREATE POLICY "Financeiro/Admins podem criar transações"
  ON transacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- Apenas usuários financeiros e admins podem atualizar transações
CREATE POLICY "Financeiro/Admins podem atualizar transações"
  ON transacoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- ============================================
-- POLÍTICAS: fornecedores
-- ============================================

-- Usuários autenticados podem ler fornecedores
CREATE POLICY "Usuários autenticados podem ler fornecedores"
  ON fornecedores FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins e estoque podem gerenciar fornecedores
CREATE POLICY "Admins/Estoque podem gerenciar fornecedores"
  ON fornecedores FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- ============================================
-- POLÍTICAS: pedidos_compra
-- ============================================

-- Usuários de estoque podem ler pedidos
CREATE POLICY "Estoque pode ler pedidos"
  ON pedidos_compra FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque', 'financeiro')
    )
  );

-- Usuários de estoque podem criar pedidos
CREATE POLICY "Estoque pode criar pedidos"
  ON pedidos_compra FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque')
    )
  );

-- Usuários de estoque e financeiro podem atualizar pedidos
CREATE POLICY "Estoque/Financeiro podem atualizar pedidos"
  ON pedidos_compra FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'estoque', 'financeiro')
    )
  );

-- ============================================
-- FUNÇÃO: Criar perfil automaticamente no signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON POLICY "Usuários podem ver próprio perfil" ON profiles IS 'Permite que usuários vejam apenas seu próprio perfil';
COMMENT ON POLICY "Admins podem ver todos os perfis" ON profiles IS 'Administradores têm acesso total aos perfis';
COMMENT ON POLICY "Médicos podem criar cirurgias" ON cirurgias IS 'Médicos autenticados podem criar novas cirurgias';

