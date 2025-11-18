#!/bin/bash
# ============================================================================
# CRIAR STORAGE BUCKETS VIA API DO SUPABASE
# ============================================================================
# Projeto: gvbkviozlhxorjoavmky
# ============================================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo ""
log_info "════════════════════════════════════════════════════"
log_info "  CRIAR STORAGE BUCKETS - SUPABASE"
log_info "════════════════════════════════════════════════════"
echo ""

PROJECT_REF="gvbkviozlhxorjoavmky"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

log_info "Projeto: $PROJECT_REF"
echo ""

# Solicitar Service Role Key
log_warning "Para criar buckets, precisamos da SERVICE_ROLE_KEY"
log_info "Obtenha em: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api"
echo ""
read -sp "Cole a SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY
echo ""
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    log_error "SERVICE_ROLE_KEY não fornecida!"
    exit 1
fi

# Função para criar bucket
create_bucket() {
    local BUCKET_ID=$1
    local BUCKET_NAME=$2
    local PUBLIC=$3
    local FILE_SIZE_LIMIT=$4
    local MIME_TYPES=$5
    
    log_info "Criando bucket: $BUCKET_NAME..."
    
    RESPONSE=$(curl -s -X POST \
        "${SUPABASE_URL}/storage/v1/bucket" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"id\": \"${BUCKET_ID}\",
            \"name\": \"${BUCKET_NAME}\",
            \"public\": ${PUBLIC},
            \"file_size_limit\": ${FILE_SIZE_LIMIT},
            \"allowed_mime_types\": ${MIME_TYPES}
        }")
    
    if echo "$RESPONSE" | grep -q '"name"'; then
        log_success "✓ $BUCKET_NAME criado"
    elif echo "$RESPONSE" | grep -q '"Bucket already exists"'; then
        log_warning "⚠ $BUCKET_NAME já existe"
    else
        log_error "✗ Falha ao criar $BUCKET_NAME"
        echo "Resposta: $RESPONSE"
    fi
}

# ============================================
# CRIAR BUCKETS
# ============================================

# 1. documentos_cirurgias
create_bucket \
    "documentos_cirurgias" \
    "documentos_cirurgias" \
    "false" \
    "10485760" \
    '["application/pdf", "image/jpeg", "image/png", "application/xml"]'

# 2. documentos_fiscais
create_bucket \
    "documentos_fiscais" \
    "documentos_fiscais" \
    "false" \
    "52428800" \
    '["application/pdf", "application/xml", "text/xml"]'

# 3. anexos_produtos
create_bucket \
    "anexos_produtos" \
    "anexos_produtos" \
    "false" \
    "5242880" \
    '["application/pdf", "image/jpeg", "image/png"]'

# 4. avatares
create_bucket \
    "avatares" \
    "avatares" \
    "true" \
    "1048576" \
    '["image/jpeg", "image/png", "image/webp"]'

# 5. icarus_new
create_bucket \
    "icarus_new" \
    "icarus_new" \
    "false" \
    "52428800" \
    '["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "text/plain"]'

echo ""
log_info "════════════════════════════════════════════════════"
log_info "Listando buckets criados..."
echo ""

# Listar buckets
BUCKETS=$(curl -s -X GET \
    "${SUPABASE_URL}/storage/v1/bucket" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}")

echo "$BUCKETS" | jq -r '.[] | "✓ \(.name) | Público: \(.public) | Tamanho max: \(.file_size_limit) bytes"' 2>/dev/null || echo "$BUCKETS"

echo ""
log_info "════════════════════════════════════════════════════"
log_success "Storage Buckets configurados!"
log_info "════════════════════════════════════════════════════"
echo ""
log_info "Verifique em: https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets"
echo ""

exit 0

