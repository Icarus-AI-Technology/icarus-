# 🔒 Guia de Configuração - GitHub Secrets

## ⚠️ AÇÃO NECESSÁRIA

Os workflows estão configurados para usar **GitHub Secrets**, mas você precisa adicioná-los ao repositório.

---

## 📋 Passo a Passo

### 1. Acessar GitHub Repository Settings

1. Vá para: https://github.com/Icarus-AI-Technology/icarus-/settings/secrets/actions
2. Ou navegue manualmente:
   - Abra o repositório no GitHub
   - Clique em **Settings** (canto superior direito)
   - No menu lateral, clique em **Secrets and variables** → **Actions**

---

### 2. Adicionar os 2 Secrets Necessários

#### Secret 1: VITE_SUPABASE_URL

- **Nome:** `VITE_SUPABASE_URL`
- **Valor:** `https://gvbkviozlhxorjoavmky.supabase.co`

**Como adicionar:**
1. Clique em **New repository secret**
2. Em **Name**, digite: `VITE_SUPABASE_URL`
3. Em **Secret**, cole: `https://gvbkviozlhxorjoavmky.supabase.co`
4. Clique em **Add secret**

---

#### Secret 2: VITE_SUPABASE_ANON_KEY

- **Nome:** `VITE_SUPABASE_ANON_KEY`
- **Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8`

**Como adicionar:**
1. Clique em **New repository secret**
2. Em **Name**, digite: `VITE_SUPABASE_ANON_KEY`
3. Em **Secret**, cole o JWT token acima
4. Clique em **Add secret**

---

### 3. Verificar Configuração

Após adicionar os secrets, você deverá ver algo assim:

```
VITE_SUPABASE_URL          ••••••••••••••••••••  Updated X seconds ago
VITE_SUPABASE_ANON_KEY     ••••••••••••••••••••  Updated X seconds ago
```

---

## 🔄 Testar a Configuração

Depois de adicionar os secrets:

1. **Opção 1 - Re-run Failed Workflow:**
   ```bash
   gh run list --limit 1
   gh run rerun <RUN_ID>
   ```

2. **Opção 2 - Fazer um Commit Vazio:**
   ```bash
   git commit --allow-empty -m "test: trigger CI with GitHub Secrets"
   git push
   ```

---

## ✅ Resultado Esperado

Após configurar os secrets:
- ✅ Workflows irão buildar com sucesso
- ✅ Credenciais Supabase estarão seguras
- ✅ Deploy Vercel funcionará corretamente

---

## 🔐 Segurança

**Por que usar Secrets?**
- ✅ Credenciais não aparecem no código
- ✅ Não aparecem no histórico do Git
- ✅ Não aparecem nos logs do GitHub Actions
- ✅ Podem ser rotacionadas facilmente
- ✅ Controle de acesso granular

**Token ANON_KEY é seguro para uso público:**
- É um JWT público (role: anon)
- Expira em 2078
- Row Level Security (RLS) protege os dados
- Sem acesso a operações administrativas

---

## 📞 Troubleshooting

### Erro: "Secret not found"
→ Verifique se o nome está EXATAMENTE como especificado (case-sensitive)

### Erro: "Invalid Supabase URL"
→ URL deve incluir `https://` e terminar em `.supabase.co`

### Workflow ainda falha
→ Aguarde 1-2 minutos após adicionar secrets
→ Re-run o workflow manualmente

---

## 🔗 Links Úteis

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Dashboard](https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api)
- [GitHub Actions - Current Runs](https://github.com/Icarus-AI-Technology/icarus-/actions)

