#!/bin/bash

# 🔌 AGENTE 04: Integrações & APIs
# Script de execução principal

set -e

echo "🔌 AGENTE 04: Integrações & APIs"
echo "=================================="
echo ""

START_TIME=$(date +%s)

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$(dirname "$0")"

# Criar diretório de resultados
mkdir -p subagents

echo "📋 Fase 1: Verificando pré-requisitos..."
echo ""

# Voltar para o diretório raiz do projeto
PROJECT_ROOT="$(cd ../.. && pwd)"
cd "$PROJECT_ROOT"

# Verificar se o projeto tem as dependências necessárias
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    exit 1
fi

echo "✅ Pré-requisitos verificados"
echo ""

# Fase 2: Executar subagentes
echo "🚀 Fase 2: Executando subagentes..."
echo ""

AGENT_DIR=".cursor/agents/04-integrations"

# 4.1 - APIs Externas (40% - 20 min)
echo "${YELLOW}[4.1]${NC} APIs Externas..."
npx tsx "$AGENT_DIR/subagents/4.1-external-apis.ts" 2>&1 | tee "$AGENT_DIR/subagents/4.1-output.log" || true
echo ""

# 4.2 - Supabase Services (25% - 11 min)
echo "${YELLOW}[4.2]${NC} Supabase Services..."
npx tsx "$AGENT_DIR/subagents/4.2-supabase-services.ts" 2>&1 | tee "$AGENT_DIR/subagents/4.2-output.log" || true
echo ""

# 4.3 - Transportadoras (20% - 9 min)
echo "${YELLOW}[4.3]${NC} Transportadoras..."
npx tsx "$AGENT_DIR/subagents/4.3-transportadoras.ts" 2>&1 | tee "$AGENT_DIR/subagents/4.3-output.log" || true
echo ""

# 4.4 - Webhooks & Queue (15% - 7 min)
echo "${YELLOW}[4.4]${NC} Webhooks & Queue..."
npx tsx "$AGENT_DIR/subagents/4.4-webhooks-queue.ts" 2>&1 | tee "$AGENT_DIR/subagents/4.4-output.log" || true
echo ""

# Fase 3: Consolidar resultados
echo "📊 Fase 3: Consolidando resultados..."
echo ""
npx tsx "$AGENT_DIR/consolidate.ts" 2>&1 | tee "$AGENT_DIR/consolidate.log" || true
echo ""

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "${GREEN}✅ AGENTE 04 CONCLUÍDO${NC}"
echo "Duração: ${DURATION}s"
echo ""
echo "📄 Relatórios gerados:"
echo "  - consolidated-report.json"
echo "  - REPORT.md"
echo ""

