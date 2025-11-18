-- Migration: Rebuild audit_log hash chain
-- Data: 2025-10-28
-- Objetivo: Corrigir registros corrompidos no audit_log (hash_anterior/hash_atual)

DO $$
DECLARE
  rec RECORD;
  v_prev_hash TEXT := NULL;
  v_new_hash TEXT;
BEGIN
  FOR rec IN
    SELECT id,
           empresa_id,
           usuario_id,
           tabela,
           registro_id,
           acao,
           dados_antes,
           dados_depois
    FROM audit_log
    ORDER BY criado_em, id
  LOOP
    v_new_hash := compute_audit_hash(
      rec.empresa_id,
      rec.usuario_id,
      rec.tabela,
      rec.registro_id,
      rec.acao,
      rec.dados_antes,
      rec.dados_depois,
      v_prev_hash
    );

    UPDATE audit_log
    SET hash_anterior = v_prev_hash,
        hash_atual    = v_new_hash
    WHERE id = rec.id;

    v_prev_hash := v_new_hash;
  END LOOP;
END $$;

