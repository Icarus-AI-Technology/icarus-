-- Migration: RLS Policies - Domínio Cirurgias
-- Gerado por: AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
-- Multi-tenant por empresa_id

-- ======================================
-- HABILITAR RLS
-- ======================================

ALTER TABLE public.cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cirurgia_eventos ENABLE ROW LEVEL SECURITY;

-- ======================================
-- POLICIES: cirurgias
-- ======================================

-- SELECT: usuários veem apenas cirurgias da sua empresa
CREATE POLICY cirurgias_select_policy ON public.cirurgias
  FOR SELECT
  USING (
    empresa_id IN (
      SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- INSERT: apenas coordenadores, gerentes e admins
CREATE POLICY cirurgias_insert_policy ON public.cirurgias
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- UPDATE: mesmo controle do INSERT
CREATE POLICY cirurgias_update_policy ON public.cirurgias
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

-- DELETE: apenas admins
CREATE POLICY cirurgias_delete_policy ON public.cirurgias
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.empresa_id = cirurgias.empresa_id
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_materiais
-- ======================================

-- SELECT: via join com cirurgias
CREATE POLICY cirurgia_materiais_select_policy ON public.cirurgia_materiais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT/UPDATE/DELETE: herdar controle da cirurgia
CREATE POLICY cirurgia_materiais_insert_policy ON public.cirurgia_materiais
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_update_policy ON public.cirurgia_materiais
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('coordenador', 'gerente', 'admin', 'super_admin')
    )
  );

CREATE POLICY cirurgia_materiais_delete_policy ON public.cirurgia_materiais
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_materiais.cirurgia_id
        AND p.id = auth.uid()
        AND p.role IN ('admin', 'super_admin')
    )
  );

-- ======================================
-- POLICIES: cirurgia_eventos
-- ======================================

-- SELECT: ler eventos da cirurgia (mesma empresa)
CREATE POLICY cirurgia_eventos_select_policy ON public.cirurgia_eventos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND c.empresa_id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )
    )
  );

-- INSERT: qualquer usuário autenticado da empresa pode criar eventos
CREATE POLICY cirurgia_eventos_insert_policy ON public.cirurgia_eventos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cirurgias c
      INNER JOIN public.profiles p ON p.empresa_id = c.empresa_id
      WHERE c.id = cirurgia_eventos.cirurgia_id
        AND p.id = auth.uid()
    )
  );
