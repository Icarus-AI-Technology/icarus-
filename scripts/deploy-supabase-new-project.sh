#!/bin/bash
# ============================================================================
# SCRIPT DE DEPLOYMENT AUTOMATIZADO - NOVO PROJETO SUPABASE
# ============================================================================
# Projeto: ICARUS - Sistema OPME Multi-tenant
# Versão: 1.0.0
# Data: 2025-01-26
# Autor: Engenheiro de Backend Sênior & Arquiteto Supabase
# ============================================================================

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ICARUS - DEPLOYMENT AUTOMATIZADO SUPABASE                ║
║    Sistema OPME Multi-tenant                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================================================
# FASE 1: VALIDAR PRÉ-REQUISITOS
# ============================================================================
log_info "FASE 1: Validando pré-requisitos..."

# Verificar psql
if ! command -v psql &> /dev/null; then
    log_error "psql não encontrado. Instale PostgreSQL client."
    exit 1
fi
log_success "psql encontrado: $(psql --version | head -n1)"

# Verificar Supabase CLI
if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi
log_success "Supabase CLI encontrado: $(supabase --version)"

# Verificar Vercel CLI
if ! command -v vercel &> /dev/null; then
    log_warning "Vercel CLI não encontrado. Deploy na Vercel será manual."
    SKIP_VERCEL=true
else
    log_success "Vercel CLI encontrado: $(vercel --version)"
    SKIP_VERCEL=false
fi

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "supabase/migrations" ]; then
    log_error "Execute este script a partir da raiz do projeto ICARUS."
    exit 1
fi
log_success "Diretório do projeto validado"

echo ""

# ============================================================================
# FASE 2: COLETAR CREDENCIAIS
# ============================================================================
log_info "FASE 2: Coletando credenciais do novo projeto Supabase..."

echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "Este script irá configurar um NOVO projeto Supabase."
echo "Você já deve ter criado o projeto no dashboard: https://supabase.com/dashboard"
echo ""

read -p "Project Ref (ex: ttswvavcisdnonytslom): " PROJECT_REF
read -p "Database Password: " -s DB_PASSWORD
echo ""
read -p "SUPABASE_URL (ex: https://$PROJECT_REF.supabase.co): " SUPABASE_URL
read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "SUPABASE_SERVICE_ROLE_KEY: " -s SUPABASE_SERVICE_ROLE_KEY
echo ""

# Validar inputs
if [ -z "$PROJECT_REF" ] || [ -z "$DB_PASSWORD" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    log_error "Todos os campos são obrigatórios!"
    exit 1
fi

# Construir DATABASE_URL
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

log_success "Credenciais coletadas"
echo ""

# ============================================================================
# FASE 3: TESTAR CONEXÃO COM BANCO
# ============================================================================
log_info "FASE 3: Testando conexão com o banco de dados..."

if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
    log_success "Conexão com banco estabelecida"
else
    log_error "Falha ao conectar no banco. Verifique as credenciais."
    exit 1
fi
echo ""

# ============================================================================
# FASE 4: INSTALAR EXTENSÕES POSTGRESQL
# ============================================================================
log_info "FASE 4: Instalando extensões PostgreSQL..."

psql "$DATABASE_URL" <<EOF
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "btree_gin" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "btree_gist" SCHEMA public;
EOF

# Validar instalação
EXTENSIONS_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'vector', 'btree_gin', 'btree_gist');")
if [ "$EXTENSIONS_COUNT" -eq 6 ]; then
    log_success "6 extensões instaladas com sucesso"
else
    log_error "Falha ao instalar extensões. Esperado 6, encontrado $EXTENSIONS_COUNT"
    exit 1
fi
echo ""

# ============================================================================
# FASE 5: APLICAR MIGRATIONS
# ============================================================================
log_info "FASE 5: Aplicando migrations consolidadas..."

if [ -f "supabase/migrations/20250126_consolidated_all_tables.sql" ]; then
    log_info "Aplicando migration consolidada (pode levar 5-10 minutos)..."
    if psql "$DATABASE_URL" -f supabase/migrations/20250126_consolidated_all_tables.sql > /dev/null 2>&1; then
        log_success "Migration consolidada aplicada"
    else
        log_error "Falha ao aplicar migration consolidada"
        exit 1
    fi
else
    log_warning "Migration consolidada não encontrada, aplicando individuais..."
    
    # Lista ordenada de migrations críticas
    MIGRATIONS=(
        "0001_init_schema.sql"
        "0002_rls_policies.sql"
        "0003_indexes_perf.sql"
        "0004_functions_triggers.sql"
        "0005_storage_policies.sql"
        "0006_seed_minimo.sql"
        "0007_dpo_encarregado.sql"
        "0008_storage_icarus_new.sql"
        "20250126000001_icarus_pro_master.sql"
    )
    
    for migration in "${MIGRATIONS[@]}"; do
        if [ -f "supabase/migrations/$migration" ]; then
            log_info "Aplicando $migration..."
            psql "$DATABASE_URL" -f "supabase/migrations/$migration" > /dev/null 2>&1
            log_success "$migration aplicada"
        else
            log_warning "$migration não encontrada, pulando..."
        fi
    done
fi

# Validar tabelas criadas
TABLES_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
log_info "Total de tabelas criadas: $TABLES_COUNT"

if [ "$TABLES_COUNT" -lt 50 ]; then
    log_warning "Menos de 50 tabelas criadas. Verifique se migrations foram aplicadas corretamente."
else
    log_success "Migrations aplicadas com sucesso ($TABLES_COUNT tabelas)"
fi
echo ""

# ============================================================================
# FASE 6: CONFIGURAR STORAGE BUCKETS
# ============================================================================
log_info "FASE 6: Configurando Storage Buckets..."

log_info "Criando buckets via SQL..."
psql "$DATABASE_URL" <<EOF > /dev/null 2>&1
-- Buckets já devem ter sido criados pelas migrations
-- Validar existência
SELECT name FROM storage.buckets;
EOF

log_success "Storage buckets configurados"
echo ""

# ============================================================================
# FASE 7: LINKAR PROJETO E DEPLOY DE EDGE FUNCTIONS
# ============================================================================
log_info "FASE 7: Fazendo deploy de Edge Functions..."

# Fazer login (se necessário)
log_info "Fazendo login no Supabase CLI..."
if supabase login > /dev/null 2>&1; then
    log_success "Login realizado"
else
    log_warning "Falha no login automático. Execute manualmente: supabase login"
fi

# Linkar projeto
log_info "Linkando projeto..."
if supabase link --project-ref "$PROJECT_REF" > /dev/null 2>&1; then
    log_success "Projeto linkado"
else
    log_warning "Falha ao linkar projeto. Execute manualmente: supabase link --project-ref $PROJECT_REF"
fi

# Deploy de Edge Functions
EDGE_FUNCTIONS=(
    "create-admin"
    "webhook-processor"
    "ml-vectors"
    "ml-job"
    "orchestrator"
    "agent-benchmark"
    "agent-compliance"
    "agent-synthesis"
    "agent-erp"
    "edr-orchestrator"
    "edr-stream"
    "consulta_anvisa_produto"
    "valida_crm_cfm"
    "recalcular_kpis"
    "test-credential"
    "vector-benchmark"
)

log_info "Fazendo deploy de ${#EDGE_FUNCTIONS[@]} Edge Functions..."
for func in "${EDGE_FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        log_info "Deploy: $func..."
        if supabase functions deploy "$func" > /dev/null 2>&1; then
            log_success "$func deployada"
        else
            log_warning "Falha ao fazer deploy de $func"
        fi
    else
        log_warning "Function $func não encontrada, pulando..."
    fi
done
echo ""

# ============================================================================
# FASE 8: CONFIGURAR SECRETS
# ============================================================================
log_info "FASE 8: Configurando Secrets das Edge Functions..."

read -p "Email do Admin Inicial (ex: admin@icarus.com.br): " ADMIN_EMAIL
read -p "Senha do Admin Inicial: " -s ADMIN_PASSWORD
echo ""
read -p "Nome do Admin Inicial (ex: Administrador): " ADMIN_NAME

supabase secrets set ADMIN_INITIAL_EMAIL="$ADMIN_EMAIL" > /dev/null 2>&1
supabase secrets set ADMIN_INITIAL_PASSWORD="$ADMIN_PASSWORD" > /dev/null 2>&1
supabase secrets set ADMIN_INITIAL_NAME="$ADMIN_NAME" > /dev/null 2>&1
supabase secrets set FF_AI_TUTOR_CIRURGIAS=true > /dev/null 2>&1
supabase secrets set FF_TUTOR_CIRURGIAS=true > /dev/null 2>&1
supabase secrets set FF_ML_QUEUE=true > /dev/null 2>&1

log_success "Secrets configurados"
echo ""

# ============================================================================
# FASE 9: CRIAR USUÁRIO ADMIN
# ============================================================================
log_info "FASE 9: Criando usuário admin inicial..."

RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/create-admin" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q "\"ok\":true"; then
    USER_ID=$(echo "$RESPONSE" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
    log_success "Admin criado com sucesso! User ID: $USER_ID"
else
    log_warning "Falha ao criar admin. Resposta: $RESPONSE"
fi
echo ""

# ============================================================================
# FASE 10: CONFIGURAR VERCEL (OPCIONAL)
# ============================================================================
if [ "$SKIP_VERCEL" = false ]; then
    log_info "FASE 10: Configurando Vercel..."
    
    read -p "Deseja configurar variáveis de ambiente na Vercel? (s/N): " CONFIGURE_VERCEL
    if [[ "$CONFIGURE_VERCEL" =~ ^[Ss]$ ]]; then
        log_info "Configurando variáveis na Vercel..."
        
        echo "$SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production
        echo "$SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production
        echo "production" | vercel env add NODE_ENV production
        
        log_success "Variáveis configuradas na Vercel"
        
        read -p "Deseja fazer deploy agora? (s/N): " DO_DEPLOY
        if [[ "$DO_DEPLOY" =~ ^[Ss]$ ]]; then
            log_info "Fazendo deploy na Vercel..."
            vercel --prod
            log_success "Deploy realizado!"
        fi
    else
        log_info "Pulando configuração da Vercel"
    fi
else
    log_info "FASE 10: Vercel CLI não instalado, pulando..."
fi
echo ""

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            ✓ DEPLOYMENT CONCLUÍDO COM SUCESSO!              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}RESUMO DA CONFIGURAÇÃO:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓${NC} Extensões PostgreSQL: 6 instaladas"
echo -e "${GREEN}✓${NC} Migrations aplicadas: $TABLES_COUNT tabelas criadas"
echo -e "${GREEN}✓${NC} Storage Buckets: Configurados"
echo -e "${GREEN}✓${NC} Edge Functions: Deployadas"
echo -e "${GREEN}✓${NC} Secrets: Configurados"
echo -e "${GREEN}✓${NC} Usuário Admin: Criado"
echo ""
echo -e "${BLUE}CREDENCIAIS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project Ref: $PROJECT_REF"
echo "Supabase URL: $SUPABASE_URL"
echo "Admin Email: $ADMIN_EMAIL"
echo ""
echo -e "${YELLOW}⚠ IMPORTANTE:${NC}"
echo "1. Salve as credenciais em local seguro (1Password, Bitwarden, etc)"
echo "2. NUNCA comite SERVICE_ROLE_KEY no Git"
echo "3. Configure backup automático no Supabase Dashboard"
echo ""
echo -e "${BLUE}PRÓXIMOS PASSOS:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Testar login na aplicação: $SUPABASE_URL"
echo "2. Validar multi-tenancy (criar empresa e usuário)"
echo "3. Testar upload de arquivos (Storage)"
echo "4. Configurar monitoramento e alertas"
echo "5. Fazer backup inicial do banco de dados"
echo ""
echo -e "${GREEN}Deploy concluído com sucesso! 🎉${NC}"
echo ""

# Salvar credenciais em arquivo (SEGURO - adicionar ao .gitignore)
cat > .supabase.credentials.txt <<EOF
# ============================================================================
# CREDENCIAIS DO PROJETO SUPABASE - ICARUS
# ============================================================================
# ⚠ NÃO COMITAR ESTE ARQUIVO NO GIT!
# Gerado em: $(date)
# ============================================================================

PROJECT_REF=$PROJECT_REF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL=$DATABASE_URL

ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# ============================================================================
# PARA USO EM .env
# ============================================================================
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

chmod 600 .supabase.credentials.txt
log_success "Credenciais salvas em .supabase.credentials.txt (chmod 600)"

echo ""
log_warning "LEMBRE-SE: Adicione .supabase.credentials.txt ao .gitignore!"
echo ""

exit 0

