## Inventário de Rotas, Páginas e Módulos — ICARUS v5

Atualizado após reinício do inventário. Lista rotas ativas no Router, itens do menu, páginas e módulos presentes no código, além de gaps entre navegação e implementação.

### Rotas Ativas (React Router)
- Públicas:
  - /login (LoginPage)
  - /signup (Signup)
  - * → NotFound
- Protegidas (envoltas por PrivateRoute):
  - / → Dashboard
  - /dashboard → Dashboard
  - Cadastros:
    - /cadastros
    - /cadastros/medicos
    - /cadastros/hospitais
    - /cadastros/pacientes
    - /cadastros/convenios
    - /cadastros/fornecedores
    - /cadastros/produtos
    - /cadastros/equipes
    - /cadastros/transportadoras
    - /cadastros/tabelas-precos
  - Compras:
    - /compras
    - /compras/cotacoes
    - /compras/pedidos
    - /compras/notas
    - /compras/notas-v2
    - /compras/pesquisa
  - Integrações:
    - /integracoes/credenciais

Totais: públicas 2 + fallback, protegidas 16, total 19.

### Itens de Menu (src/config/menuConfig.ts) sem rota no Router
- Top-level sem Route correspondente no App.tsx:
  - /cirurgias
  - /estoque (+ subrotas: /estoque/consulta, /estoque/movimentacoes, /estoque/consignacao)
  - /vendas
  - /financeiro (+ subrotas: /financeiro/contas-pagar, /financeiro/contas-receber, /financeiro/fluxo-caixa)
  - /compliance
  - /relatorios
  - /chatbot
  - /usuarios
  - /configuracoes

Ação sugerida: criar Routes protegidas para estes caminhos ou ocultá-los do menu via permissão/feature-flag até implementação.

### Páginas descobertas (src/pages/**/*.tsx)
- Autenticação e Gerais: LoginPage.tsx, Login.tsx, Signup.tsx, NotFound.tsx, Unauthorized.tsx, ServerError.tsx, Welcome*.tsx, Modules.tsx, Showcase.tsx
- Dashboards/Financeiro: DashboardPrincipal.tsx, Dashboard.tsx, DashboardFinanceiro.tsx, MonitoringDashboard.tsx
- Cadastros: Médicos, Hospitais, Pacientes, Convênios, Fornecedores, Produtos OPME, Equipes Médicas, Transportadoras, Tabelas de Preços, Pessoa Jurídica
- Compras: pages/compras/* (Notas, NotasReformatted, GestaoCotacoes) e features/compras/pages/* (Dashboard, Pedidos, Pesquisa, etc.)
- Integrações: src/pages/integracoes/GerenciadorCredenciais.tsx
- Módulos avançados: pages/modules/* (APIGatewayDashboard, BIDashboardInterativo, GestaoContabil, Microsoft365IntegrationPanel, RelatoriosRegulatorios, etc.)

Observações:
- Duplicatas/legados: LoginPage.tsx vs Login.tsx; DashboardPrincipal.tsx vs Dashboard.tsx. O App.tsx usa LoginPage e DashboardPrincipal.
- Parte das páginas em pages/modules/* não estão roteadas no App.tsx atual.

### Features (src/features/**/pages)
- features/compras/pages/: DashboardCompras, GestaoCotacoes, NotasCompra, NotasCompraReformatted, PedidosCompra, PesquisaPrecos

### Módulos (src/components/modules)
Amostra (existem dezenas):
- Operação: CirurgiasProcedimentos, ConsignacaoAvancada, EstoqueIA, LogisticaAvancada, LogisticaTransportadoras, RastreabilidadeOPME
- BI/Relatórios: BIDashboardInterativo, APIGatewayDashboard, GestaoContabil, RelatoriosRegulatorios, RelatoriosExecutivos, RelatoriosFinanceiros, AnalyticsBI, BIAnalytics
- Administração: GestaoUsuariosPermissoes, ConfiguracoesSistema, QualidadeOPME, ComplianceRegulatorio, FinanceiroAvancado
- Integrações/IA: IntegrationsManager, IntegracoesExternas, Microsoft365IntegrationPanel, AutomacaoIA, IACentral, ChatBotMetrics

Muitos desses módulos estão prontos para composição, porém ainda sem mapeamento no Router principal.

### Gaps e Próximas Ações
- Rotas faltantes para itens do menu listados acima. Sugestão:
  - Adicionar rotas protegidas placeholder para /cirurgias, /estoque/*, /financeiro/*, /vendas, /compliance, /relatorios, /usuarios, /configuracoes.
  - Conectar páginas existentes em src/pages/modules/* e src/components/modules/* às rotas.
- Duplicatas a consolidar:
  - Unificar LoginPage.tsx vs Login.tsx (manter LoginPage.tsx).
  - Unificar DashboardPrincipal.tsx vs Dashboard.tsx (manter DashboardPrincipal.tsx).
- Consistência de Compras:
  - Há páginas em src/pages/compras/* e em src/features/compras/pages/*. Padronizar uso da pasta features.
- Acesso/Permissões:
  - Ao criar rotas novas, manter PrivateRoute e checagens via useMenuFiltrado/useAuth.

### Estado do Inventário
- Router principal auditado: OK
- Menu auditado: OK (com gaps mapeados)
- Páginas e módulos listados: OK
- Próximo passo opcional: criar rotas placeholders e vincular módulos existentes.

> Baseado em: src/App.tsx, src/config/menuConfig.ts, src/pages/**/*, src/features/**/pages/**/*, src/components/modules/*.
