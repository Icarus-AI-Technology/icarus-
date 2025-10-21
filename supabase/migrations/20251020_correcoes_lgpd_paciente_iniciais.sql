-- ============================================
-- Migration: Correções LGPD — paciente_iniciais
-- Data: 2025-10-20
-- Versão: 1.0
-- Autor: AGENTE_AUDITOR_CORRETOR_SUPABASE v4
-- Tipo: NÃO-DESTRUTIVA (preserva dados)
-- ============================================
-- Descrição:
-- Garante conformidade com mapeamento FE↔BD e LGPD Art. 6º (minimização)
-- - Adiciona paciente_iniciais em cirurgias (se não existir)
-- - Popula iniciais a partir de paciente_nome (se houver)
-- - NÃO remove paciente_nome (usuário decide)
-- ============================================

-- ============================================
-- 1. ADICIONAR paciente_iniciais (se não existir)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_iniciais'
  ) THEN
    ALTER TABLE public.cirurgias
      ADD COLUMN paciente_iniciais TEXT;
    
    COMMENT ON COLUMN public.cirurgias.paciente_iniciais IS 'Iniciais do paciente (LGPD minimização) ex: "J.S."';
    
    RAISE NOTICE '✅ Coluna paciente_iniciais adicionada';
  ELSE
    RAISE NOTICE '⚠️  Coluna paciente_iniciais já existe';
  END IF;
END $$;

-- ============================================
-- 2. POPULAR paciente_iniciais (se vazio)
-- ============================================
-- Gera iniciais a partir de paciente_nome ou nome_completo
DO $$
DECLARE
  v_updated INTEGER;
BEGIN
  -- Caso 1: paciente_nome existe na tabela cirurgias
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_nome'
  ) THEN
    UPDATE public.cirurgias SET
      paciente_iniciais = CONCAT(
        LEFT(paciente_nome, 1),
        '.',
        LEFT(SPLIT_PART(paciente_nome, ' ', -1), 1),
        '.'
      )
    WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
      AND paciente_nome IS NOT NULL
      AND paciente_nome != '';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % cirurgias atualizadas com paciente_iniciais (de paciente_nome)', v_updated;
  END IF;
  
  -- Caso 2: FK para tabela pacientes (se existir)
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cirurgias'
      AND column_name = 'paciente_id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'pacientes'
  ) THEN
    UPDATE public.cirurgias c SET
      paciente_iniciais = CONCAT(
        LEFT(p.nome_completo, 1),
        '.',
        LEFT(SPLIT_PART(p.nome_completo, ' ', -1), 1),
        '.'
      )
    FROM public.pacientes p
    WHERE c.paciente_id = p.id
      AND (c.paciente_iniciais IS NULL OR c.paciente_iniciais = '')
      AND p.nome_completo IS NOT NULL
      AND p.nome_completo != '';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RAISE NOTICE '✅ % cirurgias atualizadas com paciente_iniciais (de tabela pacientes)', v_updated;
  END IF;
  
  -- Caso 3: Fallback para registros sem nome
  UPDATE public.cirurgias SET
    paciente_iniciais = 'N.D.' -- Não Disponível
  WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
    AND excluido_em IS NULL;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated > 0 THEN
    RAISE NOTICE '⚠️  % cirurgias sem nome - iniciais definidas como "N.D."', v_updated;
  END IF;
END $$;

-- ============================================
-- 3. VALIDAR NOT NULL (se apropriado)
-- ============================================
-- Apenas aplica NOT NULL se todas as cirurgias ativas têm iniciais
DO $$
DECLARE
  v_sem_iniciais INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_sem_iniciais
  FROM public.cirurgias
  WHERE (paciente_iniciais IS NULL OR paciente_iniciais = '')
    AND excluido_em IS NULL;
  
  IF v_sem_iniciais = 0 THEN
    ALTER TABLE public.cirurgias
      ALTER COLUMN paciente_iniciais SET NOT NULL;
    
    RAISE NOTICE '✅ paciente_iniciais definido como NOT NULL';
  ELSE
    RAISE NOTICE '⚠️  % cirurgias ativas sem iniciais - NOT NULL NÃO aplicado', v_sem_iniciais;
    RAISE NOTICE '    Execute novamente após corrigir dados';
  END IF;
END $$;

-- ============================================
-- 4. CRIAR ÍNDICE (se não existir)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_cirurgias_paciente_iniciais
  ON public.cirurgias(paciente_iniciais)
  WHERE excluido_em IS NULL;

COMMENT ON INDEX idx_cirurgias_paciente_iniciais IS 'Busca por iniciais de paciente (LGPD)';

-- ============================================
-- 5. CRIAR VIEW SEGURA (sem dados sensíveis)
-- ============================================
CREATE OR REPLACE VIEW public.vw_cirurgias_segura AS
SELECT
  id,
  empresa_id,
  codigo_interno,
  medico_id,
  hospital_id,
  paciente_iniciais, -- ✅ APENAS iniciais (LGPD)
  procedimento,
  data_cirurgia,
  hora_cirurgia,
  sala,
  status,
  prioridade,
  observacoes,
  valor_estimado,
  criado_em,
  atualizado_em
  -- excluido_em omitido (filtrado abaixo)
FROM public.cirurgias
WHERE excluido_em IS NULL;

COMMENT ON VIEW public.vw_cirurgias_segura IS 'View segura: omite dados sensíveis e soft-deleted';

-- ============================================
-- 6. GRANT PERMISSIONS (se usar RLS)
-- ============================================
-- Permitir SELECT na view para roles não-admin
GRANT SELECT ON public.vw_cirurgias_segura TO authenticated;

-- ============================================
-- 7. INSTRUÇÕES PARA DEPRECIAR paciente_nome
-- ============================================
-- ⚠️  ATENÇÃO: Esta migration NÃO remove paciente_nome
-- 
-- Motivo: Evitar perda de dados (conservador)
-- 
-- Para depreciar paciente_nome manualmente:
-- 1. Validar que todos os registros têm paciente_iniciais
-- 2. Atualizar frontend para usar paciente_iniciais
-- 3. Aplicar migration separada (reversível):
-- 
--   -- Migration 20251020_depreciar_paciente_nome.sql (OPCIONAL)
--   ALTER TABLE public.cirurgias
--     DROP COLUMN IF EXISTS paciente_nome CASCADE;
-- 
-- 4. Rollback (se necessário):
--   -- Migration 20251020_restaurar_paciente_nome.sql
--   ALTER TABLE public.cirurgias
--     ADD COLUMN paciente_nome TEXT;

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- DROP INDEX IF EXISTS idx_cirurgias_paciente_iniciais;
-- DROP VIEW IF EXISTS vw_cirurgias_segura;
-- ALTER TABLE public.cirurgias DROP COLUMN IF EXISTS paciente_iniciais CASCADE;

-- ============================================
-- VALIDAÇÃO PÓS-MIGRATION
-- ============================================
-- Execute: /scripts/qa/db/saude_mapeamento.sql
-- Esperado: ✅ paciente_iniciais presente e populado

-- ============================================
-- FIM DA MIGRATION
-- ============================================

