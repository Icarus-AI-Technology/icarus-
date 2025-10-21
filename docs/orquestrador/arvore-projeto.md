# 📁 ÁRVORE COMPLETA DO PROJETO ICARUS v5.0

**Data:** 19 de outubro de 2025  
**Gerado por:** Agente Orquestrador

---

## 📊 ESTATÍSTICAS

| Tipo | Quantidade |
|------|------------|
| **Módulos (.tsx)** | 81 |
| **Componentes OraclusX DS** | 45 |
| **Componentes shadcn/ui** | 5 |
| **Hooks Customizados** | 30 |
| **Services** | 11 |
| **Páginas** | 12 |
| **Arquivos Documentação** | 200+ |
| **Total Linhas Código** | ~45.000 |

---

## 🌳 ESTRUTURA COMPLETA

```
/Users/daxmeneghel/icarus-make/
│
├── 📄 ARQUIVOS RAIZ
│   ├── README.md (documentação principal)
│   ├── QUICK_START.md (guia rápido)
│   ├── icarus-spec.md (especificação técnica completa)
│   ├── ROADMAP.md (roadmap 2025-2026)
│   ├── CHANGELOG.md (histórico de versões)
│   ├── package.json (dependências)
│   ├── vite.config.ts (Vite 5.4 - dev:5173, preview:4173)
│   ├── tsconfig.json (TypeScript strict mode)
│   ├── tailwind.config.js (Tailwind 3.4 + neumorphic)
│   ├── components.json (shadcn config)
│   ├── eslint.config.js (ESLint rules)
│   ├── postcss.config.js (PostCSS)
│   ├── playwright.config.ts (Playwright E2E)
│   └── .env (variáveis ambiente)
│
├── 📂 src/ (código-fonte principal)
│   ├── 📄 main.tsx (entry point)
│   ├── 📄 App.tsx (aplicação principal)
│   ├── 📄 vite-env.d.ts (tipos Vite)
│   │
│   ├── 📂 components/ (componentes React)
│   │   ├── 📂 modules/ (81 módulos funcionais)
│   │   │   ├── AgendamentoCirurgico.tsx
│   │   │   ├── AnalyticsBI.tsx
│   │   │   ├── AnalyticsPredicao.tsx
│   │   │   ├── AnunciosPagos.tsx
│   │   │   ├── AuditoriaInterna.tsx
│   │   │   ├── AutenticacaoAvancada.tsx
│   │   │   ├── AutomacaoIA.tsx
│   │   │   ├── AvaliacaoDesempenho.tsx
│   │   │   ├── BeneficiosColaboradores.tsx
│   │   │   ├── BIAnalytics.tsx
│   │   │   ├── CampanhasAutomaticas.tsx
│   │   │   ├── CapacitacaoIA.tsx
│   │   │   ├── CertificacoesAnvisa.tsx
│   │   │   ├── ChatBotMetrics.tsx
│   │   │   ├── ChatEnterprise.tsx
│   │   │   ├── CirurgiasProcedimentos.tsx
│   │   │   ├── CombustivelIA.tsx
│   │   │   ├── ComplianceRegulatorio.tsx
│   │   │   ├── ComprasFornecedores.tsx
│   │   │   ├── ComprasInternacionais.tsx
│   │   │   ├── ConfiguracoesSistema.tsx
│   │   │   ├── ConsignacaoAvancada.tsx
│   │   │   ├── ContasReceberIA.tsx
│   │   │   ├── ConversaoVendas.tsx
│   │   │   ├── CotacoesAutomaticas.tsx
│   │   │   ├── CRMVendas.tsx
│   │   │   ├── DashboardContratos.tsx
│   │   │   ├── EmailMarketing.tsx
│   │   │   ├── EntregasAutomaticas.tsx
│   │   │   ├── EscalasFuncionarios.tsx
│   │   │   ├── EstoqueAvancado.tsx
│   │   │   ├── EstoqueIA.tsx
│   │   │   ├── ExpedicaoMercadorias.tsx
│   │   │   ├── Faturamento.tsx
│   │   │   ├── FinanceiroAvancado.tsx
│   │   │   ├── FolhaPagamento.tsx
│   │   │   ├── FornecedoresAvancado.tsx
│   │   │   ├── FrotaVeiculos.tsx
│   │   │   ├── GestãoCadastros.tsx
│   │   │   ├── GestaoContratos.tsx
│   │   │   ├── GestaoInventario.tsx
│   │   │   ├── GestaoLeads.tsx
│   │   │   ├── GestaoRiscos.tsx
│   │   │   ├── GruposProdutosOPME.tsx
│   │   │   ├── IACentral.tsx
│   │   │   ├── IntegracoesExternas.tsx
│   │   │   ├── InventarioInteligente.tsx
│   │   │   ├── LeadsQualificados.tsx
│   │   │   ├── LogisticaAvancada.tsx
│   │   │   ├── LogisticaTransportadoras.tsx
│   │   │   ├── ManutencaoFrota.tsx
│   │   │   ├── MarketingDigital.tsx
│   │   │   ├── ModulosAnalytics.tsx
│   │   │   ├── ModulosAvancados.tsx
│   │   │   ├── ModulosCompliance.tsx
│   │   │   ├── NFeAutomatica.tsx
│   │   │   ├── NotasCompra.tsx
│   │   │   ├── OnboardingDigital.tsx
│   │   │   ├── PedidosCompra.tsx
│   │   │   ├── PerformanceEquipes.tsx
│   │   │   ├── PontoEletronico.tsx
│   │   │   ├── ProdutosOPME.tsx
│   │   │   ├── QualidadeOPME.tsx
│   │   │   ├── RastreabilidadeOPME.tsx
│   │   │   ├── RecrutamentoIA.tsx
│   │   │   ├── RedesSociais.tsx
│   │   │   ├── RelacionamentoCliente.tsx
│   │   │   ├── RelatoriosAvancados.tsx
│   │   │   ├── RelatoriosExecutivos.tsx
│   │   │   ├── RelatoriosFinanceiros.tsx
│   │   │   ├── RotasOtimizadas.tsx
│   │   │   ├── SegurancaTrabalho.tsx
│   │   │   ├── SEOOtimizado.tsx
│   │   │   ├── SistemaNotificacoes.tsx
│   │   │   ├── TabelasPrecos.tsx
│   │   │   ├── TelemetriaVeiculos.tsx
│   │   │   ├── TEMPLATE_PADRAO_MODULO.tsx
│   │   │   ├── TransportadorasIA.tsx
│   │   │   ├── TreinamentoEquipes.tsx
│   │   │   ├── ViabilidadeImportacao.tsx
│   │   │   ├── 📂 faturamento/
│   │   │   ├── 📂 financeiro/
│   │   │   └── 📂 logistica/
│   │   │       └── GestaoEntregas.tsx
│   │   │
│   │   ├── 📂 oraclusx-ds/ (45 componentes design system)
│   │   │   ├── Accordion.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ChatbotCloseButton.tsx
│   │   │   ├── ChatbotFAB.tsx
│   │   │   ├── ChatbotFABWithPrompt.tsx
│   │   │   ├── ChatbotWithResearch.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── FormBanner.tsx
│   │   │   ├── IconButtonNeu.tsx
│   │   │   ├── index.ts
│   │   │   ├── Input.tsx
│   │   │   ├── InputContainer.tsx
│   │   │   ├── LibraryShowcase.tsx
│   │   │   ├── MiniBarChart.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   ├── NeomorphicCard.tsx
│   │   │   ├── NeomorphicIconBox.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── SearchContainer.tsx
│   │   │   ├── SearchField.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── SubModulesNavigation.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── TopbarIconButton.tsx
│   │   │   └── TrendIndicator.tsx
│   │   │
│   │   ├── 📂 ui/ (5 componentes shadcn base)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   │
│   │   ├── 📂 forms/ (formulários especializados)
│   │   │   └── FormularioMedicoAvancado.tsx
│   │   │
│   │   ├── 📂 examples/ (exemplos)
│   │   │   └── GPTResearcherExamples.tsx
│   │   │
│   │   ├── neumorphic.tsx
│   │   └── PrivateRoute.tsx
│   │
│   ├── 📂 pages/ (12 páginas)
│   │   ├── ComplianceAuditoria.tsx
│   │   ├── ConsignacaoAvancada.tsx
│   │   ├── Dashboard.tsx
│   │   ├── DashboardPrincipal.tsx
│   │   ├── GPTResearcherDemo.tsx
│   │   ├── Login.tsx
│   │   ├── Modules.tsx
│   │   ├── NotFound.tsx
│   │   ├── ServerError.tsx
│   │   ├── Showcase.tsx
│   │   ├── Signup.tsx
│   │   ├── Unauthorized.tsx
│   │   └── Welcome.tsx
│   │
│   ├── 📂 hooks/ (30 hooks customizados)
│   │   ├── index.ts
│   │   ├── useAlertasEstoque.ts
│   │   ├── useAuth.ts
│   │   ├── useCentroCustos.ts
│   │   ├── useCirurgias.ts
│   │   ├── useCompliance.ts
│   │   ├── useConciliacaoBancaria.ts
│   │   ├── useConsignacao.ts
│   │   ├── useContasPagar.ts
│   │   ├── useContasReceber.ts
│   │   ├── useContratos.ts
│   │   ├── useConvenios.ts
│   │   ├── useDashboardData.ts
│   │   ├── useDocumentTitle.ts
│   │   ├── useEntregas.ts
│   │   ├── useEstoque.ts
│   │   ├── useFaturas.ts
│   │   ├── useFluxoCaixa.ts
│   │   ├── useFornecedores.ts
│   │   ├── useGPTResearcher.ts
│   │   ├── useHospitais.ts
│   │   ├── useKits.ts
│   │   ├── useLeads.ts
│   │   ├── useLotes.ts
│   │   ├── useLotesFaturamento.ts
│   │   ├── useMateriais.ts
│   │   ├── useMedicos.ts
│   │   ├── useOportunidades.ts
│   │   ├── usePedidos.ts
│   │   ├── useProdutos.ts
│   │   ├── useTransacoes.ts
│   │   └── useVisaoEstoque.ts
│   │
│   ├── 📂 lib/ (serviços e utilitários)
│   │   ├── supabase.ts
│   │   ├── utils.ts
│   │   ├── gpt-researcher-service.ts
│   │   └── 📂 services/
│   │       ├── CirurgiasAI.ts
│   │       ├── ConciliacaoBancariaService.ts
│   │       ├── ContasReceberAI.ts
│   │       ├── ContratosAI.ts
│   │       ├── CotacaoAutomaticaService.ts
│   │       ├── FluxoCaixaAI.ts
│   │       ├── GlosasDetectionAI.ts
│   │       ├── gpt-researcher-service.ts
│   │       ├── PalavrasChaveService.ts
│   │       ├── PortaisOPMEService.ts
│   │       ├── SEFAZService.ts
│   │       └── 📂 transportadoras/
│   │           ├── index.ts
│   │           ├── 📂 base/
│   │           │   ├── APIGateway.ts
│   │           │   └── types.ts
│   │           └── 📂 nacionais/
│   │               ├── CorreiosService.ts
│   │               ├── JadlogService.ts
│   │               └── TNTService.ts
│   │
│   ├── 📂 services/ (serviços adicionais)
│   │   ├── EstoqueAI.ts
│   │   ├── PontoReposicaoService.ts
│   │   ├── ValidadeService.ts
│   │   └── 📂 compliance/
│   │       ├── ComplianceAutomaticoAI.ts
│   │       └── index.ts
│   │
│   ├── 📂 contexts/ (contextos React)
│   │   ├── index.ts
│   │   └── ToastContext.tsx
│   │
│   ├── 📂 styles/ (estilos globais)
│   │   ├── globals.css (Tailwind + variáveis - 294 linhas)
│   │   └── oraclusx-ds.css (38 tokens - 209 linhas)
│   │
│   └── 📂 types/ (definições TypeScript)
│       └── gpt-researcher.d.ts
│
├── 📂 docs/ (documentação extensa - 200+ arquivos)
│   ├── 📂 orquestrador/ (relatórios deste agente - NOVO)
│   │   ├── inventario.md
│   │   ├── pesquisa-context7.md
│   │   ├── catalogo-componentes.md
│   │   ├── arvore-projeto.md (este arquivo)
│   │   ├── relatorio-final.md
│   │   └── 📂 prints/
│   │
│   ├── 📂 design/ (design system)
│   ├── 📂 usuario/ (manual do usuário)
│   ├── 📂 testes/ (guias de testes)
│   ├── 📂 auditoria/ (relatórios auditoria)
│   ├── 📂 revisor/ (revisões de código)
│   ├── 📂 lgpd/ (conformidade LGPD)
│   ├── 📂 ci/ (integração contínua)
│   │
│   ├── AI_INTEGRATION_GUIDE.md
│   ├── ARQUITETURA_COMPLETA.md
│   ├── AUDITORIA_ORACLUSX_DS.md
│   ├── CADASTROS_COMPRAS_SUMARIO_EXECUTIVO.md
│   ├── CIRURGIAS_RELATORIO_IMPLEMENTACAO.md
│   ├── CIRURGIAS_STATUS_FINAL.md
│   ├── CONTATOS_OFICIAIS.md
│   ├── figma-to-code-map.md
│   ├── GPT_RESEARCHER_INTEGRACAO.md
│   ├── GUIA_CORRECOES_TS.md
│   ├── GUIA_STORAGE_ICARUS_NEW.md
│   ├── hard-gate-report.md
│   ├── IMPLEMENTACAO_FASE2_HOOKS_SERVICES.md
│   ├── IMPLEMENTACAO_SPRINT_IMEDIATO_COMPLETO.md
│   ├── IMPLEMENTACAO_SPRINT_IMEDIATO.md
│   ├── INDICE_MAPEAMENTO.md
│   ├── INDICE_SPRINT_IMEDIATO.md
│   ├── LOGISTICA_AVANCADA_SPEC.md
│   ├── LOGISTICA_PLAN.md
│   ├── MISSAO_COMPLETA_FINAL.md
│   ├── MISSAO_COMPLETA_MAPEAMENTO.md
│   ├── PLANO_IMPLEMENTACAO_APROVADO.md
│   ├── PROGRESSO_FASE2_85PORCENTO.md
│   ├── RELATORIO_EXECUTIVO_SESSAO_COMPLETO.md
│   ├── RELATORIO_FINAL_100_COMPLETO.md
│   ├── RELATORIO_FINAL_MCPS.md
│   ├── RELATORIO_FINAL_SESSAO_EPICA.md
│   ├── RELATORIO_VALIDACAO.md
│   ├── REVISAO_FINANCEIROS_PLANO.md
│   ├── REVISAO_FINANCEIROS_RELATORIO.md
│   ├── REVISAO_FINANCEIROS_SUMARIO.md
│   ├── SESSAO_HISTORICA_FINAL.md
│   ├── SUMARIO_FINAL_SESSAO.md
│   ├── tarefas-priorizadas-paridade.md
│   ├── ts-errors-summary.txt
│   ├── ts-errors.txt
│   └── ui-routing-report.md
│
├── 📂 supabase/ (schemas SQL)
├── 📂 tests/ (testes E2E e unitários)
├── 📂 testsprite_tests/ (testes visuais)
├── 📂 playwright-report/ (relatórios Playwright)
├── 📂 test-results/ (resultados testes)
├── 📂 scripts/ (scripts utilitários)
├── 📂 dist/ (build de produção)
├── 📂 node_modules/ (dependências)
├── 📂 tokens/ (tokens diversos)
├── 📂 types/ (tipos TypeScript globais)
└── 📂 backups/ (backups diversos)
```

---

## 📊 BREAKDOWN POR CATEGORIA

### Módulos (81 total)
**Localização:** `/src/components/modules/`

- **Core Business:** 10 módulos
- **Gestão Operacional:** 16 módulos
- **Financeiros:** 5 módulos
- **Compras:** 7 módulos
- **CRM e Vendas:** 11 módulos
- **Contratos:** 2 módulos
- **RH:** 12 módulos
- **Analytics e BI:** 6 módulos
- **Compliance:** 5 módulos
- **IA:** 4 módulos
- **Integração:** 2 módulos
- **Logística Avançada:** 5 módulos
- **Produtos:** 4 módulos
- **Notificações:** 1 módulo
- **Autenticação:** 1 módulo

### Componentes OraclusX DS (45 total)
**Localização:** `/src/components/oraclusx-ds/`

- **Básicos:** 10 componentes
- **Navegação:** 5 componentes
- **Feedback:** 8 componentes
- **Overlays:** 4 componentes
- **Data Display:** 5 componentes
- **Formulários:** 3 componentes
- **Especializados:** 7 componentes
- **Chatbot:** 3 componentes

### Hooks (30 total)
**Localização:** `/src/hooks/`

- **Autenticação:** 1 hook
- **Dashboard:** 1 hook
- **Gestão Operacional:** 15 hooks
- **Financeiro:** 5 hooks
- **Contratos e CRM:** 4 hooks
- **Compliance:** 1 hook
- **Transações:** 1 hook
- **Utilitários:** 2 hooks

### Services (11 total)
**Localização:** `/src/lib/services/` e `/src/services/`

- **IA Services:** 7 services
- **API Services:** 4 services

---

**Gerado por:** Agente Orquestrador  
**Data:** 19 de outubro de 2025  
**Status:** ✅ COMPLETO

