-- Migration: 20251029_fix_view_security_barrier.sql
-- Objetivo: Garantir security_barrier=on em todas as views do schema public (onde suportado)

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT c.relname AS view_name
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'v' AND n.nspname = 'public'
  ) LOOP
    BEGIN
      EXECUTE format('ALTER VIEW public.%I SET (security_barrier = true)', r.view_name);
      RAISE NOTICE 'security_barrier habilitado em view %', r.view_name;
    EXCEPTION WHEN OTHERS THEN
      -- Algumas views/materialized views podem não suportar security_barrier: ignorar
      RAISE NOTICE 'Ignorando view %: %', r.view_name, SQLERRM;
    END;
  END LOOP;
END $$;


