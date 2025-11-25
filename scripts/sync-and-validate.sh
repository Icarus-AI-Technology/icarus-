#!/bin/bash

# Script de Sincronização e Validação - ICARUS v5.0
# Sincroniza icarus-v5.0 -> icarus-make -> GitHub

set -e

echo "🔄 SINCRONIZAÇÃO E VALIDAÇÃO - ICARUS V5.0"
echo "==========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SOURCE_DIR="/Users/daxmeneghel/icarus-v5.0"
TARGET_DIR="/Users/daxmeneghel/icarus-make"
BACKUP_DIR="/Users/daxmeneghel/.icarus-backup-sync-$(date +%Y%m%d-%H%M%S)"

# Função para exibir status
status() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar se ambos os diretórios existem
echo "📁 Verificando diretórios..."
if [ ! -d "$SOURCE_DIR" ]; then
    error "Diretório fonte não encontrado: $SOURCE_DIR"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    error "Diretório alvo não encontrado: $TARGET_DIR"
    exit 1
fi

status "Diretórios encontrados"
echo ""

# 2. Criar backup
echo "💾 Criando backup..."
mkdir -p "$BACKUP_DIR"
cp -R "$TARGET_DIR" "$BACKUP_DIR/"
status "Backup criado em: $BACKUP_DIR"
echo ""

# 3. Verificar status do Git em ambos
echo "🔍 Verificando status do Git..."
cd "$SOURCE_DIR"
echo "📂 icarus-v5.0:"
git status --short | head -10
echo ""

cd "$TARGET_DIR"
echo "📂 icarus-make:"
git status --short | head -10
echo ""

# 4. Listar arquivos novos em icarus-v5.0
echo "🆕 Arquivos novos em icarus-v5.0 (não em icarus-make)..."
cd "$SOURCE_DIR"
NEW_FILES=$(find . -type f -not -path '*/\.*' -not -path '*/node_modules/*' -newer "$TARGET_DIR" 2>/dev/null | head -20)
if [ -n "$NEW_FILES" ]; then
    echo "$NEW_FILES"
else
    status "Nenhum arquivo novo detectado"
fi
echo ""

# 5. Sincronizar arquivos específicos importantes
echo "🔄 Sincronizando arquivos importantes..."

# Lista de arquivos/pastas para sincronizar
SYNC_ITEMS=(
    "src/components/oraclusx-ds/"
    "src/styles/"
    "src/pages/"
    "tailwind.config.js"
    "package.json"
    "pnpm-lock.yaml"
    "README.md"
    "vercel.json"
    "docs/"
    "supabase/migrations/"
)

for item in "${SYNC_ITEMS[@]}"; do
    if [ -e "$SOURCE_DIR/$item" ]; then
        echo "  Copiando: $item"
        
        if [ -d "$SOURCE_DIR/$item" ]; then
            # É um diretório
            rsync -av --exclude='node_modules' --exclude='.git' "$SOURCE_DIR/$item" "$TARGET_DIR/$(dirname $item)/"
        else
            # É um arquivo
            mkdir -p "$TARGET_DIR/$(dirname $item)"
            cp "$SOURCE_DIR/$item" "$TARGET_DIR/$item"
        fi
    else
        warning "Item não encontrado: $item"
    fi
done

status "Sincronização concluída"
echo ""

# 6. Verificar mudanças no icarus-make
echo "📊 Verificando mudanças após sincronização..."
cd "$TARGET_DIR"
CHANGES=$(git status --short | wc -l)
echo "Total de mudanças detectadas: $CHANGES"
echo ""

if [ $CHANGES -gt 0 ]; then
    echo "📝 Primeiras 20 mudanças:"
    git status --short | head -20
    echo ""
    
    # 7. Perguntar se deve commitar
    echo "❓ Deseja commitar e enviar para o GitHub? (y/n)"
    read -r RESPOSTA
    
    if [ "$RESPOSTA" = "y" ] || [ "$RESPOSTA" = "Y" ]; then
        echo ""
        echo "💬 Digite a mensagem do commit:"
        read -r COMMIT_MSG
        
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="sync: sincronizar com icarus-v5.0"
        fi
        
        echo ""
        echo "📦 Adicionando arquivos..."
        git add .
        
        echo "💾 Commitando..."
        git commit -m "$COMMIT_MSG"
        
        echo "🚀 Enviando para GitHub..."
        git push origin main
        
        status "Commit e push concluídos!"
        echo ""
        echo "🎯 GitHub atualizado: https://github.com/Icarus-AI-Technology/icarus-oficial"
    else
        warning "Commit cancelado pelo usuário"
    fi
else
    status "Nenhuma mudança detectada"
fi

# 8. Validar repositório
echo ""
echo "✅ VALIDAÇÃO DO REPOSITÓRIO"
echo "============================"
cd "$TARGET_DIR"

echo ""
echo "📊 Estatísticas do Repositório:"
echo "  - Branch: $(git branch --show-current)"
echo "  - Último commit: $(git log -1 --pretty=format:'%h - %s (%ar)')"
echo "  - Total de arquivos rastreados: $(git ls-files | wc -l)"
echo "  - Arquivos modificados: $(git status --short | grep -c '^ M' || echo 0)"
echo "  - Arquivos novos: $(git status --short | grep -c '^??' || echo 0)"
echo ""

echo "🔗 URLs do Projeto:"
echo "  - GitHub: https://github.com/Icarus-AI-Technology/icarus-oficial"
echo "  - Vercel: https://icarus-make-gpwtbcguw-daxs-projects-5db3d203.vercel.app"
echo ""

echo "📦 Packages:"
echo "  - Node modules: $([ -d node_modules ] && echo '✅ Instalados' || echo '❌ Não instalados')"
echo "  - Package.json: $([ -f package.json ] && echo '✅ Existe' || echo '❌ Não existe')"
echo "  - pnpm-lock.yaml: $([ -f pnpm-lock.yaml ] && echo '✅ Existe' || echo '❌ Não existe')"
echo ""

echo "🎨 Design System:"
echo "  - design-tokens.css: $([ -f src/styles/design-tokens.css ] && echo '✅' || echo '❌')"
echo "  - oraclusx-ds.css: $([ -f src/styles/oraclusx-ds.css ] && echo '✅' || echo '❌')"
echo "  - NeumoInput: $([ -f src/components/oraclusx-ds/NeumoInput.tsx ] && echo '✅' || echo '❌')"
echo "  - NeumoButton: $([ -f src/components/oraclusx-ds/NeumoButton.tsx ] && echo '✅' || echo '❌')"
echo "  - CardKpi: $([ -f src/components/oraclusx-ds/CardKpi.tsx ] && echo '✅' || echo '❌')"
echo ""

echo "🗄️  Supabase:"
echo "  - Migrations: $(ls supabase/migrations/*.sql 2>/dev/null | wc -l || echo 0) arquivos"
echo "  - Edge Functions: $(ls -d supabase/functions/*/ 2>/dev/null | wc -l || echo 0) funções"
echo ""

echo "✅ Validação concluída!"
echo ""
echo "💡 Próximos passos:"
echo "  1. Verificar se o Vercel está fazendo deploy"
echo "  2. Testar a aplicação em produção"
echo "  3. Validar funcionalidades críticas"
echo ""
echo "🎉 Sincronização e validação finalizada!"

