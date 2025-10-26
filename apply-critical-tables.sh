#!/bin/bash
# Script para aplicar a migration das 4 tabelas críticas
# Uso: ./apply-critical-tables.sh

echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║     Aplicando Migration: 4 Tabelas Críticas                           ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo ""

MIGRATION_FILE="supabase/migrations/20251025_create_missing_critical_tables.sql"

echo "📄 Migration: $MIGRATION_FILE"
echo ""

# Verificar se arquivo existe
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Erro: Arquivo não encontrado!"
    exit 1
fi

echo "📊 Estatísticas do arquivo:"
echo "   • Linhas: $(wc -l < $MIGRATION_FILE)"
echo "   • Tamanho: $(du -h $MIGRATION_FILE | cut -f1)"
echo ""

# Métodos disponíveis
echo "🔧 Métodos disponíveis para aplicar:"
echo ""
echo "1️⃣  Via Supabase Push (Recomendado)"
echo "   supabase db push"
echo ""
echo "2️⃣  Via SQL direto com psql (requer DATABASE_URL)"
echo "   export DATABASE_URL='postgresql://...' "
echo "   psql \$DATABASE_URL -f $MIGRATION_FILE"
echo ""
echo "3️⃣  Via Supabase Studio (Interface Web)"
echo "   • Acesse: https://app.supabase.com"
echo "   • SQL Editor → Copiar conteúdo de $MIGRATION_FILE"
echo "   • Executar"
echo ""
echo "4️⃣  Via comando direto (Este script tentará usar psql)"
echo ""

# Tentar aplicar
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL configurado!"
    echo ""
    read -p "Deseja aplicar a migration agora? (y/N): " confirm
    
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        echo ""
        echo "🚀 Aplicando migration..."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        psql $DATABASE_URL -f $MIGRATION_FILE
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ Migration aplicada com sucesso!"
            echo ""
            echo "📋 Tabelas criadas:"
            echo "   • consignacao_materiais"
            echo "   • produtos_opme"
            echo "   • rastreabilidade_opme"
            echo "   • compliance_requisitos_abbott"
        else
            echo ""
            echo "❌ Erro ao aplicar migration. Verifique os logs acima."
            exit 1
        fi
    else
        echo ""
        echo "⏭️  Migration não aplicada."
    fi
else
    echo "⚠️  DATABASE_URL não configurado."
    echo ""
    echo "💡 Configure com:"
    echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'"
    echo ""
    echo "📝 Ou use um dos métodos alternativos listados acima."
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                    Script finalizado                                  ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"

