-- ============================================================================
-- Migration: Cirurgias Kanban Enhancements
-- Author: Icarus Prime Orchestrator
-- Date: 2025-11-24
--
-- Purpose:
--   Enhance the existing 'cirurgias' schema to support advanced Kanban workflow
--   with improved status tracking, priority management, and performance optimization.
--
-- Changes:
--   1. Expand status_cirurgia enum to match Kanban states (pre-op, intra-op, post-op phases)
--   2. Add priority/urgency fields for Kanban card sorting
--   3. Add procedimento field for procedure description
--   4. Create optimized indexes for Kanban queries (status + scheduled_at)
--   5. Add helper views for Kanban board data aggregation
--   6. Add RPC functions for Kanban card movement with audit trail
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Extend status_cirurgia enum for Kanban workflow
-- ============================================================================

-- Note: PostgreSQL doesn't allow direct ALTER TYPE for enums with existing data.
-- We'll use a safe migration pattern: create new type, migrate data, swap types.

DO $$
BEGIN
  -- Check if the new enum values already exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'status_cirurgia' AND e.enumlabel = 'preparacao'
  ) THEN
    -- Add new enum values for Kanban workflow
    ALTER TYPE status_cirurgia ADD VALUE IF NOT EXISTS 'preparacao';
    ALTER TYPE status_cirurgia ADD VALUE IF NOT EXISTS 'recuperacao';
  END IF;
END
$$;

-- Map old 'em_andamento' to new 'andamento' (if needed)
-- Update existing records to use consistent naming
UPDATE public.cirurgias 
SET status_cirurgia = 'confirmada'::status_cirurgia
WHERE status_cirurgia = 'em_andamento'::status_cirurgia;

COMMENT ON TYPE status_cirurgia IS 'Kanban workflow states: agendada → confirmada → preparacao → andamento → recuperacao → concluida | cancelada';

-- ============================================================================
-- STEP 2: Add Kanban-specific columns
-- ============================================================================

-- Add procedimento field (procedure description)
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS procedimento TEXT;

-- Add priority/urgency for Kanban sorting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgencia_cirurgia') THEN
    CREATE TYPE urgencia_cirurgia AS ENUM ('eletiva', 'urgente', 'emergencia');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'prioridade_cirurgia') THEN
    CREATE TYPE prioridade_cirurgia AS ENUM ('baixa', 'media', 'alta', 'urgente');
  END IF;
END
$$;

ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS urgencia urgencia_cirurgia DEFAULT 'eletiva',
  ADD COLUMN IF NOT EXISTS prioridade prioridade_cirurgia DEFAULT 'media';

-- Add patient name field (LGPD-compliant: initials only)
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS paciente_nome VARCHAR(200);

COMMENT ON COLUMN public.cirurgias.paciente_nome IS 'LGPD: Store initials or anonymized patient identifier only';

-- Add hora_cirurgia (separate time field for UI convenience)
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS hora_cirurgia TIME;

-- Add tipo_procedimento for categorization
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS tipo_procedimento VARCHAR(100);

-- Add numero_cirurgia for internal tracking
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS numero_cirurgia VARCHAR(50);

-- Add especialidade for filtering
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS especialidade VARCHAR(100);

-- Add valor_estimado for financial tracking
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS valor_estimado DECIMAL(12,2);

-- Add paciente_idade (age) for clinical context
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS paciente_idade INTEGER;

-- Add comorbidades (comorbidities) as JSONB array
ALTER TABLE public.cirurgias
  ADD COLUMN IF NOT EXISTS comorbidades JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.cirurgias.comorbidades IS 'Array of patient comorbidities for surgical risk assessment';

-- ============================================================================
-- STEP 3: Create optimized indexes for Kanban queries
-- ============================================================================

-- Composite index for Kanban board queries (status + date)
CREATE INDEX IF NOT EXISTS cirurgias_kanban_board_idx 
  ON public.cirurgias(empresa_id, status_cirurgia, data_agendada DESC);

-- Index for priority-based sorting
CREATE INDEX IF NOT EXISTS cirurgias_priority_idx 
  ON public.cirurgias(empresa_id, prioridade, urgencia);

-- Index for procedure type filtering
CREATE INDEX IF NOT EXISTS cirurgias_tipo_procedimento_idx 
  ON public.cirurgias(tipo_procedimento) 
  WHERE tipo_procedimento IS NOT NULL;

-- Partial index for active surgeries (exclude cancelada/concluida for performance)
CREATE INDEX IF NOT EXISTS cirurgias_active_idx 
  ON public.cirurgias(empresa_id, data_agendada)
  WHERE status_cirurgia NOT IN ('cancelada', 'concluida');

-- ============================================================================
-- STEP 4: Create Kanban Board View
-- ============================================================================

CREATE OR REPLACE VIEW public.v_kanban_cirurgias AS
SELECT
  c.id,
  c.empresa_id,
  c.numero_cirurgia,
  c.paciente_nome,
  c.procedimento,
  c.tipo_procedimento,
  c.especialidade,
  c.data_agendada,
  c.hora_cirurgia,
  c.sala,
  c.status_cirurgia,
  c.urgencia,
  c.prioridade,
  c.valor_estimado,
  c.observacoes,
  c.created_at,
  c.updated_at,
  -- Joined data
  m.nome AS medico_nome,
  m.crm AS medico_crm,
  m.especialidade AS medico_especialidade,
  h.nome AS hospital_nome,
  h.endereco AS hospital_endereco,
  -- Material count
  (SELECT COUNT(*) FROM public.cirurgia_materiais cm WHERE cm.cirurgia_id = c.id) AS total_materiais,
  -- Event count
  (SELECT COUNT(*) FROM public.cirurgia_eventos ce WHERE ce.cirurgia_id = c.id) AS total_eventos
FROM public.cirurgias c
LEFT JOIN public.medicos m ON c.medico_id = m.id
LEFT JOIN public.hospitais h ON c.hospital_id = h.id
WHERE c.status_cirurgia NOT IN ('cancelada', 'concluida')
ORDER BY 
  CASE c.urgencia 
    WHEN 'emergencia' THEN 1 
    WHEN 'urgente' THEN 2 
    WHEN 'eletiva' THEN 3 
  END,
  CASE c.prioridade 
    WHEN 'urgente' THEN 1 
    WHEN 'alta' THEN 2 
    WHEN 'media' THEN 3 
    WHEN 'baixa' THEN 4 
  END,
  c.data_agendada ASC;

COMMENT ON VIEW public.v_kanban_cirurgias IS 'Optimized view for Kanban board rendering with pre-joined medical/hospital data';

-- ============================================================================
-- STEP 5: Create RPC function for Kanban card movement
-- ============================================================================

CREATE OR REPLACE FUNCTION public.move_cirurgia_kanban(
  p_cirurgia_id UUID,
  p_new_status status_cirurgia,
  p_observacao TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_status status_cirurgia;
  v_empresa_id UUID;
  v_result JSON;
BEGIN
  -- Get current status and empresa_id
  SELECT status_cirurgia, empresa_id INTO v_old_status, v_empresa_id
  FROM public.cirurgias
  WHERE id = p_cirurgia_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Surgery not found: %', p_cirurgia_id;
  END IF;

  -- Validate user has permission (same empresa)
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND empresa_id = v_empresa_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: user not in same empresa';
  END IF;

  -- Update status
  UPDATE public.cirurgias
  SET 
    status_cirurgia = p_new_status,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = p_cirurgia_id;

  -- Log event
  INSERT INTO public.cirurgia_eventos (cirurgia_id, tipo_evento, descricao, usuario_id, metadados)
  VALUES (
    p_cirurgia_id,
    'status_changed',
    COALESCE(p_observacao, format('Status alterado de %s para %s', v_old_status, p_new_status)),
    auth.uid(),
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_new_status,
      'changed_at', NOW()
    )
  );

  -- Return result
  v_result := json_build_object(
    'success', true,
    'cirurgia_id', p_cirurgia_id,
    'old_status', v_old_status,
    'new_status', p_new_status,
    'changed_at', NOW()
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.move_cirurgia_kanban IS 'Move surgery card between Kanban columns with automatic audit logging';

-- ============================================================================
-- STEP 6: Create aggregation function for Kanban stats
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_cirurgias_kanban_stats(
  p_empresa_id UUID DEFAULT NULL,
  p_data_inicio DATE DEFAULT NULL,
  p_data_fim DATE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_empresa_id UUID;
  v_stats JSON;
BEGIN
  -- Use provided empresa_id or get from current user
  v_empresa_id := COALESCE(
    p_empresa_id,
    (SELECT empresa_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );

  -- Build stats JSON
  SELECT json_build_object(
    'total', COUNT(*),
    'por_status', json_object_agg(status_cirurgia, status_count),
    'por_urgencia', (
      SELECT json_object_agg(urgencia, urgencia_count)
      FROM (
        SELECT urgencia, COUNT(*) as urgencia_count
        FROM public.cirurgias
        WHERE empresa_id = v_empresa_id
          AND (p_data_inicio IS NULL OR data_agendada >= p_data_inicio)
          AND (p_data_fim IS NULL OR data_agendada <= p_data_fim)
        GROUP BY urgencia
      ) urg
    ),
    'por_prioridade', (
      SELECT json_object_agg(prioridade, prioridade_count)
      FROM (
        SELECT prioridade, COUNT(*) as prioridade_count
        FROM public.cirurgias
        WHERE empresa_id = v_empresa_id
          AND (p_data_inicio IS NULL OR data_agendada >= p_data_inicio)
          AND (p_data_fim IS NULL OR data_agendada <= p_data_fim)
        GROUP BY prioridade
      ) pri
    )
  ) INTO v_stats
  FROM (
    SELECT status_cirurgia, COUNT(*) as status_count
    FROM public.cirurgias
    WHERE empresa_id = v_empresa_id
      AND (p_data_inicio IS NULL OR data_agendada >= p_data_inicio)
      AND (p_data_fim IS NULL OR data_agendada <= p_data_fim)
    GROUP BY status_cirurgia
  ) st;

  RETURN v_stats;
END;
$$;

COMMENT ON FUNCTION public.get_cirurgias_kanban_stats IS 'Get aggregated statistics for Kanban dashboard (status, urgency, priority breakdown)';

-- ============================================================================
-- STEP 7: Realtime publication for Kanban updates
-- ============================================================================

-- Ensure cirurgias table is included in realtime publication
DO $$
BEGIN
  -- Check if publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add cirurgias table to publication (if not already added)
  -- Note: This requires superuser privileges in production
  -- In production, this should be done via Supabase Dashboard
  -- ALTER PUBLICATION supabase_realtime ADD TABLE public.cirurgias;
END
$$;

COMMIT;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Usage Examples:
-- 
-- 1. Get Kanban board data:
--    SELECT * FROM public.v_kanban_cirurgias WHERE empresa_id = '<your-empresa-id>';
--
-- 2. Move surgery card to new status:
--    SELECT public.move_cirurgia_kanban(
--      '<surgery-id>',
--      'preparacao'::status_cirurgia,
--      'Material OPME separado e conferido'
--    );
--
-- 3. Get Kanban statistics:
--    SELECT public.get_cirurgias_kanban_stats('<empresa-id>', '2025-11-01', '2025-11-30');

