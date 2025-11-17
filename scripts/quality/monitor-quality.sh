#!/bin/bash

#==============================================================================
# Script: Monitor de Qualidade Contínua - ICARUS v5.0
# Objetivo: Monitorar métricas de qualidade e alertar sobre degradações
# Uso: ./scripts/quality/monitor-quality.sh
#==============================================================================

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     📊 MONITOR DE QUALIDADE - ICARUS v5.0                   ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Thresholds (mínimos aceitáveis)
MIN_QUALITY_SCORE=95
MIN_TEST_COVERAGE=50
MAX_ANY_TYPES=50
MIN_JSDOC_COVERAGE=85
MAX_LINT_ERRORS=20

# Contadores
issues=0
warnings=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 COLETANDO MÉTRICAS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

#==============================================================================
# 1. CONTAGEM DE 'ANY' TYPES
#==============================================================================
echo "📌 1. Verificando 'any' types..."
any_count=$(grep -r ": any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".test.ts" | wc -l | tr -d ' ')

if [ "$any_count" -gt "$MAX_ANY_TYPES" ]; then
  echo -e "  ${RED}❌ CRÍTICO: $any_count 'any' types encontrados (máx: $MAX_ANY_TYPES)${NC}"
  issues=$((issues + 1))
else
  echo -e "  ${GREEN}✅ OK: $any_count 'any' types (máx: $MAX_ANY_TYPES)${NC}"
fi

#==============================================================================
# 2. LINT ERRORS
#==============================================================================
echo ""
echo "📌 2. Verificando ESLint..."
lint_errors=$(npx eslint src/ --format=json 2>/dev/null | jq '[.[] | .errorCount] | add' 2>/dev/null || echo "0")

if [ "$lint_errors" -gt "$MAX_LINT_ERRORS" ]; then
  echo -e "  ${RED}❌ CRÍTICO: $lint_errors erros de lint (máx: $MAX_LINT_ERRORS)${NC}"
  issues=$((issues + 1))
elif [ "$lint_errors" -gt 0 ]; then
  echo -e "  ${YELLOW}⚠️  ATENÇÃO: $lint_errors erros de lint${NC}"
  warnings=$((warnings + 1))
else
  echo -e "  ${GREEN}✅ OK: Sem erros de lint${NC}"
fi

#==============================================================================
# 3. TYPE CHECKING
#==============================================================================
echo ""
echo "📌 3. Verificando TypeScript..."
tsc_output=$(npx tsc --noEmit -p tsconfig.json 2>&1)
tsc_errors=$(echo "$tsc_output" | grep -c "error TS" || echo "0")

if [ "$tsc_errors" -gt 10 ]; then
  echo -e "  ${RED}❌ CRÍTICO: $tsc_errors erros de TypeScript${NC}"
  issues=$((issues + 1))
elif [ "$tsc_errors" -gt 0 ]; then
  echo -e "  ${YELLOW}⚠️  ATENÇÃO: $tsc_errors erros de TypeScript${NC}"
  warnings=$((warnings + 1))
else
  echo -e "  ${GREEN}✅ OK: Sem erros de TypeScript${NC}"
fi

#==============================================================================
# 4. TEST COVERAGE
#==============================================================================
echo ""
echo "📌 4. Verificando cobertura de testes..."
test_files=$(find src/hooks/__tests__ -name "*.test.ts" 2>/dev/null | wc -l | tr -d ' ')
hook_files=$(find src/hooks -name "*.ts" ! -name "index.ts" ! -path "*/\__tests__*" 2>/dev/null | wc -l | tr -d ' ')

if [ "$hook_files" -gt 0 ]; then
  coverage_percent=$((test_files * 100 / hook_files))
  
  if [ "$coverage_percent" -lt "$MIN_TEST_COVERAGE" ]; then
    echo -e "  ${RED}❌ CRÍTICO: $coverage_percent% hooks testados (mín: $MIN_TEST_COVERAGE%)${NC}"
    issues=$((issues + 1))
  else
    echo -e "  ${GREEN}✅ OK: $coverage_percent% hooks testados ($test_files/$hook_files)${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  ATENÇÃO: Nenhum hook encontrado${NC}"
fi

#==============================================================================
# 5. JSDOC COVERAGE
#==============================================================================
echo ""
echo "📌 5. Verificando JSDoc coverage..."
functions_with_jsdoc=$(grep -r "\/\*\*" src/lib/ src/components/ErrorBoundary.tsx 2>/dev/null | wc -l | tr -d ' ')

if [ "$functions_with_jsdoc" -lt 20 ]; then
  echo -e "  ${YELLOW}⚠️  ATENÇÃO: $functions_with_jsdoc funções documentadas (esperado: 20+)${NC}"
  warnings=$((warnings + 1))
else
  echo -e "  ${GREEN}✅ OK: $functions_with_jsdoc funções documentadas${NC}"
fi

#==============================================================================
# 6. SECURITY CHECKS
#==============================================================================
echo ""
echo "📌 6. Verificando segurança..."

# Hardcoded secrets
secrets_found=$(grep -rE "(password|secret|key)\s*=\s*['\"][^'\"]+['\"]" src/ 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

if [ "$secrets_found" -gt 0 ]; then
  echo -e "  ${RED}❌ CRÍTICO: $secrets_found possíveis secrets hardcoded${NC}"
  issues=$((issues + 1))
else
  echo -e "  ${GREEN}✅ OK: Nenhum secret hardcoded detectado${NC}"
fi

#==============================================================================
# RESUMO
#==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA ANÁLISE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$issues" -eq 0 ] && [ "$warnings" -eq 0 ]; then
  echo -e "${GREEN}✅ EXCELENTE! Código mantém padrão de 100%${NC}"
  echo ""
  echo "🏆 Todas as métricas dentro dos padrões!"
  exit_code=0
elif [ "$issues" -eq 0 ]; then
  echo -e "${YELLOW}⚠️  ATENÇÃO: $warnings warnings encontrados${NC}"
  echo ""
  echo "💡 Considere corrigir os warnings para manter 100%"
  exit_code=0
else
  echo -e "${RED}❌ CRÍTICO: $issues issues encontrados${NC}"
  echo -e "${YELLOW}⚠️  $warnings warnings adicionais${NC}"
  echo ""
  echo "🚨 AÇÃO NECESSÁRIA! Quality score abaixo do mínimo."
  exit_code=1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Salvar métricas para histórico
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
echo "$timestamp | any: $any_count | lint: $lint_errors | tsc: $tsc_errors | coverage: $coverage_percent% | jsdoc: $functions_with_jsdoc" >> logs/quality-metrics.log

echo "📈 Métricas salvas em: logs/quality-metrics.log"
echo ""

exit $exit_code

