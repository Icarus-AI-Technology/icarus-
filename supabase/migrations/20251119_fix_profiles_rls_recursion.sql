-- =================================================================
-- CORREÇÃO DE RECURSÃO INFINITA EM RLS (PROFILES)
-- =================================================================
-- Problema: A política "Admins podem ver todos os perfis" faz um SELECT
-- na própria tabela profiles para verificar se o usuário é admin,
-- criando um loop infinito.
--
-- Solução: Criar uma função SECURITY DEFINER para verificar o role,
-- que executa com privilégios elevados e ignora o RLS, quebrando o loop.
-- =================================================================

-- 1. Criar função para verificar se é admin (bypassing RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover a política problemática
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;

-- 3. Recriar a política usando a função segura
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (is_admin());

-- 4. Aplicar a mesma lógica para outras políticas que dependem de admin na tabela profiles
-- (Opcional, mas recomendado para evitar problemas futuros em outras tabelas se houver joins)

-- Verificar se a correção funcionou
-- SELECT * FROM profiles;
