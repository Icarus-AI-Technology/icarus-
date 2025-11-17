#!/bin/bash

# 🔧 Script de Correção Automática - Issues Críticas
# Auditoria de Código - ICARUS MAKE
# Uso: bash scripts/audit/fix-critical-issues.sh

set -e

echo "🔍 Iniciando correções críticas..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se env.example ainda tem credenciais
echo "📋 Verificando env.example..."
if grep -q "ttswvavcisdnonytslom" env.example; then
  echo -e "${RED}❌ CRÍTICO: Credenciais reais ainda presentes em env.example${NC}"
  echo "Ação necessária: editar manualmente o arquivo"
  exit 1
else
  echo -e "${GREEN}✅ env.example limpo${NC}"
fi

# 2. Instalar DOMPurify se não estiver instalado
echo ""
echo "📦 Verificando DOMPurify..."
if ! grep -q '"dompurify"' package.json; then
  echo -e "${YELLOW}⚠️  Instalando DOMPurify...${NC}"
  pnpm add dompurify
  pnpm add -D @types/dompurify
  echo -e "${GREEN}✅ DOMPurify instalado${NC}"
else
  echo -e "${GREEN}✅ DOMPurify já instalado${NC}"
fi

# 3. Instalar cobertura de testes
echo ""
echo "📦 Verificando vitest coverage..."
if ! grep -q '"@vitest/coverage-v8"' package.json; then
  echo -e "${YELLOW}⚠️  Instalando coverage...${NC}"
  pnpm add -D @vitest/coverage-v8
  echo -e "${GREEN}✅ Coverage instalado${NC}"
else
  echo -e "${GREEN}✅ Coverage já instalado${NC}"
fi

# 4. Executar lint fix
echo ""
echo "🔧 Executando lint fix..."
pnpm lint --fix || echo -e "${YELLOW}⚠️  Alguns erros precisam correção manual${NC}"

# 5. Type check
echo ""
echo "🔍 Verificando tipos..."
pnpm type-check || echo -e "${YELLOW}⚠️  Erros de tipo encontrados${NC}"

# 6. Criar backup antes de correções
echo ""
echo "💾 Criando backup..."
BACKUP_DIR="backups/audit-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r src "$BACKUP_DIR/"
echo -e "${GREEN}✅ Backup criado em $BACKUP_DIR${NC}"

# 7. Aplicar correções automáticas de XSS
echo ""
echo "🛡️  Preparando correções XSS..."

# Criar arquivo de patch para AdminConfiguracoes.tsx
cat > /tmp/xss-fix-admin.patch << 'EOF'
--- a/src/components/modules/AdminConfiguracoes.tsx
+++ b/src/components/modules/AdminConfiguracoes.tsx
@@ -1,5 +1,6 @@
 import { useState } from "react";
 import { Input, Button, Card, Select } from "../oraclusx-ds";
+import DOMPurify from 'dompurify';
 
 export default function AdminConfiguracoes() {
   // ... código existente ...
@@ -383,7 +384,9 @@
                 className="p-3 bg-surface dark:bg-card rounded-lg text-body-sm text-primary dark:text-gray-100"
-                dangerouslySetInnerHTML={{ __html: templateHtml || 'Ex.: Prezado {{"cliente.nome"}}, segue o documento de {{"tipo"}}...' }}
+                dangerouslySetInnerHTML={{ 
+                  __html: DOMPurify.sanitize(templateHtml || 'Ex.: Prezado {{"cliente.nome"}}, segue o documento de {{"tipo"}}...') 
+                }}
               />
             </div>
           </div>
EOF

echo -e "${YELLOW}⚠️  Patches criados. Aplicação manual recomendada.${NC}"

# 8. Gerar relatório de progresso
echo ""
echo "📊 Gerando relatório de progresso..."

# Contar any's
ANY_COUNT=$(grep -r ": any" src --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')

# Contar testes
TEST_COUNT=$(find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l | tr -d ' ')

# Contar erros de lint
LINT_ERRORS=$(pnpm lint 2>&1 | grep "error" | wc -l | tr -d ' ')

cat > AUDIT_PROGRESS.md << EOF
# 📊 Progresso da Auditoria

**Última Atualização:** $(date +"%Y-%m-%d %H:%M:%S")

## Métricas Atuais

| Métrica | Atual | Meta | Progresso |
|---------|-------|------|-----------|
| 'any' types | $ANY_COUNT | < 10 | $(( (109 - ANY_COUNT) * 100 / 99 ))% |
| Arquivos de teste | $TEST_COUNT | 150+ | $(( TEST_COUNT * 100 / 150 ))% |
| Erros de lint | $LINT_ERRORS | 0 | $(( (28 - LINT_ERRORS) * 100 / 28 ))% |

## Checklist

### P0 - Crítico
- [ ] Remover credenciais do env.example
- [ ] Rotacionar chaves Supabase
- [ ] Implementar DOMPurify (3 arquivos)

### P1 - Alta
- [ ] Reduzir 'any' types
- [ ] Corrigir erros de lint
- [ ] Implementar testes básicos

## Próximos Passos

1. Revisar patches em /tmp/
2. Aplicar correções XSS manualmente
3. Criar testes para hooks críticos
4. Executar: \`pnpm test:coverage\`

---
Gerado automaticamente por fix-critical-issues.sh
EOF

echo -e "${GREEN}✅ Relatório criado: AUDIT_PROGRESS.md${NC}"

# 9. Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ CORREÇÕES AUTOMÁTICAS CONCLUÍDAS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Resumo:"
echo "  ✓ DOMPurify instalado"
echo "  ✓ Coverage instalado"
echo "  ✓ Lint fix executado"
echo "  ✓ Backup criado"
echo "  ✓ Patches preparados"
echo ""
echo "⚠️  AÇÕES MANUAIS NECESSÁRIAS:"
echo ""
echo "1. 🔴 URGENTE - Remover credenciais:"
echo "   nano env.example"
echo ""
echo "2. 🔴 URGENTE - Rotacionar chaves Supabase:"
echo "   https://app.supabase.com"
echo ""
echo "3. 🟠 Aplicar patches XSS:"
echo "   Revisar: /tmp/xss-fix-admin.patch"
echo ""
echo "4. 🟡 Criar testes:"
echo "   Começar por: src/hooks/__tests__/"
echo ""
echo "📊 Ver progresso completo: cat AUDIT_PROGRESS.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

