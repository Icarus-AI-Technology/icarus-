#!/bin/bash

# Script de Correção Automática - ICARUS NEWORTHO
# Corrige todos os problemas identificados

set -e  # Para na primeira falha

echo "🔧 CORREÇÃO AUTOMÁTICA - ICARUS NEWORTHO"
echo "========================================"
echo ""

# 1. Limpar cache do Vite
echo "1️⃣ Limpando cache do Vite..."
rm -rf node_modules/.vite
rm -rf dist
echo "   ✅ Cache limpo"
echo ""

# 2. Matar processos nas portas
echo "2️⃣ Liberando portas 5173, 5174, 5175..."
lsof -ti:5173,5174,5175 | xargs kill -9 2>/dev/null || true
sleep 2
echo "   ✅ Portas liberadas"
echo ""

# 3. Instalar dependências faltantes
echo "3️⃣ Instalando dependências faltantes..."
pnpm add @nivo/bar @nivo/core --save
echo "   ✅ Dependências instaladas"
echo ""

# 4. Testar build
echo "4️⃣ Testando build de produção..."
pnpm build
if [ $? -eq 0 ]; then
    echo "   ✅ Build passou!"
else
    echo "   ❌ Build falhou - verifique os erros acima"
    exit 1
fi
echo ""

# 5. Iniciar servidor de desenvolvimento
echo "5️⃣ Iniciando servidor de desenvolvimento..."
echo "   🚀 Servidor será iniciado na porta 5173"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CORREÇÕES CONCLUÍDAS COM SUCESSO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Próximo comando:"
echo "   pnpm dev"
echo ""
echo "📌 Testar formulário:"
echo "   bash test-contact-form.sh"
echo ""

