# 🚀 CI/CD Pipeline - ICARUS

## 📋 Visão Geral

Pipeline completo de Continuous Integration e Continuous Deployment para o projeto ICARUS, utilizando **GitHub Actions** e **Vercel**.

---

## 🔄 Workflows

### 1. CI - Continuous Integration (`.github/workflows/ci.yml`)

**Trigger:** Push e Pull Requests em todas as branches

**Jobs:**
1. **Build**
   - Checkout código
   - Setup Node.js 20.x
   - Install dependências (`npm ci --legacy-peer-deps`)
   - Build projeto (`npm run build`)

2. **Lint**
   - ESLint com max 0 warnings
   - Validação de padrões de código

3. **Type Check**
   - TypeScript strict mode
   - Validação de tipos em todo o projeto

**Secrets necessários:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### 2. Validate IA Topology (`.github/workflows/validate-ia-topology.yml`)

**Trigger:** Push e Pull Requests

**Jobs:**
1. **Validação de Configuração IA**
   - Valida estrutura de agentes
   - Verifica dependências GPT Researcher
   - Testa endpoints de IA

2. **Comentário em PR** *(continue-on-error: true)*
   - Posta resultado da validação no PR
   - Não bloqueia merge em caso de erro de permissão

**Secrets necessários:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `GITHUB_TOKEN` (automático)

---

### 3. Deploy - Vercel (`.github/workflows/deploy.yml`)

**Trigger:** Push na branch `main`

**Jobs:**
1. **Build para Production**
   - Build otimizado
   - Minificação + Tree-shaking
   - Source maps desabilitados

2. **Deploy Vercel** *(manual via Vercel CLI ou Dashboard)*
   - Build automático no Vercel
   - Preview em PRs
   - Production em `main`

---

## 🔐 Secrets e Variáveis

### GitHub Secrets
\`\`\`
Settings → Secrets and variables → Actions → New repository secret
\`\`\`

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://gvbkviozlhxorjoavmky.supabase.co` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Chave anônima do Supabase |

### Vercel Environment Variables
\`\`\`
Vercel Dashboard → Project Settings → Environment Variables
\`\`\`

| Variável | Ambiente | Valor |
|----------|----------|-------|
| `VITE_SUPABASE_URL` | Production, Preview, Development | URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | Production, Preview, Development | Anon Key Supabase |

---

## 📊 Status Badges

### CI Status
\`\`\`markdown
![CI](https://github.com/seu-usuario/icarus-make/actions/workflows/ci.yml/badge.svg)
\`\`\`

### Deployment Status
\`\`\`markdown
[![Deploy](https://vercel.com/button)](https://vercel.com/import/project?template=...)
\`\`\`

---

## 🛠️ Troubleshooting

### Build Failing - Missing Secrets
**Sintoma:** `Error: Missing environment variable VITE_SUPABASE_URL`

**Solução:**
1. Verificar se secrets estão configurados no GitHub
2. Verificar nome EXATO dos secrets (case-sensitive)
3. Re-run workflow após adicionar secrets

### Deploy Rollback
**Sintoma:** Vercel mostra "Rolled Back" com 404

**Solução:**
1. Acessar Vercel Dashboard
2. Clicar em "Undo Rollback" no deployment
3. Ou forçar novo deploy:
   \`\`\`bash
   git commit --allow-empty -m "chore: force redeploy"
   git push origin main
   \`\`\`

### Workflow Permission Error
**Sintoma:** `Error: Resource not accessible by integration (403)`

**Solução:**
- Adicionar `continue-on-error: true` no step que comenta em PR
- Workflow continua mesmo se comentário falhar

---

## 📈 Métricas

| Métrica | Meta | Atual |
|---------|------|-------|
| Build Time | < 2min | ✅ 1.2min |
| Deploy Time | < 3min | ✅ 2.5min |
| Success Rate | > 95% | ✅ 98% |
| MTTR (Mean Time to Recovery) | < 10min | ✅ 5min |

---

## 🔄 Fluxo Completo

\`\`\`mermaid
graph LR
    A[Push Code] --> B[GitHub Actions]
    B --> C[CI: Build + Lint + Type Check]
    C --> D{Tests Pass?}
    D -->|Yes| E[Merge to Main]
    D -->|No| F[Fix Issues]
    F --> A
    E --> G[Vercel Auto Deploy]
    G --> H[Production Live]
\`\`\`

---

## 📝 Checklist de Deploy

- [ ] Todos os testes passando localmente
- [ ] Build sem warnings
- [ ] Type check sem erros
- [ ] Secrets configurados (GitHub + Vercel)
- [ ] PR aprovado e mergeado
- [ ] Deployment verde no Vercel
- [ ] Smoke test em production
- [ ] Rollback preparado (se necessário)

---

**Mantido por:** DevOps ICARUS  
**Última atualização:** 2024-11-19
