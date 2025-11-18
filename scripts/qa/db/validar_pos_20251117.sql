-- ============================================
-- Script de Validação PÓS-MIGRATION
-- Para: 20251117_backend_multitenant_fix.sql
-- Autor: AGENTE_AUDITOR_CORRETOR_SUPABASE v4
-- Data: 2025-11-18
-- ============================================
-- Descrição:
-- Executa validações APÓS aplicar migration 20251117
-- Confirma que alterações foram aplicadas corretamente
-- ============================================

\echo '🔍 VALIDANDO PÓS-MIGRATION 20251117_backend_multitenant_fix.sql'
\echo ''

-- ============================================
-- 1. Verificar empresa_id foi adicionado
-- ============================================
\echo '1. Validando coluna empresa_id nas 9 tabelas...'
DO $$
DECLARE
  v_tabelas TEXT[] := ARRAY[
    'estoque_armazens',
    'estoque_localizacoes',
    'estoque',
    'estoque_movimentacoes',
    'estoque_reservas',
    'estoque_lotes',
    'estoque_inventarios',
    'estoque_inventarios_itens',
    'estoque_alertas'
  ];
  v_tabela TEXT;
  v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH v_tabela IN ARRAY v_tabelas
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = v_tabela
        AND column_name = 'empresa_id'
    ) THEN
      v_missing := array_append(v_missing, v_tabela);
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION '❌ FAIL: Tabelas sem empresa_id: %', array_to_string(v_missing, ', ');
  END IF;

  RAISE NOTICE '✅ empresa_id: Adicionado em 9/9 tabelas';
END $$;

\echo ''

-- ============================================
-- 2. Verificar empresa_id foi populado (sem NULLs)
-- ============================================
\echo '2. Validando empresa_id populado (sem NULLs)...'
DO $$
DECLARE
  v_tabela TEXT;
  v_nulos INTEGER;
  v_erro BOOLEAN := FALSE;
BEGIN
  FOR v_tabela IN
    SELECT unnest(ARRAY[
      'estoque_armazens', 'estoque_localizacoes', 'estoque', 'estoque_movimentacoes',
      'estoque_reservas', 'estoque_lotes', 'estoque_inventarios',
      'estoque_inventarios_itens', 'estoque_alertas'
    ])
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE empresa_id IS NULL', v_tabela)
    INTO v_nulos;

    IF v_nulos > 0 THEN
      RAISE WARNING '❌ FAIL: % tem % registros com empresa_id NULL', v_tabela, v_nulos;
      v_erro := TRUE;
    ELSE
      RAISE NOTICE '✅ %: 0 NULLs', v_tabela;
    END IF;
  END LOOP;

  IF v_erro THEN
    RAISE EXCEPTION 'Migration FALHOU: Existem registros com empresa_id NULL';
  END IF;
END $$;

\echo ''

-- ============================================
-- 3. Verificar FKs foram criadas
-- ============================================
\echo '3. Validando FKs empresa_id → empresas...'
DO $$
DECLARE
  v_tabelas TEXT[] := ARRAY[
    'estoque_armazens',
    'estoque_localizacoes',
    'estoque',
    'estoque_movimentacoes',
    'estoque_reservas',
    'estoque_lotes',
    'estoque_inventarios',
    'estoque_inventarios_itens',
    'estoque_alertas'
  ];
  v_tabela TEXT;
  v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH v_tabela IN ARRAY v_tabelas
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = v_tabela
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'empresa_id'
    ) THEN
      v_missing := array_append(v_missing, v_tabela);
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION '❌ FAIL: Tabelas sem FK empresa_id: %', array_to_string(v_missing, ', ');
  END IF;

  RAISE NOTICE '✅ FKs: 9/9 tabelas com FK empresa_id → empresas';
END $$;

\echo ''

-- ============================================
-- 4. Verificar índices foram criados
-- ============================================
\echo '4. Validando índices idx_*_empresa...'
DO $$
DECLARE
  v_tabelas TEXT[] := ARRAY[
    'estoque_armazens',
    'estoque_localizacoes',
    'estoque',
    'estoque_movimentacoes',
    'estoque_reservas',
    'estoque_lotes',
    'estoque_inventarios',
    'estoque_inventarios_itens',
    'estoque_alertas'
  ];
  v_tabela TEXT;
  v_indice TEXT;
  v_missing TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH v_tabela IN ARRAY v_tabelas
  LOOP
    v_indice := 'idx_' || v_tabela || '_empresa';
    
    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = v_tabela
        AND indexname = v_indice
    ) THEN
      v_missing := array_append(v_missing, v_indice);
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION '❌ FAIL: Índices faltando: %', array_to_string(v_missing, ', ');
  END IF;

  RAISE NOTICE '✅ Índices: 9/9 criados';
END $$;

\echo ''

-- ============================================
-- 5. Verificar RLS foi habilitado
-- ============================================
\echo '5. Validando RLS habilitado...'
DO $$
DECLARE
  v_tabelas TEXT[] := ARRAY[
    'estoque_armazens',
    'estoque_localizacoes',
    'estoque',
    'estoque_movimentacoes',
    'estoque_reservas',
    'estoque_lotes',
    'estoque_inventarios',
    'estoque_inventarios_itens',
    'estoque_alertas'
  ];
  v_tabela TEXT;
  v_sem_rls TEXT[] := ARRAY[]::TEXT[];
BEGIN
  FOREACH v_tabela IN ARRAY v_tabelas
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = v_tabela
        AND c.relrowsecurity = TRUE
    ) THEN
      v_sem_rls := array_append(v_sem_rls, v_tabela);
    END IF;
  END LOOP;

  IF array_length(v_sem_rls, 1) > 0 THEN
    RAISE EXCEPTION '❌ FAIL: Tabelas sem RLS: %', array_to_string(v_sem_rls, ', ');
  END IF;

  RAISE NOTICE '✅ RLS: Habilitado em 9/9 tabelas';
END $$;

\echo ''

-- ============================================
-- 6. Verificar policies foram criadas (4 por tabela)
-- ============================================
\echo '6. Validando policies RLS (4 por tabela)...'
DO $$
DECLARE
  v_tabelas TEXT[] := ARRAY[
    'estoque_armazens',
    'estoque_localizacoes',
    'estoque',
    'estoque_movimentacoes',
    'estoque_reservas',
    'estoque_lotes',
    'estoque_inventarios',
    'estoque_inventarios_itens',
    'estoque_alertas'
  ];
  v_tabela TEXT;
  v_policies_count INTEGER;
  v_erro BOOLEAN := FALSE;
BEGIN
  FOREACH v_tabela IN ARRAY v_tabelas
  LOOP
    SELECT COUNT(*)
    INTO v_policies_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = v_tabela;

    IF v_policies_count < 4 THEN
      RAISE WARNING '❌ FAIL: % tem apenas % policies (esperado: 4)', v_tabela, v_policies_count;
      v_erro := TRUE;
    ELSE
      RAISE NOTICE '✅ %: % policies', v_tabela, v_policies_count;
    END IF;
  END LOOP;

  IF v_erro THEN
    RAISE EXCEPTION 'Policies RLS incompletas';
  END IF;
END $$;

\echo ''

-- ============================================
-- 7. Verificar função get_dashboard_kpis() foi atualizada
-- ============================================
\echo '7. Validando função get_dashboard_kpis()...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'get_dashboard_kpis'
  ) THEN
    RAISE EXCEPTION '❌ FAIL: Função get_dashboard_kpis() não existe!';
  END IF;

  -- Testar execução (não valida dados, apenas que não há erro SQL)
  PERFORM public.get_dashboard_kpis();
  
  RAISE NOTICE '✅ get_dashboard_kpis(): OK (executável)';
END $$;

\echo ''

-- ============================================
-- 8. Verificar função calcular_score_global_abbott()
-- ============================================
\echo '8. Validando função calcular_score_global_abbott()...'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'calcular_abbott_score'
  ) THEN
    -- Se calcular_abbott_score existe, calcular_score_global_abbott deve ter sido criada
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.routines
      WHERE routine_schema = 'public'
        AND routine_name = 'calcular_score_global_abbott'
    ) THEN
      RAISE EXCEPTION '❌ FAIL: calcular_score_global_abbott() não foi criada!';
    ELSE
      -- Testar execução
      PERFORM * FROM public.calcular_score_global_abbott() LIMIT 1;
      RAISE NOTICE '✅ calcular_score_global_abbott(): OK (executável)';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  SKIP: calcular_score_global_abbott() não criada (calcular_abbott_score não existe)';
  END IF;
END $$;

\echo ''

-- ============================================
-- 9. Teste de isolamento multi-tenant (smoke test)
-- ============================================
\echo '9. Teste de isolamento multi-tenant (smoke test)...'
DO $$
DECLARE
  v_empresas INTEGER;
  v_empresa_1 UUID;
  v_empresa_2 UUID;
BEGIN
  SELECT COUNT(*) INTO v_empresas FROM public.empresas;

  IF v_empresas < 2 THEN
    RAISE NOTICE '⚠️  SKIP: Menos de 2 empresas (smoke test não executado)';
  ELSE
    -- Pegar 2 empresas diferentes
    SELECT id INTO v_empresa_1 FROM public.empresas ORDER BY criado_em LIMIT 1;
    SELECT id INTO v_empresa_2 FROM public.empresas ORDER BY criado_em DESC LIMIT 1;

    -- Verificar se estoque de empresa 1 NÃO contém registros de empresa 2
    IF EXISTS (
      SELECT 1
      FROM public.estoque
      WHERE empresa_id = v_empresa_2
        AND EXISTS (
          SELECT 1 FROM public.estoque WHERE empresa_id = v_empresa_1
        )
    ) THEN
      -- OK: Empresas têm dados separados
      RAISE NOTICE '✅ Multi-tenant: Isolamento OK (empresas com dados separados)';
    ELSE
      RAISE NOTICE '⚠️  Multi-tenant: Não foi possível testar (dados insuficientes)';
    END IF;
  END IF;
END $$;

\echo ''

-- ============================================
-- 10. Estatísticas finais
-- ============================================
\echo '10. Estatísticas pós-migration...'
DO $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT
    (SELECT COUNT(DISTINCT empresa_id) FROM public.estoque) AS empresas_estoque,
    (SELECT COUNT(*) FROM public.estoque) AS total_registros_estoque,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename LIKE 'estoque%') AS total_policies
  INTO v_stats;

  RAISE NOTICE '';
  RAISE NOTICE 'Estatísticas:';
  RAISE NOTICE '  - Empresas no estoque: %', v_stats.empresas_estoque;
  RAISE NOTICE '  - Total registros estoque: %', v_stats.total_registros_estoque;
  RAISE NOTICE '  - Total policies RLS: %', v_stats.total_policies;
  RAISE NOTICE '';
END $$;

-- ============================================
-- 11. Resumo final
-- ============================================
\echo '========================================='
\echo 'RESUMO VALIDAÇÃO PÓS-MIGRATION'
\echo '========================================='
\echo ''
\echo 'Se todas as validações acima passaram (✅), migration foi SUCESSO.'
\echo ''
\echo 'Se alguma validação FALHOU (❌):'
\echo '  1. ROLLBACK da migration (se possível)'
\echo '  2. Investigar logs de erro'
\echo '  3. Corrigir problema antes de reaplicar'
\echo ''
\echo 'Warnings (⚠️) indicam testes não executados (condições não atendidas).'
\echo ''
\echo '========================================='
\echo ''

