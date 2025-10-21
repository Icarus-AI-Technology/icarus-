#!/bin/bash
# ============================================
# Script: Restaurar Backup
# Versão: 1.0
# Descrição: Restaura backup do banco de dados
# ============================================

set -e

echo "🔄 Restauração de Backup ICARUS"
echo "======================================="
echo ""

# Diretório de backups
BACKUP_DIR="${BACKUP_DIR:-/Users/daxmeneghel/icarus-make/backups}"

# Verificar se diretório existe
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Diretório de backups não encontrado: $BACKUP_DIR"
    exit 1
fi

# Listar backups disponíveis
echo "📋 Backups disponíveis:"
echo ""

BACKUPS=($(ls -t "$BACKUP_DIR"/icarus_backup_*.sql.gz 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
    echo "❌ Nenhum backup encontrado em $BACKUP_DIR"
    exit 1
fi

# Mostrar lista numerada
for i in "${!BACKUPS[@]}"; do
    BACKUP_FILE="${BACKUPS[$i]}"
    BACKUP_NAME=$(basename "$BACKUP_FILE")
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" | cut -d'.' -f1)
    
    echo "  [$i] $BACKUP_NAME"
    echo "      Tamanho: $BACKUP_SIZE | Data: $BACKUP_DATE"
done

echo ""
read -p "Escolha o backup para restaurar (0-$((${#BACKUPS[@]}-1)) ou 'q' para sair): " CHOICE

if [ "$CHOICE" = "q" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# Validar escolha
if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -ge "${#BACKUPS[@]}" ]; then
    echo "❌ Escolha inválida"
    exit 1
fi

SELECTED_BACKUP="${BACKUPS[$CHOICE]}"

echo ""
echo "⚠️  ATENÇÃO: Esta operação irá SOBRESCREVER o banco de dados atual!"
echo "Backup selecionado: $(basename "$SELECTED_BACKUP")"
echo ""
read -p "Tem certeza que deseja continuar? Digite 'RESTAURAR' para confirmar: " CONFIRM

if [ "$CONFIRM" != "RESTAURAR" ]; then
    echo "❌ Operação cancelada"
    exit 0
fi

# Verificar SUPABASE_DB_URL
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não configurada"
    exit 1
fi

echo ""
echo "🔄 Iniciando restauração..."

# Testar conexão
echo "🔌 Testando conexão..."
if ! psql "$SUPABASE_DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Falha na conexão com o banco de dados"
    exit 1
fi

echo "✅ Conexão OK"

# Descompactar e restaurar
echo "💾 Restaurando backup..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

START_TIME=$(date +%s)

gunzip -c "$SELECTED_BACKUP" | psql "$SUPABASE_DB_URL" 2>&1 | tee /tmp/restore_log_$$.txt

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Verificar se houve erros críticos
if grep -iq "error" /tmp/restore_log_$$.txt; then
    echo ""
    echo "⚠️  Restauração concluída COM AVISOS/ERROS"
    echo "Verifique o log em: /tmp/restore_log_$$.txt"
    echo ""
    read -p "Deseja ver os erros agora? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        grep -i "error" /tmp/restore_log_$$.txt | head -20
    fi
else
    echo "✅ Restauração concluída com sucesso!"
    rm -f /tmp/restore_log_$$.txt
fi

echo ""
echo "⏱️  Duração: ${DURATION}s"

# Verificação pós-restauração
echo ""
echo "🔍 Verificação pós-restauração:"

# Contar tabelas
TABLE_COUNT=$(psql "$SUPABASE_DB_URL" -t -c "
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
")

echo "   - Tabelas: $TABLE_COUNT"

# Contar registros em tabelas principais
echo "   - Registros:"
psql "$SUPABASE_DB_URL" -c "
SELECT
  'empresas' AS tabela, COUNT(*) AS registros FROM empresas WHERE excluido_em IS NULL
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios WHERE excluido_em IS NULL
UNION ALL
SELECT 'produtos', COUNT(*) FROM produtos WHERE excluido_em IS NULL
UNION ALL
SELECT 'cirurgias', COUNT(*) FROM cirurgias WHERE excluido_em IS NULL
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
" -t

echo ""
echo "🎉 Processo de restauração concluído!"
echo ""
echo "⚠️  RECOMENDAÇÕES PÓS-RESTAURAÇÃO:"
echo "   1. Execute: npm run db:health"
echo "   2. Execute: npm run db:audit"
echo "   3. Verifique integridade do hash chain"
echo "   4. Teste login e funcionalidades críticas"

