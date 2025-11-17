# 🚀 GUIA COMPLETO: VERCEL DEPLOY VIA CURSOR

**Data:** 26 de Outubro de 2025  
**Projeto:** ICARUS v5.0.2 - NEW ORTHO  
**Agente:** Vercel Deploy Automation

---

## ✅ STATUS: PRONTO PARA DEPLOY

### Configuração Concluída

- ✅ Vercel CLI instalado localmente
- ✅ Token Vercel configurado
- ✅ Script de deploy automatizado criado
- ✅ API serverless `/api/contact` implementada
- ✅ `vercel.json` otimizado para pnpm
- ✅ Scripts npm configurados
- ✅ Segurança headers configurados

---

## 🎯 COMANDOS DISPONÍVEIS

### 1. Deploy Preview (Recomendado para testar)

```bash
pnpm deploy:vercel
# ou
pnpm deploy:vercel:preview
```

**O que faz:**

- Executa todas as verificações
- Valida TypeScript
- Faz build do projeto
- Deploy para URL temporária de preview
- Não afeta produção

**Ideal para:**

- ✅ Testar mudanças
- ✅ Validar features
- ✅ Compartilhar com equipe
- ✅ CI/CD pipeline

---

### 2. Deploy Produção

```bash
pnpm deploy:vercel:prod
```

**O que faz:**

- Mesmas verificações do preview
- Deploy para produção: `https://icarus-newortho.vercel.app`
- Atualiza site em produção

**⚠️ ATENÇÃO:**

- Use apenas quando tiver certeza
- Preview deve estar funcionando
- Variáveis de ambiente configuradas

---

### 3. Deploy Rápido (Pula Verificações)

```bash
pnpm deploy:vercel:skip
```

**O que faz:**

- Pula TypeCheck e Build local
- Deploy direto para preview
- Mais rápido mas menos seguro

**Use apenas quando:**

- Build local já validado
- Deploy urgente
- Pequenas mudanças

---

### 4. Ajuda e Documentação

```bash
pnpm vercel:help
```

Mostra todas as opções disponíveis.

---

## 🔐 VARIÁVEIS DE AMBIENTE VERCEL

### Obrigatórias (Configure no Dashboard)

Acesse: https://vercel.com/dashboard → Projeto → Settings → Environment Variables

#### 1. VITE_SUPABASE_URL

```
Name:  VITE_SUPABASE_URL
Value: https://ttswvavcisdnonytslom.supabase.co
Envs:  ✅ Production, ✅ Preview
```

#### 2. VITE_SUPABASE_ANON_KEY

```
Name:  VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzE1MzksImV4cCI6MjA3NjQwNzUzOX0.pZhNjYp2M9S9wF_drLA6-ZK-tk_GaaJn5kYBTxQE1xg
Envs:  ✅ Production, ✅ Preview
```

#### 3. VITE_APP_URL

```
Name:  VITE_APP_URL
Value: https://icarus-newortho.vercel.app
Envs:  ✅ Production
```

#### 4. NODE_ENV

```
Name:  NODE_ENV
Value: production
Envs:  ✅ Production
```

### Como Adicionar

1. **Dashboard Vercel** → https://vercel.com/dashboard
2. Selecione o projeto **icarus-newortho**
3. **Settings** → **Environment Variables**
4. Para cada variável:
   - Clique **Add New**
   - Cole **Name** e **Value**
   - Marque **Production** (e **Preview** se necessário)
   - Clique **Save**
5. Após adicionar todas: **Redeploy**

---

## 📋 CHECKLIST PRÉ-DEPLOY

### Antes do Primeiro Deploy

- [ ] **Repositório no GitHub**

  ```bash
  git remote -v
  # Deve mostrar: github.com/Icarus-AI-Technology/icarus-newortho
  ```

- [ ] **Build local funciona**

  ```bash
  pnpm run build
  # Deve completar sem erros
  ```

- [ ] **TypeScript OK**

  ```bash
  pnpm run type-check
  # Warnings OK, erros não
  ```

- [ ] **Supabase configurado**
  - Migrations aplicadas
  - Storage buckets criados
  - Usuário CEO existe

---

## 🚀 PRIMEIRO DEPLOY (PASSO A PASSO)

### Passo 1: Importar Projeto no Vercel

1. Acesse: https://vercel.com/new
2. **Import Git Repository**
3. Conecte GitHub se necessário
4. Selecione: `Icarus-AI-Technology/icarus-newortho`
5. Configure:

```
Framework Preset: Vite
Root Directory: ./
Build Command: pnpm run build
Output Directory: dist
Install Command: pnpm install --no-frozen-lockfile
```

6. **NÃO FAÇA DEPLOY AINDA** - clique em "Environment Variables" primeiro

---

### Passo 2: Adicionar Variáveis de Ambiente

No modal de configuração (antes do primeiro deploy):

1. Adicione as 4 variáveis obrigatórias (veja seção acima)
2. Marque **Production** para todas
3. Marque **Preview** para VITE*SUPABASE*\* (opcional)

---

### Passo 3: Deploy Inicial

1. Clique em **Deploy**
2. Aguarde build (~2-3 minutos)
3. ✅ Se bem-sucedido → Anote a URL

---

### Passo 4: Atualizar URL

1. Copie a URL real do Vercel (ex: `icarus-newortho-abc123.vercel.app`)
2. Volte em **Settings** → **Environment Variables**
3. Edite `VITE_APP_URL` com a URL real
4. **Redeploy**: Deployments → ... → Redeploy

---

### Passo 5: Testar Sistema

```
URL:   https://icarus-newortho.vercel.app
Email: dax@newortho.com.br
Senha: admin123
Role:  CEO (acesso total)
```

**Teste:**

- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Dados do Supabase aparecem
- ✅ Navegação funciona
- ✅ API `/api/contact` funciona

---

## 🔄 DEPLOYS SUBSEQUENTES

Após o primeiro deploy configurado:

### Via Cursor (Automático)

```bash
# Deploy preview (testa mudanças)
pnpm deploy:vercel

# Deploy produção (quando pronto)
pnpm deploy:vercel:prod
```

### Via Git Push (Automático)

```bash
git add .
git commit -m "feat: nova feature"
git push origin main
```

Vercel detecta push e faz deploy automático!

---

## 📊 MONITORAMENTO

### Vercel Dashboard

**URL:** https://vercel.com/dashboard

**Seções importantes:**

1. **Deployments**
   - Status de cada deploy
   - Logs em tempo real
   - Preview URLs

2. **Analytics** (se habilitado)
   - Pageviews
   - Visitantes únicos
   - Performance

3. **Logs**
   - Function logs
   - Build logs
   - Runtime logs

4. **Insights**
   - Core Web Vitals
   - Lighthouse scores
   - Performance metrics

---

## 🐛 TROUBLESHOOTING

### ❌ Build Failed

**Erro:** "Build failed with exit code 1"

**Solução:**

```bash
# Teste build localmente
pnpm run build

# Se falhar, corrija erros
pnpm run type-check
pnpm run lint
```

---

### ❌ Supabase Not Initialized

**Erro:** "Supabase client not initialized"

**Solução:**

1. Vercel Dashboard → Settings → Environment Variables
2. Verifique:
   - `VITE_SUPABASE_URL` existe
   - `VITE_SUPABASE_ANON_KEY` existe
3. Se faltando, adicione
4. **Redeploy** obrigatório

---

### ❌ 404 Not Found

**Erro:** Página não encontrada ao navegar

**Solução:**
Verifique `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### ❌ Environment Variables Not Updating

**Erro:** Mudanças em ENV não aplicadas

**Solução:**

1. Modificar variável no Dashboard
2. **SEMPRE fazer Redeploy**
3. Variáveis só aplicam em novo build

---

### ❌ API Route Not Working

**Erro:** `/api/contact` retorna 404

**Solução:**

1. Verifique arquivo existe: `api/contact.ts`
2. Verifique `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/contact",
      "destination": "/api/contact.ts"
    }
  ]
}
```

3. Redeploy

---

## 📁 ESTRUTURA DE ARQUIVOS

```
icarus-make/
├── .cursor/
│   └── scripts/
│       └── deploy-vercel.js      # Script automático de deploy
├── api/
│   └── contact.ts                # Serverless function
├── dist/                         # Build output (gitignore)
├── src/                          # Código fonte React
├── vercel.json                   # Config Vercel
├── package.json                  # Scripts npm
├── vite.config.ts                # Config Vite
└── VERCEL_DEPLOY_GUIDE.md        # Este arquivo
```

---

## 🔒 SEGURANÇA

### Headers HTTP (Configurados)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### CORS (API)

Configurado em `api/contact.ts` para aceitar requests do domínio Vercel.

### Environment Variables

- ✅ Nunca commitar `.env`
- ✅ Usar Vercel Dashboard para produção
- ✅ Variáveis sensíveis apenas no Vercel
- ✅ Token Vercel em script (não exposto)

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial

- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI:** https://vercel.com/docs/cli
- **Environment Variables:** https://vercel.com/docs/environment-variables
- **Serverless Functions:** https://vercel.com/docs/functions

### Documentação do Projeto

- `VERCEL_ENV_COMPLETO.md` - Variáveis completas
- `SISTEMA_100_COMPLETO_CREDENCIAIS.md` - Sistema completo
- `SUPABASE_100_COMPLETO.md` - Backend completo
- `README.md` - Overview do projeto

### Suporte

- **Vercel Discord:** https://vercel.com/discord
- **Vercel Support:** https://vercel.com/support
- **Supabase Docs:** https://supabase.com/docs

---

## 🎯 PRÓXIMOS PASSOS

### Após Primeiro Deploy

1. **Configurar Domínio Customizado**

   ```
   Dashboard → Settings → Domains
   Adicionar: icarusai.com.br
   ```

2. **Habilitar Analytics**

   ```
   Dashboard → Analytics → Enable
   Adicionar: @vercel/analytics no código
   ```

3. **Configurar CI/CD**
   - Branch preview automático
   - Protection rules
   - Deployment protection

4. **Configurar Credenciais**

   ```
   URL: https://icarus-newortho.vercel.app/integracoes/credenciais
   Adicionar 15 credenciais via interface
   ```

5. **Monitoramento**
   - Sentry para errors
   - PostHog para analytics
   - Vercel Insights para performance

---

## ✅ RESUMO EXECUTIVO

### Comandos Principais

```bash
# Deploy preview
pnpm deploy:vercel

# Deploy produção
pnpm deploy:vercel:prod

# Ajuda
pnpm vercel:help
```

### Variáveis Essenciais

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_URL`
- `NODE_ENV=production`

### Status

- ✅ Script automatizado: **PRONTO**
- ✅ Configuração Vercel: **PRONTO**
- ✅ API Serverless: **PRONTO**
- ✅ Documentação: **COMPLETA**
- 🚀 Deploy: **READY TO GO!**

---

## 🎉 TUDO PRONTO!

Execute agora:

```bash
pnpm deploy:vercel
```

E em ~3 minutos seu sistema estará no ar! 🚀

---

_Documento gerado automaticamente em 26/10/2025_  
_ICARUS v5.0.2 - Agente Vercel Deploy_  
_NEW ORTHO - Excelência em Gestão Hospitalar_
