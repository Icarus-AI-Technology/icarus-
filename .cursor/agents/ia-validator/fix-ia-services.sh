#!/bin/bash

# 🤖 Script de Correção Automática de IAs Nativas
# Automatiza a instalação e configuração de todos os serviços de IA

set -e  # Parar em caso de erro

echo "🤖 Iniciando correção automática de IAs nativas..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. VERIFICAR/CRIAR .env
# ============================================================================
echo "📝 [1/5] Verificando arquivo .env..."

if [ ! -f .env ]; then
  echo "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
  echo "Criando .env a partir de env.example..."
  cp env.example .env
  echo "${GREEN}✅ .env criado${NC}"
else
  echo "${GREEN}✅ .env já existe${NC}"
fi

# ============================================================================
# 2. MEILISEARCH
# ============================================================================
echo ""
echo "🔍 [2/5] Configurando Meilisearch..."

if ! docker ps | grep -q meilisearch; then
  echo "${YELLOW}⚠️  Meilisearch não está rodando${NC}"
  echo "Iniciando Meilisearch via Docker..."
  
  # Criar diretório de dados
  mkdir -p data/meilisearch
  
  # Iniciar container
  docker run -d \
    --name meilisearch \
    -p 7700:7700 \
    -v "$(pwd)/data/meilisearch:/meili_data" \
    getmeili/meilisearch:latest \
    --master-key="MASTER_KEY_DEVELOPMENT_ONLY_CHANGE_IN_PROD" \
    2>/dev/null || {
      echo "${YELLOW}⚠️  Docker não disponível ou erro ao iniciar${NC}"
      echo "Execute manualmente: brew install meilisearch && meilisearch"
    }
  
  # Aguardar inicialização
  sleep 3
  
  if curl -s http://localhost:7700/health >/dev/null 2>&1; then
    echo "${GREEN}✅ Meilisearch iniciado${NC}"
  else
    echo "${RED}❌ Falha ao iniciar Meilisearch${NC}"
  fi
else
  echo "${GREEN}✅ Meilisearch já está rodando${NC}"
fi

# ============================================================================
# 3. TESSERACT.JS ASSETS
# ============================================================================
echo ""
echo "👁️  [3/5] Configurando Tesseract.js..."

if [ ! -d "public/tesseract" ]; then
  echo "${YELLOW}⚠️  Assets do Tesseract.js não encontrados${NC}"
  echo "Baixando assets..."
  
  mkdir -p public/tesseract
  
  # Worker
  curl -L -o public/tesseract/worker.min.js \
    https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js \
    2>/dev/null || echo "${RED}❌ Falha ao baixar worker${NC}"
  
  # WASM Core
  curl -L -o public/tesseract/tesseract-core.wasm.js \
    https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js \
    2>/dev/null || echo "${RED}❌ Falha ao baixar WASM${NC}"
  
  # Traineddata Português
  if [ -f "eng.traineddata" ]; then
    cp eng.traineddata public/tesseract/
    echo "${GREEN}✅ Copiado eng.traineddata existente${NC}"
  fi
  
  echo "${GREEN}✅ Assets do Tesseract.js configurados${NC}"
else
  echo "${GREEN}✅ Assets do Tesseract.js já existem${NC}"
fi

# ============================================================================
# 4. POSTHOG (OPCIONAL)
# ============================================================================
echo ""
echo "📊 [4/5] Verificando PostHog..."

if ! grep -q "VITE_POSTHOG_KEY" .env || grep -q "VITE_POSTHOG_KEY=$" .env; then
  echo "${YELLOW}⚠️  PostHog não configurado (opcional para dev)${NC}"
  echo "Para configurar:"
  echo "  1. Criar conta em https://posthog.com"
  echo "  2. Adicionar VITE_POSTHOG_KEY no .env"
else
  echo "${GREEN}✅ PostHog configurado${NC}"
fi

# ============================================================================
# 5. OLLAMA (JÁ VERIFICADO - SUGERIR MODELOS)
# ============================================================================
echo ""
echo "🦙 [5/5] Verificando Ollama..."

if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "${GREEN}✅ Ollama está rodando${NC}"
  
  # Sugerir modelos adicionais
  echo ""
  echo "💡 Modelos recomendados para instalar:"
  echo "   ollama pull codellama       # Código"
  echo "   ollama pull mistral         # Geral"
  echo "   ollama pull llama3.1:8b     # Já instalado ✓"
else
  echo "${RED}❌ Ollama não está rodando${NC}"
  echo "Instale com: brew install ollama"
  echo "Inicie com: ollama serve"
fi

# ============================================================================
# VALIDAÇÃO FINAL
# ============================================================================
echo ""
echo "============================================================"
echo "🎯 VALIDAÇÃO FINAL"
echo "============================================================"
echo ""

node .cursor/agents/ia-validator/validate-ia.js || true

echo ""
echo "============================================================"
echo "✅ Script de correção concluído!"
echo "============================================================"
echo ""
echo "📋 Próximos passos manuais:"
echo "   1. Verificar .env com suas credenciais reais"
echo "   2. Reiniciar o servidor dev: pnpm dev"
echo "   3. Testar formulário de contato: /contact"
echo ""

