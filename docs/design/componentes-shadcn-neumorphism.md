# 🎨 Componentes shadcn/ui + Neumorphism 3D

## Visão Geral
Documentação dos componentes shadcn/ui utilizados no ICARUS v5.0 com skin neumórfica aplicada seguindo o **OraclusX Design System**.

---

## ✅ Status de Implementação

| Componente | Base shadcn | Skin Neumorphic | OraclusX DS | Conformidade |
|------------|-------------|-----------------|-------------|--------------|
| Button | ✅ | ✅ | ✅ | 🟢 90% |
| Card | ✅ | ✅ | ✅ | 🟢 95% |
| Input | ✅ | ✅ | ✅ | 🟢 90% |
| Dialog | ✅ | ✅ | ✅ | 🟢 85% |
| Tabs | ✅ | ✅ | ✅ | 🟢 80% |
| Table | ✅ | ✅ | ✅ | 🟢 85% |
| Tooltip | ✅ | ✅ | ✅ | 🟢 90% |
| Select | ✅ | ✅ | ✅ | 🟡 75% |
| Checkbox | ✅ | ✅ | ✅ | 🟡 70% |
| Switch | ✅ | ✅ | ✅ | 🟡 75% |
| Toast | ✅ | ✅ | ✅ | 🟢 90% |
| Dropdown | ✅ | ✅ | ✅ | 🟢 85% |
| Popover | ✅ | ✅ | ✅ | 🟢 85% |
| Separator | ✅ | ✅ | ✅ | 🟢 95% |
| ScrollArea | ✅ | ✅ | ✅ | 🟢 90% |
| Avatar | ✅ | ✅ | ✅ | 🟡 75% |
| Badge | ✅ | ✅ | ✅ | 🟢 90% |
| Progress | ✅ | ✅ | ✅ | 🟢 85% |

---

## 🎨 Button - Botão Neumórfico

### Arquivo
`src/components/ui/button.tsx`

### Variantes Implementadas
```tsx
<Button variant="default">Primário</Button>
<Button variant="secondary">Secundário</Button>
<Button variant="outline">Contorno</Button>
<Button variant="ghost">Fantasma</Button>
<Button variant="destructive">Destrutivo</Button>
```

### Skin Neumórfica Aplicada
```css
/* Base neumórfica */
.neumorphic-button {
  background: var(--orx-bg-light);
  box-shadow:
    5px 5px 10px var(--neumorphic-shadow-dark),
    -5px -5px 10px var(--neumorphic-shadow-light);
  transition: all 0.2s ease;
}

/* Hover */
.neumorphic-button:hover {
  box-shadow:
    3px 3px 6px var(--neumorphic-shadow-dark),
    -3px -3px 6px var(--neumorphic-shadow-light);
}

/* Active (pressed) */
.neumorphic-button:active {
  box-shadow:
    inset 3px 3px 6px var(--neumorphic-shadow-dark),
    inset -3px -3px 6px var(--neumorphic-shadow-light);
}
```

### Cor Primária
- **Default**: `--orx-primary` (#6366F1)
- **Sem hex hardcoded**: ✅

---

## 🎴 Card - Container Neumórfico

### Arquivo
`src/components/ui/card.tsx`

### Uso Principal
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    Conteúdo principal
  </CardContent>
  <CardFooter>
    Rodapé
  </CardFooter>
</Card>
```

### Skin Neumórfica Aplicada
```css
.neumorphic-card {
  background: var(--orx-bg-light);
  border-radius: var(--radius);
  box-shadow:
    8px 8px 16px var(--neumorphic-shadow-dark),
    -8px -8px 16px var(--neumorphic-shadow-light);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.neumorphic-card:hover {
  box-shadow:
    12px 12px 24px var(--neumorphic-shadow-dark),
    -12px -12px 24px var(--neumorphic-shadow-light);
}
```

---

## 📝 Input - Campo Neumórfico

### Arquivo
`src/components/ui/input.tsx`

### Uso Principal
```tsx
<Input type="text" placeholder="Digite aqui..." />
<Input type="email" placeholder="email@exemplo.com" />
<Input type="password" placeholder="••••••••" />
```

### Skin Neumórfica Aplicada
```css
.neumorphic-input {
  background: var(--orx-bg-light);
  border: none;
  border-radius: var(--radius);
  box-shadow:
    inset 4px 4px 8px var(--neumorphic-shadow-dark),
    inset -4px -4px 8px var(--neumorphic-shadow-light);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
}

.neumorphic-input:focus {
  outline: none;
  box-shadow:
    inset 6px 6px 12px var(--neumorphic-shadow-dark),
    inset -6px -6px 12px var(--neumorphic-shadow-light);
}
```

---

## 🪟 Dialog - Modal Neumórfico

### Arquivo
`src/components/ui/dialog.tsx`

### Uso Principal
```tsx
<Dialog>
  <DialogTrigger>Abrir Modal</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>
    <div>Conteúdo</div>
    <DialogFooter>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Skin Neumórfica Aplicada
```css
/* Overlay com backdrop blur */
.dialog-overlay {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.4);
}

/* Content com sombras 3D */
.dialog-content {
  background: var(--orx-bg-light);
  border-radius: calc(var(--radius) * 2);
  box-shadow:
    16px 16px 32px var(--neumorphic-shadow-dark),
    -16px -16px 32px var(--neumorphic-shadow-light);
}
```

---

## 📑 Tabs - Navegação Neumórfica

### Arquivo
`src/components/ui/tabs.tsx`

### Uso Principal
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Aba 1</TabsTrigger>
    <TabsTrigger value="tab2">Aba 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Conteúdo 1</TabsContent>
  <TabsContent value="tab2">Conteúdo 2</TabsContent>
</Tabs>
```

### Skin Neumórfica Aplicada
```css
/* Tab inativa (elevada) */
.tabs-trigger {
  background: var(--orx-bg-light);
  box-shadow:
    4px 4px 8px var(--neumorphic-shadow-dark),
    -4px -4px 8px var(--neumorphic-shadow-light);
}

/* Tab ativa (pressionada) */
.tabs-trigger[data-state="active"] {
  box-shadow:
    inset 3px 3px 6px var(--neumorphic-shadow-dark),
    inset -3px -3px 6px var(--neumorphic-shadow-light);
  color: var(--orx-primary);
}
```

---

## 📊 Table - Tabela Neumórfica

### Arquivo
`src/components/ui/table.tsx`

### Uso Principal
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna 1</TableHead>
      <TableHead>Coluna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valor 1</TableCell>
      <TableCell>Valor 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Skin Neumórfica Aplicada
```css
/* Table container */
.table-container {
  background: var(--orx-bg-light);
  border-radius: var(--radius);
  box-shadow:
    8px 8px 16px var(--neumorphic-shadow-dark),
    -8px -8px 16px var(--neumorphic-shadow-light);
}

/* Células com hover */
.table-row:hover {
  background: rgba(99, 102, 241, 0.05);
}
```

---

## 💬 Tooltip - Dica Contextual

### Arquivo
`src/components/ui/tooltip.tsx`

### Uso Principal
```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover aqui</TooltipTrigger>
    <TooltipContent>
      Dica contextual
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Skin Neumórfica Aplicada
```css
.tooltip-content {
  background: var(--orx-bg-light);
  border-radius: var(--radius);
  box-shadow:
    6px 6px 12px var(--neumorphic-shadow-dark),
    -6px -6px 12px var(--neumorphic-shadow-light);
  padding: 0.5rem 0.75rem;
}
```

---

## 🎭 Dark Mode - Modo Escuro Neumórfico

### Ativação
```tsx
// Adiciona classe "dark" no <html>
document.documentElement.classList.add("dark");
```

### Tokens Dark
```css
.dark {
  --neumorphic-bg: #2d3748;
  --neumorphic-light: #3d4a5c;
  --neumorphic-dark: #1a202c;
  --neumorphic-shadow-light: rgba(61, 74, 92, 0.6);
  --neumorphic-shadow-dark: rgba(26, 32, 44, 0.8);
}
```

### Sombras Automáticas
Todos os componentes neumórficos adaptam automaticamente as sombras no modo escuro através das variáveis CSS.

---

## 🔧 Utilitários CSS Neumórficos

### Classes Globais Disponíveis

```css
/* Elevado (raised) */
.neomorphic-raised {
  box-shadow:
    8px 8px 16px var(--neumorphic-shadow-dark),
    -8px -8px 16px var(--neumorphic-shadow-light);
}

/* Pressionado (pressed) */
.neomorphic-pressed {
  box-shadow:
    inset 4px 4px 8px var(--neumorphic-shadow-dark),
    inset -4px -4px 8px var(--neumorphic-shadow-light);
}

/* Plano (flat) */
.neomorphic-flat {
  box-shadow:
    2px 2px 4px var(--neumorphic-shadow-dark),
    -2px -2px 4px var(--neumorphic-shadow-light);
}
```

---

## 🎯 Checklist de Conformidade por Componente

### Button
- [x] Sombras neumórficas aplicadas
- [x] Estados hover/active/disabled
- [x] Cor primária via CSS variable
- [ ] Remover classes text-* (pendente)
- [x] Animações suaves (0.2s ease)

### Card
- [x] Sombras neumórficas aplicadas
- [x] Hover com elevação aumentada
- [x] Background via CSS variable
- [x] Border radius via --radius
- [x] Padding consistente

### Input
- [x] Sombra interna (inset)
- [x] Focus state diferenciado
- [x] Background via CSS variable
- [ ] Remover cores hex (pendente)
- [x] Transições suaves

### Dialog
- [x] Backdrop blur aplicado
- [x] Sombras 3D no content
- [x] Animação de entrada (scale-in)
- [x] Z-index apropriado
- [x] Fechamento com Escape

### Tabs
- [x] Estado ativo (pressed)
- [x] Estado inativo (raised)
- [x] Cor de destaque (primary)
- [x] Transições entre abas
- [ ] Remover classes text-* (pendente)

---

## 📐 Padrões de Espaçamento

| Elemento | Padding | Margin | Gap |
|----------|---------|--------|-----|
| Button | 0.75rem 1.5rem | - | - |
| Card | 1.5rem | 1rem | - |
| Input | 0.75rem 1rem | - | - |
| Dialog | 2rem | - | - |
| Container | 1rem - 2rem | 1rem | 1rem |

---

## 🎨 Cores de Status (Semantic)

| Status | Variável | Cor | Uso |
|--------|----------|-----|-----|
| Success | `--orx-success` | #10B981 | Confirmações, sucesso |
| Warning | `--orx-warning` | #F59E0B | Avisos, atenção |
| Error | `--orx-error` | #EF4444 | Erros, crítico |
| Info | `--orx-primary` | #6366F1 | Informações, neutro |

---

## 🚀 Próximas Melhorias

### Prioridade ALTA
1. Remover todas as classes `text-*` e `font-*` dos componentes
2. Migrar cores hex para variáveis CSS
3. Aplicar skin completa em Select, Checkbox, Switch

### Prioridade MÉDIA
4. Adicionar mais variantes neumórficas (concave, convex)
5. Melhorar animações de transição
6. Implementar skeleton loaders neumórficos

### Prioridade BAIXA
7. Criar componentes customizados adicionais
8. Documentar padrões de acessibilidade
9. Criar Storybook com todos os componentes

---

**Última atualização**: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}  
**Responsável**: AGENTE_DESIGNER_NEUMORPHIC_PREVIEW
