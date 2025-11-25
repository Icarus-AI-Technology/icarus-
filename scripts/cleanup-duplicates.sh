#!/bin/bash

###############################################################################
# Script: Limpeza de Componentes Duplicados
# Descrição: Remove componentes duplicados entre /components e /oraclusx-ds
# Data: 19 de Novembro de 2025
# Versão: 1.0
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ICARUS v5.0 - Limpeza de Componentes Duplicados             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Diretórios
COMPONENTS_DIR="src/components"
ORACLUSX_DIR="src/components/oraclusx-ds"

# Backup
BACKUP_DIR="backups/components-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}📦 Criando backup em: $BACKUP_DIR${NC}"
mkdir -p "$BACKUP_DIR"
cp -r "$COMPONENTS_DIR" "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
echo ""

# Lista de componentes duplicados
DUPLICATED_COMPONENTS=(
  "Accordion"
  "Alert"
  "Avatar"
  "Badge"
  "Breadcrumb"
  "Button"
  "Card"
  "CardKpi"
  "CadastroLayout"
  "ChatbotCloseButton"
  "ChatbotFAB"
  "ChatbotFABWithPrompt"
  "ChatbotWithResearch"
  "Checkbox"
  "Container"
  "DatePicker"
  "Dialog"
  "Drawer"
  "Dropdown"
  "FileUpload"
  "Form"
  "FormBanner"
  "FormFieldError"
  "IconButtonNeu"
  "Input"
  "InputContainer"
  "LibraryShowcase"
  "MiniBarChart"
  "MiniCard"
  "Modal"
  "NavigationBar"
  "NeomorphicCard"
  "NeomorphicIconBox"
  "NeumoButton"
  "NeumoInput"
  "NeumoSearchBar"
  "NeumoTextarea"
  "Pagination"
  "Progress"
  "Radio"
  "RadialProgress"
  "SearchContainer"
  "SearchField"
  "Select"
  "Skeleton"
  "SkeletonPage"
  "SkeletonRouteFallback"
  "Slider"
  "Stepper"
  "SubModulesNavigation"
  "Switch"
  "Table"
  "Tabs"
  "Textarea"
  "Toast"
  "Tooltip"
  "TopbarIconButton"
  "TrendIndicator"
)

echo -e "${YELLOW}🗑️  Deletando componentes duplicados...${NC}"
echo ""

DELETED_COUNT=0
FAILED_COUNT=0

for component in "${DUPLICATED_COMPONENTS[@]}"; do
  # Deletar component (.tsx)
  if [ -f "$COMPONENTS_DIR/$component.tsx" ]; then
    rm "$COMPONENTS_DIR/$component.tsx"
    echo -e "${GREEN}✅ Deletado:${NC} $component.tsx"
    ((DELETED_COUNT++))
  fi
  
  # Deletar stories (.stories.tsx)
  if [ -f "$COMPONENTS_DIR/$component.stories.tsx" ]; then
    rm "$COMPONENTS_DIR/$component.stories.tsx"
    echo -e "${GREEN}✅ Deletado:${NC} $component.stories.tsx"
    ((DELETED_COUNT++))
  fi
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Limpeza concluída!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "  📊 Arquivos deletados: ${GREEN}$DELETED_COUNT${NC}"
echo -e "  ❌ Erros: ${RED}$FAILED_COUNT${NC}"
echo -e "  📦 Backup: ${YELLOW}$BACKUP_DIR${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Atualizar imports em todos os arquivos:"
echo -e "   ${BLUE}npm run fix-imports${NC}"
echo ""
echo "2. Verificar se não há erros de compilação:"
echo -e "   ${BLUE}npm run type-check${NC}"
echo ""
echo "3. Rodar build para confirmar:"
echo -e "   ${BLUE}npm run build${NC}"
echo ""
echo "4. Se algo der errado, restaurar backup:"
echo -e "   ${BLUE}cp -r $BACKUP_DIR/components/* $COMPONENTS_DIR/${NC}"
echo ""

exit 0

