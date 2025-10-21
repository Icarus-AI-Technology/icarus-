#!/bin/bash
# ============================================
# Script: Configurar Cron para Backup Diário
# Versão: 1.0
# Descrição: Configura crontab para backup automático
# ============================================

set -e

echo "🔧 Configurando backup automático diário..."
echo ""

# Obter caminho absoluto do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_SCRIPT="$PROJECT_DIR/scripts/db/backup-daily.sh"
BACKUP_DIR="$PROJECT_DIR/backups"

# Verificar se script de backup existe
if [ ! -f "$BACKUP_SCRIPT" ]; then
    echo "❌ Script de backup não encontrado: $BACKUP_SCRIPT"
    exit 1
fi

# Tornar script executável
chmod +x "$BACKUP_SCRIPT"

# Criar diretório de backups
mkdir -p "$BACKUP_DIR"

echo "📋 Configuração:"
echo "   - Script: $BACKUP_SCRIPT"
echo "   - Diretório: $BACKUP_DIR"
echo "   - Horário: 03:00 (diariamente)"
echo ""

# Detectar shell do usuário
SHELL_RC=""
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
fi

echo "⚠️  IMPORTANTE: Configure a variável SUPABASE_DB_URL"
echo ""

if [ -n "$SHELL_RC" ]; then
    echo "Adicione ao seu $SHELL_RC:"
    echo ""
    echo "export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres'"
    echo "export BACKUP_DIR='$BACKUP_DIR'"
    echo ""
fi

# Criar entrada de cron
CRON_ENTRY="0 3 * * * export SUPABASE_DB_URL='SEU_DB_URL_AQUI'; export BACKUP_DIR='$BACKUP_DIR'; $BACKUP_SCRIPT >> $BACKUP_DIR/backup.log 2>&1"

echo "📝 Entrada de crontab a ser adicionada:"
echo ""
echo "$CRON_ENTRY"
echo ""

# Perguntar se deve adicionar ao crontab
read -p "Deseja adicionar esta entrada ao crontab? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Backup do crontab atual
    crontab -l > /tmp/crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true
    
    # Verificar se entrada já existe
    if crontab -l 2>/dev/null | grep -q "$BACKUP_SCRIPT"; then
        echo "⚠️  Entrada já existe no crontab. Pulando..."
    else
        # Adicionar nova entrada
        (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
        echo "✅ Entrada adicionada ao crontab!"
    fi
    
    echo ""
    echo "📋 Crontab atual:"
    crontab -l | grep "$BACKUP_SCRIPT" || echo "   (nenhuma entrada encontrada)"
else
    echo "❌ Operação cancelada"
    echo ""
    echo "Para adicionar manualmente:"
    echo "1. Execute: crontab -e"
    echo "2. Adicione a linha acima"
    echo "3. Substitua 'SEU_DB_URL_AQUI' pela URL real"
fi

echo ""
echo "🧪 Para testar o backup manualmente:"
echo "   export SUPABASE_DB_URL='sua-url-aqui'"
echo "   $BACKUP_SCRIPT"
echo ""

echo "📊 Para verificar logs:"
echo "   tail -f $BACKUP_DIR/backup.log"
echo ""

echo "🎉 Configuração concluída!"

