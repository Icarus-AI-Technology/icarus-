#!/bin/bash
# ============================================
# Script: Health Check do Banco de Dados
# Versão: 1.0
# Descrição: Verifica saúde e conectividade
# ============================================

set -e

echo "🏥 Health Check - Banco de Dados ICARUS"
echo "======================================="
echo ""

# Verificar variável de ambiente
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não configurada"
    exit 1
fi

START_TIME=$(date +%s)

# ============================================
# 1. Conectividade
# ============================================
echo "1️⃣  Conectividade:"
if psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Conexão estabelecida"
else
    echo "   ❌ FALHA na conexão"
    exit 1
fi
echo ""

# ============================================
# 2. Latência
# ============================================
echo "2️⃣  Latência (SELECT simples):"
LATENCY_START=$(date +%s%3N)
psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null
LATENCY_END=$(date +%s%3N)
LATENCY=$((LATENCY_END - LATENCY_START))

echo "   ⏱️  $LATENCY ms"
if [ "$LATENCY" -lt 100 ]; then
    echo "   ✅ Excelente (< 100ms)"
elif [ "$LATENCY" -lt 250 ]; then
    echo "   ⚠️  Aceitável (< 250ms)"
else
    echo "   ❌ Lento (> 250ms)"
fi
echo ""

# ============================================
# 3. Extensões necessárias
# ============================================
echo "3️⃣  Extensões Necessárias:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  extname AS extensao,
  extversion AS versao
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm')
ORDER BY extname;
"

# ============================================
# 4. Tamanho do banco
# ============================================
echo "4️⃣  Tamanho do Banco:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  pg_size_pretty(pg_database_size(current_database())) AS tamanho_total;
"

# ============================================
# 5. Tabelas principais
# ============================================
echo "5️⃣  Tabelas Principais (registros):"
psql "$SUPABASE_DB_URL" -c "
SELECT
  'empresas' AS tabela,
  COUNT(*) AS registros
FROM empresas WHERE excluido_em IS NULL
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios WHERE excluido_em IS NULL
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos WHERE excluido_em IS NULL
UNION ALL
SELECT 'lotes', COUNT(*) FROM lotes WHERE excluido_em IS NULL
UNION ALL
SELECT 'cirurgias', COUNT(*) FROM cirurgias WHERE excluido_em IS NULL
UNION ALL
SELECT 'kits', COUNT(*) FROM kits WHERE excluido_em IS NULL
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
"

# ============================================
# 6. Conexões ativas
# ============================================
echo "6️⃣  Conexões Ativas:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  COUNT(*) AS conexoes_ativas
FROM pg_stat_activity
WHERE state = 'active';
"

# ============================================
# 7. Locks
# ============================================
echo "7️⃣  Locks Ativos:"
LOCKS=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM pg_locks
WHERE granted = false;
")

echo "   $LOCKS locks bloqueados"
if [ "$LOCKS" -gt 0 ]; then
    echo "   ⚠️  Atenção: existem locks bloqueados"
    psql "$SUPABASE_DB_URL" -c "
    SELECT
      locktype,
      relation::regclass AS tabela,
      mode,
      granted
    FROM pg_locks
    WHERE granted = false
    LIMIT 5;
    "
else
    echo "   ✅ Nenhum lock bloqueado"
fi
echo ""

# ============================================
# 8. Test de RLS (proteção multi-tenant)
# ============================================
echo "8️⃣  Teste RLS (Multi-tenant):"
RLS_TEST=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM pg_policies
WHERE schemaname = 'public';
")

echo "   $RLS_TEST policies configuradas"
if [ "$RLS_TEST" -lt 10 ]; then
    echo "   ⚠️  Poucas policies configuradas (esperado: 30+)"
else
    echo "   ✅ Policies configuradas"
fi
echo ""

# ============================================
# Tempo total
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "======================================="
echo "✅ Health Check concluído em ${DURATION}s"
echo ""
echo "📊 Resumo:"
echo "   - Conectividade: OK"
echo "   - Latência: ${LATENCY}ms"
echo "   - Extensões: Verificadas"
echo "   - Locks: $LOCKS bloqueados"
echo "   - RLS Policies: $RLS_TEST configuradas"

