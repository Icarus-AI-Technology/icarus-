#!/bin/bash
# ============================================================================
# BACKUP AUTOMÁTICO DIÁRIO - SUPABASE DATABASE
# ============================================================================
# Projeto: ICARUS v5.0
# Projeto Supabase: gvbkviozlhxorjoavmky
# ============================================================================

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

PROJECT_REF="gvbkviozlhxorjoavmky"
BACKUP_DIR="./backups/daily"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="icarus_backup_${DATE}.sql"
RETENTION_DAYS=30  # Manter backups por 30 dias

# Verifica se SUPABASE_ACCESS_TOKEN está definido
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    log_error "SUPABASE_ACCESS_TOKEN não está definido!"
    log_info "Execute: export SUPABASE_ACCESS_TOKEN=seu_token"
    exit 1
fi

# ============================================================================
# CRIAR DIRETÓRIO DE BACKUP
# ============================================================================

log_info "Criando diretório de backup..."
mkdir -p "$BACKUP_DIR"
log_success "Diretório criado: $BACKUP_DIR"

# ============================================================================
# FAZER BACKUP DO SCHEMA
# ============================================================================

log_info "Iniciando backup do schema..."
supabase db dump \
    --linked \
    --schema public \
    --file "$BACKUP_DIR/$BACKUP_FILE" 2>&1

if [ $? -eq 0 ]; then
    log_success "Backup do schema concluído: $BACKUP_FILE"
else
    log_error "Falha no backup do schema"
    exit 1
fi

# ============================================================================
# FAZER BACKUP DOS DADOS
# ============================================================================

log_info "Iniciando backup dos dados..."
DATA_FILE="icarus_data_${DATE}.sql"

supabase db dump \
    --linked \
    --data-only \
    --file "$BACKUP_DIR/$DATA_FILE" 2>&1

if [ $? -eq 0 ]; then
    log_success "Backup dos dados concluído: $DATA_FILE"
else
    log_warning "Falha no backup dos dados (pode não ser suportado)"
fi

# ============================================================================
# COMPACTAR BACKUPS
# ============================================================================

log_info "Compactando backups..."
cd "$BACKUP_DIR"
tar -czf "icarus_full_backup_${DATE}.tar.gz" *.sql 2>/dev/null
if [ $? -eq 0 ]; then
    log_success "Backup compactado: icarus_full_backup_${DATE}.tar.gz"
    # Remove arquivos SQL individuais após compactação
    rm -f *.sql
fi
cd - > /dev/null

# ============================================================================
# LIMPAR BACKUPS ANTIGOS
# ============================================================================

log_info "Limpando backups antigos (>$RETENTION_DAYS dias)..."
find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
log_success "Backups antigos removidos"

# ============================================================================
# ESTATÍSTICAS
# ============================================================================

BACKUP_SIZE=$(du -h "$BACKUP_DIR/icarus_full_backup_${DATE}.tar.gz" | cut -f1)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)

log_info "════════════════════════════════════════════════════"
log_success "BACKUP CONCLUÍDO COM SUCESSO!"
log_info "════════════════════════════════════════════════════"
echo ""
echo "  📁 Arquivo: icarus_full_backup_${DATE}.tar.gz"
echo "  📦 Tamanho: $BACKUP_SIZE"
echo "  🗄️  Total de backups: $BACKUP_COUNT"
echo "  📅 Data: $(date)"
echo ""
log_info "════════════════════════════════════════════════════"

# ============================================================================
# UPLOAD PARA CLOUD (OPCIONAL)
# ============================================================================

# Descomente para fazer upload automático para AWS S3, Google Cloud Storage, etc.
# 
# log_info "Fazendo upload para cloud storage..."
# 
# # Exemplo AWS S3:
# # aws s3 cp "$BACKUP_DIR/icarus_full_backup_${DATE}.tar.gz" \
# #     s3://seu-bucket/backups/icarus/
# 
# # Exemplo Google Cloud Storage:
# # gsutil cp "$BACKUP_DIR/icarus_full_backup_${DATE}.tar.gz" \
# #     gs://seu-bucket/backups/icarus/
# 
# log_success "Upload concluído"

exit 0

