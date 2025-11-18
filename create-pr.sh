#!/bin/bash

# Script para criar Pull Request no GitHub
# ICARUS v5.0 - Production Ready Release

set -e

echo "🚀 Criando Pull Request para ICARUS v5.0..."
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) não encontrado.${NC}"
    echo ""
    echo "📋 Siga os passos manuais:"
    echo ""
    echo "1️⃣  Acesse o GitHub:"
    echo -e "   ${BLUE}https://github.com/Icarus-AI-Technology/icarus-oficial/compare/main...release/v5.0-production-ready${NC}"
    echo ""
    echo "2️⃣  Clique em 'Create Pull Request'"
    echo ""
    echo "3️⃣  Copie o conteúdo de:"
    echo "   .github/PULL_REQUEST.md"
    echo ""
    echo "4️⃣  Cole na descrição da PR"
    echo ""
    echo "5️⃣  Revise e crie a PR"
    echo ""
    echo "✅ Ou instale o GitHub CLI:"
    echo "   brew install gh"
    echo "   gh auth login"
    echo "   ./create-pr.sh"
    exit 0
fi

# Verificar se está autenticado
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você precisa fazer login no GitHub CLI${NC}"
    echo ""
    echo "Execute: gh auth login"
    exit 1
fi

# Ler descrição da PR
PR_DESCRIPTION=$(cat .github/PULL_REQUEST.md)

# Criar PR
echo "📤 Criando Pull Request..."
echo ""

gh pr create \
  --base main \
  --head release/v5.0-production-ready \
  --title "🚀 ICARUS v5.0 - Production Ready Release" \
  --body "$PR_DESCRIPTION" \
  --label "release" \
  --label "production" \
  --label "ready-for-review"

echo ""
echo -e "${GREEN}✅ Pull Request criada com sucesso!${NC}"
echo ""
echo "🔗 Visualizar PR:"
gh pr view --web

echo ""
echo "📊 Status da PR:"
gh pr status

echo ""
echo -e "${GREEN}🎉 Pull Request pronta para review!${NC}"

