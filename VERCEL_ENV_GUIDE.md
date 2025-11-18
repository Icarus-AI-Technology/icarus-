# Guia de Configuração - Variáveis de Ambiente Vercel

## 🎯 Quick Start (Mínimo para Funcionar)

### 1️⃣ Variáveis OBRIGATÓRIAS

Adicione estas no Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### 📍 Como Obter as Credenciais Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Settings → API
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## 🔧 Configuração no Vercel

### Via Dashboard (Recomendado)

1. Acesse seu projeto no Vercel
2. Settings → Environment Variables
3. Adicione cada variável:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://seu-projeto.supabase.co`
   - **Environments:** ✅ Production (✅ Preview ✅ Development opcional)
4. Clique em **Save**
5. **Redeploy** o projeto para aplicar

### Via CLI

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_URL
vercel env add NODE_ENV
```

---

## 📦 Variáveis por Categoria

### ✅ Essenciais (Mínimo)
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave pública Supabase
- `VITE_APP_URL` - URL do seu app Vercel
- `NODE_ENV` - Ambiente (production)

### 🎨 Recomendadas (Produção)
- `VITE_VERCEL_ANALYTICS_ID` - Analytics Vercel
- `VITE_ENABLE_ANALYTICS` - Habilitar analytics (true/false)

### 🔌 Integrações Opcionais
- `VITE_MEILISEARCH_HOST` - Busca inteligente
- `SENDGRID_API_KEY` - Envio de emails
- `TWILIO_ACCOUNT_SID` - SMS/WhatsApp
- `OPENAI_API_KEY` - GPT-4
- `ANTHROPIC_API_KEY` - Claude

### 🇧🇷 APIs Brasil (Gratuitas)
- `VITE_BRASILAPI_URL` - https://brasilapi.com.br/api
- `VITE_VIACEP_URL` - https://viacep.com.br/ws
- `VITE_RECEITAWS_URL` - https://www.receitaws.com.br/v1

---

## 🚀 Deploy Checklist

### Antes do Deploy

- [ ] Criar projeto no Supabase
- [ ] Copiar URL e Anon Key
- [ ] Preparar variáveis de ambiente

### Durante o Deploy

- [ ] Importar repositório no Vercel
- [ ] Adicionar variáveis essenciais
- [ ] Verificar Build Settings:
  - Framework Preset: **Vite**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install --legacy-peer-deps`

### Após o Deploy

- [ ] Verificar build bem-sucedido
- [ ] Testar URL do app
- [ ] Verificar login funciona
- [ ] Configurar domínio customizado (opcional)

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **Nunca** commite arquivos `.env` com valores reais
2. Use `.env.example` apenas como template
3. Adicione `.env*` no `.gitignore`
4. Rotacione keys periodicamente
5. Use diferentes keys para dev/prod

### ⚠️ Variáveis Públicas vs Privadas

**Públicas (VITE_)** - Expostas no browser:
```bash
VITE_SUPABASE_URL          # ✅ OK
VITE_SUPABASE_ANON_KEY     # ✅ OK (pública por design)
VITE_APP_URL               # ✅ OK
```

**Privadas (sem VITE_)** - Apenas no servidor:
```bash
SUPABASE_SERVICE_ROLE_KEY  # 🔒 Nunca exponha
OPENAI_API_KEY             # 🔒 Nunca exponha
SENDGRID_API_KEY           # 🔒 Nunca exponha
```

---

## 🐛 Troubleshooting

### Erro: "Supabase client not initialized"
```bash
# Verifique se adicionou:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Erro: "Build failed"
```bash
# Verifique Install Command:
npm install --legacy-peer-deps
```

### Variáveis não atualizando
```bash
# Após adicionar variáveis, faça redeploy:
Deployments → ... → Redeploy
```

---

## 📚 Arquivos de Referência

- `.env.production.example` - Todas as variáveis (completo)
- `.env.vercel.minimal` - Mínimo para funcionar
- `env.example` - Template geral

---

## 🆘 Suporte

**Documentação:**
- Vercel Env Vars: https://vercel.com/docs/environment-variables
- Supabase Setup: https://supabase.com/docs/guides/getting-started

**Dúvidas:**
Consulte a documentação do projeto no repositório.

