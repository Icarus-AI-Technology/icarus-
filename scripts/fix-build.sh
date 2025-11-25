#!/bin/bash
# Fix build temporariamente comentando imports problemáticos
set -e

echo "🔧 Fixing build errors..."

# Backup
cp src/components/oraclusx-ds/index.ts src/components/oraclusx-ds/index.ts.bak

# Comentar imports de arquivos que não existem mais
sed -i '' '/from "\.\.\/Container"/d' src/components/oraclusx-ds/index.ts
sed -i '' '/from "\.\.\/Section"/d' src/components/oraclusx-ds/index.ts  
sed -i '' '/from "\.\.\/GlassCard"/d' src/components/oraclusx-ds/index.ts
sed -i '' '/from "\.\.\/AnimatedCard"/d' src/components/oraclusx-ds/index.ts
sed -i '' '/from "\.\.\/CadastroLayout"/d' src/components/oraclusx-ds/index.ts
sed -i '' '/from "\.\.\/layout\/Container"/d' src/components/oraclusx-ds/index.ts

echo "✅ Fixed index.ts"
