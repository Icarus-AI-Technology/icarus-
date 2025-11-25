#!/bin/bash

# Script para verificar migrações aplicadas no Supabase
# Compara arquivos locais com a tabela supabase_migrations.schema_migrations

set -e

echo "🔍 ICARUS - Verificação de Migrações Supabase"
echo "================================================"
echo ""

# Carregar variáveis de ambiente
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

echo "✅ Variáveis de ambiente carregadas"
echo "📍 SUPABASE_URL: ${VITE_SUPABASE_URL}"
echo ""

# Criar arquivo SQL para consultar migrações
cat > /tmp/check_migrations.sql << EOF
SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;
EOF

# Tentar executar via API SQL (se disponível/permitido para anon/service_role)
# Nota: Geralmente requer service_role key ou acesso direto ao banco.
# Como alternativa, vamos verificar se as tabelas críticas das últimas migrações existem.

echo "📋 Verificando tabelas críticas das últimas migrações..."

# Lista de tabelas para verificar (baseado nas últimas migrações)
TABLES=(
  "api_credentials"
  "crm_campanhas"
  "financeiro_transacoes"
  "estoque_movimentacoes"
  "audit_logs"
  "webhook_events"
  "agent_tasks"
)

echo "Verificando existência das tabelas:"

for table in "${TABLES[@]}"; do
    RESPONSE=$(curl -s -X GET \
        -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
        "${VITE_SUPABASE_URL}/rest/v1/${table}?select=count&limit=1" \
        -I)
    
    HTTP_CODE=$(echo "$RESPONSE" | grep HTTP | awk '{print $2}')
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "206" ]; then
        echo "✅ Tabela '$table' existe"
    else
        echo "❌ Tabela '$table' não encontrada ou sem acesso (HTTP $HTTP_CODE)"
    fi
done

echo ""
echo "📋 Verificando últimas funções RPC criadas..."

# Verificar RPCs recentes
RPCS=(
  "test-credential"
  "process_webhook"
)

for rpc in "${RPCS[@]}"; do
    RESPONSE=$(curl -s -X POST \
        -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -d '{}' \
        "${VITE_SUPABASE_URL}/rest/v1/rpc/${rpc}" \
        -I)
        
    HTTP_CODE=$(echo "$RESPONSE" | grep HTTP | awk '{print $2}')
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "204" ] || [ "$HTTP_CODE" == "400" ] || [ "$HTTP_CODE" == "500" ]; then
        # 400/500 significa que a função existe mas os argumentos estavam errados, o que é bom
        echo "✅ Função RPC '$rpc' existe"
    else
        echo "❌ Função RPC '$rpc' não encontrada (HTTP $HTTP_CODE)"
    fi
done

echo ""
echo "================================================"
echo "NOTA: Esta verificação é indireta."
echo "Para uma verificação exata, acesse o Supabase Dashboard > SQL Editor e execute:"
echo "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC;"
echo "================================================"
