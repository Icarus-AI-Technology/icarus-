-- ========================================
-- DIAGNÓSTICO SUPABASE - ICARUS v5.0
-- Execute no SQL Editor para ver o status
-- ========================================

-- 1. EXTENSÕES INSTALADAS
SELECT 
  '🔌 EXTENSÕES' AS categoria,
  extname AS nome,
  extversion AS versao
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'postgis', 'pg_stat_statements')
ORDER BY extname;

-- 2. TABELAS PÚBLICAS
SELECT 
  '📊 TABELAS' AS categoria,
  table_name AS nome,
  CASE WHEN obj_description((table_schema||'.'||table_name)::regclass) IS NOT NULL 
    THEN '✅ Com comentário' 
    ELSE '⚠️ Sem comentário' 
  END AS documentacao
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. CONTAGEM DE TABELAS POR MÓDULO
SELECT 
  '📈 ESTATÍSTICAS' AS categoria,
  'Total de tabelas públicas' AS metrica,
  COUNT(*)::TEXT AS valor
FROM information_schema.tables
WHERE table_schema = 'public'

UNION ALL

SELECT 
  '📈 ESTATÍSTICAS',
  'Tabelas com RLS habilitado',
  COUNT(*)::TEXT
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true

UNION ALL

SELECT 
  '📈 ESTATÍSTICAS',
  'Total de índices',
  COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'

UNION ALL

SELECT 
  '📈 ESTATÍSTICAS',
  'Total de functions',
  COUNT(*)::TEXT
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace

UNION ALL

SELECT 
  '📈 ESTATÍSTICAS',
  'Total de triggers',
  COUNT(*)::TEXT
FROM pg_trigger
WHERE NOT tgisinternal

UNION ALL

SELECT 
  '📈 ESTATÍSTICAS',
  'Total de views',
  COUNT(*)::TEXT
FROM information_schema.views
WHERE table_schema = 'public';

-- 4. TABELAS CORE MULTI-TENANT (Verificar se existem)
SELECT 
  '✅ CORE' AS categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'empresas') 
      THEN '✅ empresas' 
      ELSE '❌ empresas' 
  END AS tabela

UNION ALL

SELECT '✅ CORE',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') 
      THEN '✅ usuarios' 
      ELSE '❌ usuarios' 
  END

UNION ALL

SELECT '✅ CORE',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'produtos') 
      THEN '✅ produtos' 
      ELSE '❌ produtos' 
  END

UNION ALL

SELECT '✅ CORE',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lotes') 
      THEN '✅ lotes' 
      ELSE '❌ lotes' 
  END;

-- 5. TABELAS DE CADASTROS (Verificar se existem)
SELECT 
  '👥 CADASTROS' AS categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medicos') 
      THEN '✅ medicos' 
      ELSE '❌ medicos' 
  END AS tabela

UNION ALL

SELECT '👥 CADASTROS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hospitais') 
      THEN '✅ hospitais' 
      ELSE '❌ hospitais' 
  END

UNION ALL

SELECT '👥 CADASTROS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pacientes') 
      THEN '✅ pacientes' 
      ELSE '❌ pacientes' 
  END

UNION ALL

SELECT '👥 CADASTROS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'convenios') 
      THEN '✅ convenios' 
      ELSE '❌ convenios' 
  END;

-- 6. TABELAS OPERACIONAIS (Verificar se existem)
SELECT 
  '🏥 OPERAÇÕES' AS categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cirurgias') 
      THEN '✅ cirurgias' 
      ELSE '❌ cirurgias' 
  END AS tabela

UNION ALL

SELECT '🏥 OPERAÇÕES',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'kits') 
      THEN '✅ kits' 
      ELSE '❌ kits' 
  END

UNION ALL

SELECT '🏥 OPERAÇÕES',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'estoque') 
      THEN '✅ estoque' 
      ELSE '❌ estoque' 
  END

UNION ALL

SELECT '🏥 OPERAÇÕES',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consignacoes') 
      THEN '✅ consignacoes' 
      ELSE '❌ consignacoes' 
  END;

-- 7. MÓDULOS AVANÇADOS (Verificar se existem)
SELECT 
  '🚀 AVANÇADOS' AS categoria,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chatbot_conversas') 
      THEN '✅ chatbot_conversas' 
      ELSE '❌ chatbot_conversas' 
  END AS tabela

UNION ALL

SELECT '🚀 AVANÇADOS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflows') 
      THEN '✅ workflows' 
      ELSE '❌ workflows' 
  END

UNION ALL

SELECT '🚀 AVANÇADOS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_gateway_requests') 
      THEN '✅ api_gateway_requests' 
      ELSE '❌ api_gateway_requests' 
  END

UNION ALL

SELECT '🚀 AVANÇADOS',
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ml_vectors') 
      THEN '✅ ml_vectors' 
      ELSE '❌ ml_vectors' 
  END;

-- 8. RLS POLICIES (Amostra)
SELECT 
  '🔒 RLS' AS categoria,
  schemaname || '.' || tablename AS tabela,
  COUNT(*)::TEXT || ' policies' AS quantidade
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename
LIMIT 10;

-- 9. FUNCTIONS PRINCIPAIS
SELECT 
  '⚙️ FUNCTIONS' AS categoria,
  proname AS nome,
  pg_get_function_arguments(oid) AS argumentos
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('current_empresa', 'current_perfil', 'current_user_id', 'update_updated_at_column')
ORDER BY proname;

-- 10. STORAGE BUCKETS
SELECT 
  '📦 STORAGE' AS categoria,
  name AS bucket,
  public::TEXT AS publico,
  file_size_limit::TEXT AS limite_tamanho
FROM storage.buckets
ORDER BY name;

-- 11. RESUMO FINAL
SELECT 
  '📋 RESUMO' AS categoria,
  'Status do Banco' AS item,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') > 40 
      THEN '✅ Sistema completo (40+ tabelas)'
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') > 10 
      THEN '⚠️ Parcialmente configurado (10-40 tabelas)'
    ELSE '❌ Apenas base inicial (<10 tabelas)'
  END AS status;

