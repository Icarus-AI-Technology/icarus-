-- Migração automática: Habilitar RLS em tabelas críticas
-- Gerado em: 2025-10-27T01:36:14.701Z
-- Total de tabelas: 20

-- Habilitar RLS para usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "usuarios_select_policy"
  ON public.usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "usuarios_insert_policy"
  ON public.usuarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "usuarios_update_policy"
  ON public.usuarios
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "usuarios_delete_policy"
  ON public.usuarios
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para medicos
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "medicos_select_policy"
  ON public.medicos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "medicos_insert_policy"
  ON public.medicos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "medicos_update_policy"
  ON public.medicos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "medicos_delete_policy"
  ON public.medicos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para hospitais
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "hospitais_select_policy"
  ON public.hospitais
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "hospitais_insert_policy"
  ON public.hospitais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "hospitais_update_policy"
  ON public.hospitais
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "hospitais_delete_policy"
  ON public.hospitais
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para cirurgias
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "cirurgias_select_policy"
  ON public.cirurgias
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "cirurgias_insert_policy"
  ON public.cirurgias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "cirurgias_update_policy"
  ON public.cirurgias
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "cirurgias_delete_policy"
  ON public.cirurgias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para transacoes
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "transacoes_select_policy"
  ON public.transacoes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "transacoes_insert_policy"
  ON public.transacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "transacoes_update_policy"
  ON public.transacoes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "transacoes_delete_policy"
  ON public.transacoes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "fornecedores_select_policy"
  ON public.fornecedores
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "fornecedores_insert_policy"
  ON public.fornecedores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "fornecedores_update_policy"
  ON public.fornecedores
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "fornecedores_delete_policy"
  ON public.fornecedores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para pedidos_compra
ALTER TABLE public.pedidos_compra ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "pedidos_compra_select_policy"
  ON public.pedidos_compra
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "pedidos_compra_insert_policy"
  ON public.pedidos_compra
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "pedidos_compra_update_policy"
  ON public.pedidos_compra
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "pedidos_compra_delete_policy"
  ON public.pedidos_compra
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "faturas_select_policy"
  ON public.faturas
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "faturas_insert_policy"
  ON public.faturas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "faturas_update_policy"
  ON public.faturas
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "faturas_delete_policy"
  ON public.faturas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "audit_log_select_policy"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "audit_log_insert_policy"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "audit_log_update_policy"
  ON public.audit_log
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "audit_log_delete_policy"
  ON public.audit_log
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para pacientes
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "pacientes_select_policy"
  ON public.pacientes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "pacientes_insert_policy"
  ON public.pacientes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "pacientes_update_policy"
  ON public.pacientes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "pacientes_delete_policy"
  ON public.pacientes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para faturas
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "faturas_select_policy"
  ON public.faturas
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "faturas_insert_policy"
  ON public.faturas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "faturas_update_policy"
  ON public.faturas
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "faturas_delete_policy"
  ON public.faturas
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "profiles_insert_policy"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "profiles_delete_policy"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para medicos
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "medicos_select_policy"
  ON public.medicos
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "medicos_insert_policy"
  ON public.medicos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "medicos_update_policy"
  ON public.medicos
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "medicos_delete_policy"
  ON public.medicos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para hospitais
ALTER TABLE public.hospitais ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "hospitais_select_policy"
  ON public.hospitais
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "hospitais_insert_policy"
  ON public.hospitais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "hospitais_update_policy"
  ON public.hospitais
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "hospitais_delete_policy"
  ON public.hospitais
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para cirurgias
ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "cirurgias_select_policy"
  ON public.cirurgias
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "cirurgias_insert_policy"
  ON public.cirurgias
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "cirurgias_update_policy"
  ON public.cirurgias
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "cirurgias_delete_policy"
  ON public.cirurgias
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para materiais_opme
ALTER TABLE public.materiais_opme ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "materiais_opme_select_policy"
  ON public.materiais_opme
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "materiais_opme_insert_policy"
  ON public.materiais_opme
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "materiais_opme_update_policy"
  ON public.materiais_opme
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "materiais_opme_delete_policy"
  ON public.materiais_opme
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para transacoes
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "transacoes_select_policy"
  ON public.transacoes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "transacoes_insert_policy"
  ON public.transacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "transacoes_update_policy"
  ON public.transacoes
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "transacoes_delete_policy"
  ON public.transacoes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Habilitar RLS para fornecedores
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ler suas próprias linhas
CREATE POLICY "fornecedores_select_policy"
  ON public.fornecedores
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Política: Usuários autenticados podem inserir
CREATE POLICY "fornecedores_insert_policy"
  ON public.fornecedores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Usuários podem atualizar suas próprias linhas
CREATE POLICY "fornecedores_update_policy"
  ON public.fornecedores
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = created_by
  );

-- Política: Apenas admins podem deletar
CREATE POLICY "fornecedores_delete_policy"
  ON public.fornecedores
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );


-- Índices para melhorar performance das políticas RLS

CREATE INDEX IF NOT EXISTS idx_usuarios_user_id ON public.usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_by ON public.usuarios(created_by);

CREATE INDEX IF NOT EXISTS idx_medicos_user_id ON public.medicos(user_id);
CREATE INDEX IF NOT EXISTS idx_medicos_created_by ON public.medicos(created_by);

CREATE INDEX IF NOT EXISTS idx_hospitais_user_id ON public.hospitais(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitais_created_by ON public.hospitais(created_by);

CREATE INDEX IF NOT EXISTS idx_cirurgias_user_id ON public.cirurgias(user_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_created_by ON public.cirurgias(created_by);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_by ON public.transacoes(created_by);

CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_created_by ON public.fornecedores(created_by);

CREATE INDEX IF NOT EXISTS idx_pedidos_compra_user_id ON public.pedidos_compra(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_created_by ON public.pedidos_compra(created_by);

CREATE INDEX IF NOT EXISTS idx_faturas_user_id ON public.faturas(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_created_by ON public.faturas(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_by ON public.audit_log(created_by);

CREATE INDEX IF NOT EXISTS idx_pacientes_user_id ON public.pacientes(user_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_created_by ON public.pacientes(created_by);

CREATE INDEX IF NOT EXISTS idx_faturas_user_id ON public.faturas(user_id);
CREATE INDEX IF NOT EXISTS idx_faturas_created_by ON public.faturas(created_by);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON public.profiles(created_by);

CREATE INDEX IF NOT EXISTS idx_medicos_user_id ON public.medicos(user_id);
CREATE INDEX IF NOT EXISTS idx_medicos_created_by ON public.medicos(created_by);

CREATE INDEX IF NOT EXISTS idx_hospitais_user_id ON public.hospitais(user_id);
CREATE INDEX IF NOT EXISTS idx_hospitais_created_by ON public.hospitais(created_by);

CREATE INDEX IF NOT EXISTS idx_cirurgias_user_id ON public.cirurgias(user_id);
CREATE INDEX IF NOT EXISTS idx_cirurgias_created_by ON public.cirurgias(created_by);

CREATE INDEX IF NOT EXISTS idx_materiais_opme_user_id ON public.materiais_opme(user_id);
CREATE INDEX IF NOT EXISTS idx_materiais_opme_created_by ON public.materiais_opme(created_by);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_by ON public.leads(created_by);

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON public.transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_created_by ON public.transacoes(created_by);

CREATE INDEX IF NOT EXISTS idx_fornecedores_user_id ON public.fornecedores(user_id);
CREATE INDEX IF NOT EXISTS idx_fornecedores_created_by ON public.fornecedores(created_by);


-- Comentários
COMMENT ON TABLE public.usuarios IS 'Tabela com RLS habilitado para segurança';
