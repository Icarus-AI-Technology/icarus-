# 📋 Lista de Tarefas Priorizadas - Paridade Figma → Código

**Versão:** 1.0  
**Data:** 19 de outubro de 2025  
**Status:** 🟢 Ativo  
**Fonte:** Relatórios de Mapeamento e Roteamento UX

---

## 🎯 Visão Geral

**Score Atual de Paridade:** 76.75%  
**Target:** 92%  
**Delta:** +15.25%  
**Esforço Total:** ~23h 20min

---

## 🔥 SPRINT IMEDIATO (1-2 dias = 8h)

### Prioridade: CRÍTICA ⚠️

#### Dia 1 (4h)

**1. Adicionar 59 Rotas Faltantes em App.tsx** ⏱️ 2h
```typescript
// Responsável: FE
// Arquivo: /src/App.tsx

Ação:
1. Importar 59 módulos de /src/components/modules/
2. Adicionar <Route path="..." element={<Component />} /> para cada
3. Atualizar sidebar com links (opcional)
4. Testar navegação

Módulos a rotear:
- AnalyticsBI → /analytics-bi
- AnalyticsPredicao → /analytics-predicao
- AnunciosPagos → /anuncios-pagos
- AuditoriaInterna → /auditoria-interna
[... ver lista completa em ui-routing-report.md seção 1.3]

Impacto: +71% cobertura de rotas (29% → 100%)
```

**2. Criar Páginas de Erro (404/403/500)** ⏱️ 1h
```typescript
// Responsável: FE
// Criar arquivos:
- /src/pages/errors/NotFound.tsx      (30min)
- /src/pages/errors/Unauthorized.tsx  (15min)
- /src/pages/errors/ServerError.tsx   (15min)

Template base:
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-neutral-600">Página não encontrada</p>
        <Link to="/" className="btn-primary mt-4">Voltar ao início</Link>
      </div>
    </div>
  );
}

Impacto: UX profissional em erros de navegação
```

**3. Corrigir Dashboard KPIs Grid** ⏱️ 1h
```typescript
// Responsável: FE
// Arquivo: /src/pages/Dashboard.tsx

GAP: KPIs fora do grid 12 colunas

Ação:
1. Envolver KPIs em container grid-cols-12
2. Aplicar col-span apropriados:
   - KPI grande: col-span-4 (desktop), col-span-12 (mobile)
   - KPI médio: col-span-3
   - KPI pequeno: col-span-2

Exemplo:
<div className="grid grid-cols-12 gap-6">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    <KPICard title="Faturamento" value="R$ 1.2M" />
  </div>
  {/* Repetir para cada KPI */}
</div>

Impacto: Layout conforme spec, responsivo
```

#### Dia 2 (4h)

**4. Ajustes de Layout Críticos** ⏱️ 1.5h
```typescript
// Responsável: FE
// Arquivo: /src/App.tsx

Ajustes:

a) Topbar: 72px → 64px (15min)
   - Mudar py-5 para py-3
   - Validar altura final

b) Main margin: 292px → 284px (10min)
   - ml-[292px] → ml-[284px]

c) Sidebar transition: 300ms → 200ms (5min)
   - duration-300 → duration-200

d) Testar responsividade (1h)
   - Verificar em 3 breakpoints
   - Validar transições

Impacto: Layout 100% conforme spec
```

**5. Focus Ring 2px → 3px** ⏱️ 30min
```typescript
// Responsável: DS
// Arquivos:
- /src/components/oraclusx-ds/Button.tsx
- /src/components/oraclusx-ds/Input.tsx
- /src/components/oraclusx-ds/Select.tsx
- /src/components/oraclusx-ds/Checkbox.tsx
- /src/components/oraclusx-ds/Radio.tsx

Ação:
Substituir todas ocorrências de:
  focus-visible:ring-2
Por:
  focus-visible:ring-3

Impacto: A11y WCAG 2.1 AA conformidade
```

**6. Validação FormularioMedicoAvancado** ⏱️ 1h
```typescript
// Responsável: FE
// Arquivo: /src/components/forms/FormularioMedicoAvancado.tsx

Adicionar:
1. Validação CPF (11 dígitos, checksum)
2. Validação CRM (numérico + UF)
3. Validação telefone (formato BR)
4. Feedback visual de erro

Usar: Zod ou Yup para schemas

Impacto: Dados consistentes, UX profissional
```

**7. Tooltips Sidebar Collapsed** ⏱️ 1h
```typescript
// Responsável: FE
// Arquivo: /src/App.tsx (ou extrair para Sidebar.tsx)

Adicionar tooltips quando sidebar colapsada:

import { Tooltip } from '@/components/oraclusx-ds';

<Tooltip content="Dashboard" position="right" disabled={sidebarOpen}>
  <Link to="/dashboard" className="...">
    <LayoutDashboard size={20} />
    {sidebarOpen && <span>Dashboard</span>}
  </Link>
</Tooltip>

Repetir para todos itens do menu

Impacto: UX em sidebar colapsada
```

---

## 📦 SPRINT CURTO (3-5 dias = 16h)

### Prioridade: ALTA 🔴

**8. Criar 7 Formulários Especializados** ⏱️ 14h
```typescript
// Responsável: FE
// Diretório: /src/components/forms/

Formulários (2h cada):

a) FormularioPaciente.tsx
   - Nome completo, CPF, data nascimento
   - Contato, endereço (CEP API)
   - Convênio, histórico médico
   - Validações LGPD

b) FormularioHospital.tsx
   - CNPJ, razão social (Receita Federal API)
   - Endereço completo
   - Especialidades, leitos
   - Certificações

c) FormularioConvenio.tsx
   - Dados cadastrais
   - Tabela de preços (CBHPM, TUSS)
   - Regras de autorização
   - Prazo reembolso

d) FormularioFornecedor.tsx
   - CNPJ, dados empresa
   - Produtos fornecidos
   - Certificações ANVISA
   - Avaliação, histórico

e) FormularioProdutoOPME.tsx
   - Código ANVISA, registro
   - Nome, fabricante
   - Categoria, especificações
   - Valor, dimensões

f) FormularioCirurgia.tsx
   - Médico, hospital, convênio
   - Procedimento, data
   - Paciente (vinculado)
   - Materiais OPME

g) FormularioContainer.tsx
   - Número rastreio, lote
   - Produtos contidos
   - RFID, QR Code
   - Status logístico

Padrão de estrutura:
- Zod schema validation
- Multi-step se necessário
- Auto-save rascunho
- Feedback visual estados
- Mobile responsive

Impacto: 12.5% → 100% formulários completos
```

**9. Ajustes Neuromorfismo** ⏱️ 1h
```typescript
// Responsável: DS

a) Button Hover Dark Mode (15min)
   Arquivo: /src/components/oraclusx-ds/Button.tsx
   
   Ajustar sombra hover em dark mode:
   .dark .btn-primary:hover {
     box-shadow: 
       12px 12px 24px rgba(0,0,0,0.5),
       -12px -12px 24px rgba(255,255,255,0.1); /* era 0.05 */
   }

b) Card Pressed State (20min)
   Arquivo: /src/components/oraclusx-ds/Card.tsx
   
   Adicionar variante:
   <Card variant="pressed" onClick={handleClick}>
   
   CSS:
   .card-pressed {
     box-shadow: 
       inset 4px 4px 8px var(--neomorphic-dark-shadow),
       inset -4px -4px 8px var(--neomorphic-light-shadow);
   }

c) TopbarIconButton Badge Position (5min)
   Arquivo: /src/components/oraclusx-ds/TopbarIconButton.tsx
   
   Ajustar:
   <span className="absolute top-0 right-0"> {/* era top-2 right-2 */}

d) Badge Contraste Success Light (10min)
   Arquivo: /src/components/oraclusx-ds/Badge.tsx
   
   Mudar:
   --badge-success: #0ea664; /* era #10b981 */
   
   Validar ratio ≥ 4.5:1

e) Testar todos estados (10min)
   - Light/dark mode
   - Hover, focus, active
   - Contraste validado

Impacto: Neuromorfismo 100% conforme spec
```

**10. Testes de Navegação** ⏱️ 1h
```typescript
// Responsável: FE/QA

Validações:

a) Testar todas 83 rotas (30min)
   - Cada rota carrega?
   - Componente correto renderiza?
   - Nenhum 404 inesperado?

b) Verificar guards auth (15min)
   - Rotas privadas protegidas?
   - Redirect correto para login?
   - Token validation OK?

c) Testar páginas erro (15min)
   - 404 em rota inválida
   - 403 sem permissão
   - 500 em erro servidor (simular)

Criar checklist:
□ / → Welcome ✅
□ /login → Login ✅
□ /dashboard → Dashboard ✅
[... 83 rotas total]

Impacto: Navegação 100% funcional e testada
```

---

## 🔄 BACKLOG CONTÍNUO

### Prioridade: MÉDIA 🟡

**11. Extrair Componentes Layout** ⏱️ 2.5h
```typescript
// Responsável: FE

Refatoração:

a) Topbar.tsx (1h)
   Extrair header de App.tsx para componente separado
   Props: darkMode, toggleDarkMode, sidebarOpen, toggleSidebar

b) Sidebar.tsx (1h)
   Extrair aside de App.tsx
   Props: isOpen, items[]
   Adicionar hover states, tooltips

c) MainLayout.tsx (30min)
   Wrapper que compõe Topbar + Sidebar + Main
   
Benefício: Código mais limpo, reutilizável
```

**12. Margins Responsivas** ⏱️ 30min
```typescript
// Responsável: FE
// Arquivo: /src/styles/globals.css

Adicionar:
@media (min-width: 1280px) {
  .container-margin { margin: 24px; }
}
@media (min-width: 768px) and (max-width: 1279px) {
  .container-margin { margin: 16px; }
}
@media (max-width: 767px) {
  .container-margin { margin: 12px; }
}

Aplicar em layouts principais
```

**13. Documentação Código** ⏱️ 2h
```typescript
// Responsável: DS + FE

Adicionar JSDoc:
/**
 * Botão neuromórfico com 6 variantes
 * @param variant - 'primary' | 'secondary' | 'ghost' | ...
 * @param size - 'sm' | 'md' | 'lg'
 * @param disabled - Desabilita interação
 * @example
 * <Button variant="primary" size="md">Salvar</Button>
 */

Aplicar em:
- Todos componentes OraclusX DS
- Módulos principais
- Formulários

Benefício: Autocomplete, melhor DX
```

### Prioridade: BAIXA 🟢

**14. Testes E2E Rotas** ⏱️ 4h
```typescript
// Responsável: QA
// Framework: Cypress ou Playwright

Criar testes:
describe('Navegação', () => {
  it('deve navegar para dashboard', () => {
    cy.visit('/');
    cy.get('[href="/dashboard"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });
  
  // Repetir para rotas principais
});

Cobertura: 24 rotas core
```

**15. Visual Regression Testing** ⏱️ 3h
```typescript
// Responsável: QA
// Framework: Percy, Chromatic ou Puppeteer

Screenshots:
- Todos componentes DS (28)
- Páginas principais (6)
- Estados: default, hover, focus, error
- Modos: light, dark

Comparação automática em CI/CD
```

---

## 📊 Resumo de Esforço

| Sprint | Tarefas | Horas | Prioridade |
|--------|---------|-------|------------|
| **Imediato (1-2 dias)** | 7 | 8h | 🔥 CRÍTICA |
| **Curto (3-5 dias)** | 3 | 16h | 🔴 ALTA |
| **Backlog** | 5 | 12h | 🟡 MÉDIA/BAIXA |
| **TOTAL** | 15 | 36h | - |

---

## 🎯 Métricas de Sucesso

### Targets Pós-Implementação

| Métrica | Atual | Target | Delta |
|---------|-------|--------|-------|
| **Score Paridade** | 76.75% | 92% | +15.25% |
| **Rotas** | 29% | 100% | +71% |
| **Formulários** | 12.5% | 100% | +87.5% |
| **Layout Conforme** | 95% | 100% | +5% |
| **GAPs Críticos** | 12 | 0 | -100% |
| **A11y WCAG AA** | 95% | 100% | +5% |

### Validação de Conclusão ✅

Considerar **PARIDADE COMPLETA** quando:

- ✅ 83/83 rotas implementadas e testadas
- ✅ 3 páginas de erro (404/403/500)
- ✅ 8/8 formulários especializados
- ✅ Dashboard e módulos em grid 12 colunas
- ✅ Focus ring 3px (A11y)
- ✅ Sidebar com tooltips
- ✅ Layout ajustado (64px, 284px, 200ms)
- ✅ Neuromorfismo 100% conforme
- ✅ Score paridade ≥ 92%

---

## 📋 Checklist de Implementação

### Sprint Imediato ⏱️ 8h

- [ ] **Tarefa 1:** Adicionar 59 rotas (2h)
  - [ ] Importar módulos
  - [ ] Adicionar Routes
  - [ ] Atualizar sidebar
  - [ ] Testar navegação

- [ ] **Tarefa 2:** Páginas erro (1h)
  - [ ] NotFound.tsx
  - [ ] Unauthorized.tsx
  - [ ] ServerError.tsx

- [ ] **Tarefa 3:** Dashboard grid (1h)
  - [ ] Grid 12 colunas
  - [ ] Col-span apropriados
  - [ ] Testar responsivo

- [ ] **Tarefa 4:** Layout ajustes (1.5h)
  - [ ] Topbar 64px
  - [ ] Main margin 284px
  - [ ] Sidebar 200ms

- [ ] **Tarefa 5:** Focus ring 3px (30min)
  - [ ] Button
  - [ ] Input
  - [ ] Select
  - [ ] Checkbox/Radio

- [ ] **Tarefa 6:** Validação formulário (1h)
  - [ ] CPF
  - [ ] CRM
  - [ ] Telefone

- [ ] **Tarefa 7:** Sidebar tooltips (1h)
  - [ ] Implementar Tooltip
  - [ ] Aplicar em itens

### Sprint Curto ⏱️ 16h

- [ ] **Tarefa 8:** 7 Formulários (14h)
  - [ ] FormularioPaciente
  - [ ] FormularioHospital
  - [ ] FormularioConvenio
  - [ ] FormularioFornecedor
  - [ ] FormularioProdutoOPME
  - [ ] FormularioCirurgia
  - [ ] FormularioContainer

- [ ] **Tarefa 9:** Neuromorfismo (1h)
  - [ ] Button hover dark
  - [ ] Card pressed
  - [ ] Badge position
  - [ ] Badge contraste

- [ ] **Tarefa 10:** Testes navegação (1h)
  - [ ] 83 rotas
  - [ ] Guards auth
  - [ ] Páginas erro

### Backlog ⏱️ 12h

- [ ] **Tarefa 11:** Extrair layout (2.5h)
- [ ] **Tarefa 12:** Margins responsivas (30min)
- [ ] **Tarefa 13:** Documentação (2h)
- [ ] **Tarefa 14:** Testes E2E (4h)
- [ ] **Tarefa 15:** Visual regression (3h)

---

## 🚀 Começar Agora

### Próxima Ação Imediata

```bash
# 1. Abrir App.tsx
code /src/App.tsx

# 2. Iniciar importação dos módulos
import AnalyticsBI from './components/modules/AnalyticsBI';
import AnalyticsPredicao from './components/modules/AnalyticsPredicao';
// ... continuar

# 3. Adicionar rotas
<Route path="/analytics-bi" element={<AnalyticsBI />} />
<Route path="/analytics-predicao" element={<AnalyticsPredicao />} />
// ... continuar

# 4. Testar
npm run dev
# Navegar para http://localhost:3000/analytics-bi
```

---

## 📞 Responsabilidades

| Área | Responsável | Tarefas | Horas |
|------|-------------|---------|-------|
| **Design System (DS)** | Time DS | Tarefa 5, 9 (parcial) | 1.5h |
| **Frontend (FE)** | Time FE | Tarefas 1-4, 6-8, 10-13 | 28.5h |
| **QA** | Time QA | Tarefas 10, 14-15 | 8h |

---

## 📚 Referências

- **Mapeamento Completo:** `/docs/figma-to-code-map.md`
- **Relatório Roteamento:** `/docs/ui-routing-report.md`
- **Spec Figma:** `/tokens/figma.tokens.json`
- **Spec Técnica:** `/icarus-spec.md`
- **OraclusX DS:** `/ORACLUSX_DS_COMPLETO.md`

---

**Documento vivo - Atualizar conforme tarefas concluídas**

**Última atualização:** 19 de outubro de 2025  
**Versão:** 1.0  
**Responsável:** Agente de Mapeamento e Roteamento UX  
**Status:** 🟢 Pronto para Execução

© 2025 ICARUS v5.0 - Icarus AI Technology

