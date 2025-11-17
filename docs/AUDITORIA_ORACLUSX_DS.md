# Auditoria OraclusX Design System

## Visão Geral

Este documento contém a auditoria completa do Design System OraclusX utilizado no Icarus v5.0.

## Status Atual

### Componentes Implementados ✅

#### Básicos

- **Button** - Completo com variantes
- **Input** - Text, Number, Email, Password
- **Checkbox** - Básico e grupos
- **Radio** - Básico e grupos
- **Select** - Dropdown simples
- **Textarea** - Área de texto
- **Label** - Rótulos de formulário

#### Layout

- **Card** - Container básico
- **Container** - Layout responsivo
- **Divider** - Separadores
- **Grid** - Sistema de grid
- **Stack** - Layout vertical/horizontal

#### Feedback

- **Alert** - Alertas contextuais
- **Badge** - Badges e tags
- **Spinner** - Loading indicator
- **Toast** - Notificações temporárias
- **Progress** - Barra de progresso

### Componentes Enterprise Faltantes ❌

#### Críticos (Prioridade Alta)

- **DataGrid/Table** - Tabelas complexas com paginação, filtros, sort
- **DatePicker** - Seletor de datas
- **DateRangePicker** - Intervalo de datas
- **TimePicker** - Seletor de horário
- **FileUpload** - Upload de arquivos com preview
- **AutoComplete** - Input com sugestões
- **MultiSelect** - Seleção múltipla avançada
- **RichTextEditor** - Editor de texto rico

#### Médios

- **TreeView** - Visualização hierárquica
- **Stepper** - Wizard multi-etapas
- **Tabs Advanced** - Tabs com drag-drop
- **Drawer** - Painel lateral
- **Modal Advanced** - Modais complexos
- **Tooltip Advanced** - Tooltips ricos
- **Popover** - Popovers contextuais

#### Baixos

- **Calendar** - Calendário completo
- **ColorPicker** - Seletor de cores
- **Rating** - Classificação por estrelas
- **Slider** - Range sliders
- **Transfer** - Lista de transferência

## Componentes Específicos OPME

### Faltando (Crítico)

- **CirculaçãoSelector** - Seletor de cirurgias
- **ProdutoOPMECard** - Card de produto OPME com UDI
- **ConsignacaoTable** - Tabela de consignação
- **FaturamentoWizard** - Wizard de faturamento TISS
- **RastreabilidadeTimeline** - Timeline de rastreabilidade
- **GuiaTISSForm** - Formulário de guia TISS
- **NFSeViewer** - Visualizador de NF-e/NFS-e

## Padrões de Design

### Neumorphic Style

O OraclusX DS utiliza um estilo neumórfico moderno com:

- Sombras suaves
- Elevações sutis
- Bordas arredondadas
- Gradientes suaves

### Tokens de Design

#### Cores

```typescript
const colors = {
  primary: "#1E40AF",
  secondary: "#64748B",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};
```

#### Espaçamento

```typescript
const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
};
```

#### Typography

```typescript
const typography = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
  },
};
```

## Gaps Identificados

### Alta Prioridade

1. **DataGrid** - Crítico para listagens de produtos, cirurgias, faturamento
2. **DatePicker/RangePicker** - Usado em >50% dos módulos
3. **FileUpload** - Necessário para anexos de documentos
4. **AutoComplete** - Essencial para busca de produtos/clientes

### Média Prioridade

5. **Stepper/Wizard** - Usado em processos multi-etapas
6. **TreeView** - Categorização de produtos
7. **Drawer** - Painéis laterais de detalhes

### Baixa Prioridade

8. **Calendar** - Nice-to-have para visualização mensal
9. **ColorPicker** - Personalização de temas
10. **Rating** - Avaliação de fornecedores

## Recomendações

### Imediatas (30 dias)

1. Implementar **DataGrid** usando biblioteca como AG-Grid ou TanStack Table
2. Implementar **DatePicker/RangePicker** usando date-fns + custom component
3. Criar **FileUpload** com drag-drop e preview
4. Implementar **AutoComplete** com debounce e async search

### Curto Prazo (60 dias)

5. Criar componentes específicos OPME
6. Implementar **Stepper** para wizards
7. Adicionar **Drawer** e **Modal Advanced**

### Médio Prazo (90 dias)

8. Completar biblioteca de componentes enterprise
9. Criar storybook completo
10. Documentação interativa

## Dependências Sugeridas

```json
{
  "@tanstack/react-table": "^8.x",
  "react-datepicker": "^4.x",
  "react-dropzone": "^14.x",
  "react-select": "^5.x",
  "recharts": "^2.x",
  "ag-grid-react": "^31.x"
}
```

## Integração com Shadcn/UI

O projeto já utiliza `components.json`, sugerindo integração com shadcn/ui. Componentes que podem ser aproveitados:

- ✅ Button
- ✅ Input
- ✅ Select
- ⏳ DataTable (precisa ser configurado)
- ⏳ DatePicker (precisa ser adicionado)
- ⏳ Form (validação com react-hook-form + zod)

## Roadmap de Implementação

### Fase 1 - Componentes Críticos (Sprint 1-2)

- [ ] DataGrid/Table component
- [ ] DatePicker
- [ ] DateRangePicker
- [ ] FileUpload

### Fase 2 - Componentes Médios (Sprint 3-4)

- [ ] AutoComplete
- [ ] MultiSelect
- [ ] Stepper/Wizard
- [ ] Drawer

### Fase 3 - Componentes OPME (Sprint 5-6)

- [ ] CircurgiaSelector
- [ ] ProdutoOPMECard
- [ ] ConsignacaoTable
- [ ] FaturamentoWizard

### Fase 4 - Polimento (Sprint 7-8)

- [ ] Storybook completo
- [ ] Testes de componentes
- [ ] Documentação interativa
- [ ] Acessibilidade (WCAG 2.1 AA)

## Métricas de Qualidade

### Acessibilidade

- [ ] Navegação por teclado
- [ ] ARIA labels
- [ ] Contraste de cores (WCAG AA)
- [ ] Screen reader support

### Performance

- [ ] Lazy loading de componentes
- [ ] Tree shaking
- [ ] Bundle size < 100KB por componente

### Testes

- [ ] Unit tests (Jest + RTL)
- [ ] Visual regression tests (Chromatic)
- [ ] E2E tests (Playwright)

## Conclusão

O OraclusX DS possui uma base sólida de componentes básicos, mas necessita de componentes enterprise para suportar as funcionalidades completas do Icarus v5.0. A implementação dos componentes críticos deve ser priorizada para desbloquear o desenvolvimento dos módulos principais.

**Score Atual:** 45/100  
**Score Alvo:** 95/100  
**Gap:** 50 pontos (componentes enterprise + OPME específicos)

---

**Última Atualização:** 2025-10-27  
**Responsável:** Orquestrador-ICARUS + Gestão-Empresarial
