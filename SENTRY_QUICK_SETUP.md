# 🚀 CONFIGURAÇÃO RÁPIDA SENTRY - ICARUS

**Organização:** new-ortho-tecnologia-endocirur  
**Projeto:** react-native  
**Plataforma:** React (Web)

---

## ⚡ CONFIGURAÇÃO MANUAL (Recomendado para Vite + React)

O Sentry Wizard não suporta React puro via CLI, mas já implementamos tudo manualmente!

### ✅ O QUE JÁ ESTÁ PRONTO

- ✅ Código implementado em `src/lib/sentry.ts`
- ✅ Integração no `src/main.tsx`
- ✅ Dependências instaladas
- ✅ ErrorBoundary configurado

### 🔑 FALTA APENAS CONFIGURAR AS CREDENCIAIS

---

## 📋 PASSO A PASSO RÁPIDO

### 1. Obter DSN do Sentry

**Acesse:** https://sentry.io/organizations/new-ortho-tecnologia-endocirur/projects/react-native/

Se o projeto não existir, crie:
1. Vá em: https://sentry.io/organizations/new-ortho-tecnologia-endocirur/projects/new/
2. Plataforma: **JavaScript** ou **React**
3. Nome: `icarus-frontend` ou use o existente `react-native`
4. Copie o **DSN**

Exemplo de DSN:
```
https://abc123def456@o1234567.ingest.sentry.io/7654321
```

### 2. Configurar Variáveis na Vercel

**Acesse:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

**Adicionar:**

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_SENTRY_DSN` | `https://...@sentry.io/...` | Production, Preview, Development |
| `VITE_SENTRY_ORG` | `new-ortho-tecnologia-endocirur` | Production |
| `VITE_SENTRY_PROJECT` | `react-native` (ou `icarus-frontend`) | Production |
| `VITE_APP_VERSION` | `5.0.0` | Production, Preview, Development |
| `VITE_ENVIRONMENT` | `production` | Production |

### 3. (Opcional) Auth Token para Source Maps

**Se quiser source maps (recomendado):**

1. Acesse: https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
2. Create New Token
3. Scopes: `project:read`, `project:releases`, `org:read`
4. Copie o token
5. Adicione na Vercel:
   - `VITE_SENTRY_AUTH_TOKEN` = `seu_token_aqui`

### 4. Deploy

```bash
# Commit as mudanças
git add .
git commit -m "feat: add Sentry monitoring"
git push

# Ou deploy direto
vercel --prod
```

### 5. Testar

Após o deploy, abra o app em produção e execute no console do browser:

```javascript
// Testar erro
throw new Error('Teste Sentry - Funcionando!');
```

Verifique em:
https://sentry.io/organizations/new-ortho-tecnologia-endocirur/issues/

---

## 🧪 TESTE LOCAL (Opcional)

### Criar `.env.local`

```bash
# .env.local
VITE_SENTRY_DSN=https://seu_dsn_aqui@sentry.io/...
VITE_SENTRY_ORG=new-ortho-tecnologia-endocirur
VITE_SENTRY_PROJECT=react-native
VITE_APP_VERSION=5.0.0
VITE_ENVIRONMENT=development
VITE_SENTRY_DEV_MODE=true
```

### Rodar localmente

```bash
pnpm dev
```

No console do browser deve aparecer:
```
[Sentry] Inicializado com sucesso
```

---

## 📊 VERIFICAR INTEGRAÇÃO

### No Console do Browser (após deploy)

```javascript
// Deve estar disponível globalmente
Sentry

// Testar captura
throw new Error('Teste integração Sentry');

// Ou
import { captureMessage } from '@/lib/sentry';
captureMessage('Hello from ICARUS!', 'info');
```

### No Dashboard Sentry

1. Acesse: https://sentry.io/organizations/new-ortho-tecnologia-endocirur/issues/
2. Deve aparecer o erro "Teste integração Sentry"
3. Clique para ver detalhes:
   - Stack trace
   - Browser info
   - User info (se logado)
   - Breadcrumbs

---

## ✅ CHECKLIST FINAL

- [ ] Obter DSN do Sentry
- [ ] Adicionar `VITE_SENTRY_DSN` na Vercel
- [ ] Adicionar `VITE_SENTRY_ORG` na Vercel
- [ ] Adicionar `VITE_SENTRY_PROJECT` na Vercel
- [ ] Adicionar `VITE_APP_VERSION` na Vercel
- [ ] Adicionar `VITE_ENVIRONMENT=production` na Vercel
- [ ] (Opcional) Gerar e adicionar `VITE_SENTRY_AUTH_TOKEN`
- [ ] Deploy: `vercel --prod`
- [ ] Testar erro no browser
- [ ] Verificar erro no dashboard Sentry
- [ ] Configurar alertas (Slack/Email)

---

## 🎯 COMANDOS ÚTEIS

```bash
# Ver variáveis de ambiente
vercel env ls

# Adicionar variável
vercel env add VITE_SENTRY_DSN production

# Deploy
vercel --prod

# Build local para testar
pnpm build
pnpm preview
```

---

## 🔗 LINKS RÁPIDOS

- **Dashboard Sentry:** https://sentry.io/organizations/new-ortho-tecnologia-endocirur/
- **Projeto React Native:** https://sentry.io/organizations/new-ortho-tecnologia-endocirur/projects/react-native/
- **Auth Tokens:** https://sentry.io/orgredirect/organizations/:orgslug/settings/auth-tokens/
- **Vercel Env Vars:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

---

## 💡 DICAS

1. **Comece simples:** Apenas DSN é obrigatório
2. **Auth token:** Adicione depois se precisar de source maps
3. **Dev mode:** Use `VITE_SENTRY_DEV_MODE=true` para testar localmente
4. **Alertas:** Configure depois da primeira semana de uso

---

**Status:** ✅ Código pronto - ⏳ Aguardando apenas credenciais  
**Tempo:** ~15 minutos (só configuração)  
**Próximo passo:** Obter DSN e adicionar na Vercel

