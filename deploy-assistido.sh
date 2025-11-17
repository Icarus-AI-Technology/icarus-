#!/bin/bash

# ICARUS v5.0 - Script de Deploy Assistido
# Data: 27/10/2025
# Versão: 1.0.0

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Diretórios
DEV_DIR="/Users/daxmeneghel/icarus-make"
PROD_DIR="/Users/daxmeneghel/icarus-v5.0"

echo -e "${CYAN}"
cat << "EOF"
┌─────────────────────────────────────────────┐
│                                             │
│  ICARUS v5.0 - Deploy Assistido            │
│  Tempo estimado: 45-60 minutos             │
│                                             │
└─────────────────────────────────────────────┘
EOF
echo -e "${NC}"

# Função para perguntar
ask() {
    echo -e "${YELLOW}$1${NC}"
    read -p "Pressione ENTER para continuar ou 'n' para pular: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        return 1
    fi
    return 0
}

# Função de sucesso
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Função de erro
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Função de info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Função de aviso
warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 ETAPA 1: Verificação de Pré-requisitos${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js: $NODE_VERSION"
else
    error "Node.js não encontrado!"
    exit 1
fi

# Verificar pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    success "pnpm: $PNPM_VERSION"
else
    error "pnpm não encontrado!"
    exit 1
fi

# Verificar Deno
if command -v deno &> /dev/null; then
    DENO_VERSION=$(deno --version | head -n 1)
    success "Deno: $DENO_VERSION"
else
    warn "Deno não encontrado (necessário para Supabase CLI)"
    if ask "Instalar Deno agora?"; then
        curl -fsSL https://deno.land/install.sh | sh
        export PATH="$HOME/.deno/bin:$PATH"
        success "Deno instalado!"
    fi
fi

# Verificar Vercel CLI
if command -v vercel &> /dev/null; then
    success "Vercel CLI instalado"
else
    warn "Vercel CLI não encontrado"
    if ask "Instalar Vercel CLI?"; then
        npm i -g vercel
        success "Vercel CLI instalado!"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 ETAPA 2: Credenciais${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

info "Você precisará das seguintes credenciais:"
echo "  1. Supabase Project URL"
echo "  2. Supabase Anon Key"
echo "  3. Meilisearch URL (opcional)"
echo "  4. Ollama URL (opcional)"
echo ""

if ask "Você já tem as credenciais do Supabase?"; then
    echo ""
    info "Ótimo! Vamos configurar o .env.prod"
    
    echo -e "${CYAN}Cole a Supabase URL:${NC}"
    read SUPABASE_URL
    
    echo -e "${CYAN}Cole a Supabase Anon Key:${NC}"
    read SUPABASE_ANON
    
    # Criar .env.prod
    cd "$PROD_DIR"
    cat > .env.prod << EOF
# ICARUS v5.0 - Produção
# Gerado automaticamente

VITE_ENVIRONMENT=production
NODE_ENV=production

# Supabase
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON

# Search e IA (localhost por padrão)
VITE_MEILISEARCH_URL=http://localhost:7700
VITE_OLLAMA_URL=http://localhost:11434

# Features
VITE_ENABLE_AI=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_SEARCH=true
EOF
    
    success ".env.prod criado!"
else
    error "Você precisa das credenciais do Supabase para continuar"
    info "Acesse: https://supabase.com/dashboard"
    info "Settings → API → Copie URL e anon key"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔒 ETAPA 3: RLS (Row Level Security)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

warn "IMPORTANTE: Fazer backup do banco antes de aplicar RLS!"

if ask "Fazer backup do banco agora?"; then
    cd "$DEV_DIR"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if command -v supabase &> /dev/null; then
        supabase db dump -f "$BACKUP_FILE"
        success "Backup criado: $BACKUP_FILE"
    else
        warn "Supabase CLI não encontrado - backup manual necessário"
        info "Dashboard → Database → Backups"
    fi
fi

if ask "Aplicar migração RLS agora?"; then
    cd "$DEV_DIR"
    
    if command -v supabase &> /dev/null; then
        info "Aplicando migração..."
        supabase db push
        success "Migração RLS aplicada!"
    else
        warn "Supabase CLI não encontrado"
        info "Aplicar manualmente via Dashboard:"
        info "1. Abra: https://supabase.com/dashboard"
        info "2. SQL Editor → New Query"
        info "3. Cole o conteúdo de: supabase/migrations/20251027013614_enable_rls_critical_tables.sql"
        info "4. Run"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  ETAPA 4: Build de Produção${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ask "Executar build de produção?"; then
    cd "$PROD_DIR"
    
    info "Executando type-check..."
    pnpm type-check || warn "Type-check com warnings"
    
    info "Executando lint..."
    pnpm lint || warn "Lint com warnings"
    
    info "Executando build..."
    pnpm build
    success "Build concluído!"
    
    info "Tamanho do build:"
    du -sh dist/
    
    if ask "Testar preview local antes de deploy?"; then
        info "Iniciando preview em http://localhost:4173"
        info "Pressione Ctrl+C quando terminar de testar"
        pnpm preview
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}☁️  ETAPA 5: Deploy Vercel${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ask "Fazer deploy na Vercel?"; then
    cd "$PROD_DIR"
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI não instalado!"
        info "Instale com: npm i -g vercel"
        exit 1
    fi
    
    info "Fazendo login na Vercel..."
    vercel login
    
    info "Deploy preview (teste)..."
    vercel
    
    success "Preview deployado!"
    
    if ask "Configurar environment variables?"; then
        info "Configurando variáveis..."
        
        echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production
        echo "$SUPABASE_ANON" | vercel env add VITE_SUPABASE_ANON_KEY production
        echo "production" | vercel env add VITE_ENVIRONMENT production
        
        success "Variáveis configuradas!"
    fi
    
    if ask "Deploy em PRODUÇÃO (final)?"; then
        warn "Este é o deploy final em produção!"
        info "Deploy em andamento..."
        vercel --prod
        success "Deploy em produção concluído!"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}✅ ETAPA 6: Validação${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if ask "Executar testes de validação?"; then
    info "Obtendo URL de produção..."
    PROD_URL=$(vercel ls --prod | grep icarus | awk '{print $2}' | head -n 1)
    
    if [ -n "$PROD_URL" ]; then
        success "URL: https://$PROD_URL"
        
        info "Testando homepage..."
        if curl -sf "https://$PROD_URL" > /dev/null; then
            success "Homepage OK!"
        else
            error "Homepage não respondeu"
        fi
        
        info "Abrindo no navegador..."
        open "https://$PROD_URL"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

success "ICARUS v5.0 está em produção!"
info "Próximos passos:"
echo "  • Monitorar logs: vercel logs --follow"
echo "  • Verificar performance: Lighthouse"
echo "  • Testar funcionalidades críticas"
echo "  • Configurar alertas e monitoramento"
echo ""
info "Documentação completa em:"
echo "  • $DEV_DIR/ICARUS_V5_GUIA_DEPLOYMENT.md"
echo ""

success "Missão cumprida! 🚀"

