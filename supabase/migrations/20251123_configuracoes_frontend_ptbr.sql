-- ============================================================================
-- 2025-11-23 - Infra de configurações de frontend personalizável (pt-BR)
-- ============================================================================

SET search_path = public;

-- ----------------------------------------------------------------------------
-- Função de auditoria para tabelas de configurações
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.aplicar_auditoria_configuracoes()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_usuario uuid := auth.uid();
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.criado_em := COALESCE(NEW.criado_em, NOW());
    NEW.criado_por := COALESCE(NEW.criado_por, v_usuario);
  END IF;

  NEW.atualizado_em := NOW();
  IF v_usuario IS NOT NULL THEN
    NEW.atualizado_por := v_usuario;
  END IF;

  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.current_empresa();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.aplicar_auditoria_configuracoes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.aplicar_auditoria_configuracoes() TO authenticated, service_role;

-- ----------------------------------------------------------------------------
-- Tabela: configuracoes_modulos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL DEFAULT public.current_empresa(),
  chave text NOT NULL,
  chave_normalizada text GENERATED ALWAYS AS (
    lower(regexp_replace(coalesce(chave, ''), '[^a-z0-9]+', '_', 'g'))
  ) STORED,
  nome text NOT NULL,
  descricao text,
  icone text,
  metadados jsonb NOT NULL DEFAULT '{}'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT NOW(),
  atualizado_por uuid,
  UNIQUE (empresa_id, chave_normalizada)
);

CREATE INDEX IF NOT EXISTS configuracoes_modulos_empresa_ativo_idx
  ON public.configuracoes_modulos (empresa_id, ativo, ordem);

CREATE TRIGGER configuracoes_modulos_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_modulos
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

-- ----------------------------------------------------------------------------
-- Tabela: configuracoes_submodulos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_submodulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL DEFAULT public.current_empresa(),
  modulo_id uuid NOT NULL REFERENCES public.configuracoes_modulos(id) ON DELETE CASCADE,
  chave text NOT NULL,
  chave_normalizada text GENERATED ALWAYS AS (
    lower(regexp_replace(coalesce(chave, ''), '[^a-z0-9]+', '_', 'g'))
  ) STORED,
  nome text NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  metadados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT NOW(),
  atualizado_por uuid,
  UNIQUE (empresa_id, modulo_id, chave_normalizada)
);

CREATE INDEX IF NOT EXISTS configuracoes_submodulos_lookup_idx
  ON public.configuracoes_submodulos (empresa_id, modulo_id, ativo, ordem);

CREATE TRIGGER configuracoes_submodulos_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_submodulos
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

-- ----------------------------------------------------------------------------
-- Tabela: configuracoes_ferramentas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_ferramentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL DEFAULT public.current_empresa(),
  modulo_id uuid REFERENCES public.configuracoes_modulos(id) ON DELETE SET NULL,
  submodulo_id uuid REFERENCES public.configuracoes_submodulos(id) ON DELETE SET NULL,
  chave text NOT NULL,
  chave_normalizada text GENERATED ALWAYS AS (
    lower(regexp_replace(coalesce(chave, ''), '[^a-z0-9]+', '_', 'g'))
  ) STORED,
  nome text NOT NULL,
  icone text,
  tipo text,
  parametros jsonb NOT NULL DEFAULT '{}'::jsonb,
  enriquecimentos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT NOW(),
  atualizado_por uuid,
  UNIQUE (empresa_id, chave_normalizada)
);

CREATE INDEX IF NOT EXISTS configuracoes_ferramentas_lookup_idx
  ON public.configuracoes_ferramentas (empresa_id, modulo_id, submodulo_id, ativo);

CREATE TRIGGER configuracoes_ferramentas_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_ferramentas
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

-- ----------------------------------------------------------------------------
-- Tabela: configuracoes_usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  empresa_id uuid NOT NULL DEFAULT public.current_empresa(),
  modulo_chave text NOT NULL,
  submodulo_chave text,
  submodulo_chave_norm text GENERATED ALWAYS AS (
    lower(regexp_replace(coalesce(submodulo_chave, ''), '[^a-z0-9]+', '_', 'g'))
  ) STORED,
  visivel boolean NOT NULL DEFAULT true,
  fixado boolean NOT NULL DEFAULT false,
  layout_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  filtros jsonb NOT NULL DEFAULT '{}'::jsonb,
  ferramentas_habilitadas jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT NOW(),
  atualizado_por uuid,
  UNIQUE (user_id, empresa_id, modulo_chave, submodulo_chave_norm)
);

CREATE INDEX IF NOT EXISTS configuracoes_usuarios_usuario_idx
  ON public.configuracoes_usuarios (user_id, empresa_id, modulo_chave);

CREATE TRIGGER configuracoes_usuarios_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_usuarios
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

-- ----------------------------------------------------------------------------
-- Tabela: configuracoes_flags
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuracoes_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escopo text NOT NULL DEFAULT 'global' CHECK (escopo IN ('global', 'empresa', 'usuario')),
  empresa_id uuid DEFAULT public.current_empresa(),
  user_id uuid,
  empresa_id_normalizada uuid GENERATED ALWAYS AS (
    COALESCE(empresa_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) STORED,
  user_id_normalizado uuid GENERATED ALWAYS AS (
    COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) STORED,
  chave text NOT NULL,
  chave_normalizada text GENERATED ALWAYS AS (
    lower(regexp_replace(coalesce(chave, ''), '[^a-z0-9]+', '_', 'g'))
  ) STORED,
  habilitada boolean NOT NULL DEFAULT true,
  metadados jsonb NOT NULL DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT NOW(),
  criado_por uuid,
  atualizado_em timestamptz NOT NULL DEFAULT NOW(),
  atualizado_por uuid,
  UNIQUE (escopo, empresa_id_normalizada, user_id_normalizado, chave_normalizada)
);

CREATE INDEX IF NOT EXISTS configuracoes_flags_lookup_idx
  ON public.configuracoes_flags (escopo, empresa_id, user_id, chave_normalizada);

CREATE TRIGGER configuracoes_flags_audit_trg
BEFORE INSERT OR UPDATE ON public.configuracoes_flags
FOR EACH ROW EXECUTE FUNCTION public.aplicar_auditoria_configuracoes();

-- ----------------------------------------------------------------------------
-- RLS - configuracoes_modulos / submodulos / ferramentas
-- ----------------------------------------------------------------------------
ALTER TABLE public.configuracoes_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_submodulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_ferramentas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_modulos' AND policyname = 'configuracoes_modulos_empresa'
  ) THEN
    CREATE POLICY configuracoes_modulos_empresa
      ON public.configuracoes_modulos
      FOR ALL
      USING (empresa_id = public.current_empresa())
      WITH CHECK (empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_modulos' AND policyname = 'configuracoes_modulos_service_role'
  ) THEN
    CREATE POLICY configuracoes_modulos_service_role
      ON public.configuracoes_modulos
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_submodulos' AND policyname = 'configuracoes_submodulos_empresa'
  ) THEN
    CREATE POLICY configuracoes_submodulos_empresa
      ON public.configuracoes_submodulos
      FOR ALL
      USING (empresa_id = public.current_empresa())
      WITH CHECK (empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_submodulos' AND policyname = 'configuracoes_submodulos_service_role'
  ) THEN
    CREATE POLICY configuracoes_submodulos_service_role
      ON public.configuracoes_submodulos
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_ferramentas' AND policyname = 'configuracoes_ferramentas_empresa'
  ) THEN
    CREATE POLICY configuracoes_ferramentas_empresa
      ON public.configuracoes_ferramentas
      FOR ALL
      USING (empresa_id = public.current_empresa())
      WITH CHECK (empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_ferramentas' AND policyname = 'configuracoes_ferramentas_service_role'
  ) THEN
    CREATE POLICY configuracoes_ferramentas_service_role
      ON public.configuracoes_ferramentas
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- RLS - configuracoes_usuarios
-- ----------------------------------------------------------------------------
ALTER TABLE public.configuracoes_usuarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_usuarios' AND policyname = 'configuracoes_usuarios_proprietario'
  ) THEN
    CREATE POLICY configuracoes_usuarios_proprietario
      ON public.configuracoes_usuarios
      FOR ALL
      USING (user_id = auth.uid() AND empresa_id = public.current_empresa())
      WITH CHECK (user_id = auth.uid() AND empresa_id = public.current_empresa());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_usuarios' AND policyname = 'configuracoes_usuarios_service_role'
  ) THEN
    CREATE POLICY configuracoes_usuarios_service_role
      ON public.configuracoes_usuarios
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- RLS - configuracoes_flags
-- ----------------------------------------------------------------------------
ALTER TABLE public.configuracoes_flags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_flags' AND policyname = 'configuracoes_flags_leitura'
  ) THEN
    CREATE POLICY configuracoes_flags_leitura
      ON public.configuracoes_flags
      FOR SELECT
      USING (
        (escopo = 'global') OR
        (escopo = 'empresa' AND empresa_id = public.current_empresa()) OR
        (escopo = 'usuario' AND user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'configuracoes_flags' AND policyname = 'configuracoes_flags_service_role'
  ) THEN
    CREATE POLICY configuracoes_flags_service_role
      ON public.configuracoes_flags
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

