#!/bin/bash
# Script para fazer refresh inicial das views materializadas
# Data: 2025-10-25

set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║         🔄 REFRESH VIEWS MATERIALIZADAS - AGENTE 03                  ║"
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
echo "🔄 FAZENDO REFRESH DE TODAS AS VIEWS MATERIALIZADAS..."
echo ""
echo "⏱️  Isso pode levar alguns minutos dependendo do volume de dados."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Executar função de refresh
psql "$DATABASE_URL" -c "SELECT public.refresh_materialized_views();"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ REFRESH CONCLUÍDO!"
echo ""
echo "📊 Status das Views:"
echo ""

psql "$DATABASE_URL" -c "
SELECT 
  matviewname as \"View\",
  pg_size_pretty(pg_total_relation_size('public.'||matviewname)) as \"Tamanho\"
FROM pg_matviews 
WHERE schemaname = 'public'
AND matviewname LIKE 'mv_%'
ORDER BY matviewname;
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ VIEWS MATERIALIZADAS PRONTAS PARA USO!"
echo ""
echo "💡 Recomendação: Configure refresh automático"
echo ""
echo "   Críticas (5-15 min): mv_dashboard_kpis, mv_estoque_status"
echo "   Importantes (1 hora): mv_compliance_score, mv_rastreabilidade_resumo"
echo "   Estatísticas (diário): demais views"
echo ""

