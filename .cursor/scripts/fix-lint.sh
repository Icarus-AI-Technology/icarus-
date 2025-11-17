#!/bin/bash

# Script para corrigir erros de lint automaticamente

echo "🔧 Corrigindo erros de lint..."

# Executar auto-fix do ESLint
pnpm eslint --fix . 2>&1 | head -20

echo ""
echo "✅ Auto-fix executado!"
echo ""
echo "Executando verificação final..."
pnpm lint 2>&1 | tail -20

