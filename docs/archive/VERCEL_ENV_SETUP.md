# 🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - VERCEL

## 📋 PASSO A PASSO

### 1. Acessar Vercel Dashboard

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **icarus-oficial**
3. Vá em **Settings** → **Environment Variables**

---

## 🔑 VARIÁVEIS OBRIGATÓRIAS

### API URLs

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# API Base
VITE_API_URL=https://api.icarus.com.br
```

### Integrações Externas

```bash
# Receita Federal
VITE_RECEITA_FEDERAL_API_KEY=your_key_here

# ViaCEP (não precisa de key)
VITE_VIACEP_URL=https://viacep.com.br/ws

# CFM (Conselho Federal de Medicina)
VITE_CFM_API_URL=https://portal.cfm.org.br/api
VITE_CFM_API_KEY=your_key_here

# ANS (Agência Nacional de Saúde)
VITE_ANS_API_URL=https://www.ans.gov.br/api
VITE_ANS_API_KEY=your_key_here
```

### Analytics e Monitoramento

```bash
# Vercel Analytics (já incluído)
# Não precisa configurar, vem automático

# Sentry (Error Tracking)
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_SENTRY_ENVIRONMENT=production

# PostHog (Product Analytics)
VITE_POSTHOG_API_KEY=your_posthog_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Features Flags

```bash
# Ambiente
VITE_ENVIRONMENT=production

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true
VITE_ENABLE_MAINTENANCE_MODE=false
```

---

## 📝 COMO ADICIONAR NO VERCEL

### Via Dashboard (Recomendado)

1. **Settings** → **Environment Variables**
2. Clique em **Add**
3. Preencha:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://your-project.supabase.co`
   - **Environments:** Selecione `Production`, `Preview`, `Development`
4. Clique em **Save**
5. Repita para todas as variáveis

### Via CLI (Alternativo)

```bash
# Instalar Vercel CLI (se ainda não tem)
npm i -g vercel

# Login
vercel login

# Adicionar variáveis
vercel env add VITE_SUPABASE_URL production
# Cole o valor quando solicitado

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole o valor quando solicitado

# Listar variáveis
vercel env ls
```

---

## 🔄 REDEPLOY APÓS ADICIONAR VARIÁVEIS

### Opção 1: Via Dashboard
1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Clique em **Redeploy**

### Opção 2: Via CLI
```bash
vercel --prod
```

### Opção 3: Via Git Push
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

---

## ✅ VALIDAR VARIÁVEIS

Após o redeploy, teste:

```bash
# Abrir console do navegador em https://icarus-oficial.vercel.app
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_API_URL)

# Deve mostrar os valores configurados
```

---

## 🚨 IMPORTANTE

### Segurança

- ✅ **NUNCA** commite `.env` files no Git
- ✅ **SEMPRE** use `VITE_` prefix para variáveis públicas
- ✅ **NUNCA** exponha chaves privadas no frontend
- ✅ **USE** Vercel Environment Variables para secrets

### Ambientes

Configure para todos os ambientes:
- ✅ **Production** - Deploy final (main branch)
- ✅ **Preview** - Branches de feature
- ✅ **Development** - Local development

---

## 📊 CHECKLIST

- [ ] Adicionar `VITE_SUPABASE_URL`
- [ ] Adicionar `VITE_SUPABASE_ANON_KEY`
- [ ] Adicionar `VITE_API_URL`
- [ ] Adicionar integrações externas (CFM, ANS, etc)
- [ ] Adicionar Sentry DSN (opcional)
- [ ] Adicionar PostHog Key (opcional)
- [ ] Fazer redeploy
- [ ] Testar no navegador
- [ ] Validar funcionamento das APIs

---

## 🎯 PRÓXIMO PASSO

Após configurar as variáveis:

1. ✅ Redeploy no Vercel
2. ✅ Acessar a URL de produção
3. ✅ Testar login
4. ✅ Testar 3-5 fluxos críticos
5. ✅ Validar performance (Lighthouse)
6. ✅ Configurar domínio customizado (opcional)

---

**Documentação:** https://vercel.com/docs/environment-variables

