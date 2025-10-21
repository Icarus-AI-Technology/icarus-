#!/bin/bash
# ============================================
# Script: Auditoria do Banco de Dados
# Versão: 1.0
# Descrição: Executa verificações de conformidade
# ============================================

set -e

echo "🔍 Auditoria do Banco de Dados ICARUS"
echo "======================================"
echo ""

# Verificar variável de ambiente
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não configurada"
    exit 1
fi

# Criar arquivo temporário para queries
TMP_FILE=$(mktemp)

# ============================================
# 1. Verificar integridade do hash chain
# ============================================
cat > "$TMP_FILE" << 'EOF'
SELECT
  COUNT(*) FILTER (WHERE NOT integro) AS registros_corrompidos,
  COUNT(*) AS total_verificado
FROM verificar_integridade_audit_log();
EOF

echo "1️⃣  Integridade do Hash Chain (Audit Log):"
RESULT=$(psql "$SUPABASE_DB_URL" -t -c "$(cat $TMP_FILE)")
echo "$RESULT"

CORRUPTED=$(echo "$RESULT" | awk '{print $1}')
if [ "$CORRUPTED" -gt 0 ]; then
    echo "   ❌ FALHA: $CORRUPTED registros corrompidos detectados!"
else
    echo "   ✅ OK: Cadeia íntegra"
fi
echo ""

# ============================================
# 2. Verificar lotes vencidos
# ============================================
echo "2️⃣  Lotes Vencidos:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  COUNT(*) AS lotes_vencidos
FROM lotes
WHERE data_validade < CURRENT_DATE
  AND status != 'vencido'
  AND excluido_em IS NULL;
" -t

# ============================================
# 3. Verificar produtos sem registro ANVISA
# ============================================
echo "3️⃣  Produtos sem Registro ANVISA:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  COUNT(*) AS produtos_sem_registro
FROM produtos
WHERE registro_anvisa IS NULL
  AND status = 'ativo'
  AND excluido_em IS NULL;
" -t

# ============================================
# 4. Verificar isolamento multi-tenant
# ============================================
echo "4️⃣  Isolamento Multi-tenant (RLS):"
psql "$SUPABASE_DB_URL" -c "
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
" -x

# ============================================
# 5. Performance: Queries lentas
# ============================================
echo "5️⃣  Top 5 Queries Lentas (pg_stat_statements):"
psql "$SUPABASE_DB_URL" -c "
SELECT
  SUBSTRING(query, 1, 60) AS query_snippet,
  calls,
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  ROUND(max_exec_time::numeric, 2) AS max_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY mean_exec_time DESC
LIMIT 5;
" || echo "   ⚠️  pg_stat_statements não habilitado"

# ============================================
# 6. Estatísticas gerais
# ============================================
echo ""
echo "6️⃣  Estatísticas Gerais:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  (SELECT COUNT(*) FROM empresas WHERE excluido_em IS NULL) AS empresas_ativas,
  (SELECT COUNT(*) FROM usuarios WHERE excluido_em IS NULL) AS usuarios_ativos,
  (SELECT COUNT(*) FROM produtos WHERE excluido_em IS NULL) AS produtos_cadastrados,
  (SELECT COUNT(*) FROM lotes WHERE excluido_em IS NULL) AS lotes_total,
  (SELECT COUNT(*) FROM cirurgias WHERE status IN ('agendada', 'confirmada')) AS cirurgias_futuras,
  (SELECT COUNT(*) FROM audit_log) AS registros_auditoria;
" -x

# Limpar arquivo temporário
rm "$TMP_FILE"

echo ""
echo "======================================"
echo "🎉 Auditoria concluída!"
echo ""
echo "📄 Para relatório completo, veja: supabase/auditoria_relatorio.md"

