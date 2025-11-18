# 🔍 GUIA DE CONFIGURAÇÃO - SENTRY ERROR TRACKING

**Projeto:** ICARUS v5.0  
**Data:** 18/11/2025  
**Status:** ✅ IMPLEMENTADO - Aguardando Configuração

---

## 📋 O QUE FOI IMPLEMENTADO

### ✅ Frontend (React)
- ✅ Biblioteca `@sentry/react` instalada
- ✅ Integração no `src/lib/sentry.ts`
- ✅ Inicialização no `src/main.tsx`
- ✅ ErrorBoundary configurado
- ✅ Performance monitoring
- ✅ Session replay
- ✅ Browser profiling

### ⏳ Pendente
- ⏳ Criar conta no Sentry.io
- ⏳ Configurar DSN
- ⏳ Adicionar variáveis de ambiente
- ⏳ Deploy e teste

---

## 🚀 PASSO A PASSO - CONFIGURAÇÃO

### 1. Criar Conta no Sentry

**1.1. Acessar:** https://sentry.io/signup/

**1.2. Criar conta:**
- Email ou GitHub/Google
- Plan: **Developer** (Free - até 5k eventos/mês)

**1.3. Criar organização:**
- Nome: `Icarus AI` (ou nome da sua empresa)
- Slug: `icarus-ai` (será usado nas URLs)

### 2. Criar Projeto React

**2.1. No dashboard Sentry:**
- Clique em "Create Project"
- Platform: **React**
- Project Name: `icarus-frontend`
- Team: Default

**2.2. Copiar o DSN:**
```
https://abc123def456@o1234567.ingest.sentry.io/7654321
```

### 3. Gerar Auth Token (para Source Maps)

**3.1. Acessar:** Settings → Auth Tokens

**3.2. Criar novo token:**
- Name: `Vercel Deploy`
- Scopes:
  - ✅ `project:read`
  - ✅ `project:releases`
  - ✅ `org:read`
- Copiar o token gerado

### 4. Configurar Variáveis de Ambiente

#### 4.1. Local (.env.local)

Crie arquivo `.env.local`:

```bash
# Sentry
VITE_SENTRY_DSN=https://abc123def456@o1234567.ingest.sentry.io/7654321
VITE_SENTRY_AUTH_TOKEN=seu_auth_token_aqui
VITE_SENTRY_ORG=icarus-ai
VITE_SENTRY_PROJECT=icarus-frontend
VITE_APP_VERSION=5.0.0
VITE_ENVIRONMENT=development

# Para testar em dev (opcional)
VITE_SENTRY_DEV_MODE=true
```

#### 4.2. Vercel (Produção)

**Acessar:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

**Adicionar variáveis:**

| Nome | Valor | Ambientes |
|------|-------|-----------|
| `VITE_SENTRY_DSN` | (copiar do Sentry) | Production, Preview, Development |
| `VITE_SENTRY_AUTH_TOKEN` | (seu auth token) | Production |
| `VITE_SENTRY_ORG` | `icarus-ai` | Production |
| `VITE_SENTRY_PROJECT` | `icarus-frontend` | Production |
| `VITE_APP_VERSION` | `5.0.0` | Production, Preview, Development |
| `VITE_ENVIRONMENT` | `production` | Production |

### 5. Testar Localmente

```bash
# Com as variáveis configuradas em .env.local
pnpm dev
```

**No console do browser, deve aparecer:**
```
[Sentry] Inicializado com sucesso
```

**Testar captura de erro:**
```javascript
// No console do browser:
throw new Error('Teste Sentry');
```

**Verificar no Sentry:**
- Acesse: https://sentry.io/organizations/icarus-ai/issues/
- Deve aparecer o erro capturado

### 6. Deploy na Vercel

```bash
# Fazer commit das mudanças
git add .
git commit -m "feat: add Sentry error tracking"
git push

# Ou deploy direto
vercel --prod
```

---

## 📊 RECURSOS IMPLEMENTADOS

### 1. Error Tracking
```typescript
import { captureError } from '@/lib/sentry';

try {
  // código que pode falhar
} catch (error) {
  captureError(error as Error, {
    context: 'user_action',
    userId: user.id,
  });
}
```

### 2. Custom Messages
```typescript
import { captureMessage } from '@/lib/sentry';

captureMessage('Operação crítica realizada', 'warning');
```

### 3. Breadcrumbs (Rastro de Eventos)
```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb({
  category: 'auth',
  message: 'User logged in',
  level: 'info',
});
```

### 4. User Context
```typescript
import { setUser } from '@/lib/sentry';

// Após login
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Após logout
setUser(null);
```

### 5. Tags Customizadas
```typescript
import { setTag } from '@/lib/sentry';

setTag('empresa_id', empresaId);
setTag('user_role', userRole);
```

### 6. Contexto Extra
```typescript
import { setContext } from '@/lib/sentry';

setContext('cirurgia', {
  id: cirurgiaId,
  hospital: hospitalName,
  medico: medicoName,
});
```

---

## 🎯 FEATURES ATIVAS

### ✅ Performance Monitoring
- Tracking de performance de páginas
- Tempo de carregamento
- Network requests
- Database queries

**Sample Rate:** 10% em produção (economia)

### ✅ Session Replay
- Replay de sessões com erros
- Gravação de interações do usuário
- Útil para debug de issues complexos

**Sample Rate:**
- 10% das sessões normais
- 100% das sessões com erro

### ✅ Browser Profiling
- Profiling de performance
- Identificação de bottlenecks
- Análise de CPU usage

**Sample Rate:** 10% em produção

### ✅ Error Boundary
- Captura erros de React components
- Fallback UI amigável
- Detalhes do erro em dev mode

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### Filtros de Erros

Erros que são automaticamente ignorados:

- ✅ Erros de extensões de browser
- ✅ Erros de rede (NetworkError, Failed to fetch)
- ✅ Erros de timeout
- ✅ ResizeObserver loop (erro conhecido)
- ✅ Erros de URLs de extensões

### Ambientes

- **Development:** Erros não são enviados (padrão)
- **Production:** Todos os erros são enviados
- **Dev Mode:** Habilitar com `VITE_SENTRY_DEV_MODE=true`

### Sample Rates Configuráveis

Em `src/lib/sentry.ts`:

```typescript
// Performance Monitoring
tracesSampleRate: 0.1, // 10% em prod

// Session Replay
replaysSessionSampleRate: 0.1, // 10% geral
replaysOnErrorSampleRate: 1.0, // 100% com erro

// Profiling
profilesSampleRate: 0.1, // 10% em prod
```

---

## 💰 CUSTOS

### Plan Developer (FREE)
- ✅ 5.000 erros/mês
- ✅ 30 dias de retenção
- ✅ 1 projeto
- ✅ Performance monitoring
- ✅ Session replay (limitado)
- ✅ Email alerts

**Suficiente para:** Desenvolvimento e testes

### Plan Team ($26/mês)
- ✅ 50.000 erros/mês
- ✅ 90 dias de retenção
- ✅ Projetos ilimitados
- ✅ 500 replays/mês
- ✅ Slack/Discord alerts
- ✅ Custom tags e releases

**Recomendado para:** Produção pequena/média

### Plan Business ($80/mês)
- ✅ Erros ilimitados
- ✅ 1 ano de retenção
- ✅ 5.000 replays/mês
- ✅ Priority support
- ✅ SSO
- ✅ Data export

**Recomendado para:** Produção enterprise

---

## 📈 MONITORAMENTO

### Dashboard Principal

**Acessar:** https://sentry.io/organizations/icarus-ai/issues/

**Métricas disponíveis:**
- Total de erros
- Erros únicos
- Usuários afetados
- Erros por versão
- Erros por browser
- Erros por página

### Alertas

**Configurar em:** Settings → Alerts

**Alertas recomendados:**
- ⚠️ Erro novo detectado
- ⚠️ Spike de erros (>10 em 5min)
- ⚠️ Erro crítico em produção
- ⚠️ Performance degradada

### Integações

**Disponíveis:**
- Slack
- Discord
- Jira
- GitHub Issues
- PagerDuty

---

## 🧪 TESTES

### 1. Testar Error Tracking

```typescript
// No console do browser:
throw new Error('Teste Sentry - Error Tracking');
```

### 2. Testar ErrorBoundary

```typescript
// Criar componente que lança erro:
const BuggyComponent = () => {
  throw new Error('Teste Sentry - ErrorBoundary');
};
```

### 3. Testar Performance

```typescript
// Fazer várias navegações
// Verificar no Sentry → Performance
```

### 4. Testar Session Replay

```typescript
// Causar um erro e verificar o replay
// Sentry → Session Replay
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Instalar dependências
- [x] Criar `src/lib/sentry.ts`
- [x] Integrar no `src/main.tsx`
- [x] Adicionar ErrorBoundary
- [ ] **Criar conta Sentry.io** ← PRÓXIMO
- [ ] **Configurar projeto React** ← PRÓXIMO
- [ ] **Copiar DSN** ← PRÓXIMO
- [ ] **Gerar Auth Token** ← PRÓXIMO
- [ ] **Adicionar env vars na Vercel** ← PRÓXIMO
- [ ] **Deploy e testar** ← PRÓXIMO
- [ ] Configurar alertas
- [ ] Integrar com Slack/Discord

---

## 🔗 LINKS ÚTEIS

- **Sentry.io:** https://sentry.io
- **Docs Sentry React:** https://docs.sentry.io/platforms/javascript/guides/react/
- **Dashboard (após config):** https://sentry.io/organizations/icarus-ai/
- **Vercel Env Vars:** https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables

---

## 📝 PRÓXIMOS PASSOS

1. **Agora:** Criar conta no Sentry.io
2. **Hoje:** Configurar projeto e DSN
3. **Hoje:** Adicionar env vars na Vercel
4. **Hoje:** Deploy e teste
5. **Esta semana:** Configurar alertas
6. **Este mês:** Integrar com Slack

---

**Status:** ✅ CÓDIGO IMPLEMENTADO - ⏳ AGUARDANDO CONFIGURAÇÃO  
**Tempo Estimado:** 30 minutos (configuração completa)  
**Prioridade:** Alta  
**Benefício:** Monitoramento proativo de erros em produção

