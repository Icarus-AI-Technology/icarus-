#!/bin/bash

# Script de Gerenciamento do Servidor Mock GPT Researcher
# Facilita iniciar, parar e verificar o status do servidor

PORT=8000
PID_FILE=".mock-server.pid"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Mock GPT Researcher Server - Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
}

check_status() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        echo -e "${GREEN}✅ Servidor está RODANDO${NC}"
        echo -e "   PID: $PID"
        echo -e "   Porta: $PORT"
        echo -e "   URL: http://localhost:$PORT"
        return 0
    else
        echo -e "${RED}❌ Servidor NÃO está rodando${NC}"
        return 1
    fi
}

start_server() {
    print_status
    echo ""
    
    if check_status 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}⚠️  Servidor já está rodando!${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}🚀 Iniciando servidor...${NC}"
    
    python3 mock-gpt-researcher-server.py $PORT > mock-server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > $PID_FILE
    
    sleep 2
    
    if check_status > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Servidor iniciado com sucesso!${NC}"
        echo ""
        echo -e "${BLUE}📊 Informações:${NC}"
        echo -e "   URL: ${GREEN}http://localhost:$PORT${NC}"
        echo -e "   Health: ${GREEN}http://localhost:$PORT/health${NC}"
        echo -e "   Logs: ${YELLOW}mock-server.log${NC}"
        echo ""
        echo -e "${BLUE}🎯 Teste agora:${NC}"
        echo -e "   curl http://localhost:$PORT/health"
        echo ""
        echo -e "${BLUE}🛑 Para parar:${NC}"
        echo -e "   ./manage-mock-server.sh stop"
    else
        echo ""
        echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
        echo -e "   Verifique o arquivo: mock-server.log"
        return 1
    fi
}

stop_server() {
    print_status
    echo ""
    
    if ! check_status 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}⚠️  Servidor não está rodando${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}🛑 Parando servidor...${NC}"
    
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    kill $PID 2>/dev/null
    
    sleep 1
    
    if check_status > /dev/null 2>&1; then
        kill -9 $PID 2>/dev/null
        sleep 1
    fi
    
    if ! check_status > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Servidor parado com sucesso!${NC}"
        rm -f $PID_FILE
    else
        echo ""
        echo -e "${RED}❌ Falha ao parar servidor${NC}"
        return 1
    fi
}

restart_server() {
    print_status
    echo ""
    echo -e "${BLUE}🔄 Reiniciando servidor...${NC}"
    
    stop_server > /dev/null 2>&1
    sleep 1
    start_server
}

show_logs() {
    print_status
    echo ""
    
    if [ ! -f "mock-server.log" ]; then
        echo -e "${YELLOW}⚠️  Arquivo de log não encontrado${NC}"
        return 1
    fi
    
    echo -e "${BLUE}📋 Últimas 20 linhas do log:${NC}"
    echo ""
    tail -20 mock-server.log
}

test_server() {
    print_status
    echo ""
    
    if ! check_status 2>/dev/null; then
        echo ""
        echo -e "${RED}❌ Servidor não está rodando${NC}"
        echo -e "   Inicie com: ./manage-mock-server.sh start"
        return 1
    fi
    
    echo ""
    echo -e "${BLUE}🧪 Testando servidor...${NC}"
    echo ""
    
    echo -e "${BLUE}1. Health Check:${NC}"
    HEALTH=$(curl -s http://localhost:$PORT/health)
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Resposta:${NC} $HEALTH"
    else
        echo -e "   ${RED}❌ Falhou${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}2. Teste de Pesquisa:${NC}"
    TEST_RESPONSE=$(curl -s -X POST http://localhost:$PORT/research \
        -H "Content-Type: application/json" \
        -d '{"task": "Test query"}')
    
    if [ $? -eq 0 ]; then
        echo -e "   ${GREEN}✅ Pesquisa funcionando${NC}"
        echo -e "   Resposta (primeiros 100 caracteres):"
        echo "$TEST_RESPONSE" | cut -c1-100
    else
        echo -e "   ${RED}❌ Falhou${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Testes completos!${NC}"
}

show_usage() {
    print_status
    echo ""
    echo -e "${BLUE}Uso:${NC}"
    echo "  ./manage-mock-server.sh [comando]"
    echo ""
    echo -e "${BLUE}Comandos:${NC}"
    echo "  start    - Inicia o servidor"
    echo "  stop     - Para o servidor"
    echo "  restart  - Reinicia o servidor"
    echo "  status   - Verifica o status"
    echo "  logs     - Mostra os logs"
    echo "  test     - Testa o servidor"
    echo "  help     - Mostra esta ajuda"
    echo ""
    echo -e "${BLUE}Exemplos:${NC}"
    echo "  ./manage-mock-server.sh start"
    echo "  ./manage-mock-server.sh status"
    echo "  ./manage-mock-server.sh test"
}

# Main
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        print_status
        echo ""
        check_status
        ;;
    logs)
        show_logs
        ;;
    test)
        test_server
        ;;
    help|--help|-h|"")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Comando inválido: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

