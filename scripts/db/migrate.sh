#!/bin/bash
# ============================================
# Script: Aplicar Migrations
# Versão: 1.0
# Descrição: Aplica migrations versionadas no Supabase
# ============================================

set -e # Exit on error

echo "🚀 Aplicando migrations do ICARUS..."

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi

# Verificar se está no diretório correto
if [ ! -d "supabase/migrations" ]; then
    echo "❌ Diretório supabase/migrations não encontrado"
    exit 1
fi

# Listar migrations disponíveis
echo ""
echo "📋 Migrations disponíveis:"
ls -1 supabase/migrations/*.sql

echo ""
read -p "Aplicar todas as migrations? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚙️  Aplicando migrations..."
    
    # Aplicar migrations
    supabase db push
    
    echo ""
    echo "✅ Migrations aplicadas com sucesso!"
    echo ""
    echo "📊 Status do banco:"
    supabase db diff --schema public
else
    echo "❌ Operação cancelada"
    exit 0
fi

echo ""
echo "🎉 Processo concluído!"

