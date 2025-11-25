# 📘 DOCUMENTAÇÃO TÉCNICA - ICARUS v6.0 (HeroUI Edition)

## Sistema ERP HealthTech - Dark Glass / Cyberpunk Theme

**Versão**: 6.0.0  
**Design System**: OraclusX DS (Dark Glass Variant)  
**Stack**: React + Vite + Tailwind v4 + HeroUI  
**Idioma**: Português Brasileiro (pt-BR)  
**Total de Módulos**: 58

---

## 📑 ÍNDICE GERAL

### PARTE I - VISÃO GERAL TÉCNICA
1. [Arquitetura & Stack](#1-arquitetura--stack)
2. [OraclusX Design System (Adaptado)](#2-oraclusx-design-system-adaptado)
3. [Layout & Navegação](#3-layout--navegação)
4. [Autenticação & Segurança](#4-autenticação--segurança)

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

*(Listagem completa dos 58 módulos disponível na Seção de Roadmap)*

---

# PARTE I - VISÃO GERAL TÉCNICA

## 1. ARQUITETURA & STACK

### 1.1. Stack Tecnológico Atualizado

```yaml
Frontend:
  Framework: React 18.x + TypeScript
  Build: Vite
  Styling: Tailwind CSS v4.0 (CSS Variables Strategy)
  UI Library: HeroUI v2 (@heroui/react)
  Icons: Lucide React
  Charts: Recharts
  Motion: Framer Motion

Backend / Data:
  Provider: Supabase
  Database: PostgreSQL 15.x
  Auth: Supabase Auth (JWT)
  Real-time: PostgreSQL Changes (WebSockets)
  Storage: S3-compatible
  
AI Services:
  Chatbot: OpenAI GPT-4o (via Proxy/Edge Functions)
  Vision: OCR para documentos médicos
  Speech: Web Speech API / Whisper
```

### 1.2. Diagrama de Arquitetura (Conceitual)

```
┌─────────────────────────────────────────────────────────────────┐
│                   ICARUS v6.0 - ARQUITETURA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              PRESENTATION LAYER (HeroUI)               │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │     │
│  │  │   Topbar     │  │   Sidebar    │  │  Glass Panel │  │     │
│  │  │ (Backdrop)   │  │ (Collapsible)│  │   (Content)  │  │     │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │     │
│  └────────────────────────────────────────────────────────┘     │
│                           ▼                                     │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              BUSINESS LOGIC LAYER                      │     │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │     │
│  │  │ Modules  │ │ AI Widget│ │ R.H.Form │ │  Hooks   │   │     │
│  │  │  (58)    │ │ (Float)  │ │  (Zod)   │ │          │   │     │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ORACLUSX DESIGN SYSTEM (ADAPTADO)

Adaptado para o tema **"Dark Glass / Cyberpunk"**, substituindo o antigo conceito Neuromórfico por Glassmorphism (Transparência/Blur/Glow).

### 2.1. Design Tokens & Cores

Configurados em `src/hero.ts` e `src/index.css`.

```css
/* Paleta Cyberpunk */
--bg-app: #0b0d16;         /* Dark Navy (Fundo Global) */
--bg-surface: #15192b;     /* Semi-transparent Navy (Cards) */

--primary: #2dd4bf;        /* Cyber Teal (Ações Principais, Glows) */
--secondary: #6366f1;      /* Electric Purple (Acentos, Gráficos) */
--success: #10b981;        /* Emerald (Status Positivo) */
--warning: #f59e0b;        /* Amber (Alertas) */
--danger: #f43f5e;         /* Rose (Erros, Crítico) */

/* Efeitos Glass */
--glass-border: 1px solid rgba(255, 255, 255, 0.1);
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-blur: backdrop-filter: blur(16px);
--glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```

### 2.2. Componentes Base (Adaptação HeroUI)

#### **Button (OraclusX Wrapper)**

Utiliza o `Button` do HeroUI com variantes mapeadas para o tema.
*   **Primary**: `variant="shadow" color="primary"` (Glow Effect)
*   **Secondary**: `variant="flat"` (Glass Effect)
*   **Ghost**: `variant="light"`

```tsx
<Button 
  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.3)]"
>
  Ação Principal
</Button>
```

#### **Card (Glass Panel)**

Substitui o card sólido por painéis translúcidos.

```tsx
<Card className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg">
  <CardBody>
    {/* Conteúdo */}
  </CardBody>
</Card>
```

#### **Inputs (Neumo -> Glass)**

Inputs com bordas sutis e fundo transparente, mantendo a legibilidade.

```tsx
<Input
  variant="flat"
  classNames={{
    inputWrapper: "bg-white/5 border-white/10 group-data-[focus=true]:border-primary/50",
    input: "text-white placeholder:text-slate-500"
  }}
/>
```

---

## 3. LAYOUT & NAVEGAÇÃO

### 3.1. TopBar

*   **Glassmorphism**: `backdrop-blur-md bg-bg-app/80 border-b border-white/5`.
*   **Busca Global**: Input translúcido no centro.
*   **Ações**: Notificações e Perfil com botões `isIconOnly variant="ghost"`.

### 3.2. Sidebar

*   **Estrutura**: 58 módulos organizados em categorias (Dashboard, Cadastros, Operacional, etc.).
*   **Colapso**: Suporte a modo mini (apenas ícones).
*   **Estilo**: Lateral esquerda fixa, `border-r border-white/5`.

---

# PARTE II - MÓDULOS CORE (1-10)

## 1. DASHBOARD PRINCIPAL

**Refatorado para HeroUI + Recharts**

### 1.1. KPIs Cards (Estilo Cyberpunk)
Cards retangulares com ícone à esquerda (glow background) e métricas à direita.
*   **Design**: Fundo `bg-white/5`, Borda `border-white/10`, Ícone com `bg-primary/20 text-primary`.

### 1.2. Visualização de Dados
*   **Gráficos**: Recharts (`ResponsiveContainer`, `AreaChart`, `PieChart`).
*   **Tooltips**: Customizados para seguir o tema escuro (fundo preto translúcido, borda fina).
*   **Mapas**: `react-simple-maps` focado em RJ/ES.

### 1.3. Chatbot AI
Widget flutuante no canto inferior direito.
*   **Recursos**: Upload de arquivos, input de voz, sugestões rápidas.
*   **UI**: Janela flutuante com animação `slide-in`.

---

## 2. GESTÃO DE CADASTROS

### 2.1. Visão Geral
Centralização de cadastros de Médicos, Hospitais, Pacientes, Fornecedores e Produtos OPME.

### 2.2. Formulários (HeroUI Forms)
Utilização de `react-hook-form` + `zod` integrados aos componentes HeroUI.
*   **Layout**: Grid system (`grid-cols-1 md:grid-cols-3`).
*   **Validação**: Feedback visual em tempo real (`isInvalid`, `errorMessage`).

### 2.3. Tabelas (HeroUI Table)
*   **Estilo**: `removeWrapper`, `isCompact`, header fixo.
*   **Ações**: Botões de ação (Editar, Excluir) na última coluna.

```tsx
<Table aria-label="Lista de Médicos" classNames={{ th: "bg-white/10 text-white" }}>
  <TableHeader>
    <TableColumn>NOME</TableColumn>
    <TableColumn>CRM</TableColumn>
    <TableColumn>AÇÕES</TableColumn>
  </TableHeader>
  <TableBody>
    {/* Rows */}
  </TableBody>
</Table>
```

---

## 3. CIRURGIAS E PROCEDIMENTOS

### 3.1. Kanban de Cirurgias
*   **Visualização**: Board Kanban (Agendado, Confirmado, Em Andamento, Finalizado).
*   **Cards**: Drag & drop (dnd-kit), estilizados como Glass Cards.
*   **Tags**: Status coloridos com `Chip` do HeroUI (`color="warning"`, `color="success"`).

### 3.2. Agenda (Calendar)
*   **Componente**: HeroUI `Calendar` ou integração com biblioteca de calendário (ex: `react-big-calendar`) estilizada.

---

## 4. ESTOQUE COM IA

### 4.1. Monitoramento
*   **Alertas**: Cards de alerta para estoque baixo e validade próxima.
*   **IA**: Previsão de demanda baseada em histórico (mock/integração).

### 4.2. Movimentação
*   **Entrada/Saída**: Formulários rápidos para registro de movimentação.
*   **Rastreabilidade**: Leitura de QR Code/Barcode (simulado ou via câmera).

---

## 5. FINANCEIRO AVANÇADO

### 5.1. Fluxo de Caixa
*   **Gráfico**: Waterfall chart ou Area chart mostrando entradas e saídas.
*   **Indicadores**: Saldo atual, projetado e realizado.

### 5.2. Contas a Pagar/Receber
*   **Listagem**: Tabela com filtros avançados (Data, Fornecedor, Status).
*   **Ações em Massa**: Baixa de múltiplos títulos.

---

*(A documentação segue este padrão para todos os 58 módulos, mantendo a consistência do Design System OraclusX - Dark Glass Edition)*
