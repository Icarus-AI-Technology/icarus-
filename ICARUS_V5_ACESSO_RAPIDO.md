# 🚀 ICARUS v5.0 — Acesso Rápido aos Comandos

## 📋 Comandos Mais Utilizados

### 1. Auditoria Completa

```bash
# Verificar tudo de uma vez
pnpm deps:check && \
pnpm coverage:generate && \
pnpm supabase:status && \
pnpm supabase:rls && \
pnpm supabase:functions
```

### 2. Validação de Ambiente

```bash
# Verificar .env.local
pnpm env:validate

# Gerar template de desenvolvimento
pnpm env:generate:dev

# Gerar template de produção
pnpm env:generate:prod
```

### 3. Cobertura de Testes

```bash
# Gerar matriz
pnpm coverage:generate

# Validar (mínimo 60%)
pnpm coverage:validate

# Executar testes
pnpm test && pnpm test:e2e
```

### 4. Migração Dev → Prod

```bash
# 1. Planejar
pnpm migration:plan

# 2. Executar cópia
pnpm migration:copy

# 3. Verificar integridade
pnpm migration:verify
```

### 5. Supabase

```bash
# Status geral
pnpm supabase:status

# Verificar RLS
pnpm supabase:rls

# Listar Edge Functions
pnpm supabase:functions
```

### 6. Build e Deploy

```bash
# Validação completa
pnpm type-check && pnpm lint && pnpm build

# Preview local
pnpm preview

# Deploy Vercel
vercel --prod
```

---

## 📂 Estrutura de Arquivos Importantes

```
icarus-make/
├── .cursor/
│   └── agents.json              # 5 agentes principais + orquestrador
├── tools/
│   ├── env/
│   │   ├── validate-env.js      # Valida .env.*
│   │   └── generate-dotenv.js   # Gera templates
│   ├── qa/
│   │   ├── check-deps.js        # Verifica dependências
│   │   ├── generate-coverage-matrix.js
│   │   └── validate-coverage.js
│   ├── migration/
│   │   ├── plan-migration.js    # Planeja migração
│   │   ├── selective-copy.js    # Cópia seletiva
│   │   └── verify-checksum.js   # Verifica integridade
│   ├── supabase/
│   │   ├── check-rls.js         # Verifica RLS
│   │   └── list-edge-fns.js     # Lista Edge Functions
│   ├── ops/
│   │   └── rollback-integrations.js
│   └── load/
│       └── run-k6.js            # Testes de carga
├── scripts/
│   └── verify-supabase-status.ts
└── ICARUS_V5_PLANO_OPERACIONAL.md  # 📖 Documentação completa
```

---

## 🔍 Relatórios Gerados

Após executar os comandos, os seguintes relatórios são gerados:

```
coverage-matrix.json          # Matriz de cobertura de testes
migration-plan.json           # Plano de migração seletiva
rls-report.json              # Relatório de RLS
edge-functions-report.json   # Relatório de Edge Functions
supabase-status-report.json  # Status geral do Supabase
checksum-report.json         # Integridade dos arquivos (prod)
```

---

## ⚠️ Pontos de Atenção

### 1. Cobertura de Testes

- **Atual**: 1%
- **Meta**: 60%
- **Ação**: Expandir testes unitários e E2E

### 2. RLS (Row Level Security)

- **Com RLS**: 135 tabelas ✅
- **Sem RLS**: 542 tabelas ⚠️
- **Ação**: Revisar e habilitar RLS em tabelas críticas

### 3. Dependências Opcionais

- **Deno**: Não instalado (necessário para Supabase CLI)
- **Playwright CLI**: Disponível via npx

---

## 🎯 Fluxo de Trabalho Recomendado

### Development

```bash
# 1. Instalar dependências
pnpm install

# 2. Validar ambiente
pnpm env:validate

# 3. Verificar dependências
pnpm deps:check

# 4. Desenvolvimento
pnpm dev
```

### Before Commit

```bash
# 1. Type-check
pnpm type-check

# 2. Lint
pnpm lint

# 3. Testes
pnpm test

# 4. Build test
pnpm build
```

### Before Deploy

```bash
# 1. Auditoria completa
pnpm deps:check
pnpm coverage:generate
pnpm supabase:status

# 2. Validação
pnpm validate:all

# 3. Testes E2E
pnpm test:e2e

# 4. Integrações
pnpm qa:integrations
```

### Deploy Production

```bash
# 1. Planejar migração
pnpm migration:plan

# 2. Executar migração
pnpm migration:copy

# 3. No diretório de produção
cd /Users/daxmeneghel/icarus-v5.0/

# 4. Instalar
pnpm install --frozen-lockfile

# 5. Configurar
pnpm env:generate:prod

# 6. Build
pnpm build

# 7. Verificar
pnpm migration:verify

# 8. Deploy
vercel --prod
```

---

## 📚 Documentação Relacionada

- **[ICARUS_V5_PLANO_OPERACIONAL.md](./ICARUS_V5_PLANO_OPERACIONAL.md)** - Plano completo
- **[INVENTARIO_58_MODULOS_COMPLETO.md](./INVENTARIO_58_MODULOS_COMPLETO.md)** - Inventário de módulos
- **[ORACLUSX_DS_COMPLETO.md](./ORACLUSX_DS_COMPLETO.md)** - Design System
- **[GUIA_DEPLOY_COMPLETO.md](./GUIA_DEPLOY_COMPLETO.md)** - Guia de deploy

---

## 🆘 Troubleshooting

### Erro: "Variável não encontrada"

```bash
pnpm env:validate
pnpm env:generate:dev
```

### Erro: "Dependência faltando"

```bash
pnpm deps:check
pnpm install
```

### Erro: "RLS não configurado"

```bash
pnpm supabase:rls
# Revisar relatório rls-report.json
```

### Erro: "Build falhou"

```bash
pnpm type-check
pnpm lint
# Corrigir erros e tentar novamente
pnpm build
```

---

## 🔗 Links Úteis

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Playwright Docs**: https://playwright.dev
- **Vite Docs**: https://vitejs.dev

---

**Última Atualização**: 27 de Outubro de 2025  
**Versão**: 1.0.0
