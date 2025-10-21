# 📦 AUDITORIA DE DEPENDÊNCIAS — ICARUS v5.0

**Data:** 2025-10-20  
**Equipe:** AGENTE_EQUIPE_ECONOMIA_AI_TUTORES  
**Versão:** 1.0.0

---

## 🎯 OBJETIVO

Identificar **dependências pagas**, **OSS**, e **oportunidades de substituição** para alcançar a meta de **economia anual de US$ 3k-9k**.

---

## 📊 RESUMO EXECUTIVO

| Categoria | Quantidade | Custo Mensal | Status |
|-----------|------------|--------------|--------|
| **Dependências Produção** | 27 | US$ 0 | ✅ Todas OSS |
| **Dependências Dev** | 38 | US$ 0 | ✅ Todas OSS |
| **Serviços Externos** | ~8 | US$ 0-200+ | ⚠️ Não monitorado |

**Descoberta Crítica**: Todas as dependências npm são **gratuitas (OSS)**, mas os **serviços externos de API** (OpenAI, Claude, analytics) não estão monitorados e representam **risco alto de custos**.

---

## 🔍 ANÁLISE DETALHADA

### **1. DEPENDÊNCIAS DE PRODUÇÃO (27 pacotes)**

#### **✅ Mantidas (Core Business Logic)**

| Pacote | Versão | Uso | Custo | Alternativa |
|--------|--------|-----|-------|-------------|
| `react` | 18.3.1 | Framework UI | US$ 0 (OSS) | ❌ Nenhuma (core) |
| `react-dom` | 18.3.1 | Renderização | US$ 0 (OSS) | ❌ Nenhuma (core) |
| `react-router-dom` | 6.26.0 | Roteamento | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `@supabase/supabase-js` | 2.75.1 | Backend | US$ 0-25/mês | ⚠️ Self-hosted PG (complexo) |
| `axios` | 1.12.2 | HTTP Client | US$ 0 (OSS) | ✅ `fetch` nativo (ganho: -50KB) |
| `zod` | 4.1.12 | Validação | US$ 0 (OSS) | ❌ Nenhuma (essencial) |
| `react-hook-form` | 7.65.0 | Formulários | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `date-fns` | 2.30.0 | Datas | US$ 0 (OSS) | ⚠️ `Intl` nativo (ganho: -30KB) |
| `lucide-react` | 0.436.0 | Ícones | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `recharts` | 3.3.0 | Gráficos | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `sonner` | 2.0.7 | Toasts | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `tailwind-merge` | 2.5.2 | CSS utility | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `tailwindcss-animate` | 1.0.7 | Animações | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `class-variance-authority` | 0.7.0 | Variantes CSS | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `clsx` | 2.1.1 | CSS utility | US$ 0 (OSS) | ❌ Nenhuma (mantido) |
| `node-fetch` | 3.3.2 | Fetch (Node) | US$ 0 (OSS) | ✅ Nativo Node 18+ (ganho: -40KB) |

#### **🎨 Radix UI (16 pacotes)**

Todos os componentes Radix são **OSS** e mantidos:
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`
- `@radix-ui/react-tooltip`

**Análise**: Radix é **essencial** para acessibilidade WCAG AA. **Manter todos**.

#### **⚠️ Microsoft Graph (3 pacotes)**

| Pacote | Uso Atual | Custo | Recomendação |
|--------|-----------|-------|--------------|
| `@azure/msal-browser` | Auth Microsoft | US$ 0 (OSS) | ✅ Manter (se necessário) |
| `@microsoft/microsoft-graph-client` | Graph API | US$ 0 (OSS) | ⚠️ **Lazy load** (não é usado por todos) |
| `@microsoft/microsoft-graph-types` | Types | US$ 0 (OSS) | ✅ Manter |

**Ação**: Mover para **dynamic import** apenas quando usuário conectar Microsoft 365.

**Economia de bundle**: ~80KB gzipped

#### **🎯 DnD Kit (3 pacotes)**

| Pacote | Uso | Recomendação |
|--------|-----|--------------|
| `@dnd-kit/core` | Drag & Drop | ✅ Manter (usado em Kanban) |
| `@dnd-kit/sortable` | Ordenação | ✅ Manter |
| `@dnd-kit/utilities` | Utils | ✅ Manter |

**Análise**: Usado em módulos de Cirurgias (Kanban) e CRM. **Manter**.

---

### **2. DEPENDÊNCIAS DE DESENVOLVIMENTO (38 pacotes)**

#### **✅ Mantidas (Essenciais para QA)**

| Pacote | Uso | Custo | Recomendação |
|--------|-----|-------|--------------|
| `typescript` | Tipagem | US$ 0 (OSS) | ✅ Manter |
| `vite` | Build | US$ 0 (OSS) | ✅ Manter |
| `@vitejs/plugin-react-swc` | React plugin | US$ 0 (OSS) | ✅ Manter |
| `vitest` | Testes | US$ 0 (OSS) | ✅ Manter |
| `@vitest/ui` | UI testes | US$ 0 (OSS) | ✅ Manter |
| `playwright` | E2E | US$ 0 (OSS) | ✅ Manter |
| `@playwright/test` | Test runner | US$ 0 (OSS) | ✅ Manter |
| `eslint` | Linting | US$ 0 (OSS) | ✅ Manter |
| `prettier` | Formatação | US$ 0 (OSS) | ✅ Manter |
| `tailwindcss` | CSS | US$ 0 (OSS) | ✅ Manter |
| `postcss` | CSS processing | US$ 0 (OSS) | ✅ Manter |
| `autoprefixer` | CSS prefixes | US$ 0 (OSS) | ✅ Manter |

#### **⚠️ Storybook (10 pacotes)**

| Pacote | Tamanho | Uso Atual | Recomendação |
|--------|---------|-----------|--------------|
| `storybook` | ~50MB | Documentação componentes | ⚠️ **Opcional** (avaliar uso real) |
| `@storybook/react` | - | React adapter | ⚠️ Junto com storybook |
| `@storybook/addon-a11y` | - | Acessibilidade | ✅ Útil (se mantiver) |
| `@storybook/addon-essentials` | - | Addons base | ⚠️ Junto com storybook |

**Ação**: Se Storybook **não é usado ativamente**, remover economiza:
- **~50MB** de `node_modules`
- **-20s** de tempo de install
- **Simplicidade** no workflow

**Alternativa**: Documentar componentes com **JSDoc** + **testes visuais** (já temos Playwright).

#### **⚠️ Puppeteer (1 pacote)**

| Pacote | Uso | Recomendação |
|--------|-----|--------------|
| `puppeteer` | Screenshots | ⚠️ **DUPLICADO** com Playwright |

**Ação**: Remover `puppeteer`, usar apenas **Playwright** (já instalado).

**Economia**: ~300MB de Chromium duplicado.

---

## 🚨 SERVIÇOS EXTERNOS (Alto Risco de Custos)

### **Identificados no Código:**

| Serviço | Evidência | Custo Estimado | Status |
|---------|-----------|----------------|--------|
| **OpenAI** | Mencionado no README, 11 serviços IA | US$ 0-500+/mês | ⚠️ **NÃO MONITORADO** |
| **Anthropic (Claude)** | Mencionado no README | US$ 0-200+/mês | ⚠️ **NÃO MONITORADO** |
| **GPT Researcher** | `gpt-researcher-service.ts` | Desconhecido | ⚠️ **NÃO MONITORADO** |
| **Supabase** | Backend | US$ 0-25/mês | ✅ Free tier (monitorar storage) |
| **Google Analytics 4** | Mencionado (analytics) | US$ 0 | ✅ Gratuito |
| **Hotjar** | Mencionado (heatmaps) | US$ 0-39+/mês | ⚠️ **NÃO CONFIRMADO** |
| **Mixpanel** | Mencionado (events) | US$ 0-25+/mês | ⚠️ **NÃO CONFIRMADO** |
| **Pluggy** | DDA Bancário | US$ 0-?/mês | ⚠️ **NÃO CONFIRMADO** |

### **🎯 AÇÕES PRIORITÁRIAS**

1. **PRIORIDADE CRÍTICA**: Implementar **rate limiting** e **caching** para APIs de IA
2. **PRIORIDADE ALTA**: Configurar **Ollama local** para substituir 70-90% das chamadas OpenAI
3. **PRIORIDADE MÉDIA**: Auditar uso real de Hotjar/Mixpanel (considerar PostHog OSS)

---

## 💡 RECOMENDAÇÕES DE ECONOMIA

### **1. Remover/Substituir**

| Pacote | Ação | Economia |
|--------|------|----------|
| `axios` | Substituir por `fetch` nativo | -50KB bundle |
| `node-fetch` | Remover (Node 18+ tem fetch nativo) | -40KB bundle |
| `date-fns` | Substituir por `Intl` para casos simples | -30KB bundle |
| `puppeteer` | Remover (usar Playwright) | -300MB disk |
| `storybook` (se não usado) | Remover | -50MB disk, -20s install |

**Total bundle**: **-120KB gzipped** (~5% do bundle atual)  
**Total disk**: **-350MB** de `node_modules`

### **2. Lazy Load (Code Splitting)**

```typescript
// Antes (carrega sempre):
import { Client } from '@microsoft/microsoft-graph-client';

// Depois (carrega só quando necessário):
const graphClient = await import('@microsoft/microsoft-graph-client');
```

**Pacotes para lazy load:**
- `@microsoft/microsoft-graph-client` (-80KB)
- `recharts` (somente em dashboards, -60KB)
- Módulos raramente acessados

**Economia total estimada**: **-140KB** no bundle inicial

### **3. Serviços Externos → OSS**

| Atual | OSS Alternativa | Economia/ano |
|-------|-----------------|--------------|
| OpenAI (sem limite) | Ollama + rate limit | US$ 600-2.5k |
| Hotjar (se usado) | PostHog OSS | US$ 300-1k |
| Mixpanel (se usado) | PostHog OSS | US$ 300-1k |
| Busca SaaS (futuro) | Meilisearch | US$ 600-2k |
| OCR SaaS (futuro) | Tesseract | US$ 300-1.5k |

**Total economia potencial**: **US$ 2.1k - 8k/ano**

---

## 📋 PLANO DE AÇÃO

### **Imediato (Esta Semana)**

- [ ] Remover `puppeteer` (usar Playwright)
- [ ] Remover `node-fetch` (usar fetch nativo)
- [ ] Implementar rate limiting para APIs de IA
- [ ] Auditar uso de Storybook (remover se não usado)

### **Curto Prazo (Próximas 2 Semanas)**

- [ ] Substituir `axios` por `fetch` (gradualmente)
- [ ] Lazy load Microsoft Graph Client
- [ ] Configurar Ollama local (Llama 3.1)
- [ ] Implementar caching de respostas IA

### **Médio Prazo (Próximo Mês)**

- [ ] Auditar uso real de Hotjar/Mixpanel
- [ ] Avaliar migração para PostHog OSS
- [ ] Implementar Meilisearch (busca)
- [ ] Configurar alertas de custos (APIs)

---

## 🎯 METAS DE ECONOMIA

| Fase | Economia | Prazo |
|------|----------|-------|
| **Fase 1**: Limpeza deps | -470KB bundle, -350MB disk | 7 dias |
| **Fase 2**: Lazy loading | -140KB bundle inicial | 14 dias |
| **Fase 3**: Ollama + OSS | US$ 600-2.5k/ano | 30 dias |
| **Fase 4**: Analytics OSS | US$ 300-1k/ano | 60 dias |
| **Meta Total** | **US$ 3k-9k/ano** | **90 dias** |

---

## ✅ CRITÉRIOS DE SUCESSO

- ✅ Bundle size: **< 220KB gzipped** (atual ~250KB)
- ✅ `node_modules`: **< 600MB** (atual ~950MB)
- ✅ Custo APIs: **< US$ 50/mês**
- ✅ Zero regressão de funcionalidades
- ✅ Performance mantida ou melhorada

---

**© 2025 ICARUS v5.0 - AGENTE_EQUIPE_ECONOMIA_AI_TUTORES**

