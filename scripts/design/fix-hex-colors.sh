#!/bin/bash
# ICARUS v5.0 - Substituição Automática de Hex Colors
# Substitui cores hex hardcoded por CSS variables

set -e

echo "🎨 ICARUS v5.0 - Substituição Automática de Hex Colors"
echo "======================================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TOTAL_REPLACEMENTS=0

echo "${YELLOW}Substituindo hex colors em arquivos .tsx/.ts...${NC}"
echo ""

# Função para substituir hex color
replace_hex() {
  local HEX="$1"
  local VAR="$2"
  local LABEL="$3"
  
  # Escapar # para grep
  local HEX_ESCAPED=$(echo "$HEX" | sed 's/#/\\#/g')
  
  # Contar arquivos afetados
  COUNT=$(find src/pages src/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "$HEX" {} \; 2>/dev/null | wc -l | xargs)
  
  if [ "$COUNT" -gt 0 ]; then
    echo "  $HEX → $VAR ($LABEL)"
    find src/pages src/components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s/$HEX/$VAR/g" {} \; 2>/dev/null || true
    echo "    ✓ $COUNT arquivo(s)"
    TOTAL_REPLACEMENTS=$((TOTAL_REPLACEMENTS + COUNT))
  fi
}

# Primary Colors
replace_hex "#6366F1" "var(--orx-primary)" "Primary"
replace_hex "#6366f1" "var(--orx-primary)" "Primary lowercase"
replace_hex "#4F46E5" "var(--orx-primary-hover)" "Primary Hover"
replace_hex "#4f46e5" "var(--orx-primary-hover)" "Primary Hover lowercase"
replace_hex "#818CF8" "var(--orx-primary-light)" "Primary Light"
replace_hex "#818cf8" "var(--orx-primary-light)" "Primary Light lowercase"

# White
replace_hex "#FFFFFF" "var(--orx-text-white)" "White"
replace_hex "#ffffff" "var(--orx-text-white)" "White lowercase"
replace_hex "#fff" "var(--orx-text-white)" "White short"
replace_hex "#FFF" "var(--orx-text-white)" "White SHORT"

# Text Colors
replace_hex "#1F2937" "var(--orx-text-primary)" "Text Primary"
replace_hex "#1f2937" "var(--orx-text-primary)" "Text Primary lowercase"
replace_hex "#6B7280" "var(--orx-text-secondary)" "Text Secondary"
replace_hex "#6b7280" "var(--orx-text-secondary)" "Text Secondary lowercase"

# Semantic Colors
replace_hex "#10B981" "var(--orx-success)" "Success"
replace_hex "#10b981" "var(--orx-success)" "Success lowercase"
replace_hex "#EF4444" "var(--orx-error)" "Error"
replace_hex "#ef4444" "var(--orx-error)" "Error lowercase"
replace_hex "#F59E0B" "var(--orx-warning)" "Warning"
replace_hex "#f59e0b" "var(--orx-warning)" "Warning lowercase"
replace_hex "#3B82F6" "var(--orx-info)" "Info"
replace_hex "#3b82f6" "var(--orx-info)" "Info lowercase"

# Backgrounds
replace_hex "#E8EBF3" "var(--orx-bg-light)" "BG Light"
replace_hex "#e8ebf3" "var(--orx-bg-light)" "BG Light lowercase"
replace_hex "#1A1D2E" "var(--orx-bg-dark)" "BG Dark"
replace_hex "#1a1d2e" "var(--orx-bg-dark)" "BG Dark lowercase"

echo ""
echo "======================================================"
echo "${GREEN}✅ Substituições de cores concluídas!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Total de arquivos corrigidos: $TOTAL_REPLACEMENTS"
echo ""

# Executar validação
if [ -f "scripts/qa/validate-hard-gates.mjs" ]; then
  echo "🔍 Executando validação pós-correção..."
  echo ""
  node scripts/qa/validate-hard-gates.mjs
fi

echo ""
echo "${GREEN}🎉 Processo de cores concluído!${NC}"
echo ""
