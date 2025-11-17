#!/bin/bash

# ICARUS v5.0 - Script de Verificação Rápida
# Data: 27/10/2025
# Versão: 1.0.0

set -e

echo "🚀 ICARUS v5.0 - Verificação Rápida"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Verificar dependências do sistema
echo "📦 1. Verificando dependências do sistema..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    log_success "Node.js: $NODE_VERSION"
else
    log_error "Node.js não encontrado!"
    exit 1
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    log_success "pnpm: $PNPM_VERSION"
else
    log_error "pnpm não encontrado!"
    exit 1
fi

if command -v deno &> /dev/null; then
    DENO_VERSION=$(deno -V)
    log_success "Deno: $DENO_VERSION"
else
    log_warning "Deno não encontrado (opcional para Supabase)"
fi

echo ""

# 2. Verificar estrutura de arquivos
echo "📂 2. Verificando estrutura de arquivos..."

check_file() {
    if [ -f "$1" ]; then
        log_success "$1"
    else
        log_warning "$1 não encontrado"
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        log_success "$1/"
    else
        log_warning "$1/ não encontrado"
    fi
}

check_file ".cursor/agents.json"
check_dir "tools/env"
check_dir "tools/qa"
check_dir "tools/migration"
check_dir "tools/supabase"
check_file "scripts/verify-supabase-status.ts"
check_file "ICARUS_V5_PLANO_OPERACIONAL.md"

echo ""

# 3. Verificar .env
echo "🔐 3. Verificando variáveis de ambiente..."
if [ -f ".env.local" ]; then
    log_info "Executando validação de .env.local..."
    if node tools/env/validate-env.js .env.local 2>&1 | grep -q "✅"; then
        log_success ".env.local válido"
    else
        log_warning ".env.local tem problemas - execute: pnpm env:validate"
    fi
else
    log_warning ".env.local não encontrado - execute: pnpm env:generate:dev"
fi

echo ""

# 4. Verificar node_modules
echo "📚 4. Verificando node_modules..."
if [ -d "node_modules" ]; then
    log_success "node_modules encontrado"
else
    log_warning "node_modules não encontrado - execute: pnpm install"
fi

echo ""

# 5. Gerar relatórios rápidos
echo "📊 5. Gerando relatórios rápidos..."

log_info "Gerando matriz de cobertura..."
if node tools/qa/generate-coverage-matrix.js 2>&1 | grep -q "✅"; then
    log_success "Matriz de cobertura gerada"
else
    log_warning "Erro ao gerar matriz de cobertura"
fi

log_info "Verificando Supabase RLS..."
if node tools/supabase/check-rls.js 2>&1 | grep -q "Relatório salvo"; then
    log_success "Relatório RLS gerado"
else
    log_warning "Erro ao verificar RLS"
fi

log_info "Listando Edge Functions..."
if node tools/supabase/list-edge-fns.js 2>&1 | grep -q "✅"; then
    log_success "Edge Functions listadas"
else
    log_warning "Erro ao listar Edge Functions"
fi

echo ""

# 6. Resumo
echo "📋 RESUMO"
echo "========="
echo ""

if [ -f "coverage-matrix.json" ]; then
    COVERAGE=$(node -e "const d=require('./coverage-matrix.json'); console.log(d.summary.coveragePercentage+'%');")
    log_info "Cobertura de testes: $COVERAGE"
fi

if [ -f "rls-report.json" ]; then
    RLS_COM=$(node -e "const d=require('./rls-report.json'); console.log(d.tablesWithRLS.length);")
    RLS_SEM=$(node -e "const d=require('./rls-report.json'); console.log(d.tablesWithoutRLS.length);")
    log_info "Tabelas com RLS: $RLS_COM"
    log_warning "Tabelas sem RLS: $RLS_SEM"
fi

if [ -f "edge-functions-report.json" ]; then
    FUNCTIONS=$(node -e "const d=require('./edge-functions-report.json'); console.log(d.totalFunctions);")
    log_info "Edge Functions: $FUNCTIONS"
fi

echo ""
echo "✅ Verificação completa!"
echo ""
echo "📚 Próximos comandos úteis:"
echo "   pnpm deps:check          # Verificar dependências"
echo "   pnpm env:validate        # Validar .env"
echo "   pnpm supabase:status     # Status do Supabase"
echo "   pnpm migration:plan      # Planejar migração"
echo "   pnpm validate:all        # Validação completa"
echo ""
echo "📖 Documentação completa: ICARUS_V5_PLANO_OPERACIONAL.md"
echo "⚡ Comandos rápidos: ICARUS_V5_ACESSO_RAPIDO.md"

