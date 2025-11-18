-- Migration: Fix search_path in SECURITY DEFINER functions
-- Data: 2025-10-28
-- Objetivo: Adicionar SET search_path = public, pg_temp em todas as funções SECURITY DEFINER
-- Conformidade: Supabase Advisor Security Issues (6 warnings)
-- Documentação: docs/api/functions.md

-- ============================================
-- 1. get_current_user_id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

COMMENT ON FUNCTION public.get_current_user_id() IS 'Retorna o ID do usuário autenticado (search_path fixado)';

-- ============================================
-- 2. get_current_user_empresa_id
-- ============================================
CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$;

COMMENT ON FUNCTION public.get_current_user_empresa_id() IS 'Retorna a empresa_id do usuário autenticado (search_path fixado)';

-- ============================================
-- 3. get_dashboard_kpis
-- ============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_kpis()
RETURNS TABLE (kpi text, media_valor numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    md.origem AS kpi, 
    AVG(md.valor) AS media_valor
  FROM public.metricas_dashboard md
  WHERE md.data_referencia >= NOW() - INTERVAL '30 days'
  GROUP BY md.origem;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_kpis() IS 'Retorna KPIs do dashboard (30 dias) com search_path fixado';

-- ============================================
-- 4. calcular_score_global_abbott
-- ============================================
CREATE OR REPLACE FUNCTION public.calcular_score_global_abbott()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_score numeric;
BEGIN
  SELECT AVG(valor)
  INTO v_score
  FROM public.metricas_dashboard
  WHERE origem = 'abbott' 
    AND data_referencia >= NOW() - INTERVAL '30 days';

  RETURN COALESCE(v_score, 0);
END;
$$;

COMMENT ON FUNCTION public.calcular_score_global_abbott() IS 'Calcula score Abbott (30 dias) com search_path fixado';

-- ============================================
-- 5. atualizar_metricas_consignacao
-- ============================================
CREATE OR REPLACE FUNCTION public.atualizar_metricas_consignacao()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.remessas_consignacao rc
  SET
    valor_total = COALESCE(sub.valor_total, 0),
    atualizado_em = NOW()
  FROM (
    SELECT 
      remessa_consignacao_id,
      SUM(valor_total) AS valor_total
    FROM public.itens_consignacao
    GROUP BY remessa_consignacao_id
  ) sub
  WHERE rc.id = sub.remessa_consignacao_id;
END;
$$;

COMMENT ON FUNCTION public.atualizar_metricas_consignacao() IS 'Atualiza métricas de consignação com search_path fixado';

-- ============================================
-- 6. compute_audit_hash
-- ============================================
CREATE OR REPLACE FUNCTION public.compute_audit_hash(
  p_empresa_id uuid,
  p_usuario_id uuid,
  p_tabela text,
  p_registro_id uuid,
  p_acao text,
  p_dados_antes jsonb,
  p_dados_depois jsonb,
  p_salt text DEFAULT ''
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payload bytea;
BEGIN
  v_payload := convert_to(
    concat_ws('|',
      coalesce(p_empresa_id::text, ''),
      coalesce(p_usuario_id::text, ''),
      coalesce(p_tabela, ''),
      coalesce(p_registro_id::text, ''),
      coalesce(p_acao, ''),
      coalesce(p_dados_antes::text, ''),
      coalesce(p_dados_depois::text, ''),
      coalesce(p_salt, '')
    ),
    'UTF8'
  );

  RETURN encode(extensions.digest(v_payload, 'sha256'), 'hex');
END;
$$;

COMMENT ON FUNCTION public.compute_audit_hash(uuid, uuid, text, uuid, text, jsonb, jsonb, text) IS 'Calcula hash SHA256 para auditoria com search_path fixado';

-- ============================================
-- AUDITORIA & VALIDAÇÃO
-- ============================================

-- Verificar que todas as funções SECURITY DEFINER têm search_path
-- SELECT 
--   n.nspname as schema,
--   p.proname as function_name,
--   pg_get_functiondef(p.oid) as definition
-- FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public'
--   AND pg_get_functiondef(p.oid) ILIKE '%SECURITY DEFINER%'
--   AND pg_get_functiondef(p.oid) NOT ILIKE '%SET search_path%';

-- Success: 6 funções corrigidas
-- - get_current_user_id
-- - get_current_user_empresa_id
-- - get_dashboard_kpis
-- - calcular_score_global_abbott
-- - atualizar_metricas_consignacao
-- - compute_audit_hash

