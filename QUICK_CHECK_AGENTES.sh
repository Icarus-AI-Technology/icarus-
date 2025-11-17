#!/bin/bash
# QUICK_CHECK_AGENTES.sh
# Verificação rápida do Sistema de Agentes ICARUS

echo "🤖 ICARUS - Verificação Rápida de Agentes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de verificação
check() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
    return 0
  else
    echo -e "${RED}❌${NC} $1"
    return 1
  fi
}

# Contadores
total=0
passed=0

echo ""
echo "📂 Verificando Arquivos de Configuração..."
check ".cursor/agents.json" && ((passed++)); ((total++))
check "README_AGENTES.md" && ((passed++)); ((total++))
check "docs/GUIA_AGENTES_ICARUS.md" && ((passed++)); ((total++))

echo ""
echo "🔧 Verificando Scripts de IA..."
check "tools/ia/ia-validator.js" && ((passed++)); ((total++))
check "tools/ia/check-edge-functions.js" && ((passed++)); ((total++))
check "tools/ia/auto-fix-configs.js" && ((passed++)); ((total++))

echo ""
echo "📊 Verificando Scripts Fiscais..."
check "tools/compliance/fiscal/check-erp-fiscal.js" && ((passed++)); ((total++))
check "tools/compliance/fiscal/list-obrigacoes.js" && ((passed++)); ((total++))
check "tools/compliance/fiscal/generate-alerts.js" && ((passed++)); ((total++))
check "tools/finance/simulador-lucro-real.js" && ((passed++)); ((total++))

echo ""
echo "⚖️  Verificando Scripts Legais..."
check "tools/compliance/legal/check-erp-legal.js" && ((passed++)); ((total++))
check "tools/compliance/legal/monitor-regulatorio.js" && ((passed++)); ((total++))
check "tools/legal/contracts-audit.js" && ((passed++)); ((total++))

echo ""
echo "📈 Verificando Scripts de Gestão..."
check "tools/analytics/map-kpis-executivos.js" && ((passed++)); ((total++))
check "tools/audit/auditar-modulos.js" && ((passed++)); ((total++))
check "tools/audit/sugerir-melhorias.js" && ((passed++)); ((total++))

echo ""
echo "🎓 Verificando Scripts do Tutor..."
check "tools/tutor/diagnosticar-sistema.js" && ((passed++)); ((total++))
check "tools/tutor/sumario-executivo.js" && ((passed++)); ((total++))
check "tools/tutor/parecer-compliance.js" && ((passed++)); ((total++))
check "tools/tutor/classificar-gaps.js" && ((passed++)); ((total++))
check "tools/tutor/gerar-tutores-por-modulo.js" && ((passed++)); ((total++))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESULTADO: $passed/$total arquivos encontrados"

if [ $passed -eq $total ]; then
  echo -e "${GREEN}✅ Sistema 100% Operacional!${NC}"
  echo ""
  echo "🚀 Comandos Rápidos:"
  echo "   node tools/ia/ia-validator.js              # Validar IA"
  echo "   node tools/tutor/diagnosticar-sistema.js   # Diagnóstico"
  echo "   node tools/tutor/classificar-gaps.js       # Gaps"
  echo "   node tools/tutor/parecer-compliance.js     # Compliance"
  exit 0
else
  echo -e "${RED}❌ Sistema Incompleto ($passed/$total)${NC}"
  exit 1
fi

