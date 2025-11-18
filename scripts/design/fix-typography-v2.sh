#!/bin/bash
# ICARUS v5.0 - Correção Automática Typography V2 (Agressiva)
# Inclui TODAS as variantes text-* e font-*

set -e

echo "🚀 ICARUS v5.0 - Correção Automática Typography V2 (AGRESSIVA)"
echo "================================================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

TOTAL_REPLACEMENTS=0

# ============================================
# TEXT-* SIZES (TODOS OS TAMANHOS)
# ============================================

echo "${YELLOW}[1/15]${NC} Substituindo text-xs → orx-text-xs"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-xs\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-xs\b/orx-text-xs/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[2/15]${NC} Substituindo text-sm → orx-text-sm"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-sm\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-sm\b/orx-text-sm/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[3/15]${NC} Substituindo text-base → orx-text-base"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-base\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-base\b/orx-text-base/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[4/15]${NC} Substituindo text-lg → orx-text-lg"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-lg\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-lg\b/orx-text-lg/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[5/15]${NC} Substituindo text-xl → orx-text-xl"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-xl\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-xl\b/orx-text-xl/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[6/15]${NC} Substituindo text-2xl → orx-text-2xl"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-2xl\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-2xl\b/orx-text-2xl/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[7/15]${NC} Substituindo text-3xl → orx-text-3xl"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-3xl\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-3xl\b/orx-text-3xl/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[8/15]${NC} Substituindo text-4xl → orx-text-4xl"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\btext-4xl\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\btext-4xl\b/orx-text-4xl/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

# ============================================
# FONT-* WEIGHTS (TODOS OS PESOS)
# ============================================

echo ""
echo "${YELLOW}[9/15]${NC} Substituindo font-thin → orx-font-thin"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-thin\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-thin\b/orx-font-thin/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[10/15]${NC} Substituindo font-light → orx-font-light"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-light\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-light\b/orx-font-light/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[11/15]${NC} Substituindo font-normal → orx-font-normal"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-normal\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-normal\b/orx-font-normal/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[12/15]${NC} Substituindo font-medium → orx-font-medium"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-medium\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-medium\b/orx-font-medium/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[13/15]${NC} Substituindo font-semibold → orx-font-semibold"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-semibold\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-semibold\b/orx-font-semibold/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[14/15]${NC} Substituindo font-bold → orx-font-bold"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-bold\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-bold\b/orx-font-bold/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

echo "${YELLOW}[15/15]${NC} Substituindo font-extrabold → orx-font-extrabold"
COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\bfont-extrabold\b" {} \; 2>/dev/null | wc -l | xargs)
if [ "$COUNT" -gt 0 ]; then
  find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/\bfont-extrabold\b/orx-font-extrabold/g' {} \; 2>/dev/null || true
  echo "  ✓ $COUNT arquivo(s)"
  TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
else
  echo "  ℹ Nenhuma ocorrência"
fi

# ============================================
# RESUMO E VALIDAÇÃO
# ============================================

echo ""
echo "================================================================="
echo "${GREEN}✅ Correções V2 aplicadas com sucesso!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Total de arquivos corrigidos: $TOTAL_REPLACEMENTS"
echo ""

# Executar validação
if [ -f "scripts/qa/validate-hard-gates.mjs" ]; then
  echo "🔍 Executando validação pós-correção..."
  echo ""
  node scripts/qa/validate-hard-gates.mjs
else
  echo "${YELLOW}⚠ Validador não encontrado.${NC}"
fi

echo ""
echo "${GREEN}🎉 Processo V2 concluído!${NC}"
echo ""

