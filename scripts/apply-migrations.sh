#!/bin/bash

# Script de Aplicação Automática de Migrations
# ICARUS v5.0 - AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3

set -e  # Parar em caso de erro

PROJECT_ROOT="/Users/daxmeneghel/icarus-make"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          🚀 Aplicação de Migrations - ICARUS v5.0                     ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI não encontrado!${NC}"
    echo ""
    echo "Instale com:"
    echo "  macOS:   brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    echo "  Linux:   brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI encontrado: $(supabase --version)${NC}"
echo ""

# Verificar modo de aplicação
echo "Escolha o modo de aplicação:"
echo "  1) Local (Docker - supabase start + db reset)"
echo "  2) Remoto (supabase db push)"
echo "  3) Cancelar"
echo ""
read -p "Opção [1-3]: " MODO

case $MODO in
    1)
        echo ""
        echo -e "${YELLOW}🔄 Aplicando migrations LOCALMENTE...${NC}"
        echo ""
        
        # Verificar se Supabase está rodando
        if ! supabase status &> /dev/null; then
            echo "⚙️  Iniciando Supabase localmente..."
            supabase start
            echo ""
        fi
        
        echo "⚙️  Aplicando todas as migrations..."
        supabase db reset
        echo ""
        
        echo -e "${GREEN}✅ Migrations aplicadas com sucesso!${NC}"
        echo ""
        
        echo "📊 Status:"
        supabase migration list
        echo ""
        
        echo "🌐 Supabase Studio: http://localhost:54323"
        echo ""
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}🔄 Aplicando migrations REMOTAMENTE...${NC}"
        echo ""
        
        # Verificar se está conectado
        if ! supabase link --project-ref $(cat .supabase/config.toml 2>/dev/null | grep 'project_id' | cut -d'"' -f2) &> /dev/null; then
            echo "⚠️  Projeto não está conectado."
            read -p "Informe o PROJECT_REF: " PROJECT_REF
            
            if [ -z "$PROJECT_REF" ]; then
                echo -e "${RED}❌ PROJECT_REF não informado. Cancelando.${NC}"
                exit 1
            fi
            
            echo "⚙️  Conectando ao projeto..."
            supabase link --project-ref "$PROJECT_REF"
            echo ""
        fi
        
        echo "⚙️  Aplicando migrations..."
        supabase db push
        echo ""
        
        echo -e "${GREEN}✅ Migrations aplicadas com sucesso!${NC}"
        echo ""
        
        echo "📊 Status:"
        supabase migration list --linked
        echo ""
        
        # Perguntar se quer fazer deploy das Edge Functions
        read -p "Fazer deploy das Edge Functions? [s/N]: " DEPLOY_FUNCTIONS
        if [[ $DEPLOY_FUNCTIONS =~ ^[Ss]$ ]]; then
            echo ""
            echo "⚙️  Deploying Edge Functions..."
            supabase functions deploy
            echo ""
            echo -e "${GREEN}✅ Edge Functions deployed!${NC}"
        fi
        echo ""
        ;;
        
    3)
        echo ""
        echo "❌ Cancelado pelo usuário."
        exit 0
        ;;
        
    *)
        echo ""
        echo -e "${RED}❌ Opção inválida. Cancelando.${NC}"
        exit 1
        ;;
esac

# Gerar tipos TypeScript
echo "⚙️  Gerando tipos TypeScript..."
npm run db:gen:types
echo ""

# Executar auditoria
echo "⚙️  Executando auditoria..."
npm run infra:audit
echo ""

# Executar healthcheck
echo "⚙️  Executando healthcheck..."
npm run infra:health
echo ""

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║          ✅ Migrations Aplicadas com Sucesso!                         ║"
echo "║                                                                        ║"
echo "║          📊 Verifique os relatórios em docs/infra/                    ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
