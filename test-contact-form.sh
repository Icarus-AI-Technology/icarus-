#!/bin/bash

# Script de Teste - Formulário de Contato ICARUS
# Testa diferentes cenários do endpoint /api/contact

echo "🧪 TESTANDO FORMULÁRIO DE CONTATO - ICARUS NEWORTHO"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detectar porta (dev=5174, prod=4173)
if lsof -Pi :5174 -sTCP:LISTEN -t >/dev/null ; then
    PORT=5174
    ENV="DEV"
elif lsof -Pi :4173 -sTCP:LISTEN -t >/dev/null ; then
    PORT=4173
    ENV="PREVIEW"
else
    echo -e "${RED}❌ Nenhum servidor rodando nas portas 5174 ou 4173${NC}"
    echo "Execute: pnpm dev ou pnpm preview"
    exit 1
fi

echo -e "${GREEN}✅ Servidor encontrado em http://localhost:$PORT ($ENV)${NC}"
echo ""

# Função para testar endpoint
test_endpoint() {
    local test_name=$1
    local data=$2
    local expected_status=$3
    
    echo -e "${YELLOW}Test: $test_name${NC}"
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST http://localhost:$PORT/api/contact \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_status=$(echo "$response" | grep HTTP_STATUS | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_STATUS/d')
    
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ Status: $http_status (esperado)${NC}"
    else
        echo -e "${RED}❌ Status: $http_status (esperado: $expected_status)${NC}"
    fi
    
    echo "Response: $body"
    echo ""
}

# Teste 1: Request válido completo
test_endpoint \
    "Request válido completo" \
    '{
        "name": "João Silva",
        "email": "joao@example.com",
        "phone": "11987654321",
        "subject": "Dúvida sobre produto",
        "message": "Gostaria de saber mais informações sobre os produtos OPME."
    }' \
    "200"

# Teste 2: Request mínimo (apenas campos obrigatórios)
test_endpoint \
    "Request mínimo (campos obrigatórios)" \
    '{
        "name": "Maria Santos",
        "email": "maria@example.com",
        "message": "Mensagem de teste"
    }' \
    "200"

# Teste 3: Sem nome (deve falhar)
test_endpoint \
    "Sem nome (deve falhar)" \
    '{
        "email": "teste@example.com",
        "message": "Mensagem sem nome"
    }' \
    "400"

# Teste 4: Email inválido (deve falhar)
test_endpoint \
    "Email inválido (deve falhar)" \
    '{
        "name": "Pedro Oliveira",
        "email": "email-invalido",
        "message": "Mensagem com email inválido"
    }' \
    "400"

# Teste 5: Sem mensagem (deve falhar)
test_endpoint \
    "Sem mensagem (deve falhar)" \
    '{
        "name": "Ana Costa",
        "email": "ana@example.com",
        "message": ""
    }' \
    "400"

# Teste 6: Método GET (deve falhar)
echo -e "${YELLOW}Test: Método GET (deve falhar)${NC}"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X GET http://localhost:$PORT/api/contact)

http_status=$(echo "$response" | grep HTTP_STATUS | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')

if [ "$http_status" = "405" ]; then
    echo -e "${GREEN}✅ Status: $http_status (esperado)${NC}"
else
    echo -e "${RED}❌ Status: $http_status (esperado: 405)${NC}"
fi
echo "Response: $body"
echo ""

# Teste 7: OPTIONS (preflight CORS)
echo -e "${YELLOW}Test: OPTIONS preflight CORS${NC}"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X OPTIONS http://localhost:$PORT/api/contact \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type")

http_status=$(echo "$response" | grep HTTP_STATUS | cut -d: -f2)

if [ "$http_status" = "200" ]; then
    echo -e "${GREEN}✅ Status: $http_status (CORS OK)${NC}"
else
    echo -e "${RED}❌ Status: $http_status (esperado: 200)${NC}"
fi
echo ""

# Resumo
echo "=================================================="
echo -e "${GREEN}✅ TESTES CONCLUÍDOS${NC}"
echo ""
echo "📊 Estatísticas:"
echo "  - Ambiente: $ENV (porta $PORT)"
echo "  - Total de testes: 7"
echo "  - Data: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "💡 Para testar no navegador:"
echo "   http://localhost:$PORT/contato"
echo ""
