# RBAC e RLS

- Papéis: `admin`, `financeiro`, `estoque`, `compliance`, `vendas`, `leitura`.
- Rotas protegidas por guard de autenticação + checagem de claims JWT.
- Tabelas críticas com RLS: cirurgias, consignação, financeiro, estoque sensível.
- Alterações em RLS exigem migration Supabase e atualização deste documento.

## Admin – Cobertura Consistente

- Função unificada `public.is_admin()` determina privilégios de administrador a partir de:
  - Claims JWT: `role` ou `perfil` (case-insensitive), aceitando `admin`, `super_admin`, `ceo`, `ti_admin`, `diretor`.
  - `service_role` é tratado como admin operacional (para tarefas de sistema).
  - Campo `profiles.role` (compatibilidade), quando existir.

- Policy genérica de bypass: `admin_bypass_all` criada automaticamente em todas as tabelas com RLS já habilitado no `schema public`:
  - `FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())`.
  - Não habilita RLS onde não existir (conservador).

- Papel de banco `admin` (DB role):
  - Criado como `NOLOGIN`; usado para GRANTs padronizados de schema/objetos.
  - Grants aplicados: `USAGE` no schema `public`, `SELECT/INSERT/UPDATE/DELETE` em todas as tabelas, `USAGE/SELECT/UPDATE` em sequências, `EXECUTE` em funções.
  - Defaults: `ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public ... TO admin`.
  - Observação: Autorização de usuários finais continua via RLS/JWT; o DB role `admin` não é mapeado automaticamente a `authenticated`.

- Criação do usuário admin (camada Auth):
  - Realizada via Edge Function `functions/create-admin` (usa Service Role API do Supabase) para evitar manipulação direta de `auth.users` em SQL.
  - Função diagnóstica `public.exists_admin_in_auth()` retorna `TRUE` quando há usuário com metadata `role=admin` em `auth.users`.

## Atualizações recentes (2025-10-29)

- `public.validar_login(p_email text, p_senha text)` recriada com verificação de senha via `pgcrypto/crypt()`; `SECURITY DEFINER`, `owner=postgres`, `search_path=public, pg_temp`, `REVOKE PUBLIC`, `GRANT authenticated`.
- Hardening das funções `public.obter_permissoes_usuario(uuid)` e `public.exists_admin_in_auth()` com `owner=postgres`, `search_path` explícito e remoção de `GRANT` para `PUBLIC`.

