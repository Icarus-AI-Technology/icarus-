# 🚀 SETUP COMPLETO: GIT + GITHUB + VERCEL → icarusai.com.br

**Tempo Total:** ~20 minutos  
**Objetivo:** Deploy do ICARUS no domínio icarusai.com.br

---

## 📋 PRÉ-REQUISITOS

✅ Conta GitHub (grátis): https://github.com/signup  
✅ Conta Vercel (grátis): https://vercel.com/signup  
✅ Domínio icarusai.com.br (✅ já apontado para Vercel)

---

## 🔧 PARTE 1: INICIALIZAR GIT (5 min)

### Passo 1: Inicializar Repositório Git

```bash
cd /Users/daxmeneghel/icarus-make

# Inicializar Git
git init

# Configurar usuário (se ainda não tiver)
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"

# Criar .gitignore (se não existir)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage
/test-results
/playwright-report

# Production
/dist
/build

# Environment
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# Vercel
.vercel

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary
.cache/
.temp/
EOF
```

### Passo 2: Primeiro Commit

```bash
# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit: ICARUS v5.0 - Production ready"

# Verificar status
git status
# Deve mostrar: "nothing to commit, working tree clean"
```

---

## 📦 PARTE 2: CRIAR REPOSITÓRIO NO GITHUB (3 min)

### Passo 1: Criar Repositório

```bash
1. Acessar: https://github.com/new

2. Configurar:
   Repository name: icarus-make
   Description: ICARUS v5.0 - Sistema de Gestão OPME
   Visibility: Private (recomendado) ou Public
   
   ⚠️ NÃO marcar:
   - Add README
   - Add .gitignore
   - Choose a license
   
   (já temos esses arquivos localmente)

3. Create repository
```

### Passo 2: Conectar Local ao GitHub

```bash
# Copiar URL do repositório (ex: https://github.com/seu-usuario/icarus-make.git)

# Adicionar remote
git remote add origin https://github.com/seu-usuario/icarus-make.git

# Renomear branch para main (se necessário)
git branch -M main

# Push inicial
git push -u origin main
```

**✅ Código agora está no GitHub!**

---

## 🚀 PARTE 3: DEPLOY NO VERCEL (5 min)

### Opção A: Via Dashboard (VISUAL - Recomendado)

**Passo 1: Importar Repositório**
```bash
1. Acessar: https://vercel.com/new

2. Import Git Repository
   - Clicar em: GitHub
   - Autorizar Vercel (primeira vez)
   - Selecionar: seu-usuario/icarus-make

3. Configure Project:
   Project Name: icarus-make
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install

4. Environment Variables: (configurar depois)
   
5. Deploy!
```

**Aguardar build (2-3 minutos)...**

✅ **Deploy concluído!** URL temporária criada: `icarus-make.vercel.app`

### Opção B: Via CLI (TERMINAL)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login (abre browser)
vercel login

# Deploy
cd /Users/daxmeneghel/icarus-make
vercel

# Seguir prompts:
# - Set up and deploy? Y
# - Scope: [sua conta]
# - Link to existing project? N
# - Project name: icarus-make
# - Directory: ./
# - Override settings? N

# Deploy para produção
vercel --prod
```

---

## 🌐 PARTE 4: ADICIONAR DOMÍNIO icarusai.com.br (2 min)

### No Vercel Dashboard:

```bash
1. Acessar projeto: https://vercel.com/seu-usuario/icarus-make

2. Settings > Domains

3. Add Domain
   Digite: icarusai.com.br
   
4. Add

5. Vercel verifica DNS...
   
   ✅ Se DNS já está configurado:
   Status: "Valid Configuration" ✅
   
   ⚠️ Se DNS não está configurado:
   Vercel mostra instruções (ver docs/DEPLOY_DOMINIO_REGISTRO_BR.md)
```

**✅ Domínio conectado!**

---

## ⚙️ PARTE 5: CONFIGURAR ENVIRONMENT VARIABLES (5 min)

### No Vercel Dashboard:

```bash
Settings > Environment Variables > Add New

Adicionar uma por uma:
```

**Variáveis Essenciais:**

```bash
# 1. Supabase (copiar do dashboard Supabase)
Name: VITE_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environments: ☑️ Production ☑️ Preview ☑️ Development

# 2. Supabase Anon Key
Name: VITE_SUPABASE_ANON_KEY
Value: eyJxxxx...
Environments: ☑️ Production ☑️ Preview ☑️ Development

# 3. OpenRouter (criar em https://openrouter.ai)
Name: VITE_OPENROUTER_API_KEY
Value: sk-or-xxxxx
Environments: ☑️ Production ☑️ Preview ☑️ Development

# 4. LLM Provider
Name: VITE_LLM_PROVIDER
Value: openrouter
Environments: ☑️ Production ☑️ Preview ☑️ Development

# 5. App URL
Name: VITE_APP_URL
Value: https://icarusai.com.br
Environments: ☑️ Production

# 6. Environment
Name: VITE_ENVIRONMENT
Value: production
Environments: ☑️ Production

# 7. Release
Name: VITE_RELEASE
Value: v5.0.0
Environments: ☑️ Production
```

**Variáveis Opcionais (mas recomendadas):**

```bash
# Resend (Email - https://resend.com)
VITE_RESEND_API_KEY=re_xxxxx

# PostHog (Analytics - https://posthog.com)
VITE_POSTHOG_API_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Sentry (Errors - https://sentry.io)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

**Após adicionar todas as variáveis:**

```bash
Deployments > Redeploy
(para aplicar as novas variáveis)
```

---

## 🗄️ PARTE 6: CRIAR VERCEL KV (REDIS) (3 min)

### No Vercel Dashboard:

```bash
1. Storage > Create Database

2. Selecionar: KV (Redis)

3. Configurar:
   Database Name: icarus-queue
   Region: São Paulo (ou mais próxima)
   
4. Create

5. Connect to Project
   Selecionar: icarus-make
   
6. Connect

✅ Environment variables auto-injetadas!
   KV_REST_API_URL
   KV_REST_API_TOKEN
   KV_REST_API_READ_ONLY_TOKEN
   KV_URL

7. Redeploy automático (se solicitado, aceitar)
```

---

## 📊 PARTE 7: HABILITAR ANALYTICS (1 min)

### No Vercel Dashboard:

```bash
1. Analytics > Enable

2. ✅ Pronto!
   (já está integrado no código via @vercel/analytics)
```

---

## ✅ VALIDAÇÃO FINAL (5 min)

### Checklist:

```bash
✅ 1. Git inicializado
✅ 2. Repositório GitHub criado
✅ 3. Deploy Vercel realizado
✅ 4. Domínio icarusai.com.br adicionado
✅ 5. DNS validado (✅ Valid Configuration)
✅ 6. SSL emitido (🔒 Certificate Issued)
✅ 7. Environment variables configuradas (7 essenciais)
✅ 8. Vercel KV criado e conectado
✅ 9. Analytics habilitado
```

### Testes:

**1. Acessar Site:**
```bash
# Abrir browser:
https://icarusai.com.br

✅ Site carrega
✅ HTTPS ativo (cadeado verde)
✅ Login aparece
```

**2. Console (F12):**
```bash
✅ Zero erros JavaScript
✅ Vercel Analytics carregou
✅ Supabase conectado
```

**3. Login:**
```bash
# Testar credenciais Supabase
✅ Login funciona
✅ Dashboard carrega
✅ Módulos acessíveis
```

**4. Monitoramento:**
```bash
# Acessar: https://icarusai.com.br/monitoring

✅ Dashboard carrega
✅ Vercel KV: Online
✅ BrasilAPI: Online
✅ Services status OK
```

---

## 🔄 WORKFLOW DE DESENVOLVIMENTO

### Deploy Automático:

```bash
# Qualquer push para main = deploy automático!

# Fazer mudanças
git add .
git commit -m "Feature: Nova funcionalidade X"
git push origin main

# Vercel detecta e faz deploy automaticamente
# Acompanhar em: https://vercel.com/dashboard
```

### Preview Deployments:

```bash
# Criar branch de feature
git checkout -b feature/nova-funcionalidade

# Fazer mudanças e push
git add .
git commit -m "WIP: Nova funcionalidade"
git push origin feature/nova-funcionalidade

# Vercel cria URL preview automática:
# https://icarus-make-git-feature-xxx.vercel.app
```

### Rollback:

```bash
# Se algo der errado:
Vercel Dashboard > Deployments > [versão anterior] > Promote to Production
# Rollback instantâneo! ✅
```

---

## 📊 RESUMO DO SETUP

```
┌─────────────────────────────────────────────┐
│  🎉 SETUP COMPLETO!                         │
├─────────────────────────────────────────────┤
│  ✅ Git: Inicializado                       │
│  ✅ GitHub: Repositório criado              │
│  ✅ Vercel: Deploy realizado                │
│  ✅ Domínio: icarusai.com.br conectado      │
│  ✅ SSL: Let's Encrypt ativo                │
│  ✅ Env Vars: 7 essenciais configuradas     │
│  ✅ KV Redis: Conectado                     │
│  ✅ Analytics: Habilitado                   │
│                                             │
│  🌐 URL: https://icarusai.com.br            │
│  📊 Analytics: Ativo                        │
│  💾 Backend: Supabase                       │
│  ☁️  Host: Vercel (Global CDN)              │
│                                             │
│  💰 Custo: $10-20/mês                       │
│  ⏱️  Setup: 20 minutos                      │
│  🚀 Deploy: Automático (git push)           │
└─────────────────────────────────────────────┘
```

---

## 🎯 PRÓXIMOS PASSOS

### Imediato:
1. ✅ Testar todas as funcionalidades
2. ✅ Criar contas services opcionais (Resend, PostHog, Sentry)
3. ✅ Adicionar env vars opcionais

### Curto Prazo:
1. ✅ Monitorar Analytics (Vercel Dashboard)
2. ✅ Verificar performance (Lighthouse)
3. ✅ Configurar alertas (Vercel notifications)

### Médio Prazo:
1. ✅ Implementar features adicionais
2. ✅ Otimizar queries
3. ✅ A/B testing (feature flags)

---

## 📚 COMANDOS ÚTEIS

### Git:
```bash
# Status
git status

# Ver mudanças
git diff

# Commit
git add .
git commit -m "Mensagem"

# Push
git push origin main

# Pull (atualizar local)
git pull origin main

# Ver histórico
git log --oneline --graph

# Criar branch
git checkout -b feature/nome

# Voltar para main
git checkout main
```

### Vercel CLI:
```bash
# Deploy preview
vercel

# Deploy produção
vercel --prod

# Ver logs
vercel logs

# Ver domínios
vercel domains ls

# Ver env vars
vercel env ls

# Pull env vars (para local)
vercel env pull
```

---

## 🆘 TROUBLESHOOTING

### Erro: "git: command not found"
```bash
# Instalar Git (macOS):
xcode-select --install

# Verificar instalação:
git --version
```

### Erro: "Permission denied (publickey)"
```bash
# Configurar SSH no GitHub:
# https://docs.github.com/en/authentication/connecting-to-github-with-ssh
```

### Erro: Build falha no Vercel
```bash
# Ver logs completos:
Vercel Dashboard > Deployments > [deploy] > Build Logs

# Testar build local:
npm run build

# Verificar tipos:
npm run type-check
```

---

**🚀 ICARUS v5.0 DEPLOYADO EM ICARUSAI.COM.BR!**

**Setup time:** 20 minutos  
**Git:** Inicializado ✅  
**GitHub:** Conectado ✅  
**Vercel:** Deployado ✅  
**Domain:** icarusai.com.br ✅  
**SSL:** Ativo ✅  

---

© 2025 ICARUS v5.0  
**icarusai.com.br - Git + GitHub + Vercel. Production Ready.** 🚀

