# Guidelines de Layout Padronizado - ICARUS v5.0

**Data:** $(date)  
**Status:** ✅ Padronizado

## Grids Padrão

### Formulários
- **Grid principal:** `FORM_GRID = 'grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6'`
- **Colunas:**
  - `FORM_COL.full` = `lg:col-span-12`
  - `FORM_COL.half` = `lg:col-span-6`
  - `FORM_COL.third` = `lg:col-span-4`
  - `FORM_COL.quarter` = `lg:col-span-3`

### KPIs / Dashboards
- **Grid principal:** `KPI_GRID = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12'`
- **Coluna padrão:** `KPI_COL = 'lg:col-span-3'` (3 colunas de 12 = 4 cards por linha)

## Espaçamentos

**Usar tokens:** `var(--orx-spacing-*)`
- `var(--orx-spacing-xs)` = 4px
- `var(--orx-spacing-sm)` = 8px
- `var(--orx-spacing-md)` = 16px
- `var(--orx-spacing-lg)` = 24px
- `var(--orx-spacing-xl)` = 32px

**Evitar:** `p-4`, `m-6`, `gap-4` hardcoded

## Cards

**Classe padrão:** `neumorphic-card`
- Background: `var(--orx-bg-light)`
- Border radius: `var(--orx-radius-lg)` (1.5rem)
- Shadows: `var(--orx-shadow-light-1), var(--orx-shadow-light-2)`
- Padding padrão: `p-6` (ou usar `var(--orx-spacing-lg)`)

## Cores de Texto

**Sempre usar tokens semânticos:**
- `text-[color:hsl(var(--orx-text-primary))]`
- `text-[color:hsl(var(--orx-text-secondary))]`
- `text-[color:hsl(var(--orx-text-muted))]`

**Para botões primary:**
- `text-[hsl(var(--primary-foreground))]`

**Evitar:** `text-white`, `text-gray-900` hardcoded (exceto em backgrounds coloridos com dark mode support)

## Exemplos

### Formulário
```tsx
<div className={FORM_GRID}>
  <FormField className={FORM_COL.half}>...</FormField>
  <FormField className={FORM_COL.half}>...</FormField>
</div>
```

### Dashboard KPI
```tsx
<div className={KPI_GRID}>
  <KPICard className={KPI_COL}>...</KPICard>
  <KPICard className={KPI_COL}>...</KPICard>
</div>
```

### Card Padrão
```tsx
<div className="neumorphic-card p-6">
  <h2 className="text-[color:hsl(var(--orx-text-primary))]">...</h2>
</div>
```

