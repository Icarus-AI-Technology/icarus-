-- ============================================================================
-- Migration: 20251029_admin_security_audit.sql
-- Objetivo: Garantir cobertura de 'admin' (segurança e acesso), normalizar
--           detecção de admin, aplicar GRANTs, e criar bypass RLS para admin.
-- Autor: Supabase Schema & Security Auditor (ICARUS v5.0)
-- Data: 2025-10-29
-- Notas:
--  - Não altera semantics de usuários comuns; adiciona caminho explícito p/ admin
--  - Não habilita RLS onde não existe; apenas cria policy de bypass onde RLS já está ativo
--  - Evita erro em objetos inexistentes via checagens dinâmicas
-- ============================================================================

-- 1) Função is_admin() consolidada (claims JWT + profiles)
--    - Considera 'role' ou 'perfil' no JWT, case-insensitive
--    - Considera profiles.role se existir
--    - Considera service_role como admin efetivo (operações de sistema)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_jwt jsonb := current_setting('request.jwt.claims', true)::jsonb;
  v_role text := lower(coalesce(v_jwt->>'role', ''));
  v_perfil text := lower(coalesce(v_jwt->>'perfil', ''));
  v_is_profile_admin boolean := false;
BEGIN
  -- 1. Service role sempre é admin (opera fora de RLS por design)
  IF v_role = 'service_role' THEN
    RETURN true;
  END IF;

  -- 2. Claims JWT típicas
  IF v_role IN ('admin','super_admin','ceo','ti_admin','diretor') THEN
    RETURN true;
  END IF;
  IF v_perfil IN ('admin','super_admin') THEN
    RETURN true;
  END IF;

  -- 3. Profiles.role (compat)
  BEGIN
    SELECT lower(role) IN ('admin','super admin')
      INTO v_is_profile_admin
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1;
  EXCEPTION WHEN undefined_table THEN
    v_is_profile_admin := false;
  END;

  RETURN coalesce(v_is_profile_admin, false);
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 'Retorna true quando usuário é admin via JWT (role/perfil) ou profiles.role; service_role é admin.';

-- Garantir owner consistente
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- 2) Criar ROLE de banco "admin" para GRANTs (não confundir com claims JWT)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin NOLOGIN;
  END IF;
END $$;

-- 3) GRANTS para ROLE admin (idempotentes)
--    Observação: Em Supabase, autorização efetiva ocorre via RLS/JWT; estes GRANTs
--    padronizam permissões no nível de objeto e facilitam admin via sessão técnica.
DO $$
BEGIN
  -- Schema public
  EXECUTE 'GRANT USAGE ON SCHEMA public TO admin';
  EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO admin';
  EXECUTE 'GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO admin';
  EXECUTE 'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO admin';

  -- Default privileges (para objetos futuros do owner postgres)
  EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO admin';
  EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO admin';
  EXECUTE 'ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO admin';
END $$;

-- Schema auth (tentar; ignorar se não aplicável)
DO $$
BEGIN
  BEGIN
    EXECUTE 'GRANT USAGE ON SCHEMA auth TO admin';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Ignorando GRANT em schema auth: %', SQLERRM;
  END;
  BEGIN
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA auth TO admin';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Ignorando GRANT em tabelas do schema auth: %', SQLERRM;
  END;
END $$;

-- 4) Policy de bypass RLS para admin em todas as tabelas RLS-enabled do schema public
--    - Não habilita RLS se estiver desabilitado (conservador)
DO $$
DECLARE
  r RECORD;
  v_schema text;
  v_table text;
  v_has_rls boolean;
  v_policy_exists boolean;
BEGIN
  FOR r IN (
    SELECT n.nspname AS schemaname,
           c.relname AS tablename,
           c.oid      AS relid,
           c.relrowsecurity AS has_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r' -- base tables
  ) LOOP
    v_schema := r.schemaname;
    v_table := r.tablename;
    v_has_rls := r.has_rls;

    IF v_has_rls THEN
      SELECT EXISTS (
        SELECT 1 FROM pg_policies p
        WHERE p.schemaname = v_schema
          AND p.tablename = v_table
          AND p.policyname = 'admin_bypass_all'
      ) INTO v_policy_exists;

      IF NOT v_policy_exists THEN
        EXECUTE format(
          'CREATE POLICY %I ON %I.%I FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin())',
          'admin_bypass_all', v_schema, v_table
        );
        RAISE NOTICE 'Policy admin_bypass_all criada em %.%', v_schema, v_table;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 5) Índices de performance recomendados (idempotentes)
--    - Parciais em (empresa_id) filtrando registros ativos (excluido_em IS NULL)
--    - Trigram para buscas textuais em descrições
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Helpers para criar índice se a tabela existir
DO $$
DECLARE
  v_has_excluido boolean;
  v_has_empresa_id boolean;
  v_has_criado_em boolean;
  v_has_id boolean;
  v_has_descricao boolean;
  v_has_status boolean;
  v_has_vencimento boolean;
BEGIN
  -- CIRURGIAS
  IF to_regclass('public.cirurgias') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cirurgias' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cirurgias' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cirurgias' AND column_name='criado_em'
    ) INTO v_has_criado_em;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='cirurgias' AND column_name='id'
    ) INTO v_has_id;

    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa_ativos ON public.cirurgias (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cirurgias_empresa ON public.cirurgias (empresa_id)';
      END IF;
    END IF;
    IF v_has_criado_em AND v_has_id THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_cirurgias_criado_em ON public.cirurgias (criado_em DESC, id)';
    END IF;
  END IF;

  -- ESTOQUE
  IF to_regclass('public.estoque') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estoque' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='estoque' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_estoque_empresa_ativos ON public.estoque (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_estoque_empresa ON public.estoque (empresa_id)';
      END IF;
    END IF;
  END IF;

  -- CONSIGNACAO_MATERIAIS
  IF to_regclass('public.consignacao_materiais') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consignacao_materiais' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='consignacao_materiais' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_consignacao_empresa_ativos ON public.consignacao_materiais (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_consignacao_empresa ON public.consignacao_materiais (empresa_id)';
      END IF;
    END IF;
  END IF;

  -- PRODUTOS_OPME
  IF to_regclass('public.produtos_opme') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='produtos_opme' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='produtos_opme' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='produtos_opme' AND column_name='descricao'
    ) INTO v_has_descricao;
    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_produtos_opme_empresa_ativos ON public.produtos_opme (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_produtos_opme_empresa ON public.produtos_opme (empresa_id)';
      END IF;
    END IF;
    IF v_has_descricao THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_produtos_opme_descricao_trgm ON public.produtos_opme USING gin (descricao gin_trgm_ops)';
    END IF;
  END IF;

  -- CONTAS_RECEBER
  IF to_regclass('public.contas_receber') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_receber' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_receber' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_receber' AND column_name='status'
    ) INTO v_has_status;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_receber' AND column_name='vencimento'
    ) INTO v_has_vencimento;
    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa_ativos ON public.contas_receber (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa ON public.contas_receber (empresa_id)';
      END IF;
    END IF;
    IF v_has_status AND v_has_vencimento THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON public.contas_receber (status, vencimento)';
    END IF;
  END IF;

  -- CONTAS_PAGAR
  IF to_regclass('public.contas_pagar') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_pagar' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_pagar' AND column_name='excluido_em'
    ) INTO v_has_excluido;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_pagar' AND column_name='status'
    ) INTO v_has_status;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='contas_pagar' AND column_name='vencimento'
    ) INTO v_has_vencimento;
    IF v_has_empresa_id THEN
      IF v_has_excluido THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa_ativos ON public.contas_pagar (empresa_id) WHERE excluido_em IS NULL';
      ELSE
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa ON public.contas_pagar (empresa_id)';
      END IF;
    END IF;
    IF v_has_status AND v_has_vencimento THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar (status, vencimento)';
    END IF;
  END IF;
END $$;

-- 6) PKs ausentes: adicionar quando seguro (id não nulo e sem duplicatas)
DO $$
DECLARE
  t text;
  v_has_pk boolean;
  v_has_id boolean;
  v_has_nulls boolean;
  v_has_dupes boolean;
  v_rel regclass;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'public.cirurgias',
    'public.estoque',
    'public.consignacao_materiais',
    'public.produtos_opme',
    'public.contas_receber',
    'public.contas_pagar'
  ]) LOOP
    v_rel := to_regclass(t);
    IF v_rel IS NULL THEN
      CONTINUE;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = v_rel AND contype = 'p'
    ) INTO v_has_pk;

    IF NOT v_has_pk THEN
      -- Verificar se coluna id existe
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE (table_schema||'.'||table_name) = split_part(t,'.',1)||'.'||split_part(t,'.',2)
          AND column_name = 'id'
      ) INTO v_has_id;

      IF v_has_id THEN
        EXECUTE format('SELECT EXISTS (SELECT 1 FROM %s WHERE id IS NULL)', t) INTO v_has_nulls;
        EXECUTE format('SELECT EXISTS (
                          SELECT id FROM %s WHERE id IS NOT NULL GROUP BY id HAVING COUNT(*) > 1
                        )', t) INTO v_has_dupes;

        IF NOT v_has_nulls AND NOT v_has_dupes THEN
          EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %s PRIMARY KEY (id)', t, replace(t, '.', '_')||'_pkey');
          RAISE NOTICE 'PK criada em %', t;
        ELSE
          RAISE NOTICE 'PK não criada em % (nulls/duplicatas em id)', t;
        END IF;
      END IF;
    END IF;
  END LOOP;
END $$;

-- 7) Função de verificação de existência de admin em auth.users (diagnóstico)
CREATE OR REPLACE FUNCTION public.exists_admin_in_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE lower(coalesce(u.raw_user_meta_data->>'role','')) = 'admin'
       OR lower(coalesce(u.raw_app_meta_data->>'role','')) = 'admin'
  );
$$;

COMMENT ON FUNCTION public.exists_admin_in_auth IS 'Retorna true se existir usuário com metadata role=admin em auth.users';

-- 8) Ownership consistente de funções criadas aqui
ALTER FUNCTION public.exists_admin_in_auth() OWNER TO postgres;

-- 9) Aviso operacional: criação de usuário admin deve ser feita via Edge Function
--    Disponível em supabase/functions/create-admin (usa Service Role API)
--    Ex.: POST /functions/v1/create-admin com ADMIN_INITIAL_EMAIL/ADMIN_INITIAL_PASSWORD
--    Esta migration não cria usuários em auth.users para evitar dependências externas.

-- FIM


