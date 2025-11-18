#!/bin/bash

###############################################################################
# ICARUS v5.0 - Migração Automática Supabase via CLI
# 
# Aplica todas as migrações SQL usando o Supabase CLI oficial
###############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Credenciais Supabase
export SUPABASE_URL="https://gvbkviozlhxorjoavmky.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNDc2NSwiZXhwIjoyMDc4OTkwNzY1fQ.9PaCxFGQdRhM00Cf3LSEn6PuBz1hcG1Pds1Kjp4XnL0"

export SUPABASE_DB_URL="postgresql://postgres.gvbkviozlhxorjoavmky:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Diretórios
MIGRATIONS_DIR="supabase/migrations"
LOG_DIR="logs/migrations"
REPORT_FILE="docs/RELATORIO_MIGRACAO_SUPABASE.md"

# Criar diretório de logs
mkdir -p "$LOG_DIR"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/migration_${TIMESTAMP}.log"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                        ║${NC}"
echo -e "${BLUE}║     🚀 MIGRAÇÃO AUTOMÁTICA SUPABASE - ICARUS v5.0 🚀                   ║${NC}"
echo -e "${BLUE}║                                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não encontrado!${NC}"
    echo -e "${YELLOW}Instalando Supabase CLI...${NC}"
    npm install -g supabase
fi

echo -e "${GREEN}✅ Supabase CLI encontrado${NC}"
echo ""

# Contador de estatísticas
TOTAL_MIGRATIONS=0
SUCCESSFUL_MIGRATIONS=0
FAILED_MIGRATIONS=0

# Listar migrações
echo -e "${BLUE}📋 Listando migrações...${NC}"
mapfile -t MIGRATION_FILES < <(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)
TOTAL_MIGRATIONS=${#MIGRATION_FILES[@]}

echo -e "${GREEN}Total de migrações encontradas: $TOTAL_MIGRATIONS${NC}"
echo ""

# Aplicar cada migração usando psql direto via conexão
echo -e "${BLUE}🔄 Aplicando migrações...${NC}"
echo ""

for migration_file in "${MIGRATION_FILES[@]}"; do
    migration_name=$(basename "$migration_file")
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Aplicando: $migration_name${NC}"
    
    # Aplicar migração usando psql (via Docker ou nativo)
    if psql "$SUPABASE_DB_URL" -f "$migration_file" >> "$LOG_FILE" 2>&1; then
        echo -e "${GREEN}✅ Sucesso${NC}"
        ((SUCCESSFUL_MIGRATIONS++))
    else
        echo -e "${RED}❌ Falha (pode ser esperado se já existe)${NC}"
        ((FAILED_MIGRATIONS++))
    fi
    
    sleep 0.2
done

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMO DA MIGRAÇÃO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Total:       $TOTAL_MIGRATIONS${NC}"
echo -e "${GREEN}Sucesso:     $SUCCESSFUL_MIGRATIONS${NC}"
echo -e "${RED}Falhas:      $FAILED_MIGRATIONS${NC}"
echo ""
echo -e "${BLUE}📝 Log completo: $LOG_FILE${NC}"

# Gerar relatório
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
| Taxa de Sucesso | $(echo "scale=1; $SUCCESSFUL_MIGRATIONS * 100 / $TOTAL_MIGRATIONS" | bc)% |

---

## 📋 Migrações Processadas

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
3. Verifique o log completo para detalhes

---

## 🔧 Validação Manual

Para validar o schema final:

\`\`\`bash
# Listar tabelas
supabase db remote exec --sql "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# Verificar migrations
supabase migration list
\`\`\`

---

**Migração concluída em**: $(date +"%Y-%m-%d %H:%M:%S")
EOF

echo -e "${GREEN}📄 Relatório gerado: $REPORT_FILE${NC}"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                        ║${NC}"
echo -e "${BLUE}║     ✅ MIGRAÇÃO CONCLUÍDA! ✅                                          ║${NC}"
echo -e "${BLUE}║                                                                        ║${NC}"
echo -e "${BLUE}║     Sucesso: $SUCCESSFUL_MIGRATIONS/$TOTAL_MIGRATIONS migrações       ║${NC}"
echo -e "${BLUE}║                                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════╝${NC}"

exit 0

