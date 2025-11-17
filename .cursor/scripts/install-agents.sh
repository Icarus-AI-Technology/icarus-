#!/bin/bash

# SCRIPT DE INSTALAÇÃO DO SISTEMA DE AGENTES ICARUS V5.0

set -e

echo "🚀 INSTALANDO SISTEMA DE AGENTES ICARUS V5.0"
echo "=============================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Criar estrutura de diretórios
echo "📁 Criando estrutura de diretórios..."

mkdir -p .cursor/agents/{orchestrator,code-auditor,ia-validator,supabase-migration,environment-checker,dependency-manager,production-prep,test-runner,documentation}
mkdir -p .cursor/scripts
mkdir -p .cursor/config
mkdir -p .cursor/results

echo -e "${GREEN}✅ Estrutura criada${NC}"

# Criar arquivos de configuração
echo ""
echo "⚙️  Criando arquivos de configuração..."

cat > .cursor/config/agents-config.json << 'EOF'
{
  "version": "5.0.0",
  "environment": "development",
  "agents": {
    "orchestrator": {
      "enabled": true,
      "timeout": 600000
    },
    "code-auditor": {
      "enabled": true,
      "timeout": 300000,
      "severity_threshold": "high"
    },
    "ia-validator": {
      "enabled": true,
      "timeout": 120000,
      "services": ["ollama", "meilisearch", "posthog", "supabase", "tesseract"]
    },
    "supabase-migration": {
      "enabled": true,
      "timeout": 180000
    },
    "environment-checker": {
      "enabled": true,
      "timeout": 60000
    },
    "dependency-manager": {
      "enabled": true,
      "timeout": 120000
    },
    "test-runner": {
      "enabled": true,
      "timeout": 300000
    },
    "production-prep": {
      "enabled": false,
      "timeout": 180000
    },
    "documentation": {
      "enabled": true,
      "timeout": 120000
    }
  },
  "directories": {
    "development": "/Users/daxmeneghel/icarus-make",
    "production": "/Users/daxmeneghel/icarus-v5.0"
  }
}
EOF

cat > .cursor/config/directories.json << 'EOF'
{
  "development": {
    "root": "/Users/daxmeneghel/icarus-make",
    "src": "/Users/daxmeneghel/icarus-make/src",
    "public": "/Users/daxmeneghel/icarus-make/public",
    "tests": "/Users/daxmeneghel/icarus-make/tests"
  },
  "production": {
    "root": "/Users/daxmeneghel/icarus-v5.0",
    "src": "/Users/daxmeneghel/icarus-v5.0/src",
    "public": "/Users/daxmeneghel/icarus-v5.0/public",
    "excluded": [
      "node_modules",
      ".git",
      "dist",
      "coverage",
      "test-results",
      "docs",
      "examples",
      ".cursor"
    ]
  },
  "migration_rules": {
    "include": [
      "src/**/*",
      "public/**/*",
      "package.json",
      "pnpm-lock.yaml",
      "tsconfig.json",
      "vite.config.ts",
      "index.html",
      ".env.example",
      "README.md"
    ],
    "exclude": [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/test/**",
      "**/tests/**",
      "**/__tests__/**",
      "**/coverage/**"
    ]
  }
}
EOF

echo -e "${GREEN}✅ Configurações criadas${NC}"

# Instalar dependências necessárias
echo ""
echo "📦 Verificando dependências..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json não encontrado!${NC}"
    exit 1
fi

# Verificar node-fetch
if ! npm list node-fetch &> /dev/null; then
    echo "Instalando node-fetch..."
    pnpm add -D node-fetch@3
fi

echo -e "${GREEN}✅ Dependências OK${NC}"

# Criar .gitignore para agentes
echo ""
echo "📝 Configurando .gitignore..."

if ! grep -q ".cursor/results/" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# Cursor Agents
.cursor/results/
.cursor/agents/*/reports/
.cursor/agents/*/logs/
EOF
    echo -e "${GREEN}✅ .gitignore atualizado${NC}"
else
    echo -e "${YELLOW}⚠️  .gitignore já configurado${NC}"
fi

# Tornar scripts executáveis
echo ""
echo "🔐 Configurando permissões..."

chmod +x .cursor/scripts/*.sh 2>/dev/null || true
chmod +x .cursor/agents/*/run.js 2>/dev/null || true
chmod +x .cursor/agents/*/*.sh 2>/dev/null || true

echo -e "${GREEN}✅ Permissões configuradas${NC}"

# Criar README
cat > .cursor/README.md << 'EOF'
# 🤖 Sistema de Agentes Icarus V5.0

## Estrutura
```
.cursor/
├── agents/          # Agentes especializados
│   ├── orchestrator/       # Orquestrador principal
│   ├── code-auditor/       # Auditoria de código
│   ├── ia-validator/       # Validação de IAs (✅ COMPLETO)
│   ├── supabase-migration/ # Migrações Supabase
│   ├── environment-checker/# Validação de ambiente
│   ├── dependency-manager/ # Gestão de dependências
│   ├── test-runner/        # Execução de testes
│   ├── production-prep/    # Preparação para produção
│   └── documentation/      # Geração de docs
├── scripts/         # Scripts de automação
├── config/          # Configurações
└── results/         # Resultados de execuções
```

## Agentes Disponíveis

### ✅ IA Validator (COMPLETO)
Valida configuração de todas as IAs nativas:
```bash
node .cursor/agents/ia-validator/validate-ia.js
bash .cursor/agents/ia-validator/quick-start.sh
```

### 🔄 Orchestrator
Executa todos os agentes em sequência:
```bash
node .cursor/agents/orchestrator/orchestrator.js
```

### 🔍 Code Auditor
Audita qualidade do código:
```bash
node .cursor/agents/code-auditor/run.js
```

## Executar

### Todos os Agentes (Recomendado)
```bash
node .cursor/agents/orchestrator/orchestrator.js
```

### Agente Individual
```bash
# IA Validator
bash .cursor/agents/ia-validator/quick-start.sh

# Code Auditor
node .cursor/agents/code-auditor/run.js

# Environment Checker
node .cursor/agents/environment-checker/run.js
```

## Configuração

Edite `.cursor/config/agents-config.json` para customizar comportamento dos agentes.

## Status dos Agentes

| Agente | Status | Descrição |
|--------|--------|-----------|
| IA Validator | ✅ COMPLETO | Valida IAs nativas (60% operacional) |
| Orchestrator | 🔄 Pendente | Orquestrador principal |
| Code Auditor | 🔄 Pendente | Auditoria de código |
| Supabase Migration | 🔄 Pendente | Migrações database |
| Environment Checker | 🔄 Pendente | Validação ambiente |
| Dependency Manager | 🔄 Pendente | Gestão dependências |
| Test Runner | 🔄 Pendente | Execução testes |
| Production Prep | 🔄 Pendente | Preparação produção |
| Documentation | 🔄 Pendente | Geração docs |

## Resultados

Os resultados das execuções são salvos em:
```
.cursor/results/
├── validation-reports/
├── audit-reports/
├── test-reports/
└── migration-reports/
```
EOF

echo ""
echo -e "${GREEN}=============================================="
echo "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=============================================="
echo ""
echo "📊 Status:"
echo "   ✅ IA Validator: COMPLETO (60% operacional)"
echo "   🔄 Outros agentes: Pendentes"
echo "${NC}"

echo "📚 Próximos passos:"
echo ""
echo "1. Ver status do IA Validator:"
echo "   ${YELLOW}bash .cursor/agents/ia-validator/quick-start.sh${NC}"
echo ""
echo "2. Executar todos os agentes:"
echo "   ${YELLOW}node .cursor/agents/orchestrator/orchestrator.js${NC}"
echo ""
echo "3. Ver configurações:"
echo "   ${YELLOW}cat .cursor/config/agents-config.json${NC}"
echo ""
echo "4. Ver documentação:"
echo "   ${YELLOW}cat .cursor/README.md${NC}"
echo ""

