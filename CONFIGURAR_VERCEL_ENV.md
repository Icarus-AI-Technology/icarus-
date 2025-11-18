# 🚀 Guia de Configuração - Vercel Environment Variables

## ⚠️ URGENTE: Deploy está falhando por falta de variáveis de ambiente!

O deployment está com **"Rolled Back"** porque o Vercel não tem as credenciais do Supabase configuradas.

---

## 📋 Passo a Passo - Vercel Dashboard

### 1. Acessar Vercel Project Settings

1. Vá para: https://vercel.com/icarus-ai-technology/icarus-oficial/settings/environment-variables
2. Ou navegue manualmente:
   - Acesse: https://vercel.com
   - Clique no projeto **icarus-oficial**
   - Clique em **Settings**
   - No menu lateral, clique em **Environment Variables**

---

### 2. Adicionar as 2 Variáveis de Ambiente

#### Variável 1: VITE_SUPABASE_URL

- **Nome:** `VITE_SUPABASE_URL`
- **Valor:** `https://gvbkviozlhxorjoavmky.supabase.co`
- **Ambientes:** Marque todos:
  - ☑️ Production
  - ☑️ Preview
  - ☑️ Development

**Como adicionar:**
1. Clique em **Add New**
2. Em **Key**, digite: `VITE_SUPABASE_URL`
3. Em **Value**, cole: `https://gvbkviozlhxorjoavmky.supabase.co`
4. Marque todos os 3 ambientes (Production, Preview, Development)
5. Clique em **Save**

---

#### Variável 2: VITE_SUPABASE_ANON_KEY

- **Nome:** `VITE_SUPABASE_ANON_KEY`
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8`
- **Ambientes:** Marque todos:
  - ☑️ Production
  - ☑️ Preview
  - ☑️ Development

**Como adicionar:**
1. Clique em **Add New**
2. Em **Key**, digite: `VITE_SUPABASE_ANON_KEY`
3. Em **Value**, cole o JWT token acima (linha completa)
4. Marque todos os 3 ambientes
5. Clique em **Save**

---

### 3. Re-Deploy após Adicionar Variáveis

**Opção A - Via Dashboard (Recomendado):**
1. Vá para: https://vercel.com/icarus-ai-technology/icarus-oficial/deployments
2. Clique nos **...** (três pontos) do último deployment
3. Clique em **Redeploy**
4. Selecione **Use existing Build Cache** (opcional, mais rápido)
5. Clique em **Redeploy**

**Opção B - Via Git Push:**
```bash
cd /Users/daxmeneghel/icarus-make
git commit --allow-empty -m "chore: trigger Vercel redeploy with env vars"
git push origin release/v5.0-production-ready
```

**Opção C - Via CLI (se tiver Vercel CLI instalado):**
```bash
vercel --prod
```

---

## ✅ Verificar Configuração

Após adicionar as variáveis, você deverá ver algo assim na página de Environment Variables:

```
VITE_SUPABASE_URL          Production, Preview, Development     ht... (truncated)
VITE_SUPABASE_ANON_KEY     Production, Preview, Development     ey... (truncated)
```

---

## 🔄 Status do Deployment

Após re-deploy, o status deve mudar de:
- ❌ **Rolled Back** → ✅ **Ready**
- ❌ **404 NOT_FOUND** → ✅ **200 OK**

Aguarde 1-3 minutos para o build completar.

---

## 🎯 Resultado Esperado

Após configurar e fazer redeploy:
- ✅ Build compilará com sucesso
- ✅ Supabase Client se conectará corretamente
- ✅ Frontend estará 100% funcional
- ✅ URL funcionará: https://icarus-oficial.vercel.app

---

## 🔍 Troubleshooting

### Erro: "Failed to load environment variables"
→ Aguarde 30 segundos e tente redeployar novamente
→ Variáveis só são carregadas em novos builds

### Build ainda falha
→ Verifique se os nomes estão EXATAMENTE corretos (case-sensitive)
→ `VITE_SUPABASE_URL` (não `SUPABASE_URL`)
→ `VITE_SUPABASE_ANON_KEY` (não `SUPABASE_KEY`)

### 404 persiste
→ Verifique se o build gerou arquivos em `dist/`
→ Verifique se `vercel.json` está configurado corretamente
→ Pode ser necessário fazer "Undo Rollback" no Vercel

### Como fazer "Undo Rollback"?
1. Vá para: https://vercel.com/icarus-ai-technology/icarus-oficial
2. Na seção "Production Deployment", você verá um banner:
   "To undo the rollback promote to production or re-enable auto-assigning custom domains"
3. Clique em **"Undo Rollback"** (botão no canto inferior direito)
4. Ou faça um novo deploy (Opção A acima)

---

## 📊 Configuração Completa Necessária

Para o sistema funcionar 100%, você precisa configurar **ambos**:

1. ✅ **GitHub Secrets** (para workflows CI/CD)
   - Guia: `CONFIGURAR_GITHUB_SECRETS.md`

2. ✅ **Vercel Environment Variables** (para runtime do app)
   - Guia: Este arquivo

---

## 🔐 Segurança

**Por que precisamos configurar em 2 lugares?**

- **GitHub Secrets:**
  - Usado durante o **build nos GitHub Actions**
  - Workflows de CI/CD precisam buildar o projeto
  - Não tem acesso às env vars do Vercel

- **Vercel Environment Variables:**
  - Usado durante o **build e runtime no Vercel**
  - Injected no código via `import.meta.env`
  - Necessário para o app funcionar em produção

**É seguro?**
- ✅ Token ANON_KEY é público por design
- ✅ Row Level Security (RLS) protege os dados
- ✅ Vercel encripta as env vars
- ✅ Apenas visíveis para o owner do projeto

---

## 🔗 Links Úteis

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Dashboard - API Keys](https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api)
- [Vercel Project Dashboard](https://vercel.com/icarus-ai-technology/icarus-oficial)
- [Vercel Deployments](https://vercel.com/icarus-ai-technology/icarus-oficial/deployments)

---

## 📞 Próximos Passos

1. ✅ Adicionar variáveis no Vercel (este guia)
2. ✅ Adicionar secrets no GitHub (outro guia)
3. ✅ Fazer redeploy
4. ✅ Testar URL: https://icarus-oficial.vercel.app
5. ✅ Verificar que Supabase conecta corretamente

