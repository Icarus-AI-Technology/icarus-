-- ============================================
-- Migration: 20251118 - RBAC Alias Columns & Views
-- Objetivo: alinhar o schema do Supabase com os serviços RBAC do frontend
-- - Adiciona colunas esperadas (ingles) para roles/permissions/user_roles
-- - Cria gatilhos para manter colunas PT-BR e EN sincronizadas
-- - Recria a view vw_user_permissions e a função user_has_permission
-- ============================================

BEGIN;

-- =====================================================
-- 1. ROLES: alias columns
-- =====================================================
ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS tipo_role TEXT DEFAULT 'operacional',
  ADD COLUMN IF NOT EXISTS nivel_hierarquia INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.roles DISABLE TRIGGER trg_roles_updated;

UPDATE public.roles
SET
  tipo_role = COALESCE(tipo_role, 'operacional'),
  nivel_hierarquia = COALESCE(nivel_hierarquia, GREATEST(1, nivel)),
  is_active = COALESCE(is_active, TRUE);

ALTER TABLE public.roles ENABLE TRIGGER trg_roles_updated;

-- =====================================================
-- 2. PERMISSIONS: alias columns
-- =====================================================
ALTER TABLE public.permissions
  ADD COLUMN IF NOT EXISTS modulo TEXT DEFAULT 'geral',
  ADD COLUMN IF NOT EXISTS nivel_criticidade TEXT DEFAULT 'medio',
  ADD COLUMN IF NOT EXISTS requer_2fa BOOLEAN DEFAULT FALSE;

UPDATE public.permissions
SET
  modulo = COALESCE(modulo, recurso),
  nivel_criticidade = COALESCE(nivel_criticidade, 'medio'),
  requer_2fa = COALESCE(requer_2fa, FALSE);

-- =====================================================
-- 3. USER_ROLES: alias columns + sync trigger
-- =====================================================
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS assigned_by UUID,
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.user_roles
SET
  user_id = COALESCE(user_id, usuario_id),
  assigned_by = COALESCE(assigned_by, atribuido_por_id),
  valid_until = COALESCE(valid_until, data_fim),
  is_active = COALESCE(is_active, ativo, TRUE),
  created_at = COALESCE(created_at, atribuido_em, NOW()),
  updated_at = COALESCE(updated_at, atribuido_em, NOW());

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
  NEW.updated_at := COALESCE(NEW.updated_at, NOW());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_roles_alias ON public.user_roles;
CREATE TRIGGER trg_sync_user_roles_alias
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_roles_alias_columns();

-- Índices úteis para as novas colunas
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_en ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active_en ON public.user_roles(is_active);

-- =====================================================
-- 4. VIEW vw_user_permissions
-- =====================================================
DROP VIEW IF EXISTS public.vw_user_permissions;

CREATE VIEW public.vw_user_permissions AS
WITH role_permissions_expanded AS (
  SELECT
    COALESCE(ur.user_id, ur.usuario_id) AS user_id,
    rp.permission_id,
    p.codigo,
    p.nome,
    p.modulo,
    p.acao,
    p.nivel_criticidade,
    p.requer_2fa
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role_id = ur.role_id
  JOIN public.permissions p ON p.id = rp.permission_id
  WHERE COALESCE(ur.is_active, ur.ativo, TRUE) = TRUE
),
override_grants AS (
  SELECT
    o.user_id,
    o.permission_id,
    p.codigo,
    p.nome,
    p.modulo,
    p.acao,
    p.nivel_criticidade,
    p.requer_2fa
  FROM public.user_permissions_override o
  JOIN public.permissions p ON p.id = o.permission_id
  WHERE o.is_active = TRUE
    AND o.tipo_override = 'grant'
    AND (o.valid_until IS NULL OR o.valid_until > NOW())
),
override_revokes AS (
  SELECT DISTINCT o.user_id, o.permission_id
  FROM public.user_permissions_override o
  WHERE o.is_active = TRUE
    AND o.tipo_override = 'revoke'
    AND (o.valid_until IS NULL OR o.valid_until > NOW())
)
SELECT *
FROM role_permissions_expanded rpe
WHERE NOT EXISTS (
  SELECT 1
  FROM override_revokes orv
  WHERE orv.user_id = rpe.user_id
    AND orv.permission_id = rpe.permission_id
)
UNION
SELECT * FROM override_grants;

COMMENT ON VIEW public.vw_user_permissions IS 'Permissões efetivas (roles + overrides) para cada usuário';

-- =====================================================
-- 5. RPC user_has_permission
-- =====================================================
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_code TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  resultado BOOLEAN;
BEGIN
  SELECT TRUE
  INTO resultado
  FROM public.vw_user_permissions
  WHERE user_id = p_user_id
    AND codigo = p_permission_code
  LIMIT 1;

  RETURN COALESCE(resultado, FALSE);
END;
$$ SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.user_has_permission(UUID, TEXT) TO authenticated, service_role, anon;

COMMIT;


