# 📊 DASHBOARD PRINCIPAL - DOCUMENTAÇÃO COMPLETA 100%

**Sistema**: ICARUS v5.0  
**Categoria**: Módulo Central de Visualização  
**Design System**: OraclusX DS  
**Prioridade**: P0 (Crítica)  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL E ARQUITETURA
1. [Visão Geral do Dashboard](#1-visão-geral-do-dashboard)
2. [Arquitetura e Componentes](#2-arquitetura-e-componentes)
3. [Design Neuromórfico](#3-design-neuromórfico)
4. [Layout e Grid System](#4-layout-e-grid-system)

### PARTE II - KPI CARDS (11 CARDS)
5. [Sistema Status (KPI #1)](#5-sistema-status-kpi-1)
6. [Médicos Ativos (KPI #2)](#6-médicos-ativos-kpi-2)
7. [Produtos OPME (KPI #3)](#7-produtos-opme-kpi-3)
8. [Pedidos Urgentes (KPI #4)](#8-pedidos-urgentes-kpi-4)
9. [Faturamento Mensal (KPI #5)](#9-faturamento-mensal-kpi-5)
10. [Distribuição Geográfica (KPI #6)](#10-distribuição-geográfica-kpi-6)
11. [Estoque Crítico (KPI #7)](#11-estoque-crítico-kpi-7)
12. [Logística (KPI #8)](#12-logística-kpi-8)
13. [Performance IA (KPI #9)](#13-performance-ia-kpi-9)

### PARTE III - BOTÕES E INTERAÇÕES
14. [Header Buttons (2 Botões)](#14-header-buttons-2-botões)
15. [Ações Rápidas (6 Botões)](#15-ações-rápidas-6-botões)
16. [Sistema de Navegação](#16-sistema-de-navegação)
17. [Eventos e Callbacks](#17-eventos-e-callbacks)

### PARTE IV - VISUALIZAÇÕES E GRÁFICOS
18. [Mini Gráficos de Barras](#18-mini-gráficos-de-barras)
19. [Trend Indicators](#19-trend-indicators)
20. [Color System](#20-color-system)

### PARTE V - RESPONSIVIDADE E ACESSIBILIDADE
21. [Breakpoints Responsivos](#21-breakpoints-responsivos)
22. [Acessibilidade (WCAG AA)](#22-acessibilidade-wcag-aa)
23. [Performance e Otimização](#23-performance-e-otimização)
24. [Casos de Uso](#24-casos-de-uso)

---

# PARTE I - VISÃO GERAL E ARQUITETURA

## 1. VISÃO GERAL DO DASHBOARD

### 1.1. Descrição

**Arquivo**: `/components/modules/DashboardPrincipal.tsx`  
**Componente**: `DashboardPrincipal`

O **Dashboard Principal** é o módulo central do sistema ICARUS v5.0, oferecendo uma visão consolidada e em tempo real de todas as operações críticas. Projetado com design neuromórfico 100% conforme OraclusX DS, apresenta 11 KPIs estratégicos, 2 botões de ação no header e 6 botões de acesso rápido.

### 1.2. Características Principais

```yaml
Características Core:
  - Design Neuromórfico (100% OraclusX DS)
  - 11 KPI Cards estratégicos
  - 8 Botões de ação (2 header + 6 rápidas)
  - Mini gráficos integrados (3 cards)
  - Trend indicators em tempo real
  - Sistema de navegação por eventos
  - 100% Responsivo (mobile-first)
  - Acessível (WCAG AA)
  - Performance otimizada

Layout Estruturado:
  - Header com título e 2 botões
  - Linha 1: 4 KPIs compactos (grid 1-2-4)
  - Linha 2: 2 KPIs largos (grid 1-2)
  - Linha 3: 3 KPIs com mini gráficos (grid 1-2-3)
  - Ações Rápidas: 6 botões (grid 2-3-6)

Dimensões Padrão:
  - Container: 100% width com padding 24px
  - Gap entre seções: 24px (space-y-6)
  - Gap entre cards: 16px (gap-4)
  - KPI Cards: Altura automática, padding 24px

Cores Principais:
  - Primary: #6366F1 (Indigo-500) - Botões
  - Success: #059669 (Emerald-600) - Atualizar
  - Background: Neuromórfico (gradiente)
  - Text: Foreground semantic
```

### 1.3. Hierarquia de Informação

```
Dashboard Principal
├── Header
│   ├── Título + Subtítulo
│   └── Botões de Ação (2)
│       ├── Atualizar Dados (verde)
│       └── Relatório Completo (indigo)
├── KPIs Linha 1 (4 cards compactos)
│   ├── Sistema Status (98%)
│   ├── Médicos Ativos (1.847)
│   ├── Produtos OPME (12.4K)
│   └── Pedidos Urgentes (89)
├── KPIs Linha 2 (2 cards largos)
│   ├── Faturamento Mensal (R$ 3.8M)
│   └── Distribuição Geográfica (147 hospitais)
├── KPIs Linha 3 (3 cards com gráficos)
│   ├── Estoque Crítico (8 produtos)
│   ├── Logística (96.2% no prazo)
│   └── Performance IA (97.3% precisão)
└── Ações Rápidas (6 botões)
    ├── Novo Pedido
    ├── Nova NF
    ├── Orçamento
    ├── Cadastro
    ├── Relatórios
    └── Configurar
```

---

## 2. ARQUITETURA E COMPONENTES

### 2.1. Estrutura de Código

```typescript
// Imports
import React, { useState, useEffect } from "react";
import { 
  Activity, TrendingUp, TrendingDown, Minus, RotateCcw,
  FileBarChart, Users, Package, Calendar, DollarSign,
  MapPin, AlertTriangle, Truck, Cpu, Plus, FileText,
  ShoppingCart, Settings, BarChart3, UserPlus
} from "lucide-react";

// Componentes OraclusX DS
import { NeomorphicCard } from "../NeomorphicCard";
import { NeomorphicIconBox } from "../NeomorphicIconBox";
import { Button } from "../ui/button";

// Component
function DashboardPrincipal() {
  // Lifecycle
  useEffect(() => {
    console.log('✅ Dashboard Principal montado!');
  }, []);

  // Helper functions
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="text-green-500" size={16} />;
    if (trend < 0) return <TrendingDown className="text-red-500" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-gray-400";
  };

  // Render
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      {/* KPIs Linha 1 */}
      {/* KPIs Linha 2 */}
      {/* KPIs Linha 3 */}
      {/* Ações Rápidas */}
    </div>
  );
}

export default DashboardPrincipal;
```

### 2.2. Componentes Utilizados

```typescript
// OraclusX DS Components
const componentsUsed = {
  core: [
    'NeomorphicCard',      // Cards neuromórficos
    'NeomorphicIconBox',   // Ícones com container
    'Button'               // Botões padronizados
  ],
  
  icons: [
    'Activity',           // Sistema Status
    'Users',              // Médicos
    'Package',            // Produtos
    'Calendar',           // Pedidos
    'DollarSign',         // Faturamento
    'MapPin',             // Distribuição
    'AlertTriangle',      // Estoque Crítico
    'Truck',              // Logística
    'Cpu',                // Performance IA
    'TrendingUp',         // Trend positivo
    'TrendingDown',       // Trend negativo
    'Minus',              // Trend neutro
    'RotateCcw',          // Atualizar
    'FileBarChart',       // Relatório
    'Plus',               // Novo
    'FileText',           // NF-e
    'ShoppingCart',       // Orçamento
    'UserPlus',           // Cadastro
    'BarChart3',          // Analytics
    'Settings'            // Configurações
  ],
  
  utilities: [
    'getTrendIcon()',     // Helper ícone trend
    'getTrendColor()'     // Helper cor trend
  ]
};
```

### 2.3. Modelo de Dados (Mock)

```typescript
// Dados dos KPIs (em produção virá da API/Supabase)
interface KPIData {
  id: string;
  label: string;
  value: string | number;
  trend: number; // -100 a +100 (%)
  unit?: string;
  metadata?: {
    subtitle?: string;
    average?: string;
    cities?: number;
  };
}

const kpisData: KPIData[] = [
  {
    id: 'sistema-status',
    label: 'Sistema Status',
    value: '98%',
    trend: 2.3,
    unit: '%'
  },
  {
    id: 'medicos-ativos',
    label: 'Médicos Ativos',
    value: 1847,
    trend: 12.5,
    unit: 'médicos'
  },
  {
    id: 'produtos-opme',
    label: 'Produtos OPME',
    value: '12.4K',
    trend: 5.2,
    unit: 'produtos'
  },
  {
    id: 'pedidos-urgentes',
    label: 'Pedidos Urgentes',
    value: 89,
    trend: -8.1,
    unit: 'pedidos'
  },
  {
    id: 'faturamento-mensal',
    label: 'Faturamento Mensal',
    value: 'R$ 3.8M',
    trend: 15.3,
    unit: 'reais',
    metadata: {
      average: 'R$ 127K',
      subtitle: 'média diária'
    }
  },
  {
    id: 'distribuicao-geografica',
    label: 'Distribuição Geográfica',
    value: 147,
    trend: 8.7,
    unit: 'hospitais',
    metadata: {
      cities: 28
    }
  },
  {
    id: 'estoque-critico',
    label: 'Estoque Crítico',
    value: 8,
    trend: -42.3,
    unit: 'produtos'
  },
  {
    id: 'logistica',
    label: 'Logística',
    value: '96.2%',
    trend: 3.8,
    unit: '%',
    metadata: {
      subtitle: 'entregas no prazo'
    }
  },
  {
    id: 'performance-ia',
    label: 'Performance IA',
    value: '97.3%',
    trend: 1.2,
    unit: '%',
    metadata: {
      subtitle: 'precisão do sistema'
    }
  }
];
```

---

## 3. DESIGN NEUROMÓRFICO

### 3.1. NeomorphicCard Specifications

```css
/* ═══════════════════════════════════════════════════════════
   NEOMORPHIC CARD - PADRÃO ORACLUSX DS
   ═══════════════════════════════════════════════════════════ */

.neomorphic-card {
  /* Layout */
  padding: 24px;
  border-radius: 16px;
  
  /* Background - Modo Claro */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(245, 247, 250, 0.8) 100%
  );
  
  /* Neuromórfico Raised */
  box-shadow: 
    /* Light externa (superior esquerda) */
    -8px -8px 16px rgba(255, 255, 255, 0.9),
    /* Shadow externa (inferior direita) */
    8px 8px 16px rgba(0, 0, 0, 0.1),
    /* Highlight interno sutil */
    inset 2px 2px 4px rgba(255, 255, 255, 0.5);
    
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  /* Transition suave */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover State */
.neomorphic-card:hover {
  transform: translateY(-2px);
  
  box-shadow: 
    -10px -10px 20px rgba(255, 255, 255, 0.95),
    10px 10px 20px rgba(0, 0, 0, 0.12),
    inset 2px 2px 4px rgba(255, 255, 255, 0.6);
}

/* ═══════════════════════════════════════════════════════════
   MODO ESCURO
   ═══════════════════════════════════════════════════════════ */

.dark .neomorphic-card {
  /* Background Dark */
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(15, 23, 42, 0.9) 100%
  );
  
  /* Neuromórfico Dark Raised */
  box-shadow: 
    -8px -8px 16px rgba(51, 65, 85, 0.3),
    8px 8px 16px rgba(0, 0, 0, 0.5),
    inset 2px 2px 4px rgba(51, 65, 85, 0.1);
    
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .neomorphic-card:hover {
  box-shadow: 
    -10px -10px 20px rgba(51, 65, 85, 0.4),
    10px 10px 20px rgba(0, 0, 0, 0.6),
    inset 2px 2px 4px rgba(51, 65, 85, 0.15);
}
```

### 3.2. NeomorphicIconBox Specifications

```typescript
/**
 * NeomorphicIconBox - Container neuromórfico para ícones
 * Usado em todos os 11 KPI Cards
 */

interface NeomorphicIconBoxProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorVariant: 'blue' | 'cyan' | 'orange' | 'red' | 'green' | 
                'indigo' | 'emerald' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

// Mapeamento de cores por variante
const COLOR_VARIANTS = {
  blue: '#3B82F6',      // Sistema Status
  cyan: '#06B6D4',      // Médicos Ativos
  orange: '#F97316',    // Produtos OPME
  red: '#EF4444',       // Pedidos Urgentes, Estoque Crítico
  green: '#10B981',     // Faturamento
  indigo: '#6366F1',    // Distribuição Geográfica
  emerald: '#059669',   // Logística
  purple: '#A855F7'     // Performance IA
};

// Dimensões por tamanho
const SIZES = {
  sm: { width: '36px', height: '36px', iconSize: 16 },
  md: { width: '48px', height: '48px', iconSize: 20 },
  lg: { width: '56px', height: '56px', iconSize: 24 }
};
```

```css
/* NeomorphicIconBox - Modo Claro */
.neomorphic-icon-box {
  /* Layout */
  width: 48px;
  height: 48px;
  border-radius: 12px;
  
  /* Flexbox para centrar */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* Background com transparência */
  background: rgba(99, 102, 241, 0.1); /* Exemplo: indigo */
  
  /* Neuromórfico Flat */
  box-shadow: 
    -4px -4px 8px rgba(255, 255, 255, 0.8),
    4px 4px 8px rgba(0, 0, 0, 0.08);
    
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* NeomorphicIconBox - Modo Escuro */
.dark .neomorphic-icon-box {
  background: rgba(99, 102, 241, 0.15);
  
  box-shadow: 
    -4px -4px 8px rgba(51, 65, 85, 0.3),
    4px 4px 8px rgba(0, 0, 0, 0.4);
    
  border-color: rgba(99, 102, 241, 0.3);
}
```

---

## 4. LAYOUT E GRID SYSTEM

### 4.1. Grid Responsivo Completo

```css
/* ═══════════════════════════════════════════════════════════
   GRID SYSTEM - TAILWIND + RESPONSIVO
   ═══════════════════════════════════════════════════════════ */

/* Container Principal */
.dashboard-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px; /* space-y-6 */
}

/* ═══════════════════════════════════════════════════════════
   LINHA 1 - 4 KPIs Compactos
   ═══════════════════════════════════════════════════════════ */

.linha-1-kpis {
  /* Mobile: 1 coluna */
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 colunas */
@media (min-width: 768px) {
  .linha-1-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 4 colunas */
@media (min-width: 1024px) {
  .linha-1-kpis {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Tailwind equivalente:
   grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
*/

/* ═══════════════════════════════════════════════════════════
   LINHA 2 - 2 KPIs Largos
   ═══════════════════════════════════════════════════════════ */

.linha-2-kpis {
  /* Mobile: 1 coluna */
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Desktop: 2 colunas */
@media (min-width: 1024px) {
  .linha-2-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tailwind: grid grid-cols-1 lg:grid-cols-2 gap-4 */

/* ═══════════════════════════════════════════════════════════
   LINHA 3 - 3 KPIs com Mini Gráficos
   ═══════════════════════════════════════════════════════════ */

.linha-3-kpis {
  /* Mobile: 1 coluna */
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 colunas */
@media (min-width: 768px) {
  .linha-3-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 colunas */
@media (min-width: 1024px) {
  .linha-3-kpis {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tailwind: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 */

/* ═══════════════════════════════════════════════════════════
   AÇÕES RÁPIDAS - 6 Botões
   ═══════════════════════════════════════════════════════════ */

.acoes-rapidas-grid {
  /* Mobile: 2 colunas */
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Tablet: 3 colunas */
@media (min-width: 768px) {
  .acoes-rapidas-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: 6 colunas */
@media (min-width: 1024px) {
  .acoes-rapidas-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Tailwind: grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 */
```

### 4.2. Breakpoints Sistema

```yaml
Breakpoints Tailwind (padrão):
  - xs: 0px (mobile small)
  - sm: 640px (mobile large)
  - md: 768px (tablet)
  - lg: 1024px (desktop)
  - xl: 1280px (desktop large)
  - 2xl: 1536px (ultra wide)

Dashboard Breakpoints Usados:
  - Mobile: < 768px
    - Linha 1: 1 coluna
    - Linha 2: 1 coluna
    - Linha 3: 1 coluna
    - Ações: 2 colunas
    
  - Tablet: 768px - 1023px
    - Linha 1: 2 colunas
    - Linha 2: 1 coluna
    - Linha 3: 2 colunas
    - Ações: 3 colunas
    
  - Desktop: >= 1024px
    - Linha 1: 4 colunas
    - Linha 2: 2 colunas
    - Linha 3: 3 colunas
    - Ações: 6 colunas
```

---

# PARTE II - KPI CARDS (11 CARDS)

## 5. SISTEMA STATUS (KPI #1)

### 5.1. Especificações Completas

```typescript
<NeomorphicCard className="p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Activity} 
      colorVariant="blue" 
      size="md" 
    />
    <h4 className="text-sm text-muted-foreground">
      Sistema Status
    </h4>
  </div>

  {/* Content */}
  <div className="space-y-2">
    {/* Valor Principal */}
    <div className="text-3xl text-foreground">
      98%
    </div>
    
    {/* Trend Indicator */}
    <div className="flex items-center gap-2">
      {getTrendIcon(2.3)}
      <span className={`text-sm ${getTrendColor(2.3)}`}>
        +2.3%
      </span>
    </div>
  </div>
</NeomorphicCard>
```

### 5.2. Dados e Métricas

```yaml
Sistema Status KPI:
  Valor: 98%
  Trend: +2.3% (positivo)
  Unidade: Percentual
  
  Significado:
    - Uptime do sistema
    - Disponibilidade geral
    - Performance de servidores
    
  Cor do Ícone: Blue (#3B82F6)
  Ícone: Activity (Lucide)
  
  Threshold:
    - Verde: >= 95%
    - Amarelo: 90-94%
    - Vermelho: < 90%
    
  Fonte de Dados:
    - Monitoramento de infraestrutura
    - Health checks automáticos
    - Supabase uptime
```

---

## 6. MÉDICOS ATIVOS (KPI #2)

### 6.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Users} 
      colorVariant="cyan" 
      size="md" 
    />
    <h4 className="text-sm text-muted-foreground">
      Médicos Ativos
    </h4>
  </div>

  <div className="space-y-2">
    <div className="text-3xl text-foreground">
      1.847
    </div>
    
    <div className="flex items-center gap-2">
      {getTrendIcon(12.5)}
      <span className={`text-sm ${getTrendColor(12.5)}`}>
        +12.5%
      </span>
    </div>
  </div>
</NeomorphicCard>
```

### 6.2. Dados e Métricas

```yaml
Médicos Ativos KPI:
  Valor: 1.847
  Trend: +12.5% (positivo)
  Unidade: Médicos
  
  Significado:
    - Médicos cadastrados e ativos
    - Crescimento da base
    - Engajamento
    
  Cor do Ícone: Cyan (#06B6D4)
  Ícone: Users (Lucide)
  
  Cálculo:
    - Médicos com pelo menos 1 cirurgia nos últimos 30 dias
    - Atualização: Diária
    
  Fonte de Dados:
    - Tabela: medicos
    - Join: cirurgias
    - Período: Últimos 30 dias
```

---

## 7. PRODUTOS OPME (KPI #3)

### 7.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Package} 
      colorVariant="orange" 
      size="md" 
    />
    <h4 className="text-sm text-muted-foreground">
      Produtos OPME
    </h4>
  </div>

  <div className="space-y-2">
    <div className="text-3xl text-foreground">
      12.4K
    </div>
    
    <div className="flex items-center gap-2">
      {getTrendIcon(5.2)}
      <span className={`text-sm ${getTrendColor(5.2)}`}>
        +5.2%
      </span>
    </div>
  </div>
</NeomorphicCard>
```

### 7.2. Dados e Métricas

```yaml
Produtos OPME KPI:
  Valor: 12.4K (12.400)
  Trend: +5.2% (positivo)
  Unidade: Produtos
  
  Significado:
    - Total de produtos OPME cadastrados
    - Diversidade de catálogo
    - Cobertura de especialidades
    
  Cor do Ícone: Orange (#F97316)
  Ícone: Package (Lucide)
  
  Formatação:
    - < 1.000: Número inteiro
    - >= 1.000: "K" (milhares)
    - >= 1.000.000: "M" (milhões)
    
  Fonte de Dados:
    - Tabela: produtos_opme
    - Filtro: status = 'ativo'
```

---

## 8. PEDIDOS URGENTES (KPI #4)

### 8.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Calendar} 
      colorVariant="red" 
      size="md" 
    />
    <h4 className="text-sm text-muted-foreground">
      Pedidos Urgentes
    </h4>
  </div>

  <div className="space-y-2">
    <div className="text-3xl text-foreground">
      89
    </div>
    
    <div className="flex items-center gap-2">
      {getTrendIcon(-8.1)}
      <span className={`text-sm ${getTrendColor(-8.1)}`}>
        -8.1%
      </span>
    </div>
  </div>
</NeomorphicCard>
```

### 8.2. Dados e Métricas

```yaml
Pedidos Urgentes KPI:
  Valor: 89
  Trend: -8.1% (negativo = bom neste caso)
  Unidade: Pedidos
  
  Significado:
    - Pedidos com prioridade alta
    - Cirurgias nas próximas 48h
    - Necessita ação imediata
    
  Cor do Ícone: Red (#EF4444)
  Ícone: Calendar (Lucide)
  
  Critérios de Urgência:
    - Cirurgia < 48h
    - Material não separado
    - Status: "pendente" ou "em_preparacao"
    
  Trend Invertido:
    - Negativo é bom (menos urgências)
    - Positivo é preocupante
    
  Fonte de Dados:
    - Tabela: pedidos
    - Filtro: urgente = true
    - Join: cirurgias
```

---

## 9. FATURAMENTO MENSAL (KPI #5)

### 9.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-4">
    <NeomorphicIconBox 
      icon={DollarSign} 
      colorVariant="green" 
      size="md" 
    />
    <h3 className="text-foreground">
      Faturamento Mensal
    </h3>
  </div>

  {/* Content - Layout Horizontal */}
  <div className="flex items-baseline gap-4">
    {/* Valor Principal */}
    <div className="text-5xl text-foreground">
      R$ 3.8M
    </div>
    
    {/* Metadata */}
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">
        R$ 127K
      </div>
      <div className="text-xs text-muted-foreground">
        média diária
      </div>
    </div>
  </div>

  {/* Trend */}
  <div className="flex items-center gap-2 mt-4">
    {getTrendIcon(15.3)}
    <span className={`text-sm ${getTrendColor(15.3)}`}>
      +15.3%
    </span>
  </div>
</NeomorphicCard>
```

### 9.2. Dados e Métricas

```yaml
Faturamento Mensal KPI:
  Valor Principal: R$ 3.8M
  Trend: +15.3% (positivo)
  Metadata:
    - Média Diária: R$ 127K
    - Label: "média diária"
  
  Significado:
    - Faturamento total do mês atual
    - Performance financeira
    - Crescimento de receita
    
  Cor do Ícone: Green (#10B981)
  Ícone: DollarSign (Lucide)
  
  Cálculo:
    - Soma de notas fiscais emitidas
    - Período: Mês atual (01 até hoje)
    - Média diária: Total / dias corridos
    
  Formatação Monetária:
    - R$ 3.800.000 → R$ 3.8M
    - R$ 127.000 → R$ 127K
    - Sempre 1 casa decimal
    
  Fonte de Dados:
    - Tabela: notas_fiscais
    - Status: 'emitida', 'autorizada'
    - Período: MONTH(data_emissao) = MONTH(NOW())
```

---

## 10. DISTRIBUIÇÃO GEOGRÁFICA (KPI #6)

### 10.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-4">
    <NeomorphicIconBox 
      icon={MapPin} 
      colorVariant="indigo" 
      size="md" 
    />
    <h3 className="text-foreground">
      Distribuição Geográfica
    </h3>
  </div>

  <div className="flex items-baseline gap-4">
    {/* Hospitais */}
    <div className="text-5xl text-foreground">
      147
    </div>
    
    {/* Cidades */}
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">
        28
      </div>
      <div className="text-xs text-muted-foreground">
        cidades
      </div>
    </div>
  </div>

  <div className="flex items-center gap-2 mt-4">
    {getTrendIcon(8.7)}
    <span className={`text-sm ${getTrendColor(8.7)}`}>
      +8.7%
    </span>
  </div>
</NeomorphicCard>
```

### 10.2. Dados e Métricas

```yaml
Distribuição Geográfica KPI:
  Valor Principal: 147 hospitais
  Trend: +8.7% (positivo)
  Metadata:
    - Cidades: 28
    - Label: "cidades"
  
  Significado:
    - Abrangência geográfica
    - Cobertura de mercado
    - Expansão territorial
    
  Cor do Ícone: Indigo (#6366F1)
  Ícone: MapPin (Lucide)
  
  Cálculo:
    - Hospitais ativos (pelo menos 1 cirurgia em 3 meses)
    - Cidades únicas dos hospitais
    
  Fonte de Dados:
    - Tabela: hospitais
    - Status: 'ativo'
    - Distinct: cidade
```

---

## 11. ESTOQUE CRÍTICO (KPI #7)

### 11.1. Especificações Completas

```typescript
<NeomorphicCard className="p-6">
  {/* Header */}
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={AlertTriangle} 
      colorVariant="red" 
      size="md" 
    />
    <h3 className="text-foreground">
      Estoque Crítico
    </h3>
  </div>

  {/* Content */}
  <div className="space-y-2">
    {/* Valor */}
    <div className="text-4xl text-foreground">
      8
    </div>
    
    {/* Subtitle */}
    <div className="text-sm text-muted-foreground">
      produtos em falta
    </div>
    
    {/* Trend */}
    <div className="flex items-center gap-2">
      {getTrendIcon(-42.3)}
      <span className={`text-sm ${getTrendColor(-42.3)}`}>
        -42.3%
      </span>
    </div>
    
    {/* Mini Gráfico de Barras */}
    <div className="mt-4">
      <div 
        className="flex items-end justify-between gap-1 mb-2" 
        style={{ height: '32px' }}
      >
        <div className="bg-red-400 rounded-t" style={{ width: '12px', height: '30%' }}></div>
        <div className="bg-red-500 rounded-t" style={{ width: '12px', height: '50%' }}></div>
        <div className="bg-red-600 rounded-t" style={{ width: '12px', height: '70%' }}></div>
        <div className="bg-red-500 rounded-t" style={{ width: '12px', height: '45%' }}></div>
        <div className="bg-red-600 rounded-t" style={{ width: '12px', height: '85%' }}></div>
        <div className="bg-red-700 rounded-t" style={{ width: '12px', height: '60%' }}></div>
        <div className="bg-red-600 rounded-t" style={{ width: '12px', height: '92%' }}></div>
        <div className="bg-red-500 rounded-t" style={{ width: '12px', height: '75%' }}></div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Últimos 8 dias
      </div>
    </div>
  </div>
</NeomorphicCard>
```

### 11.2. Mini Gráfico - Especificações

```yaml
Mini Gráfico de Barras:
  Tipo: Bar Chart (8 barras)
  Altura Container: 32px
  Largura Barra: 12px
  Gap: 4px (justify-between)
  
  Cores (Gradiente Red):
    - red-400: #F87171
    - red-500: #EF4444
    - red-600: #DC2626
    - red-700: #B91C1C
  
  Alturas (Percentuais):
    - Dia 1: 30%
    - Dia 2: 50%
    - Dia 3: 70%
    - Dia 4: 45%
    - Dia 5: 85%
    - Dia 6: 60%
    - Dia 7: 92%
    - Dia 8: 75%
  
  Border-radius: Apenas topo (rounded-t)
  
  Label: "Últimos 8 dias"
  Font-size: 12px (text-xs)
  Color: text-muted-foreground
```

---

## 12. LOGÍSTICA (KPI #8)

### 12.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Truck} 
      colorVariant="emerald" 
      size="md" 
    />
    <h3 className="text-foreground">
      Logística
    </h3>
  </div>

  <div className="space-y-2">
    <div className="text-4xl text-foreground">
      96.2%
    </div>
    
    <div className="text-sm text-muted-foreground">
      entregas no prazo
    </div>
    
    <div className="flex items-center gap-2">
      {getTrendIcon(3.8)}
      <span className={`text-sm ${getTrendColor(3.8)}`}>
        +3.8%
      </span>
    </div>
    
    {/* Mini Gráfico Verde */}
    <div className="mt-4">
      <div className="flex items-end justify-between gap-1 mb-2" style={{ height: '32px' }}>
        <div className="bg-green-400 rounded-t" style={{ width: '12px', height: '50%' }}></div>
        <div className="bg-green-500 rounded-t" style={{ width: '12px', height: '70%' }}></div>
        <div className="bg-green-600 rounded-t" style={{ width: '12px', height: '85%' }}></div>
        <div className="bg-green-500 rounded-t" style={{ width: '12px', height: '65%' }}></div>
        <div className="bg-green-600 rounded-t" style={{ width: '12px', height: '95%' }}></div>
        <div className="bg-green-700 rounded-t" style={{ width: '12px', height: '80%' }}></div>
        <div className="bg-green-600 rounded-t" style={{ width: '12px', height: '100%' }}></div>
        <div className="bg-green-500 rounded-t" style={{ width: '12px', height: '90%' }}></div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Últimos 8 dias
      </div>
    </div>
  </div>
</NeomorphicCard>
```

### 12.2. Dados e Métricas

```yaml
Logística KPI:
  Valor: 96.2%
  Trend: +3.8% (positivo)
  Subtitle: "entregas no prazo"
  
  Significado:
    - Taxa de entregas pontuais
    - Eficiência logística
    - Satisfação do cliente
    
  Cor do Ícone: Emerald (#059669)
  Ícone: Truck (Lucide)
  
  Cores do Gráfico:
    - green-400: #4ADE80
    - green-500: #22C55E
    - green-600: #16A34A
    - green-700: #15803D
    
  Cálculo:
    - (Entregas no prazo / Total entregas) * 100
    - Prazo: Data prometida >= Data entregue
    
  Threshold:
    - Verde: >= 95%
    - Amarelo: 90-94%
    - Vermelho: < 90%
```

---

## 13. PERFORMANCE IA (KPI #9)

### 13.1. Especificações

```typescript
<NeomorphicCard className="p-6">
  <div className="flex items-center gap-3 mb-3">
    <NeomorphicIconBox 
      icon={Cpu} 
      colorVariant="purple" 
      size="md" 
    />
    <h3 className="text-foreground">
      Performance IA
    </h3>
  </div>

  <div className="space-y-2">
    <div className="text-4xl text-foreground">
      97.3%
    </div>
    
    <div className="text-sm text-muted-foreground">
      precisão do sistema
    </div>
    
    <div className="flex items-center gap-2">
      {getTrendIcon(1.2)}
      <span className={`text-sm ${getTrendColor(1.2)}`}>
        +1.2%
      </span>
    </div>
    
    {/* Mini Gráfico Azul */}
    <div className="mt-4">
      <div className="flex items-end justify-between gap-1 mb-2" style={{ height: '32px' }}>
        <div className="bg-blue-400 rounded-t" style={{ width: '12px', height: '45%' }}></div>
        <div className="bg-blue-500 rounded-t" style={{ width: '12px', height: '60%' }}></div>
        <div className="bg-blue-600 rounded-t" style={{ width: '12px', height: '75%' }}></div>
        <div className="bg-blue-500 rounded-t" style={{ width: '12px', height: '55%' }}></div>
        <div className="bg-blue-600 rounded-t" style={{ width: '12px', height: '85%' }}></div>
        <div className="bg-blue-700 rounded-t" style={{ width: '12px', height: '70%' }}></div>
        <div className="bg-blue-600 rounded-t" style={{ width: '12px', height: '90%' }}></div>
        <div className="bg-blue-500 rounded-t" style={{ width: '12px', height: '80%' }}></div>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Últimos 8 dias
      </div>
    </div>
  </div>
</NeomorphicCard>
```

### 13.2. Dados e Métricas

```yaml
Performance IA KPI:
  Valor: 97.3%
  Trend: +1.2% (positivo)
  Subtitle: "precisão do sistema"
  
  Significado:
    - Acurácia dos modelos de IA
    - Qualidade das predições
    - Performance do ML
    
  Cor do Ícone: Purple (#A855F7)
  Ícone: Cpu (Lucide)
  
  Cores do Gráfico:
    - blue-400: #60A5FA
    - blue-500: #3B82F6
    - blue-600: #2563EB
    - blue-700: #1D4ED8
    
  Cálculo:
    - Média ponderada de:
      - Predição de estoque: 98.5%
      - Análise de fraude: 96.8%
      - Justificativa médica: 97.2%
      - Otimização de rotas: 96.8%
    
  Métricas de IA Monitoradas:
    - Accuracy
    - Precision
    - Recall
    - F1-Score
```

---

# PARTE III - BOTÕES E INTERAÇÕES

## 14. HEADER BUTTONS (2 BOTÕES)

### 14.1. Botão "Atualizar Dados"

```typescript
<Button 
  size="default" 
  className="flex items-center gap-2 text-white dark:text-white"
  style={{ 
    backgroundColor: '#059669',  // Emerald-600
    border: 'none'
  }}
  onClick={() => {
    console.log('🔄 Atualizando dados do dashboard...');
    // Lógica de atualização (em produção)
    fetchDashboardData();
  }}
  aria-label="Atualizar dados do dashboard"
>
  <RotateCcw size={16} className="text-white dark:text-white" />
  Atualizar Dados
</Button>
```

**Especificações**:
```yaml
Botão Atualizar Dados:
  Cor de Fundo: #059669 (Emerald-600)
  Cor do Texto: #FFFFFF (Branco fixo)
  Ícone: RotateCcw (16px)
  Border: none
  
  Hover State:
    - Opacity: 0.9
    - Transform: none
    
  Active State:
    - Opacity: 0.8
    - Transform: scale(0.98)
    
  Funcionalidade:
    - Recarrega dados dos KPIs
    - Atualiza gráficos
    - Mostra loading durante fetch
    - Toast de sucesso ao completar
    
  Posição: Header direita (primeiro botão)
```

### 14.2. Botão "Relatório Completo"

```typescript
<Button 
  size="default" 
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex items-center gap-2"
  onClick={() => {
    console.log('📊 Abrindo relatório completo...');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'relatorios-executivos' } 
    }));
  }}
  aria-label="Gerar relatório executivo completo"
>
  <FileBarChart size={16} />
  Relatório Completo
</Button>
```

**Especificações**:
```yaml
Botão Relatório Completo:
  Cor de Fundo: #6366F1 (Indigo-500 - Primary)
  Cor do Texto: #FFFFFF (Branco)
  Ícone: FileBarChart (16px)
  Border: none
  
  Hover State:
    - Background: #4F46E5 (Indigo-600)
    - Transform: none
    
  Funcionalidade:
    - Navega para módulo "Relatórios Executivos"
    - Usa Custom Event para navegação
    - Gera PDF do dashboard (futuro)
    
  Posição: Header direita (segundo botão)
```

---

## 15. AÇÕES RÁPIDAS (6 BOTÕES)

### 15.1. Grid de Ações Rápidas

```typescript
<NeomorphicCard className="p-6">
  {/* Header */}
  <div className="mb-4">
    <h3 className="text-foreground">Ações Rápidas</h3>
    <p className="text-sm text-muted-foreground">
      Acesso rápido às operações mais utilizadas
    </p>
  </div>
  
  {/* Grid Responsivo */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    {/* 6 botões */}
  </div>
</NeomorphicCard>
```

### 15.2. Botão 1 - Novo Pedido

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: crm-vendas');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'crm-vendas' } 
    }));
  }}
  title="+ Novo Pedido"
  aria-label="Criar novo pedido de venda"
>
  <Plus size={20} />
  <span className="text-sm">Novo Pedido</span>
</Button>
```

**Especificações**:
```yaml
Botão Novo Pedido:
  Layout: Vertical (flex-col)
  Ícone: Plus (20px)
  Label: "Novo Pedido"
  Cor: #6366F1 (Primary)
  
  Padding: 16px vertical
  Height: auto
  Gap: 8px (entre ícone e texto)
  
  Navegação:
    - Módulo destino: "crm-vendas"
    - Sub-módulo: Novo Pedido
    - Event: CustomEvent('navigate')
```

### 15.3. Botão 2 - Nova NF

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: faturamento-nfe');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'faturamento-nfe' } 
    }));
  }}
  title="Emitir nova nota fiscal eletrônica"
  aria-label="Emitir nova nota fiscal eletrônica"
>
  <FileText size={20} />
  <span className="text-sm">Nova NF</span>
</Button>
```

**Especificações**:
```yaml
Botão Nova NF:
  Ícone: FileText (20px)
  Label: "Nova NF"
  
  Navegação:
    - Módulo: "faturamento-nfe"
    - Ação: Criar nova NF-e
    - SEFAZ: Formulário de emissão
```

### 15.4. Botão 3 - Orçamento

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: crm-vendas');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'crm-vendas' } 
    }));
  }}
  title="+ Novo Orçamento"
  aria-label="Criar novo orçamento"
>
  <ShoppingCart size={20} />
  <span className="text-sm">Orçamento</span>
</Button>
```

**Especificações**:
```yaml
Botão Orçamento:
  Ícone: ShoppingCart (20px)
  Label: "Orçamento"
  
  Navegação:
    - Módulo: "crm-vendas"
    - Ação: Novo orçamento
    - Workflow: Prospecção → Orçamento → Pedido
```

### 15.5. Botão 4 - Cadastro

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: cadastros');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'cadastros' } 
    }));
  }}
  title="Novo Cadastro"
  aria-label="Criar novo cadastro"
>
  <UserPlus size={20} />
  <span className="text-sm">Cadastro</span>
</Button>
```

**Especificações**:
```yaml
Botão Cadastro:
  Ícone: UserPlus (20px)
  Label: "Cadastro"
  
  Navegação:
    - Módulo: "cadastros"
    - Opções: Médico, Hospital, Fornecedor, etc
    - Modal: Seletor de tipo de cadastro
```

### 15.6. Botão 5 - Relatórios

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: relatorios-executivos');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'relatorios-executivos' } 
    }));
  }}
  title="Visualizar relatórios e análises"
  aria-label="Abrir dashboard de relatórios"
>
  <BarChart3 size={20} />
  <span className="text-sm">Relatórios</span>
</Button>
```

**Especificações**:
```yaml
Botão Relatórios:
  Ícone: BarChart3 (20px)
  Label: "Relatórios"
  
  Navegação:
    - Módulo: "relatorios-executivos"
    - Dashboard: Analytics & BI
    - Features: PDF, Excel, PowerBI
```

### 15.7. Botão 6 - Configurar

```typescript
<Button 
  size="default"
  className="bg-icarus-primary text-white border-none hover:bg-icarus-primary-hover flex flex-col items-center gap-2 h-auto py-4"
  onClick={() => {
    console.log('🚀 Navegando para: configuracoes');
    window.dispatchEvent(new CustomEvent('navigate', { 
      detail: { module: 'configuracoes' } 
    }));
  }}
  title="Ajustar configurações do sistema"
  aria-label="Abrir configurações do sistema"
>
  <Settings size={20} />
  <span className="text-sm">Configurar</span>
</Button>
```

**Especificações**:
```yaml
Botão Configurar:
  Ícone: Settings (20px)
  Label: "Configurar"
  
  Navegação:
    - Módulo: "configuracoes"
    - Acesso: Preferências, Integrações, Usuários
    - Permissão: Admin/Gerente
```

---

## 16. SISTEMA DE NAVEGAÇÃO

### 16.1. Custom Events

```typescript
/**
 * Sistema de Navegação por Custom Events
 * 
 * Permite navegação entre módulos sem dependências diretas
 * Escutado pelo componente raiz (App.tsx)
 */

// Disparar navegação
window.dispatchEvent(new CustomEvent('navigate', { 
  detail: { 
    module: 'nome-do-modulo',
    params: { /* opcional */ }
  } 
}));

// Escutar navegação (App.tsx)
useEffect(() => {
  const handleNavigate = (event: CustomEvent) => {
    const { module, params } = event.detail;
    
    console.log(`📍 Navegando para: ${module}`, params);
    
    // Atualizar estado do módulo ativo
    setActiveModule(module);
    
    // Atualizar histórico de navegação
    updateNavigationHistory(module);
    
    // Analytics (opcional)
    trackNavigation(module);
  };

  window.addEventListener('navigate', handleNavigate);
  
  return () => {
    window.removeEventListener('navigate', handleNavigate);
  };
}, []);
```

### 16.2. Módulos Navegáveis

```typescript
// Mapa de módulos do Dashboard
const DASHBOARD_MODULES = {
  // Vendas & CRM
  'crm-vendas': {
    name: 'CRM & Vendas',
    component: CRMVendas,
    icon: Briefcase
  },
  
  // Faturamento
  'faturamento-nfe': {
    name: 'Faturamento & NF-e',
    component: FaturamentoNFeCompleto,
    icon: FileText
  },
  
  // Cadastros
  'cadastros': {
    name: 'Gestão de Cadastros',
    component: GestãoCadastros,
    icon: ClipboardList
  },
  
  // Relatórios
  'relatorios-executivos': {
    name: 'Relatórios Executivos',
    component: RelatoriosExecutivos,
    icon: BarChart3
  },
  
  // Configurações
  'configuracoes': {
    name: 'Configurações do Sistema',
    component: ConfiguracoesSystem,
    icon: Settings
  }
};
```

---

## 17. EVENTOS E CALLBACKS

### 17.1. Atualizar Dados

```typescript
/**
 * Função para atualizar dados do dashboard
 */
const handleAtualizarDados = async () => {
  try {
    // 1. Mostrar loading
    setIsLoading(true);
    toast.info('Atualizando dados...');

    // 2. Fetch de dados
    const [kpisData, graphData] = await Promise.all([
      fetchKPIs(),
      fetchGraphData()
    ]);

    // 3. Atualizar estado
    setKPIs(kpisData);
    setGraphs(graphData);

    // 4. Sucesso
    toast.success('Dados atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    toast.error('Erro ao atualizar dados');
  } finally {
    setIsLoading(false);
  }
};

// Uso
<Button onClick={handleAtualizarDados}>
  <RotateCcw size={16} />
  Atualizar Dados
</Button>
```

### 17.2. Gerar Relatório

```typescript
/**
 * Função para gerar relatório completo
 */
const handleGerarRelatorio = async () => {
  try {
    toast.info('Gerando relatório...');

    // 1. Coletar dados do dashboard
    const reportData = {
      kpis: kpisData,
      graphs: graphsData,
      dateRange: {
        start: startDate,
        end: endDate
      },
      user: currentUser
    };

    // 2. Gerar PDF (ou navegar para módulo)
    if (generatePDF) {
      const pdfBlob = await PDFExportService.generateDashboardReport(reportData);
      downloadBlob(pdfBlob, `relatorio-dashboard-${Date.now()}.pdf`);
      toast.success('Relatório gerado com sucesso!');
    } else {
      // Navegar para módulo de relatórios
      window.dispatchEvent(new CustomEvent('navigate', { 
        detail: { module: 'relatorios-executivos' } 
      }));
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    toast.error('Erro ao gerar relatório');
  }
};
```

---

Vou continuar com a parte 2 do documento em outro arquivo.
