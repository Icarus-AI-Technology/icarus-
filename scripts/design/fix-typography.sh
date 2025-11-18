#!/bin/bash
# ICARUS v5.0 - Correção Automática de Typography
# Substitui text-*/font-* por classes OraclusX DS

set -e

echo "🔧 ICARUS v5.0 - Correção Automática de Typography"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de substituições
TOTAL_REPLACEMENTS=0

echo "📋 Executando substituições..."
echo ""

# ============================================
# 1. TEXT-* SIZES → CSS CLASSES
# ============================================

echo "${YELLOW}[1/4]${NC} Substituindo text-xs → orx-text-xs"
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "text-xs" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-xs\b/orx-text-xs/g' {} \;
  echo "  ✓ $FILES_CHANGED arquivo(s) atualizados"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
else
  echo "  ℹ Nenhuma ocorrência encontrada"
fi

echo "${YELLOW}[2/4]${NC} Substituindo text-sm → orx-text-sm"
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "text-sm" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-sm\b/orx-text-sm/g' {} \;
  echo "  ✓ $FILES_CHANGED arquivo(s) atualizados"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
else
  echo "  ℹ Nenhuma ocorrência encontrada"
fi

echo "${YELLOW}[3/4]${NC} Substituindo text-base → orx-text-base"
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "text-base" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-base\b/orx-text-base/g' {} \;
  echo "  ✓ $FILES_CHANGED arquivo(s) atualizados"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
else
  echo "  ℹ Nenhuma ocorrência encontrada"
fi

echo "${YELLOW}[4/4]${NC} Substituindo text-lg → orx-text-lg"
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "text-lg" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-lg\b/orx-text-lg/g' {} \;
  echo "  ✓ $FILES_CHANGED arquivo(s) atualizados"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
else
  echo "  ℹ Nenhuma ocorrência encontrada"
fi

# ============================================
# 2. FONT-* WEIGHTS → CSS CLASSES
# ============================================

echo ""
echo "${YELLOW}[Font Weights]${NC} Substituindo font-* por orx-font-*"

# font-semibold
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "font-semibold" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-semibold\b/orx-font-semibold/g' {} \;
  echo "  ✓ font-semibold: $FILES_CHANGED arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
fi

# font-bold
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "font-bold" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-bold\b/orx-font-bold/g' {} \;
  echo "  ✓ font-bold: $FILES_CHANGED arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
fi

# font-medium
FILES_CHANGED=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "font-medium" {} \; | wc -l)
if [ "$FILES_CHANGED" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-medium\b/orx-font-medium/g' {} \;
  echo "  ✓ font-medium: $FILES_CHANGED arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + FILES_CHANGED))
fi

# ============================================
# 3. VALIDAÇÃO PÓS-CORREÇÃO
# ============================================

echo ""
echo "=================================================="
echo "${GREEN}✅ Correções aplicadas com sucesso!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Total de substituições: $TOTAL_REPLACEMENTS"
echo ""

# Executar validação
if [ -f "scripts/qa/validate-hard-gates.mjs" ]; then
  echo "🔍 Executando validação pós-correção..."
  echo ""
  node scripts/qa/validate-hard-gates.mjs
else
  echo "${YELLOW}⚠ Validador não encontrado. Pulando validação.${NC}"
fi

echo ""
echo "${GREEN}🎉 Processo concluído!${NC}"
echo ""

