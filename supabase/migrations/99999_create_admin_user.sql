-- ================================================
-- CRIAR USUÁRIO ADMIN
-- ================================================
-- Este script cria o usuário admin no Supabase Auth
-- Email: dax@newortho.com.br
-- Senha: NewOrtho2025@Admin
--
-- IMPORTANTE: Este script deve ser executado via Supabase Dashboard
-- em SQL Editor ou via CLI, pois requer permissões de superusuário
-- ================================================

-- 1. Verificar se usuário já existe
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  role
FROM auth.users
WHERE email = 'dax@newortho.com.br';

-- 2. Se não existir, criar usuário (via Supabase Dashboard em Authentication > Users)
-- Clique em "Invite User" ou "Add User"
-- Email: dax@newortho.com.br
-- Password: NewOrtho2025@Admin
-- Confirm Email: YES
-- Role: authenticated

-- 3. Após criar, pegar o UUID do usuário
-- Substitua 'USER_UUID_AQUI' pelo UUID real do usuário criado

-- 4. Criar perfil de admin (se houver tabela de perfis)
-- Descomente e ajuste conforme sua estrutura:
-- INSERT INTO public.perfis (usuario_id, nome, email, role, is_admin)
-- VALUES (
--   'USER_UUID_AQUI',
--   'Dax Meneghel',
--   'dax@newortho.com.br',
--   'admin',
--   true
-- );

-- 5. Verificar RLS policies que podem estar bloqueando
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6. Verificar se há alguma política restritiva demais
-- Se necessário, temporariamente desabilitar RLS para debug:
-- ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;

-- 7. Verificar tabelas que têm RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;
