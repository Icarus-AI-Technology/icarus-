-- Migration: Fix verificar_integridade_audit_log ambiguity
-- Data: 2025-10-28
-- Contexto: scripts/db/audit.sh falhando por ambiguidade em registro_id
-- Ação: Referenciar explicitamente a coluna audit_log.registro_id

CREATE OR REPLACE FUNCTION verificar_integridade_audit_log()
RETURNS TABLE(
  registro_id UUID,
  hash_esperado TEXT,
  hash_registrado TEXT,
  integro BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH audit_ordenado AS (
    SELECT
      al.id AS log_id,
      al.empresa_id,
      al.usuario_id,
      al.tabela,
      al.registro_id,
      al.acao,
      al.dados_antes,
      al.dados_depois,
      al.hash_anterior,
      al.hash_atual,
      LAG(al.hash_atual) OVER (ORDER BY al.criado_em, al.id) AS hash_anterior_real
    FROM audit_log al
    ORDER BY al.criado_em, al.id
  )
  SELECT
    ao.registro_id,
    ao.hash_anterior_real AS hash_esperado,
    ao.hash_anterior AS hash_registrado,
    COALESCE(ao.hash_anterior = ao.hash_anterior_real, ao.hash_anterior IS NULL) AS integro
  FROM audit_ordenado ao
  WHERE ao.hash_anterior_real IS NOT NULL;
END;
$$;

COMMENT ON FUNCTION verificar_integridade_audit_log IS 'Verifica integridade da cadeia de hashes (blockchain-like)';

