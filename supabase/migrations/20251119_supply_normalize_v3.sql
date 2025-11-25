-- ============================================
-- Migration: 20251119 - Supply Normalize v3
-- ============================================

BEGIN;

-- Garantir estoques espelhados e unidade de medida obrigatória
UPDATE public.materiais_opme
SET
  estoque_atual = COALESCE(estoque_atual, quantidade_estoque, 0),
  estoque_minimo = COALESCE(estoque_minimo, quantidade_minima, 0),
  unidade_medida = COALESCE(NULLIF(unidade_medida, ''), 'UN');

ALTER TABLE public.materiais_opme
  ALTER COLUMN estoque_atual SET DEFAULT 0,
  ALTER COLUMN estoque_atual SET NOT NULL,
  ALTER COLUMN estoque_minimo SET DEFAULT 0,
  ALTER COLUMN estoque_minimo SET NOT NULL,
  ALTER COLUMN unidade_medida SET NOT NULL;

-- Médicos: cirurgias realizadas obrigatórias
UPDATE public.medicos
SET cirurgias_realizadas = COALESCE(cirurgias_realizadas, 0);

ALTER TABLE public.medicos
  ALTER COLUMN cirurgias_realizadas SET DEFAULT 0,
  ALTER COLUMN cirurgias_realizadas SET NOT NULL;

COMMIT;

