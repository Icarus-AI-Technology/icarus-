#!/bin/bash

###############################################################################
# 🚀 ICARUS MAKE - DEPLOY TO VERCEL
# Última etapa antes do deploy de produção
###############################################################################

set -e  # Exit on error

echo "🚀 ICARUS MAKE - DEPLOY SCRIPT"
echo "================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se está na branch correta
echo "📋 Verificando branch..."
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "   Branch atual: $CURRENT_BRANCH"

# 2. Verificar se há mudanças não commitadas
if [[ -n $(git status -s 2>/dev/null) ]]; then
  echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
  echo "   Deseja continuar? (y/n)"
  read -r response
  if [[ "$response" != "y" ]]; then
    echo "❌ Deploy cancelado"
    exit 1
  fi
fi

# 3. Executar checklist pré-deploy
echo ""
echo "🔍 Executando checklist pré-deploy..."
echo ""

# 3.1 TypeScript
echo "   ⏳ TypeScript check..."
if npm run type-check > /dev/null 2>&1; then
  echo -e "   ${GREEN}✅ TypeScript: OK${NC}"
else
  echo -e "   ${YELLOW}⚠️  TypeScript: Warnings (não bloqueante)${NC}"
fi

# 3.2 Build
echo "   ⏳ Building..."
if npm run build > /dev/null 2>&1; then
  echo -e "   ${GREEN}✅ Build: OK${NC}"
else
  echo -e "   ${RED}❌ Build: FAILED${NC}"
  exit 1
fi

# 3.3 Verificar variáveis de ambiente
echo "   ⏳ Verificando .env..."
if [ -f .env ]; then
  echo -e "   ${GREEN}✅ .env: Encontrado${NC}"
else
  echo -e "   ${YELLOW}⚠️  .env: Não encontrado (use .env.example)${NC}"
fi

# 3.4 Verificar bundle size
BUNDLE_SIZE=$(du -sh dist/ | cut -f1)
echo "   📦 Bundle size: $BUNDLE_SIZE"

echo ""
echo "================================"
echo ""

# 4. Perguntar tipo de deploy
echo "Selecione o tipo de deploy:"
echo "  1) Preview (vercel)"
echo "  2) Production (vercel --prod)"
echo "  3) Cancelar"
echo ""
read -p "Opção: " option

case $option in
  1)
    echo ""
    echo "🚀 Iniciando deploy de PREVIEW..."
    vercel
    ;;
  2)
    echo ""
    echo "🚀 Iniciando deploy de PRODUÇÃO..."
    echo -e "${YELLOW}⚠️  ATENÇÃO: Deploy de produção!${NC}"
    read -p "Confirma? (yes/no): " confirm
    if [[ "$confirm" == "yes" ]]; then
      vercel --prod
    else
      echo "❌ Deploy cancelado"
      exit 1
    fi
    ;;
  3)
    echo "❌ Deploy cancelado"
    exit 0
    ;;
  *)
    echo "❌ Opção inválida"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "📊 Próximos passos:"
echo "  1. Verificar deploy no Vercel Dashboard"
echo "  2. Executar Lighthouse audit"
echo "  3. Testar funcionalidades críticas"
echo ""

