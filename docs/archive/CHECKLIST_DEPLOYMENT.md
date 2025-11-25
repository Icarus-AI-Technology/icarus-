# ✅ CHECKLIST COMPLETO - SUPABASE DEPLOYMENT

## 📊 Status Geral

| Item | Status | Como Fazer |
|------|--------|-----------|
| 1. Secrets Supabase | ✅ Configurado | Via Supabase Dashboard |
| 2. Admin Inicial | ✅ Criado | Edge Function `create-admin` |
| 3. Storage Buckets | 🔄 Pendente | Script ou SQL (ver abaixo) |
| 4. RLS Policies Storage | ⏭️ Opcional | Já nas migrations |
| 5. Variáveis Vercel | 🔄 Pendente | Ver guia abaixo |

---

## 🪣 3. CRIAR STORAGE BUCKETS

### Opção A: Script Automatizado (Recomendado)

```bash
./scripts/create-storage-buckets.sh
```

Quando solicitado, cole a **SERVICE_ROLE_KEY** de:
https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api

### Opção B: SQL Direto

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
2. Copie o conteúdo de: `supabase/migrations/CREATE_STORAGE_BUCKETS.sql`
3. Cole e execute

### ✅ Verificação

Após executar, verifique:
- **Dashboard:** https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/storage/buckets
- Deve haver **5 buckets** criados

---

## 🌐 5. CONFIGURAR VARIÁVEIS NA VERCEL

### Passo 1: Obter as Credenciais

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### Passo 2: Adicionar na Vercel

1. Acesse: https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables
2. Adicione as seguintes variáveis (Production + Preview + Development):

```bash
VITE_SUPABASE_URL=https://gvbkviozlhxorjoavmky.supabase.co
VITE_SUPABASE_ANON_KEY=<cole-aqui-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<cole-aqui-service-role-key>
```

### Passo 3: Redeploy

```bash
vercel --prod
```

Ou via dashboard Vercel:
- Vá em **Deployments** → **⋯** (três pontos) → **Redeploy**

---

## 🔐 4. RLS POLICIES PARA STORAGE (Opcional)

As policies já foram aplicadas nas migrations, mas se precisar reaplicar:

1. Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql
2. Execute o SQL de: `supabase/migrations/0005_storage_policies.sql`

---

## 🧪 TESTE FINAL

### 1. Teste Local

```bash
pnpm dev
```

- Acesse: http://localhost:5173
- Tente fazer login
- Verifique se dados carregam

### 2. Teste Produção

- Acesse: https://icarus-oficial-daxs-projects-5db3d203.vercel.app
- Teste login e funcionalidades

### 3. Métricas Vercel

- **Analytics:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/analytics
- **Speed Insights:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/speed-insights

---

## 📝 ARQUIVOS DE REFERÊNCIA

| Arquivo | Propósito |
|---------|-----------|
| `STORAGE_BUCKETS_GUIDE.md` | Guia detalhado Storage |
| `PROXIMOS_PASSOS_OPCIONAIS.md` | Config manual Vercel |
| `VERCEL_DEPLOYMENT_SUCCESS.md` | Status deploy Vercel |
| `SUPABASE_DEPLOYMENT_GUIDE.md` | Guia completo Supabase |
| `scripts/create-storage-buckets.sh` | Automação buckets |
| `supabase/migrations/CREATE_STORAGE_BUCKETS.sql` | SQL buckets |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. ✅ Criar Storage Buckets (execute script)
2. ✅ Configurar Variáveis na Vercel
3. ✅ Redeploy na Vercel
4. ✅ Testar aplicação em produção
5. ⬜ Monitorar métricas e logs

---

## 🆘 TROUBLESHOOTING

### Erro: "Bucket already exists"
- ✅ Normal! Significa que o bucket já foi criado

### Erro: "Unauthorized" ao criar buckets
- ❌ Verifique se colou a **SERVICE_ROLE_KEY** correta
- ❌ Verifique se a key não tem espaços no início/fim

### App não conecta ao Supabase
- ❌ Verifique se as variáveis estão na Vercel
- ❌ Faça redeploy após adicionar variáveis
- ❌ Limpe cache do navegador (Ctrl+Shift+R)

### Storage upload falha
- ❌ Verifique se os buckets foram criados
- ❌ Verifique se as RLS policies foram aplicadas
- ❌ Teste com usuário admin primeiro

---

## 📊 COMANDOS ÚTEIS

```bash
# Listar buckets (requer SERVICE_ROLE_KEY no .env)
curl -X GET https://gvbkviozlhxorjoavmky.supabase.co/storage/v1/bucket \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Deploy Vercel
vercel --prod

# Dev local
pnpm dev

# Build local
pnpm build

# Preview build
pnpm preview
```

---

**Projeto:** `gvbkviozlhxorjoavmky`  
**Vercel:** `icarus-oficial`  
**Status:** 🔄 Storage Buckets e Variáveis Vercel pendentes  
**Data:** 2025-11-17

