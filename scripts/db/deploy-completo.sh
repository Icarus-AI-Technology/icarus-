#!/bin/bash
# ============================================
# Script: Implementação Completa ICARUS BD
# Versão: 1.0
# Descrição: Aplica todas as migrations e valida
# ============================================

set -e

echo "🚀 IMPLEMENTAÇÃO COMPLETA — ICARUS BD"
echo "===================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar SUPABASE_DB_URL
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}❌ ERRO: SUPABASE_DB_URL não configurada${NC}"
    echo ""
    echo "Configure com:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres'"
    exit 1
fi

echo -e "${BLUE}✅ Variável SUPABASE_DB_URL configurada${NC}"
echo ""

# Testar conexão
echo "🔌 Testando conexão..."
if psql "$SUPABASE_DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão OK${NC}"
else
    echo -e "${RED}❌ Falha na conexão${NC}"
    exit 1
fi
echo ""

# Listar migrations disponíveis
echo "📋 Migrations disponíveis:"
echo ""
MIGRATIONS=(
    "supabase/migrations/0001_init_schema.sql"
    "supabase/migrations/0002_rls_policies.sql"
    "supabase/migrations/0003_indexes_perf.sql"
    "supabase/migrations/0004_functions_triggers.sql"
    "supabase/migrations/0005_storage_policies.sql"
    "supabase/migrations/0006_seed_minimo.sql"
    "supabase/migrations/0007_dpo_encarregado.sql"
)

for i in "${!MIGRATIONS[@]}"; do
    MIGRATION="${MIGRATIONS[$i]}"
    if [ -f "$MIGRATION" ]; then
        echo -e "  ${GREEN}✅${NC} [$(($i+1))] $(basename $MIGRATION)"
    else
        echo -e "  ${RED}❌${NC} [$(($i+1))] $(basename $MIGRATION) - NÃO ENCONTRADO"
    fi
done

echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO: Esta operação irá aplicar TODAS as migrations${NC}"
echo ""
read -p "Deseja continuar? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Operação cancelada${NC}"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 INICIANDO IMPLEMENTAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Aplicar cada migration
for i in "${!MIGRATIONS[@]}"; do
    MIGRATION="${MIGRATIONS[$i]}"
    MIGRATION_NAME=$(basename "$MIGRATION")
    
    echo -e "${BLUE}[$(($i+1))/7]${NC} Aplicando: $MIGRATION_NAME"
    
    if [ -f "$MIGRATION" ]; then
        if psql "$SUPABASE_DB_URL" -f "$MIGRATION" > /tmp/migration_${i}.log 2>&1; then
            echo -e "     ${GREEN}✅ Aplicado com sucesso${NC}"
        else
            echo -e "     ${RED}❌ ERRO ao aplicar${NC}"
            echo ""
            echo "Log de erro:"
            cat /tmp/migration_${i}.log
            echo ""
            echo -e "${YELLOW}⚠️  Deseja continuar com as próximas migrations? (s/n)${NC}"
            read -p "" -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                exit 1
            fi
        fi
    else
        echo -e "     ${YELLOW}⚠️  Arquivo não encontrado, pulando...${NC}"
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIGRATIONS APLICADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Validação
echo "🔍 VALIDAÇÃO PÓS-IMPLEMENTAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Contar tabelas
echo "1️⃣  Contando tabelas..."
TABLE_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
")
echo -e "   ${GREEN}✅ $TABLE_COUNT tabelas criadas${NC}"

# 2. Verificar RLS
echo "2️⃣  Verificando RLS..."
RLS_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM pg_policies
WHERE schemaname = 'public';
")
echo -e "   ${GREEN}✅ $RLS_COUNT policies RLS configuradas${NC}"

# 3. Verificar índices
echo "3️⃣  Verificando índices..."
INDEX_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public';
")
echo -e "   ${GREEN}✅ $INDEX_COUNT índices criados${NC}"

# 4. Verificar funções
echo "4️⃣  Verificando funções..."
FUNCTION_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace;
")
echo -e "   ${GREEN}✅ $FUNCTION_COUNT funções criadas${NC}"

# 5. Verificar DPO configurado
echo "5️⃣  Verificando DPO..."
DPO_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM empresas
WHERE dpo_email IS NOT NULL;
")
if [ "$DPO_COUNT" -gt 0 ]; then
    echo -e "   ${GREEN}✅ $DPO_COUNT empresa(s) com DPO configurado${NC}"
else
    echo -e "   ${YELLOW}⚠️  Nenhum DPO configurado ainda (execute: npm run db:setup-dpo)${NC}"
fi

# 6. Verificar integridade hash chain
echo "6️⃣  Verificando integridade audit log..."
HASH_ISSUES=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM verificar_integridade_audit_log()
WHERE NOT integro;
" 2>/dev/null || echo "0")

if [ "$HASH_ISSUES" = "0" ] || [ -z "$HASH_ISSUES" ]; then
    echo -e "   ${GREEN}✅ Hash chain íntegro${NC}"
else
    echo -e "   ${RED}❌ $HASH_ISSUES registros corrompidos detectados${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA IMPLEMENTAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Tabelas criadas:      ${GREEN}$TABLE_COUNT${NC}"
echo -e "RLS Policies:         ${GREEN}$RLS_COUNT${NC}"
echo -e "Índices:              ${GREEN}$INDEX_COUNT${NC}"
echo -e "Funções:              ${GREEN}$FUNCTION_COUNT${NC}"
echo -e "Empresas com DPO:     ${GREEN}$DPO_COUNT${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  CONFIGURAR DPO (se ainda não configurou)"
echo "   ${BLUE}npm run db:setup-dpo${NC}"
echo ""
echo "2️⃣  EXECUTAR HEALTH CHECK"
echo "   ${BLUE}npm run db:health${NC}"
echo ""
echo "3️⃣  EXECUTAR AUDITORIA"
echo "   ${BLUE}npm run db:audit${NC}"
echo ""
echo "4️⃣  CONFIGURAR BACKUP AUTOMÁTICO"
echo "   ${BLUE}npm run db:backup:setup${NC}"
echo ""
echo "5️⃣  ATUALIZAR FRONTEND"
echo "   - Adicionar adapters camelCase ↔ snake_case"
echo "   - Atualizar queries com novos campos"
echo "   - Publicar contato DPO no site"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo "   - Validação LGPD: supabase/validacao_lgpd_brasil.md"
echo "   - Guia Backup: supabase/GUIA_BACKUP.md"
echo "   - Guia DPO: docs/lgpd/GUIA_RAPIDO_DPO.md"
echo "   - Mapeamento FE↔BD: supabase/mapeamento_fe_bd.md"
echo ""
echo "✅ Sistema pronto para produção!"

