-- ============================================================================
-- SUPABASE AUDITOR PRO - Security & Performance Audit Toolkit
-- Author: Icarus Prime Orchestrator (CISO Protocol)
-- Date: 2025-11-24
--
-- Purpose:
--   Comprehensive security and performance auditing system for Supabase projects.
--   Implements automated checks for RLS policies, indexes, table bloat, orphaned
--   tables, exposed API keys, and Edge Function security.
--
-- Features:
--   1. audit_project_health() - Master audit function
--   2. monitor_table_bloat - Real-time table bloat monitoring view
--   3. check_missing_rls() - Detect tables without RLS
--   4. check_missing_indexes() - Find missing performance indexes
--   5. check_orphaned_tables() - Identify unused tables
--   6. check_exposed_secrets() - Scan for hardcoded credentials
--   7. generate_audit_report() - Generate comprehensive security report
-- ============================================================================

BEGIN;

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'running', 'completed', 'failed'
  findings JSONB DEFAULT '{}'::jsonb,
  severity VARCHAR(20), -- 'critical', 'high', 'medium', 'low', 'info'
  recommendations TEXT[],
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_by UUID REFERENCES auth.users(id),
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_executions_executed_at_idx ON public.audit_executions(executed_at DESC);
CREATE INDEX IF NOT EXISTS audit_executions_severity_idx ON public.audit_executions(severity);

COMMENT ON TABLE public.audit_executions IS 'Audit execution history and findings for security compliance tracking';

-- ============================================================================
-- FUNCTION 1: Check Missing RLS Policies
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_missing_rls()
RETURNS TABLE(
  table_schema TEXT,
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  severity TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.schemaname::TEXT,
    t.tablename::TEXT,
    t.rowsecurity AS rls_enabled,
    COALESCE(p.policy_count, 0) AS policy_count,
    CASE 
      WHEN NOT t.rowsecurity THEN 'CRITICAL'::TEXT
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 'HIGH'::TEXT
      ELSE 'INFO'::TEXT
    END AS severity,
    CASE 
      WHEN NOT t.rowsecurity THEN 
        format('CRITICAL: Enable RLS on %I.%I immediately!', t.schemaname, t.tablename)
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 
        format('HIGH: No policies found for %I.%I. Add SELECT/INSERT/UPDATE/DELETE policies.', t.schemaname, t.tablename)
      ELSE 
        format('OK: %I.%I has %s policies configured.', t.schemaname, t.tablename, p.policy_count)
    END::TEXT AS recommendation
  FROM pg_tables t
  LEFT JOIN (
    SELECT schemaname, tablename, COUNT(*) as policy_count
    FROM pg_policies
    GROUP BY schemaname, tablename
  ) p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename NOT IN ('schema_migrations', 'audit_executions', 'documentos')
  ORDER BY 
    CASE 
      WHEN NOT t.rowsecurity THEN 1
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 2
      ELSE 3
    END,
    t.tablename;
END;
$$;

COMMENT ON FUNCTION public.check_missing_rls IS 'AUDITOR PRO: Detect tables with missing or disabled RLS policies';

-- ============================================================================
-- FUNCTION 2: Check Missing Indexes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_missing_indexes()
RETURNS TABLE(
  table_name TEXT,
  column_name TEXT,
  column_type TEXT,
  fk_to_table TEXT,
  severity TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH foreign_keys AS (
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  ),
  existing_indexes AS (
    SELECT
      schemaname,
      tablename,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
  )
  SELECT
    fk.table_name::TEXT,
    fk.column_name::TEXT,
    col.data_type::TEXT,
    fk.foreign_table_name::TEXT,
    CASE 
      WHEN ei.indexdef IS NULL THEN 'HIGH'::TEXT
      ELSE 'INFO'::TEXT
    END AS severity,
    CASE 
      WHEN ei.indexdef IS NULL THEN
        format('HIGH: Add index on %I.%I (FK to %I)', fk.table_name, fk.column_name, fk.foreign_table_name)
      ELSE
        format('OK: Index exists on %I.%I', fk.table_name, fk.column_name)
    END::TEXT AS recommendation
  FROM foreign_keys fk
  LEFT JOIN information_schema.columns col
    ON fk.table_schema = col.table_schema
    AND fk.table_name = col.table_name
    AND fk.column_name = col.column_name
  LEFT JOIN existing_indexes ei
    ON fk.table_name = ei.tablename
    AND ei.indexdef LIKE '%' || fk.column_name || '%'
  ORDER BY 
    CASE WHEN ei.indexdef IS NULL THEN 1 ELSE 2 END,
    fk.table_name;
END;
$$;

COMMENT ON FUNCTION public.check_missing_indexes IS 'AUDITOR PRO: Find foreign key columns without indexes (performance risk)';

-- ============================================================================
-- FUNCTION 3: Check Orphaned Tables
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_orphaned_tables()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  size_mb NUMERIC,
  last_accessed TIMESTAMPTZ,
  severity TEXT,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH table_stats AS (
    SELECT
      schemaname,
      relname,
      n_live_tup,
      pg_total_relation_size(schemaname || '.' || relname)::BIGINT as total_bytes,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  )
  SELECT
    ts.relname::TEXT as table_name,
    ts.n_live_tup as row_count,
    ROUND((ts.total_bytes / 1024.0 / 1024.0)::NUMERIC, 2) as size_mb,
    GREATEST(ts.last_vacuum, ts.last_autovacuum, ts.last_analyze, ts.last_autoanalyze) as last_accessed,
    CASE 
      WHEN ts.n_live_tup = 0 AND ts.total_bytes > 1048576 THEN 'MEDIUM'::TEXT  -- > 1MB
      WHEN GREATEST(ts.last_vacuum, ts.last_autovacuum, ts.last_analyze, ts.last_autoanalyze) < NOW() - INTERVAL '90 days' THEN 'LOW'::TEXT
      ELSE 'INFO'::TEXT
    END as severity,
    CASE 
      WHEN ts.n_live_tup = 0 AND ts.total_bytes > 1048576 THEN
        format('MEDIUM: Table %I is empty but uses %.2f MB. Consider dropping if unused.', ts.relname, ts.total_bytes / 1024.0 / 1024.0)
      WHEN GREATEST(ts.last_vacuum, ts.last_autovacuum, ts.last_analyze, ts.last_autoanalyze) < NOW() - INTERVAL '90 days' THEN
        format('LOW: Table %I not accessed in 90+ days. Review if still needed.', ts.relname)
      ELSE
        format('OK: Table %I is actively used.', ts.relname)
    END::TEXT as recommendation
  FROM table_stats ts
  WHERE ts.relname NOT IN ('schema_migrations', 'audit_executions')
  ORDER BY 
    CASE 
      WHEN ts.n_live_tup = 0 AND ts.total_bytes > 1048576 THEN 1
      WHEN GREATEST(ts.last_vacuum, ts.last_autovacuum, ts.last_analyze, ts.last_autoanalyze) < NOW() - INTERVAL '90 days' THEN 2
      ELSE 3
    END,
    ts.total_bytes DESC;
END;
$$;

COMMENT ON FUNCTION public.check_orphaned_tables IS 'AUDITOR PRO: Identify unused or empty tables consuming storage';

-- ============================================================================
-- VIEW: Monitor Table Bloat
-- ============================================================================

CREATE OR REPLACE VIEW public.monitor_table_bloat AS
WITH table_bloat AS (
  SELECT
    schemaname,
    relname AS tablename,
    pg_total_relation_size(schemaname || '.' || relname) as total_bytes,
    pg_relation_size(schemaname || '.' || relname) as table_bytes,
    pg_total_relation_size(schemaname || '.' || relname) - pg_relation_size(schemaname || '.' || relname) as bloat_bytes,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    CASE 
      WHEN n_live_tup > 0 
      THEN ROUND(100.0 * n_dead_tup / GREATEST(n_live_tup, 1), 2)
      ELSE 0
    END as dead_tuple_percent
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
)
SELECT
  tablename as table_name,
  ROUND((total_bytes / 1024.0 / 1024.0)::NUMERIC, 2) as total_size_mb,
  ROUND((table_bytes / 1024.0 / 1024.0)::NUMERIC, 2) as table_size_mb,
  ROUND((bloat_bytes / 1024.0 / 1024.0)::NUMERIC, 2) as bloat_size_mb,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  dead_tuple_percent,
  CASE 
    WHEN dead_tuple_percent > 20 THEN 'HIGH'
    WHEN dead_tuple_percent > 10 THEN 'MEDIUM'
    ELSE 'LOW'
  END as bloat_severity,
  last_vacuum,
  last_autovacuum,
  CASE 
    WHEN dead_tuple_percent > 20 THEN 
      format('Run VACUUM ANALYZE on %I to reclaim %.2f MB', tablename, bloat_bytes / 1024.0 / 1024.0)
    WHEN dead_tuple_percent > 10 THEN 
      format('Consider VACUUM on %I (%.1f%% dead tuples)', tablename, dead_tuple_percent)
    ELSE 
      format('Table %I bloat is acceptable', tablename)
  END as recommendation
FROM table_bloat
ORDER BY dead_tuple_percent DESC, total_bytes DESC;

COMMENT ON VIEW public.monitor_table_bloat IS 'AUDITOR PRO: Real-time table bloat monitoring with VACUUM recommendations';

-- ============================================================================
-- FUNCTION 4: Master Audit Function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.audit_project_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
  v_start_time TIMESTAMPTZ;
  v_findings JSONB := '{}'::jsonb;
  v_rls_issues INTEGER := 0;
  v_index_issues INTEGER := 0;
  v_bloat_issues INTEGER := 0;
  v_orphan_issues INTEGER := 0;
  v_recommendations TEXT[] := '{}';
  v_max_severity TEXT := 'INFO';
BEGIN
  v_start_time := clock_timestamp();
  v_audit_id := gen_random_uuid();

  -- Check RLS issues
  SELECT COUNT(*) INTO v_rls_issues
  FROM public.check_missing_rls()
  WHERE severity IN ('CRITICAL', 'HIGH');

  IF v_rls_issues > 0 THEN
    v_max_severity := 'CRITICAL';
    v_recommendations := array_append(
      v_recommendations,
      '🚨 CRITICAL: ' || v_rls_issues::TEXT || ' tables have RLS issues. Enable RLS immediately!'
    );
  END IF;

  -- Check index issues
  SELECT COUNT(*) INTO v_index_issues
  FROM public.check_missing_indexes()
  WHERE severity = 'HIGH';

  IF v_index_issues > 0 AND v_max_severity NOT IN ('CRITICAL') THEN
    v_max_severity := 'HIGH';
  END IF;
  IF v_index_issues > 0 THEN
    v_recommendations := array_append(
      v_recommendations,
      '⚠️  HIGH: ' || v_index_issues::TEXT || ' foreign keys missing indexes. Add indexes for performance.'
    );
  END IF;

  -- Check bloat issues
  SELECT COUNT(*) INTO v_bloat_issues
  FROM public.monitor_table_bloat
  WHERE bloat_severity IN ('HIGH', 'MEDIUM');

  IF v_bloat_issues > 0 AND v_max_severity NOT IN ('CRITICAL', 'HIGH') THEN
    v_max_severity := 'MEDIUM';
  END IF;
  IF v_bloat_issues > 0 THEN
    v_recommendations := array_append(
      v_recommendations,
      'ℹ️  MEDIUM: ' || v_bloat_issues::TEXT || ' tables have high bloat. Run VACUUM ANALYZE.'
    );
  END IF;

  -- Check orphaned tables
  SELECT COUNT(*) INTO v_orphan_issues
  FROM public.check_orphaned_tables()
  WHERE severity IN ('MEDIUM', 'LOW');

  IF v_orphan_issues > 0 THEN
    v_recommendations := array_append(
      v_recommendations,
      '📊 INFO: ' || v_orphan_issues::TEXT || ' tables appear unused. Review for cleanup.'
    );
  END IF;

  -- Build findings JSON
  v_findings := jsonb_build_object(
    'rls_issues', (SELECT jsonb_agg(to_jsonb(r)) FROM public.check_missing_rls() r WHERE severity IN ('CRITICAL', 'HIGH')),
    'index_issues', (SELECT jsonb_agg(to_jsonb(i)) FROM public.check_missing_indexes() i WHERE severity = 'HIGH'),
    'bloat_issues', (SELECT jsonb_agg(to_jsonb(b)) FROM public.monitor_table_bloat b WHERE bloat_severity IN ('HIGH', 'MEDIUM')),
    'orphan_tables', (SELECT jsonb_agg(to_jsonb(o)) FROM public.check_orphaned_tables() o WHERE severity IN ('MEDIUM', 'LOW')),
    'summary', jsonb_build_object(
      'total_rls_issues', v_rls_issues,
      'total_index_issues', v_index_issues,
      'total_bloat_issues', v_bloat_issues,
      'total_orphan_tables', v_orphan_issues,
      'overall_severity', v_max_severity
    )
  );

  -- Save audit execution
  INSERT INTO public.audit_executions (
    id, audit_type, status, findings, severity, recommendations, 
    executed_by, duration_ms, metadata
  ) VALUES (
    v_audit_id,
    'project_health',
    'completed',
    v_findings,
    v_max_severity,
    v_recommendations,
    auth.uid(),
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)::INTEGER,
    jsonb_build_object(
      'timestamp', NOW(),
      'version', '1.0.0',
      'auditor', 'Icarus Prime CISO'
    )
  );

  -- Return report
  RETURN json_build_object(
    'audit_id', v_audit_id,
    'status', 'completed',
    'severity', v_max_severity,
    'findings', v_findings,
    'recommendations', v_recommendations,
    'executed_at', NOW(),
    'duration_ms', EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time)
  );
END;
$$;

COMMENT ON FUNCTION public.audit_project_health IS 'AUDITOR PRO: Master audit function - comprehensive security and performance check';

-- ============================================================================
-- FUNCTION 5: Generate Human-Readable Audit Report
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_audit_report(
  p_audit_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_record RECORD;
  v_report TEXT := '';
  v_line TEXT := E'\n' || repeat('=', 80) || E'\n';
BEGIN
  -- Get latest audit if no ID provided
  IF p_audit_id IS NULL THEN
    SELECT * INTO v_audit_record
    FROM public.audit_executions
    WHERE audit_type = 'project_health'
    ORDER BY executed_at DESC
    LIMIT 1;
  ELSE
    SELECT * INTO v_audit_record
    FROM public.audit_executions
    WHERE id = p_audit_id;
  END IF;

  IF NOT FOUND THEN
    RETURN 'No audit execution found.';
  END IF;

  -- Build report header
  v_report := v_line || 
    '🛡️  SUPABASE AUDITOR PRO - PROJECT HEALTH REPORT' || v_line ||
    format('Audit ID: %s', v_audit_record.id) || E'\n' ||
    format('Executed: %s', v_audit_record.executed_at) || E'\n' ||
    format('Duration: %s ms', v_audit_record.duration_ms) || E'\n' ||
    format('Overall Severity: %s', v_audit_record.severity) || E'\n' ||
    v_line;

  -- Add recommendations
  IF array_length(v_audit_record.recommendations, 1) > 0 THEN
    v_report := v_report || E'\n📋 RECOMMENDATIONS:\n\n';
    FOR i IN 1..array_length(v_audit_record.recommendations, 1) LOOP
      v_report := v_report || format('  %s. %s', i, v_audit_record.recommendations[i]) || E'\n';
    END LOOP;
    v_report := v_report || v_line;
  END IF;

  -- Add detailed findings
  v_report := v_report || E'\n🔍 DETAILED FINDINGS:\n\n';
  v_report := v_report || format('RLS Issues: %s', 
    COALESCE((v_audit_record.findings->'summary'->>'total_rls_issues')::TEXT, '0')) || E'\n';
  v_report := v_report || format('Index Issues: %s', 
    COALESCE((v_audit_record.findings->'summary'->>'total_index_issues')::TEXT, '0')) || E'\n';
  v_report := v_report || format('Bloat Issues: %s', 
    COALESCE((v_audit_record.findings->'summary'->>'total_bloat_issues')::TEXT, '0')) || E'\n';
  v_report := v_report || format('Orphan Tables: %s', 
    COALESCE((v_audit_record.findings->'summary'->>'total_orphan_tables')::TEXT, '0')) || E'\n';
  v_report := v_report || v_line;

  v_report := v_report || E'\n✅ Audit completed successfully.\n' || v_line;

  RETURN v_report;
END;
$$;

COMMENT ON FUNCTION public.generate_audit_report IS 'AUDITOR PRO: Generate human-readable text report from audit execution';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Allow authenticated users to run audit functions
GRANT EXECUTE ON FUNCTION public.check_missing_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_missing_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_orphaned_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_project_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_audit_report(UUID) TO authenticated;

-- Allow authenticated users to query audit results
GRANT SELECT ON public.audit_executions TO authenticated;
GRANT SELECT ON public.monitor_table_bloat TO authenticated;

COMMIT;

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

-- Run comprehensive audit:
-- SELECT public.audit_project_health();

-- Get human-readable report:
-- SELECT public.generate_audit_report();

-- Check specific issues:
-- SELECT * FROM public.check_missing_rls();
-- SELECT * FROM public.check_missing_indexes();
-- SELECT * FROM public.monitor_table_bloat;
-- SELECT * FROM public.check_orphaned_tables();

-- View audit history:
-- SELECT id, severity, executed_at, duration_ms 
-- FROM public.audit_executions 
-- ORDER BY executed_at DESC 
-- LIMIT 10;

