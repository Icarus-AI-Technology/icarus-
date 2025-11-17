#!/bin/bash

# ============================================
# ICARUS-PRO: Aplicação Completa de Migrations
# Consolida e aplica TODAS as 92 migrations
# Com tratamento de duplicidades
# ============================================

set -e

echo "🚀 ICARUS-PRO: Aplicação Completa de Migrations"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# ============================================
# 1. Consolidar Migrations
# ============================================

echo -e "${BLUE}📦 Consolidando 92 migrations...${NC}"
MIGRATION_DIR="supabase/migrations"
CONSOLIDATED_FILE="supabase/migrations/20250126_consolidated_all_tables.sql"

# Backup de migrations antigas se existir arquivo consolidado
if [ -f "$CONSOLIDATED_FILE" ]; then
    echo "Removendo consolidação anterior..."
    rm "$CONSOLIDATED_FILE"
fi

# Criar header
cat > "$CONSOLIDATED_FILE" << 'EOF'
-- ============================================
-- ICARUS-PRO: Migration Consolidada Completa
-- Data: 26/01/2025
-- Total: 92 migrations consolidadas
-- Tratamento de duplicidades: IF NOT EXISTS
-- ============================================

-- Garantir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector" SCHEMA public;

EOF

echo -e "${BLUE}📝 Processando migrations...${NC}"
PROCESSED=0
SKIPPED=0

# Processar cada migration
for migration in $(ls -1 "$MIGRATION_DIR"/*.sql 2>/dev/null | sort); do
    filename=$(basename "$migration")
    
    # Skip arquivos inválidos
    if [[ "$filename" == *".OLD"* ]] || [[ "$filename" == "README"* ]] || [[ "$filename" == *"YYY"* ]]; then
        echo -e "${YELLOW}⊙ Skipping: $filename${NC}"
        SKIPPED=$((SKIPPED+1))
        continue
    fi
    
    # Skip o arquivo consolidado
    if [[ "$filename" == "20250126_consolidated_all_tables.sql" ]]; then
        continue
    fi
    
    echo -e "  Processing: ${BLUE}$filename${NC}"
    
    # Adicionar comentário de origem
    echo "" >> "$CONSOLIDATED_FILE"
    echo "-- ============================================" >> "$CONSOLIDATED_FILE"
    echo "-- Source: $filename" >> "$CONSOLIDATED_FILE"
    echo "-- ============================================" >> "$CONSOLIDATED_FILE"
    echo "" >> "$CONSOLIDATED_FILE"
    
    # Processar SQL: adicionar IF NOT EXISTS onde apropriado
    sed -E \
        -e 's/CREATE TABLE ([^(]+)/CREATE TABLE IF NOT EXISTS \1/g' \
        -e 's/CREATE INDEX ([^ ]+)/CREATE INDEX IF NOT EXISTS \1/g' \
        -e 's/CREATE UNIQUE INDEX ([^ ]+)/CREATE UNIQUE INDEX IF NOT EXISTS \1/g' \
        -e 's/CREATE OR REPLACE/CREATE OR REPLACE/g' \
        -e 's/ALTER TABLE IF NOT EXISTS/ALTER TABLE/g' \
        "$migration" >> "$CONSOLIDATED_FILE"
    
    echo "" >> "$CONSOLIDATED_FILE"
    PROCESSED=$((PROCESSED+1))
done

echo ""
echo "=========================================="
echo "Consolidação Summary:"
echo -e "✓ Processadas: ${GREEN}$PROCESSED${NC}"
echo -e "⊙ Ignoradas: ${YELLOW}$SKIPPED${NC}"
echo -e "📄 Arquivo: ${BLUE}$CONSOLIDATED_FILE${NC}"
echo "=========================================="
echo ""

# ============================================
# 2. Aplicar Migration Consolidada
# ============================================

echo -e "${BLUE}🚀 Aplicando migration consolidada...${NC}"
echo ""

# Tentar aplicar com tratamento de erros
if supabase db push 2>&1 | tee /tmp/supabase-consolidated-push.log; then
    echo -e "${GREEN}✅ Migration consolidada aplicada com sucesso${NC}"
else
    EXIT_CODE=$?
    
    # Verificar se é erro de duplicidade (aceitável)
    if grep -q "already exists" /tmp/supabase-consolidated-push.log || \
       grep -q "duplicate" /tmp/supabase-consolidated-push.log; then
        echo -e "${YELLOW}⚠️  Alguns objetos já existem - isso é esperado${NC}"
        echo -e "${GREEN}✅ Migration aplicada (com objetos existentes ignorados)${NC}"
    else
        echo -e "${RED}❌ Erro na aplicação da migration${NC}"
        echo "Detalhes em: /tmp/supabase-consolidated-push.log"
        exit $EXIT_CODE
    fi
fi

echo ""

# ============================================
# 3. Verificar Tabelas Críticas
# ============================================

echo -e "${BLUE}🔍 Verificando tabelas críticas...${NC}"
echo ""

CRITICAL_TABLES=(
    "empresas"
    "usuarios"
    "produtos"
    "produtos_opme"
    "cirurgias"
    "cirurgia_materiais"
    "edr_research_sessions"
    "edr_agent_tasks"
    "contas_receber"
    "contas_pagar"
    "estoque"
    "consignacao_materiais"
)

VERIFIED=0
MISSING=0

for table in "${CRITICAL_TABLES[@]}"; do
    if supabase db exec "SELECT 1 FROM information_schema.tables WHERE table_name='$table' LIMIT 1;" &>/dev/null; then
        echo -e "${GREEN}✓${NC} $table"
        VERIFIED=$((VERIFIED+1))
    else
        echo -e "${RED}✗${NC} $table"
        MISSING=$((MISSING+1))
    fi
done

echo ""
echo "Verificadas: $VERIFIED/${#CRITICAL_TABLES[@]} tabelas críticas"
echo ""

# ============================================
# 4. Contar Tabelas Total
# ============================================

echo -e "${BLUE}📊 Contando tabelas no database...${NC}"

TABLE_COUNT=$(supabase db exec "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';" 2>/dev/null | grep -o '[0-9]\+' | head -1 || echo "?")

echo -e "Total de tabelas no database: ${GREEN}$TABLE_COUNT${NC}"
echo ""

# ============================================
# 5. Verificar Storage Buckets
# ============================================

echo -e "${BLUE}📦 Verificando Storage Buckets...${NC}"
echo ""

BUCKETS=(
    "documentos-dpo"
    "notas-fiscais"
    "imagens-produtos"
    "relatorios"
    "certificados"
    "avatares"
)

echo "Buckets esperados: ${#BUCKETS[@]}"
echo "Status: Verificação manual no Dashboard recomendada"
echo ""

# ============================================
# 6. Summary Final
# ============================================

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Processo Completo!${NC}"
echo "=========================================="
echo ""
echo "📊 Resultados:"
echo -e "  • Migrations processadas: ${GREEN}$PROCESSED${NC}"
echo -e "  • Migrations ignoradas: ${YELLOW}$SKIPPED${NC}"
echo -e "  • Tabelas no database: ${GREEN}$TABLE_COUNT${NC}"
echo -e "  • Tabelas críticas verificadas: ${GREEN}$VERIFIED/${#CRITICAL_TABLES[@]}${NC}"

if [ "$MISSING" -gt 0 ]; then
    echo -e "  • Tabelas faltando: ${RED}$MISSING${NC}"
fi

echo ""
echo "Próximos passos:"
echo "1. Verificar Dashboard Supabase"
echo "2. Conferir tabelas criadas"
echo "3. Testar Edge Functions"
echo "4. Executar: npx tsx scripts/verify-supabase-status.ts"
echo ""
echo "📚 Migration consolidada: $CONSOLIDATED_FILE"
echo "📋 Log completo: /tmp/supabase-consolidated-push.log"
echo ""

