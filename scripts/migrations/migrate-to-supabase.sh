#!/bin/bash

###############################################################################
# ICARUS v5.0 - Migração Automática Supabase
# 
# Aplica todas as migrações SQL no Supabase de forma ordenada e segura
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Credenciais Supabase
SUPABASE_URL="https://gvbkviozlhxorjoavmky.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNDc2NSwiZXhwIjoyMDc4OTkwNzY1fQ.9PaCxFGQdRhM00Cf3LSEn6PuBz1hcG1Pds1Kjp4XnL0"

# Diretórios
MIGRATIONS_DIR="supabase/migrations"
LOG_DIR="logs/migrations"
REPORT_FILE="docs/RELATORIO_MIGRACAO_SUPABASE.md"

# Criar diretório de logs
mkdir -p "$LOG_DIR"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/migration_${TIMESTAMP}.log"

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║     🚀 MIGRAÇÃO AUTOMÁTICA SUPABASE - ICARUS v5.0 🚀                   ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Função para logging
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo "[${timestamp}] [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Função para aplicar migração via API REST do Supabase
apply_migration() {
  local migration_file=$1
  local migration_name=$(basename "$migration_file" .sql)
  
  log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "INFO" "Aplicando: $migration_name"
  
  # Ler conteúdo do arquivo SQL
  local sql_content=$(cat "$migration_file")
  
  # Escapar aspas para JSON
  sql_content=$(echo "$sql_content" | sed 's/"/\\"/g' | tr '\n' ' ')
  
  # Tentar aplicar via SQL direto usando psql (requer conexão direta)
  # Como não temos acesso direto ao psql, vamos usar a REST API do Supabase
  
  # Criar payload JSON
  local payload=$(cat <<EOF
{
  "query": "${sql_content}"
}
EOF
)
  
  # Aplicar via REST API (usando service_role para ter permissões)
  local response=$(curl -s -w "\n%{http_code}" -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  local http_code=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    log "INFO" "✅ Migração aplicada com sucesso"
    return 0
  else
    log "ERROR" "❌ Falha na migração (HTTP $http_code)"
    log "ERROR" "Response: $body"
    return 1
  fi
}

# Contador de estatísticas
TOTAL_MIGRATIONS=0
SUCCESSFUL_MIGRATIONS=0
FAILED_MIGRATIONS=0
SKIPPED_MIGRATIONS=0

# Listar e ordenar migrações
log "INFO" "📋 Listando migrações disponíveis..."
mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

TOTAL_MIGRATIONS=${#MIGRATION_FILES[@]}
log "INFO" "Total de migrações encontradas: $TOTAL_MIGRATIONS"
echo ""

# Aplicar cada migração
for migration_file in "${MIGRATION_FILES[@]}"; do
  migration_name=$(basename "$migration_file" .sql)
  
  # Skip de arquivos que claramente são duplicados ou backups
  if [[ "$migration_name" == *"backup"* ]] || [[ "$migration_name" == *"old"* ]]; then
    log "WARN" "⏭️  Pulando (backup/old): $migration_name"
    ((SKIPPED_MIGRATIONS++))
    continue
  fi
  
  if apply_migration "$migration_file"; then
    ((SUCCESSFUL_MIGRATIONS++))
  else
    ((FAILED_MIGRATIONS++))
    # Continuar mesmo com falhas (algumas migrações podem falhar se já existirem)
  fi
  
  # Pequeno delay para não sobrecarregar a API
  sleep 0.5
done

echo ""
log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "INFO" "📊 RESUMO DA MIGRAÇÃO"
log "INFO" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "INFO" "Total:       $TOTAL_MIGRATIONS"
log "INFO" "Sucesso:     $SUCCESSFUL_MIGRATIONS"
log "INFO" "Falhas:      $FAILED_MIGRATIONS"
log "INFO" "Puladas:     $SKIPPED_MIGRATIONS"
log "INFO" ""
log "INFO" "📝 Log completo: $LOG_FILE"

# Gerar relatório markdown
cat > "$REPORT_FILE" << EOF
# Relatório de Migração Supabase - ICARUS v5.0

**Data**: $(date +"%d/%m/%Y %H:%M:%S")  
**Projeto Supabase**: gvbkviozlhxorjoavmky  
**URL**: $SUPABASE_URL

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de Migrações | $TOTAL_MIGRATIONS |
| Aplicadas com Sucesso | $SUCCESSFUL_MIGRATIONS |
| Falhas | $FAILED_MIGRATIONS |
| Puladas | $SKIPPED_MIGRATIONS |

---

## 📋 Migrações Aplicadas

$(for migration_file in "${MIGRATION_FILES[@]}"; do
  echo "- \`$(basename "$migration_file")\`"
done)

---

## 📝 Log Detalhado

Ver arquivo: \`$LOG_FILE\`

---

## ⚠️ Observações

1. Algumas migrações podem falhar se já existirem tabelas/objetos
2. Isso é esperado em migrações incrementais
3. Verifique o log completo para detalhes de cada migração

---

**Migração concluída em**: $(date +"%Y-%m-%d %H:%M:%S")
EOF

log "INFO" "📄 Relatório gerado: $REPORT_FILE"

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║     ✅ MIGRAÇÃO CONCLUÍDA! ✅                                          ║"
echo "║                                                                        ║"
echo "║     Sucesso: $SUCCESSFUL_MIGRATIONS/$TOTAL_MIGRATIONS migrações       ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"

# Retornar código de saída baseado em falhas
if [ "$FAILED_MIGRATIONS" -gt 0 ]; then
  exit 1
else
  exit 0
fi

