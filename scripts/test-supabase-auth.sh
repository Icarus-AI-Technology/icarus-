#!/bin/bash

# Script para testar conexão e autenticação com Supabase
# Verifica se as variáveis de ambiente estão corretas e testa login

set -e

echo "🔍 ICARUS - Verificação de Autenticação Supabase"
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
echo "🔑 ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo ""

# Testar conexão com Supabase
echo "🌐 Testando conexão com Supabase..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
    "${VITE_SUPABASE_URL}/rest/v1/")

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Conexão estabelecida (HTTP $HTTP_CODE)"
else
    echo "⚠️  Resposta HTTP: $HTTP_CODE"
fi
echo ""

# Testar autenticação
echo "🔐 Testando autenticação..."
echo "Email: dax@newortho.com.br"

# Criar arquivo temporário para request
cat > /tmp/supabase_auth_test.json << EOF
{
  "email": "dax@newortho.com.br",
  "password": "NewOrtho@2025"
}
EOF

# Fazer requisição de autenticação
AUTH_RESPONSE=$(curl -s \
    -X POST \
    -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d @/tmp/supabase_auth_test.json \
    "${VITE_SUPABASE_URL}/auth/v1/token?grant_type=password")

rm /tmp/supabase_auth_test.json

echo "Resposta da autenticação:"
echo "$AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$AUTH_RESPONSE"
echo ""

# Verificar se há access_token na resposta
if echo "$AUTH_RESPONSE" | grep -q "access_token"; then
    echo "✅ Autenticação bem-sucedida!"
    echo "🎉 Usuário existe e credenciais estão corretas"
    
    # Extrair UUID do usuário
    USER_ID=$(echo "$AUTH_RESPONSE" | jq -r '.user.id' 2>/dev/null)
    if [ ! -z "$USER_ID" ] && [ "$USER_ID" != "null" ]; then
        echo "👤 User ID: $USER_ID"
        echo ""
        echo "📋 Próximos passos:"
        echo "  1. Usuário está autenticado corretamente"
        echo "  2. Execute os testes E2E: npx playwright test"
        echo "  3. Acesse: http://localhost:5173/integracoes/credenciais"
    fi
else
    echo "❌ Falha na autenticação"
    echo ""
    
    # Verificar mensagem de erro
    ERROR_MSG=$(echo "$AUTH_RESPONSE" | jq -r '.msg // .message // .error_description // .error' 2>/dev/null)
    
    if [ ! -z "$ERROR_MSG" ] && [ "$ERROR_MSG" != "null" ]; then
        echo "Erro: $ERROR_MSG"
    fi
    
    echo ""
    echo "🔧 Possíveis causas:"
    echo "  1. Usuário não existe no Supabase Auth"
    echo "  2. Senha incorreta"
    echo "  3. Email não confirmado"
    echo ""
    echo "📋 Ações necessárias:"
    echo "  1. Acesse: ${VITE_SUPABASE_URL/https:\/\//https://app.}"
    echo "  2. Vá em: Authentication > Users"
    echo "  3. Verifique se o usuário dax@newortho.com.br existe"
    echo "  4. Se não existir, clique em 'Add User':"
    echo "     - Email: dax@newortho.com.br"
    echo "     - Password: NewOrtho2025@Admin"
    echo "     - Auto Confirm Email: YES ✅"
    echo "     - Role: authenticated"
fi

echo ""
echo "================================================"
