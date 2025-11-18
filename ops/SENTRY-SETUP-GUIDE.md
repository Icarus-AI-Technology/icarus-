# 📊 GUIA DE CONFIGURAÇÃO - SENTRY

**Data:** 28 de Outubro de 2025  
**Versão:** 5.0.1 + CEO Intelligence Module  
**Ambiente:** Staging → Produção

---

## 🎯 Objetivo

Este guia fornece instruções completas para configurar o Sentry para monitoring e error tracking no ICARUS v5.0.1.

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta Sentry criada ([sentry.io](https://sentry.io))
- [ ] Projeto ICARUS com frontend em React
- [ ] Acesso admin ao Sentry

---

## 🚀 PASSO A PASSO

### 1. CRIAR CONTA E ORGANIZAÇÃO

#### 1.1. Criar Conta no Sentry

1. Acesse: https://sentry.io/signup/
2. Escolha plano:
   - **Developer:** Gratuito (até 5K eventos/mês)
   - **Team:** $26/mês (50K eventos/mês)
   - **Business:** $80/mês (100K eventos/mês)

**Recomendação para ICARUS:**
- Staging: Developer (gratuito)
- Produção: Team ($26/mês)

#### 1.2. Criar Organização

- [ ] **Organization Name:** `icarus` ou nome da sua empresa
- [ ] **URL Slug:** `icarus` (ficará: `https://icarus.sentry.io`)

---

### 2. CRIAR PROJETOS

#### 2.1. Projeto Staging

1. No dashboard, clique em **"Create Project"**
2. Configurar:
   - [ ] **Platform:** React
   - [ ] **Project Name:** `icarus-staging`
   - [ ] **Team:** Default (ou criar "ICARUS Team")
   - [ ] **Alert Rule:** Default

3. Anotar **DSN** exibido:
   ```
   https://[key]@o[org-id].ingest.sentry.io/[project-id]
   ```

#### 2.2. Projeto Produção

Repetir processo acima com:
- [ ] **Project Name:** `icarus-production`

---

### 3. CONFIGURAR .ENV

#### 3.1. Adicionar DSN ao .env.staging

```env
# Sentry
VITE_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[staging-project-id]
VITE_SENTRY_ENVIRONMENT=staging
```

#### 3.2. Adicionar DSN ao .env.production

```env
# Sentry
VITE_SENTRY_DSN=https://[key]@o[org-id].ingest.sentry.io/[production-project-id]
VITE_SENTRY_ENVIRONMENT=production
```

---

### 4. INSTALAR DEPENDÊNCIAS

```bash
cd /Users/daxmeneghel/icarus-v5.0

# Instalar pacotes Sentry
pnpm add @sentry/react @sentry/tracing
```

---

### 5. INICIALIZAR SENTRY NO CÓDIGO

O código já está implementado em `src/lib/sentry.ts`. Apenas integre no `main.tsx`:

#### 5.1. Atualizar src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initSentry, ErrorBoundary } from './lib/sentry';
import './styles/index.css';

// Inicializar Sentry ANTES de renderizar o app
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<div>Ops! Algo deu errado.</div>}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

---

### 6. TESTAR INTEGRAÇÃO

#### 6.1. Teste Local

```bash
# 1. Configurar .env.local com DSN
cp .env.staging .env.local

# 2. Iniciar dev server
pnpm dev

# 3. No browser, abrir console e executar:
```

```javascript
// Testar captura de erro
throw new Error("Teste Sentry - Erro Manual");

// Testar captura de mensagem
Sentry.captureMessage("Teste Sentry - Mensagem", "info");
```

#### 6.2. Verificar no Dashboard

1. Acesse: https://sentry.io/organizations/icarus/issues/
2. Verificar se os eventos de teste aparecem
3. Tempo de propagação: ~1-2 segundos

---

### 7. CONFIGURAR ALERTAS

#### 7.1. Alertas Críticos

1. Vá em **Alerts** → **Create Alert Rule**
2. Configurar regras:

**Alerta 1: High Error Rate**
- [ ] **Alert Name:** `ICARUS - High Error Rate`
- [ ] **Condition:** When the issue is seen more than `100` times in `5 minutes`
- [ ] **Action:** Send notification to `#icarus-alerts` (Slack) + Email
- [ ] **Environment:** `staging, production`

**Alerta 2: Critical Errors**
- [ ] **Alert Name:** `ICARUS - Critical Errors`
- [ ] **Condition:** When error level is `fatal` or `error`
- [ ] **Action:** Immediately send to Email + SMS
- [ ] **Environment:** `production`

**Alerta 3: Performance Degradation**
- [ ] **Alert Name:** `ICARUS - Slow Pages`
- [ ] **Condition:** When transaction duration is `> 1000ms` for `P95`
- [ ] **Action:** Send to Slack
- [ ] **Environment:** `production`

#### 7.2. Configurar Integrações

**Slack:**
1. Vá em **Settings** → **Integrations** → **Slack**
2. Conectar workspace
3. Escolher canal: `#icarus-alerts`

**E-mail:**
1. Vá em **Settings** → **Teams** → [Seu time]
2. Adicionar membros e configurar notificações
3. E-mails recomendados:
   - alerts@icarus.com.br
   - dev-team@icarus.com.br

---

### 8. CONFIGURAR SOURCE MAPS

Para debugging preciso, configure source maps:

#### 8.1. Instalar Sentry CLI

```bash
npm install -g @sentry/cli

# Ou via pnpm
pnpm add -D @sentry/cli
```

#### 8.2. Criar .sentryclirc

```ini
[auth]
token=[seu-auth-token]

[defaults]
org=icarus
project=icarus-staging
```

**Obter Auth Token:**
1. Vá em **Settings** → **Account** → **API** → **Auth Tokens**
2. Criar token com permissões: `project:read`, `project:releases`

#### 8.3. Adicionar ao package.json

```json
{
  "scripts": {
    "build": "vite build",
    "build:sentry": "vite build && sentry-cli releases files $(sentry-cli releases propose-version) upload-sourcemaps ./dist"
  }
}
```

#### 8.4. Build com Source Maps

```bash
pnpm build:sentry
```

---

### 9. CONFIGURAR RELEASES

Rastrear deploys e versões:

#### 9.1. Criar Release

```bash
# Definir versão
export VERSION=$(sentry-cli releases propose-version)

# Criar release
sentry-cli releases new -p icarus-staging $VERSION

# Associar commits
sentry-cli releases set-commits --auto $VERSION

# Finalizar release
sentry-cli releases finalize $VERSION

# Deploy
sentry-cli releases deploys $VERSION new -e staging
```

#### 9.2. Automatizar no CI/CD

Adicionar ao `.github/workflows/deploy.yml`:

```yaml
- name: Create Sentry Release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: icarus
    SENTRY_PROJECT: icarus-staging
  run: |
    export VERSION=$(sentry-cli releases propose-version)
    sentry-cli releases new -p icarus-staging $VERSION
    sentry-cli releases set-commits --auto $VERSION
    sentry-cli releases finalize $VERSION
    sentry-cli releases deploys $VERSION new -e staging
```

---

### 10. CONFIGURAR SESSION REPLAY

#### 10.1. Habilitar no Código

Já configurado em `src/lib/sentry.ts`:

```typescript
new Sentry.Replay({
  maskAllText: true,        // Mascarar textos sensíveis
  blockAllMedia: true,      // Bloquear imagens/vídeos
})
```

#### 10.2. Ajustar Amostragem

```typescript
// Em src/lib/sentry.ts
replaysSessionSampleRate: 0.1,  // 10% das sessões
replaysOnErrorSampleRate: 1.0,  // 100% quando há erro
```

#### 10.3. Visualizar Replays

1. No dashboard, vá em **Issues** → [clique em um issue]
2. Aba **Replays** mostrará gravações das sessões

---

### 11. CONFIGURAR PERFORMANCE MONITORING

#### 11.1. Habilitar Transactions

Já configurado com `BrowserTracing`:

```typescript
integrations: [
  new BrowserTracing({
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/.*\.icarus\.com\.br/,
    ],
  }),
]
```

#### 11.2. Ajustar Sample Rate

```typescript
tracesSampleRate: ENVIRONMENT === 'production' ? 0.5 : 1.0,
```

- **Staging:** 100% (para capturar tudo)
- **Produção:** 50% (para reduzir custos)

#### 11.3. Visualizar Performance

1. Vá em **Performance** no dashboard
2. Ver métricas:
   - **Throughput:** Requisições por minuto
   - **P50/P75/P95:** Percentis de latência
   - **Apdex:** Satisfação do usuário
   - **Failure Rate:** Taxa de falhas

---

### 12. FILTRAR DADOS SENSÍVEIS

#### 12.1. Configurar beforeSend

Já implementado em `src/lib/sentry.ts`:

```typescript
beforeSend(event, hint) {
  // Remover cookies
  if (event.request) {
    delete event.request.cookies;
  }
  
  // Filtrar dados sensíveis de formulários
  if (event.request?.data) {
    const data = event.request.data;
    if (data.password) delete data.password;
    if (data.cpf) delete data.cpf;
    if (data.cnpj) delete data.cnpj;
  }
  
  return event;
}
```

#### 12.2. Adicionar Mais Filtros

```typescript
// Filtrar URLs sensíveis
if (event.request?.url?.includes('/api/auth/')) {
  return null; // Não enviar evento
}

// Mascarar valores em breadcrumbs
beforeBreadcrumb(breadcrumb, hint) {
  if (breadcrumb.data?.password) {
    breadcrumb.data.password = '***';
  }
  return breadcrumb;
}
```

---

### 13. CONFIGURAR CONTEXTO CUSTOMIZADO

#### 13.1. Identificar Usuário

Já implementado em `src/lib/sentry.ts`:

```typescript
import { identifyUser } from '@/lib/sentry';

// Após login bem-sucedido
identifyUser({
  id: user.id,
  email: user.email,
  nome: user.nome,
  empresa_id: user.empresa_id,
  perfil: user.perfil,
});
```

#### 13.2. Adicionar Contexto Extra

```typescript
import { setContext, setTag } from '@/lib/sentry';

// Adicionar contexto de negócio
setContext('cirurgia', {
  id: cirurgia.id,
  hospital: cirurgia.hospital_nome,
  valor_total: cirurgia.valor_total,
});

// Adicionar tags para filtrar
setTag('modulo', 'cirurgias');
setTag('tipo_usuario', 'medico');
```

---

### 14. MONITORAMENTO DE API EXTERNA

#### 14.1. Capturar Erros de APIs

```typescript
try {
  const response = await fetch('https://api.externa.com/data');
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
} catch (error) {
  captureError(error, {
    api_url: 'https://api.externa.com/data',
    status_code: response?.status,
  });
}
```

---

### 15. DASHBOARD PERSONALIZADO

#### 15.1. Criar Custom Dashboard

1. Vá em **Dashboards** → **Create Dashboard**
2. Adicionar widgets:
   - [ ] **Total Errors (Last 24h)**
   - [ ] **Error Rate by Environment**
   - [ ] **Top 10 Issues**
   - [ ] **P95 Response Time**
   - [ ] **Users Affected**

#### 15.2. Compartilhar Dashboard

- Link público: https://icarus.sentry.io/dashboards/icarus-v5/
- Incorporar em Slack/Notion

---

### 16. CHECKLIST FINAL

- [ ] ✅ Conta Sentry criada
- [ ] ✅ Projetos staging e produção criados
- [ ] ✅ DSN configurado em .env
- [ ] ✅ Pacotes instalados (`@sentry/react`)
- [ ] ✅ Sentry inicializado no código
- [ ] ✅ Teste manual realizado e eventos capturados
- [ ] ✅ Alertas configurados (High Error Rate, Critical Errors)
- [ ] ✅ Integrações ativas (Slack, E-mail)
- [ ] ✅ Source maps configurados
- [ ] ✅ Releases configuradas
- [ ] ✅ Session Replay ativo
- [ ] ✅ Performance Monitoring ativo
- [ ] ✅ Dados sensíveis filtrados
- [ ] ✅ Contexto customizado implementado
- [ ] ✅ Dashboard personalizado criado

---

## 📊 MÉTRICAS RECOMENDADAS

### KPIs para Monitorar

| Métrica | Meta | Ação se Ultrapassar |
|---------|------|---------------------|
| **Error Rate** | < 1% | Investigar imediatamente |
| **P95 Response Time** | < 500ms | Otimizar queries/código |
| **Apdex Score** | > 0.8 | Melhorar UX |
| **Resolved Issues** | > 90% | Priorizar bugs antigos |
| **New Issues/Day** | < 5 | Revisar quality gates |

---

## 🆘 TROUBLESHOOTING

### Eventos não aparecem no Sentry
**Solução:**
1. Verificar DSN está correto
2. Verificar `initSentry()` é chamado antes do React render
3. Checar console do browser por erros do Sentry
4. Testar com: `Sentry.captureMessage("Test")`

### Source maps não funcionam
**Solução:**
1. Verificar `sentry-cli` está instalado
2. Verificar `.sentryclirc` tem token válido
3. Rodar build com `pnpm build:sentry`
4. Verificar uploads: `sentry-cli releases files list $VERSION`

### Performance Monitoring não aparece
**Solução:**
1. Verificar `BrowserTracing` está no `integrations`
2. Verificar `tracesSampleRate > 0`
3. Gerar tráfego no app (pode levar alguns minutos)

---

## 📚 REFERÊNCIAS

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Releases](https://docs.sentry.io/product/releases/)

---

## 🎉 PRÓXIMOS PASSOS

Após completar este guia:
1. ✅ Monitorar dashboard diariamente (primeira semana)
2. ✅ Ajustar alertas baseado em volume real
3. ✅ Criar runbook para resposta a incidentes
4. ✅ Treinar equipe sobre Sentry

---

**ICARUS v5.0.1 - Sistema Enterprise OPME**  
**Powered by AI • Built with ❤️ • Made in Brazil 🇧🇷**

---

*Documento atualizado em: 28 de Outubro de 2025*  
*Versão: 1.0*

