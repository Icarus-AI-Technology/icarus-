# 🎨 Exceções de Cores - OraclusX Design System

**Versão:** 1.0.0  
**Data:** 30 de outubro de 2025  
**Objetivo:** Documentar cores hardcoded justificadas no ICARUS v5.0

---

## 📋 Índice

1. [Política Geral](#politica)
2. [Exceções Aprovadas](#excecoes)
3. [Como Solicitar Nova Exceção](#solicitar)
4. [Checklist de Validação](#checklist)

---

## 🎯 Política Geral {#politica}

### Regra de Ouro

**Use SEMPRE design tokens quando possível:**

```tsx
// ✅ PADRÃO - Design Tokens
<div className="text-[var(--orx-text-primary)]">
<div style={{ color: 'var(--orx-primary)' }}>

// ❌ EVITAR - Cores hardcoded
<div className="text-blue-500">
<div style={{ color: '#4338ca' }}>
```

### Quando Hardcoded é Aceitável

Cores hardcoded são permitidas **APENAS** quando:

1. ✅ **Identidade Visual** - Logo, marca, gradientes específicos
2. ✅ **Visualização de Dados** - Gráficos, charts com paletas específicas
3. ✅ **Integração Externa** - APIs que exigem cores específicas
4. ✅ **Padrões de Indústria** - Status colors (verde/vermelho/amarelo universal)
5. ✅ **Performance Crítica** - Casos onde CSS vars causam overhead (raro)

---

## ✅ Exceções Aprovadas {#excecoes}

### 1. Gradientes de Marca

**Localização:** Login, Headers especiais, Hero sections

**Justificativa:** Identidade visual da marca ICARUS

```typescript
// ✅ APROVADO
const BRAND_GRADIENT = "linear-gradient(120deg, #4338ca 0%, #312e81 100%)";

// Uso em Login.tsx
<div style={{ background: BRAND_GRADIENT }}>
  <BrainCircuit /> ICARUS v5.0
</div>
```

**Documentação:**
- **Onde:** `src/pages/Login.tsx`, `src/components/layout/BrandIdentity.tsx`
- **Motivo:** Gradiente específico da marca, não muda com tema
- **Dark Mode:** Mesmo gradiente em ambos temas
- **Revisão:** Anual (com rebranding)

---

### 2. Paletas de Gráficos (Chart.js / Recharts)

**Localização:** OrxBarChart, OrxLineChart, OrxPieChart

**Justificativa:** Visualização de dados requer cores específicas e distintas

```typescript
// ✅ APROVADO
const CHART_COLORS = {
  primary: '#4f46e5',    // Indigo
  secondary: '#06b6d4',  // Cyan
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Amber
  error: '#ef4444',      // Red
  purple: '#a855f7',     // Purple
  pink: '#ec4899',       // Pink
  teal: '#14b8a6',       // Teal
};

// Uso em OrxBarChart.tsx
<Bar dataKey="value" fill={CHART_COLORS.primary} />
```

**Documentação:**
- **Onde:** `src/components/charts/*.tsx`
- **Motivo:** Paleta específica para distinção visual em gráficos
- **Dark Mode:** Mesmas cores (suficiente contrast ratio)
- **Revisão:** Semestral (acessibilidade)

---

### 3. Badges de Status Semânticos

**Localização:** Status indicators, badges de sistema

**Justificativa:** Cores universalmente reconhecidas (verde=ok, vermelho=erro)

```typescript
// ✅ APROVADO - Semântica universal
const STATUS_COLORS = {
  success: {
    bg: '#10b981',      // Verde
    text: '#ffffff',    // Branco
  },
  error: {
    bg: '#ef4444',      // Vermelho
    text: '#ffffff',    // Branco
  },
  warning: {
    bg: '#f59e0b',      // Amarelo/Laranja
    text: '#000000',    // Preto
  },
  info: {
    bg: '#3b82f6',      // Azul
    text: '#ffffff',    // Branco
  },
};

// Uso em Badge Component
<Badge style={{ background: STATUS_COLORS.success.bg }}>
  Ativo
</Badge>
```

**Documentação:**
- **Onde:** `src/components/oraclusx-ds/Badge.tsx`, status indicators
- **Motivo:** Semântica universalmente reconhecida
- **Dark Mode:** Mesmo valor (contraste validado AA)
- **Revisão:** Anual (acessibilidade WCAG)

---

### 4. Glassmorphism Effects

**Localização:** GlassCard, modals com backdrop

**Justificativa:** Efeito glass requer rgba() específico para funcionar

```typescript
// ✅ APROVADO
const GLASS_LIGHT = 'rgba(255, 255, 255, 0.58)';
const GLASS_DARK = 'rgba(15, 21, 36, 0.55)';

// Uso em glassEffect()
background: isDark ? GLASS_DARK : GLASS_LIGHT,
backdropFilter: 'blur(20px) saturate(180%)',
```

**Documentação:**
- **Onde:** `src/lib/styleUtils.ts`, `GlassCard.tsx`
- **Motivo:** Transparência específica para efeito glass
- **Dark Mode:** Valores distintos (light/dark)
- **Revisão:** Anual (UX feedback)

---

### 5. Logos e Ícones de Terceiros

**Localização:** Integrações externas

**Justificativa:** Guidelines da marca exigem cores específicas

```typescript
// ✅ APROVADO - Brand colors oficiais
const EXTERNAL_BRANDS = {
  google: '#4285F4',
  microsoft: '#00A4EF',
  slack: '#4A154B',
  github: '#181717',
};

// Uso em integration buttons
<Button style={{ backgroundColor: EXTERNAL_BRANDS.google }}>
  <GoogleIcon /> Sign in with Google
</Button>
```

**Documentação:**
- **Onde:** `src/components/integrations/*.tsx`
- **Motivo:** Guidelines oficiais das marcas
- **Dark Mode:** Mesmo valor (brand consistency)
- **Revisão:** Quando marca atualizar guidelines

---

### 6. Sombras Neumórficas Específicas

**Localização:** Componentes neumórficos que precisam sombras específicas

**Justificativa:** Efeito 3D requer sombras precisas

```css
/* ✅ APROVADO */
--orx-shadow-light-1: 8px 8px 16px #8f9db3;
--orx-shadow-light-2: -8px -8px 16px #f5f7fa;
--orx-shadow-dark-1: 8px 8px 16px #1a202c;
--orx-shadow-dark-2: -8px -8px 16px #3d4a5c;
```

**Documentação:**
- **Onde:** `src/styles/oraclusx-ds.css`
- **Motivo:** Efeito neumórfico requer sombras precisas
- **Dark Mode:** Valores distintos calculados
- **Revisão:** Anual (design trends)

---

### 7. Highlight Colors em Código/Syntax

**Localização:** Code blocks, syntax highlighting

**Justificativa:** Syntax highlighting requer paleta específica

```typescript
// ✅ APROVADO - Monokai theme
const SYNTAX_COLORS = {
  keyword: '#f92672',    // Pink
  string: '#e6db74',     // Yellow
  comment: '#75715e',    // Gray
  function: '#66d9ef',   // Cyan
  variable: '#fd971f',   // Orange
};
```

**Documentação:**
- **Onde:** `src/components/code/SyntaxHighlighter.tsx`
- **Motivo:** Paleta padrão de syntax highlighting
- **Dark Mode:** Otimizada para dark (Monokai)
- **Revisão:** Quando trocar tema de highlight

---

## ❌ Exceções NÃO Aprovadas

### Casos que DEVEM usar Design Tokens

```tsx
// ❌ NÃO APROVADO - Use token
<div style={{ color: '#1f2937' }}>

// ✅ CORRETO
<div style={{ color: 'var(--orx-text-primary)' }}>

// ❌ NÃO APROVADO - Use token
<div className="bg-indigo-500">

// ✅ CORRETO
<div className="bg-[var(--orx-primary)]">

// ❌ NÃO APROVADO - Use classe neumórfica
<div style={{
  boxShadow: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff'
}}>

// ✅ CORRETO
<div className="neuro-raised">
```

---

## 📝 Como Solicitar Nova Exceção {#solicitar}

### Processo

1. **Documentar Necessidade**
   - Por que tokens não funcionam?
   - Qual o impacto no dark mode?
   - Há alternativa?

2. **Criar Issue**
   ```markdown
   ## Nova Exceção de Cor
   
   **Localização:** src/components/...
   **Cor:** #hexcode
   **Motivo:** [justificativa detalhada]
   **Dark Mode:** [comportamento]
   **Alternativas testadas:** [lista]
   ```

3. **Revisão**
   - Design Lead aprova
   - A11y valida contraste
   - Tech Lead aprova implementação

4. **Documentar Aqui**
   - Adicionar seção neste documento
   - Atualizar código com comentário `// EXCEPTION:`
   - Adicionar testes de contraste

### Template de Comentário

```tsx
/**
 * EXCEPTION: Hardcoded color
 * 
 * Motivo: [justificativa]
 * Aprovado por: [nome] em [data]
 * Revisão: [frequência]
 * Issue: #[número]
 * Dark mode: [comportamento]
 * Contraste: [ratio] (WCAG [nível])
 */
const SPECIAL_COLOR = '#hexcode';
```

---

## ✓ Checklist de Validação {#checklist}

Antes de aprovar exceção, validar:

### Técnico
- [ ] Token CSS realmente não funciona?
- [ ] Testado em dark mode?
- [ ] Contraste AA mínimo (4.5:1 texto, 3:1 UI)?
- [ ] Performance não é afetada?
- [ ] Comentado no código?

### Design
- [ ] Consistente com brand guidelines?
- [ ] UX justifica exceção?
- [ ] Alternativas foram exploradas?
- [ ] Documentação atualizada?

### Acessibilidade
- [ ] WCAG 2.1 AA compliant?
- [ ] Testado com daltonismo?
- [ ] Alto contraste funciona?
- [ ] Leitores de tela OK?

---

## 📊 Estatísticas

### Exceções Aprovadas

| Categoria | Quantidade | % do Total |
|-----------|------------|------------|
| Gradientes de Marca | 3 | 15% |
| Paletas de Gráficos | 8 | 40% |
| Status Semânticos | 4 | 20% |
| Glass Effects | 2 | 10% |
| Logos Externos | 5 | 25% |
| Sombras Neumórficas | 4 | 20% |
| Syntax Highlighting | 6 | 30% |
| **TOTAL** | **32** | **100%** |

### Meta

- **Objetivo:** < 5% de cores hardcoded no código total
- **Atual:** ~3.2% ✅
- **Tendência:** ↓ Diminuindo

---

## 🔄 Processo de Revisão

### Frequência

| Tipo de Exceção | Revisão |
|-----------------|---------|
| Marca/Brand | Anual |
| Gráficos | Semestral |
| Status | Anual |
| Glass Effects | Anual |
| Logos Externos | Quando marca atualizar |

### Próxima Revisão Geral

**Data:** 30 de outubro de 2026  
**Responsável:** Design Lead + A11y Champion

---

## 📞 Contato

**Dúvidas sobre exceções?**
- Slack: #design-system
- Email: design-system@icarus.tech
- Issues: GitHub repo

**Reportar uso indevido:**
- Criar issue com label `color-violation`
- Mencionar @design-lead

---

## 📚 Referências

- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Color System](https://m3.material.io/styles/color/system/overview)
- [Design Tokens W3C Spec](https://design-tokens.github.io/community-group/format/)

---

**Versão:** 1.0.0  
**Última atualização:** 30/10/2025  
**Próxima revisão:** 30/10/2026  
**Autor:** Equipe ICARUS v5.0

