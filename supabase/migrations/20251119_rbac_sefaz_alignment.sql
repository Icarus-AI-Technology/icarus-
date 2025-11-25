-- ============================================
-- Migration: 20251119 - RBAC & SEFAZ Alignment
-- Objetivo: liberar insert tipado via aliases (user_roles/user_sessions)
--           e permitir que serviços SEFAZ omitam empresa_id (defaults)
-- ============================================

BEGIN;

-- =====================================================
-- 1. user_roles: permitir alias EN/pt na tipagem
-- =====================================================
ALTER TABLE public.user_roles
  ALTER COLUMN usuario_id DROP NOT NULL;

ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_identifier_check;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_identifier_check
  CHECK (COALESCE(user_id, usuario_id) IS NOT NULL);

CREATE OR REPLACE FUNCTION public.sync_user_roles_alias_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- user_id ↔ usuario_id
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.usuario_id;
  END IF;
  IF NEW.usuario_id IS NULL THEN
    NEW.usuario_id := NEW.user_id;
  END IF;

  -- is_active ↔ ativo
  IF NEW.is_active IS NULL THEN
    NEW.is_active := COALESCE(NEW.ativo, TRUE);
  END IF;
  IF NEW.ativo IS NULL THEN
    NEW.ativo := NEW.is_active;
  END IF;

  -- assigned_by ↔ atribuido_por_id
  IF NEW.assigned_by IS NULL THEN
    NEW.assigned_by := NEW.atribuido_por_id;
  END IF;
  IF NEW.atribuido_por_id IS NULL THEN
    NEW.atribuido_por_id := NEW.assigned_by;
  END IF;

  -- valid_until ↔ data_fim
  IF NEW.valid_until IS NULL THEN
    NEW.valid_until := NEW.data_fim;
  END IF;
  IF NEW.data_fim IS NULL THEN
    NEW.data_fim := NEW.valid_until;
  END IF;

  -- created_at / updated_at ↔ atribuido_em
  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.atribuido_em, NOW());
  END IF;
  IF NEW.atribuido_em IS NULL THEN
    NEW.atribuido_em := NEW.created_at;
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- =====================================================
-- 2. user_sessions: colunas esperadas pelo RBACService
-- =====================================================
DROP VIEW IF EXISTS public.vw_active_sessions;

ALTER TABLE public.user_sessions
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '8 hours'),
  ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terminated_by UUID REFERENCES public.usuarios(id),
  ADD COLUMN IF NOT EXISTS termination_reason TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.user_sessions
  ALTER COLUMN ip_address TYPE TEXT USING ip_address::TEXT;

UPDATE public.user_sessions
SET
  user_id = COALESCE(user_id, usuario_id),
  is_active = COALESCE(is_active, CASE WHEN termino_em IS NULL THEN TRUE ELSE FALSE END),
  expires_at = COALESCE(expires_at, NOW() + INTERVAL '8 hours'),
  created_at = COALESCE(created_at, inicio_em, NOW()),
  updated_at = COALESCE(updated_at, inicio_em, NOW());

CREATE OR REPLACE FUNCTION public.sync_user_sessions_alias()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.usuario_id;
  END IF;
  IF NEW.usuario_id IS NULL THEN
    NEW.usuario_id := NEW.user_id;
  END IF;

  IF NEW.created_at IS NULL THEN
    NEW.created_at := COALESCE(NEW.inicio_em, NOW());
  END IF;
  IF NEW.inicio_em IS NULL THEN
    NEW.inicio_em := NEW.created_at;
  END IF;

  IF NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.inicio_em + INTERVAL '8 hours';
  END IF;

  IF NEW.is_active IS NULL THEN
    NEW.is_active := CASE WHEN NEW.termino_em IS NULL THEN TRUE ELSE FALSE END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_sessions_alias ON public.user_sessions;
CREATE TRIGGER trg_sync_user_sessions_alias
  BEFORE INSERT OR UPDATE ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_sessions_alias();

-- View usada por getActiveSessions()
CREATE VIEW public.vw_active_sessions AS
SELECT
  us.id,
  COALESCE(us.user_id, us.usuario_id) AS user_id,
  us.session_token,
  us.ip_address,
  us.user_agent,
  us.dispositivo,
  us.navegador,
  us.sistema_operacional,
  us.localizacao,
  us.inicio_em,
  us.expires_at,
  us.termino_em,
  us.is_active,
  us.termination_reason
FROM public.user_sessions us
WHERE COALESCE(us.is_active, TRUE) = TRUE
  AND COALESCE(us.expires_at, NOW()) > NOW();

-- =====================================================
-- 3. SEFAZ: defaults multi-tenant
-- =====================================================
ALTER TABLE public.configuracoes_nfe
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

ALTER TABLE public.notas_fiscais
  ALTER COLUMN empresa_id SET DEFAULT public.current_empresa();

COMMIT;
