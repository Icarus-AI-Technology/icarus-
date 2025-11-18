# 🚀 GUIA DE DEPLOY & CI/CD - ICARUS v5.0

**Deployment Automático com GitHub Actions + Vercel**

**Data:** 18 de Novembro de 2025  
**Status:** ✅ Configurado  
**Plataforma:** Vercel + Supabase

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Deploy Manual](#deploy-manual)
4. [CI/CD Automático](#cicd-automático)
5. [Environments](#environments)
6. [Rollback](#rollback)
7. [Monitoramento](#monitoramento)

---

## 🎯 VISÃO GERAL

### Estratégia de Deploy

```
┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   GitHub     │─────▶│   Vercel    │─────▶│  Production  │
│  (main)      │      │   Preview   │      │  (deploy)    │
└──────────────┘      └─────────────┘      └──────────────┘
       │                     │                      │
       │                     │                      │
    Commit              Auto-build            Auto-deploy
    + Push              + Test               + Monitoring
```

### Ambientes

| Ambiente | Branch | URL | Auto-Deploy |
|----------|--------|-----|-------------|
| **Development** | `develop` | `localhost:5173` | ❌ Manual |
| **Preview** | `feature/*` | `*.vercel.app` | ✅ Automático |
| **Staging** | `staging` | `staging.icarus.ai` | ✅ Automático |
| **Production** | `main` | `icarus.ai` | ✅ Automático |

---

## ✅ PRÉ-REQUISITOS

### 1. Contas Necessárias

- ✅ **GitHub**: Repositório do projeto
- ✅ **Vercel**: Conta free/pro
- ✅ **Supabase**: Projeto configurado

### 2. Variáveis de Ambiente

```env
# Frontend (Público)
VITE_SUPABASE_URL=https://projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_ENV=production
VITE_APP_URL=https://icarus.ai

# Analytics (Opcional)
VITE_SENTRY_DSN=https://...
VITE_POSTHOG_KEY=phc_...
```

---

## 📦 DEPLOY MANUAL

### Opção 1: Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link projeto (primeira vez)
vercel link

# 4. Deploy preview
vercel

# 5. Deploy production
vercel --prod
```

### Opção 2: Vercel Dashboard

1. Acessar https://vercel.com/new
2. Importar repositório GitHub
3. Configurar:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Adicionar variáveis de ambiente
5. Deploy!

### Opção 3: Build Local + Upload

```bash
# 1. Build
npm run build

# 2. Upload para servidor
scp -r dist/* user@server:/var/www/icarus/

# 3. Configurar Nginx/Apache
# Ver: docs/nginx.conf
```

---

## ⚙️ CI/CD AUTOMÁTICO

### GitHub Actions Workflow

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  # ===== JOB 1: LINT & TYPE-CHECK =====
  quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npm run type-check

  # ===== JOB 2: TESTES E2E =====
  test:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # ===== JOB 3: BUILD =====
  build:
    runs-on: ubuntu-latest
    needs: [quality, test]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_APP_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # ===== JOB 4: DEPLOY TO VERCEL =====
  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=${{ github.ref == 'refs/heads/main' && 'production' || 'preview' }} --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project
        run: vercel build ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          URL=$(vercel deploy --prebuilt ${{ github.ref == 'refs/heads/main' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> $GITHUB_OUTPUT

      - name: Comment PR with Preview URL
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `✅ Preview deployed!\n\n🔗 **URL**: ${{ steps.deploy.outputs.url }}`
            })

  # ===== JOB 5: LIGHTHOUSE CI =====
  lighthouse:
    runs-on: ubuntu-latest
    needs: deploy
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://icarus.ai
            https://icarus.ai/login
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Secrets GitHub

Configure em: **Repositório → Settings → Secrets and variables → Actions**

```
VERCEL_TOKEN=             # Token da Vercel
VERCEL_ORG_ID=            # ID da organização
VERCEL_PROJECT_ID=        # ID do projeto
VITE_SUPABASE_URL=        # URL Supabase
VITE_SUPABASE_ANON_KEY=   # Chave pública Supabase
```

### Como obter VERCEL_TOKEN

1. Acessar: https://vercel.com/account/tokens
2. Criar novo token
3. Copiar e adicionar aos secrets

### Como obter VERCEL_ORG_ID e PROJECT_ID

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Link projeto
vercel link

# 3. Visualizar .vercel/project.json
cat .vercel/project.json

# Copiar orgId e projectId
```

---

## 🌍 ENVIRONMENTS

### Development

```env
# .env.development
VITE_APP_ENV=development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJ...local...
```

**Comandos**:
```bash
npm run dev
```

### Preview (Vercel)

- **Trigger**: Push em qualquer branch (exceto main)
- **URL**: `https://icarus-{hash}.vercel.app`
- **Duração**: 7 dias
- **Proteção**: Senha opcional

### Staging

```env
# .env.staging
VITE_APP_ENV=staging
VITE_SUPABASE_URL=https://staging.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...staging...
```

**Comandos**:
```bash
vercel --environment=staging
```

### Production

```env
# .env.production
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...prod...
```

**Comandos**:
```bash
vercel --prod
```

---

## ⏪ ROLLBACK

### Opção 1: Vercel Dashboard

1. Acessar: https://vercel.com/seu-org/icarus
2. Deployments → Histórico
3. Selecionar versão anterior
4. **Promote to Production**

### Opção 2: Git Revert

```bash
# 1. Identificar commit ruim
git log --oneline

# 2. Reverter
git revert <commit-hash>

# 3. Push (trigger auto-deploy)
git push origin main
```

### Opção 3: Vercel CLI

```bash
# 1. Listar deployments
vercel ls

# 2. Promover anterior
vercel promote <deployment-url> --scope=seu-org
```

---

## 📊 MONITORAMENTO

### 1. Vercel Analytics

**Métricas automáticas**:
- Page views
- Unique visitors
- Top pages
- Referrers
- Geographic distribution

**Acesso**: https://vercel.com/seu-org/icarus/analytics

### 2. Vercel Speed Insights

**Core Web Vitals**:
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ FID (First Input Delay) < 100ms
- ✅ CLS (Cumulative Layout Shift) < 0.1

**Acesso**: https://vercel.com/seu-org/icarus/speed-insights

### 3. Sentry (Errors)

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 0.1,
});
```

**Dashboard**: https://sentry.io/organizations/seu-org/issues/

### 4. PostHog (Product Analytics)

```typescript
// src/lib/posthog.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
});
```

**Dashboard**: https://app.posthog.com/project/seu-projeto

---

## 🚨 HEALTH CHECKS

### Endpoint de Health

```typescript
// vercel/api/health.ts
export default function handler(req, res) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '5.0.4',
    uptime: process.uptime(),
  };
  
  res.status(200).json(health);
}
```

**Acesso**: https://icarus.ai/api/health

### Monitoramento Externo

Use serviços como:
- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://www.pingdom.com
- **StatusPage**: https://www.statuspage.io

Configuração:
```
URL: https://icarus.ai/api/health
Interval: 5 minutos
Expected Status: 200
Expected Content: "status":"ok"
```

---

## 📝 CHECKLIST DE DEPLOY

### Antes do Deploy

- [ ] ✅ Código commitado e testado localmente
- [ ] ✅ Build passa sem erros (`npm run build`)
- [ ] ✅ Testes E2E passam (`npm run test:e2e`)
- [ ] ✅ Lint sem warnings (`npm run lint`)
- [ ] ✅ Type-check sem erros (`npm run type-check`)
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Secrets do GitHub atualizados
- [ ] ✅ Changelog atualizado
- [ ] ✅ Versão bumped (package.json)

### Durante o Deploy

- [ ] ✅ CI/CD pipeline passa em todos os stages
- [ ] ✅ Preview URL funciona corretamente
- [ ] ✅ Lighthouse score > 90
- [ ] ✅ Sem erros no console
- [ ] ✅ Auth funciona
- [ ] ✅ APIs respondem

### Após o Deploy

- [ ] ✅ Smoke test manual (3-5 min)
- [ ] ✅ Verificar Analytics
- [ ] ✅ Monitorar Sentry (primeiros 10 min)
- [ ] ✅ Verificar logs Vercel
- [ ] ✅ Testar em diferentes browsers
- [ ] ✅ Testar em mobile
- [ ] ✅ Notificar equipe
- [ ] ✅ Update status page

---

## 🎯 MELHORES PRÁTICAS

### 1. Feature Flags

```typescript
// src/lib/features.ts
export const features = {
  newDashboard: import.meta.env.VITE_FEATURE_NEW_DASHBOARD === 'true',
  aiPredictions: import.meta.env.VITE_FEATURE_AI === 'true',
};

// Uso
{features.newDashboard && <NewDashboard />}
```

### 2. Canary Deployments

```typescript
// vercel.json
{
  "routes": [
    {
      "src": "/.*",
      "dest": "/",
      "headers": {
        "x-deployment-type": "canary"
      },
      "continue": true
    }
  ],
  "regions": ["gru1", "iad1"]
}
```

### 3. Preview Environment Protection

```json
// vercel.json
{
  "github": {
    "silent": false,
    "autoAlias": true,
    "autoJobCancelation": true
  },
  "build": {
    "env": {
      "VITE_APP_ENV": "preview"
    }
  }
}
```

---

## 🆘 TROUBLESHOOTING

### Build Falha no Vercel

**Erro**: `npm install failed`

**Solução**:
```json
// package.json
{
  "engines": {
    "node": ">=18.18.0",
    "npm": ">=9.0.0"
  }
}
```

### Deploy Lento

**Problema**: Build demora > 5 minutos

**Soluções**:
1. Adicionar cache:
```json
// vercel.json
{
  "build": {
    "env": {
      "CI": "1",
      "VITE_CACHE": "true"
    }
  }
}
```

2. Otimizar dependências:
```bash
npm prune --production
```

### Variáveis de Ambiente Não Funcionam

**Problema**: `import.meta.env.VITE_X` retorna undefined

**Solução**:
1. Prefixo `VITE_` obrigatório
2. Rebuild após adicionar variável
3. Verificar no Dashboard Vercel

---

## 📚 RECURSOS

- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/actions)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Versão**: 1.0.0  
**Última Atualização**: 18 de Novembro de 2025

© 2025 ICARUS v5.0 - Deploy com confiança 🚀

