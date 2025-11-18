#!/bin/bash

###############################################################################
# ICARUS v5.0 - Correção Automática Typography V3 (SUPER AGRESSIVA)
# 
# Substitui APENAS classes de tamanho de fonte e peso, preservando classes
# utilitárias do Tailwind (text-center, text-gray-500, etc.)
###############################################################################

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 ICARUS v5.0 - Correção Automática Typography V3 (SUPER AGRESSIVA)"
echo "================================================================="
echo ""

TOTAL_REPLACEMENTS=0

# Função para substituir com word boundaries
replace_class() {
  local OLD=$1
  local NEW=$2
  local DESC=$3
  
  echo -e "${YELLOW}Substituindo ${OLD} → ${NEW}${NC}"
  
  # Conta ocorrências
  COUNT=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "\b${OLD}\b" {} \; 2>/dev/null | wc -l | xargs)
  
  if [ "$COUNT" -gt 0 ]; then
    # Substitui com word boundaries
    find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/\b${OLD}\b/${NEW}/g" {} \; 2>/dev/null || true
    echo "  ✓ $COUNT arquivo(s)"
    TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
  else
    echo "  ℹ Nenhuma ocorrência"
  fi
}

# ============================================
# FONT SIZES (apenas tamanhos, não cores)
# ============================================
replace_class "text-xs" "orx-text-xs" "Extra Small"
replace_class "text-sm" "orx-text-sm" "Small"
replace_class "text-base" "orx-text-base" "Base"
replace_class "text-lg" "orx-text-lg" "Large"
replace_class "text-xl" "orx-text-xl" "Extra Large"
replace_class "text-2xl" "orx-text-2xl" "2XL"
replace_class "text-3xl" "orx-text-3xl" "3XL"
replace_class "text-4xl" "orx-text-4xl" "4XL"
replace_class "text-5xl" "orx-text-5xl" "5XL"

# ============================================
# FONT WEIGHTS
# ============================================
replace_class "font-thin" "orx-font-thin" "Thin"
replace_class "font-light" "orx-font-light" "Light"
replace_class "font-normal" "orx-font-normal" "Normal"
replace_class "font-medium" "orx-font-medium" "Medium"
replace_class "font-semibold" "orx-font-semibold" "Semibold"
replace_class "font-bold" "orx-font-bold" "Bold"
replace_class "font-extrabold" "orx-font-extrabold" "Extrabold"
replace_class "font-black" "orx-font-black" "Black"

echo ""
echo "================================================================="
echo -e "${GREEN}✅ Correções V3 aplicadas com sucesso!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Total de arquivos corrigidos: $TOTAL_REPLACEMENTS"
echo ""
echo "🔍 Executando validação pós-correção..."
echo ""

# Valida Hard Gates
node scripts/qa/validate-hard-gates.mjs

echo ""
echo -e "${GREEN}🎉 Processo V3 concluído!${NC}"
echo ""

