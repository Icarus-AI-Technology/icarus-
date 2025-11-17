#!/bin/bash

# 🎯 Quick Start - IA Validator Agent
# Validação rápida de todas as IAs nativas

echo "🤖 IA VALIDATOR - QUICK START"
echo "======================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Menu
echo "Escolha uma opção:"
echo ""
echo "1. Validar IAs (Verificar status)"
echo "2. Corrigir Automaticamente"
echo "3. Ver Último Relatório"
echo "4. Instalar Meilisearch"
echo "5. Status dos Serviços"
echo ""
read -p "Opção [1-5]: " option

case $option in
  1)
    echo ""
    echo "🔍 Validando IAs..."
    export $(cat .env | grep -v '^#' | xargs 2>/dev/null)
    node .cursor/agents/ia-validator/validate-ia.js
    ;;
    
  2)
    echo ""
    echo "🔧 Executando correção automática..."
    bash .cursor/agents/ia-validator/fix-ia-services.sh
    ;;
    
  3)
    echo ""
    echo "📄 Último relatório:"
    LAST_REPORT=$(ls -t .cursor/agents/ia-validator/validation-*.json 2>/dev/null | head -1)
    if [ -n "$LAST_REPORT" ]; then
      cat "$LAST_REPORT" | jq '.'
    else
      echo "Nenhum relatório encontrado"
    fi
    ;;
    
  4)
    echo ""
    echo "📦 Instalando Meilisearch..."
    if command -v brew &> /dev/null; then
      brew install meilisearch
      echo ""
      echo "${GREEN}✅ Instalado! Para iniciar:${NC}"
      echo "meilisearch --master-key=\"DEV_KEY\" &"
    else
      echo "${YELLOW}⚠️  Homebrew não encontrado${NC}"
      echo "Use Docker:"
      echo "docker run -d -p 7700:7700 getmeili/meilisearch:latest"
    fi
    ;;
    
  5)
    echo ""
    echo "📊 Status dos Serviços:"
    echo ""
    
    # Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
      echo "✅ Ollama: Rodando"
    else
      echo "❌ Ollama: Não acessível"
    fi
    
    # Meilisearch
    if curl -s http://localhost:7700/health > /dev/null 2>&1; then
      echo "✅ Meilisearch: Rodando"
    else
      echo "❌ Meilisearch: Não acessível"
    fi
    
    # Supabase
    if [ -n "$VITE_SUPABASE_URL" ]; then
      echo "✅ Supabase: Configurado"
    else
      echo "❌ Supabase: Não configurado"
    fi
    
    # Tesseract
    if [ -d "public/tesseract" ]; then
      echo "✅ Tesseract.js: Assets instalados"
    else
      echo "❌ Tesseract.js: Assets não encontrados"
    fi
    
    # PostHog
    if [ -n "$VITE_POSTHOG_KEY" ]; then
      echo "✅ PostHog: Configurado"
    else
      echo "⚠️  PostHog: Não configurado (opcional)"
    fi
    ;;
    
  *)
    echo "Opção inválida"
    exit 1
    ;;
esac

echo ""
echo "======================================"
echo "Para mais informações:"
echo "cat .cursor/agents/ia-validator/README.md"

