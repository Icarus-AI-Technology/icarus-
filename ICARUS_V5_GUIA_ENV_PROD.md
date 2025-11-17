# 🔐 Guia de Configuração - Ambiente de Produção (.env.prod)

**Data**: 27 de Outubro de 2025  
**Arquivo**: `.env.prod`  
**Status**: Template gerado, aguardando valores reais

---

## 📋 Variáveis Obrigatórias

### 1. **Supabase** (Essencial)

```bash
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

#### 🔍 Como Obter:

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### ⚠️ Importante:

- **NÃO use** a chave `service_role` no frontend
- A chave `anon` é segura para uso público
- RLS protegerá os dados

---

### 2. **Meilisearch** (Busca Inteligente)

```bash
VITE_MEILISEARCH_URL=https://search.your-domain.com
VITE_MEILISEARCH_KEY=<your-search-key>
```

#### 🔍 Como Configurar:

**Opção A: Meilisearch Cloud**

1. Acesse [Meilisearch Cloud](https://cloud.meilisearch.com)
2. Crie um projeto
3. Copie a URL e API Key

**Opção B: Self-Hosted**

```bash
# Docker
docker run -d \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  -e MEILI_MASTER_KEY=your-master-key \
  getmeili/meilisearch:latest

# URL será: https://seu-dominio.com:7700
```

**Opção C: Localhost (Dev Only)**

```bash
VITE_MEILISEARCH_URL=http://localhost:7700
```

---

### 3. **Ollama** (IA Local/Cloud)

```bash
VITE_OLLAMA_URL=https://ollama.your-domain.com
```

#### 🔍 Como Configurar:

**Opção A: Cloud (Replicate/Hugging Face)**

```bash
# Replicate
VITE_OLLAMA_URL=https://api.replicate.com
VITE_OLLAMA_TOKEN=<replicate-token>

# Hugging Face
VITE_OLLAMA_URL=https://api-inference.huggingface.co
VITE_OLLAMA_TOKEN=<hf-token>
```

**Opção B: Self-Hosted**

```bash
# Ollama em servidor próprio
VITE_OLLAMA_URL=https://ollama.your-server.com:11434
```

**Opção C: Localhost (Dev Only)**

```bash
VITE_OLLAMA_URL=http://localhost:11434
```

---

### 4. **Ambiente**

```bash
VITE_ENVIRONMENT=production
```

Valores possíveis:

- `development` - Desenvolvimento local
- `staging` - Ambiente de testes
- `production` - Produção

---

## 🔧 Variáveis Opcionais

### Email/SMTP (Notificações)

```bash
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASS=<sendgrid-api-key>
```

**Alternativas**:

- SendGrid
- Mailgun
- AWS SES
- Postmark

### Analytics

```bash
# Vercel Analytics
VITE_VERCEL_ANALYTICS_ID=<project-id>

# PostHog
VITE_POSTHOG_KEY=<posthog-key>
VITE_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
VITE_GA_ID=G-XXXXXXXXXX
```

### Sentry (Error Tracking)

```bash
VITE_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
VITE_SENTRY_ENVIRONMENT=production
```

### Limites e Configurações

```bash
# Rate Limiting
VITE_RATE_LIMIT_MAX=100
VITE_RATE_LIMIT_WINDOW=60000

# Cache
VITE_CACHE_TTL=3600
VITE_ENABLE_CACHE=true

# Features
VITE_ENABLE_AI=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_SEARCH=true
```

---

## 📝 Template Completo (.env.prod)

```bash
# ============================================
# ICARUS v5.0 - Produção
# Data: 27/10/2025
# ============================================

# Ambiente
VITE_ENVIRONMENT=production
NODE_ENV=production

# ============================================
# SUPABASE (Obrigatório)
# ============================================
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>

# ============================================
# MEILISEARCH (Obrigatório)
# ============================================
VITE_MEILISEARCH_URL=https://search.seu-dominio.com
VITE_MEILISEARCH_KEY=<sua-chave-search>

# ============================================
# OLLAMA / IA (Obrigatório)
# ============================================
VITE_OLLAMA_URL=https://ollama.seu-dominio.com
VITE_OLLAMA_TOKEN=<seu-token-opcional>

# ============================================
# EMAIL/SMTP (Opcional)
# ============================================
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASS=<sendgrid-api-key>

# ============================================
# ANALYTICS (Opcional)
# ============================================
VITE_VERCEL_ANALYTICS_ID=<vercel-analytics-id>
VITE_POSTHOG_KEY=<posthog-key>
VITE_POSTHOG_HOST=https://app.posthog.com

# ============================================
# SENTRY (Opcional)
# ============================================
VITE_SENTRY_DSN=<sentry-dsn>
VITE_SENTRY_ENVIRONMENT=production

# ============================================
# FEATURES FLAGS
# ============================================
VITE_ENABLE_AI=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_SEARCH=true
VITE_ENABLE_ANALYTICS=true

# ============================================
# LIMITES E CACHE
# ============================================
VITE_RATE_LIMIT_MAX=100
VITE_RATE_LIMIT_WINDOW=60000
VITE_CACHE_TTL=3600
VITE_ENABLE_CACHE=true

# ============================================
# URLs E DOMÍNIOS
# ============================================
VITE_APP_URL=https://icarus.seu-dominio.com
VITE_API_URL=https://api.seu-dominio.com
```

---

## 🔒 Segurança - Vercel

### Configurar Secrets na Vercel:

```bash
# Via CLI
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_MEILISEARCH_URL production
vercel env add VITE_MEILISEARCH_KEY production

# Ou via Dashboard:
# 1. Acesse vercel.com/dashboard
# 2. Selecione o projeto
# 3. Settings → Environment Variables
# 4. Adicione cada variável
```

---

## ✅ Checklist de Configuração

### Antes do Deploy:

- [ ] ✅ Supabase URL configurada
- [ ] ✅ Supabase Anon Key configurada
- [ ] ✅ Meilisearch URL configurada
- [ ] ✅ Ollama URL configurada
- [ ] 🔐 Secrets adicionados na Vercel
- [ ] 📝 .env.prod NÃO commitado no Git
- [ ] 🔍 Variáveis validadas localmente
- [ ] 🧪 Build teste executado

### Após Deploy:

- [ ] 🌐 App acessível na URL de produção
- [ ] 🔌 Supabase conectado corretamente
- [ ] 🔍 Busca funcionando (Meilisearch)
- [ ] 🤖 IA respondendo (Ollama)
- [ ] 📧 Emails sendo enviados (se configurado)
- [ ] 📊 Analytics coletando dados (se configurado)
- [ ] 🐛 Sentry recebendo erros (se configurado)

---

## 🧪 Validação Local

Antes de fazer deploy:

```bash
# 1. Copiar template
cp .env.prod .env.production

# 2. Editar com valores reais
nano .env.production

# 3. Validar
pnpm env:validate .env.production

# 4. Build de teste
pnpm build

# 5. Preview
pnpm preview
```

---

## 🚨 Troubleshooting

### Erro: "Supabase connection failed"

```bash
# Verificar URL e Key
curl -H "apikey: <sua-anon-key>" \
     <sua-supabase-url>/rest/v1/

# Deve retornar 200 OK
```

### Erro: "Meilisearch not responding"

```bash
# Verificar conexão
curl <sua-meilisearch-url>/health

# Deve retornar: {"status":"available"}
```

### Erro: "Environment variables not loaded"

```bash
# Verificar se está usando VITE_ prefix
# Vite só expõe variáveis com VITE_

# CORRETO
VITE_SUPABASE_URL=...

# ERRADO (não será exposto)
SUPABASE_URL=...
```

---

## 📚 Recursos

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Meilisearch Documentation](https://docs.meilisearch.com)

---

## 🔄 Atualização de Variáveis

```bash
# Vercel - Atualizar variável
vercel env rm VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_URL production

# Redeployar
vercel --prod
```

---

**Status**: ✅ Guia completo  
**Ação necessária**: Substituir placeholders com valores reais  
**Segurança**: Alta - Não commitar .env.prod no Git
