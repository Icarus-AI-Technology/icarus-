#!/bin/bash

# Script de Aplicação Automática - ICARUS v5.0
# Project: ttswvavcisdnonytslom

set -e

PROJECT_REF="ttswvavcisdnonytslom"
PROJECT_ROOT="/Users/daxmeneghel/icarus-make"

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          🚀 Aplicação de Migrations - ICARUS v5.0                     ║"
echo "║          Project: ttswvavcisdnonytslom                                ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não instalado"
    echo ""
    echo "📦 Instalando via Homebrew..."
    brew install supabase/tap/supabase
    echo ""
fi

echo "✅ Supabase CLI: $(supabase --version)"
echo ""

# Conectar ao projeto
echo "🔗 Conectando ao projeto..."
supabase link --project-ref "$PROJECT_REF"
echo ""

# Aplicar migrations
echo "📦 Aplicando 7 migrations..."
supabase db push
echo ""

# Deploy Edge Functions
echo "🌐 Deploy Edge Functions..."
supabase functions deploy valida_crm_cfm
supabase functions deploy consulta_anvisa_produto
supabase functions deploy recalcular_kpis
echo ""

# Gerar tipos
echo "⚙️  Gerando tipos TypeScript..."
npm run db:gen:types
echo ""

# Validar
echo "✅ Validando..."
npm run infra:audit
echo ""

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ Migrations Aplicadas com Sucesso!                         ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"

