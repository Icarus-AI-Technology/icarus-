#!/bin/bash
# ============================================================================
# CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE NA VERCEL
# ============================================================================
# Script automatizado para adicionar variáveis do Supabase
# ============================================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }

echo ""
log_info "════════════════════════════════════════════════════"
log_info "  CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - VERCEL"
log_info "════════════════════════════════════════════════════"
echo ""

# Projeto Supabase
PROJECT_REF="gvbkviozlhxorjoavmky"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

log_info "Projeto Supabase: $PROJECT_REF"
log_info "Supabase URL: $SUPABASE_URL"
echo ""

# VITE_SUPABASE_URL
log_info "Configurando VITE_SUPABASE_URL..."
echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL production
echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL preview
echo "$SUPABASE_URL" | npx vercel env add VITE_SUPABASE_URL development
log_success "VITE_SUPABASE_URL configurado"
echo ""

# VITE_SUPABASE_ANON_KEY
log_info "Para VITE_SUPABASE_ANON_KEY:"
log_warning "Obtenha a chave em: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""
read -p "Cole a SUPABASE_ANON_KEY (eyJ...): " ANON_KEY

if [ ! -z "$ANON_KEY" ]; then
    log_info "Configurando VITE_SUPABASE_ANON_KEY..."
    echo "$ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY production
    echo "$ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY preview
    echo "$ANON_KEY" | npx vercel env add VITE_SUPABASE_ANON_KEY development
    log_success "VITE_SUPABASE_ANON_KEY configurado"
else
    log_warning "ANON_KEY não fornecida, pulando..."
fi

echo ""
log_info "════════════════════════════════════════════════════"
log_success "Configuração concluída!"
log_info "════════════════════════════════════════════════════"
echo ""

# Listar variáveis
log_info "Variáveis configuradas:"
npx vercel env ls

echo ""
log_success "✓ Variáveis de ambiente configuradas com sucesso!"
log_info "Próximo deploy usará automaticamente estas variáveis."
echo ""

exit 0

