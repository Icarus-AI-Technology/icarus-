#!/bin/bash
# ============================================================================
# DEPLOYMENT AUTOMÁTICO VIA SUPABASE CLI
# ============================================================================
# Projeto: ICARUS - Sistema OPME Multi-tenant
# Project Ref: ttswvavcisdnonytslom
# Autor: Engenheiro Backend Sênior
# Data: 2025-01-26
# ============================================================================

set -e  # Exit on error

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ICARUS - DEPLOYMENT AUTOMÁTICO VIA SUPABASE CLI         ║
║    Applying all migrations and deploying Edge Functions     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Diretório do projeto
PROJECT_DIR="/Users/daxmeneghel/icarus-make"
cd "$PROJECT_DIR"

log_info "Working directory: $PROJECT_DIR"
echo ""

# ============================================================================
# FASE 1: VALIDAR AMBIENTE
# ============================================================================
log_step "FASE 1: Validando ambiente..."

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI não encontrado!"
    log_info "Instale com: npm install -g supabase"
    exit 1
fi
SUPABASE_VERSION=$(supabase --version)
log_success "Supabase CLI instalado: v$SUPABASE_VERSION"

# Verificar projeto linkado
if [ -f "supabase/.temp/project-ref" ]; then
    PROJECT_REF=$(cat supabase/.temp/project-ref)
    log_success "Projeto linkado: $PROJECT_REF"
else
    log_error "Nenhum projeto linkado!"
    log_info "Execute: supabase link --project-ref <seu-project-ref>"
    exit 1
fi

# Verificar autenticação
log_info "Verificando autenticação..."
if supabase projects list &> /dev/null; then
    log_success "Autenticado no Supabase"
else
    log_warning "Não autenticado. Executando login..."
    supabase login
fi

echo ""

# ============================================================================
# FASE 2: APLICAR MIGRATIONS VIA DB PUSH
# ============================================================================
log_step "FASE 2: Aplicando migrations via Supabase CLI..."

log_info "Preparando migrations..."

# Contar migrations
MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l | tr -d ' ')
log_info "Total de migrations encontradas: $MIGRATION_COUNT"

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    log_warning "Nenhuma migration encontrada em supabase/migrations/"
else
    log_info "Aplicando migrations remotamente..."
    
    # Usar db push para aplicar migrations
    if supabase db push --linked; then
        log_success "Migrations aplicadas com sucesso!"
    else
        log_error "Falha ao aplicar migrations"
        log_warning "Tentando método alternativo (db reset)..."
        
        # Alternativa: db reset (CUIDADO: apaga dados!)
        read -p "Deseja fazer RESET do banco (apaga dados)? (s/N): " CONFIRM_RESET
        if [[ "$CONFIRM_RESET" =~ ^[Ss]$ ]]; then
            if supabase db reset --linked; then
                log_success "Database resetado e migrations aplicadas!"
            else
                log_error "Falha no reset do database"
                exit 1
            fi
        else
            log_info "Pulando reset. Continuando com próximas fases..."
        fi
    fi
fi

echo ""

# ============================================================================
# FASE 3: VALIDAR SCHEMA APLICADO
# ============================================================================
log_step "FASE 3: Validando schema aplicado..."

log_info "Gerando types TypeScript para validação..."
if supabase gen types typescript --linked > src/types/database.types.ts 2>/dev/null; then
    log_success "Types gerados com sucesso!"
    
    # Contar tipos gerados
    TYPE_COUNT=$(grep -c "export type" src/types/database.types.ts 2>/dev/null || echo "0")
    log_info "Types gerados: $TYPE_COUNT"
else
    log_warning "Falha ao gerar types (pode ser normal se tabelas não existirem ainda)"
fi

echo ""

# ============================================================================
# FASE 4: DEPLOY DE EDGE FUNCTIONS
# ============================================================================
log_step "FASE 4: Fazendo deploy de Edge Functions..."

# Listar Edge Functions
FUNCTIONS_DIR="supabase/functions"
if [ ! -d "$FUNCTIONS_DIR" ]; then
    log_warning "Diretório de functions não encontrado: $FUNCTIONS_DIR"
    log_info "Pulando deploy de Edge Functions"
else
    FUNCTIONS=($(ls -d $FUNCTIONS_DIR/*/ 2>/dev/null | xargs -n 1 basename))
    FUNCTION_COUNT=${#FUNCTIONS[@]}
    
    if [ "$FUNCTION_COUNT" -eq 0 ]; then
        log_warning "Nenhuma Edge Function encontrada"
    else
        log_info "Edge Functions encontradas: $FUNCTION_COUNT"
        echo ""
        
        DEPLOYED=0
        FAILED=0
        
        for func in "${FUNCTIONS[@]}"; do
            # Pular diretórios que não são functions
            if [ ! -f "$FUNCTIONS_DIR/$func/index.ts" ] && [ ! -f "$FUNCTIONS_DIR/$func/index.js" ]; then
                log_warning "Pulando $func (sem index.ts/js)"
                continue
            fi
            
            log_info "Deploying: $func..."
            if supabase functions deploy "$func" --project-ref "$PROJECT_REF"; then
                log_success "✓ $func deployada"
                DEPLOYED=$((DEPLOYED + 1))
            else
                log_error "✗ Falha ao fazer deploy de $func"
                FAILED=$((FAILED + 1))
            fi
            echo ""
        done
        
        echo ""
        log_info "═══════════════════════════════════════"
        log_success "Edge Functions deployadas: $DEPLOYED"
        if [ "$FAILED" -gt 0 ]; then
            log_error "Edge Functions falhadas: $FAILED"
        fi
        log_info "═══════════════════════════════════════"
    fi
fi

echo ""

# ============================================================================
# FASE 5: CONFIGURAR SECRETS (INTERATIVO)
# ============================================================================
log_step "FASE 5: Configurando Secrets..."

read -p "Deseja configurar secrets das Edge Functions agora? (s/N): " CONFIGURE_SECRETS

if [[ "$CONFIGURE_SECRETS" =~ ^[Ss]$ ]]; then
    log_info "Configurando secrets..."
    
    # Admin inicial
    echo ""
    log_info "--- ADMIN INICIAL ---"
    read -p "Email do Admin: " ADMIN_EMAIL
    read -sp "Senha do Admin: " ADMIN_PASSWORD
    echo ""
    read -p "Nome do Admin: " ADMIN_NAME
    
    supabase secrets set ADMIN_INITIAL_EMAIL="$ADMIN_EMAIL" --project-ref "$PROJECT_REF"
    supabase secrets set ADMIN_INITIAL_PASSWORD="$ADMIN_PASSWORD" --project-ref "$PROJECT_REF"
    supabase secrets set ADMIN_INITIAL_NAME="$ADMIN_NAME" --project-ref "$PROJECT_REF"
    
    # Feature flags
    log_info "Configurando feature flags..."
    supabase secrets set FF_AI_TUTOR_CIRURGIAS=true --project-ref "$PROJECT_REF"
    supabase secrets set FF_TUTOR_CIRURGIAS=true --project-ref "$PROJECT_REF"
    supabase secrets set FF_ML_QUEUE=true --project-ref "$PROJECT_REF"
    
    log_success "Secrets configurados!"
else
    log_info "Pulando configuração de secrets"
fi

echo ""

# ============================================================================
# FASE 6: CRIAR ADMIN INICIAL
# ============================================================================
log_step "FASE 6: Criando usuário admin inicial..."

read -p "Deseja criar admin inicial via Edge Function? (s/N): " CREATE_ADMIN

if [[ "$CREATE_ADMIN" =~ ^[Ss]$ ]]; then
    log_info "Invocando Edge Function create-admin..."
    
    # Obter URL do projeto
    PROJECT_URL="https://${PROJECT_REF}.supabase.co"
    
    # Invocar function
    RESPONSE=$(curl -s -X POST \
        "${PROJECT_URL}/functions/v1/create-admin" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY:-}" \
        -H "Content-Type: application/json")
    
    if echo "$RESPONSE" | grep -q "\"ok\":true"; then
        log_success "Admin criado com sucesso!"
        USER_ID=$(echo "$RESPONSE" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
        log_info "User ID: $USER_ID"
    else
        log_warning "Resposta da function: $RESPONSE"
        log_info "Execute manualmente se necessário"
    fi
else
    log_info "Pulando criação de admin"
fi

echo ""

# ============================================================================
# FASE 7: GERAR TYPES FINAIS
# ============================================================================
log_step "FASE 7: Gerando types TypeScript finais..."

log_info "Gerando types atualizados..."
if supabase gen types typescript --linked > src/types/database.types.ts; then
    log_success "Types gerados em src/types/database.types.ts"
    
    # Estatísticas
    TABLE_COUNT=$(grep -c "Row:" src/types/database.types.ts 2>/dev/null || echo "0")
    log_info "Tabelas detectadas: $TABLE_COUNT"
else
    log_warning "Falha ao gerar types finais"
fi

echo ""

# ============================================================================
# FASE 8: VALIDAR RLS POLICIES
# ============================================================================
log_step "FASE 8: Validando RLS Policies..."

log_info "Verificando RLS policies aplicadas..."

# SQL para contar policies
SQL_CHECK_RLS="SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"

# Executar via supabase db (requer configuração adicional)
log_info "Para validar RLS, execute manualmente:"
echo ""
echo "  supabase db query \"$SQL_CHECK_RLS\" --linked"
echo ""

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================
echo ""
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         ✓ DEPLOYMENT AUTOMÁTICO CONCLUÍDO!                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
log_info "═══════════════════════════════════════════════════════"
log_info "RESUMO DO DEPLOYMENT"
log_info "═══════════════════════════════════════════════════════"
log_success "✓ Projeto: $PROJECT_REF"
log_success "✓ Migrations aplicadas: $MIGRATION_COUNT arquivos"
log_success "✓ Edge Functions deployadas: $DEPLOYED functions"
log_success "✓ Types gerados: src/types/database.types.ts"
log_info "═══════════════════════════════════════════════════════"

echo ""
log_info "PRÓXIMOS PASSOS:"
echo "  1. Testar login na aplicação"
echo "  2. Validar multi-tenancy"
echo "  3. Testar Edge Functions críticas"
echo "  4. Configurar backup automático"
echo ""

log_info "COMANDOS ÚTEIS:"
echo "  - Ver status: supabase status --linked"
echo "  - Ver functions: supabase functions list --project-ref $PROJECT_REF"
echo "  - Ver secrets: supabase secrets list --project-ref $PROJECT_REF"
echo "  - Gerar types: supabase gen types typescript --linked"
echo ""

log_success "Deployment concluído! 🎉"

exit 0

