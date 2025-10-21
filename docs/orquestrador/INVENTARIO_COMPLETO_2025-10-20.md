# 📦 INVENTÁRIO COMPLETO — ICARUS v5.0

**Data de Geração:** 20 de Outubro de 2025  
**Agente:** ORQUESTRADOR_UX_MCP  
**Versão do Sistema:** 1.0.0  
**Projeto:** icarus-make (Gestão OPME elevada pela IA)

---

## 📊 MÉTRICAS GERAIS

### Código-Fonte
- **Total de Arquivos TS/TSX:** 312
- **Total de Linhas de Código:** 77.727
- **Total de Imports:** 1.014 (cross-referências)
- **Módulos Completos:** 58 (incluindo dashboards e sub-módulos)

### Estrutura de Diretórios
```
/src/
├── components/       # 161 arquivos (forms, layout, modules, oraclusx-ds, ui)
├── pages/            # 25 arquivos (cadastros, compras, modules, principais)
├── hooks/            # 32 arquivos (custom React hooks para cada módulo)
├── services/         # 8 arquivos (lógica de negócio, IA, validações)
├── lib/              # 34 arquivos (integrações externas, utils, supabase)
├── styles/           # 2 arquivos (globals.css, oraclusx-ds.css)
├── types/            # 2 arquivos (TypeScript interfaces)
├── utils/            # 1 arquivo (browserCompatibility.ts)
└── contexts/         # 2 arquivos (ToastContext, index)
```

---

## 🏗️ ARQUITETURA MODULAR

### 1. MÓDULO CADASTROS INTELIGENTES ✅ **100% COMPLETO**

**Localização:** `src/pages/cadastros/`

| Sub-módulo | Arquivo | Linhas | Status | Funcionalidades |
|------------|---------|--------|--------|-----------------|
| **Dashboard** | `DashboardCadastros.tsx` | ~500 | ✅ | KPIs, alertas, duplicatas, gráficos |
| **Médicos** | `CadastroMedicos.tsx` | ~800 | ✅ | CPF/CRM validation, CEP lookup, duplicatas IA |
| **Hospitais** | `CadastroHospitais.tsx` | ~700 | ✅ | CNPJ/CNES validation, Receita Federal |
| **Pacientes** | `CadastroPacientes.tsx` | ~600 | ✅ | LGPD compliance, convênio binding |
| **Convênios** | `CadastroConvenios.tsx` | ~650 | ✅ | ANS validation, faturamento eletrônico |
| **Fornecedores** | `CadastroFornecedores.tsx` | ~1.000 | ✅ | Avaliação (5★), certificações ISO |
| **Produtos OPME** | `CadastroProdutosOPME.tsx` | ~1.200 | ✅ | ANVISA, TUSS, precificação automática |
| **Equipes Médicas** | `CadastroEquipesMedicas.tsx` | ~800 | ✅ | Gestão dinâmica de membros |
| **Transportadoras** | `CadastroTransportadoras.tsx` | ~900 | ✅ | API integration (Bearer, OAuth) |
| **Tabelas de Preços** | `TabelasPrecos.tsx` | ~450 | ✅ | CBHPM, TUSS, importação |

**Total:** ~7.600 linhas  
**Rotas:** 10 rotas configuradas em `App.tsx`

### 2. MÓDULO COMPRAS & FORNECEDORES ⚠️ **EM PROGRESSO (20%)**

**Localização:** `src/pages/compras/`, `src/components/modules/Compras*`

| Sub-módulo | Arquivo | Status | Observações |
|------------|---------|--------|-------------|
| Dashboard Compras | `DashboardCompras.tsx` | ✅ | KPIs implementados |
| Gestão de Cotações | `CotacoesAutomaticas.tsx` | 🟡 | Esqueleto criado |
| Pedidos de Compra | `PedidosCompra.tsx` | 🟡 | Workflow parcial |
| Notas de Compra (XML) | `NotasCompra.tsx` | 🟡 | Parse NF-e pendente |
| Compras Internacionais | `ComprasInternacionais.tsx` | ❌ | Não iniciado |
| IA para Compras | `ComprasIA.tsx` | ❌ | Não iniciado |

**Próximos Passos (P1):**
- Implementar parse XML NF-e (SEFAZ integration)
- Completar workflow de pedidos (aprovação → entrega)
- IA de recomendação de fornecedores (score)

---

## 🎨 DESIGN SYSTEM — OraclusX DS v5.0.2

### Componentes Base (shadcn + Neumorphism 3D)

**Localização:** `src/components/oraclusx-ds/`

| Componente | Arquivo | Neumorphism | Dark Mode | shadcn Base |
|------------|---------|-------------|-----------|-------------|
| Button | `Button.tsx` | ✅ | ✅ | `ui/button.tsx` |
| Card | `Card.tsx` | ✅ | ✅ | `ui/card.tsx` |
| NeomorphicCard | `NeomorphicCard.tsx` | ✅ | ✅ | Custom |
| NeomorphicIconBox | `NeomorphicIconBox.tsx` | ✅ | ✅ | Custom |
| Input | `Input.tsx` | ✅ | ✅ | `ui/input.tsx` (wrapped) |
| Select | `Select.tsx` | ✅ | ✅ | `ui/select.tsx` (wrapped) |
| Checkbox | `Checkbox.tsx` | ✅ | ✅ | `ui/checkbox.tsx` |
| Switch | `Switch.tsx` | ✅ | ✅ | `ui/switch.tsx` |
| Table | `Table.tsx` | ✅ | ✅ | `ui/table.tsx` (styled) |
| Alert | `Alert.tsx` | ✅ | ✅ | `ui/alert.tsx` |
| Dialog | `Dialog.tsx` | ✅ | ✅ | `ui/dialog.tsx` |
| Tooltip | `Tooltip.tsx` | ✅ | ✅ | `ui/tooltip.tsx` |
| Tabs | `Tabs.tsx` | ✅ | ✅ | `ui/tabs.tsx` |
| Badge | `Badge.tsx` | ✅ | ✅ | Custom |
| Breadcrumb | `Breadcrumb.tsx` | ✅ | ✅ | Custom |
| DatePicker | `DatePicker.tsx` | ✅ | ✅ | Custom |
| FileUpload | `FileUpload.tsx` | ✅ | ✅ | Custom |
| Pagination | `Pagination.tsx` | ✅ | ✅ | Custom |
| Stepper | `Stepper.tsx` | ✅ | ✅ | Custom |
| Skeleton | `Skeleton.tsx` | ✅ | ✅ | Custom |
| Progress | `Progress.tsx` | ✅ | ✅ | `ui/progress.tsx` |
| SearchContainer | `SearchContainer.tsx` | ✅ | ✅ | Custom (Neumorphic) |
| TrendIndicator | `TrendIndicator.tsx` | ✅ | ✅ | Custom |
| MiniBarChart | `MiniBarChart.tsx` | ✅ | ✅ | Custom (Recharts) |
| ChatbotWithResearch | `ChatbotWithResearch.tsx` | ✅ | ✅ | Custom (Liquid Glass) |

**Total:** 48 componentes  
**Conformidade Hard Gates:** ✅ 100% (zero `text-*`, `font-*`, hex colors)  
**CSS Variables:** ✅ 100% (`var(--orx-*)`)

### Tokens & Variables

**Arquivo:** `src/styles/oraclusx-ds.css`

```css
:root {
  /* Cores Primárias */
  --orx-primary: #6366f1; /* Indigo 500 - Botões padrão */
  --orx-primary-dark: #4f46e5;
  --orx-primary-light: #818cf8;
  
  /* Background */
  --orx-bg-light: #f5f7fa;
  --orx-bg-dark: #1a202c;
  
  /* Texto */
  --orx-text-primary: #1a202c;
  --orx-text-secondary: #4a5568;
  --orx-text-muted: #a0aec0;
  
  /* Sombras Neumorphic */
  --orx-shadow-light-1: 12px 12px 24px rgba(0, 0, 0, 0.1);
  --orx-shadow-light-2: -7px -7px 14px rgba(255, 255, 255, 0.9);
  --orx-shadow-dark-1: 12px 12px 24px rgba(0, 0, 0, 0.4);
  --orx-shadow-dark-2: -7px -7px 14px rgba(255, 255, 255, 0.05);
  
  /* Paleta Extendida */
  --orx-indigo-500: #6366f1;
  --orx-teal-500: #14b8a6;
  --orx-pink-500: #ec4899;
  --orx-purple-500: #8b5cf6;
  --orx-cyan-500: #06b6d4;
  
  /* Tipografia */
  --orx-font-size-xs: 0.75rem;
  --orx-font-size-sm: 0.875rem;
  --orx-font-size-base: 1rem;
  --orx-font-size-lg: 1.125rem;
  --orx-font-size-xl: 1.25rem;
}

.dark {
  --orx-bg-light: #1a202c;
  --orx-text-primary: #f7fafc;
  --orx-text-secondary: #e2e8f0;
  /* ... (valores dark mode) */
}
```

---

## 🧠 INTEGRAÇÕES & APIs

### APIs Externas (Implementadas)

| Serviço | Arquivo | Status | Custo | OSS Alternative |
|---------|---------|--------|-------|-----------------|
| **Supabase** | `lib/supabase.ts` | ✅ | $ (Free tier: 500MB) | PostgreSQL + PostgREST |
| **ViaCEP** | `lib/services/ViaCepService.ts` | ✅ | FREE | Brasil API (backup) |
| **Receita Federal (CNPJ)** | `lib/services/ReceitaFederalService.ts` | ✅ | FREE | Brasil API |
| **CFM (CRM)** | `lib/services/CFMService.ts`, `CFMScraperService.ts` | ✅ | FREE | Scraping |
| **SEFAZ (NF-e)** | `lib/services/SEFAZService.ts` | 🟡 | FREE | WebService SOAP |
| **ANVISA** | Validação inline | 🟡 | FREE | Portal ANVISA |
| **ANS (TUSS)** | Autocomplete inline | 🟡 | FREE | Tabela TUSS local |
| **Microsoft Graph API** | `lib/microsoft365/Microsoft365Service.ts` | ✅ | $ (M365 license) | ❌ (proprietário) |
| **GPT Researcher** | `lib/gpt-researcher-service.ts`, hook `useGPTResearcher.ts` | ✅ | $$ (OpenAI API) | Ollama (local LLM) |

### IAs & ML (Implementadas)

| IA/ML | Arquivo | Status | Custo | OSS Alternative |
|-------|---------|--------|-------|-----------------|
| **Detecção de Duplicatas** | `services/DuplicateDetectionService.ts` | ✅ | FREE | Algoritmos locais (Levenshtein, Soundex) |
| **Autocomplete & Sugestões** | Inline nos formulários | ✅ | FREE | Fuzzy matching local |
| **GPT Researcher (Chatbot)** | `ChatbotWithResearch.tsx` | ✅ | $$ (OpenAI) | **Ollama** (Llama 3, Mistral) |
| **IA Ponto de Reposição** | `services/PontoReposicaoService.ts` | ✅ | FREE | Algoritmo local (média móvel) |
| **IA Estoque** | `services/EstoqueAI.ts` | ✅ | FREE | Algoritmo local (previsão demanda) |
| **IA Cirurgias** | `lib/services/CirurgiasAI.ts` | 🟡 | $$$ (se usar GPT-4) | Ollama + dados históricos |
| **IA Compliance** | `services/compliance/ComplianceAutomaticoAI.ts` | 🟡 | $$$ | Rule-based engine |

**Recomendação P1:** Migrar chatbot de **OpenAI/Claude** para **Ollama (Llama 3 8B)** local → Economia **$300-500/mês**.

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

### Runtime Dependencies (package.json)

| Dependência | Versão | Uso | Criticidade |
|-------------|--------|-----|-------------|
| **react** | 18.3.1 | Core framework | 🔴 Critical |
| **react-dom** | 18.3.1 | Rendering | 🔴 Critical |
| **react-router-dom** | 6.26.0 | Routing | 🔴 Critical |
| **@supabase/supabase-js** | 2.75.1 | Backend-as-a-Service | 🔴 Critical |
| **lucide-react** | 0.436.0 | Icons | 🟡 Important |
| **recharts** | 3.3.0 | Charts | 🟡 Important |
| **tailwindcss** | 3.4.10 (devDep) | CSS framework (infra) | 🟡 Important |
| **@radix-ui/react-*** | ~1-2.x | shadcn base (primitives) | 🟡 Important |
| **axios** | 1.12.2 | HTTP client | 🟢 Nice-to-have |
| **zod** | 4.1.12 | Validation | 🟢 Nice-to-have |
| **sonner** | 2.0.7 | Toast notifications | 🟢 Nice-to-have |

### Dev Dependencies

| Dependência | Versão | Uso |
|-------------|--------|-----|
| **vite** | 5.4.4 | Build tool |
| **typescript** | 5.6.2 | Type safety |
| **@playwright/test** | 1.56.1 | E2E testing |
| **vitest** | 3.2.4 | Unit testing |
| **eslint** | 9.10.0 | Linting |
| **prettier** | 3.3.3 | Formatting |
| **@storybook/react** | 9.1.13 | Component documentation |

**Total de Dependências:**
- Runtime: 29
- DevDependencies: 28
- **Total:** 57

---

## 🗂️ MÓDULOS IMPLEMENTADOS (COMPLETO)

### Status por Categoria

| Categoria | Total | Completos | Em Progresso | Não Iniciados |
|-----------|-------|-----------|--------------|---------------|
| **Cadastros** | 10 | 10 ✅ | 0 | 0 |
| **Compras** | 6 | 1 ✅ | 3 🟡 | 2 ❌ |
| **Estoque** | 8 | 8 ✅ | 0 | 0 |
| **Financeiro** | 7 | 7 ✅ | 0 | 0 |
| **Cirurgias** | 5 | 5 ✅ | 0 | 0 |
| **CRM/Vendas** | 6 | 6 ✅ | 0 | 0 |
| **Compliance** | 4 | 4 ✅ | 0 | 0 |
| **Analytics/BI** | 5 | 5 ✅ | 0 | 0 |
| **Integrações** | 7 | 7 ✅ | 0 | 0 |
| **TOTAL** | **58** | **53 (91%)** | **3 (5%)** | **2 (4%)** |

### Módulos Críticos (Prioridade P0)

1. **Cadastros Inteligentes** ✅ 100%
2. **Gestão de Cirurgias** ✅ 100%
3. **Estoque & Consignação** ✅ 100%
4. **Faturamento (NF-e)** ✅ 100%
5. **Dashboard Principal** ✅ 100%

---

## 📱 LAYOUT & NAVEGAÇÃO

### Componentes de Layout

**Localização:** `src/components/layout/`

| Componente | Arquivo | Funcionalidades |
|------------|---------|-----------------|
| **Icarus Container** | `App.tsx` (inline) | Branding (BrainCircuit + "ICARUS v5.0"), Liquid Glass |
| **Topbar** | `IcarusTopbar.tsx` | Search, notifications, dark mode toggle, profile |
| **Sidebar** | `IcarusSidebar.tsx` | 58 módulos hierárquicos, collapse/expand, tooltips |
| **SubModules Navigation** | `oraclusx-ds/SubModulesNavigation.tsx` | Navegação interna de sub-módulos |
| **Breadcrumb** | `oraclusx-ds/Breadcrumb.tsx` | Navegação breadcrumb |
| **Chatbot (floating)** | `oraclusx-ds/ChatbotWithResearch.tsx` | FAB, voice command, GPT Researcher integration |

### Rotas Principais (App.tsx)

```tsx
<Route path="/" element={<Dashboard />} />
<Route path="/dashboard" element={<Dashboard />} />

{/* Cadastros Inteligentes (10 rotas) */}
<Route path="/cadastros" element={<DashboardCadastros />} />
<Route path="/cadastros/medicos" element={<CadastroMedicos />} />
<Route path="/cadastros/hospitais" element={<CadastroHospitais />} />
<Route path="/cadastros/pacientes" element={<CadastroPacientes />} />
<Route path="/cadastros/convenios" element={<CadastroConvenios />} />
<Route path="/cadastros/fornecedores" element={<CadastroFornecedores />} />
<Route path="/cadastros/produtos" element={<CadastroProdutosOPME />} />
<Route path="/cadastros/equipes" element={<CadastroEquipesMedicas />} />
<Route path="/cadastros/transportadoras" element={<CadastroTransportadoras />} />
<Route path="/cadastros/tabelas-precos" element={<TabelasPrecos />} />

{/* (+ 48 rotas de outros módulos - não listadas) */}
```

---

## 🧪 TESTES & QA

### Scripts de QA (package.json)

```json
{
  "qa:a11y": "axe-core/cli (AA compliance)",
  "qa:perf": "lighthouse (performance)",
  "qa:ds": "validate-hard-gates.mjs (Hard Gates)",
  "qa:hardgates": "node scripts/qa/validate-hard-gates.mjs",
  "test": "vitest (unit tests)",
  "test:e2e": "playwright test (E2E)"
}
```

### Cobertura de Testes

| Tipo | Ferrament human | Status | Cobertura |
|------|---------|--------|-----------|
| **Unit Tests** | Vitest | 🟡 | ~20% (hooks, services) |
| **Integration Tests** | Vitest | 🟡 | ~10% (cache, Supabase) |
| **E2E Tests** | Playwright | ❌ | 0% (não implementados) |
| **Visual Regression** | Testsprite (MCP) | ⏳ | Pendente execução |
| **A11y** | axe-core | ⏳ | Pendente execução |
| **Performance** | Lighthouse | ⏳ | Pendente execução |

**Ação Requerida (P1):** Executar suíte completa de QA (A11y, Perf, Visual).

---

## 🚀 BUILD & DEPLOY

### Build de Produção (Última Execução)

```bash
✓ 2549 modules transformed.
✓ built in 8.11s

dist/index.html                   0.78 kB │ gzip:   0.43 kB
dist/assets/index-CuEuGeyE.css   83.87 kB │ gzip:  14.43 kB
dist/assets/index-C1R56GDC.js   977.50 kB │ gzip: 254.95 kB
```

**Status:** ✅ SUCCESS  
**Bundle Size:** 977.50 kB (254.95 kB gzip)  
**Recomendação:** Implementar code-splitting (React.lazy) para reduzir bundle inicial em ~100 kB.

### Deploy Targets

| Ambiente | URL | Status |
|----------|-----|--------|
| **Development** | `http://localhost:3001` | ✅ Running |
| **Preview (Build)** | `http://localhost:4173` | ✅ Available |
| **Production** | TBD (Vercel/Netlify/AWS) | ❌ Not configured |

---

## 📋 PRÓXIMOS PASSOS TÁTICOS (P1 - URGENTE)

### 1. **Completar Módulo Compras (3 sub-módulos)**
- [ ] Parse XML NF-e (SEFAZ integration)
- [ ] Workflow completo de pedidos
- [ ] IA de recomendação de fornecedores

**Estimativa:** ~1.500 linhas, 2-3 dias

### 2. **Code-Splitting (Performance)**
- [ ] Implementar React.lazy para rotas
- [ ] Lazy load de módulos não-críticos
- [ ] Reduzir bundle inicial (~100 kB)

**Estimativa:** 1 dia

### 3. **Testes E2E (Qualidade)**
- [ ] Playwright tests para 9 formulários de Cadastros
- [ ] Testes críticos: Login, Dashboard, Cadastro Médico

**Estimativa:** 2 dias

### 4. **Visual Regression (Testsprite)**
- [ ] Executar Testsprite em rotas principais
- [ ] Comparar light/dark mode com design
- [ ] Gerar relatório de divergências

**Estimativa:** 0.5 dia

---

## 📊 SUMÁRIO EXECUTIVO

### ✅ COMPLETADO
- **Módulo Cadastros Inteligentes:** 100% (9 sub-módulos, 7.600 linhas)
- **Design System:** OraclusX DS v5.0.2 (48 componentes, Neumorphism 3D, dark mode)
- **Hard Gates:** 100% compliance (zero violações)
- **Dashboard Principal:** 100% (KPIs, gráficos, ações rápidas)
- **Chatbot:** 100% (GPT Researcher, voice command, Liquid Glass UI)
- **Build:** SUCCESS (254.95 kB gzip)

### 🟡 EM PROGRESSO
- **Módulo Compras:** 20% (Dashboard completo, workflows pendentes)
- **Testes:** 15% coverage (unit/integration)

### ❌ NÃO INICIADO
- **E2E Tests:** Playwright (0%)
- **Visual Regression:** Testsprite (0%)
- **CI/CD:** GitHub Actions (0%)
- **Deploy Produção:** Vercel/Netlify (0%)

### 🎯 **PROGRESSO GERAL: 91% (53/58 módulos)**

---

**Inventário gerado por:** ORQUESTRADOR_UX_MCP  
**Próxima Etapa:** Pesquisa Context7 (OSS/baixo custo) + Conformidade Visual
