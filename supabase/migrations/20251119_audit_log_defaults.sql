-- ============================================
-- Migration: 20251119 - Audit Log Defaults
-- Objetivo: garantir hash_atual automático
-- ============================================

BEGIN;

ALTER TABLE public.audit_log
  ALTER COLUMN hash_atual SET DEFAULT encode(gen_random_bytes(32), 'hex');

COMMIT;

