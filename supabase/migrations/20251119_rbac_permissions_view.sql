-- ============================================
-- Migration: 20251119 - RBAC Permissions View Alignment
-- Objetivo: expor coluna id esperada pelo frontend em vw_user_permissions
-- ============================================

BEGIN;

DROP VIEW IF EXISTS public.vw_user_permissions;

CREATE VIEW public.vw_user_permissions AS
WITH role_permissions_expanded AS (
  SELECT
    COALESCE(ur.user_id, ur.usuario_id) AS user_id,
    rp.permission_id,
    rp.permission_id AS id,
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
    o.permission_id AS id,
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

COMMENT ON VIEW public.vw_user_permissions IS 'Permissões efetivas (roles + overrides) com o id esperado pelo frontend';

COMMIT;
