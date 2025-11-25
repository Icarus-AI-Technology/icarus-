# Relatório Geral do Sistema Icarus v5.0

**Data do Relatório:** 23/11/2025
**Versão do Sistema:** 5.0.0
**Arquitetura:** React (Vite) + Supabase + Node.js (Edge Functions/Webhooks)

---

## 1. Visão Geral Executiva

O **Icarus v5.0** é uma plataforma ERP avançada focada no setor de saúde (foco em OPME - Órteses, Próteses e Materiais Especiais), integrando gestão operacional, financeira e compliance com uma camada robusta de Inteligência Artificial. O sistema utiliza uma arquitetura moderna baseada em componentes, com suporte a múltiplos temas (Modern/Flat e Cyberpunk/Dark Glass) e operação multi-tenant.

### Stack Tecnológico
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Framer Motion.
- **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **Estado:** Zustand (Gerenciamento Global), React Query (Data Fetching).
- **IA/LLM:** LangChain, OpenAI, TensorFlow (implícito em libs de análise).
- **Testes/QA:** Playwright, Vitest, Lighthouse CI.

---

## 2. Módulos e Funcionalidades

A aplicação é estruturada em módulos lazy-loaded para otimização de performance.

### 2.1. Gestão Operacional (Core)
*   **Cadastros (`/cadastros`)**:
    *   **Sub-módulos:** Médicos, Hospitais, Pacientes, Convênios, Fornecedores, Transportadoras.
    *   **OPME:** Cadastro específico de Produtos OPME (`/cadastros/produtos`) e Equipes Médicas.
    *   **Funcionalidades:** Validação de documentos, tabelas de preços dinâmicas.
*   **Cirurgias (`/cirurgias`)**:
    *   **Gestão:** Agendamento Cirúrgico, Gestão de Procedimentos.
    *   **Fluxo:** Solicitação -> Aprovação -> Execução -> Faturamento.
    *   **IA:** Previsão de demanda cirúrgica (`CirurgiasAI`).
*   **Estoque & Logística (`/estoque`, `/logistica`)**:
    *   **Controle:** Gestão de Lotes, Movimentações, Inventário Inteligente.
    *   **Consignação:** Módulo avançado para controle de materiais consignados em hospitais (`ConsignacaoAvancada`).
    *   **Logística:** Gestão de Frota, Rastreabilidade, Rotas Otimizadas, Telemetria.

### 2.2. Financeiro e Vendas
*   **Financeiro (`/financeiro`)**:
    *   **Controle:** Contas a Pagar/Receber, Fluxo de Caixa.
    *   **Fiscal:** Gestão de NFe (Emissão Automática), Faturamento Detalhado.
    *   **IA:** Score de inadimplência e análise de risco de crédito.
*   **Vendas & CRM (`/vendas`)**:
    *   **Funil:** Gestão de Leads, Propostas Comerciais, Contratos.
    *   **Licitações:** Módulo específico para gestão de propostas em licitações públicas.
    *   **Marketing:** Campanhas (Email/Redes Sociais), SEO Otimizado, Conversão.

### 2.3. Compras e Suprimentos (`/compras`)
*   **Fluxo:** Cotações (automáticas via IA), Pedidos de Compra, Notas Fiscais.
*   **Inteligência:** Pesquisa de Preços de Mercado, Avaliação de Fornecedores.

### 2.4. Compliance e Qualidade (`/compliance`)
*   **Regulatório:** Monitoramento Abbott (Distribuidor Platinum), ANVISA, Rastreabilidade OPME.
*   **Auditoria:** Auditorias Internas, Gestão de Certificações.
*   **OPME:** Controle de qualidade específico para materiais especiais.

### 2.5. RH e Gestão de Pessoas (`/rh`)
*   **Rotinas:** Folha de Pagamento, Ponto Eletrônico, Escalas.
*   **Talentos:** Recrutamento via IA, Onboarding Digital, Treinamento e Avaliação de Desempenho.

---

## 3. Inteligência Artificial (Icarus AI)

O sistema possui uma **IA Central** que orquestra 17 agentes especializados (`src/lib/services/ai/AIAgentsIndex.ts`).

| Categoria | Agente | Função Principal | Acurácia Est. |
| :--- | :--- | :--- | :--- |
| **Operacional** | **Dashboard AI** | Insights preditivos gerais | 94.5% |
| | **Estoque AI** | Otimização de níveis de inventário | 96.2% |
| | **Logística AI** | Otimização de rotas e entregas | 92.8% |
| | **Qualidade AI** | Inspeção e análise de conformidade | 93.4% |
| | **Cirurgias AI** | Previsão de demanda e recursos | 92.6% |
| | **Viabilidade AI** | Análise de viabilidade de importação | 92.1% |
| **Financeiro** | **Precificação AI** | Pricing dinâmico e margem | 95.7% |
| | **Fraude AI** | Detecção de anomalias financeiras | 97.1% |
| | **Contas Receber AI** | Score de risco de inadimplência | 94.8% |
| | **Risco AI** | Análise global de riscos do negócio | 93.7% |
| **Comercial** | **Vendas AI** | Recomendações de upsell/cross-sell | 91.3% |
| **RH** | **RH AI** | Gestão de clima e retenção | 90.2% |
| | **Treinamento AI** | Trilhas de aprendizado adaptativo | 89.3% |
| **Compliance** | **Compliance AI** | Monitoramento regulatório contínuo | 96.8% |
| | **Documentação AI** | Geração e análise de documentos | 94.2% |
| | **Auditoria AI** | Auditoria preditiva de processos | 91.5% |
| **Interface** | **Chatbot AI** | Assistente virtual com capacidade de pesquisa | 89.5% |

---

## 4. Integrações e APIs

### Internas
*   **Supabase RPCs:** Utilizadas para lógica de segurança (Row Level Security) e multi-tenancy (`set_config` para `empresa_id` e `user_role`).
*   **Webhooks:** Endpoints dedicados para processamento assíncrono (ex: pagamentos).

### Externas
*   **Stripe:** Processamento de pagamentos e assinaturas (Webhooks para `payment_intent`, `charge`, `subscription`).
*   **Microsoft 365:** Painel de integração para emails e documentos (`Microsoft365IntegrationPanel`).
*   **OpenAI / LangChain:** Motor de raciocínio para os agentes de IA.
*   **SendGrid / Twilio:** Serviços de notificação transacional (Email/SMS).
*   **MeiliSearch:** Motor de busca para indexação rápida de registros.
*   **Playwright / Lighthouse:** Ferramentas de automação de testes e qualidade integradas ao pipeline de CI/CD.

---

## 5. Design System (OraclusX DS)

O sistema utiliza um Design System proprietário chamado **OraclusX**, focado em acessibilidade e estética moderna.

*   **Temas:**
    *   *Modern/Flat:* Foco em produtividade e clareza.
    *   *Cyberpunk (Neumorfismo Dark):* Interface imersiva com efeitos de vidro (glassmorphism) e profundidade 3D.
*   **Componentes Chave:**
    *   `NeomorphicCard`, `GlassCard`: Containers principais.
    *   `CardKpi`: Visualização de métricas com tendências.
    *   `IcarusTopbar` / `IcarusSidebar`: Navegação responsiva com estados colapsáveis.
*   **UX:** Otimizações como *prefetching* de rotas baseadas no comportamento do usuário (ex: carregar módulo de compras ao passar o mouse no menu).

---

## 6. Arquitetura de Pastas

```
src/
├── agentes/            # Interfaces dos Agentes de IA
├── cadastros/          # Formulários e listas de cadastros base
├── components/         # Componentes reutilizáveis (OraclusX DS)
├── features/           # Funcionalidades isoladas (Compras, Modern Dashboard)
├── hooks/              # Lógica de negócio reutilizável (React Hooks)
├── lib/                # Configurações de serviços (Supabase, OpenAI, Utils)
├── pages/              # Rotas da aplicação (Módulos)
├── services/           # Camada de comunicação com APIs
└── webhooks/           # Handlers para eventos externos (Node.js/Edge)
```

Este relatório consolida o estado atual do desenvolvimento, refletindo um sistema maduro com ampla cobertura funcional e tecnológica.

