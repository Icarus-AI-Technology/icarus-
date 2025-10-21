#!/bin/bash
# ============================================
# Script: Backup Automático Diário
# Versão: 1.0
# Descrição: Backup completo do Postgres com retenção
# Uso: Executar via cron diariamente
# ============================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# ============================================
# CONFIGURAÇÃO
# ============================================

# Diretório de backups (ajustar conforme necessário)
BACKUP_DIR="${BACKUP_DIR:-/Users/daxmeneghel/icarus-make/backups}"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Retenção (dias)
RETENTION_DAYS=30

# Prefixo dos arquivos
PREFIX="icarus_backup"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)

# Nome do arquivo de backup
BACKUP_FILE="${BACKUP_DIR}/${PREFIX}_${TIMESTAMP}.sql.gz"

# ============================================
# FUNÇÕES
# ============================================

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "❌ ERRO: $1"
    exit 1
}

# ============================================
# VALIDAÇÕES
# ============================================

# Verificar se SUPABASE_DB_URL está configurado
if [ -z "$SUPABASE_DB_URL" ]; then
    error_exit "Variável SUPABASE_DB_URL não configurada"
fi

# Criar diretório de backups se não existir
mkdir -p "$BACKUP_DIR" || error_exit "Falha ao criar diretório $BACKUP_DIR"

# Verificar se pg_dump está disponível
if ! command -v pg_dump &> /dev/null; then
    error_exit "pg_dump não encontrado. Instale PostgreSQL client tools"
fi

# Verificar se gzip está disponível
if ! command -v gzip &> /dev/null; then
    error_exit "gzip não encontrado"
fi

# ============================================
# BACKUP
# ============================================

log "🚀 Iniciando backup automático..."
log "📁 Destino: $BACKUP_FILE"

# Testar conexão
log "🔌 Testando conexão..."
if ! psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    error_exit "Falha na conexão com o banco de dados"
fi

log "✅ Conexão OK"

# Executar backup com compressão
log "💾 Executando pg_dump..."

START_TIME=$(date +%s)

pg_dump "$SUPABASE_DB_URL" \
    --format=plain \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    --verbose \
    2>> "$LOG_FILE" \
    | gzip > "$BACKUP_FILE"

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "✅ Backup concluído com sucesso!"
    log "📊 Tamanho: $BACKUP_SIZE"
    log "⏱️  Duração: ${DURATION}s"
else
    error_exit "Falha ao executar pg_dump"
fi

# ============================================
# VERIFICAÇÃO DE INTEGRIDADE
# ============================================

log "🔍 Verificando integridade..."

# Verificar se arquivo existe e não está vazio
if [ ! -s "$BACKUP_FILE" ]; then
    error_exit "Arquivo de backup vazio ou não existe"
fi

# Testar descompressão
if ! gunzip -t "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    error_exit "Arquivo de backup corrompido (falha no gzip test)"
fi

log "✅ Integridade verificada"

# ============================================
# BACKUP INCREMENTAL (apenas schema se já existe backup hoje)
# ============================================

SCHEMA_FILE="${BACKUP_DIR}/${PREFIX}_schema_${DATE_ONLY}.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    log "📐 Salvando schema..."
    
    pg_dump "$SUPABASE_DB_URL" \
        --schema-only \
        --no-owner \
        --no-acl \
        2>> "$LOG_FILE" \
        > "$SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        log "✅ Schema salvo: $SCHEMA_FILE"
    else
        log "⚠️  Falha ao salvar schema (não-crítico)"
    fi
fi

# ============================================
# LIMPEZA (RETENÇÃO)
# ============================================

log "🧹 Aplicando política de retenção ($RETENTION_DAYS dias)..."

# Remover backups completos antigos
DELETED_COUNT=0
find "$BACKUP_DIR" -name "${PREFIX}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0 | while IFS= read -r -d '' file; do
    log "🗑️  Removendo: $(basename "$file")"
    rm -f "$file"
    DELETED_COUNT=$((DELETED_COUNT + 1))
done

# Manter apenas schemas dos últimos 7 dias
find "$BACKUP_DIR" -name "${PREFIX}_schema_*.sql" -type f -mtime +7 -delete

if [ $DELETED_COUNT -eq 0 ]; then
    log "✅ Nenhum backup expirado encontrado"
else
    log "✅ $DELETED_COUNT backup(s) antigo(s) removido(s)"
fi

# ============================================
# ESTATÍSTICAS
# ============================================

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "${PREFIX}_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "📊 Estatísticas:"
log "   - Total de backups: $TOTAL_BACKUPS"
log "   - Espaço total: $TOTAL_SIZE"
log "   - Último backup: $BACKUP_FILE"

# ============================================
# UPLOAD PARA CLOUD (OPCIONAL)
# ============================================

# Descomentar se quiser fazer upload para S3/Google Cloud
# if command -v aws &> /dev/null; then
#     log "☁️  Fazendo upload para S3..."
#     aws s3 cp "$BACKUP_FILE" "s3://seu-bucket/backups/" --storage-class STANDARD_IA
#     if [ $? -eq 0 ]; then
#         log "✅ Upload para S3 concluído"
#     else
#         log "⚠️  Falha no upload para S3 (não-crítico)"
#     fi
# fi

# ============================================
# NOTIFICAÇÃO (OPCIONAL)
# ============================================

# Descomentar para enviar notificação por e-mail
# if [ $? -eq 0 ]; then
#     echo "Backup ICARUS concluído com sucesso em $(date)" | mail -s "✅ Backup OK - ICARUS" admin@empresa.com
# fi

# ============================================
# FINALIZAÇÃO
# ============================================

log "🎉 Processo de backup concluído!"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit 0

