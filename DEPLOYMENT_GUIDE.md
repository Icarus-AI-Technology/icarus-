# 🚀 GUIA COMPLETO DE DEPLOYMENT - ICARUS v5.0 CLOUD

**Data:** 20 de outubro de 2025  
**Arquitetura:** 100% Cloud, Zero Docker, Multi-Usuário Web  
**Tempo Total:** ~2 horas

---

## 📋 PRÉ-REQUISITOS

✅ Conta GitHub (para deploy automático)  
✅ Conta Gmail/GitHub para criar contas nos services  
✅ Cartão de crédito (apenas para verificação, usaremos free tiers)

---

## 🎯 FASE 1: SETUP DE CONTAS CLOUD (30 minutos)

### 1. Vercel (Frontend Hosting) - GRÁTIS ⭐
**Tempo:** 5 minutos

1. Acessar: https://vercel.com/signup
2. Login com GitHub
3. Importar repositório ICARUS
4. Deploy automático!

**Ou via CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /Users/daxmeneghel/icarus-v5.0
vercel

# Deploy produção
vercel --prod
```

**Resultado:** URL pública (ex: `icarus-v5.vercel.app`)

---

### 2. RunPod (Ollama GPU Cloud) - ~$30-50/mês
**Tempo:** 10 minutos

1. Acessar: https://runpod.io/console/signup
2. Add Credits ($10 mínimo)
3. Pods > Deploy > Template Gallery
4. Buscar "Ollama" ou "Text Generation Web UI"
5. Configurar:
   - **GPU:** RTX 3090 ($0.34/hora) ou A4000 ($0.29/hora)
   - **Network:** Enable HTTP Ports (11434)
   - **Persistent Storage:** 20GB
6. Deploy Pod

**Após deploy:**
```bash
# Acessar terminal do pod
ollama pull llama3.1:8b    # 4.7GB
ollama pull mistral:7b      # 4.1GB

# Testar
curl http://localhost:11434/api/tags
```

**Copiar URL pública:** `https://xxxxx-11434.proxy.runpod.net`

**💡 ALTERNATIVA MAIS BARATA: OpenRouter**
```bash
# Acessar: https://openrouter.ai
# Criar conta
# Credits > Add $5-10
# API Keys > Create Key
# Modelo Llama 3.1 8B: $0.06/1M tokens (~$5-10/mês)
```

---

### 3. Upstash Redis (Queue/Cache) - GRÁTIS
**Tempo:** 5 minutos

1. Acessar: https://upstash.com/
2. Sign Up (GitHub/Google)
3. Create Database > Redis
   - **Name:** icarus-queue
   - **Region:** Escolher mais próximo dos usuários
   - **Type:** Regional (grátis)
4. Copy REST URL + REST Token

**Resultado:**
```
REST URL: https://xxxxx.upstash.io
REST Token: xxxxx
```

---

### 4. Resend (Email) - GRÁTIS
**Tempo:** 5 minutos

1. Acessar: https://resend.com/signup
2. Sign Up
3. Domains > Add Domain (ou usar sandbox para testes)
4. API Keys > Create API Key
5. Copy Key: `re_xxxxxxxxxxxxx`

**Free Tier:** 3,000 emails/mês

---

### 5. PostHog (Analytics) - GRÁTIS
**Tempo:** 5 minutos

1. Acessar: https://posthog.com/signup
2. Sign Up (GitHub/Google)
3. Create Organization > Create Project
4. Project Settings > Project API Key
5. Copy: `phc_xxxxxxxxxxxxx`

**Free Tier:** 1M events/mês

---

### 6. Sentry (Error Tracking) - GRÁTIS
**Tempo:** 5 minutos

1. Acessar: https://sentry.io/signup
2. Sign Up (GitHub/Google)
3. Create Project > Platform: React
4. Copy DSN: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

**Free Tier:** 5,000 errors/mês

---

## 🔧 FASE 2: CONFIGURAR ENVIRONMENT VARIABLES (15 minutos)

### Opção A: Via Vercel Dashboard (RECOMENDADO)

1. Acessar: https://vercel.com/seu-usuario/icarus/settings/environment-variables
2. Adicionar cada variável abaixo:
   - **Key:** Nome da variável
   - **Value:** Valor copiado
   - **Environments:** Production, Preview, Development

### Opção B: Via CLI

```bash
vercel env add VITE_OLLAMA_URL
# Cole: https://xxxxx-11434.proxy.runpod.net

vercel env add VITE_RESEND_API_KEY
# Cole: re_xxxxxxxxxxxxx

# Repetir para todas as variáveis
```

### 📝 Variáveis Necessárias:

```bash
# ==============================================
# FRONTEND + BACKEND
# ==============================================

# App
VITE_APP_URL=https://seu-app.vercel.app
VITE_ENVIRONMENT=production
VITE_RELEASE=v5.0.0

# Supabase (copiar do dashboard Supabase)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...

# ==============================================
# OSS SERVICES CLOUD
# ==============================================

# Ollama (RunPod)
VITE_OLLAMA_URL=https://xxxxx-11434.proxy.runpod.net
VITE_OLLAMA_DEFAULT_MODEL=llama3.1:8b

# Ou OpenRouter (alternativa)
# VITE_OPENROUTER_API_KEY=sk-or-xxxxx
# VITE_LLM_PROVIDER=openrouter

# Upstash Redis
VITE_UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
VITE_UPSTASH_REDIS_REST_TOKEN=xxxxx

# Resend (Email)
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxx

# PostHog (Analytics)
VITE_POSTHOG_API_KEY=phc_xxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# BrasilAPI (sem config - API pública gratuita)
# Nenhuma variável necessária!
```

---

## 🚀 FASE 3: DEPLOY (10 minutos)

### Método 1: Git Push (Automático) ⭐ RECOMENDADO

```bash
cd /Users/daxmeneghel/icarus-v5.0

# Commit mudanças
git add .
git commit -m "Setup cloud deployment with all services"

# Push para GitHub
git push origin main

# Vercel detecta e faz deploy automático!
# Acompanhar em: https://vercel.com/dashboard
```

### Método 2: CLI Direto

```bash
cd /Users/daxmeneghel/icarus-v5.0

# Build local (testar)
npm run build

# Deploy preview
vercel

# Deploy produção
vercel --prod
```

**Tempo de build:** ~2-3 minutos  
**URL final:** `https://icarus-v5.vercel.app` (ou domínio custom)

---

## ✅ FASE 4: VALIDAÇÃO (15 minutos)

### 1. Testar Frontend
```bash
# Abrir browser
open https://seu-app.vercel.app

# Verificar:
✅ Página carrega (sem erros 404)
✅ Login funcionando
✅ Dashboard renderiza
✅ Módulos acessíveis
✅ Neumorphism aplicado (dark mode)
```

### 2. Testar Services Cloud
```bash
# Acessar: https://seu-app.vercel.app/monitoring

# Dashboard deve mostrar:
✅ Ollama (RunPod): Online (ou OpenRouter configured)
✅ BrasilAPI: Online
✅ Upstash Redis: Online
✅ Resend: Configured
✅ PostHog: Configured
✅ Sentry: Configured
```

### 3. Testes Funcionais

#### A. Auto-preenchimento CNPJ (BrasilAPI)
1. Ir para: Cadastros > Fornecedores
2. Digitar CNPJ: `00.000.000/0001-91` (exemplo)
3. Tab out (blur)
4. ✅ Razão social, endereço, cidade, UF preenchidos automaticamente

#### B. Auto-preenchimento CEP (BrasilAPI)
1. Mesma tela
2. Digitar CEP: `01310-100`
3. Tab out
4. ✅ Endereço, bairro, cidade, UF preenchidos

#### C. Envio de Email (Resend)
1. Abrir Console do navegador (F12)
2. Executar:
```javascript
import { resendService } from '@/lib/email/resend.service';
await resendService.sendEmail({
  to: 'seu-email@example.com',
  subject: 'Teste ICARUS',
  html: '<h1>Funcionando!</h1>'
});
```
3. ✅ Verificar email recebido

#### D. Analytics (PostHog)
1. Navegar pelo sistema (várias páginas)
2. Acessar: https://posthog.com/dashboard
3. ✅ Ver eventos sendo capturados

#### E. Error Tracking (Sentry)
1. Forçar erro no console:
```javascript
throw new Error('Teste Sentry');
```
2. Acessar: https://sentry.io/issues
3. ✅ Ver erro capturado

#### F. Queue (Upstash Redis)
1. Console do navegador:
```javascript
import { upstashRedis } from '@/lib/queue/upstash.adapter';
await upstashRedis.set('test', 'hello');
const value = await upstashRedis.get('test');
console.log(value); // "hello"
```
2. ✅ Verificar funcionamento

---

## 🎨 FASE 5: DOMÍNIO CUSTOM (Opcional - 15 minutos)

### Adicionar Domínio Próprio

1. **Comprar domínio** (ex: Namecheap, GoDaddy, Registro.br)
2. **Vercel Dashboard:**
   - Settings > Domains
   - Add Domain: `icarus.suaempresa.com.br`
3. **Configurar DNS:**
   - Tipo: CNAME
   - Name: `icarus` (ou `@` para root)
   - Value: `cname.vercel-dns.com`
4. **Aguardar propagação:** 5-30 minutos
5. ✅ HTTPS automático (Let's Encrypt)

---

## 💰 CUSTOS MENSAIS ESTIMADOS

| Serviço | Free Tier | Estimativa Real |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth | $0 |
| **Supabase** | 500MB DB + 2GB storage | $0 |
| **RunPod Ollama** | - | $30-100 |
| **OpenRouter** (alt) | - | $5-15 |
| **Upstash Redis** | 10k requests/dia | $0 |
| **Resend** | 3k emails/mês | $0 |
| **PostHog** | 1M events/mês | $0 |
| **Sentry** | 5k errors/mês | $0 |
| **BrasilAPI** | Ilimitado | $0 |
| **TOTAL** | - | **$30-100/mês** |

**Com OpenRouter:** **$5-15/mês** 🎯

---

## 🔄 FASE 6: CI/CD AUTOMÁTICO (Configurado!)

### Deploy Automático via Git

✅ **Push to main** → Deploy produção  
✅ **Push to develop** → Deploy preview  
✅ **Pull Request** → Deploy preview + preview URL

```bash
# Exemplo workflow
git checkout -b nova-feature
# ... fazer mudanças ...
git add .
git commit -m "Nova feature X"
git push origin nova-feature

# Criar PR no GitHub
# Vercel gera preview URL automático!
# Ex: https://icarus-v5-git-nova-feature.vercel.app
```

---

## 📊 MONITORAMENTO CONTÍNUO

### Dashboards Principais

1. **Vercel Analytics**
   - https://vercel.com/seu-projeto/analytics
   - Core Web Vitals
   - Performance scores
   - Visitor insights

2. **PostHog**
   - https://posthog.com/dashboard
   - User journeys
   - Feature usage
   - Funnels & retention

3. **Sentry**
   - https://sentry.io/issues
   - Error tracking
   - Performance issues
   - Release tracking

4. **Upstash**
   - https://console.upstash.com
   - Redis metrics
   - Queue statistics

5. **RunPod**
   - https://runpod.io/console
   - GPU usage
   - Cost tracking

---

## 🛡️ SEGURANÇA

### Checklist de Segurança ✅

✅ **HTTPS:** Forçado (Vercel automático)  
✅ **Environment Variables:** Nunca commitadas  
✅ **Supabase RLS:** Row Level Security ativo  
✅ **CORS:** Configurado no Supabase  
✅ **Rate Limiting:** Via Upstash  
✅ **Error Tracking:** Sentry PII scrubbing  
✅ **Analytics:** PostHog GDPR mode

---

## 🔧 TROUBLESHOOTING

### Problema: Build falha no Vercel
```bash
# Verificar logs
vercel logs

# Build local para debug
npm run build

# Verificar variáveis de ambiente
vercel env ls
```

### Problema: Ollama não responde
```bash
# Verificar RunPod pod status
# Reiniciar pod se necessário

# Testar diretamente
curl https://seu-pod-11434.proxy.runpod.net/api/tags
```

### Problema: Emails não chegam (Resend)
```bash
# Verificar API key
# Dashboard Resend > Logs
# Verificar domínio verificado
```

### Problema: Analytics não captura eventos (PostHog)
```bash
# Verificar API key no console
console.log(import.meta.env.VITE_POSTHOG_API_KEY)

# Verificar network tab (F12)
# Filtrar por "posthog.com"
```

---

## 🎉 DEPLOYMENT COMPLETO!

### URLs Importantes

📱 **Aplicação:** https://seu-app.vercel.app  
📊 **Vercel Dashboard:** https://vercel.com/dashboard  
🔍 **PostHog Analytics:** https://posthog.com  
🐛 **Sentry Errors:** https://sentry.io  
🚀 **RunPod GPU:** https://runpod.io/console  
📧 **Resend Emails:** https://resend.com  
💾 **Upstash Redis:** https://console.upstash.com

---

## 📞 SUPORTE

**Documentação completa:**
- `docs/orquestrador/ESTRATEGIA_100_CLOUD.md`
- `docs/orquestrador/GUIA_DEPLOYMENT.md`
- `README.md`

**Problemas?**
- Verificar `docs/orquestrador/TROUBLESHOOTING.md`
- Logs Vercel: `vercel logs`
- Sentry Issues: https://sentry.io

---

© 2025 ICARUS v5.0  
**100% Cloud. Zero Docker. Production Ready.**

**Deployment time:** ~2 horas  
**Monthly cost:** $5-100  
**Uptime:** 99.9% SLA  
**Scale:** Global CDN  
**Users:** Unlimited

