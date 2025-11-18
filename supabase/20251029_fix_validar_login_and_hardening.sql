-- =============================================================
-- Migration: Fix validar_login + Hardening de Funções
-- Data: 2025-10-29
-- Notas:
--  - Corrige validação de senha usando pgcrypto/crypt
--  - Padroniza SECURITY DEFINER com owner postgres, search_path explícito
--  - Revoga EXECUTE de PUBLIC e concede a authenticated
-- =============================================================

-- Extensão necessária para crypt()
create extension if not exists pgcrypto;

-- ============================================
-- Recriar validar_login com validação correta
-- ============================================
create or replace function public.validar_login(
  p_email text,
  p_senha text
) returns table (
  usuario_id uuid,
  nome_completo text,
  email text,
  cargo text,
  empresa_id uuid,
  empresa_nome text,
  sucesso boolean,
  mensagem text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_usuario record;
  v_senha_valida boolean;
begin
  select u.*, e.nome as empresa_nome
    into v_usuario
  from public.usuarios u
  join public.empresas e on e.id = u.empresa_id
  where u.email = p_email
    and u.ativo = true
    and u.excluido_em is null;

  if not found then
    return query select null::uuid, null::text, null::text, null::text, null::uuid, null::text, false, 'Usuário não encontrado ou inativo';
    return;
  end if;

  v_senha_valida := v_usuario.senha_hash is not null
                 and crypt(p_senha, v_usuario.senha_hash) = v_usuario.senha_hash;

  if not v_senha_valida then
    return query select null::uuid, null::text, null::text, null::text, null::uuid, null::text, false, 'Senha inválida';
    return;
  end if;

  update public.usuarios set ultimo_login = now() where id = v_usuario.id;

  return query select v_usuario.id,
                       v_usuario.nome_completo,
                       v_usuario.email,
                       v_usuario.cargo,
                       v_usuario.empresa_id,
                       v_usuario.empresa_nome,
                       true,
                       'Login realizado com sucesso';
end;
$$;

-- Hardening: permissões e ownership
revoke all on function public.validar_login(text, text) from public;
grant execute on function public.validar_login(text, text) to authenticated;
alter function public.validar_login(text, text) owner to postgres;

-- ============================================
-- Hardening de funções existentes relacionadas
-- ============================================

-- obter_permissoes_usuario(uuid)
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'obter_permissoes_usuario'
  ) then
    alter function public.obter_permissoes_usuario(uuid) owner to postgres;
    alter function public.obter_permissoes_usuario(uuid) set search_path = public, pg_temp;
    revoke all on function public.obter_permissoes_usuario(uuid) from public;
    grant execute on function public.obter_permissoes_usuario(uuid) to authenticated;
  end if;
end $$;

-- exists_admin_in_auth()
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'exists_admin_in_auth'
  ) then
    alter function public.exists_admin_in_auth() owner to postgres;
    alter function public.exists_admin_in_auth() set search_path = public, pg_temp;
    revoke all on function public.exists_admin_in_auth() from public;
    grant execute on function public.exists_admin_in_auth() to authenticated;
  end if;
end $$;

-- Comentários de documentação
comment on function public.validar_login(text, text) is 'Valida credenciais de login (bcrypt/crypt) e retorna dados do usuário';


