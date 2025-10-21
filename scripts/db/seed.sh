#!/bin/bash
# ============================================
# Script: Seed do Banco de Dados
# Versão: 1.0
# Descrição: Popula o banco com dados mínimos
# ============================================

set -e

echo "🌱 Populando banco com dados de desenvolvimento..."

# Verificar se arquivo de seed existe
SEED_FILE="supabase/migrations/0006_seed_minimo.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo "❌ Arquivo de seed não encontrado: $SEED_FILE"
    exit 1
fi

# Verificar variável de ambiente
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não configurada"
    echo "Configure com: export SUPABASE_DB_URL='postgresql://...'"
    exit 1
fi

echo ""
echo "⚠️  ATENÇÃO: Este seed é apenas para DESENVOLVIMENTO"
echo "Nunca execute em produção!"
echo ""
read -p "Continuar? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⚙️  Aplicando seed..."
    
    psql "$SUPABASE_DB_URL" -f "$SEED_FILE"
    
    echo ""
    echo "✅ Seed aplicado com sucesso!"
    echo ""
    echo "📊 Dados inseridos:"
    echo "  - 1 empresa demo"
    echo "  - 6 produtos OPME"
    echo "  - 8 lotes com rastreabilidade"
    echo "  - 4 médicos"
    echo "  - 5 hospitais"
    echo "  - 3 cirurgias agendadas"
else
    echo "❌ Operação cancelada"
    exit 0
fi

echo ""
echo "🎉 Processo concluído!"

