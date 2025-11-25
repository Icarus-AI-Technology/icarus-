-- ============================================================================
-- AUDITORIA DE PERFORMANCE & SAÚDE DO BANCO
-- ============================================================================

-- Queries mais lentas (requer pg_stat_statements)
CREATE OR REPLACE FUNCTION auditor.obter_queries_lentas(limit_count INT DEFAULT 20)
RETURNS TABLE(
  query_hash TEXT,
  query_text TEXT,
  calls BIGINT,
  total_time_ms NUMERIC,
  mean_time_ms NUMERIC,
  max_time_ms NUMERIC,
  rows_per_call NUMERIC,
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    md5(query)::TEXT as query_hash,
    LEFT(query, 200)::TEXT as query_text,
    calls::BIGINT,
    ROUND(total_exec_time::NUMERIC, 2) as total_time_ms,
    ROUND(mean_exec_time::NUMERIC, 2) as mean_time_ms,
    ROUND(max_exec_time::NUMERIC, 2) as max_time_ms,
    ROUND((rows / NULLIF(calls, 0))::NUMERIC, 2) as rows_per_call,
    CASE 
      WHEN mean_exec_time > 5000 THEN 'CRÍTICO'
      WHEN mean_exec_time > 1000 THEN 'ALTO'
      WHEN mean_exec_time > 500 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN mean_exec_time > 1000 THEN 'Otimizar query urgentemente - considere índices ou reescrita'
      WHEN rows / NULLIF(calls, 0) > 10000 THEN 'Query retorna muitos registros - adicione paginação'
      ELSE 'Monitorar performance'
    END::TEXT as suggestion
  FROM pg_stat_statements
  WHERE query NOT LIKE '%pg_stat%'
    AND query NOT LIKE '%auditor.%'
  ORDER BY mean_exec_time DESC
  LIMIT limit_count;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Extensão pg_stat_statements não instalada. Execute: CREATE EXTENSION pg_stat_statements;';
    RETURN;
END;
$$;

-- Conexões ativas e bloqueadas
CREATE OR REPLACE FUNCTION auditor.verificar_conexoes_ativas()
RETURNS TABLE(
  database_name TEXT,
  username TEXT,
  application_name TEXT,
  client_addr TEXT,
  state TEXT,
  query_start TIMESTAMP,
  state_change TIMESTAMP,
  wait_event_type TEXT,
  wait_event TEXT,
  current_query TEXT,
  severity TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    datname::TEXT,
    usename::TEXT,
    application_name::TEXT,
    client_addr::TEXT,
    state::TEXT,
    query_start::TIMESTAMP,
    state_change::TIMESTAMP,
    wait_event_type::TEXT,
    wait_event::TEXT,
    LEFT(query, 200)::TEXT as current_query,
    CASE 
      WHEN wait_event_type = 'Lock' THEN 'CRÍTICO'
      WHEN state = 'idle in transaction' AND NOW() - state_change > interval '5 minutes' THEN 'ALTO'
      WHEN state = 'active' AND NOW() - query_start > interval '10 minutes' THEN 'ALTO'
      ELSE 'BAIXO'
    END::TEXT as severity
  FROM pg_stat_activity
  WHERE pid <> pg_backend_pid()
    AND datname IS NOT NULL
  ORDER BY 
    CASE 
      WHEN wait_event_type = 'Lock' THEN 1
      WHEN state = 'idle in transaction' THEN 2
      WHEN state = 'active' THEN 3
      ELSE 4
    END,
    query_start ASC;
END;
$$;

-- Detectar locks (bloqueios)
CREATE OR REPLACE FUNCTION auditor.detectar_locks()
RETURNS TABLE(
  blocked_pid INT,
  blocked_user TEXT,
  blocked_query TEXT,
  blocking_pid INT,
  blocking_user TEXT,
  blocking_query TEXT,
  lock_type TEXT,
  lock_mode TEXT,
  duration INTERVAL,
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    blocked.pid::INT as blocked_pid,
    blocked.usename::TEXT as blocked_user,
    LEFT(blocked.query, 200)::TEXT as blocked_query,
    blocking.pid::INT as blocking_pid,
    blocking.usename::TEXT as blocking_user,
    LEFT(blocking.query, 200)::TEXT as blocking_query,
    locks.locktype::TEXT,
    locks.mode::TEXT,
    NOW() - blocked.query_start as duration,
    CASE 
      WHEN NOW() - blocked.query_start > interval '5 minutes' THEN 'CRÍTICO'
      WHEN NOW() - blocked.query_start > interval '1 minute' THEN 'ALTO'
      ELSE 'MÉDIO'
    END::TEXT as severity,
    'SELECT pg_terminate_backend(' || blocking.pid || '); -- Terminar processo bloqueador'::TEXT as suggestion
  FROM pg_locks locks
  JOIN pg_stat_activity blocked ON blocked.pid = locks.pid
  JOIN pg_locks blocking_locks ON blocking_locks.locktype = locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM locks.objsubid
    AND blocking_locks.pid <> locks.pid
  JOIN pg_stat_activity blocking ON blocking.pid = blocking_locks.pid
  WHERE NOT locks.granted
  ORDER BY blocked.query_start ASC;
END;
$$;

-- Dead tuples (registros não removidos pelo VACUUM)
CREATE OR REPLACE FUNCTION auditor.detectar_dead_tuples()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  live_tuples BIGINT,
  dead_tuples BIGINT,
  dead_ratio NUMERIC,
  last_vacuum TIMESTAMP,
  last_autovacuum TIMESTAMP,
  severity TEXT,
  suggestion TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::TEXT,
    tablename::TEXT,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    ROUND((n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) * 100, 2) as dead_ratio,
    last_vacuum::TIMESTAMP,
    last_autovacuum::TIMESTAMP,
    CASE 
      WHEN n_dead_tup > 100000 AND (n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) > 0.5 THEN 'CRÍTICO'
      WHEN n_dead_tup > 50000 OR (n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) > 0.3 THEN 'ALTO'
      WHEN n_dead_tup > 10000 OR (n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) > 0.1 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN (n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) > 0.5 THEN 
        'VACUUM FULL ' || schemaname || '.' || tablename || '; -- ATENÇÃO: Bloqueia a tabela'
      WHEN (n_dead_tup::NUMERIC / NULLIF(n_live_tup, 0)) > 0.1 THEN 
        'VACUUM ANALYZE ' || schemaname || '.' || tablename || ';'
      ELSE 'Monitorar autovacuum'
    END::TEXT as suggestion
  FROM pg_stat_user_tables
  WHERE n_dead_tup > 1000
  ORDER BY n_dead_tup DESC;
END;
$$;

-- Extensões instaladas vs recomendadas
CREATE OR REPLACE FUNCTION auditor.verificar_extensoes()
RETURNS TABLE(
  extension_name TEXT,
  installed_version TEXT,
  is_installed BOOLEAN,
  is_recommended BOOLEAN,
  description TEXT,
  install_command TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH recommended AS (
    SELECT unnest(ARRAY[
      'pg_stat_statements',
      'pgcrypto',
      'uuid-ossp',
      'pg_trgm',
      'btree_gin',
      'btree_gist',
      'hstore',
      'citext',
      'unaccent'
    ]) as name
  )
  SELECT 
    COALESCE(r.name, e.extname)::TEXT as extension_name,
    e.extversion::TEXT as installed_version,
    (e.extname IS NOT NULL) as is_installed,
    (r.name IS NOT NULL) as is_recommended,
    CASE COALESCE(r.name, e.extname)
      WHEN 'pg_stat_statements' THEN 'Rastreamento de performance de queries'
      WHEN 'pgcrypto' THEN 'Funções criptográficas'
      WHEN 'uuid-ossp' THEN 'Geração de UUIDs'
      WHEN 'pg_trgm' THEN 'Busca por similaridade de texto (fuzzy search)'
      WHEN 'btree_gin' THEN 'Índices GIN para tipos comuns'
      WHEN 'btree_gist' THEN 'Índices GIST para tipos comuns'
      WHEN 'hstore' THEN 'Armazenamento chave-valor'
      WHEN 'citext' THEN 'Texto case-insensitive'
      WHEN 'unaccent' THEN 'Remoção de acentos para busca'
      ELSE 'Extensão instalada'
    END::TEXT as description,
    'CREATE EXTENSION IF NOT EXISTS "' || COALESCE(r.name, e.extname) || '";'::TEXT as install_command
  FROM recommended r
  FULL OUTER JOIN pg_extension e ON e.extname = r.name
  ORDER BY is_recommended DESC, is_installed DESC;
END;
$$;

-- Uso de cache e hit ratio
CREATE OR REPLACE FUNCTION auditor.verificar_cache_hit()
RETURNS TABLE(
  metric TEXT,
  value NUMERIC,
  percentage TEXT,
  severity TEXT,
  interpretation TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  cache_hit_ratio NUMERIC;
BEGIN
  SELECT 
    ROUND(
      (sum(heap_blks_hit)::NUMERIC / NULLIF(sum(heap_blks_hit + heap_blks_read), 0)) * 100,
      2
    ) INTO cache_hit_ratio
  FROM pg_stattuple_approx(oid)
  CROSS JOIN pg_class
  WHERE relkind = 'r';
  
  RETURN QUERY
  SELECT 
    'Cache Hit Ratio'::TEXT,
    COALESCE(cache_hit_ratio, 0),
    COALESCE(cache_hit_ratio, 0)::TEXT || '%',
    CASE 
      WHEN COALESCE(cache_hit_ratio, 0) < 90 THEN 'CRÍTICO'
      WHEN COALESCE(cache_hit_ratio, 0) < 95 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT,
    CASE 
      WHEN COALESCE(cache_hit_ratio, 0) < 90 THEN 'Cache hit muito baixo - considere aumentar shared_buffers'
      WHEN COALESCE(cache_hit_ratio, 0) < 95 THEN 'Cache hit abaixo do ideal - monitorar'
      ELSE 'Cache hit saudável'
    END::TEXT;
EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'Cache Hit Ratio'::TEXT,
      0::NUMERIC,
      'N/A'::TEXT,
      'INFO'::TEXT,
      'Não foi possível calcular (extensão pgstattuple não disponível)'::TEXT;
END;
$$;

-- Tamanho do banco e crescimento
CREATE OR REPLACE FUNCTION auditor.verificar_tamanho_banco()
RETURNS TABLE(
  database_name TEXT,
  size_bytes BIGINT,
  size_pretty TEXT,
  table_count INT,
  index_count INT,
  largest_table TEXT,
  largest_table_size TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    current_database()::TEXT,
    pg_database_size(current_database())::BIGINT,
    pg_size_pretty(pg_database_size(current_database())),
    (SELECT COUNT(*)::INT FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema')),
    (SELECT COUNT(*)::INT FROM pg_indexes WHERE schemaname NOT IN ('pg_catalog', 'information_schema')),
    (
      SELECT schemaname || '.' || tablename 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
      WHERE t.schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 1
    )::TEXT,
    (
      SELECT pg_size_pretty(pg_total_relation_size(c.oid))
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
      WHERE t.schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 1
    )::TEXT;
END;
$$;

COMMENT ON FUNCTION auditor.obter_queries_lentas IS 'Lista as queries mais lentas (requer pg_stat_statements)';
COMMENT ON FUNCTION auditor.verificar_conexoes_ativas IS 'Monitora conexões ativas e problemáticas';
COMMENT ON FUNCTION auditor.detectar_locks IS 'Detecta bloqueios entre transações';
COMMENT ON FUNCTION auditor.detectar_dead_tuples IS 'Identifica tabelas com muitos dead tuples';
COMMENT ON FUNCTION auditor.verificar_extensoes IS 'Compara extensões instaladas vs recomendadas';
COMMENT ON FUNCTION auditor.verificar_cache_hit IS 'Calcula taxa de acerto do cache';
COMMENT ON FUNCTION auditor.verificar_tamanho_banco IS 'Retorna tamanho do banco e estatísticas';

