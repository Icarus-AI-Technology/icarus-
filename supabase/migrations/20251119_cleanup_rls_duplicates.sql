-- Migration: Cleanup de Políticas RLS Duplicadas
-- Data: 19 de Novembro de 2025
-- Objetivo: Remover 7 políticas duplicadas da tabela profiles
-- Resultado esperado: 4 políticas limpas e funcionais

-- ============================================================================
-- 1. DELETAR POLÍTICAS DUPLICADAS
-- ============================================================================

-- Política duplicada #1: users_see_own_profile (duplicata de profiles_select_own)
DROP POLICY IF EXISTS "users_see_own_profile" ON profiles;

-- Política duplicada #2: users_update_own_profile (duplicata de profiles_update_own)
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

-- Política duplicada #3: "Users can view their own profile" (duplicata de profiles_select_own)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Política duplicada #4: "Users can update their own profile" (duplicata de profiles_update_own)
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Política duplicada #5: "Usuários podem ver próprio perfil" (duplicata de profiles_select_own)
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;

-- Política duplicada #6: "Usuários podem atualizar próprio perfil" (duplicata de profiles_update_own)
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;

-- ============================================================================
-- 2. GARANTIR QUE POLÍTICAS ESSENCIAIS EXISTAM
-- ============================================================================

-- Recriar políticas essenciais (caso tenham sido deletadas acidentalmente)

-- 2.1 SELECT para próprio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'profiles_select_own'
  ) THEN
    CREATE POLICY profiles_select_own ON profiles
      FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

-- 2.2 UPDATE para próprio perfil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'profiles_update_own'
  ) THEN
    CREATE POLICY profiles_update_own ON profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2.3 Admins podem ver todos os perfis (sem causar recursão)
-- IMPORTANTE: Usar EXISTS com subquery segura, não is_admin()
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'profiles_admin_select_all'
  ) THEN
    CREATE POLICY profiles_admin_select_all ON profiles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM usuarios 
          WHERE usuarios.id = auth.uid() 
          AND usuarios.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- 2.4 DELETE apenas para admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'profiles_delete_admin'
  ) THEN
    CREATE POLICY profiles_delete_admin ON profiles
      FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM usuarios 
          WHERE usuarios.id = auth.uid() 
          AND usuarios.role IN ('admin', 'super_admin')
        )
      );
  END IF;
END $$;

-- 2.5 Service role bypass (para operações internas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'service_role_all_profiles'
  ) THEN
    CREATE POLICY service_role_all_profiles ON profiles
      FOR ALL
      USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);
  END IF;
END $$;

-- ============================================================================
-- 3. REMOVER POLÍTICAS ANTIGAS/DUPLICADAS ADICIONAIS
-- ============================================================================

-- Remover política antiga "Admins podem ver todos os perfis" (usa is_admin que causa recursão)
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;

-- Remover política antiga profiles_delete_policy
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- ============================================================================
-- 4. VERIFICAR RESULTADO
-- ============================================================================

-- Query para verificar políticas finais (executar manualmente após migração)
-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'profiles' 
-- ORDER BY policyname;

-- Resultado esperado: 5 políticas
-- 1. profiles_select_own           (SELECT para próprio perfil)
-- 2. profiles_update_own           (UPDATE para próprio perfil)
-- 3. profiles_admin_select_all     (SELECT para admins, sem recursão)
-- 4. profiles_delete_admin         (DELETE para admins)
-- 5. service_role_all_profiles     (ALL para service_role)

-- ============================================================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON POLICY profiles_select_own ON profiles IS 
  'Permite que usuários visualizem seu próprio perfil';

COMMENT ON POLICY profiles_update_own ON profiles IS 
  'Permite que usuários atualizem seu próprio perfil';

COMMENT ON POLICY profiles_admin_select_all ON profiles IS 
  'Permite que admins visualizem todos os perfis (sem recursão infinita)';

COMMENT ON POLICY profiles_delete_admin ON profiles IS 
  'Permite que admins deletem perfis';

COMMENT ON POLICY service_role_all_profiles ON profiles IS 
  'Permite que o service_role execute qualquer operação (bypass RLS)';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

