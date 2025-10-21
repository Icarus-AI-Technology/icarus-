# 📘 DOCUMENTAÇÃO COMPLETA DO SISTEMA ICARUS v5.0
## Sistema ERP Neuromórfico para Distribuidora OPME B2B

**Versão**: 5.0.0  
**Última Atualização**: Outubro 2024  
**Total de Módulos**: 58  
**Design System**: OraclusX DS  
**Banco de Dados**: Supabase (PostgreSQL)  
**Idioma**: Português Brasileiro (pt-BR)

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL DO SISTEMA
1. [Arquitetura Geral](#arquitetura-geral)
2. [OraclusX Design System](#oraclusx-design-system)
3. [Navegação e Interface](#navegação-e-interface)
4. [Autenticação e Segurança](#autenticação-e-segurança)

### PARTE II - MÓDULOS CORE (1-10)
1. [Dashboard Principal](#1-dashboard-principal)
2. [Gestão de Cadastros](#2-gestão-de-cadastros)
3. [Cirurgias e Procedimentos](#3-cirurgias-e-procedimentos)
4. [Estoque com IA](#4-estoque-com-ia)
5. [Financeiro Avançado](#5-financeiro-avançado)
6. [Faturamento Avançado](#6-faturamento-avançado)
7. [Faturamento NF-e Completo](#7-faturamento-nf-e-completo)
8. [Contas a Receber IA](#8-contas-a-receber-ia)
9. [Relatórios Financeiros](#9-relatórios-financeiros)
10. [Relatórios Executivos](#10-relatórios-executivos)

### PARTE III - MÓDULOS COMERCIAIS (11-20)
11. [CRM Vendas](#11-crm-vendas)
12. [Gestão de Leads](#12-gestão-de-leads)
13. [Relacionamento com Cliente](#13-relacionamento-com-cliente)
14. [Gestão de Compras](#14-gestão-de-compras)
15. [Compras Internacionais](#15-compras-internacionais)
16. [Notas de Compra](#16-notas-de-compra)
17. [Logística Avançada](#17-logística-avançada)
18. [Logística Transportadoras](#18-logística-transportadoras)
19. [Consignação Avançada](#19-consignação-avançada)
20. [Rastreabilidade OPME](#20-rastreabilidade-opme)

### PARTE IV - MÓDULOS OPERACIONAIS (21-30)
21. [Gestão de Inventário](#21-gestão-de-inventário)
22. [Grupos de Produtos OPME](#22-grupos-de-produtos-opme)
23. [Tabela de Preços Viewer](#23-tabela-de-preços-viewer)
24. [Tabelas de Preços Form](#24-tabelas-de-preços-form)
25. [Tabelas de Preços Import](#25-tabelas-de-preços-import)
26. [Viabilidade de Importação](#26-viabilidade-de-importação)
27. [IA Central](#27-ia-central)
28. [Automação IA](#28-automação-ia)
29. [ChatBot Metrics Dashboard](#29-chatbot-metrics-dashboard)
30. [Analytics BI](#30-analytics-bi)

### PARTE V - MÓDULOS ANALYTICS E INTELIGÊNCIA (31-40)
31. [Analytics Predição](#31-analytics-predição)
32. [BI Dashboard Interativo](#32-bi-dashboard-interativo)
33. [KPI Dashboard Consolidado](#33-kpi-dashboard-consolidado)
34. [Integrações Avançadas](#34-integrações-avançadas)
35. [Integrations Manager](#35-integrations-manager)
36. [API Gateway](#36-api-gateway)
37. [Gestão Usuários e Permissões](#37-gestão-usuários-e-permissões)
38. [Configurações do Sistema](#38-configurações-do-sistema)
39. [Configurações Avançadas](#39-configurações-avançadas)
40. [RH Gestão de Pessoas](#40-rh-gestão-de-pessoas)

### PARTE VI - MÓDULOS COMPLIANCE E GESTÃO (41-50)
41. [Compliance e Auditoria](#41-compliance-e-auditoria)
42. [Qualidade e Certificação](#42-qualidade-e-certificação)
43. [Relatórios Regulatórios](#43-relatórios-regulatórios)
44. [Gestão Contábil](#44-gestão-contábil)
45. [Gestão de Contratos](#45-gestão-de-contratos)
46. [Licitações e Propostas](#46-licitações-e-propostas)
47. [Campanhas de Marketing](#47-campanhas-de-marketing)
48. [Telemetria IoT](#48-telemetria-iot)
49. [Manutenção Preventiva](#49-manutenção-preventiva)
50. [Workflow Builder Visual](#50-workflow-builder-visual)

### PARTE VII - MÓDULOS AVANÇADOS (51-58)
51. [Voice Analytics Dashboard](#51-voice-analytics-dashboard)
52. [Voice Biometrics Manager](#52-voice-biometrics-manager)
53. [Voice Macros Manager](#53-voice-macros-manager)
54. [Video Calls Manager](#54-video-calls-manager)
55. [Notificações Inteligentes](#55-notificações-inteligentes)
56. [System Health Dashboard](#56-system-health-dashboard)
57. [Tooltip Analytics Dashboard](#57-tooltip-analytics-dashboard)
58. [Voice Commands Manager](#58-voice-commands-manager)

---

# PARTE I - VISÃO GERAL DO SISTEMA

## ARQUITETURA GERAL

### 1.1. Stack Tecnológico

```yaml
Frontend:
  Framework: React 18.3.1 + TypeScript 5.6.3
  Build: Vite 5.4.10
  Styling: Tailwind CSS 4.0
  UI Components: Shadcn/ui + OraclusX DS
  State Management: React Context + Hooks
  
Backend as a Service:
  Provider: Supabase
  Database: PostgreSQL 15.x
  Real-time: WebSockets
  Storage: S3-compatible
  Auth: JWT-based
  
AI & ML:
  Primary: OpenAI GPT-4 Turbo
  Secondary: Anthropic Claude 3.5 Sonnet
  Speech: OpenAI Whisper
  Local: Ollama (Llama 3.2)
  ML: TensorFlow.js 4.x
  
Integrações:
  Governamentais: ANS, ANVISA, SEFAZ, Receita Federal
  Médicas: FHIR HL7, TUSS
  Financeiras: Pluggy DDA, Stripe
  Transportadoras: Correios, Jadlog, TNT
  BI: Power BI, Google Analytics
```

### 1.2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                   ICARUS v5.0 - ARQUITETURA                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              PRESENTATION LAYER                         │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │    │
│  │  │   TopBar     │  │   Sidebar    │  │  Main Area   │ │    │
│  │  │   (Fixed)    │  │ (Collapsible)│  │   (Dynamic)  │ │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC LAYER                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │ Modules  │ │   AI     │ │  Forms   │ │  Hooks   │ │    │
│  │  │(58 total)│ │ Services │ │          │ │          │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              DATA ACCESS LAYER                          │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │         Supabase Client (PostgreSQL)             │  │    │
│  │  │  - Auth  - Database  - Storage  - Real-time     │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           EXTERNAL INTEGRATIONS LAYER                   │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │    │
│  │  │  APIs   │ │  AI     │ │  Govt   │ │ Medical │     │    │
│  │  │External │ │Providers│ │ Systems │ │ Systems │     │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## ORACLUSX DESIGN SYSTEM

### 2.1. Design Tokens

#### **Cores Semânticas**

```css
/* /styles/globals.css */

/* Cor Padrão Universal */
--color-brand-primary: #6366F1;        /* Indigo médio - PADRÃO UNIVERSAL */
--color-brand-primary-hover: #4F46E5;  /* Indigo escuro */
--color-brand-primary-light: #818CF8;  /* Indigo claro */

/* Backgrounds Neuromórficos */
--bg-light: #E8EBF3;                   /* Background claro */
--bg-dark: #1A1D2E;                    /* Background escuro */
--surface-light: #F5F7FA;              /* Surface claro */
--surface-dark: #252A3F;               /* Surface escuro */

/* Shadows Neuromórficas */
--shadow-light-outer: 8px 8px 16px rgba(174, 174, 192, 0.4), 
                      -8px -8px 16px rgba(255, 255, 255, 0.8);
--shadow-light-inner: inset 4px 4px 8px rgba(174, 174, 192, 0.3),
                      inset -4px -4px 8px rgba(255, 255, 255, 0.7);
--shadow-dark-outer: 8px 8px 16px rgba(0, 0, 0, 0.5),
                     -8px -8px 16px rgba(255, 255, 255, 0.05);
--shadow-dark-inner: inset 4px 4px 8px rgba(0, 0, 0, 0.4),
                     inset -4px -4px 8px rgba(255, 255, 255, 0.05);

/* Textos */
--text-primary-light: #1F2937;         /* Texto principal claro */
--text-primary-dark: #F9FAFB;          /* Texto principal escuro */
--text-secondary-light: #6B7280;       /* Texto secundário claro */
--text-secondary-dark: #9CA3AF;        /* Texto secundário escuro */

/* Estados */
--color-success: #10B981;              /* Verde - Sucesso */
--color-warning: #F59E0B;              /* Âmbar - Alerta */
--color-error: #EF4444;                /* Vermelho - Erro */
--color-info: #3B82F6;                 /* Azul - Informação */

/* KPI Cards - PADRÃO OFICIAL */
--kpi-bg-indigo: #6366F1;              /* Background dos KPIs */
--kpi-text-white: #FFFFFF;             /* Texto dos KPIs */
--kpi-icon-white: #FFFFFF;             /* Ícones dos KPIs */
```

#### **Tipografia**

```css
/* Hierarquia Tipográfica */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Tamanhos - CONTROLADOS POR CSS, NÃO TAILWIND */
h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }      /* 40px */
h2 { font-size: 2rem; font-weight: 600; line-height: 1.3; }        /* 32px */
h3 { font-size: 1.75rem; font-weight: 600; line-height: 1.4; }     /* 28px */
h4 { font-size: 1.5rem; font-weight: 500; line-height: 1.5; }      /* 24px */
h5 { font-size: 1.25rem; font-weight: 500; line-height: 1.5; }     /* 20px */
h6 { font-size: 1rem; font-weight: 500; line-height: 1.5; }        /* 16px */
p { font-size: 1rem; font-weight: 400; line-height: 1.6; }         /* 16px */
small { font-size: 0.875rem; font-weight: 400; line-height: 1.5; } /* 14px */
```

#### **Espaçamento (8px Grid System)**

```css
--spacing-unit: 8px;
--spacing-xs: 4px;    /* 0.5x */
--spacing-sm: 8px;    /* 1x */
--spacing-md: 16px;   /* 2x */
--spacing-lg: 24px;   /* 3x */
--spacing-xl: 32px;   /* 4x */
--spacing-2xl: 48px;  /* 6x */
--spacing-3xl: 64px;  /* 8x */
```

#### **Bordas e Raios**

```css
--radius-sm: 4px;     /* Pequeno */
--radius-md: 8px;     /* Médio */
--radius-lg: 12px;    /* Grande */
--radius-xl: 16px;    /* Extra grande */
--radius-full: 9999px; /* Circular */
```

### 2.2. Componentes OraclusX DS

#### **Localização**
```
/components/oraclusx-ds/
├── Button.tsx                    # Botão neuromórfico padrão
├── Card.tsx                      # Card neuromórfico
├── Input.tsx                     # Input neuromórfico
├── InputContainer.tsx            # Container para inputs
├── SearchField.tsx               # Campo de busca
├── SearchContainer.tsx           # Container de busca
├── IconButtonNeu.tsx             # Botão de ícone neuromórfico
├── TopbarIconButton.tsx          # Botão para topbar
├── NavigationBar.tsx             # Barra de navegação
├── SubModulesNavigation.tsx      # Navegação de sub-módulos
├── ChatbotFAB.tsx                # Floating Action Button do chatbot
├── ChatbotFABWithPrompt.tsx      # FAB com prompt
├── ChatbotCloseButton.tsx        # Botão fechar chatbot
├── FormBanner.tsx                # Banner de formulários
└── index.ts                      # Exports centralizados
```

#### **Button Component**

```typescript
// /components/oraclusx-ds/Button.tsx

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Botão Neuromórfico OraclusX DS
 * 
 * PADRÃO DE DESIGN:
 * - Cor padrão universal: #6366F1 (indigo médio)
 * - Sombras neuromórficas (depende do tema)
 * - Hover e active states suaves
 * - Acessibilidade WCAG AA
 * 
 * POR QUÊ:
 * - Consistência visual em todo o sistema
 * - Identidade visual médica/saúde
 * - Feedback visual claro ao usuário
 * 
 * CONTEXTO:
 * - Usado em TODOS os botões do sistema
 * - Exceções apenas em componentes específicos (AlertDialog, etc)
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  icon
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-[#6366F1] text-white
      hover:bg-[#4F46E5]
      shadow-[4px_4px_8px_rgba(99,102,241,0.2),-4px_-4px_8px_rgba(255,255,255,0.1)]
      dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.05)]
      active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]
    `,
    secondary: `
      bg-surface-light dark:bg-surface-dark
      text-text-primary-light dark:text-text-primary-dark
      shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
      hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]
    `,
    ghost: `
      bg-transparent text-text-primary-light dark:text-text-primary-dark
      hover:bg-surface-light dark:hover:bg-surface-dark
    `
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
```

#### **Card Component**

```typescript
// /components/oraclusx-ds/Card.tsx

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'flat' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card Neuromórfico OraclusX DS
 * 
 * PADRÃO DE DESIGN:
 * - Sombras neuromórficas externas (elevação)
 * - Background adaptável ao tema
 * - Bordas arredondadas (8px padrão)
 * - Hierarquia visual clara
 * 
 * POR QUÊ:
 * - Organização visual de conteúdo
 * - Separação clara de seções
 * - Profundidade visual (neuromorfismo)
 * 
 * CONTEXTO:
 * - Usado em todos os módulos para exibir informações
 * - KPIs, formulários, listagens, etc
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  variant = 'default',
  padding = 'md'
}) => {
  const variants = {
    default: `
      bg-surface-light dark:bg-surface-dark
      shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
    `,
    flat: `
      bg-surface-light dark:bg-surface-dark
      border border-gray-200 dark:border-gray-700
    `,
    elevated: `
      bg-white dark:bg-gray-800
      shadow-[8px_8px_24px_rgba(174,174,192,0.4),-8px_-8px_24px_rgba(255,255,255,0.8)]
      dark:shadow-[8px_8px_24px_rgba(0,0,0,0.5),-8px_-8px_24px_rgba(255,255,255,0.05)]
    `
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`rounded-lg ${variants[variant]} ${paddings[padding]}`}>
      {(title || icon || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="text-[#6366F1]">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
```

### 2.3. Hard Gate System

#### **Validação em Tempo Real**

```typescript
// Sistema de validação automática de conformidade OraclusX DS

/**
 * Hard Gate System
 * 
 * FUNÇÃO:
 * - Validar computed styles em tempo real
 * - Bloquear coverage se houver divergências
 * - Exibir banner "ORX Gate: REPROVADO" quando há violações
 * - Permitir 100% coverage apenas com 0 pendências
 * 
 * POR QUÊ:
 * - Garantir 100% de conformidade com OraclusX DS
 * - Evitar regressões visuais
 * - Manter consistência em todo o sistema
 * 
 * COMO FUNCIONA:
 * 1. Monitora computed styles de elementos críticos
 * 2. Compara com padrões definidos no Design System
 * 3. Se encontrar divergência, marca como REPROVADO
 * 4. Exibe banner global com detalhes das violações
 * 5. Bloqueia aprovação até correção
 */

interface ORXValidationRule {
  selector: string;
  property: string;
  expectedValue: string | string[];
  context: string;
}

const ORX_VALIDATION_RULES: ORXValidationRule[] = [
  {
    selector: 'button[class*="primary"]',
    property: 'background-color',
    expectedValue: ['rgb(99, 102, 241)', '#6366F1'],
    context: 'Botões primários devem usar cor padrão #6366F1'
  },
  {
    selector: '.kpi-card',
    property: 'background-color',
    expectedValue: ['rgb(99, 102, 241)', '#6366F1'],
    context: 'KPI Cards devem ter background indigo #6366F1'
  },
  {
    selector: '.kpi-card .kpi-value',
    property: 'color',
    expectedValue: ['rgb(255, 255, 255)', '#FFFFFF', '#fff'],
    context: 'Texto dos KPIs deve ser branco #FFFFFF'
  },
  // ... mais regras
];

export class ORXHardGate {
  private violations: ValidationViolation[] = [];

  validate(): ValidationResult {
    this.violations = [];

    ORX_VALIDATION_RULES.forEach(rule => {
      const elements = document.querySelectorAll(rule.selector);
      
      elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const actualValue = computedStyle.getPropertyValue(rule.property);
        
        const expected = Array.isArray(rule.expectedValue) 
          ? rule.expectedValue 
          : [rule.expectedValue];
        
        if (!expected.some(exp => this.normalizeValue(actualValue) === this.normalizeValue(exp))) {
          this.violations.push({
            element: element,
            rule: rule,
            actualValue: actualValue,
            expectedValue: rule.expectedValue
          });
        }
      });
    });

    return {
      passed: this.violations.length === 0,
      violations: this.violations,
      coverage: this.calculateCoverage()
    };
  }

  private calculateCoverage(): number {
    const totalRules = ORX_VALIDATION_RULES.length;
    const passedRules = totalRules - this.violations.length;
    return (passedRules / totalRules) * 100;
  }

  displayBanner(): void {
    if (this.violations.length > 0) {
      // Exibir banner "ORX Gate: REPROVADO"
      const banner = document.createElement('div');
      banner.className = 'orx-gate-banner-failed';
      banner.innerHTML = `
        <strong>ORX Gate: REPROVADO</strong>
        <p>${this.violations.length} violação(ões) encontrada(s)</p>
      `;
      document.body.prepend(banner);
    }
  }
}
```

---

## NAVEGAÇÃO E INTERFACE

### 3.1. TopBar (Barra Superior Fixa)

#### **Arquivo**: `/components/layout/IcarusTopbar.tsx`

```typescript
/**
 * TopBar Fixa do ICARUS v5.0
 * 
 * ESTRUTURA:
 * - Logo ICARUS (esquerda)
 * - Título do módulo ativo (centro-esquerda)
 * - Breadcrumbs dinâmicos (centro)
 * - Botões de ação rápida (direita):
 *   * Busca global
 *   * Notificações
 *   * Modo claro/escuro
 *   * Perfil do usuário
 * 
 * PADRÃO DE DESIGN:
 * - Altura fixa: 64px
 * - Background: var(--surface-light) / var(--surface-dark)
 * - Sombra neuromórfica inferior
 * - z-index: 1000 (sempre no topo)
 * 
 * POR QUÊ:
 * - Acesso rápido a funções críticas
 * - Contexto visual sempre presente
 * - Navegação facilitada (breadcrumbs)
 * - Consistência com padrões de ERP
 * 
 * FUNCIONALIDADES:
 * 1. Busca Global (Ctrl+K)
 *    - Busca em todos os módulos
 *    - Resultados instantâneos
 *    - Navegação por teclado
 * 
 * 2. Notificações Inteligentes
 *    - Badge de contagem
 *    - Categorização por tipo
 *    - Ações rápidas inline
 * 
 * 3. Toggle Tema
 *    - Transição suave
 *    - Persistência local
 *    - Sincronização com preferência do sistema
 * 
 * 4. Perfil
 *    - Nome e cargo
 *    - Menu dropdown
 *    - Logout rápido
 */

interface TopBarProps {
  currentModule: string;
  breadcrumbs: Breadcrumb[];
  user: User;
}

export const IcarusTopbar: React.FC<TopBarProps> = ({
  currentModule,
  breadcrumbs,
  user
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Atalho de teclado Ctrl+K para busca
  useKeyboardShortcuts({
    'ctrl+k': () => setSearchOpen(true),
    'esc': () => setSearchOpen(false)
  });

  return (
    <header className="
      fixed top-0 left-0 right-0 h-16 z-[1000]
      bg-surface-light dark:bg-surface-dark
      shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
      flex items-center justify-between px-6
    ">
      {/* Logo + Módulo Ativo */}
      <div className="flex items-center gap-4">
        <IcarusLogo className="h-10 w-auto" />
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />
        <h1 className="font-semibold">
          {currentModule}
        </h1>
      </div>

      {/* Breadcrumbs */}
      <nav className="hidden lg:flex items-center gap-2">
        <DynamicBreadcrumbs items={breadcrumbs} />
      </nav>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-3">
        {/* Busca Global */}
        <TopbarIconButton
          icon={<Search size={20} />}
          onClick={() => setSearchOpen(true)}
          tooltip="Buscar (Ctrl+K)"
        />

        {/* Notificações */}
        <TopbarIconButton
          icon={<Bell size={20} />}
          onClick={() => setNotificationsOpen(true)}
          badge={5}
          tooltip="Notificações"
        />

        {/* Toggle Tema */}
        <ThemeToggle />

        {/* Perfil */}
        <UserProfileMenu user={user} />
      </div>

      {/* Modals */}
      {searchOpen && (
        <GlobalSearchModal onClose={() => setSearchOpen(false)} />
      )}
      {notificationsOpen && (
        <NotificationsModal onClose={() => setNotificationsOpen(false)} />
      )}
    </header>
  );
};
```

#### **Botões da TopBar**

```typescript
// /components/oraclusx-ds/TopbarIconButton.tsx

/**
 * ESPECIFICAÇÃO:
 * - Tamanho: 40x40px
 * - Formato: Circular
 * - Sombra neuromórfica
 * - Hover: Lift effect
 * - Active: Press effect
 * - Badge: Contador de notificações (opcional)
 */

interface TopbarIconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  badge?: number;
  active?: boolean;
}

export const TopbarIconButton: React.FC<TopbarIconButtonProps> = ({
  icon,
  onClick,
  tooltip,
  badge,
  active = false
}) => {
  return (
    <button
      className={`
        relative w-10 h-10 rounded-full
        flex items-center justify-center
        transition-all duration-200
        ${active 
          ? 'bg-[#6366F1] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'
          : 'bg-surface-light dark:bg-surface-dark shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]'
        }
        hover:shadow-[var(--shadow-light-inner)] dark:hover:shadow-[var(--shadow-dark-inner)]
        active:scale-95
      `}
      onClick={onClick}
      aria-label={tooltip}
    >
      {icon}
      {badge && badge > 0 && (
        <span className="
          absolute -top-1 -right-1
          min-w-[18px] h-[18px] px-1
          bg-error text-white text-xs font-medium
          rounded-full flex items-center justify-center
        ">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};
```

### 3.2. Sidebar (Barra Lateral Colapsável)

#### **Arquivo**: `/components/layout/IcarusSidebar.tsx`

```typescript
/**
 * Sidebar Colapsável do ICARUS v5.0
 * 
 * ESTRUTURA:
 * - Largura expandida: 280px
 * - Largura colapsada: 80px
 * - 58 módulos organizados em 10 categorias
 * - Scroll vertical independente
 * - Toggle de expansão/colapso
 * 
 * CATEGORIAS DE MÓDULOS:
 * 1. 📊 Dashboard & Analytics (6 módulos)
 * 2. 📋 Cadastros & Gestão (5 módulos)
 * 3. 🏥 Operacional OPME (8 módulos)
 * 4. 💰 Financeiro (8 módulos)
 * 5. 📦 Logística & Estoque (6 módulos)
 * 6. 🤝 Comercial & CRM (5 módulos)
 * 7. 🔗 Integrações (4 módulos)
 * 8. 🤖 IA & Automação (6 módulos)
 * 9. ⚙️ Sistema & Config (5 módulos)
 * 10. 🎯 Avançados (5 módulos)
 * 
 * PADRÃO DE DESIGN:
 * - Background: var(--surface-light) / var(--surface-dark)
 * - Ícones: Lucide React (stroke-only)
 * - Hover: Sutil background change
 * - Active: Indigo background + white text
 * - Transição suave: 300ms ease-in-out
 * 
 * POR QUÊ:
 * - Organização lógica de funcionalidades
 * - Acesso rápido a qualquer módulo
 * - Economia de espaço (colapso)
 * - Hierarquia visual clara
 * 
 * FUNCIONALIDADES:
 * 1. Expansão/Colapso
 *    - Toggle button no rodapé
 *    - Persistência do estado (localStorage)
 *    - Transição suave de largura
 * 
 * 2. Categorias Colapsáveis
 *    - Accordion behavior
 *    - Indicador visual de expansão
 *    - Contagem de módulos por categoria
 * 
 * 3. Busca de Módulos
 *    - Filtro instantâneo
 *    - Highlight de resultado
 *    - Navegação por teclado
 * 
 * 4. Favoritos
 *    - Pin de módulos favoritos
 *    - Categoria "Favoritos" no topo
 *    - Drag & drop para reordenar
 */

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
}

export const IcarusSidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'dashboard-analytics' // Categoria inicial expandida
  ]);

  // Estrutura de módulos
  const moduleCategories: ModuleCategory[] = [
    {
      id: 'dashboard-analytics',
      name: 'Dashboard & Analytics',
      icon: <BarChart3 size={20} />,
      modules: [
        { id: 'dashboard-principal', name: 'Dashboard Principal', icon: <Home /> },
        { id: 'kpi-consolidado', name: 'KPI Consolidado', icon: <TrendingUp /> },
        { id: 'analytics-bi', name: 'Analytics BI', icon: <BarChart /> },
        { id: 'analytics-predicao', name: 'Analytics Predição', icon: <LineChart /> },
        { id: 'bi-interativo', name: 'BI Interativo', icon: <PieChart /> },
        { id: 'relatorios-executivos', name: 'Relatórios Executivos', icon: <FileText /> }
      ]
    },
    {
      id: 'cadastros-gestao',
      name: 'Cadastros & Gestão',
      icon: <Database size={20} />,
      modules: [
        { id: 'gestao-cadastros', name: 'Gestão de Cadastros', icon: <Users /> },
        { id: 'usuarios-permissoes', name: 'Usuários e Permissões', icon: <Shield /> },
        { id: 'grupos-produtos', name: 'Grupos de Produtos', icon: <Layers /> },
        { id: 'tabelas-precos', name: 'Tabelas de Preços', icon: <DollarSign /> },
        { id: 'gestao-contratos', name: 'Gestão de Contratos', icon: <FileCheck /> }
      ]
    },
    {
      id: 'operacional-opme',
      name: 'Operacional OPME',
      icon: <Activity size={20} />,
      modules: [
        { id: 'cirurgias-procedimentos', name: 'Cirurgias e Procedimentos', icon: <Stethoscope /> },
        { id: 'consignacao', name: 'Consignação Avançada', icon: <Package /> },
        { id: 'rastreabilidade', name: 'Rastreabilidade OPME', icon: <MapPin /> },
        { id: 'estoque-ia', name: 'Estoque com IA', icon: <Boxes /> },
        { id: 'inventario', name: 'Gestão de Inventário', icon: <ClipboardList /> },
        { id: 'qualidade-certificacao', name: 'Qualidade e Certificação', icon: <Award /> },
        { id: 'manutencao-preventiva', name: 'Manutenção Preventiva', icon: <Wrench /> },
        { id: 'telemetria-iot', name: 'Telemetria IoT', icon: <Wifi /> }
      ]
    },
    // ... demais categorias
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <aside className={`
      fixed left-0 top-16 bottom-0
      ${collapsed ? 'w-20' : 'w-[280px]'}
      bg-surface-light dark:bg-surface-dark
      shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]
      transition-all duration-300 ease-in-out
      z-50
      overflow-y-auto overflow-x-hidden
    `}>
      {/* Header da Sidebar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <h2 className="font-semibold mb-2">
            Módulos
          </h2>
        )}
        <SearchField
          placeholder={collapsed ? "..." : "Buscar módulo..."}
          className={collapsed ? "opacity-0" : "opacity-100"}
        />
      </div>

      {/* Categorias e Módulos */}
      <nav className="p-2">
        {moduleCategories.map(category => (
          <div key={category.id} className="mb-2">
            {/* Header da Categoria */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="
                w-full flex items-center justify-between
                px-3 py-2 rounded-lg
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors
              "
            >
              <div className="flex items-center gap-3">
                <span className="text-[#6366F1]">
                  {category.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium">
                    {category.name}
                  </span>
                )}
              </div>
              {!collapsed && (
                <ChevronDown
                  size={16}
                  className={`
                    transition-transform
                    ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}
                  `}
                />
              )}
            </button>

            {/* Módulos da Categoria */}
            {expandedCategories.includes(category.id) && (
              <div className={`
                ml-2 mt-1 space-y-1
                ${collapsed ? 'hidden' : 'block'}
              `}>
                {category.modules.map(module => (
                  <button
                    key={module.id}
                    onClick={() => onModuleChange(module.id)}
                    className={`
                      w-full flex items-center gap-3
                      px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${activeModule === module.id
                        ? 'bg-[#6366F1] text-white shadow-md'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span className={`flex-shrink-0 ${
                      activeModule === module.id ? 'text-white' : 'text-gray-600'
                    }`}>
                      {module.icon}
                    </span>
                    {!collapsed && (
                      <span className="text-sm truncate">
                        {module.name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Toggle de Colapso */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            w-full flex items-center justify-center
            px-3 py-2 rounded-lg
            bg-gray-100 dark:bg-gray-800
            hover:bg-gray-200 dark:hover:bg-gray-700
            transition-colors
          "
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};
```

### 3.3. Main Area (Área de Conteúdo Dinâmico)

```typescript
/**
 * Main Content Area
 * 
 * LAYOUT:
 * - Margem superior: 64px (TopBar)
 * - Margem esquerda: 280px ou 80px (Sidebar)
 * - Padding: 24px
 * - Background: var(--bg-light) / var(--bg-dark)
 * 
 * ESTRUTURA:
 * 1. Breadcrumb dinâmico (mobile)
 * 2. Header do módulo
 * 3. Sub-navegação (se aplicável)
 * 4. Conteúdo do módulo
 * 5. ChatBot FAB (canto inferior direito)
 */

export const MainLayout: React.FC = () => {
  const { collapsed } = useSidebar();
  const { currentModule } = useRouter();

  return (
    <main className={`
      min-h-screen
      pt-16 ${collapsed ? 'pl-20' : 'pl-[280px]'}
      p-6
      bg-bg-light dark:bg-bg-dark
      transition-all duration-300
    `}>
      {/* Breadcrumb Mobile */}
      <div className="lg:hidden mb-4">
        <DynamicBreadcrumbs />
      </div>

      {/* Header do Módulo */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {currentModule.title}
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          {currentModule.description}
        </p>
      </div>

      {/* Sub-navegação (se houver) */}
      {currentModule.subModules && (
        <SubModulesNavigation items={currentModule.subModules} />
      )}

      {/* Conteúdo do Módulo */}
      <div className="mt-6">
        {currentModule.component}
      </div>

      {/* ChatBot FAB */}
      <ChatbotFABWithPrompt />
    </main>
  );
};
```

---

## AUTENTICAÇÃO E SEGURANÇA

### 4.1. Sistema de Autenticação

#### **Arquivo**: `/lib/auth/SupabaseAuthProvider.tsx`

```typescript
/**
 * Autenticação com Supabase
 * 
 * MÉTODOS SUPORTADOS:
 * - Email/Password (nativo)
 * - OAuth 2.0 (Google, Microsoft Azure AD)
 * - Magic Link (email sem senha)
 * - Biometria (mobile)
 * 
 * SEGURANÇA:
 * - JWT tokens com refresh automático
 * - Row Level Security (RLS) no banco
 * - Rate limiting
 * - Auditoria de acessos
 * - 2FA (Two-Factor Authentication)
 * 
 * POR QUÊ:
 * - Compliance com LGPD
 * - Proteção de dados sensíveis de saúde
 * - Rastreabilidade de ações
 * - Prevenção de acessos não autorizados
 */

export const SupabaseAuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Registrar acesso
      if (session?.user) {
        logUserAccess(session.user.id);
      }
    });

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await updateUserLastAccess(session.user.id);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Funções de autenticação
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Log de tentativa falhada
      await logFailedLogin(email, error.message);
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await logUserLogout(user?.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### **Controle de Permissões (RBAC)**

```typescript
/**
 * Role-Based Access Control
 * 
 * TIPOS DE USUÁRIO:
 * - Admin: Acesso total ao sistema
 * - Gestor: Gestão de módulos específicos
 * - Operador: Operações diárias
 * - Visualizador: Apenas leitura
 * 
 * NÍVEIS DE ACESSO POR MÓDULO:
 * - Leitura: Pode visualizar
 * - Escrita: Pode criar/editar
 * - Admin: Controle total do módulo
 * 
 * CONTEXTO:
 * - Tabela 'permissoes' no banco
 * - Validação em tempo real
 * - Bloqueio de rotas não autorizadas
 */

export const usePermissions = (modulo: string) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({
    canRead: false,
    canWrite: false,
    canAdmin: false
  });

  useEffect(() => {
    const loadPermissions = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('permissoes')
        .select('nivel_acesso')
        .eq('usuario_id', user.id)
        .eq('modulo', modulo)
        .single();

      if (data) {
        setPermissions({
          canRead: ['leitura', 'escrita', 'admin'].includes(data.nivel_acesso),
          canWrite: ['escrita', 'admin'].includes(data.nivel_acesso),
          canAdmin: data.nivel_acesso === 'admin'
        });
      }
    };

    loadPermissions();
  }, [user, modulo]);

  return permissions;
};
```

---

# PARTE II - MÓDULOS CORE (1-10)

## 1. DASHBOARD PRINCIPAL

### 1.1. Visão Geral

**Arquivo**: `/components/modules/DashboardPrincipal.tsx`

**Descrição**: Painel principal do sistema com visão consolidada de todos os KPIs críticos do negócio OPME.

**Objetivo**: Fornecer visão 360° do desempenho da distribuidora em tempo real.

### 1.2. Sub-módulos

```yaml
Sub-módulos:
  1.2.1: Visão Geral (KPIs principais)
  1.2.2: Cirurgias do Dia
  1.2.3: Estoque Crítico
  1.2.4: Financeiro Resumido
  1.2.5: Alertas Prioritários
```

### 1.3. Barra de Navegação

```typescript
/**
 * Navegação do Dashboard
 * 
 * BOTÕES:
 * - Atualizar Dados (refresh icon)
 * - Filtro de Período (calendar icon)
 * - Exportar PDF (download icon)
 * - Configurar Widgets (settings icon)
 * - Tela Cheia (expand icon)
 */

const DashboardNavigation = () => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        icon={<RefreshCw size={18} />}
        onClick={handleRefresh}
      >
        Atualizar
      </Button>
      <Button
        variant="secondary"
        icon={<Calendar size={18} />}
        onClick={() => setFilterOpen(true)}
      >
        {currentPeriod}
      </Button>
    </div>
    
    <div className="flex items-center gap-2">
      <IconButtonNeu
        icon={<Download size={18} />}
        onClick={handleExportPDF}
        tooltip="Exportar PDF"
      />
      <IconButtonNeu
        icon={<Settings size={18} />}
        onClick={() => setConfigOpen(true)}
        tooltip="Configurar"
      />
      <IconButtonNeu
        icon={<Maximize2 size={18} />}
        onClick={handleFullScreen}
        tooltip="Tela Cheia"
      />
    </div>
  </div>
);
```

### 1.4. Padrões de Design

#### **Layout Grid**

```css
/**
 * Grid Responsivo 12 Colunas
 * 
 * Desktop (1920px+): 4 colunas (3 KPIs por linha)
 * Laptop (1440px): 3 colunas (3 KPIs por linha)
 * Tablet (768px): 2 colunas (2 KPIs por linha)
 * Mobile (320px): 1 coluna (1 KPI por linha)
 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

#### **KPI Cards - PADRÃO OFICIAL**

```typescript
/**
 * KPI Card Component
 * 
 * ESPECIFICAÇÃO OFICIAL:
 * - Background: #6366F1 (indigo médio)
 * - Texto valor: #FFFFFF (branco)
 * - Texto label: #FFFFFF (branco)
 * - Ícone: #FFFFFF (branco)
 * - Sombra: Neuromórfica
 * - Altura: 140px
 * - Border-radius: 12px
 * 
 * POR QUÊ:
 * - Destaque visual imediato
 * - Consistência com identidade médica
 * - Alto contraste para legibilidade
 * - Profundidade (neuromorfismo)
 * 
 * CONTEXTO:
 * - Usado em TODOS os dashboards
 * - Padrão universal do sistema
 * - Não deve ser alterado sem aprovação
 */

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
  };
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon,
  trend,
  onClick
}) => {
  return (
    <Card
      className="
        kpi-card
        bg-[#6366F1] text-white
        h-[140px]
        cursor-pointer
        transition-transform hover:scale-105
        shadow-[8px_8px_16px_rgba(99,102,241,0.3),-4px_-4px_12px_rgba(255,255,255,0.1)]
      "
      onClick={onClick}
    >
      <div className="flex items-start justify-between h-full">
        {/* Ícone */}
        <div className="
          w-14 h-14 rounded-xl
          bg-white/10
          flex items-center justify-center
        ">
          <span className="text-white text-2xl">
            {icon}
          </span>
        </div>

        {/* Valor e Label */}
        <div className="flex-1 ml-4">
          <p className="text-sm text-white/80 mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-white kpi-value">
            {value}
          </p>
          
          {/* Tendência */}
          {trend && (
            <div className={`
              flex items-center gap-1 mt-2
              text-sm
              ${trend.direction === 'up' ? 'text-green-300' :
                trend.direction === 'down' ? 'text-red-300' :
                'text-white/60'
              }
            `}>
              {trend.direction === 'up' && <TrendingUp size={16} />}
              {trend.direction === 'down' && <TrendingDown size={16} />}
              {trend.direction === 'neutral' && <Minus size={16} />}
              <span>{trend.percentage}%</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
```

### 1.5. Funcionalidades Principais

#### **1.5.1. KPIs em Tempo Real**

```typescript
/**
 * Hook: useRealtimeKPIs
 * 
 * FUNÇÃO:
 * - Buscar KPIs do banco de dados
 * - Subscrever mudanças em tempo real (Supabase Realtime)
 * - Atualizar interface automaticamente
 * 
 * POR QUÊ:
 * - Decisões baseadas em dados atuais
 * - Alertas imediatos de problemas
 * - Visibilidade de operações em andamento
 * 
 * KPIS MONITORADOS:
 * 1. Total de Cirurgias (mês atual)
 * 2. Cirurgias Hoje
 * 3. Faturamento do Mês
 * 4. Ticket Médio
 * 5. Produtos em Estoque Baixo
 * 6. Contas a Receber (em aberto)
 * 7. Taxa de Inadimplência
 * 8. Margem de Lucro Média
 */

export const useRealtimeKPIs = () => {
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar KPIs iniciais
    const fetchKPIs = async () => {
      const data = await fetchDashboardKPIs();
      setKPIs(data);
      setLoading(false);
    };

    fetchKPIs();

    // Subscrever mudanças em tempo real
    const subscription = supabase
      .channel('dashboard-kpis')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cirurgias'
      }, () => {
        fetchKPIs(); // Recarregar KPIs
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contas_receber'
      }, () => {
        fetchKPIs();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { kpis, loading };
};

const fetchDashboardKPIs = async (): Promise<DashboardKPIs> => {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

  // Total de Cirurgias do Mês
  const { count: totalCirurgias } = await supabase
    .from('cirurgias')
    .select('*', { count: 'exact', head: true })
    .gte('data_cirurgia', inicioMes.toISOString());

  // Cirurgias Hoje
  const { count: cirurgiasHoje } = await supabase
    .from('cirurgias')
    .select('*', { count: 'exact', head: true })
    .gte('data_cirurgia', new Date().setHours(0, 0, 0, 0))
    .lte('data_cirurgia', new Date().setHours(23, 59, 59, 999));

  // Faturamento do Mês
  const { data: contasReceber } = await supabase
    .from('contas_receber')
    .select('valor_liquido')
    .gte('data_emissao', inicioMes.toISOString())
    .eq('status', 'pago');

  const faturamentoMes = contasReceber?.reduce(
    (sum, conta) => sum + conta.valor_liquido, 
    0
  ) || 0;

  // Ticket Médio
  const ticketMedio = totalCirurgias > 0 
    ? faturamentoMes / totalCirurgias 
    : 0;

  // Produtos em Estoque Baixo
  const { count: estoqueBaixo } = await supabase
    .rpc('produtos_estoque_baixo_count');

  // Contas a Receber (em aberto)
  const { data: contasAbertas } = await supabase
    .from('contas_receber')
    .select('valor_liquido')
    .eq('status', 'aberto');

  const totalAReceber = contasAbertas?.reduce(
    (sum, conta) => sum + conta.valor_liquido,
    0
  ) || 0;

  // Taxa de Inadimplência
  const { count: contasVencidas } = await supabase
    .from('contas_receber')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'vencido');

  const taxaInadimplencia = contasAbertas 
    ? (contasVencidas / contasAbertas.length) * 100 
    : 0;

  return {
    totalCirurgias,
    cirurgiasHoje,
    faturamentoMes,
    ticketMedio,
    estoqueBaixo,
    totalAReceber,
    taxaInadimplencia
  };
};
```

#### **1.5.2. Análise com IA (Dashboard AI)**

```typescript
/**
 * Serviço: DashboardAI
 * 
 * FUNÇÃO:
 * - Analisar KPIs e gerar insights
 * - Identificar tendências e padrões
 * - Sugerir ações corretivas
 * - Prever resultados futuros
 * 
 * MODELO: GPT-4 Turbo
 * 
 * POR QUÊ:
 * - Transformar dados em insights acionáveis
 * - Antecipar problemas
 * - Otimizar tomada de decisão
 * - Reduzir carga cognitiva do gestor
 */

export const useDashboardAI = (kpis: DashboardKPIs) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);

    try {
      const dashboardAI = new DashboardAI({
        model: 'gpt-4-turbo',
        temperature: 0.3
      });

      const result = await dashboardAI.generateInsights(kpis);
      setInsights(result);
    } catch (error) {
      console.error('Erro ao gerar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return { insights, loading, generateInsights };
};
```

### 1.6. Integrações

```yaml
Integrações do Dashboard:
  
  Banco de Dados:
    - Supabase (PostgreSQL)
    - Realtime subscriptions
    - Views materializadas
  
  AI Services:
    - DashboardAI (GPT-4 Turbo)
    - Análise de tendências
    - Predições
  
  Analytics:
    - Google Analytics 4
    - Hotjar (heatmaps)
    - Mixpanel (eventos)
  
  Export:
    - PDF (jsPDF)
    - Excel (xlsx)
    - CSV
```

### 1.7. Formulários

**Não aplicável** - Dashboard é apenas visualização.

### 1.8. Contexto e Justificativas

#### **Por que Dashboard Principal é o primeiro módulo?**

1. **Visibilidade Imediata**: Gestor precisa ver situação geral ao fazer login
2. **Tomada de Decisão Rápida**: KPIs críticos em um só lugar
3. **Priorização**: Alertas destacam o que precisa de atenção imediata
4. **Engajamento**: Interface visual atrativa aumenta uso do sistema

#### **Por que usar IA no Dashboard?**

1. **Insights Profundos**: IA identifica padrões que humanos podem perder
2. **Predição**: Antecipar problemas antes que aconteçam
3. **Recomendações**: Sugerir ações baseadas em dados históricos
4. **Eficiência**: Reduzir tempo de análise manual

#### **Por que KPIs em tempo real?**

1. **Operação 24/7**: Cirurgias podem acontecer a qualquer momento
2. **Estoque Crítico**: Produtos vencendo ou em falta precisam ação imediata
3. **Financeiro**: Inadimplência precisa ser tratada rapidamente
4. **Competitividade**: Dados atualizados = decisões melhores

---

## 2. GESTÃO DE CADASTROS

### 2.1. Visão Geral

**Arquivo**: `/components/modules/GestãoCadastros.tsx`

**Descrição**: Módulo central para gerenciamento de todas as entidades do sistema (médicos, hospitais, pacientes, fornecedores, convênios, produtos OPME).

**Objetivo**: Centralizar e simplificar o cadastro e manutenção de dados mestres.

### 2.2. Sub-módulos

```yaml
Sub-módulos:
  2.2.1: Médicos
  2.2.2: Hospitais
  2.2.3: Pacientes
  2.2.4: Fornecedores
  2.2.5: Convênios
  2.2.6: Produtos OPME
  2.2.7: Equipes Médicas
  2.2.8: Transportadoras
```

### 2.3. Barra de Navegação

```typescript
/**
 * Sub-navegação de Cadastros
 * 
 * LAYOUT:
 * - Tabs horizontais
 * - Indicador visual do ativo
 * - Contador de registros
 * - Botão "Novo Cadastro" (canto direito)
 */

const CadastrosNavigation = () => {
  const tabs = [
    { id: 'medicos', label: 'Médicos', icon: <Stethoscope />, count: 124 },
    { id: 'hospitais', label: 'Hospitais', icon: <Building />, count: 45 },
    { id: 'pacientes', label: 'Pacientes', icon: <Users />, count: 1547 },
    { id: 'fornecedores', label: 'Fornecedores', icon: <Truck />, count: 32 },
    { id: 'convenios', label: 'Convênios', icon: <CreditCard />, count: 18 },
    { id: 'produtos', label: 'Produtos OPME', icon: <Package />, count: 876 },
    { id: 'equipes', label: 'Equipes Médicas', icon: <UsersRound />, count: 38 },
    { id: 'transportadoras', label: 'Transportadoras', icon: <Truck />, count: 8 }
  ];

  return (
    <SubModulesNavigation
      items={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      actions={
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={handleNovoCadastro}
        >
          Novo Cadastro
        </Button>
      }
    />
  );
};
```

### 2.4. Formulários

#### **2.4.1. Formulário de Médico**

**Arquivo**: `/components/formularios/FormularioMedicoAvancado.tsx`

```typescript
/**
 * Formulário Avançado de Médico
 * 
 * CAMPOS:
 * - Dados Pessoais:
 *   * Nome Completo (obrigatório)
 *   * CPF (validação + API Receita Federal)
 *   * RG
 *   * Data de Nascimento
 *   * Sexo
 * 
 * - Dados Profissionais:
 *   * CRM (obrigatório, validação)
 *   * UF do CRM
 *   * Especialidade (autocomplete com TUSS)
 *   * Subespecialidades
 * 
 * - Contato:
 *   * Telefone (máscara automática)
 *   * Celular (WhatsApp)
 *   * Email (validação)
 * 
 * - Endereço:
 *   * CEP (busca automática via ViaCEP)
 *   * Logradouro
 *   * Número
 *   * Complemento
 *   * Bairro
 *   * Cidade
 *   * UF
 * 
 * - Configurações:
 *   * Ativo/Inativo
 *   * Observações
 * 
 * VALIDAÇÕES:
 * - CPF válido
 * - CRM válido e não duplicado
 * - Email único no sistema
 * - Telefone válido
 * 
 * INTEGRAÇÕES:
 * - API Receita Federal (validar CPF)
 * - API ViaCEP (buscar endereço)
 * - Supabase (salvar dados)
 * 
 * POR QUÊ:
 * - Médico é entidade central no processo OPME
 * - Dados precisos evitam problemas em autorizações
 * - Integração com sistemas externos (planos de saúde)
 * - Rastreabilidade de responsabilidade cirúrgica
 */

interface FormularioMedicoProps {
  medicoId?: string; // Se fornecido, modo edição
  onSuccess?: (medico: Medico) => void;
  onCancel?: () => void;
}

export const FormularioMedicoAvancado: React.FC<FormularioMedicoProps> = ({
  medicoId,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<MedicoFormData>({
    nome_completo: '',
    cpf: '',
    crm: '',
    uf_crm: '',
    especialidade: '',
    telefone: '',
    email: '',
    endereco: {}
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Validação de CPF em tempo real
  const validateCPF = async (cpf: string) => {
    if (!isValidCPF(cpf)) {
      setValidationErrors(prev => ({
        ...prev,
        cpf: 'CPF inválido'
      }));
      return false;
    }

    // Consultar Receita Federal
    try {
      const result = await consultarReceitaFederal(cpf);
      if (!result.valido) {
        setValidationErrors(prev => ({
          ...prev,
          cpf: 'CPF não encontrado na Receita Federal'
        }));
        return false;
      }
    } catch (error) {
      console.warn('Não foi possível validar CPF na Receita Federal');
    }

    setValidationErrors(prev => {
      const { cpf, ...rest } = prev;
      return rest;
    });

    return true;
  };

  // Validação de CRM
  const validateCRM = async (crm: string, uf: string) => {
    if (!crm || !uf) return false;

    // Verificar duplicação
    const { data: existing } = await supabase
      .from('medicos')
      .select('id')
      .eq('crm', crm)
      .eq('uf_crm', uf)
      .neq('id', medicoId || '');

    if (existing && existing.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        crm: 'CRM já cadastrado no sistema'
      }));
      return false;
    }

    setValidationErrors(prev => {
      const { crm, ...rest } = prev;
      return rest;
    });

    return true;
  };

  // Buscar endereço por CEP
  const handleCEPChange = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              cep: cepLimpo,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Submit do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações finais
      const cpfValido = await validateCPF(formData.cpf);
      const crmValido = await validateCRM(formData.crm, formData.uf_crm);

      if (!cpfValido || !crmValido) {
        setLoading(false);
        return;
      }

      // Salvar no banco
      if (medicoId) {
        // Atualizar
        const { data, error } = await supabase
          .from('medicos')
          .update(formData)
          .eq('id', medicoId)
          .select()
          .single();

        if (error) throw error;
        onSuccess?.(data);
      } else {
        // Criar
        const { data, error } = await supabase
          .from('medicos')
          .insert(formData)
          .select()
          .single();

        if (error) throw error;
        onSuccess?.(data);
      }

      toast.success('Médico salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar médico:', error);
      toast.error('Erro ao salvar médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormularioContainer
      title={medicoId ? 'Editar Médico' : 'Novo Médico'}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    >
      {/* Dados Pessoais */}
      <Card title="Dados Pessoais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            value={formData.nome_completo}
            onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
            required
            error={validationErrors.nome_completo}
          />

          <ValidationInput
            label="CPF"
            value={formData.cpf}
            onChange={(value) => {
              setFormData({ ...formData, cpf: value });
              validateCPF(value);
            }}
            mask="999.999.999-99"
            validationType="cpf"
            required
            error={validationErrors.cpf}
          />

          <Input
            label="RG"
            value={formData.rg}
            onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
          />

          <Input
            label="Data de Nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
          />

          <Select
            label="Sexo"
            value={formData.sexo}
            onChange={(value) => setFormData({ ...formData, sexo: value })}
            options={[
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
              { value: 'Outro', label: 'Outro' }
            ]}
          />
        </div>
      </Card>

      {/* Dados Profissionais */}
      <Card title="Dados Profissionais" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ValidationInput
            label="CRM"
            value={formData.crm}
            onChange={(value) => {
              setFormData({ ...formData, crm: value });
              validateCRM(value, formData.uf_crm);
            }}
            required
            error={validationErrors.crm}
          />

          <Select
            label="UF do CRM"
            value={formData.uf_crm}
            onChange={(value) => {
              setFormData({ ...formData, uf_crm: value });
              validateCRM(formData.crm, value);
            }}
            options={ESTADOS_BRASILEIROS}
            required
          />

          <AutocompleteInput
            label="Especialidade"
            value={formData.especialidade}
            onChange={(value) => setFormData({ ...formData, especialidade: value })}
            onSearch={searchEspecialidades}
            placeholder="Digite para buscar..."
            required
          />
        </div>
      </Card>

      {/* Contato */}
      <Card title="Contato" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            mask="(99) 9999-9999"
            placeholder="(11) 3456-7890"
          />

          <Input
            label="Celular (WhatsApp)"
            value={formData.celular}
            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
            mask="(99) 99999-9999"
            placeholder="(11) 98765-4321"
          />

          <ValidationInput
            label="Email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            validationType="email"
            required
            error={validationErrors.email}
          />
        </div>
      </Card>

      {/* Endereço */}
      <Card title="Endereço" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="CEP"
            value={formData.endereco.cep}
            onChange={(e) => handleCEPChange(e.target.value)}
            mask="99999-999"
            placeholder="01234-567"
          />

          <div className="md:col-span-3">
            <Input
              label="Logradouro"
              value={formData.endereco.logradouro}
              onChange={(e) => setFormData({
                ...formData,
                endereco: { ...formData.endereco, logradouro: e.target.value }
              })}
            />
          </div>

          <Input
            label="Número"
            value={formData.endereco.numero}
            onChange={(e) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, numero: e.target.value }
            })}
          />

          <Input
            label="Complemento"
            value={formData.endereco.complemento}
            onChange={(e) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, complemento: e.target.value }
            })}
          />

          <Input
            label="Bairro"
            value={formData.endereco.bairro}
            onChange={(e) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, bairro: e.target.value }
            })}
          />

          <Input
            label="Cidade"
            value={formData.endereco.cidade}
            onChange={(e) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, cidade: e.target.value }
            })}
          />

          <Select
            label="UF"
            value={formData.endereco.uf}
            onChange={(value) => setFormData({
              ...formData,
              endereco: { ...formData.endereco, uf: value }
            })}
            options={ESTADOS_BRASILEIROS}
          />
        </div>
      </Card>

      {/* Observações */}
      <Card title="Observações" padding="lg">
        <Textarea
          label="Observações"
          value={formData.observacoes}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          rows={4}
          placeholder="Informações adicionais sobre o médico..."
        />
      </Card>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          icon={loading ? <Loader2 className="animate-spin" /> : <Check />}
        >
          {loading ? 'Salvando...' : 'Salvar Médico'}
        </Button>
      </div>
    </FormularioContainer>
  );
};
```

### 2.5. Funcionalidades Principais

#### **2.5.1. Validação em Tempo Real**

```typescript
/**
 * FUNÇÃO:
 * - Validar campos enquanto usuário digita
 * - Feedback visual imediato (verde/vermelho)
 * - Mensagens de erro contextuais
 * 
 * POR QUÊ:
 * - Melhor UX (usuário corrige antes de submeter)
 * - Reduz frustrações
 * - Dados mais confiáveis
 * 
 * VALIDAÇÕES:
 * - CPF (dígitos verificadores + consulta Receita)
 * - CNPJ (dígitos verificadores)
 * - CRM (formato + duplicação)
 * - Email (formato + unicidade)
 * - CEP (formato + consulta ViaCEP)
 * - Telefone (formato brasileiro)
 */
```

#### **2.5.2. Autocomplete Inteligente**

```typescript
/**
 * FUNÇÃO:
 * - Sugerir valores baseado em digitação
 * - Buscar em bases externas (TUSS, ANVISA)
 * - Aprendizado com dados históricos
 * 
 * POR QUÊ:
 * - Agilizar cadastro
 * - Padronizar nomenclaturas
 * - Reduzir erros de digitação
 * - Conformidade com tabelas oficiais
 * 
 * CAMPOS COM AUTOCOMPLETE:
 * - Especialidade médica (TUSS)
 * - Produtos OPME (ANVISA + histórico)
 * - Endereço (Google Places API)
 * - Fornecedores (base local + sugestões)
 */

export const useAutocomplete = (field: string, query: string) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        let results = [];

        switch (field) {
          case 'especialidade':
            results = await searchEspecialidadesTUSS(query);
            break;
          
          case 'produto':
            // Combinar resultados ANVISA + histórico
            const [anvisa, historico] = await Promise.all([
              searchProdutosANVISA(query),
              searchProdutosHistorico(query)
            ]);
            results = [...anvisa, ...historico];
            break;

          case 'endereco':
            results = await searchGooglePlaces(query);
            break;

          default:
            break;
        }

        setSuggestions(results);
      } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [field, query]);

  return { suggestions, loading };
};
```

#### **2.5.3. Importação em Massa**

```typescript
/**
 * FUNÇÃO:
 * - Importar múltiplos cadastros via CSV/Excel
 * - Validar dados antes de inserir
 * - Exibir relatório de erros
 * - Permitir correção inline
 * 
 * POR QUÊ:
 * - Migração de sistemas legados
 * - Cadastro inicial em massa
 * - Atualização periódica (fornecedores)
 * - Economia de tempo
 * 
 * PROCESSO:
 * 1. Upload de arquivo (CSV/XLSX)
 * 2. Parse e validação
 * 3. Exibir preview com erros destacados
 * 4. Permitir edição inline
 * 5. Confirmar e inserir no banco
 * 6. Exibir relatório final
 */

export const ImportacaoCadastros: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
  const [importing, setImporting] = useState(false);

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);

    // Parse CSV/Excel
    const data = await parseFile(uploadedFile);
    setParsedData(data);

    // Validar dados
    const errors = await validateImportData(data);
    setValidationErrors(errors);
  };

  const handleImport = async () => {
    setImporting(true);

    try {
      let sucessos = 0;
      let falhas = 0;

      for (let i = 0; i < parsedData.length; i++) {
        if (validationErrors[i]?.length > 0) {
          falhas++;
          continue;
        }

        try {
          await supabase.from('medicos').insert(parsedData[i]);
          sucessos++;
        } catch (error) {
          falhas++;
        }
      }

      toast.success(`Importação concluída: ${sucessos} sucesso(s), ${falhas} falha(s)`);
    } catch (error) {
      toast.error('Erro na importação');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" icon={<Upload />}>
          Importar Cadastros
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Importação em Massa</DialogTitle>
        </DialogHeader>

        {/* File Upload */}
        {!file && (
          <FileUploadZone
            accept=".csv,.xlsx,.xls"
            onFileSelect={handleFileUpload}
          />
        )}

        {/* Preview dos Dados */}
        {file && parsedData.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="font-medium mb-2">
                Preview: {parsedData.length} registro(s)
              </h3>
              <p className="text-sm text-gray-600">
                {Object.keys(validationErrors).length} erro(s) encontrado(s)
              </p>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row, index) => (
                    <TableRow
                      key={index}
                      className={validationErrors[index] ? 'bg-red-50' : ''}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{row.nome_completo}</TableCell>
                      <TableCell>{row.cpf}</TableCell>
                      <TableCell>{row.crm}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        {validationErrors[index] ? (
                          <Badge variant="destructive">
                            {validationErrors[index].length} erro(s)
                          </Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setValidationErrors({});
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={Object.keys(validationErrors).length > 0 || importing}
                icon={importing ? <Loader2 className="animate-spin" /> : <Check />}
              >
                {importing ? 'Importando...' : 'Confirmar Importação'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### 2.6. Integrações

```yaml
Integrações de Cadastros:

  APIs Governamentais:
    - Receita Federal (validar CPF/CNPJ)
    - ViaCEP (buscar endereço)
    - CNES (validar hospitais)

  APIs Médicas:
    - ANS TUSS (especialidades)
    - CFM (validar CRM)

  Serviços Externos:
    - Google Places API (autocomplete endereço)
    - EmailValidator (verificar emails)
```

---

**[CONTINUA... Este é apenas o início da documentação. Os próximos 56 módulos seguirão este mesmo padrão detalhado]**

Por questões de limite de caracteres, criei a base estrutural completa para os primeiros 2 módulos. Deseja que eu:

1. Continue criando arquivos adicionais com os demais 56 módulos?
2. Crie um índice completo de todos os 58 módulos primeiro?
3. Foque em módulos específicos que você considere prioritários?

Qual opção prefere?