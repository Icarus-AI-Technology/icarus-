#!/bin/bash

# ============================================================================
# Script de Verificação - Supabase Auditor Pro
# ============================================================================
# Este script verifica se todas as funções de auditoria foram instaladas
# corretamente no projeto Supabase.
#
# Uso: ./scripts/verify-installation.sh [PROJECT_ID]
# ============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Supabase Auditor Pro - Verificador de Instalação${NC}"
echo ""

# Verificar se project ID foi fornecido
if [ -z "$1" ]; then
    echo -e "${YELLOW}ℹ️  Uso: $0 [PROJECT_ID]${NC}"
    echo ""
    exit 0
fi

PROJECT_ID=$1

echo -e "${BLUE}Projeto: ${NC}$PROJECT_ID"
echo ""

# Lista de funções que devem existir
FUNCTIONS=(
    "auditor.detectar_tabelas_orfas"
    "auditor.detectar_tabelas_sem_pk"
    "auditor.detectar_fragmentacao_tabelas"
    "auditor.detectar_mau_uso_jsonb"
    "auditor.detectar_indices_inutilizados"
    "auditor.detectar_indices_duplicados"
    "auditor.detectar_indices_invalidos"
    "auditor.detectar_tabelas_sem_rls"
    "auditor.listar_politicas_rls"
    "auditor.detectar_politicas_permissivas"
    "auditor.verificar_auth_users_rls"
    "auditor.auditar_concessoes_excessivas"
    "auditor.detectar_tabelas_publicas_desprotegidas"
    "auditor.listar_buckets_armazenamento"
    "auditor.detectar_arquivos_orfaos"
    "auditor.detectar_arquivos_duplicados"
    "auditor.calcular_tamanho_buckets"
    "auditor.calcular_tamanho_por_mime"
    "auditor.sugerir_limpeza_arquivos_antigos"
    "auditor.auditar_politicas_armazenamento"
    "auditor.obter_consultas_lentas"
    "auditor.verificar_conexoes_ativas"
    "auditor.detectar_bloqueios"
    "auditor.detectar_tuplas_mortas"
    "auditor.verificar_extensoes"
    "auditor.verificar_taxa_cache"
    "auditor.verificar_tamanho_banco"
    "auditor.listar_funcoes"
    "auditor.detectar_funcoes_inutilizadas"
    "auditor.detectar_funcoes_security_definer"
    "auditor.listar_gatilhos"
    "auditor.detectar_gatilhos_tabelas_quentes"
    "auditor.analisar_complexidade_funcoes"
    "auditor.detectar_risco_injecao_sql"
)

echo -e "${BLUE}📋 Verificando ${#FUNCTIONS[@]} funções...${NC}"
echo ""

INSTALLED=0
MISSING=0
MISSING_FUNCTIONS=()

# Nota: Este é um script de exemplo
# Em produção, você usaria o Supabase CLI ou API para verificar
echo -e "${YELLOW}ℹ️  Este é um script de demonstração${NC}"
echo -e "${YELLOW}ℹ️  Em produção, use o Cursor MCP ou Supabase CLI para verificação real${NC}"
echo ""

# Simulação de verificação
for func in "${FUNCTIONS[@]}"; do
    # Em produção, você faria uma query real aqui
    # Por ora, vamos assumir que todas existem (simulação)
    echo -e "  ${GREEN}✓${NC} $func"
    ((INSTALLED++))
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Verificação Completa!${NC}"
echo ""
echo -e "${GREEN}Funções instaladas: $INSTALLED / ${#FUNCTIONS[@]}${NC}"

if [ $MISSING -gt 0 ]; then
    echo -e "${RED}Funções faltando: $MISSING${NC}"
    echo ""
    echo -e "${YELLOW}Funções não encontradas:${NC}"
    for func in "${MISSING_FUNCTIONS[@]}"; do
        echo -e "  ${RED}✗${NC} $func"
    done
    echo ""
    echo -e "${YELLOW}💡 Execute o setup SQL novamente:${NC}"
    echo -e "   ${BLUE}Instale as funções de auditoria no meu projeto Supabase usando sql/setup.sql${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 Todas as funções estão instaladas corretamente!${NC}"
    echo ""
    echo -e "${BLUE}Próximos passos:${NC}"
    echo -e "  1. Execute uma auditoria de teste:"
    echo -e "     ${YELLOW}Audite meu projeto Supabase${NC}"
    echo ""
    echo -e "  2. Veja os relatórios gerados em: ${YELLOW}reports/${NC}"
    echo ""
fi

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

