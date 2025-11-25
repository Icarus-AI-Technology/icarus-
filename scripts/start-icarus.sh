#!/bin/bash

# Script de inicialização do ICARUS v5.0
# Autor: Agente Construtor OraclusX DS
# Data: 19/10/2025

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║     🚀 ICARUS V5.0 - INICIALIZAÇÃO FRONTEND 🚀       ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Limpar processos em portas específicas
cleanup_ports() {
    echo "🧹 Limpando portas..."
    
    if check_port 3000; then
        echo "  • Liberando porta 3000 (dev)..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    fi
    
    if check_port 4173; then
        echo "  • Liberando porta 4173 (preview)..."
        lsof -ti:4173 | xargs kill -9 2>/dev/null || true
    fi
    
    echo "  ✅ Portas liberadas"
    echo ""
}

# Menu de opções
show_menu() {
    echo "📋 ESCOLHA UMA OPÇÃO:"
    echo ""
    echo "  1) 🔥 Dev Server (Hot Reload - Porta 3000)"
    echo "  2) 🚀 Preview Build (Produção - Porta 4173)"
    echo "  3) 🛠️  Build + Preview (Rebuild completo)"
    echo "  4) ✅ Validação Completa (Type + Lint + Build)"
    echo "  5) 🧪 Testes E2E (Playwright)"
    echo "  6) 📊 Auditoria A11y + Performance"
    echo "  7) 🧹 Limpar Cache e Rebuild"
    echo "  8) 🌐 Abrir no Navegador"
    echo "  9) ❌ Sair"
    echo ""
    read -p "Digite sua escolha [1-9]: " choice
    echo ""
    
    case $choice in
        1)
            echo "🔥 Iniciando Dev Server..."
            echo ""
            cleanup_ports
            npm run dev
            ;;
        2)
            echo "🚀 Iniciando Preview Server..."
            echo ""
            if [ ! -d "dist" ]; then
                echo "⚠️  Build não encontrado. Gerando build..."
                npm run build
            fi
            cleanup_ports
            npm run preview
            ;;
        3)
            echo "🛠️  Rebuild Completo..."
            echo ""
            cleanup_ports
            rm -rf dist
            npm run build
            npm run preview
            ;;
        4)
            echo "✅ Executando Validação Completa..."
            echo ""
            npm run validate:all
            ;;
        5)
            echo "🧪 Executando Testes E2E..."
            echo ""
            if [ ! -d "dist" ]; then
                echo "⚠️  Build não encontrado. Gerando build..."
                npm run build
            fi
            cleanup_ports
            npm run preview &
            sleep 3
            npm run test:e2e
            ;;
        6)
            echo "📊 Executando Auditorias..."
            echo ""
            if [ ! -d "dist" ]; then
                echo "⚠️  Build não encontrado. Gerando build..."
                npm run build
            fi
            cleanup_ports
            npm run preview &
            sleep 3
            npm run qa:a11y
            npm run qa:perf
            ;;
        7)
            echo "🧹 Limpando Cache..."
            echo ""
            rm -rf node_modules/.vite
            rm -rf dist
            echo "🛠️  Rebuild..."
            npm run build
            echo "✅ Cache limpo e rebuild concluído!"
            ;;
        8)
            echo "🌐 Abrindo no Navegador..."
            echo ""
            echo "Escolha:"
            echo "  1) Dev Server (http://localhost:3000)"
            echo "  2) Preview (http://localhost:4173)"
            read -p "Digite [1-2]: " browser_choice
            
            if [ "$browser_choice" = "1" ]; then
                open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || echo "Abra manualmente: http://localhost:3000"
            else
                open http://localhost:4173 2>/dev/null || xdg-open http://localhost:4173 2>/dev/null || echo "Abra manualmente: http://localhost:4173"
            fi
            ;;
        9)
            echo "👋 Encerrando..."
            cleanup_ports
            exit 0
            ;;
        *)
            echo "❌ Opção inválida!"
            exit 1
            ;;
    esac
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto ICARUS"
    exit 1
fi

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependências não instaladas. Instalando..."
    npm install
fi

# Executar menu
show_menu

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║              ✅ PROCESSO CONCLUÍDO ✅                 ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"

