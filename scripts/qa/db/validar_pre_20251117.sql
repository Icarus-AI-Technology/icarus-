-- ============================================
-- Script de Validação PRÉ-MIGRATION
-- Para: 20251117_backend_multitenant_fix.sql
-- Autor: AGENTE_AUDITOR_CORRETOR_SUPABASE v4
-- Data: 2025-11-18
-- ============================================
-- Descrição:
-- Executa validações ANTES de aplicar migration 20251117
-- Detecta problemas que causariam falha da migration
-- ============================================

\echo '🔍 VALIDANDO PRÉ-REQUISITOS PARA 20251117_backend_multitenant_fix.sql'
\echo ''

-- ============================================
-- 1. Verificar tabela empresas (obrigatória)
-- ============================================
\echo '1. Validando tabela empresas...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'empresas'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: Tabela empresas não existe!';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.empresas LIMIT 1) THEN
    RAISE EXCEPTION '❌ CRITICAL: Tabela empresas está vazia! Insira ao menos uma empresa antes de prosseguir.';
  END IF;

  RAISE NOTICE '✅ Tabela empresas: OK (% empresas encontradas)',
    (SELECT COUNT(*) FROM public.empresas);
END $$;

\echo ''

-- ============================================
-- 2. Verificar produtos_opme.empresa_id
-- ============================================
\echo '2. Validando produtos_opme.empresa_id...'
DO $$
DECLARE
  v_total INTEGER;
  v_com_empresa INTEGER;
  v_sem_empresa INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'produtos_opme'
      AND column_name = 'empresa_id'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: produtos_opme não tem coluna empresa_id!';
  END IF;

  SELECT
    COUNT(*),
    COUNT(empresa_id),
    COUNT(*) - COUNT(empresa_id)
  INTO v_total, v_com_empresa, v_sem_empresa
  FROM public.produtos_opme;

  IF v_sem_empresa > 0 THEN
    RAISE EXCEPTION '❌ CRITICAL: produtos_opme tem % registros sem empresa_id! Migration falhará.', v_sem_empresa;
  END IF;

  RAISE NOTICE '✅ produtos_opme.empresa_id: OK (% produtos, % com empresa_id)', v_total, v_com_empresa;
END $$;

\echo ''

-- ============================================
-- 3. Verificar funções RLS helpers
-- ============================================
\echo '3. Validando funções RLS helpers...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'current_empresa_id'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: Função current_empresa_id() não existe!';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'current_user_role'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: Função current_user_role() não existe!';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'is_admin'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: Função is_admin() não existe!';
  END IF;

  RAISE NOTICE '✅ Funções RLS helpers: OK (3/3 encontradas)';
END $$;

\echo ''

-- ============================================
-- 4. Verificar função calcular_abbott_score
-- ============================================
\echo '4. Validando função calcular_abbott_score...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name = 'calcular_abbott_score'
  ) THEN
    RAISE WARNING '⚠️  WARNING: Função calcular_abbott_score() não existe. calcular_score_global_abbott() não será criada.';
  ELSE
    RAISE NOTICE '✅ calcular_abbott_score(): OK';
  END IF;
END $$;

\echo ''

-- ============================================
-- 5. Verificar tabelas de estoque existem
-- ============================================
\echo '5. Validando tabelas de estoque...'
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
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = v_tabela
    ) THEN
      v_missing := array_append(v_missing, v_tabela);
    END IF;
  END LOOP;

  IF array_length(v_missing, 1) > 0 THEN
    RAISE EXCEPTION '❌ CRITICAL: Tabelas faltando: %', array_to_string(v_missing, ', ');
  END IF;

  RAISE NOTICE '✅ Tabelas de estoque: OK (9/9 encontradas)';
END $$;

\echo ''

-- ============================================
-- 6. Verificar coluna medicos.status
-- ============================================
\echo '6. Validando coluna medicos.status...'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'medicos'
      AND column_name = 'status'
  ) THEN
    RAISE EXCEPTION '❌ CRITICAL: medicos não tem coluna status! Função get_dashboard_kpis() falhará.';
  END IF;

  RAISE NOTICE '✅ medicos.status: OK';
END $$;

\echo ''

-- ============================================
-- 7. Verificar roles case-sensitive
-- ============================================
\echo '7. Validando roles (case-sensitive)...'
DO $$
DECLARE
  v_roles_esperados TEXT[] := ARRAY['Admin', 'Super Admin', 'Gerente', 'Coordenador'];
  v_roles_encontrados TEXT[];
BEGIN
  -- Tentar encontrar roles em usuarios.perfil
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'usuarios'
      AND column_name = 'perfil'
  ) THEN
    SELECT array_agg(DISTINCT perfil)
    INTO v_roles_encontrados
    FROM public.usuarios
    WHERE perfil IS NOT NULL;

    IF v_roles_encontrados IS NULL THEN
      RAISE WARNING '⚠️  WARNING: Tabela usuarios está vazia. Não foi possível validar roles.';
    ELSE
      RAISE NOTICE '✅ Roles encontrados em usuarios.perfil: %', array_to_string(v_roles_encontrados, ', ');
      
      -- Checar se roles coincidem (case-sensitive)
      FOREACH v_role IN ARRAY v_roles_esperados
      LOOP
        IF NOT (v_role = ANY(v_roles_encontrados)) THEN
          RAISE WARNING '⚠️  WARNING: Role "%" não encontrado em usuarios.perfil. Policies podem bloquear acesso.', v_role;
        END IF;
      END LOOP;
    END IF;
  ELSE
    RAISE WARNING '⚠️  WARNING: Coluna usuarios.perfil não existe. Sistema de roles pode ser diferente.';
  END IF;
END $$;

\echo ''

-- ============================================
-- 8. Estimar impacto (quantos registros serão atualizados)
-- ============================================
\echo '8. Estimando impacto da migration...'
DO $$
DECLARE
  v_impacto RECORD;
BEGIN
  SELECT
    (SELECT COUNT(*) FROM public.estoque_armazens) AS estoque_armazens,
    (SELECT COUNT(*) FROM public.estoque_localizacoes) AS estoque_localizacoes,
    (SELECT COUNT(*) FROM public.estoque) AS estoque,
    (SELECT COUNT(*) FROM public.estoque_movimentacoes) AS estoque_movimentacoes,
    (SELECT COUNT(*) FROM public.estoque_reservas) AS estoque_reservas,
    (SELECT COUNT(*) FROM public.estoque_lotes) AS estoque_lotes,
    (SELECT COUNT(*) FROM public.estoque_inventarios) AS estoque_inventarios,
    (SELECT COUNT(*) FROM public.estoque_inventarios_itens) AS estoque_inventarios_itens,
    (SELECT COUNT(*) FROM public.estoque_alertas) AS estoque_alertas
  INTO v_impacto;

  RAISE NOTICE '';
  RAISE NOTICE 'Registros que receberão empresa_id:';
  RAISE NOTICE '  - estoque_armazens: % rows', v_impacto.estoque_armazens;
  RAISE NOTICE '  - estoque_localizacoes: % rows', v_impacto.estoque_localizacoes;
  RAISE NOTICE '  - estoque: % rows', v_impacto.estoque;
  RAISE NOTICE '  - estoque_movimentacoes: % rows', v_impacto.estoque_movimentacoes;
  RAISE NOTICE '  - estoque_reservas: % rows', v_impacto.estoque_reservas;
  RAISE NOTICE '  - estoque_lotes: % rows', v_impacto.estoque_lotes;
  RAISE NOTICE '  - estoque_inventarios: % rows', v_impacto.estoque_inventarios;
  RAISE NOTICE '  - estoque_inventarios_itens: % rows', v_impacto.estoque_inventarios_itens;
  RAISE NOTICE '  - estoque_alertas: % rows', v_impacto.estoque_alertas;
  RAISE NOTICE '';
  RAISE NOTICE 'Total estimado: % rows', 
    v_impacto.estoque_armazens + v_impacto.estoque_localizacoes +
    v_impacto.estoque + v_impacto.estoque_movimentacoes +
    v_impacto.estoque_reservas + v_impacto.estoque_lotes +
    v_impacto.estoque_inventarios + v_impacto.estoque_inventarios_itens +
    v_impacto.estoque_alertas;
END $$;

\echo ''

-- ============================================
-- 9. Resumo final
-- ============================================
\echo '========================================='
\echo 'RESUMO VALIDAÇÃO PRÉ-MIGRATION'
\echo '========================================='
\echo ''
\echo 'Se todas as validações acima passaram (✅), é SEGURO aplicar a migration.'
\echo ''
\echo 'Se alguma validação FALHOU (❌):'
\echo '  1. NÃO aplique a migration'
\echo '  2. Corrija os problemas indicados'
\echo '  3. Execute este script novamente'
\echo ''
\echo 'Warnings (⚠️) não bloqueiam migration, mas REVISÃO é recomendada.'
\echo ''
\echo '========================================='
\echo ''

