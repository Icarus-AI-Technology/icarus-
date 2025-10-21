#!/bin/bash

# Script de Configuração Rápida - GPT Researcher
# Este script facilita a configuração inicial do GPT Researcher

set -e

echo "🚀 Configuração Rápida - GPT Researcher"
echo "========================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if command -v docker &> /dev/null; then
        print_color "$GREEN" "✅ Docker está instalado"
        return 0
    else
        print_color "$RED" "❌ Docker não está instalado"
        return 1
    fi
}

# Verificar se Python está instalado
check_python() {
    if command -v python3 &> /dev/null; then
        print_color "$GREEN" "✅ Python3 está instalado"
        return 0
    else
        print_color "$RED" "❌ Python3 não está instalado"
        return 1
    fi
}

# Verificar porta 8000
check_port() {
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_color "$YELLOW" "⚠️  Porta 8000 está em uso"
        return 1
    else
        print_color "$GREEN" "✅ Porta 8000 está disponível"
        return 0
    fi
}

# Menu principal
show_menu() {
    echo ""
    print_color "$BLUE" "Escolha uma opção de instalação:"
    echo ""
    echo "1) Docker (Recomendado)"
    echo "2) Python Local"
    echo "3) Verificar Status"
    echo "4) Parar Servidor"
    echo "5) Ver Logs"
    echo "6) Configurar API Key"
    echo "7) Sair"
    echo ""
    read -p "Opção: " choice
    echo ""
    
    case $choice in
        1) install_docker ;;
        2) install_python ;;
        3) check_status ;;
        4) stop_server ;;
        5) view_logs ;;
        6) configure_api_key ;;
        7) exit 0 ;;
        *) 
            print_color "$RED" "Opção inválida!"
            show_menu
            ;;
    esac
}

# Instalar via Docker
install_docker() {
    print_color "$BLUE" "📦 Instalando GPT Researcher via Docker..."
    echo ""
    
    if ! check_docker; then
        print_color "$RED" "Por favor, instale o Docker primeiro:"
        print_color "$YELLOW" "https://docs.docker.com/get-docker/"
        show_menu
        return
    fi
    
    if ! check_port; then
        print_color "$YELLOW" "Porta 8000 em uso. Parando processos..."
        stop_server
    fi
    
    # Solicitar API Key
    read -p "Digite sua OpenAI API Key: " api_key
    
    if [ -z "$api_key" ]; then
        print_color "$RED" "❌ API Key é obrigatória!"
        show_menu
        return
    fi
    
    print_color "$BLUE" "🚀 Iniciando container Docker..."
    
    docker run -d \
        --name gpt-researcher \
        -p 8000:8000 \
        -e OPENAI_API_KEY="$api_key" \
        gptresearcher/gpt-researcher
    
    if [ $? -eq 0 ]; then
        print_color "$GREEN" "✅ GPT Researcher está rodando!"
        print_color "$BLUE" "🌐 Acesse: http://localhost:8000"
        print_color "$YELLOW" "📋 Nome do container: gpt-researcher"
        
        echo ""
        print_color "$BLUE" "Comandos úteis:"
        echo "  docker logs gpt-researcher          # Ver logs"
        echo "  docker stop gpt-researcher          # Parar"
        echo "  docker start gpt-researcher         # Iniciar"
        echo "  docker rm gpt-researcher            # Remover"
    else
        print_color "$RED" "❌ Erro ao iniciar container"
    fi
    
    show_menu
}

# Instalar via Python
install_python() {
    print_color "$BLUE" "🐍 Instalando GPT Researcher via Python..."
    echo ""
    
    if ! check_python; then
        print_color "$RED" "Por favor, instale o Python 3 primeiro:"
        print_color "$YELLOW" "https://www.python.org/downloads/"
        show_menu
        return
    fi
    
    if ! check_port; then
        print_color "$YELLOW" "Porta 8000 em uso. Parando processos..."
        stop_server
    fi
    
    # Criar ambiente virtual
    print_color "$BLUE" "📦 Criando ambiente virtual..."
    python3 -m venv gpt-researcher-env
    
    # Ativar ambiente virtual
    source gpt-researcher-env/bin/activate
    
    # Instalar GPT Researcher
    print_color "$BLUE" "📥 Instalando pacote..."
    pip install gpt-researcher
    
    # Solicitar API Key
    read -p "Digite sua OpenAI API Key: " api_key
    
    if [ -z "$api_key" ]; then
        print_color "$RED" "❌ API Key é obrigatória!"
        deactivate
        show_menu
        return
    fi
    
    # Exportar API Key
    export OPENAI_API_KEY="$api_key"
    
    # Criar script de inicialização
    cat > start-gpt-researcher.sh << 'EOF'
#!/bin/bash
source gpt-researcher-env/bin/activate
export OPENAI_API_KEY="$OPENAI_API_KEY"
python -m gpt_researcher.server --port 8000
EOF
    
    chmod +x start-gpt-researcher.sh
    
    print_color "$GREEN" "✅ Instalação concluída!"
    print_color "$BLUE" "🚀 Para iniciar o servidor:"
    echo "  ./start-gpt-researcher.sh"
    
    # Perguntar se quer iniciar agora
    read -p "Deseja iniciar o servidor agora? (s/n): " start_now
    
    if [ "$start_now" = "s" ] || [ "$start_now" = "S" ]; then
        print_color "$BLUE" "🚀 Iniciando servidor..."
        ./start-gpt-researcher.sh &
        sleep 3
        
        if check_port; then
            print_color "$RED" "❌ Servidor não iniciou"
        else
            print_color "$GREEN" "✅ Servidor está rodando em http://localhost:8000"
        fi
    fi
    
    show_menu
}

# Verificar status
check_status() {
    print_color "$BLUE" "🔍 Verificando status..."
    echo ""
    
    # Verificar Docker
    if check_docker; then
        if docker ps | grep -q gpt-researcher; then
            print_color "$GREEN" "✅ Container Docker está rodando"
            docker ps | grep gpt-researcher
        else
            print_color "$YELLOW" "⚠️  Container Docker não está rodando"
        fi
    fi
    
    echo ""
    
    # Verificar porta
    if check_port; then
        print_color "$YELLOW" "⚠️  Nenhum serviço rodando na porta 8000"
    else
        print_color "$GREEN" "✅ Serviço rodando na porta 8000"
        lsof -i :8000
        
        # Testar conexão
        echo ""
        print_color "$BLUE" "🌐 Testando conexão..."
        if curl -s http://localhost:8000 >/dev/null 2>&1; then
            print_color "$GREEN" "✅ Servidor respondendo corretamente"
        else
            print_color "$RED" "❌ Servidor não está respondendo"
        fi
    fi
    
    show_menu
}

# Parar servidor
stop_server() {
    print_color "$BLUE" "🛑 Parando servidor..."
    echo ""
    
    # Parar container Docker
    if docker ps | grep -q gpt-researcher; then
        docker stop gpt-researcher
        print_color "$GREEN" "✅ Container Docker parado"
    fi
    
    # Parar processo na porta 8000
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :8000 -sTCP:LISTEN -t)
        kill -9 $PID
        print_color "$GREEN" "✅ Processo na porta 8000 parado"
    fi
    
    show_menu
}

# Ver logs
view_logs() {
    print_color "$BLUE" "📋 Logs do GPT Researcher..."
    echo ""
    
    if docker ps | grep -q gpt-researcher; then
        docker logs --tail 50 -f gpt-researcher
    else
        print_color "$YELLOW" "⚠️  Container não está rodando"
    fi
    
    show_menu
}

# Configurar API Key
configure_api_key() {
    print_color "$BLUE" "🔑 Configurar API Key..."
    echo ""
    
    read -p "Digite sua OpenAI API Key: " api_key
    
    if [ -z "$api_key" ]; then
        print_color "$RED" "❌ API Key é obrigatória!"
        show_menu
        return
    fi
    
    # Salvar em arquivo .env
    echo "OPENAI_API_KEY=$api_key" > .env.gpt-researcher
    
    print_color "$GREEN" "✅ API Key salva em .env.gpt-researcher"
    print_color "$YELLOW" "⚠️  Reinicie o servidor para aplicar as mudanças"
    
    show_menu
}

# Iniciar script
clear
print_color "$BLUE" "╔══════════════════════════════════════╗"
print_color "$BLUE" "║   GPT Researcher - Setup Script     ║"
print_color "$BLUE" "║           Icarus Make                ║"
print_color "$BLUE" "╚══════════════════════════════════════╝"
echo ""

show_menu

