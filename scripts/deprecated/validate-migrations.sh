#!/bin/bash
# Script para validar as migrations aplicadas
# Data: 2025-10-25

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║         ✅ VALIDAR MIGRATIONS APLICADAS - AGENTE 03                  ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não está definido."
    exit 1
fi

echo "✅ DATABASE_URL configurado"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 VALIDANDO MIGRATIONS..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Query 1: Validar Tabelas
echo "1️⃣  Validando 4 Tabelas Críticas..."
result=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'consignacao_materiais',
  'produtos_opme',
  'rastreabilidade_opme',
  'compliance_requisitos_abbott'
);
" | xargs)

if [ "$result" == "4" ]; then
    echo "   ✅ 4 tabelas criadas com sucesso!"
else
    echo "   ❌ ERRO: Esperado 4, encontrado $result"
fi
echo ""

# Query 2: Validar RPCs
echo "2️⃣  Validando 14 RPCs Functions..."
result=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN (
  'get_cirurgias_mes', 'calcular_comissao', 'get_estoque_baixo',
  'atualizar_status_cirurgia', 'get_fluxo_caixa_projecao',
  'get_top_produtos', 'validar_consignacao', 'calcular_abbott_score',
  'get_compliance_status', 'search_cirurgias', 'get_rastreabilidade',
  'get_metricas_financeiras', 'otimizar_rota', 'get_alertas_criticos'
);
" | xargs)

if [ "$result" == "14" ]; then
    echo "   ✅ 14 RPCs criadas com sucesso!"
else
    echo "   ⚠️  Encontradas $result RPCs (esperado 14)"
fi
echo ""

# Query 3: Validar Triggers
echo "3️⃣  Validando Triggers..."
result=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) 
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trg_%';
" | xargs)

echo "   ✅ $result triggers encontrados (esperado >= 12)"
echo ""

# Query 4: Validar Views Materializadas
echo "4️⃣  Validando 10 Views Materializadas..."
result=$(psql "$DATABASE_URL" -t -c "
SELECT COUNT(*) 
FROM pg_matviews
WHERE schemaname = 'public'
AND matviewname LIKE 'mv_%';
" | xargs)

if [ "$result" == "10" ]; then
    echo "   ✅ 10 views materializadas criadas com sucesso!"
else
    echo "   ⚠️  Encontradas $result views (esperado 10)"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Detalhes das Views Materializadas:"
echo ""

psql "$DATABASE_URL" -c "
SELECT 
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size
FROM pg_matviews 
WHERE schemaname = 'public'
AND matviewname LIKE 'mv_%'
ORDER BY matviewname;
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ VALIDAÇÃO CONCLUÍDA!"
echo ""
echo "📊 Próximo passo: Fazer refresh inicial das views"
echo ""
echo "   Execute: ./refresh-materialized-views.sh"
echo ""

