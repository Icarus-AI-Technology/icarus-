# 🔧 CONFIGURAÇÃO COMPLETA - PRÓXIMOS PASSOS OPCIONAIS

**Projeto:** ICARUS  
**Supabase Project:** gvbkviozlhxorjoavmky  
**Vercel Project:** icarus-make

---

## ✅ PASSOS CONCLUÍDOS

- [x] Build de produção
- [x] Deploy na Vercel
- [x] Speed Insights habilitado
- [x] Analytics habilitado
- [x] 16 Edge Functions deployadas no Supabase

---

## 📋 PRÓXIMOS PASSOS OPCIONAIS

### 1️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

#### Via Dashboard Vercel (RECOMENDADO)

**URL:** https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/environment-variables

**Variáveis Essenciais:**

| Nome | Valor | Onde Obter |
|------|-------|------------|
| `VITE_SUPABASE_URL` | `https://gvbkviozlhxorjoavmky.supabase.co` | - |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | [Dashboard Supabase → API](https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api) |
| `NODE_ENV` | `production` | - |

**Como adicionar:**

1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/environment-variables
2. Clique em: **Add New**
3. Preencha:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://gvbkviozlhxorjoavmky.supabase.co`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
4. Clique em: **Save**
5. Repita para `VITE_SUPABASE_ANON_KEY`

#### Via CLI (Alternativo)

```bash
# VITE_SUPABASE_URL
echo "https://gvbkviozlhxorjoavmky.supabase.co" | npx vercel env add VITE_SUPABASE_URL production
echo "https://gvbkviozlhxorjoavmky.supabase.co" | npx vercel env add VITE_SUPABASE_URL preview
echo "https://gvbkviozlhxorjoavmky.supabase.co" | npx vercel env add VITE_SUPABASE_URL development

# VITE_SUPABASE_ANON_KEY (obter do dashboard)
echo "eyJ..." | npx vercel env add VITE_SUPABASE_ANON_KEY production
echo "eyJ..." | npx vercel env add VITE_SUPABASE_ANON_KEY preview
echo "eyJ..." | npx vercel env add VITE_SUPABASE_ANON_KEY development
```

**Após configurar, faça redeploy:**
```bash
npx vercel --prod
```

---

### 2️⃣ CONFIGURAR DOMÍNIO CUSTOMIZADO

#### Adicionar Domínio

**Via Dashboard:**
1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/domains
2. Digite seu domínio (ex: `icarus.com.br`)
3. Clique em: **Add**
4. Siga as instruções de DNS

**Via CLI:**
```bash
npx vercel domains add icarus.com.br
```

#### Configurar DNS

**Se usar Cloudflare/Outros:**
1. Adicione registro CNAME:
   - **Name:** `@` ou `www`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** Automático

**Verificar:**
```bash
npx vercel domains ls
```

---

### 3️⃣ HABILITAR PREVIEW DEPLOYMENTS

#### Via Dashboard

**URL:** https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/git

**Configurações:**
- ✅ **Production Branch:** `main` (ou `master`)
- ✅ **Preview Deployments:** All branches
- ✅ **Automatic Deployment:** On
- ✅ **Deployment Protection:** Off (ou On para privacidade)

**Resultado:**
- Commits em `main` → Deploy em Produção
- Commits em outras branches → Deploy em Preview
- Pull Requests → Deploy automático + comentário no PR

---

### 4️⃣ CONFIGURAR CRON JOBS

Para executar Edge Functions periodicamente (ex: recalcular KPIs).

#### Criar vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/recalcular-kpis",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/refresh-views",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/cleanup-webhooks",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Criar API Routes:**

```typescript
// api/cron/recalcular-kpis.ts
export default async function handler(req: Request) {
  // Verificar token de autorização do Vercel
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Chamar Edge Function do Supabase
  const response = await fetch(
    'https://gvbkviozlhxorjoavmky.supabase.co/functions/v1/recalcular_kpis',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Adicionar CRON_SECRET:**
```bash
echo "$(openssl rand -base64 32)" | npx vercel env add CRON_SECRET production
```

---

### 5️⃣ CONFIGURAR SECRETS DO SUPABASE

Configurar secrets para Edge Functions:

```bash
# Admin inicial
supabase secrets set ADMIN_INITIAL_EMAIL=admin@icarus.com.br --project-ref gvbkviozlhxorjoavmky
supabase secrets set ADMIN_INITIAL_PASSWORD=<senha-forte> --project-ref gvbkviozlhxorjoavmky
supabase secrets set ADMIN_INITIAL_NAME="Administrador Sistema" --project-ref gvbkviozlhxorjoavmky

# Feature flags
supabase secrets set FF_AI_TUTOR_CIRURGIAS=true --project-ref gvbkviozlhxorjoavmky
supabase secrets set FF_TUTOR_CIRURGIAS=true --project-ref gvbkviozlhxorjoavmky
supabase secrets set FF_ML_QUEUE=true --project-ref gvbkviozlhxorjoavmky
supabase secrets set FF_EDR_RESEARCH=true --project-ref gvbkviozlhxorjoavmky
supabase secrets set FF_AGENT_ORCHESTRATION=true --project-ref gvbkviozlhxorjoavmky
```

**Verificar:**
```bash
supabase secrets list --project-ref gvbkviozlhxorjoavmky
```

---

### 6️⃣ CRIAR ADMIN INICIAL

Depois de configurar secrets, criar admin:

```bash
curl -X POST \
  https://gvbkviozlhxorjoavmky.supabase.co/functions/v1/create-admin \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json"
```

**Obter SERVICE_ROLE_KEY:**
https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api

---

### 7️⃣ APLICAR MIGRATIONS DO SUPABASE

As migrations precisam ser aplicadas via SQL Editor (requer senha do banco).

**URL:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql

**Arquivo:** `supabase/migrations/20250126_consolidated_all_tables.sql` (31.596 linhas)

**Como aplicar:**
1. Abra o SQL Editor
2. Clique em **New Query**
3. Cole o conteúdo do arquivo de migration
4. Execute (pode levar 5-10 minutos)
5. Valide: `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';`

**Resultado esperado:** ~100+ tabelas criadas

---

### 8️⃣ CONFIGURAR STORAGE BUCKETS

**URL:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/storage/buckets

**Buckets necessários:**

| Nome | Público | Tamanho Max | MIME Types |
|------|---------|-------------|------------|
| `documentos_cirurgias` | ❌ | 10 MB | PDF, JPG, PNG, XML |
| `documentos_fiscais` | ❌ | 50 MB | PDF, XML |
| `anexos_produtos` | ❌ | 5 MB | PDF, JPG, PNG |
| `avatares` | ✅ | 1 MB | JPG, PNG, WEBP |
| `icarus_new` | ❌ | 50 MB | Todos |

**Como criar:**
1. Acesse Storage → Buckets
2. Clique em **New Bucket**
3. Preencha os dados conforme tabela
4. Clique em **Create Bucket**

**Policies RLS:** Já incluídas nas migrations

---

### 9️⃣ HABILITAR SSL/HTTPS (Automático)

✅ **Já habilitado automaticamente pela Vercel**

- Certificado SSL gratuito via Let's Encrypt
- Renovação automática
- HTTPS forçado (HTTP → HTTPS redirect)
- HTTP/2 e HTTP/3 habilitados

**Verificar:**
```bash
curl -I https://icarus-make-c4eymlhkm-daxs-projects-5db3d203.vercel.app
```

---

### 🔟 CONFIGURAR CDN GLOBAL (Automático)

✅ **Já habilitado automaticamente pela Vercel**

**Edge Network:**
- 40+ regiões globais
- Cache automático de assets estáticos
- Smart routing para menor latência
- DDoS protection

**Cache headers configurados em:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🎯 CHECKLIST COMPLETO

### Supabase
- [x] Projeto criado: `gvbkviozlhxorjoavmky`
- [x] 16 Edge Functions deployadas
- [x] Types TypeScript gerados
- [ ] Secrets configurados
- [ ] Admin inicial criado
- [ ] Migrations aplicadas (via SQL Editor)
- [ ] Storage Buckets criados

### Vercel
- [x] Projeto deployado: `icarus-make`
- [x] Build concluído com sucesso
- [x] Production URL ativa
- [x] Speed Insights habilitado
- [x] Analytics habilitado
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio customizado (opcional)
- [ ] Preview Deployments configurados
- [ ] Cron Jobs (opcional)

### Monitoring
- [x] Speed Insights ativo
- [x] Analytics ativo
- [x] SSL/HTTPS automático
- [x] CDN global ativo
- [ ] Alertas configurados (opcional)
- [ ] Sentry integrado (opcional)

---

## 📊 COMANDOS ÚTEIS

### Vercel
```bash
# Redeploy
npx vercel --prod

# Ver logs
npx vercel logs

# Listar deployments
npx vercel ls

# Verificar variáveis
npx vercel env ls

# Pull variáveis localmente
npx vercel env pull .env.local
```

### Supabase
```bash
# Ver Edge Functions
supabase functions list

# Ver secrets
supabase secrets list --project-ref gvbkviozlhxorjoavmky

# Gerar types
supabase gen types typescript --linked > src/types/database.types.ts

# Status do projeto
supabase projects list
```

---

## 🚀 DEPLOY RÁPIDO (Após Configurar)

```bash
# 1. Fazer alterações no código
# 2. Commit
git add .
git commit -m "feat: nova feature"

# 3. Push (deploy automático)
git push origin main

# Ou deploy direto via CLI
npx vercel --prod
```

---

## 📞 LINKS RÁPIDOS

**Supabase:**
- Dashboard: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky
- API Settings: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api
- SQL Editor: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
- Functions: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/functions
- Storage: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/storage

**Vercel:**
- Dashboard: https://vercel.com/daxs-projects-5db3d203/icarus-make
- Deployments: https://vercel.com/daxs-projects-5db3d203/icarus-make/deployments
- Settings: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings
- Environment Variables: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/environment-variables
- Domains: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/domains
- Speed Insights: https://vercel.com/daxs-projects-5db3d203/icarus-make/speed-insights
- Analytics: https://vercel.com/daxs-projects-5db3d203/icarus-make/analytics

**Aplicação:**
- Production: https://icarus-make-c4eymlhkm-daxs-projects-5db3d203.vercel.app

---

## ✅ PRÓXIMO PASSO RECOMENDADO

**1. CONFIGURAR VARIÁVEIS DE AMBIENTE (Mais Importante)**

Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-make/settings/environment-variables

Adicione:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**2. APLICAR MIGRATIONS DO SUPABASE**

Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql

Cole e execute: `supabase/migrations/20250126_consolidated_all_tables.sql`

---

**Documento criado em:** 2025-11-17  
**Status:** Deployment concluído, configuração opcional pendente

