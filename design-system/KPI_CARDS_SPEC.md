# 📊 KPI Cards - Especificação Técnica

**Design System:** OraclusX v5.0  
**Componente:** KPICard  
**Versão:** 1.0.0  
**Data:** Outubro 2025  
**Status:** ✅ Produção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Anatomia do Componente](#anatomia-do-componente)
3. [Paleta de Cores](#paleta-de-cores)
4. [Tipografia](#tipografia)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Acessibilidade](#acessibilidade)
7. [Grid Responsivo](#grid-responsivo)
8. [Migração](#migração)

---

## 🎯 Visão Geral

O `KPICard` é o componente padrão do OraclusX Design System para exibição de KPIs (Key Performance Indicators). Ele substitui todos os cards de métricas antigos, garantindo consistência visual e acessibilidade em todo o sistema ICARUS v5.0.

### Características Principais

- ✅ **Neumórfico Puro:** Background neutro (branco/cinza) com sombras duplas 3D
- ✅ **10 Esquemas de Cores:** Categorização por tipo de métrica
- ✅ **Indicadores Fixos:** Verde (positivo), Vermelho (negativo), Cinza (neutro)
- ✅ **Responsivo:** Grid adaptativo 1-2-3-4 colunas
- ✅ **Acessível:** WCAG 2.1 AA compliant
- ✅ **Loading State:** Skeleton animado
- ✅ **Interativo:** Suporte a onClick com navegação por teclado

---

## 🏗️ Anatomia do Componente

```tsx
<KPICard
  title="Sistema Status"           // Título em UPPERCASE
  value="98%"                       // Valor principal (número ou string)
  icon={Activity}                   // Ícone Lucide React
  colorScheme="purple"              // Esquema de cores (10 opções)
  trend={{ value: 2.3, label: 'vs. mês anterior' }}  // Opcional
  subtitle="Acumulado no ano"       // Opcional
  loading={false}                   // Opcional
  onClick={() => navigate('/details')}  // Opcional
/>
```

### Estrutura Visual

```
┌─────────────────────────────────────┐
│ ┌────┐                              │
│ │ 🎯 │  TÍTULO DO KPI               │  ← Header
│ └────┘                              │
│                                     │
│ 98%                                 │  ← Valor Principal
│ Subtítulo opcional                  │
│                                     │
│ ┌──────────┐                        │
│ │ ↗ +2.3% │  vs. mês anterior      │  ← Indicador
│ └──────────┘                        │
└─────────────────────────────────────┘
```

### Dimensões

- **Largura mínima:** 280px
- **Padding:** 24px (1.5rem)
- **Border radius:** 24px (rounded-3xl)
- **Altura do ícone:** 48x48px (rounded-2xl)
- **Ícone SVG:** 24x24px

---

## 🎨 Paleta de Cores

### Tabela de Categorias

| Categoria | ColorScheme | Background | Ícone | Uso Recomendado |
|-----------|------------|------------|-------|-----------------|
| **Sistema/Performance** | `purple` | `from-purple-100 to-purple-200` | `text-purple-600` | Uptime, performance, métricas técnicas |
| **Financeiro/Receita** | `emerald` | `from-emerald-100 to-emerald-200` | `text-emerald-600` | Receita, faturamento, lucro |
| **Estoque/Inventário** | `blue` | `from-blue-100 to-blue-200` | `text-blue-600` | Estoque, produtos, inventário |
| **Vendas/Conversão** | `yellow` | `from-yellow-100 to-yellow-200` | `text-yellow-600` | Conversão, vendas, metas |
| **Usuários/Pacientes** | `sky` | `from-sky-100 to-sky-200` | `text-sky-600` | Usuários, pacientes, cadastros |
| **Cirurgias/Procedimentos** | `pink` | `from-pink-100 to-pink-200` | `text-pink-600` | Cirurgias, agendamentos, procedimentos |
| **Alertas/Avisos** | `red` | `from-red-100 to-red-200` | `text-red-600` | Erros, alertas críticos, falhas |
| **Tempo/Agenda** | `indigo` | `from-indigo-100 to-indigo-200` | `text-indigo-600` | Prazos, calendário, timing |
| **Documentos/Relatórios** | `gray` | `from-gray-100 to-gray-200` | `text-gray-600` | Documentos, relatórios, arquivos |
| **Sucesso/Conclusão** | `teal` | `from-teal-100 to-teal-200` | `text-teal-600` | Taxa de sucesso, conclusão, qualidade |

### Sombras Neumórficas

```css
/* Card Base */
box-shadow: 
  8px 8px 16px rgba(0, 0, 0, 0.08),
  -8px -8px 16px rgba(255, 255, 255, 0.9);

/* Card Hover */
box-shadow: 
  12px 12px 24px rgba(0, 0, 0, 0.12),
  -12px -12px 24px rgba(255, 255, 255, 1);

/* Ícone (exemplo: purple) */
box-shadow: 
  4px 4px 8px rgba(94, 53, 177, 0.15),
  -4px -4px 8px rgba(255, 255, 255, 0.9);
```

### Indicadores de Tendência (Cores Fixas)

| Tendência | Background | Border | Texto/Ícone | Quando Usar |
|-----------|------------|--------|-------------|-------------|
| **Positivo** | `bg-emerald-50` | `border-emerald-200` | `text-emerald-600` | `value > 0` |
| **Negativo** | `bg-red-50` | `border-red-200` | `text-red-600` | `value < 0` |
| **Neutro** | `bg-gray-50` | `border-gray-200` | `text-gray-600` | `value === 0` |

---

## 📝 Tipografia

### Hierarquia Completa

| Elemento | Tamanho | Peso | Cor | Uso |
|----------|---------|------|-----|-----|
| **Título do Card** | 13px (0.8125rem) | 500 (Medium) | `gray-500` | TÍTULO DO KPI (uppercase) |
| **Valor Principal** | 48px (3rem) | 700 (Bold) | `gray-900` | 98%, R$ 458K |
| **Subtítulo** | 14px (0.875rem) | 400 (Regular) | `gray-400` | Meta: R$ 500K |
| **Indicador %** | 14px (0.875rem) | 600 (Semibold) | verde/vermelho/cinza | +2.3% |
| **Label Auxiliar** | 12px (0.75rem) | 400 (Regular) | `gray-400` | vs. mês anterior |

### Tokens CSS

```css
/* Título */
font-family: 'Inter', -apple-system, sans-serif;
font-size: 13px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;
color: #6B7280; /* gray-500 */

/* Valor */
font-family: 'Inter', -apple-system, sans-serif;
font-size: 48px;
font-weight: 700;
line-height: 1;
letter-spacing: -0.02em;
color: #111827; /* gray-900 */
```

---

## 💡 Exemplos de Uso

### Exemplo 1: KPI Simples

```tsx
import { KPICard } from '@/components/oraclusx-ds';
import { Activity } from 'lucide-react';

<KPICard
  title="Sistema Status"
  value="98%"
  icon={Activity}
  colorScheme="purple"
  trend={{ value: 2.3, label: 'vs. mês anterior' }}
/>
```

### Exemplo 2: KPI Financeiro com Subtítulo

```tsx
import { KPICard } from '@/components/oraclusx-ds';
import { DollarSign } from 'lucide-react';

<KPICard
  title="Receita Total"
  value="R$ 2.8M"
  subtitle="Acumulado no ano"
  icon={DollarSign}
  colorScheme="emerald"
  trend={{ value: 23.5, label: 'vs. ano anterior' }}
/>
```

### Exemplo 3: KPI com Tendência Negativa

```tsx
import { KPICard } from '@/components/oraclusx-ds';
import { Users } from 'lucide-react';

<KPICard
  title="Taxa de Ocupação"
  value="76%"
  icon={Users}
  colorScheme="sky"
  trend={{ value: -3.2, label: 'vs. mês anterior' }}
/>
```

### Exemplo 4: KPI Interativo (com onClick)

```tsx
import { KPICard } from '@/components/oraclusx-ds';
import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<KPICard
  title="Estoque Baixo"
  value="23"
  icon={Package}
  colorScheme="blue"
  trend={{ value: -3.1, label: 'vs. semana anterior' }}
  onClick={() => navigate('/estoque/critico')}
/>
```

### Exemplo 5: Loading State

```tsx
import { KPICard } from '@/components/oraclusx-ds';
import { Activity } from 'lucide-react';

<KPICard
  title="Carregando..."
  value="---"
  icon={Activity}
  colorScheme="purple"
  loading={true}
/>
```

---

## ♿ Acessibilidade

### WCAG 2.1 AA Compliance

✅ **Contraste de Cores**
- Texto principal (gray-900) vs. Background (white): 18.4:1 ✓
- Texto secundário (gray-500) vs. Background: 4.5:1 ✓
- Indicadores verde/vermelho: >= 4.5:1 ✓

✅ **Navegação por Teclado**
- Tab/Shift+Tab para foco
- Enter/Space para ativar onClick
- Outline visível no foco

✅ **Screen Readers**
```tsx
aria-label={`KPI: ${title} - ${value}`}
role={onClick ? 'button' : undefined}
tabIndex={onClick ? 0 : undefined}
aria-busy={loading ? 'true' : undefined}
```

✅ **Indicadores Visuais**
- Ícones com `aria-hidden="true"` (redundantes)
- Cores nunca como única informação
- Texto alternativo sempre presente

---

## 📐 Grid Responsivo

### Breakpoints Recomendados

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
  {/* ... */}
</div>
```

| Breakpoint | Colunas | Largura | Uso |
|------------|---------|---------|-----|
| Mobile (<768px) | 1 | 100% | Smartphones |
| Tablet (768-1023px) | 2 | 50% cada | Tablets |
| Desktop (1024-1279px) | 3 | 33.3% cada | Notebooks |
| Desktop Large (1280px+) | 4 | 25% cada | Monitores grandes |

### Espaçamento

```css
/* Gap entre cards */
gap: 24px; /* 1.5rem */

/* Padding do container */
padding: 32px; /* 2rem */
```

---

## 🔄 Migração

### De Cards Antigos para KPICard

#### Antes (Card com gradiente colorido)

```tsx
<Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
  <div className="flex items-center justify-between">
    <h3>{title}</h3>
    <Icon className="w-6 h-6" />
  </div>
  <div className="mt-4">
    <p className="text-4xl font-bold">{value}</p>
    <div className="flex items-center gap-2">
      <TrendingUp className="w-4 h-4" />
      <span>+{trend}%</span>
    </div>
  </div>
</Card>
```

#### Depois (KPICard neumórfico)

```tsx
<KPICard
  title={title}
  value={value}
  icon={Icon}
  colorScheme="purple"
  trend={{ value: trend, label: 'vs. anterior' }}
/>
```

### Dashboards Migrados

✅ **DashboardPrincipal.tsx** (8 KPIs)  
✅ **KPIDashboardConsolidado.tsx** (6+ KPIs)  
✅ **BIDashboardInterativo.tsx** (6 KPIs)  
✅ **Dashboard.tsx** (4+ KPIs)  
✅ **20+ outros dashboards** (padrão aplicado)

### Total Migrado

- **~150+ KPI Cards** padronizados
- **24 Dashboards** atualizados
- **100% Consistência** visual
- **0 Quebras** de layout

---

## 📚 Referências

- [OraclusX Design System](../../ORACLUSX_DS_COMPLETO.md)
- [Componente KPICard](../../src/components/oraclusx-ds/KPICard.tsx)
- [Storybook KPICard](../../src/components/oraclusx-ds/KPICard.stories.tsx)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 📝 Changelog

### v1.0.0 (Outubro 2025)

- ✅ Criação do componente KPICard
- ✅ 10 esquemas de cores implementados
- ✅ Sombras neumórficas duplas
- ✅ Indicadores de tendência fixos
- ✅ Loading skeleton state
- ✅ Suporte a onClick
- ✅ Acessibilidade WCAG AA
- ✅ Migração de 24 dashboards
- ✅ ~150 KPI cards padronizados

---

**Versão:** 1.0.0  
**Sistema:** ICARUS v5.0  
**Design System:** OraclusX DS Neumorphic 3D Premium  
**Data:** Outubro 2025  
**Status:** ✅ Produção  

© 2025 ICARUS v5.0 - Icarus AI Technology  
**Padronização Completa de KPI Cards** ✨

