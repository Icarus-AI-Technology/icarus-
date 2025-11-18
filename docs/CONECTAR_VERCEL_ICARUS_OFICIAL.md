# 🚀 CONECTAR REPOSITÓRIO AO VERCEL - icarus-oficial

**Projeto Vercel:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial  
**Repositório GitHub:** https://github.com/Icarus-AI-Technology/icarus-  
**Objetivo:** Conectar Git e fazer deploy automático

---

## ⚡ OPÇÃO 1: VIA DASHBOARD (5 MINUTOS) 👈 RECOMENDADO

### Passo 1: Conectar Git Repository

```
1. Acessar: https://vercel.com/daxs-projects-5db3d203/icarus-oficial

2. Clicar em: "Connect Git" (botão visível na página)

3. Select Git Provider: GitHub

4. Autorizar Vercel (se necessário)

5. Select Repository: 
   - Organization: Icarus-AI-Technology
   - Repository: icarus-

6. Import Project

7. Configure Project:
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install

8. Deploy!
```

**✅ Após isso, qualquer `git push` fará deploy automático!**

---

## ⚡ OPÇÃO 2: VIA CLI (3 MINUTOS)

### Passo 1: Instalar Vercel CLI

```bash
npm i -g vercel
```

### Passo 2: Login

```bash
vercel login
# Seguir instruções no browser
```

### Passo 3: Link ao Projeto Existente

```bash
cd /Users/daxmeneghel/icarus-make

# Link ao projeto existente
vercel link

# Selecionar:
# - Team: dax's projects
# - Project: icarus-oficial
```

### Passo 4: Deploy

```bash
# Deploy para produção
vercel --prod

# Ou criar arquivo vercel.json para configuração
```

**✅ Deploy completo!**

---

## ⚙️ CONFIGURAÇÃO DO PROJETO

### Build Settings (já deve estar configurado):

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### Environment Variables (configurar):

```
Settings > Environment Variables > Add New

Essenciais (7 variáveis):

1. VITE_SUPABASE_URL
   Value: https://xxxxx.supabase.co
   Environments: ☑️ Production ☑️ Preview ☑️ Development

2. VITE_SUPABASE_ANON_KEY
   Value: eyJxxxx...
   Environments: ☑️ Production ☑️ Preview ☑️ Development

3. VITE_OPENROUTER_API_KEY
   Value: sk-or-xxxxx
   Environments: ☑️ Production ☑️ Preview ☑️ Development

4. VITE_LLM_PROVIDER
   Value: openrouter
   Environments: ☑️ Production ☑️ Preview ☑️ Development

5. VITE_APP_URL
   Value: https://icarusai.com.br
   Environments: ☑️ Production

6. VITE_ENVIRONMENT
   Value: production
   Environments: ☑️ Production

7. VITE_RELEASE
   Value: v5.0.0
   Environments: ☑️ Production
```

**Após adicionar:** `Deployments > Redeploy` (para aplicar)

---

## 🌐 CONFIGURAR DOMÍNIO

### Adicionar icarusai.com.br:

```
Settings > Domains > Add Domain

Domain: icarusai.com.br

Add

Status esperado:
✅ Valid Configuration (DNS já configurado)
🔒 Certificate Issued (SSL automático)
```

---

## 🗄️ VERCEL KV (REDIS)

### Criar Database:

```
Storage > Create Database > KV

Name: icarus-queue
Region: São Paulo (ou mais próxima do Brasil)

Create

Connect to Project: icarus-oficial

✅ Environment variables auto-injetadas:
   - KV_REST_API_URL
   - KV_REST_API_TOKEN
   - KV_REST_API_READ_ONLY_TOKEN
   - KV_URL
```

---

## 📊 ANALYTICS

### Habilitar:

```
Analytics > Enable

✅ Vercel Analytics (nativo)
✅ Core Web Vitals
✅ Page Views
✅ Real User Monitoring
```

---

## 🔥 DEPLOY AUTOMÁTICO

### Após conectar o Git:

```bash
# No seu computador:
cd /Users/daxmeneghel/icarus-make

# Fazer mudanças
git add .
git commit -m "Nova feature X"
git push origin main

# Vercel detecta e faz deploy automático! 🚀
```

**Preview URLs:** Cada branch terá URL de preview automática

---

## ✅ CHECKLIST COMPLETO

```bash
[ ] 1. Conectar Git Repository no Vercel
[ ] 2. Confirmar build settings (Vite)
[ ] 3. Adicionar 7 environment variables
[ ] 4. Redeploy para aplicar env vars
[ ] 5. Adicionar domínio icarusai.com.br
[ ] 6. Verificar SSL (Certificate Issued)
[ ] 7. Criar Vercel KV (icarus-queue)
[ ] 8. Habilitar Analytics
[ ] 9. Testar deploy automático (git push)
[ ] 10. Validar site em https://icarusai.com.br
```

---

## 🎯 AÇÃO IMEDIATA

### AGORA (5 minutos):

**1. Conectar Git:**
```
https://vercel.com/daxs-projects-5db3d203/icarus-oficial
↓
Connect Git
↓
Icarus-AI-Technology/icarus-
↓
Import
```

**2. Deploy:**
```
Framework: Vite
Build: npm run build
Output: dist
↓
Deploy! 🚀
```

**3. Env Vars (7 essenciais):**
```
Settings > Environment Variables
↓
Adicionar uma por uma
↓
Redeploy
```

**4. Domínio:**
```
Settings > Domains
↓
Add: icarusai.com.br
↓
✅ Valid Configuration
```

**Tempo total:** 5-10 minutos

---

## 📊 URLS FINAIS

```
✅ Vercel Dashboard: https://vercel.com/daxs-projects-5db3d203/icarus-oficial
✅ GitHub Repo: https://github.com/Icarus-AI-Technology/icarus-
⏳ Produção: https://icarusai.com.br (após configurar domínio)
⏳ Vercel URL: https://icarus-oficial.vercel.app (após deploy)
```

---

## 🔄 WORKFLOW FINAL

```
┌─────────────────────────────────────────────┐
│  Desenvolvimento Local                      │
│  ↓                                          │
│  git push origin main                       │
│  ↓                                          │
│  Vercel detecta mudança                     │
│  ↓                                          │
│  Build automático (npm run build)           │
│  ↓                                          │
│  Deploy automático                          │
│  ↓                                          │
│  ✅ https://icarusai.com.br atualizado!     │
└─────────────────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

### Erro: Build falha
```
1. Ver logs: Deployments > [último deploy] > Build Logs
2. Testar local: npm run build
3. Verificar env vars: Settings > Environment Variables
```

### Erro: Domínio não conecta
```
1. Verificar DNS: dig icarusai.com.br +short
2. Aguardar propagação: 5-60 minutos
3. Forçar refresh: Settings > Domains > Refresh
```

### Erro: 404 em rotas
```
Adicionar ao vercel.json:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🎉 SUCESSO!

```
┌─────────────────────────────────────────────┐
│  ✅ PROJETO VERCEL PRONTO!                  │
├─────────────────────────────────────────────┤
│  ✅ Projeto: icarus-oficial                 │
│  ✅ Dashboard: daxs-projects-5db3d203       │
│  ✅ GitHub: Icarus-AI-Technology/icarus-    │
│  ✅ Domínio: icarusai.com.br (a configurar) │
│                                             │
│  🚀 PRÓXIMO: Connect Git (5 min)            │
│  📍 URL: vercel.com/.../icarus-oficial      │
└─────────────────────────────────────────────┘
```

---

**🔗 Link Direto:**
https://vercel.com/daxs-projects-5db3d203/icarus-oficial

**📋 Ação:** Clicar em "Connect Git" e seguir os passos acima

**⏱️ Tempo:** 5-10 minutos para tudo configurado

---

© 2025 ICARUS v5.0  
**Vercel + GitHub. Deploy Automático. Production Ready.** 🚀

