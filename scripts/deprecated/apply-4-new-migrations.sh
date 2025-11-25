#!/bin/bash
# Script para aplicar as 4 novas migrations no Supabase
# Data: 2025-10-25

set -e  # Exit on error

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                       ║"
echo "║         🚀 APLICAR 4 NOVAS MIGRATIONS - AGENTE 03                    ║"
echo "║                                                                       ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se DATABASE_URL está definido
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERRO: DATABASE_URL não está definido."
    echo ""
    echo "📝 Para configurar:"
    echo ""
    echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres'"
    echo ""
    echo "   Obtenha a connection string em:"
    echo "   https://app.supabase.com → Project Settings → Database → Connection String"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL configurado"
echo ""

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ ERRO: psql não encontrado."
    echo ""
    echo "📝 Para instalar no macOS:"
    echo "   brew install postgresql"
    echo ""
    exit 1
fi

echo "✅ psql encontrado: $(psql --version)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Migrations a aplicar (na ordem):"
echo ""
echo "   1️⃣  20251025_create_missing_critical_tables.sql    (17KB)"
echo "   2️⃣  20251025_create_14_missing_rpcs.sql            (26KB)"
echo "   3️⃣  20251025_create_12_missing_triggers.sql        (18KB)"
echo "   4️⃣  20251025_create_materialized_views.sql         (18KB)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Confirmar
read -p "🤔 Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada pelo usuário."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Array com as migrations
migrations=(
    "20251025_create_missing_critical_tables.sql"
    "20251025_create_14_missing_rpcs.sql"
    "20251025_create_12_missing_triggers.sql"
    "20251025_create_materialized_views.sql"
)

# Aplicar cada migration
for i in "${!migrations[@]}"; do
    num=$((i + 1))
    migration="${migrations[$i]}"
    filepath="supabase/migrations/$migration"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  $num️⃣  Aplicando: $migration"
    echo ""
    
    if [ ! -f "$filepath" ]; then
        echo "  ❌ ERRO: Arquivo não encontrado: $filepath"
        exit 1
    fi
    
    # Aplicar migration
    if psql "$DATABASE_URL" -f "$filepath" -v ON_ERROR_STOP=1 > /tmp/migration_$num.log 2>&1; then
        echo "  ✅ Sucesso!"
    else
        echo "  ❌ ERRO ao aplicar migration!"
        echo ""
        echo "  Log do erro:"
        cat /tmp/migration_$num.log
        echo ""
        exit 1
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ TODAS AS 4 MIGRATIONS APLICADAS COM SUCESSO!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Próximo passo: Validar as migrations"
echo ""
echo "   Execute: ./validate-migrations.sh"
echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║              ✅ MIGRATIONS APLICADAS COM SUCESSO!                    ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

