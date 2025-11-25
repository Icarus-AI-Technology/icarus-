 --============================================================================
-- HARDENING DE RLS PARA OBJETOS DO SCHEMA auth, vault, realtime e supabase_migrations
-- Executar este script no SQL Editor do projeto Supabase logado como o usuário
-- superuser (postgres). Cada bloco é idempotente.
-- ============================================================================

-- auth.oauth_clients / oauth_authorizations / oauth_consents
ALTER TABLE auth.oauth_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.oauth_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.oauth_consents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'auth'
      AND tablename = 'oauth_clients'
      AND policyname = 'oauth_clients_service_only'
  ) THEN
    CREATE POLICY oauth_clients_service_only
      ON auth.oauth_clients
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'auth'
      AND tablename = 'oauth_authorizations'
      AND policyname = 'oauth_authorizations_service_only'
  ) THEN
    CREATE POLICY oauth_authorizations_service_only
      ON auth.oauth_authorizations
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'auth'
      AND tablename = 'oauth_consents'
      AND policyname = 'oauth_consents_service_only'
  ) THEN
    CREATE POLICY oauth_consents_service_only
      ON auth.oauth_consents
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- vault.secrets
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'vault'
      AND tablename = 'secrets'
      AND policyname = 'vault_secrets_service_only'
  ) THEN
    CREATE POLICY vault_secrets_service_only
      ON vault.secrets
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- realtime.subscription e realtime.schema_migrations
ALTER TABLE realtime.subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime.schema_migrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime'
      AND tablename = 'subscription'
      AND policyname = 'realtime_subscription_service_only'
  ) THEN
    CREATE POLICY realtime_subscription_service_only
      ON realtime.subscription
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'realtime'
      AND tablename = 'schema_migrations'
      AND policyname = 'realtime_schema_migrations_service_only'
  ) THEN
    CREATE POLICY realtime_schema_migrations_service_only
      ON realtime.schema_migrations
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

-- supabase_migrations.schema_migrations e supabase_migrations.seed_files
ALTER TABLE supabase_migrations.schema_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE supabase_migrations.seed_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'supabase_migrations'
      AND tablename = 'schema_migrations'
      AND policyname = 'supabase_schema_migrations_service_only'
  ) THEN
    CREATE POLICY supabase_schema_migrations_service_only
      ON supabase_migrations.schema_migrations
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'supabase_migrations'
      AND tablename = 'seed_files'
      AND policyname = 'supabase_seed_files_service_only'
  ) THEN
    CREATE POLICY supabase_seed_files_service_only
      ON supabase_migrations.seed_files
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

