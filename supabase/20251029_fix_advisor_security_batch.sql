-- Migration: 20251029_fix_advisor_security_batch.sql
-- Objetivo: Corrigir avisos de segurança do Advisor para views e funções
--  - Recriar views suspeitas SEM SECURITY DEFINER e com filtros RLS quando possível
--  - Garantir funções com search_path fixo (já coberto em 20251028_fix_search_path_functions.sql)

-- 1) Views: vw_proximas_reunioes_teams(_public?)
DO $$
DECLARE
  v_has_reunioes boolean;
  v_has_status boolean;
  v_has_data_inicio boolean;
  v_has_empresa_id boolean;
  v_view_name text;
  v_sql text;
BEGIN
  SELECT to_regclass('public.reunioes_teams') IS NOT NULL INTO v_has_reunioes;
  IF v_has_reunioes THEN
    -- Detectar qual view existe no ambiente
    IF to_regclass('public.vw_proximas_reunioes_teams_public') IS NOT NULL THEN
      v_view_name := 'vw_proximas_reunioes_teams_public';
    ELSIF to_regclass('public.vw_proximas_reunioes_teams') IS NOT NULL THEN
      v_view_name := 'vw_proximas_reunioes_teams';
    END IF;

    IF v_view_name IS NOT NULL THEN
      EXECUTE format('DROP VIEW IF EXISTS public.%I CASCADE', v_view_name);

      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='reunioes_teams' AND column_name='status'
      ) INTO v_has_status;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='reunioes_teams' AND column_name='data_inicio'
      ) INTO v_has_data_inicio;
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='reunioes_teams' AND column_name='empresa_id'
      ) INTO v_has_empresa_id;

      v_sql := 'CREATE VIEW public.'||quote_ident(v_view_name)||' AS SELECT r.* FROM public.reunioes_teams r WHERE TRUE';
      IF v_has_status THEN
        v_sql := v_sql || ' AND r.status = ''agendada''';
      END IF;
      IF v_has_data_inicio THEN
        v_sql := v_sql || ' AND r.data_inicio BETWEEN NOW() AND (NOW() + INTERVAL ''7 days'')';
      END IF;
      IF v_has_empresa_id THEN
        v_sql := v_sql || ' AND r.empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())';
      END IF;

      EXECUTE v_sql;
      RAISE NOTICE 'Recreated view %', v_view_name;
    END IF;
  END IF;
END $$;

-- 2) View: vw_estatisticas_emails_30d
DO $$
DECLARE
  v_has_emails boolean;
  v_has_empresa_id boolean;
  v_has_data_envio boolean;
  v_has_status boolean;
BEGIN
  SELECT to_regclass('public.emails_enviados') IS NOT NULL INTO v_has_emails;
  IF v_has_emails THEN
    DROP VIEW IF EXISTS public.vw_estatisticas_emails_30d CASCADE;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='emails_enviados' AND column_name='empresa_id'
    ) INTO v_has_empresa_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='emails_enviados' AND column_name='data_envio'
    ) INTO v_has_data_envio;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='emails_enviados' AND column_name='status'
    ) INTO v_has_status;

    IF v_has_data_envio THEN
      EXECUTE '
        CREATE VIEW public.vw_estatisticas_emails_30d AS
        SELECT 
          DATE_TRUNC(''day'', e.data_envio) AS dia,
          e.tipo,
          COUNT(*) AS total_enviados,
          ' || CASE WHEN v_has_status THEN 'COUNT(*) FILTER (WHERE e.status = ''enviado'') AS enviados_sucesso,' ELSE '0::bigint AS enviados_sucesso,' END || '
          ' || CASE WHEN v_has_status THEN 'COUNT(*) FILTER (WHERE e.status = ''erro'') AS enviados_erro,' ELSE '0::bigint AS enviados_erro,' END || '
          ' || CASE WHEN v_has_status THEN 'COUNT(*) FILTER (WHERE e.status = ''bounce'') AS bounce' ELSE '0::bigint AS bounce' END || '
        FROM public.emails_enviados e
        ' || CASE WHEN v_has_empresa_id THEN 'WHERE e.data_envio >= NOW() - INTERVAL ''30 days'' AND e.empresa_id IN (SELECT empresa_id FROM public.profiles WHERE id = auth.uid())' ELSE 'WHERE e.data_envio >= NOW() - INTERVAL ''30 days''' END || '
        GROUP BY DATE_TRUNC(''day'', e.data_envio), e.tipo
        ORDER BY dia DESC';
      RAISE NOTICE 'Recreated view vw_estatisticas_emails_30d';
    ELSE
      RAISE NOTICE 'Skipped vw_estatisticas_emails_30d (missing data_envio)';
    END IF;
  END IF;
END $$;

-- 3) View: view_empresas_sem_dpo
DO $$
DECLARE
  v_has_empresas boolean;
BEGIN
  SELECT to_regclass('public.empresas') IS NOT NULL INTO v_has_empresas;
  IF v_has_empresas THEN
    DROP VIEW IF EXISTS public.view_empresas_sem_dpo CASCADE;
    EXECUTE '
      CREATE VIEW public.view_empresas_sem_dpo AS
      SELECT
        id,
        nome,
        cnpj,
        email,
        criado_em,
        EXTRACT(DAY FROM NOW() - criado_em)::INTEGER AS dias_desde_criacao
      FROM public.empresas
      WHERE (dpo_nome IS NULL OR dpo_email IS NULL)
        AND id IN (
          SELECT empresa_id FROM public.profiles WHERE id = auth.uid()
        )';
    RAISE NOTICE 'Recreated view view_empresas_sem_dpo';
  END IF;
END $$;


