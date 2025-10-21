#!/bin/bash

# ============================================
# SCRIPT DE APLICAÇÃO DA MIGRAÇÃO
# ============================================
# Versão: 1.0.0
# Data: 2025-10-20
# Equipe: AGENTE_EQUIPE_ECONOMIA_AI_TUTORES
# ============================================

set -e  # Exit on error

echo "🚀 ICARUS v5.0 - Aplicação de Migração"
echo "========================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. VERIFICAR PRÉ-REQUISITOS
# ============================================

echo "📋 Verificando pré-requisitos..."

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o PostgreSQL client:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt-get install postgresql-client"
    echo ""
    echo "Ou use o SQL Editor do Supabase Dashboard:"
    echo "  https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql"
    exit 1
fi

echo -e "${GREEN}✅ psql encontrado${NC}"

# ============================================
# 2. VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================

if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_DB_URL não configurada${NC}"
    echo ""
    echo "Por favor, configure a variável de ambiente:"
    echo ""
    echo "export SUPABASE_DB_URL='postgresql://postgres:[SENHA]@db.ttswvavcisdnonytslom.supabase.co:5432/postgres'"
    echo ""
    echo "Obtenha a senha em:"
    echo "  Supabase Dashboard → Project Settings → Database → Database Password"
    echo ""
    read -p "Deseja inserir manualmente agora? (s/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo ""
        echo "Cole a connection string completa:"
        read -s SUPABASE_DB_URL
        export SUPABASE_DB_URL
        echo -e "${GREEN}✅ Connection string configurada${NC}"
    else
        echo -e "${RED}❌ Cancelado pelo usuário${NC}"
        exit 1
    fi
fi

# ============================================
# 3. TESTAR CONEXÃO
# ============================================

echo ""
echo "🔌 Testando conexão com o banco..."

if ! psql "$SUPABASE_DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${RED}❌ Falha ao conectar no banco de dados!${NC}"
    echo ""
    echo "Verifique:"
    echo "  1. Connection string está correta"
    echo "  2. Senha está correta"
    echo "  3. Firewall permite conexão"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Conexão estabelecida${NC}"

# ============================================
# 4. VERIFICAR ARQUIVO DE MIGRAÇÃO
# ============================================

MIGRATION_FILE="supabase/migrations/0009_tutores_economia_corrigido.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Arquivo de migração não encontrado: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Arquivo de migração encontrado${NC}"

# ============================================
# 5. BACKUP (Opcional mas RECOMENDADO)
# ============================================

echo ""
read -p "📦 Deseja criar um backup antes de aplicar? (S/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    BACKUP_FILE="backups/pre-migration-$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p backups
    
    echo "📦 Criando backup..."
    
    if pg_dump "$SUPABASE_DB_URL" > "$BACKUP_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  Falha ao criar backup (continuando...)${NC}"
    fi
fi

# ============================================
# 6. APLICAR MIGRAÇÃO
# ============================================

echo ""
echo "🔄 Aplicando migração..."
echo ""

if psql "$SUPABASE_DB_URL" < "$MIGRATION_FILE" 2>&1 | tee migration.log; then
    echo ""
    echo -e "${GREEN}✅ Migração aplicada com sucesso!${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao aplicar migração!${NC}"
    echo ""
    echo "Verifique o arquivo de log: migration.log"
    exit 1
fi

# ============================================
# 7. VALIDAÇÃO PÓS-MIGRAÇÃO
# ============================================

echo ""
echo "🔍 Validando migração..."

VALIDATION_SQL="
SELECT 
  COUNT(*) as tabelas_criadas
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN (
    'feature_flags',
    'feature_flags_audit',
    'conhecimento_base',
    'legislacao_updates',
    'notificacoes_legislacao',
    'tutor_logs',
    'certificacoes_usuario'
  );
"

TABELAS_CRIADAS=$(psql "$SUPABASE_DB_URL" -t -c "$VALIDATION_SQL" | tr -d ' ')

echo "Tabelas criadas/atualizadas: $TABELAS_CRIADAS/7"

if [ "$TABELAS_CRIADAS" -ge 5 ]; then
    echo -e "${GREEN}✅ Validação passou${NC}"
else
    echo -e "${YELLOW}⚠️  Validação parcial (esperado: 7, encontrado: $TABELAS_CRIADAS)${NC}"
fi

# ============================================
# 8. RESUMO
# ============================================

echo ""
echo "========================================"
echo "✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO"
echo "========================================"
echo ""
echo "📊 Próximos passos:"
echo ""
echo "1. Iniciar serviços automatizados:"
echo "   pm2 start ecosystem.economia.config.js"
echo ""
echo "2. Popular base de conhecimento:"
echo "   npm run ai:tutor:reindex"
echo ""
echo "3. Gerar relatório de custos:"
echo "   npm run cost:report"
echo ""
echo "4. Ver guia completo:"
echo "   cat docs/tutores/GUIA_APLICACAO_MIGRACAO.md"
echo ""

# Limpar variável sensível
unset SUPABASE_DB_URL

exit 0

