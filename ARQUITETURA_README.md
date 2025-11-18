# 🏛️ Arquitetura ICARUS v5.0 (OraclusX)

> **Plataforma Hospitalar Inteligente de Gestão Integrada**  
> Documentação Arquitetural Completa

<div align="center">

![Status](https://img.shields.io/badge/Status-Produção-success)
![Qualidade](https://img.shields.io/badge/Qualidade-94%25-brightgreen)
![Cobertura](https://img.shields.io/badge/Testes-85%25-green)
![Módulos](https://img.shields.io/badge/Módulos-58-blue)
![LoC](https://img.shields.io/badge/LoC-50k+-informational)

</div>

---

## 🎯 Visão Geral em 60 Segundos

O **ICARUS v5.0** é uma plataforma completa de gestão hospitalar que integra:

- 🏥 **Gestão de Cirurgias**: Agendamento, materiais, custos
- 📦 **Estoque & Consignação**: Rastreabilidade RFID, lotes, validades
- 💰 **Financeiro**: Contas a pagar/receber, faturamento, NF-e
- 🛒 **Compras & Vendas**: Pedidos, contratos, CRM
- 🤖 **IA Multi-Agente**: Relatórios executivos automáticos
- ✅ **Compliance**: LGPD, ANVISA, UDI, auditoria

### Stack Tecnológico

```
Frontend:  React 18 + TypeScript + TailwindCSS + shadcn/ui
Backend:   Supabase (PostgreSQL + Auth + Storage + Realtime)
IA:        GPT-4 + LangChain + GPT Researcher + MCP
Deploy:    Vercel (Frontend) + Supabase Cloud (Backend)
```

---

## 📐 Diagrama de Arquitetura

```mermaid
%%{init:{"theme":"forest"}}%%
architecture-beta
  group Frontend(browser)[Frontend (App React/TS)] 
    service UI(server)[UI React 18] in Frontend  
  group Backend(cloud)[Backend (Supabase + Func)] 
    service Auth(server)[Auth & RBAC] in Backend  
    service API(server)[Business API] in Backend  
    service DB(database)[PostgreSQL] in Backend  
  group Agents(robot)[Pipeline de Agentes] 
    service Orchestrator(server)[Orquestrador] in Agents  
    service AgentInt(server)[Agente Dados Internos] in Agents  
    service AgentBench(server)[Agente Benchmark Externo] in Agents  
    service AgentSynth(server)[Agente Síntese Relatório] in Agents  
  group Integrations(cloud)[Integrações Externas] 
    service IoT(server)[IoT/RFID/Blockchain] in Integrations  
    service Regul(server)[Compliance/ANVISA/UDI] in Integrations  

  UI:R --> L:Auth  
  Auth:R --> L:API  
  API:R --> L:DB  
  API:R --> L:Orchestrator  
  Orchestrator:R --> L:AgentInt  
  Orchestrator:R --> L:AgentBench  
  AgentInt:R --> L:AgentSynth  
  AgentBench:R --> L:AgentSynth  
  AgentSynth:R --> L:API  
  IoT:R --> L:API  
  Regul:R --> L:API  
```

---

## 📚 Navegação Rápida

### 🚀 Para Começar

| Se você quer... | Acesse... | Tempo |
|-----------------|-----------|-------|
| **Entender a arquitetura geral** | [📄 Visão Geral](./ARQUITETURA_ICARUS_V5_VISAO_GERAL.md) | 15 min |
| **Ver diagramas técnicos** | [🔷 Diagramas Detalhados](./ARQUITETURA_DIAGRAMAS_DETALHADOS.md) | 30 min |
| **Entender decisões técnicas** | [📋 ADRs](./ARQUITETURA_DECISOES_ADR.md) | 25 min |
| **Explorar toda documentação** | [📖 Índice Master](./ARQUITETURA_INDICE_MASTER.md) | - |
| **Setup local** | [⚡ Quick Start](./QUICK_START.md) | 10 min |
| **Deploy produção** | [🚀 Guia Deploy](./GUIA_DEPLOY_COMPLETO.md) | 30 min |

### 📖 Documentação por Categoria

<details>
<summary><b>🏗️ Arquitetura & Design</b></summary>

- [📄 Visão Geral](./ARQUITETURA_ICARUS_V5_VISAO_GERAL.md)
- [🔷 Diagramas Detalhados](./ARQUITETURA_DIAGRAMAS_DETALHADOS.md)
- [📋 Decisões de Arquitetura (ADRs)](./ARQUITETURA_DECISOES_ADR.md)
- [📖 Índice Master](./ARQUITETURA_INDICE_MASTER.md)
- [🎨 Design System OraclusX](./ORACLUSX_DS_COMPLETO.md)

</details>

<details>
<summary><b>💻 Documentação Técnica</b></summary>

- [📖 Completa](./DOCUMENTACAO_TECNICA_COMPLETA.md)
- [⚛️ Frontend](./DOCUMENTACAO_TECNICA_FRONTEND.md)
- [🗄️ Backend & Database](./DOCUMENTACAO_TECNICA_BD.md)
- [🔗 Integrações & Deploy](./DOCUMENTACAO_TECNICA_INTEGRACOES_DEPLOY.md)

</details>

<details>
<summary><b>📦 Módulos Funcionais (58 módulos)</b></summary>

- [📋 Inventário Completo](./INVENTARIO_58_MODULOS_COMPLETO.md)
- [📊 Dashboard Principal](./DOCUMENTACAO_DASHBOARD_PRINCIPAL_COMPLETA.md)
- [🤖 Chatbot IA](./DOCUMENTACAO_CHATBOT_ICARUS_COMPLETA.md)
- [📦 Estoque & Consignação](./DOCUMENTACAO_CONSIGNACAO_AVANCADA_COMPLETA.md)
- [✅ Compliance & Auditoria](./DOCUMENTACAO_COMPLIANCE_AUDITORIA_COMPLETA.md)

</details>

<details>
<summary><b>🚀 Deploy & DevOps</b></summary>

- [📘 Guia Completo de Deploy](./GUIA_DEPLOY_COMPLETO.md)
- [▲ Vercel Deploy](./VERCEL_DEPLOY_GUIDE.md)
- [🔧 Configuração Env](./VERCEL_ENV_COMPLETO.md)
- [⚡ Quick Start Local](./QUICK_START.md)
- [🚀 Quick Start Produção](./QUICK_START_PRODUCTION.md)

</details>

<details>
<summary><b>✅ Qualidade & Auditoria</b></summary>

- [📊 Auditoria Completa](./AUDITORIA_COMPLETA_FINAL.md)
- [📈 Relatório de Qualidade 94%](./RELATORIO_QUALIDADE_94_PORCENTO.md)
- [🎯 Score 100% (Agentes)](./RELATORIO_100_PORCENTO_ALCANCADO.md)
- [🧪 Testes](./AUDITORIA_AGENTE_08_TESTES_QUALIDADE.md)

</details>

<details>
<summary><b>📊 Relatórios & Progresso</b></summary>

- [✅ Projeto 100% Completo](./PROJETO_100_PORCENTO_COMPLETO.md)
- [📈 Relatório Executivo](./RELATORIO_EXECUTIVO_100.md)
- [🏆 Milestone 50%](./MILESTONE_50_COMPLETO.md)
- [🗺️ Roadmap](./ROADMAP.md)

</details>

---

## 🏗️ Arquitetura em Camadas

### Camada 1: Frontend (React)

**Responsabilidades**:
- Interface do usuário (58 módulos)
- Gerenciamento de estado (React Query + Zustand)
- Validação de formulários
- Design System OraclusX (Neumorphic)

**Tecnologias**:
- React 18 (Concurrent rendering, Suspense)
- TypeScript 5.6+
- Vite (build tool)
- TailwindCSS + shadcn/ui
- React Query (server state)
- Zustand (client state)

**Estrutura**:
```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas/rotas
├── modules/        # 58 módulos funcionais
├── hooks/          # Custom hooks
├── lib/            # Utilitários
├── types/          # TypeScript types
└── styles/         # Global styles
```

---

### Camada 2: Backend (Supabase)

**Responsabilidades**:
- Autenticação JWT + RBAC (8 roles)
- APIs REST/GraphQL (PostgREST)
- Lógica de negócio (Edge Functions)
- Storage de arquivos
- Realtime via WebSockets

**Componentes**:
1. **Auth Service**: JWT, OAuth, MFA
2. **Business API**: Edge Functions
3. **Storage**: S3-compatible
4. **Realtime**: WebSocket subscriptions

**Segurança**:
- Row Level Security (RLS) em todas as tabelas
- Políticas granulares por role
- Auditoria automática (triggers)

---

### Camada 3: Database (PostgreSQL 15)

**Responsabilidades**:
- Armazenamento persistente (58 tabelas)
- Triggers e stored procedures
- Materialized views (relatórios)
- Vector embeddings (IA)

**Schemas**:
- `public`: Tabelas principais
- `auth`: Autenticação (Supabase)
- `storage`: Arquivos
- `audit`: Logs de auditoria

**Otimizações**:
- Índices em colunas de busca
- Materialized views (refresh 1h)
- Particionamento (futuro)

---

### Camada 4: IA & Agentes

**Responsabilidades**:
- Geração de relatórios executivos
- Análise de dados internos
- Pesquisa de benchmarks externos
- Recomendações inteligentes

**Arquitetura Multi-Agente**:

```
Orquestrador (MCP)
    │
    ├─► Agente Dados Internos
    │   └─► PostgreSQL
    │
    ├─► Agente Benchmark Externo
    │   ├─► GPT Researcher
    │   └─► APIs externas (ANVISA, etc)
    │
    └─► Agente Síntese
        ├─► OpenAI GPT-4
        └─► Geração de PDF/Excel
```

**Tecnologias**:
- MCP (Model Context Protocol)
- LangChain (orquestração)
- GPT-4 (LLM)
- GPT Researcher (pesquisa web)

---

### Camada 5: Integrações Externas

**APIs Integradas**:
- ✅ **ANVISA**: Validação de registros médicos
- ✅ **UDI**: Unique Device Identification
- 🔄 **IoT/RFID**: Rastreamento de materiais (em progresso)
- 🔄 **Blockchain**: Registro imutável (opcional)
- 🔄 **ERP Hospitalar**: Integração legado (futuro)

---

## 🔐 Segurança

### Autenticação

- **JWT**: Tokens assinados com expiração (1h)
- **Refresh Tokens**: Renovação automática
- **MFA**: Autenticação multifator (opcional)
- **OAuth**: Google, Azure AD (futuro)

### Autorização (RBAC)

**8 Roles**:
1. `super_admin`: Acesso total
2. `admin`: Gestão operacional
3. `gestor`: Visualização e relatórios
4. `operacional`: Operações diárias
5. `auditor`: Auditoria e compliance
6. `medico`: Gestão de cirurgias
7. `enfermeiro`: Assistência cirúrgica
8. `comprador`: Gestão de compras

**Row Level Security (RLS)**:
```sql
-- Exemplo: Usuários só veem dados do seu hospital
CREATE POLICY hospital_isolation ON tabela
  FOR ALL
  USING (hospital_id = auth.uid_hospital());
```

### Compliance

- ✅ **LGPD**: Consentimento, anonimização, portabilidade
- ✅ **ANVISA**: Validação de registros
- ✅ **UDI**: Rastreabilidade de dispositivos
- 🔄 **CFM**: Normas médicas (em validação)

---

## 📊 Performance

### Metas de Performance

| Métrica | Meta | Atual | Status |
|---------|------|-------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | 1.8s | ✅ |
| FID (First Input Delay) | < 100ms | 45ms | ✅ |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.05 | ✅ |
| Tempo de resposta API (p95) | < 200ms | 150ms | ✅ |
| Uptime | > 99.9% | 99.95% | ✅ |

### Otimizações Implementadas

- ✅ **Code Splitting**: Lazy loading de módulos
- ✅ **React Query Caching**: Redução de 70% em requests
- ✅ **Materialized Views**: Queries de relatórios < 100ms
- ✅ **CDN**: Vercel Edge Network (global)
- ✅ **Image Optimization**: WebP + lazy loading
- ✅ **Bundle Optimization**: Tree shaking + minificação

---

## 🧪 Testes

### Cobertura de Testes

| Tipo | Framework | Cobertura | Status |
|------|-----------|-----------|--------|
| Unitários | Vitest | 85% | ✅ |
| Integração | Playwright | 75% | ✅ |
| E2E | Playwright | 60% | 🔄 |
| Performance | Lighthouse | 95/100 | ✅ |

### Executar Testes

```bash
# Unitários
pnpm test

# E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

## 🚀 Deploy

### Ambientes

| Ambiente | URL | Branch | Status |
|----------|-----|--------|--------|
| **Produção** | icarus.oraclusx.com | `main` | ✅ Ativo |
| **Staging** | staging.icarus.oraclusx.com | `develop` | ✅ Ativo |
| **Preview** | preview-*.vercel.app | feature/* | ✅ Auto |

### Pipeline CI/CD

```
1. Commit → GitHub
2. Vercel CI → Build & Deploy Preview
3. Tests → Playwright E2E
4. PR Merge → Deploy Staging
5. Tag Release → Deploy Produção
```

### Como Deploy

```bash
# 1. Build local
pnpm build

# 2. Deploy preview (automático no PR)
# Vercel detecta e faz deploy

# 3. Deploy produção (via tag)
git tag v5.0.0
git push origin v5.0.0
```

Veja: [GUIA_DEPLOY_COMPLETO.md](./GUIA_DEPLOY_COMPLETO.md)

---

## 📈 Métricas do Projeto

### Código

| Métrica | Valor |
|---------|-------|
| Total de Linhas | ~50.000 LoC |
| Frontend (React/TS) | ~25.000 LoC |
| Backend (SQL/Functions) | ~15.000 LoC |
| Testes | ~10.000 LoC |
| Componentes React | 120+ |
| Módulos funcionais | 58 |
| Endpoints API | 200+ |

### Qualidade

| Métrica | Valor |
|---------|-------|
| Score de qualidade | 94% |
| Cobertura de testes | 85% |
| Lighthouse Performance | 95/100 |
| Lighthouse Accessibility | 100/100 |
| TypeScript Coverage | 100% |

### Database

| Métrica | Valor |
|---------|-------|
| Tabelas | 58 |
| Views | 12 |
| Materialized Views | 8 |
| Triggers | 45 |
| Stored Procedures | 20 |
| Índices | 150+ |

---

## 🤝 Contribuindo

### Setup Local

```bash
# 1. Clone
git clone https://github.com/oraclusx/icarus-make.git
cd icarus-make

# 2. Instalar dependências
pnpm install

# 3. Configurar .env
cp env.example .env
# Editar .env com suas credenciais Supabase

# 4. Rodar dev server
pnpm dev
```

Veja: [QUICK_START.md](./QUICK_START.md)

### Padrões de Código

- **Frontend**: React + TypeScript + TailwindCSS
- **Linter**: ESLint + Prettier
- **Commits**: Conventional Commits
- **Branches**: `feature/*`, `bugfix/*`, `hotfix/*`
- **PRs**: Template obrigatório + testes

Veja: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📞 Suporte

### Documentação

- 📖 [Índice Master](./ARQUITETURA_INDICE_MASTER.md)
- 📄 [Visão Geral](./ARQUITETURA_ICARUS_V5_VISAO_GERAL.md)
- 🔷 [Diagramas](./ARQUITETURA_DIAGRAMAS_DETALHADOS.md)
- 📋 [ADRs](./ARQUITETURA_DECISOES_ADR.md)

### Contato

- **Email**: dev@oraclusx.com
- **Documentação**: Este repositório
- **Issues**: GitHub Issues

---

## 📄 Licença

Propriedade da **OraclusX**. Todos os direitos reservados.

---

## 🏆 Conquistas

- ✅ **100%** dos 58 módulos implementados
- ✅ **94%** de qualidade de código
- ✅ **85%** de cobertura de testes
- ✅ **< 2s** de carregamento de página
- ✅ **< 200ms** de resposta da API
- ✅ **100%** compliance LGPD
- ✅ Integração **ANVISA/UDI** funcional
- ✅ Pipeline de **IA multi-agente** operacional
- ✅ **58 tabelas** no banco de dados
- ✅ **200+ endpoints** API

---

<div align="center">

**Feito com ❤️ pela equipe OraclusX**

[📖 Documentação](./ARQUITETURA_INDICE_MASTER.md) • [🚀 Deploy](./GUIA_DEPLOY_COMPLETO.md) • [🤝 Contribuir](./CONTRIBUTING.md)

</div>

