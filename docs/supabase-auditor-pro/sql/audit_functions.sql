-- ============================================================================
-- AUDITORIA DE FUNÇÕES & TRIGGERS
-- ============================================================================

-- Listar todas as funções customizadas
CREATE OR REPLACE FUNCTION auditor.listar_funcoes()
RETURNS TABLE(
  schema_name TEXT,
  function_name TEXT,
  return_type TEXT,
  language TEXT,
  is_security_definer BOOLEAN,
  total_calls BIGINT,
  total_time_ms NUMERIC,
  avg_time_ms NUMERIC,
  source_lines INT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT,
    p.proname::TEXT,
    pg_get_function_result(p.oid)::TEXT as return_type,
    l.lanname::TEXT as language,
    p.prosecdef as is_security_definer,
    COALESCE(s.calls, 0)::BIGINT as total_calls,
    COALESCE(ROUND(s.total_time::NUMERIC, 2), 0) as total_time_ms,
    COALESCE(
      ROUND(
        CASE 
          WHEN s.calls IS NOT NULL AND s.calls > 0 THEN s.total_time / s.calls
          ELSE 0 
        END,
        2
      ),
      0
    ) as avg_time_ms,
    array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) as source_lines
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  LEFT JOIN pg_stat_user_functions s ON s.funcid = p.oid
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND n.nspname NOT LIKE 'pg_%'
  ORDER BY COALESCE(s.calls, 0) DESC;
END;
$$;

-- Detectar funções nunca chamadas
CREATE OR REPLACE FUNCTION auditor.detectar_funcoes_inutilizadas()
RETURNS TABLE(
  schema_name TEXT,
  function_name TEXT,
  language TEXT,
  is_trigger BOOLEAN,
  source_lines INT,
  created_at TIMESTAMP,
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
    p.proname::TEXT,
    l.lanname::TEXT,
    EXISTS(
      SELECT 1 FROM pg_trigger t WHERE t.tgfoid = p.oid
    ) as is_trigger,
    array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) as source_lines,
    NULL::TIMESTAMP as created_at, -- PostgreSQL não armazena data de criação por padrão
    CASE 
      WHEN EXISTS(SELECT 1 FROM pg_trigger t WHERE t.tgfoid = p.oid) 
      THEN 'Função usada como trigger - verificar se trigger está ativo'
      ELSE 'DROP FUNCTION ' || n.nspname || '.' || p.proname || '();'
    END::TEXT as suggestion
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  LEFT JOIN pg_stat_user_functions s ON s.funcid = p.oid
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auditor')
    AND n.nspname NOT LIKE 'pg_%'
    AND (s.calls IS NULL OR s.calls = 0)
  ORDER BY source_lines DESC;
END;
$$;

-- Detectar funções com SECURITY DEFINER (risco de escalação)
CREATE OR REPLACE FUNCTION auditor.detectar_funcoes_security_definer()
RETURNS TABLE(
  schema_name TEXT,
  function_name TEXT,
  function_owner TEXT,
  language TEXT,
  source_preview TEXT,
  severity TEXT,
  risk TEXT,
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
    p.proname::TEXT,
    pg_get_userbyid(p.proowner)::TEXT as function_owner,
    l.lanname::TEXT,
    LEFT(p.prosrc, 200)::TEXT as source_preview,
    CASE 
      WHEN pg_get_userbyid(p.proowner) = 'postgres' THEN 'CRÍTICO'
      WHEN l.lanname = 'plpgsql' THEN 'ALTO'
      ELSE 'MÉDIO'
    END::TEXT as severity,
    'Função executa com privilégios do criador - risco de escalação de privilégio'::TEXT as risk,
    'Revisar código cuidadosamente. Considere usar SECURITY INVOKER se possível.'::TEXT as suggestion
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  WHERE p.prosecdef = true
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY 
    CASE 
      WHEN pg_get_userbyid(p.proowner) = 'postgres' THEN 1
      ELSE 2
    END,
    n.nspname, p.proname;
END;
$$;

-- Listar triggers e suas tabelas
CREATE OR REPLACE FUNCTION auditor.listar_gatilhos()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  trigger_name TEXT,
  trigger_event TEXT,
  trigger_timing TEXT,
  trigger_function TEXT,
  is_enabled BOOLEAN,
  table_writes_per_day BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT,
    c.relname::TEXT,
    t.tgname::TEXT,
    CASE 
      WHEN t.tgtype & 4 = 4 THEN 'INSERT'
      WHEN t.tgtype & 8 = 8 THEN 'DELETE'
      WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
      ELSE 'UNKNOWN'
    END::TEXT as trigger_event,
    CASE 
      WHEN t.tgtype & 2 = 2 THEN 'BEFORE'
      WHEN t.tgtype & 64 = 64 THEN 'INSTEAD OF'
      ELSE 'AFTER'
    END::TEXT as trigger_timing,
    p.proname::TEXT as trigger_function,
    t.tgenabled = 'O' as is_enabled,
    COALESCE(s.n_tup_ins + s.n_tup_upd + s.n_tup_del, 0)::BIGINT as table_writes_per_day
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_proc p ON p.oid = t.tgfoid
  LEFT JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND NOT t.tgisinternal
  ORDER BY table_writes_per_day DESC NULLS LAST, n.nspname, c.relname;
END;
$$;

-- Detectar triggers em tabelas com alto volume de escrita
CREATE OR REPLACE FUNCTION auditor.detectar_triggers_tabelas_quentes(write_threshold BIGINT DEFAULT 10000)
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  trigger_name TEXT,
  trigger_function TEXT,
  inserts_per_day BIGINT,
  updates_per_day BIGINT,
  deletes_per_day BIGINT,
  total_writes BIGINT,
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
    n.nspname::TEXT,
    c.relname::TEXT,
    t.tgname::TEXT,
    p.proname::TEXT,
    s.n_tup_ins as inserts_per_day,
    s.n_tup_upd as updates_per_day,
    s.n_tup_del as deletes_per_day,
    (s.n_tup_ins + s.n_tup_upd + s.n_tup_del) as total_writes,
    CASE 
      WHEN (s.n_tup_ins + s.n_tup_upd + s.n_tup_del) > write_threshold * 10 THEN 'CRÍTICO'
      WHEN (s.n_tup_ins + s.n_tup_upd + s.n_tup_del) > write_threshold THEN 'ALTO'
      ELSE 'MÉDIO'
    END::TEXT as severity,
    'Trigger em tabela de alto volume - verifique se é realmente necessário ou considere async'::TEXT as suggestion
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_stat_user_tables s ON s.schemaname = n.nspname AND s.relname = c.relname
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    AND NOT t.tgisinternal
    AND (s.n_tup_ins + s.n_tup_upd + s.n_tup_del) > write_threshold
  ORDER BY total_writes DESC;
END;
$$;

-- Analisar complexidade de funções (por tamanho e chamadas)
CREATE OR REPLACE FUNCTION auditor.analisar_complexidade_funcoes()
RETURNS TABLE(
  schema_name TEXT,
  function_name TEXT,
  language TEXT,
  source_lines INT,
  estimated_complexity TEXT,
  total_calls BIGINT,
  avg_time_ms NUMERIC,
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
    n.nspname::TEXT,
    p.proname::TEXT,
    l.lanname::TEXT,
    array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) as source_lines,
    CASE 
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 300 THEN 'MUITO ALTA'
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 150 THEN 'ALTA'
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 50 THEN 'MÉDIA'
      ELSE 'BAIXA'
    END::TEXT as estimated_complexity,
    COALESCE(s.calls, 0)::BIGINT as total_calls,
    COALESCE(
      ROUND(
        CASE 
          WHEN s.calls IS NOT NULL AND s.calls > 0 THEN s.total_time / s.calls
          ELSE 0 
        END,
        2
      ),
      0
    ) as avg_time_ms,
    CASE 
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 300 THEN 'ALTO'
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 150 THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 300 
      THEN 'Função muito longa - considere quebrar em funções menores'
      WHEN array_length(regexp_split_to_array(p.prosrc, E'\n'), 1) > 150 
      THEN 'Função longa - revisar se pode ser simplificada'
      ELSE 'Tamanho aceitável'
    END::TEXT as suggestion
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  LEFT JOIN pg_stat_user_functions s ON s.funcid = p.oid
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auditor')
    AND n.nspname NOT LIKE 'pg_%'
  ORDER BY source_lines DESC;
END;
$$;

-- Detectar funções com código SQL injection risk (uso de execute dinâmico)
CREATE OR REPLACE FUNCTION auditor.detectar_risco_sql()
RETURNS TABLE(
  schema_name TEXT,
  function_name TEXT,
  language TEXT,
  has_execute BOOLEAN,
  has_format BOOLEAN,
  has_quote_ident BOOLEAN,
  severity TEXT,
  risk TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.nspname::TEXT,
    p.proname::TEXT,
    l.lanname::TEXT,
    (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%') as has_execute,
    (p.prosrc LIKE '%format(%' OR p.prosrc LIKE '%FORMAT(%') as has_format,
    (p.prosrc LIKE '%quote_ident%' OR p.prosrc LIKE '%quote_literal%') as has_quote_ident,
    CASE 
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%') 
           AND NOT (p.prosrc LIKE '%quote_ident%' OR p.prosrc LIKE '%quote_literal%')
      THEN 'ALTO'
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%')
      THEN 'MÉDIO'
      ELSE 'BAIXO'
    END::TEXT as severity,
    CASE 
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%') 
           AND NOT (p.prosrc LIKE '%quote_ident%' OR p.prosrc LIKE '%quote_literal%')
      THEN 'SQL dinâmico sem sanitização - risco de SQL injection'
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%')
      THEN 'SQL dinâmico detectado - revisar sanitização'
      ELSE 'Sem SQL dinâmico detectado'
    END::TEXT as risk
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_language l ON l.oid = p.prolang
  WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'auditor')
    AND l.lanname = 'plpgsql'
  ORDER BY 
    CASE 
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%') 
           AND NOT (p.prosrc LIKE '%quote_ident%' OR p.prosrc LIKE '%quote_literal%')
      THEN 1
      WHEN (p.prosrc LIKE '%EXECUTE%' OR p.prosrc LIKE '%execute%')
      THEN 2
      ELSE 3
    END;
END;
$$;

COMMENT ON FUNCTION auditor.listar_funcoes IS 'Lista todas as funções customizadas com estatísticas';
COMMENT ON FUNCTION auditor.detectar_funcoes_inutilizadas IS 'Detecta funções que nunca foram chamadas';
COMMENT ON FUNCTION auditor.detectar_funcoes_security_definer IS 'Lista funções SECURITY DEFINER (risco)';
COMMENT ON FUNCTION auditor.listar_gatilhos IS 'Lista todos os triggers do banco';
COMMENT ON FUNCTION auditor.detectar_triggers_tabelas_quentes IS 'Detecta triggers em tabelas de alto volume';
COMMENT ON FUNCTION auditor.analisar_complexidade_funcoes IS 'Analisa complexidade de funções por tamanho';
COMMENT ON FUNCTION auditor.detectar_risco_sql IS 'Detecta funções com risco de SQL injection';

