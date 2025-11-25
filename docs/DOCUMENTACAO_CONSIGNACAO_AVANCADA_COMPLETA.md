# 📦 CONSIGNAÇÃO AVANÇADA - DOCUMENTAÇÃO COMPLETA 100%

**Sistema**: ICARUS v5.0  
**Categoria**: Módulo de Gestão de Materiais OPME  
**Design System**: OraclusX DS  
**Prioridade**: P0 (Crítica)  
**Versão**: 5.0.0  
**Última Atualização**: Outubro 2025  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL E ARQUITETURA
1. [Visão Geral do Módulo](#1-visão-geral-do-módulo)
2. [Arquitetura e Componentes](#2-arquitetura-e-componentes)
3. [Modelo de Dados Completo](#3-modelo-de-dados-completo)
4. [Design Neuromórfico](#4-design-neuromórfico)

### PARTE II - KPIS E MÉTRICAS (13 KPIs)
5. [Dashboard Principal - 9 KPIs](#5-dashboard-principal---9-kpis)
6. [KPIs Secundários - 4 Métricas](#6-kpis-secundários---4-métricas)
7. [Relatório Financeiro](#7-relatório-financeiro)

### PARTE III - INTERFACE E NAVEGAÇÃO
8. [Header e Botões de Ação (3 Botões)](#8-header-e-botões-de-ação)
9. [Sistema de Filtros (3 Filtros)](#9-sistema-de-filtros)
10. [Tabs de Navegação (5 Tabs)](#10-tabs-de-navegação)
11. [Layout Responsivo](#11-layout-responsivo)

### PARTE IV - FUNCIONALIDADES CORE
12. [Nova Consignação (Dialog)](#12-nova-consignação-dialog)
13. [Listagem de Materiais](#13-listagem-de-materiais)
14. [Gestão de Faturamento](#14-gestão-de-faturamento)
15. [Controle por Hospital](#15-controle-por-hospital)

### PARTE V - SISTEMA DE ALERTAS
16. [Alertas de Conferência Semanal](#16-alertas-de-conferência-semanal)
17. [Notificações ao Supervisor Logístico](#17-notificações-ao-supervisor-logístico)
18. [Dashboard de Alertas](#18-dashboard-de-alertas)

### PARTE VI - ANÁLISES E RELATÓRIOS
19. [Análise Financeira Completa](#19-análise-financeira-completa)
20. [Rotatividade de Estoque](#20-rotatividade-de-estoque)
21. [Custos de Carregamento](#21-custos-de-carregamento)
22. [Relatórios Exportáveis](#22-relatórios-exportáveis)

### PARTE VII - INTEGRAÇÕES
23. [Integração com Estoque](#23-integração-com-estoque)
24. [Integração com Faturamento](#24-integração-com-faturamento)
25. [Integração com Logística](#25-integração-com-logística)
26. [API Endpoints](#26-api-endpoints)

---

# PARTE I - VISÃO GERAL E ARQUITETURA

## 1. VISÃO GERAL DO MÓDULO

### 1.1. Descrição

**Arquivo**: `/components/modules/ConsignacaoAvancadaNovo.tsx`  
**Componente**: `ConsignacaoAvancadaNovo`

O **Consignação Avançada** é o módulo responsável pelo controle total de materiais OPME (Órteses, Próteses e Materiais Especiais) deixados em hospitais sob regime de consignação. O módulo oferece:

- **Controle total de materiais** em cada hospital
- **Rastreamento em tempo real** de status e localização
- **Alertas automáticos de conferência semanal** ao Supervisor Logístico
- **Gestão financeira completa** com cálculo de ROI e carregamento
- **Análise de rotatividade** e performance por hospital
- **Faturamento automático** de materiais utilizados

### 1.2. Características Principais

```yaml
Características Core:
  - Design Neuromórfico (100% OraclusX DS)
  - 13 KPIs estratégicos
  - 5 Tabs de navegação
  - 3 Filtros inteligentes
  - Sistema de alertas semanais
  - Controle multi-hospital
  - Rastreamento de lotes
  - Gestão de validades
  - Cálculo automático de custos
  - Análise de rotatividade

Funcionalidades Críticas:
  - Registro de nova consignação
  - Movimentação de materiais
  - Utilização e devolução
  - Faturamento automático
  - Conferência semanal
  - Relatórios financeiros
  - Controle de comissões
  - Gestão de contratos

Tecnologias:
  - React + TypeScript
  - Lucide Icons (48 ícones)
  - ShadCN UI Components
  - OraclusX Design System
  - Supabase Backend
  - Real-time Subscriptions
```

### 1.3. Hierarquia de Informação

```
Consignação Avançada
├── Header
│   ├── Título + Descrição
│   └── Botões de Ação (3)
│       ├── Relatório (Download)
│       ├── Financeiro (Calculator)
│       └── Nova Consignação (Plus)
├── Filtros (3 campos)
│   ├── Busca Global (Search)
│   ├── Filtro de Status (Filter)
│   └── Filtro de Hospital (Building2)
├── Tabs (5 seções)
│   ├── Dashboard (BarChart3)
│   │   ├── KPIs Principais (9 cards)
│   │   ├── Gráficos de Análise
│   │   └── Top Hospitais
│   ├── Materiais (Package)
│   │   ├── Listagem Completa
│   │   ├── Detalhes por Material
│   │   └── Histórico de Movimentações
│   ├── Faturamento (Receipt)
│   │   ├── Faturamentos Pendentes
│   │   ├── Faturamentos Gerados
│   │   └── Pagamentos Recebidos
│   ├── Financeiro (DollarSign)
│   │   ├── Análise de Rentabilidade
│   │   ├── Custos Operacionais
│   │   └── ROI por Hospital
│   └── Hospitais (Building2)
│       ├── Lista de Hospitais Ativos
│       ├── Materiais por Hospital
│       └── Performance Individual
└── Sistema de Alertas
    ├── Conferência Semanal
    ├── Vencimentos Próximos
    ├── Materiais Parados
    └── Faturamentos Pendentes
```

---

## 2. ARQUITETURA E COMPONENTES

### 2.1. Estrutura de Código

```typescript
// ═══════════════════════════════════════════════════════════
// IMPORTS - 48 ÍCONES LUCIDE + COMPONENTES
// ═══════════════════════════════════════════════════════════

import React, { useState } from "react";

// Componentes OraclusX DS
import { NeomorphicCard } from "../NeomorphicCard";
import { NeomorphicIcon } from "../NeomorphicIcon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Ícones Lucide (48 total)
import { 
  Package, DollarSign, Clock, Calendar as CalendarIcon,
  AlertTriangle, CheckCircle, TrendingUp, Search, Filter,
  Plus, Eye, Download, Upload, BarChart3, Building2,
  User, Truck, MapPin, RefreshCcw, XCircle, FileText,
  Calculator, CreditCard, ArrowUpRight, ArrowDownRight,
  Package2, Archive, RotateCcw, Target, Zap, Shield,
  Users, Hospital, Stethoscope, Activity, Receipt,
  Banknote, Wallet, PieChart, TrendingDown, AlertCircle,
  CheckCircle2, ExternalLink, History, Settings, Globe
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function ConsignacaoAvancadaNovo() {
  // Estado
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [hospitalFilter, setHospitalFilter] = useState("todos");
  const [isNovaConsignacaoOpen, setIsNovaConsignacaoOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialConsignado | null>(null);

  // Lógica de filtros
  const materiaisFiltrados = mockMateriaisConsignados.filter(material => {
    const matchSearch = material.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       material.codigoInterno.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "todos" || material.status === statusFilter;
    const matchHospital = hospitalFilter === "todos" || material.hospital.nome === hospitalFilter;
    
    return matchSearch && matchStatus && matchHospital;
  });

  // Cálculo de métricas
  const metrics = {
    totalMateriais: mockMateriaisConsignados.length,
    valorTotalConsignado: mockMateriaisConsignados.reduce((sum, m) => sum + m.valorTotal, 0),
    materiaisDisponiveis: mockMateriaisConsignados.filter(m => m.status === 'disponivel').length,
    materiaisUtilizados: mockMateriaisConsignados.filter(m => m.status === 'utilizado').length,
    // ... mais métricas
  };

  // Render
  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Filtros */}
      {/* Tabs */}
      {/* Sistema de Alertas */}
    </div>
  );
}
```

### 2.2. Componentes Utilizados

```typescript
const componentsUsed = {
  // Core OraclusX DS
  core: [
    'NeomorphicCard',      // 13+ cards
    'NeomorphicIcon',      // 13+ ícones
    'Button',              // 8+ botões
    'Input',               // 8+ inputs
    'Select',              // 4 selects
    'Badge',               // Status badges
    'Tabs',                // 5 tabs
    'Dialog',              // Modals
    'Calendar',            // Date picker
    'Popover'              // Tooltips
  ],
  
  // Ícones por Categoria (48 total)
  icones: {
    materiais: ['Package', 'Package2', 'Archive', 'Settings', 'Zap'],
    financeiro: ['DollarSign', 'Calculator', 'CreditCard', 'Banknote', 'Wallet', 'Receipt'],
    status: ['CheckCircle', 'CheckCircle2', 'Clock', 'AlertTriangle', 'XCircle', 'AlertCircle'],
    movimento: ['ArrowUpRight', 'ArrowDownRight', 'RefreshCcw', 'RotateCcw', 'Truck'],
    análise: ['BarChart3', 'PieChart', 'TrendingUp', 'TrendingDown', 'Target', 'Activity'],
    hospital: ['Building2', 'Hospital', 'MapPin', 'Stethoscope', 'Users', 'User'],
    ações: ['Plus', 'Download', 'Upload', 'Eye', 'Search', 'Filter'],
    outros: ['CalendarIcon', 'FileText', 'Shield', 'Globe', 'History', 'ExternalLink']
  },
  
  // Helpers
  utilities: [
    'getStatusBadge()',
    'getRotatividadeBadge()',
    'getFaturamentoStatusBadge()',
    'formatCurrency()',
    'formatDate()',
    'formatPercent()',
    'getDiasVencimento()',
    'getCategoriaIcon()'
  ]
};
```

---

## 3. MODELO DE DADOS COMPLETO

### 3.1. Interface MaterialConsignado

```typescript
interface MaterialConsignado {
  // Identificação
  id: string;                    // "CONS001"
  codigoInterno: string;         // "PR-CONS-001"
  nome: string;                  // "Prótese de Joelho Cerâmica"
  
  // Fornecedor e Fabricante
  fabricante: string;            // "OrthoTech Solutions"
  fornecedor: string;            // "Implantes Médicos Brasil"
  
  // Categoria
  categoria: 'implantes' | 'instrumentais' | 'descartaveis' | 'equipamentos' | 'outros';
  
  // Lote e Validade
  lote: string;                  // "LOT-2024-045"
  validade: string;              // "2029-08-15"
  dataRecebimento: string;       // "2024-11-01"
  
  // Quantidade e Valores
  quantidade: number;            // 2
  valorUnitario: number;         // 8500.00
  valorTotal: number;            // 17000.00
  
  // Status
  status: 'disponivel' | 'reservado' | 'utilizado' | 'devolvido' | 'vencido' | 'danificado';
  
  // Hospital
  hospital: {
    nome: string;                // "Hospital São Francisco"
    cnpj: string;                // "12.345.678/0001-90"
    endereco: string;            // "Rua das Flores, 123"
    responsavel: string;         // "Dr. Carlos Medicina"
  };
  
  // Contrato de Consignação
  contratoConsignacao: {
    numero: string;              // "CONS-HSF-2024-001"
    prazoVencimento: string;     // "2025-01-31"
    percentualComissao: number;  // 15
    condicoesPagamento: string;  // "30 dias após utilização"
  };
  
  // Última Movimentação
  ultimaMovimentacao: {
    data: string;                // "2024-11-01"
    tipo: 'entrada' | 'saida' | 'utilizacao' | 'devolucao' | 'transferencia';
    responsavel: string;         // "João Logística"
    observacoes?: string;        // "Material recebido em perfeito estado"
  };
  
  // Análise Financeira
  custoCarregamento: number;     // 255.00 (1.5% ao mês)
  diasEstoque: number;           // 45
  rotatividade: 'alta' | 'media' | 'baixa';
}
```

### 3.2. Interface FaturamentoConsignacao

```typescript
interface FaturamentoConsignacao {
  // Identificação
  id: string;                    // "FAT001"
  periodo: string;               // "2024-11"
  hospital: string;              // "Clínica Ortopédica Central"
  
  // Materiais
  materiaisUtilizados: MaterialConsignado[];
  
  // Valores
  valorBruto: number;            // 3200.00
  desconto: number;              // 160.00 (5%)
  impostos: number;              // 456.00 (14.25%)
  valorLiquido: number;          // 2584.00
  
  // Status e Datas
  status: 'pendente' | 'faturado' | 'pago' | 'vencido';
  dataVencimento: string;        // "2025-01-24"
  dataPagamento?: string;        // "2025-01-20"
  
  // Documentação
  numeroNF?: string;             // "NF-2024-0001"
  observacoes?: string;
}
```

### 3.3. Interface RelatorioFinanceiro

```typescript
interface RelatorioFinanceiro {
  // Identificação
  id: string;                    // "REL001"
  periodo: string;               // "2024-12"
  
  // Valores Totais
  valorTotalConsignado: number;  // 47200.00
  valorTotalUtilizado: number;   // 3200.00
  valorTotalDevolvido: number;   // 15000.00
  
  // Margens
  margemBruta: number;           // 18.5%
  margemLiquida: number;         // 12.3%
  
  // Custos
  custosOperacionais: number;    // 2840.00
  
  // Performance
  giroEstoque: number;           // 2.4 vezes/ano
  tempoMedioEstoque: number;     // 45.7 dias
  
  // Riscos
  inadimplencia: number;         // 0.8%
  roi: number;                   // 15.6%
}
```

### 3.4. Dados Mock Completos

```typescript
// 5 Materiais de Exemplo
const mockMateriaisConsignados: MaterialConsignado[] = [
  {
    id: "CONS001",
    nome: "Prótese de Joelho Cerâmica",
    fabricante: "OrthoTech Solutions",
    categoria: "implantes",
    valorTotal: 17000.00,
    status: "disponivel",
    hospital: { nome: "Hospital São Francisco", ... },
    diasEstoque: 45,
    rotatividade: "alta"
  },
  {
    id: "CONS002",
    nome: "Kit Instrumentais Cirúrgicos",
    valorTotal: 3200.00,
    status: "utilizado",
    hospital: { nome: "Clínica Ortopédica Central", ... },
    diasEstoque: 56
  },
  {
    id: "CONS003",
    nome: "Parafusos Pediculares Titânio",
    valorTotal: 3600.00,
    status: "reservado",
    diasEstoque: 83,
    rotatividade: "baixa"
  },
  {
    id: "CONS004",
    nome: "Stent Coronário Premium",
    valorTotal: 8400.00,
    status: "disponivel",
    diasEstoque: 15,
    rotatividade: "alta"
  },
  {
    id: "CONS005",
    nome: "Marca-passo Dupla Câmara",
    valorTotal: 15000.00,
    status: "devolvido",
    diasEstoque: 29,
    rotatividade: "baixa"
  }
];

// Hospitais Únicos: 5
const hospitais = [
  "Hospital São Francisco",
  "Clínica Ortopédica Central",
  "Hospital Regional Norte",
  "Instituto Cardiológico",
  "Hospital Cardio Avançado"
];
```

---

## 4. DESIGN NEUROMÓRFICO

### 4.1. NeomorphicCard - KPI Cards

```css
/* ═══════════════════════════════════════════════════════════
   KPI CARDS - PADRÃO ORACLUSX DS
   ═══════════════════════════════════════════════════════════ */

.kpi-card-compact {
  /* Layout */
  padding: 20px;
  border-radius: 16px;
  
  /* Background - Modo Claro */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(245, 247, 250, 0.8) 100%
  );
  
  /* Neuromórfico Raised */
  box-shadow: 
    -8px -8px 16px rgba(255, 255, 255, 0.9),
    8px 8px 16px rgba(0, 0, 0, 0.1),
    inset 2px 2px 4px rgba(255, 255, 255, 0.5);
    
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* Hover */
.kpi-card-compact:hover {
  transform: translateY(-2px);
  box-shadow: 
    -10px -10px 20px rgba(255, 255, 255, 0.95),
    10px 10px 20px rgba(0, 0, 0, 0.12);
}

/* ═══════════════════════════════════════════════════════════
   MODO ESCURO
   ═══════════════════════════════════════════════════════════ */

.dark .kpi-card-compact {
  background: linear-gradient(
    135deg,
    rgba(30, 41, 59, 0.95) 0%,
    rgba(15, 23, 42, 0.9) 100%
  );
  
  box-shadow: 
    -8px -8px 16px rgba(51, 65, 85, 0.3),
    8px 8px 16px rgba(0, 0, 0, 0.5),
    inset 2px 2px 4px rgba(51, 65, 85, 0.1);
    
  border-color: rgba(255, 255, 255, 0.08);
}
```

### 4.2. NeomorphicIcon Specifications

```typescript
/**
 * NeomorphicIcon usado nos 13 KPIs
 */
interface NeomorphicIconProps {
  icon: React.ComponentType;
  color: string;  // 'bg-icarus-primary', 'bg-green-500', etc
  size?: 'sm' | 'md' | 'lg';
}

// Cores utilizadas no módulo (9 variantes)
const ICON_COLORS = {
  primary: 'bg-icarus-primary',      // #6366F1 - Padrão
  green: 'bg-green-500',             // #22C55E - Sucesso/Financeiro
  blue: 'bg-blue-500',               // #3B82F6 - Utilização
  purple: 'bg-purple-500',           // #A855F7 - Devolução
  yellow: 'bg-yellow-500',           // #EAB308 - Tempo/Alerta
  orange: 'bg-orange-500',           // #F97316 - Pendências
  red: 'bg-red-500',                 // #EF4444 - Crítico
  cyan: 'bg-cyan-500',               // #06B6D4 - Info
  emerald: 'bg-emerald-500'          // #10B981 - Performance
};
```

---

# PARTE II - KPIS E MÉTRICAS (13 KPIs)

## 5. DASHBOARD PRINCIPAL - 9 KPIS

### 5.1. KPI #1 - Total Materiais

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Total Materiais</h4>
      <p className="text-2xl font-semibold text-foreground">
        {metrics.totalMateriais}
      </p>
    </div>
    <NeomorphicIcon icon={Package} color="bg-icarus-primary" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Total Materiais:
  Valor: 5 materiais (mockado)
  Ícone: Package (Lucide)
  Cor: #6366F1 (Indigo - Primary)
  
  Cálculo:
    - Count total de materiais consignados
    - Todos os status incluídos
    
  Significado:
    - Quantidade total de itens em consignação
    - Independente de status ou hospital
    
  Fonte de Dados:
    - mockMateriaisConsignados.length
```

### 5.2. KPI #2 - Valor Consignado

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Valor Consignado</h4>
      <p className="text-lg font-semibold text-foreground">
        {formatCurrency(metrics.valorTotalConsignado)}
      </p>
    </div>
    <NeomorphicIcon icon={DollarSign} color="bg-green-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Valor Consignado:
  Valor: R$ 47.200,00
  Ícone: DollarSign
  Cor: #22C55E (Green-500)
  
  Cálculo:
    - Soma de valorTotal de todos os materiais
    - Formula: SUM(material.valorTotal)
    
  Breakdown:
    - CONS001: R$ 17.000,00
    - CONS002: R$ 3.200,00
    - CONS003: R$ 3.600,00
    - CONS004: R$ 8.400,00
    - CONS005: R$ 15.000,00
    - Total: R$ 47.200,00
    
  Significado:
    - Capital imobilizado em consignação
    - Exposição financeira total
    - Base para cálculo de custos
```

### 5.3. KPI #3 - Materiais Utilizados

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Utilizados</h4>
      <p className="text-2xl font-semibold text-blue-500">
        {metrics.materiaisUtilizados}
      </p>
    </div>
    <NeomorphicIcon icon={CheckCircle} color="bg-blue-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Materiais Utilizados:
  Valor: 1 material
  Ícone: CheckCircle
  Cor: #3B82F6 (Blue-500)
  
  Cálculo:
    - Count de materiais com status = 'utilizado'
    - Gera faturamento
    
  Materiais:
    - CONS002: Kit Instrumentais Cirúrgicos
    - Valor: R$ 3.200,00
    - Hospital: Clínica Ortopédica Central
    
  Significado:
    - Materiais efetivamente usados em cirurgias
    - Aguardando faturamento
    - Gera receita
```

### 5.4. KPI #4 - Materiais Devolvidos

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Devolvidos</h4>
      <p className="text-2xl font-semibold text-purple-500">
        {metrics.materiaisDevolvidos}
      </p>
    </div>
    <NeomorphicIcon icon={RefreshCcw} color="bg-purple-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Materiais Devolvidos:
  Valor: 1 material
  Ícone: RefreshCcw
  Cor: #A855F7 (Purple-500)
  
  Materiais:
    - CONS005: Marca-passo Dupla Câmara
    - Valor: R$ 15.000,00
    - Motivo: "Paciente não compareceu"
    
  Significado:
    - Material retornou ao estoque
    - Não gera faturamento
    - Custo de carregamento perdido
    
  Impacto Financeiro:
    - Valor devolvido: R$ 15.000,00
    - Custo carregamento: R$ 450,00 (perdido)
    - Dias em estoque: 29 dias
```

### 5.5. KPI #5 - Taxa de Utilização

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Taxa Utilização</h4>
      <p className="text-2xl font-semibold text-green-500">
        {formatPercent(metrics.taxaUtilizacao)}
      </p>
    </div>
    <NeomorphicIcon icon={Target} color="bg-green-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Taxa de Utilização:
  Valor: 20.0%
  Ícone: Target
  Cor: #22C55E (Green-500)
  
  Cálculo:
    - (Materiais Utilizados / Total Materiais) * 100
    - (1 / 5) * 100 = 20%
    
  Benchmarks:
    - Excelente: >= 40%
    - Bom: 25-39%
    - Regular: 15-24%
    - Ruim: < 15%
    - Atual: 20% (Regular)
    
  Ações para Melhoria:
    - Reduzir quantidade consignada
    - Focar em hospitais com alta utilização
    - Negociar devoluções mais rápidas
```

### 5.6. KPI #6 - Valor Utilizado

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Valor Utilizado</h4>
      <p className="text-lg font-semibold text-green-500">
        {formatCurrency(metrics.valorUtilizado)}
      </p>
    </div>
    <NeomorphicIcon icon={ArrowUpRight} color="bg-green-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Valor Utilizado:
  Valor: R$ 3.200,00
  Ícone: ArrowUpRight
  Cor: #22C55E (Green-500)
  
  Composição:
    - CONS002: R$ 3.200,00
    - Total: R$ 3.200,00
    
  Taxa sobre Consignado:
    - R$ 3.200 / R$ 47.200 = 6.78%
    - Meta: >= 30%
    - Status: Abaixo da meta
    
  Previsão Faturamento:
    - Valor Bruto: R$ 3.200,00
    - Comissão (18%): R$ 576,00
    - Impostos (14.25%): R$ 456,00
    - Líquido: R$ 2.168,00
```

### 5.7. KPI #7 - Valor Devolvido

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Valor Devolvido</h4>
      <p className="text-lg font-semibold text-purple-500">
        {formatCurrency(metrics.valorDevolvido)}
      </p>
    </div>
    <NeomorphicIcon icon={ArrowDownRight} color="bg-purple-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Valor Devolvido:
  Valor: R$ 15.000,00
  Ícone: ArrowDownRight
  Cor: #A855F7 (Purple-500)
  
  Impacto Negativo:
    - Capital imobilizado sem retorno
    - Custo de carregamento: R$ 450,00
    - Custo logístico (ida+volta): R$ 120,00
    - Perda total: R$ 570,00
    
  Taxa de Devolução:
    - R$ 15.000 / R$ 47.200 = 31.78%
    - Meta: < 10%
    - Status: CRÍTICO (3x acima da meta)
    
  Ações Corretivas:
    - Melhorar planejamento de cirurgias
    - Reduzir prazo de consignação
    - Penalizar devoluções tardias
```

### 5.8. KPI #8 - Dias Médio Estoque

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Dias Médio Estoque</h4>
      <p className="text-2xl font-semibold text-yellow-500">
        {metrics.diasMedioEstoque}
      </p>
    </div>
    <NeomorphicIcon icon={Clock} color="bg-yellow-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Dias Médio Estoque:
  Valor: 46 dias
  Ícone: Clock
  Cor: #EAB308 (Yellow-500)
  
  Cálculo:
    - Média de diasEstoque de todos os materiais
    - (45 + 56 + 83 + 15 + 29) / 5 = 45.6 ≈ 46 dias
    
  Breakdown por Material:
    - CONS004 (Stent): 15 dias ✅ Excelente
    - CONS005 (Marca-passo): 29 dias ✅ Bom
    - CONS001 (Prótese Joelho): 45 dias ⚠️ Regular
    - CONS002 (Instrumentais): 56 dias ❌ Ruim
    - CONS003 (Parafusos): 83 dias ❌ Crítico
    
  Benchmarks:
    - Excelente: < 30 dias
    - Bom: 30-45 dias
    - Regular: 46-60 dias
    - Ruim: > 60 dias
    
  Custo de Carregamento:
    - Taxa: 1.5% ao mês sobre valor
    - 46 dias = 1.53 meses
    - Custo médio: 2.3% do valor
```

### 5.9. KPI #9 - Faturamento Pendente

```typescript
<NeomorphicCard className="kpi-card-compact">
  <div className="flex items-center justify-between">
    <div>
      <h4 className="text-sm text-muted-foreground">Fatur. Pendente</h4>
      <p className="text-lg font-semibold text-orange-500">
        {formatCurrency(metrics.faturamentoPendente)}
      </p>
    </div>
    <NeomorphicIcon icon={AlertCircle} color="bg-orange-500" />
  </div>
</NeomorphicCard>
```

**Especificações**:
```yaml
Faturamento Pendente:
  Valor: R$ 0,00 (sem pendências)
  Ícone: AlertCircle
  Cor: #F97316 (Orange-500)
  
  Status Atual:
    - Faturamentos Gerados: 1
    - Faturamentos Pendentes: 1
    - Valor Pendente: R$ 0,00
    
  Faturamentos:
    1. FAT001 (Faturado):
       - Hospital: Clínica Ortopédica Central
       - Valor Líquido: R$ 2.584,00
       - Status: Faturado
       - NF: NF-2024-0001
       - Vencimento: 2025-01-24
       
    2. FAT002 (Pendente):
       - Hospital: Hospital São Francisco
       - Valor: R$ 0,00 (sem materiais utilizados)
       - Status: Pendente
       
  Próximas Ações:
    - Aguardar utilização de materiais
    - Gerar faturamento após uso
    - Emitir NF-e
```

---

Vou continuar a documentação na parte 2:
