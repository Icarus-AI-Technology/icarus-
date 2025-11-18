# 📋 PLANEJAMENTO COMPLETO - MÓDULOS CADASTROS & COMPRAS

**Sistema**: ICARUS v5.0  
**Data Início**: 2025-01-20  
**Design System**: OraclusX DS  
**Prioridade**: Alta  

---

## 🎯 OBJETIVO

Implementar **100%** dos módulos **Cadastros Inteligentes** e **Compras & Fornecedores** conforme documentação técnica fornecida, mantendo rigorosa conformidade com:
- ✅ OraclusX Design System
- ✅ Hard Gates (sem `text-*`, `font-*`, hex colors)
- ✅ Neumorphism Premium 3D + Liquid Glass
- ✅ Quantidade exata de sub-módulos documentada
- ✅ Todas as funcionalidades e integrações especificadas

---

## 📊 ESTRUTURA DOS MÓDULOS

### MÓDULO 1: CADASTROS INTELIGENTES (8 sub-módulos)

| # | Sub-módulo | Seções | Campos | Integrações | Status |
|---|------------|--------|--------|-------------|--------|
| 1.1 | **Médicos** | 7 | 25+ | CPF, CRM, CEP, FHIR | 🔄 Em progresso |
| 1.2 | **Hospitais** | 5 | 20+ | CNPJ, CNES, CEP | ⏳ Pendente |
| 1.3 | **Pacientes** | 6 | 22+ | CPF, CEP, LGPD | ⏳ Pendente |
| 1.4 | **Convênios** | 5 | 16+ | CNPJ, ANS | ⏳ Pendente |
| 1.5 | **Fornecedores** | 7 | 30+ | CNPJ, CEP | ⏳ Pendente |
| 1.6 | **Produtos OPME** | 7 | 35+ | ANVISA, TUSS | ⏳ Pendente |
| 1.7 | **Equipes Médicas** | 3 | 12+ | Médicos | ⏳ Pendente |
| 1.8 | **Transportadoras** | 5 | 15+ | CNPJ, API | ⏳ Pendente |

**Total**: 8 sub-módulos | 45 seções | 175+ campos | 15+ integrações

### MÓDULO 2: COMPRAS & FORNECEDORES (6 sub-módulos)

| # | Sub-módulo | Funcionalidades | Integrações | Status |
|---|------------|-----------------|-------------|--------|
| 2.1 | **Dashboard Compras** | 8 KPIs + Gráficos | Supabase | ⏳ Pendente |
| 2.2 | **Gestão de Cotações** | Criar + Enviar + IA | Fornecedores, GPT | ⏳ Pendente |
| 2.3 | **Pedidos de Compra** | Workflow completo | Fornecedores | ⏳ Pendente |
| 2.4 | **Notas de Compra** | Parse XML + SEFAZ | SEFAZ, Supabase | ⏳ Pendente |
| 2.5 | **Compras Internacionais** | Tributos + Desembaraço | Receita Federal | ⏳ Pendente |
| 2.6 | **IA para Compras** | Recomendação + Análise | GPT-4, ML | ⏳ Pendente |

**Total**: 6 sub-módulos | 30+ funcionalidades | 10+ integrações

---

## 🏗️ ARQUITETURA DE IMPLEMENTAÇÃO

### CAMADA 1: SERVIÇOS (Backend Logic)

```
src/services/
├── CadastrosService.ts          ✅ CONCLUÍDO (890 linhas)
├── ValidacaoService.ts           ✅ CONCLUÍDO (635 linhas)
├── DuplicateDetectionService.ts  🔄 Em progresso
├── AutocompleteService.ts        ⏳ Pendente
├── ComprasService.ts             ⏳ Pendente
├── CotacoesService.ts            ⏳ Pendente
├── ComprasAI.ts                  ⏳ Pendente
├── FornecedorIntegrationService.ts ⏳ Pendente
└── NFEParserService.ts           ⏳ Pendente
```

### CAMADA 2: COMPONENTES (Frontend)

#### Cadastros Inteligentes
```
src/pages/cadastros/
├── DashboardCadastros.tsx        ⏳ Pendente
├── CadastroMedicos.tsx           ⏳ Pendente
├── CadastroHospitais.tsx         ⏳ Pendente
├── CadastroPacientes.tsx         ⏳ Pendente
├── CadastroConvenios.tsx         ⏳ Pendente
├── CadastroFornecedores.tsx      ⏳ Pendente
├── CadastroProdutosOPME.tsx      ⏳ Pendente
├── EquipesMedicas.tsx            ⏳ Pendente
├── Transportadoras.tsx           ⏳ Pendente
└── ImportacaoMassa.tsx           ⏳ Pendente
```

#### Compras & Fornecedores
```
src/pages/compras/
├── DashboardCompras.tsx          ✅ CRIADO (placeholder)
├── GestaoCotacoes.tsx            ⏳ Pendente
├── PedidosCompra.tsx             ⏳ Pendente
├── NotasCompra.tsx               ⏳ Pendente
├── ComprasInternacionais.tsx     ⏳ Pendente
└── IACompras.tsx                 ⏳ Pendente
```

### CAMADA 3: HOOKS E CONTEXTOS

```
src/hooks/
├── useCadastrosKPIs.ts           ⏳ Pendente
├── useComprasKPIs.ts             ⏳ Pendente
├── useValidacao.ts               ⏳ Pendente
└── useDuplicateDetection.ts      ⏳ Pendente
```

---

## 🎨 DESIGN SYSTEM - COMPONENTES REUTILIZÁVEIS

### Componentes Específicos para Cadastros
```
src/components/cadastros/
├── ValidationInput.tsx           ⏳ Pendente (CPF, CNPJ, CRM)
├── CRMValidationInput.tsx        ⏳ Pendente
├── CNPJValidationInput.tsx       ⏳ Pendente
├── AutocompleteInput.tsx         ⏳ Pendente
├── EnderecoFields.tsx            ⏳ Pendente (CEP + campos)
├── FileUploadZone.tsx            ⏳ Pendente
├── RatingInput.tsx               ⏳ Pendente (5 estrelas)
├── DuplicatasList.tsx            ⏳ Pendente
└── FormularioContainer.tsx       ⏳ Pendente
```

### Componentes Específicos para Compras
```
src/components/compras/
├── CotacaoForm.tsx               ⏳ Pendente
├── PedidoTimeline.tsx            ⏳ Pendente
├── NFEViewer.tsx                 ⏳ Pendente
├── FornecedorRecomendacao.tsx    ⏳ Pendente
└── ViabilidadeImportacao.tsx     ⏳ Pendente
```

---

## 🔗 INTEGRAÇÕES EXTERNAS

### APIs Governamentais
| API | Uso | Endpoint | Status |
|-----|-----|----------|--------|
| **Brasil API - CPF** | Validação CPF | `brasilapi.com.br/api/cpf/v1/{cpf}` | ✅ Implementado |
| **Brasil API - CNPJ** | Validação CNPJ | `brasilapi.com.br/api/cnpj/v1/{cnpj}` | ✅ Implementado |
| **ViaCEP** | Busca CEP | `viacep.com.br/ws/{cep}/json/` | ✅ Implementado |
| **CFM** | Validação CRM | Scraping (pending API) | ⚠️ Formato only |
| **ANVISA** | Produtos OPME | Pending API | ⚠️ Formato only |
| **ANS** | Convênios | Pending API | ⚠️ Formato only |
| **CNES/DATASUS** | Hospitais | Pending API | ⚠️ Formato only |

### APIs de IA
| Serviço | Uso | Status |
|---------|-----|--------|
| **GPT-4** | Autocomplete, recomendações | ⏳ Pendente |
| **GPT Researcher** | Análise de compras | ✅ Disponível |

### Padrões de Saúde
| Padrão | Uso | Status |
|--------|-----|--------|
| **FHIR HL7** | Sincronização médicos/pacientes | ⏳ Pendente |
| **TUSS ANS** | Códigos especialidades/procedimentos | ⏳ Pendente |

---

## 📐 ESPECIFICAÇÕES TÉCNICAS

### Performance
- ⚡ Lazy loading de componentes pesados
- 🎯 Debounce em validações (500ms)
- 💾 Cache de consultas API (5min)
- 📊 Virtual scrolling em listas >100 itens

### Validações
- ✅ Validação em tempo real (onChange)
- ✅ Feedback visual imediato
- ✅ Mensagens de erro contextuais
- ✅ Bloqueio de submit com erros

### Acessibilidade (A11y AA)
- ♿ Labels em todos os inputs
- ⌨️ Navegação por teclado
- 🎯 Focus management
- 📢 ARIA labels

### Hard Gates Compliance
- ❌ Sem `text-*` ou `font-*` Tailwind
- ❌ Sem cores hex diretas
- ✅ Apenas `var(--orx-*)` CSS variables
- ✅ Sombras do OraclusX DS

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### FASE 1: Serviços Base (2-3h) ✅ 66% COMPLETO
- [x] CadastrosService (890 linhas)
- [x] ValidacaoService (635 linhas)
- [ ] DuplicateDetectionService (800 linhas estimadas)
- [ ] AutocompleteService (400 linhas)

### FASE 2: Dashboard Cadastros (2h)
- [ ] DashboardCadastros component
- [ ] 8 KPIs cards
- [ ] Gráficos (Recharts)
- [ ] Alertas e duplicatas

### FASE 3: Formulários Cadastros (8-10h)
- [ ] FormularioMedicoAvancado (7 seções)
- [ ] FormularioHospital (5 seções)
- [ ] FormularioPaciente (6 seções + LGPD)
- [ ] FormularioConvenio (5 seções)
- [ ] FormularioFornecedorAvancado (7 seções)
- [ ] FormularioProdutoOPMEAvancado (7 seções)
- [ ] FormularioEquipesMedicas (3 seções)
- [ ] FormularioTransportadora (5 seções)

### FASE 4: Importação em Massa (2h)
- [ ] ImportacaoMassaCadastros
- [ ] Parse CSV/Excel
- [ ] Validação em lote
- [ ] Preview e correção

### FASE 5: Dashboard Compras (2h)
- [ ] DashboardCompras component
- [ ] 8 KPIs cards
- [ ] Gráficos e análises

### FASE 6: Módulos Compras (6-8h)
- [ ] GestaoCotacoes (IA recomendação)
- [ ] PedidosCompra (workflow)
- [ ] NotasCompra (XML parser)
- [ ] ComprasInternacionais
- [ ] IACompras

### FASE 7: Rotas e Navegação (1h)
- [ ] Adicionar rotas em App.tsx
- [ ] Atualizar IcarusSidebar
- [ ] Testar navegação

### FASE 8: Testes e Refinamento (2h)
- [ ] Testes de integração
- [ ] Testes de validação
- [ ] Ajustes de UX
- [ ] Documentação

**TOTAL ESTIMADO**: 25-30 horas

---

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcional
- [ ] Todos os 8 sub-módulos de Cadastros funcionais
- [ ] Todos os 6 sub-módulos de Compras funcionais
- [ ] Validações em tempo real funcionando
- [ ] Detecção de duplicatas ativa
- [ ] Importação CSV/Excel operacional
- [ ] Dashboards com dados reais
- [ ] Integração com Supabase completa

### Design
- [ ] 100% OraclusX DS compliance
- [ ] Neumorphism Premium 3D aplicado
- [ ] Liquid Glass em elementos chave
- [ ] Dark mode funcionando perfeitamente
- [ ] Responsivo (desktop, tablet, mobile)
- [ ] Animações suaves

### Performance
- [ ] Tempo de carregamento < 2s
- [ ] Validações < 500ms
- [ ] Busca/filtros < 1s
- [ ] Sem travamentos

### Qualidade
- [ ] Zero erros de TypeScript
- [ ] Zero erros de linter
- [ ] Código documentado
- [ ] Testes passando

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Prioridades
1. **Serviços primeiro** (lógica de negócio)
2. **Dashboards** (visão geral)
3. **Formulários principais** (Médicos, Produtos, Cotações)
4. **Formulários secundários**
5. **Features avançadas** (IA, importação)

### Dependências Críticas
- Supabase schema deve estar alinhado com tipos
- APIs externas podem ter rate limits
- Algumas integrações precisam de mocks temporários

### Decisões Técnicas
- **Estado**: Zustand + React Query para cache
- **Formulários**: React Hook Form + Zod
- **Validações**: Yup ou Zod schema
- **Upload**: Supabase Storage
- **Gráficos**: Recharts
- **Tabelas**: TanStack Table

---

## 🎉 RESULTADO ESPERADO

Ao final desta implementação, o ICARUS v5.0 terá:

✅ **14 sub-módulos totalmente funcionais**
✅ **175+ campos cadastrais validados**
✅ **25+ integrações ativas**
✅ **2 dashboards completos com analytics**
✅ **Sistema de importação em massa**
✅ **IA para recomendações e análises**
✅ **Detecção automática de duplicatas**
✅ **100% compliance com OraclusX DS**
✅ **Experiência de usuário premium**

---

**Desenvolvido com 💎 pela equipe ICARUS v5.0**  
**Planejamento completo - Versão 1.0**  
**Data: 2025-01-20**

