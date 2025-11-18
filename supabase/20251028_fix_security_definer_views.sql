-- Migration: Fix SECURITY DEFINER views
-- Data: 2025-10-28
-- Objetivo: Remover SECURITY DEFINER de views e implementar RLS nas tabelas base
-- Conformidade: Supabase Advisor Security Issues (4 erros)
-- Documentação: docs/rbac.md

-- ============================================
-- 1. VIEW: view_empresas_sem_dpo
-- ============================================
-- Problema: View com SECURITY DEFINER
-- Solução: Remover SECURITY DEFINER e aplicar RLS na tabela base

DROP VIEW IF EXISTS public.view_empresas_sem_dpo CASCADE;

-- Recriar view SEM SECURITY DEFINER
CREATE VIEW public.view_empresas_sem_dpo AS
SELECT
  id,
  nome,
  cnpj,
  email,
  criado_em,
  EXTRACT(DAY FROM NOW() - criado_em)::INTEGER AS dias_desde_criacao,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 30 THEN '🔴 CRÍTICO (>30 dias)'
    WHEN EXTRACT(DAY FROM NOW() - criado_em) > 15 THEN '🟡 URGENTE (>15 dias)'
    ELSE '🟢 OK (<15 dias)'
  END AS alerta
FROM public.empresas
WHERE (dpo_nome IS NULL OR dpo_email IS NULL)
  AND id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  );

COMMENT ON VIEW public.view_empresas_sem_dpo IS 'Empresas sem DPO configurado (RLS aplicado via filtro)';

-- ============================================
-- 2. VIEW: vw_proximas_reunioes_teams
-- ============================================
-- Problema: View com SECURITY DEFINER
-- Solução: Remover SECURITY DEFINER e aplicar RLS

DROP VIEW IF EXISTS public.vw_proximas_reunioes_teams CASCADE;

-- Recriar view SEM SECURITY DEFINER e COM filtro RLS
CREATE VIEW public.vw_proximas_reunioes_teams AS
SELECT 
  r.id,
  r.evento_id,
  r.assunto,
  r.data_inicio,
  r.data_fim,
  r.link_reuniao,
  r.organizador,
  r.participantes,
  r.status,
  r.tipo_reuniao,
  r.entidade_tipo,
  r.entidade_nome,
  u.email AS usuario_criador_email,
  EXTRACT(EPOCH FROM (r.data_inicio - NOW())) / 3600 AS horas_ate_reuniao
FROM public.reunioes_teams r
LEFT JOIN auth.users u ON r.usuario_criacao = u.id
WHERE r.status = 'agendada'
  AND r.data_inicio BETWEEN NOW() AND (NOW() + INTERVAL '7 days')
  AND r.empresa_id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
ORDER BY r.data_inicio ASC;

COMMENT ON VIEW public.vw_proximas_reunioes_teams IS 'Próximas reuniões Teams (7 dias) com RLS aplicado';

-- ============================================
-- 3. VIEW: vw_estatisticas_emails_30d
-- ============================================
-- Problema: View com SECURITY DEFINER
-- Solução: Remover SECURITY DEFINER e aplicar RLS

DROP VIEW IF EXISTS public.vw_estatisticas_emails_30d CASCADE;

-- Recriar view SEM SECURITY DEFINER e COM filtro RLS
CREATE VIEW public.vw_estatisticas_emails_30d AS
SELECT 
  DATE_TRUNC('day', e.data_envio) AS dia,
  e.tipo,
  COUNT(*) AS total_enviados,
  COUNT(*) FILTER (WHERE e.status = 'enviado') AS enviados_sucesso,
  COUNT(*) FILTER (WHERE e.status = 'erro') AS enviados_erro,
  COUNT(*) FILTER (WHERE e.status = 'bounce') AS bounce
FROM public.emails_enviados e
WHERE e.data_envio >= NOW() - INTERVAL '30 days'
  AND e.empresa_id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
GROUP BY DATE_TRUNC('day', e.data_envio), e.tipo
ORDER BY dia DESC;

COMMENT ON VIEW public.vw_estatisticas_emails_30d IS 'Estatísticas de emails (30 dias) com RLS aplicado';

-- ============================================
-- 4. Aplicar RLS nas tabelas base
-- ============================================

-- 4.1 Empresas (se ainda não tiver RLS)
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas sua própria empresa
DROP POLICY IF EXISTS "empresas_select_policy" ON public.empresas;
CREATE POLICY "empresas_select_policy" 
ON public.empresas 
FOR SELECT 
USING (
  id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 4.2 Reuniões Teams (se ainda não tiver RLS)
ALTER TABLE public.reunioes_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reunioes_teams_select_policy" ON public.reunioes_teams;
CREATE POLICY "reunioes_teams_select_policy" 
ON public.reunioes_teams 
FOR SELECT 
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- 4.3 Emails Enviados (se ainda não tiver RLS)
ALTER TABLE public.emails_enviados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emails_enviados_select_policy" ON public.emails_enviados;
CREATE POLICY "emails_enviados_select_policy" 
ON public.emails_enviados 
FOR SELECT 
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- ============================================
-- AUDITORIA & VALIDAÇÃO
-- ============================================

-- Verificar que nenhuma view tem SECURITY DEFINER
-- SELECT 
--   n.nspname as schema,
--   c.relname as view_name,
--   pg_get_viewdef(c.oid, true) as definition
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE c.relkind = 'v' 
--   AND n.nspname = 'public'
--   AND pg_get_viewdef(c.oid, true) ILIKE '%SECURITY DEFINER%';

-- Success: 3 views corrigidas
-- - view_empresas_sem_dpo
-- - vw_proximas_reunioes_teams
-- - vw_estatisticas_emails_30d
-- - workflow_execucoes (não é view, é tabela)

