-- ============================================================================
-- SUPABASE AUDITOR PRO - Setup SQL
-- ============================================================================
-- Este script cria todas as funções RPC necessárias para auditoria completa
-- Versão: 1.0.0
-- Compatível com PostgreSQL 14+ e Supabase
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Schema para funções de auditoria
CREATE SCHEMA IF NOT EXISTS auditor;

-- ============================================================================
-- AUDITORIA DE SCHEMA & TABELAS
-- ============================================================================

-- Detectar tabelas órfãs (sem uso em 90+ dias)
CREATE OR REPLACE FUNCTION auditor.detectar_tabelas_orfas(days_threshold INT DEFAULT 90)
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  last_seq_scan TIMESTAMP,
  last_idx_scan TIMESTAMP,
  days_inactive INT,
  total_rows BIGINT,
  table_size TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.schemaname::TEXT,
    st.relname::TEXT AS table_name,
    st.last_seq_scan::timestamp,
    st.last_idx_scan::timestamp,
    EXTRACT(DAY FROM NOW() - GREATEST(COALESCE(st.last_seq_scan, '1970-01-01'), COALESCE(st.last_idx_scan, '1970-01-01')))::INT as days_inactive,
    st.n_live_tup as total_rows,
    pg_size_pretty(pg_total_relation_size(format('%I.%I', st.schemaname, st.relname)::regclass)) as table_size
  FROM pg_stat_user_tables st
  WHERE 
    st.schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions', 'graphql')
    AND EXTRACT(DAY FROM NOW() - GREATEST(COALESCE(st.last_seq_scan, '1970-01-01'), COALESCE(st.last_idx_scan, '1970-01-01'))) > days_threshold
  ORDER BY days_inactive DESC;
END;
$$;

-- Detectar tabelas sem PRIMARY KEY
CREATE OR REPLACE FUNCTION auditor.detectar_tabelas_sem_pk()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  total_rows BIGINT,
  table_size TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_schema::TEXT,
    t.table_name::TEXT,
    COALESCE(s.n_live_tup, 0) as total_rows,
    pg_size_pretty(pg_total_relation_size(format('%I.%I', t.table_schema, t.table_name)::regclass)) as table_size
  FROM information_schema.tables t
  LEFT JOIN pg_stat_user_tables s ON s.schemaname = t.table_schema AND s.relname = t.table_name
  WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions', 'graphql')
    AND t.table_type = 'BASE TABLE'
    AND NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = t.table_schema 
        AND tc.table_name = t.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
    )
  ORDER BY s.n_live_tup DESC NULLS LAST;
END;
$$;

-- Detectar bloat em tabelas (> 80%)
CREATE OR REPLACE FUNCTION auditor.detectar_fragmentacao_tabelas()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  bloat_ratio NUMERIC,
  bloat_size TEXT,
  total_size TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH bloat AS (
    SELECT
      schemaname,
      tablename,
      ROUND(CASE WHEN otta=0 THEN 0.0 ELSE sml.relpages/otta::NUMERIC END, 2) AS ratio,
      CASE WHEN relpages < otta THEN 0 ELSE (bs*(sml.relpages-otta)::BIGINT)::BIGINT END AS bloat_bytes,
      pg_size_pretty((bs*(sml.relpages-otta)::BIGINT)::BIGINT) as bloat_pretty,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_pretty
    FROM (
      SELECT
        schemaname, tablename, cc.relpages, bs,
        CEIL((cc.reltuples*((datahdr+ma-
          (CASE WHEN datahdr%ma=0 THEN ma ELSE datahdr%ma END))+nullhdr2+4))/(bs-20::FLOAT)) AS otta
      FROM (
        SELECT
          ma,bs,schemaname,tablename,
          (datawidth+(hdr+ma-(CASE WHEN hdr%ma=0 THEN ma ELSE hdr%ma END)))::NUMERIC AS datahdr,
          (maxfracsum*(nullhdr+ma-(CASE WHEN nullhdr%ma=0 THEN ma ELSE nullhdr%ma END))) AS nullhdr2
        FROM (
          SELECT
            schemaname, tablename, hdr, ma, bs,
            SUM((1-null_frac)*avg_width) AS datawidth,
            MAX(null_frac) AS maxfracsum,
            hdr+(
              SELECT 1+COUNT(*)/8
              FROM pg_stats s2
              WHERE null_frac<>0 AND s2.schemaname = s.schemaname AND s2.tablename = s.tablename
            ) AS nullhdr
          FROM pg_stats s, (
            SELECT
              (SELECT current_setting('block_size')::NUMERIC) AS bs,
              CASE WHEN SUBSTRING(v,12,3) IN ('8.0','8.1','8.2') THEN 27 ELSE 23 END AS hdr,
              CASE WHEN v ~ 'mingw32' THEN 8 ELSE 4 END AS ma
            FROM (SELECT version() AS v) AS foo
          ) AS constants
          WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
          GROUP BY 1,2,3,4,5
        ) AS foo
      ) AS rs
      JOIN pg_class cc ON cc.relname = rs.tablename
      JOIN pg_namespace nn ON cc.relnamespace = nn.oid AND nn.nspname = rs.schemaname
    ) AS sml
  )
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    ratio,
    bloat_pretty::TEXT,
    total_pretty::TEXT,
    CASE 
      WHEN ratio > 5 THEN 'VACUUM FULL recomendado'
      WHEN ratio > 2 THEN 'VACUUM recomendado'
      ELSE 'Monitorar'
    END::TEXT as suggestion
  FROM bloat
  WHERE ratio > 0.8
  ORDER BY bloat_bytes DESC;
END;
$$;

-- Detectar colunas JSONB que deveriam ser normalizadas
CREATE OR REPLACE FUNCTION auditor.detectar_mau_uso_jsonb()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  column_name TEXT,
  sample_keys TEXT[],
  total_rows BIGINT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.table_schema::TEXT,
    c.table_name::TEXT,
    c.column_name::TEXT,
    ARRAY[]::TEXT[] as sample_keys, -- Placeholder, seria necessário query dinâmica
    s.n_live_tup as total_rows,
    'Considere normalizar se as chaves são sempre as mesmas'::TEXT as suggestion
  FROM information_schema.columns c
  JOIN pg_stat_user_tables s ON s.schemaname = c.table_schema AND s.relname = c.table_name
  WHERE c.data_type IN ('jsonb', 'json')
    AND c.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'extensions')
    AND s.n_live_tup > 1000
  ORDER BY s.n_live_tup DESC;
END;
$$;

-- ============================================================================
-- AUDITORIA DE ÍNDICES
-- ============================================================================

-- Detectar índices nunca usados
CREATE OR REPLACE FUNCTION auditor.detectar_indices_inutilizados()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  index_size TEXT,
  index_scans BIGINT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.schemaname::TEXT,
    pi.relname::TEXT as table_name,
    pi.indexrelname::TEXT,
    pg_size_pretty(pg_relation_size(pi.indexrelid)) as index_size,
    pi.idx_scan,
    'DROP INDEX ' || pi.schemaname || '.' || pi.indexrelname || ';' as suggestion
  FROM pg_stat_user_indexes pi
  WHERE pi.idx_scan = 0
    AND pi.schemaname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage')
    AND pi.indexrelname NOT LIKE '%_pkey'
  ORDER BY pg_relation_size(pi.indexrelid) DESC;
END;
$$;

-- Detectar índices duplicados ou redundantes
CREATE OR REPLACE FUNCTION auditor.detectar_indices_duplicados()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index1_name TEXT,
  index1_definition TEXT,
  index2_name TEXT,
  index2_definition TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH index_defs AS (
    SELECT
      n.nspname as schema_name,
      t.relname as table_name,
      i.relname as index_name,
      pg_get_indexdef(i.oid) as index_def,
      a.attname as column_name
    FROM pg_class t
    JOIN pg_index ix ON t.oid = ix.indrelid
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage')
  )
  SELECT DISTINCT
    i1.schema_name::TEXT,
    i1.table_name::TEXT,
    i1.index_name::TEXT,
    i1.index_def::TEXT,
    i2.index_name::TEXT,
    i2.index_def::TEXT,
    'Considere remover um dos índices redundantes'::TEXT
  FROM index_defs i1
  JOIN index_defs i2 ON 
    i1.schema_name = i2.schema_name 
    AND i1.table_name = i2.table_name
    AND i1.column_name = i2.column_name
    AND i1.index_name < i2.index_name
  ORDER BY 2, 3;
END;
$$;

-- Detectar índices inválidos
CREATE OR REPLACE FUNCTION auditor.detectar_indices_invalidos()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  index_name TEXT,
  reason TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT,
    t.relname::TEXT,
    i.relname::TEXT,
    'Índice marcado como inválido (INVALID)'::TEXT as reason,
    'REINDEX INDEX CONCURRENTLY ' || n.nspname || '.' || i.relname || ';' as suggestion
  FROM pg_class i
  JOIN pg_index ix ON i.oid = ix.indexrelid
  JOIN pg_class t ON t.oid = ix.indrelid
  JOIN pg_namespace n ON n.oid = i.relnamespace
  WHERE NOT ix.indisvalid
    AND n.nspname NOT IN ('pg_catalog', 'information_schema');
END;
$$;

COMMENT ON FUNCTION auditor.detectar_tabelas_orfas IS 'Detecta tabelas sem uso há X dias';
COMMENT ON FUNCTION auditor.detectar_tabelas_sem_pk IS 'Detecta tabelas sem chave primária';
COMMENT ON FUNCTION auditor.detectar_fragmentacao_tabelas IS 'Calcula bloat (fragmentação) de tabelas';
COMMENT ON FUNCTION auditor.detectar_mau_uso_jsonb IS 'Identifica colunas JSONB que poderiam ser normalizadas';
COMMENT ON FUNCTION auditor.detectar_indices_inutilizados IS 'Detecta índices que nunca foram utilizados';
COMMENT ON FUNCTION auditor.detectar_indices_duplicados IS 'Encontra índices duplicados ou redundantes';
COMMENT ON FUNCTION auditor.detectar_indices_invalidos IS 'Lista índices corrompidos ou inválidos';

