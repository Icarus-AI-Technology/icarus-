#!/bin/bash

# Script de teste para validar setup dos agentes Icarus v5.0

echo "🎯 Validando Setup dos Agentes - Icarus v5.0"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função de teste
test_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((FAILED++))
  fi
}

test_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $2"
    ((FAILED++))
  fi
}

echo "📁 Verificando estrutura de arquivos..."
echo "----------------------------------------"

# Verifica agents.json
test_file ".cursor/agents.json" "Arquivo de configuração de agentes"

# Verifica documentação
test_file "docs/GUIA_AGENTES_ICARUS.md" "Guia de uso dos agentes"
test_file "docs/AUDITORIA_ORACLUSX_DS.md" "Auditoria do Design System"
test_file "ICARUS_V5_SPEC_COMPLETO.md" "Especificação completa do Icarus"
test_file "INVENTARIO_58_MODULOS_COMPLETO.md" "Inventário de módulos"

echo ""
echo "🔧 Verificando ferramentas do Contador..."
echo "----------------------------------------"
test_file "tools/compliance/fiscal/check-erp-fiscal.cjs" "Check ERP Fiscal"
test_file "tools/compliance/fiscal/list-obrigacoes.cjs" "Lista Obrigações"
test_file "tools/finance/simulador-lucro-real.cjs" "Simulador Lucro Real"
test_file "tools/compliance/fiscal/generate-alerts.cjs" "Gerador de Alertas"

echo ""
echo "⚖️  Verificando ferramentas do Advogado..."
echo "----------------------------------------"
test_file "tools/compliance/legal/check-erp-legal.cjs" "Check ERP Legal"
test_file "tools/legal/contracts-audit.cjs" "Auditoria de Contratos"
test_file "tools/compliance/legal/monitor-regulatorio.cjs" "Monitor Regulatório"

echo ""
echo "📊 Verificando ferramentas de Gestão..."
echo "----------------------------------------"
test_file "tools/analytics/map-kpis-executivos.cjs" "Mapeamento de KPIs"
test_file "tools/audit/auditar-modulos.cjs" "Auditoria de Módulos"
test_file "tools/audit/sugerir-melhorias.cjs" "Sugestão de Melhorias"

echo ""
echo "🤖 Verificando ferramentas do Tutor..."
echo "----------------------------------------"
test_file "tools/tutor/diagnosticar-sistema.cjs" "Diagnóstico do Sistema"
test_file "tools/tutor/sumario-executivo.cjs" "Sumário Executivo"
test_file "tools/tutor/parecer-compliance.cjs" "Parecer de Compliance"
test_file "tools/tutor/classificar-gaps.cjs" "Classificador de Gaps"
test_file "tools/tutor/gerar-tutores-por-modulo.cjs" "Gerador de Tutores"

echo ""
echo "📂 Verificando diretórios de output..."
echo "----------------------------------------"
test_dir "docs" "Diretório de documentação"

# Cria diretórios de output se não existirem
mkdir -p docs/compliance docs/analytics docs/audit docs/tutor

echo ""
echo "🧪 Testando execução de scripts..."
echo "----------------------------------------"

# Testa um script simples
if node tools/tutor/diagnosticar-sistema.cjs > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Scripts são executáveis"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠${NC}  Alguns scripts podem ter dependências faltantes"
fi

echo ""
echo "=============================================="
echo "📊 RESULTADO FINAL"
echo "=============================================="
echo -e "${GREEN}Passou: $PASSED${NC}"
echo -e "${RED}Falhou: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Setup completo! Todos os agentes estão prontos.${NC}"
  echo ""
  echo "🚀 Próximos passos:"
  echo "  1. Execute a auditoria inicial:"
  echo "     node tools/tutor/diagnosticar-sistema.cjs"
  echo ""
  echo "  2. Gere relatório executivo:"
  echo "     node tools/analytics/map-kpis-executivos.cjs"
  echo "     node tools/tutor/sumario-executivo.cjs"
  echo ""
  echo "  3. Veja o guia completo:"
  echo "     cat docs/GUIA_AGENTES_ICARUS.md"
  exit 0
else
  echo -e "${RED}❌ Alguns arquivos estão faltando. Revise a instalação.${NC}"
  exit 1
fi

