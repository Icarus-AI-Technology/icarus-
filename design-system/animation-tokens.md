# 🎬 Animation Tokens - OraclusX Design System

**Versão:** 1.0.0  
**Data:** 30 de outubro de 2025

---

## 📚 Índice

1. [Durações](#duracoes)
2. [Easing Curves](#easing)
3. [Delays](#delays)
4. [Keyframes](#keyframes)
5. [Classes Utilitárias](#classes)
6. [Boas Práticas](#praticas)

---

## ⏱️ Durações Padrão {#duracoes}

### Tokens TypeScript

```typescript
// src/lib/styleUtils.ts
export const durations = {
  fast: 150,    // Micro-interações
  normal: 300,  // Padrão geral
  slow: 500,    // Transições complexas
  slower: 700,  // Efeitos dramáticos
} as const;
```

### Quando Usar

| Duração | Use para | Exemplo |
|---------|----------|---------|
| **150ms** | Micro-interações, feedback imediato | Hover, focus, ripple |
| **300ms** | Transições padrão, entrada/saída | Fade-in, slide, tooltips |
| **500ms** | Transições complexas | Modals, sidebars, layouts |
| **700ms** | Efeitos dramáticos, onboarding | Hero animations, splashes |

### Classes CSS

```css
.orx-duration-fast   { animation-duration: 150ms; }
.orx-duration-normal { animation-duration: 300ms; }
.orx-duration-slow   { animation-duration: 500ms; }
.orx-duration-slower { animation-duration: 700ms; }
```

**Exemplo:**
```tsx
<div className="orx-animate-fade-in orx-duration-fast">
  Fast fade-in (150ms)
</div>
```

---

## 📈 Easing Curves {#easing}

### Tokens TypeScript

```typescript
// src/lib/styleUtils.ts
export const easings = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',       // Entrada
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',      // Saída
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Ambos
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce
} as const;
```

### Quando Usar

| Easing | Use para | Sensação |
|--------|----------|----------|
| **easeOut** | Entradas (aparecer) | Natural, suave |
| **easeIn** | Saídas (desaparecer) | Rápido, discreto |
| **easeInOut** | Movimentos (reposição) | Balanceado |
| **bounce** | Feedback, atenção | Divertido, energético |

### Visualização

```
easeOut:    •---------o (entrada suave)
easeIn:     o---------• (saída rápida)
easeInOut:  ----••---- (meio rápido)
bounce:     •~o~•~o--- (pulante)
```

### Helper Function

```typescript
import { transition, easings, durations } from '@/lib/styleUtils';

// Gera transition CSS
const style = transition(['opacity', 'transform'], 'normal', 'easeOut');
// Resultado: { transition: 'opacity 300ms cubic-bezier(0, 0, 0.2, 1), transform 300ms cubic-bezier(0, 0, 0.2, 1)' }
```

---

## ⏲️ Delays para Stagger {#delays}

### Tokens

Delays padrão para criar efeitos stagger (escalonado):

```typescript
// Múltiplos de 50ms até 1000ms
0, 50, 100, 150, 200, 300, 500, 700, 1000
```

### Classes CSS

```css
.orx-delay-0    { animation-delay: 0ms; }
.orx-delay-50   { animation-delay: 50ms; }
.orx-delay-100  { animation-delay: 100ms; }
.orx-delay-150  { animation-delay: 150ms; }
.orx-delay-200  { animation-delay: 200ms; }
.orx-delay-300  { animation-delay: 300ms; }
.orx-delay-500  { animation-delay: 500ms; }
.orx-delay-700  { animation-delay: 700ms; }
.orx-delay-1000 { animation-delay: 1000ms; }
```

### Helper Function

```typescript
import { staggerDelay } from '@/lib/styleUtils';

// Calcula delay baseado no índice
{items.map((item, index) => (
  <div
    key={item.id}
    className="orx-animate-slide-up"
    style={{ animationDelay: `${staggerDelay(index, 50)}ms` }}
  >
    {item.content}
  </div>
))}
```

### Padrões Recomendados

| Quantidade de Itens | Delay Base | Total |
|---------------------|------------|-------|
| 2-4 itens | 100ms | 400ms máx |
| 5-8 itens | 50ms | 400ms máx |
| 9-12 itens | 30ms | 360ms máx |
| 13+ itens | Sem stagger | 0ms |

**Regra de Ouro:** Total < 500ms (usuários ficam impacientes)

---

## 🎬 Keyframes Disponíveis {#keyframes}

### Entrada/Saída

| Keyframe | Efeito | Uso |
|----------|--------|-----|
| `fadeIn` | Opacidade 0 → 1 | Conteúdo geral |
| `slideUp` | Slide de baixo | Cards, listas |
| `slideDown` | Slide de cima | Dropdowns, alertas |
| `slideLeft` | Slide da direita | Sidebars, panels |
| `slideRight` | Slide da esquerda | Sidebars, panels |
| `scaleIn` | Escala 0.95 → 1 | Modals, popovers |
| `scaleOut` | Escala 1 → 0.95 | Fechamento |
| `bounceIn` | Bounce + fade | Onboarding, CTAs |

### Contínuos

| Keyframe | Efeito | Uso |
|----------|--------|-----|
| `pulseGlow` | Pulse com shadow | Status crítico (default) |
| `pulseGlowSuccess` | Pulse verde | Status success |
| `pulseGlowError` | Pulse vermelho | Status error |
| `pulseGlowWarning` | Pulse amarelo | Status warning |
| `shimmer` | Shimmer effect | Skeletons loading |
| `spin` | Rotação 360° | Loaders, refresh |
| `ping` | Escala + fade out | Notificações |
| `pulse` | Opacidade pulsante | Indicadores |
| `bounce` | Bounce vertical | Setas, ícones |
| `shake` | Chacoalhar horizontal | Erros, validação |

---

## 🎨 Classes Utilitárias {#classes}

### Animações de Entrada

```css
.orx-animate-fade-in      { animation: fadeIn 0.3s ease-out; }
.orx-animate-slide-up     { animation: slideUp 0.4s ease-out; }
.orx-animate-slide-down   { animation: slideDown 0.4s ease-out; }
.orx-animate-slide-left   { animation: slideLeft 0.4s ease-out; }
.orx-animate-slide-right  { animation: slideRight 0.4s ease-out; }
.orx-animate-scale-in     { animation: scaleIn 0.3s ease-out; }
.orx-animate-scale-out    { animation: scaleOut 0.3s ease-out; }
.orx-animate-bounce-in    { animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

### Animações Contínuas

```css
.orx-pulse-glow          { animation: pulseGlow 2s ease-in-out infinite; }
.orx-pulse-glow-success  { animation: pulseGlowSuccess 2s ease-in-out infinite; }
.orx-pulse-glow-error    { animation: pulseGlowError 2s ease-in-out infinite; }
.orx-pulse-glow-warning  { animation: pulseGlowWarning 2s ease-in-out infinite; }
.orx-shimmer             { animation: shimmer 2s infinite linear; }
.orx-spin                { animation: spin 1s linear infinite; }
.orx-ping                { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.orx-pulse               { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.orx-bounce              { animation: bounce 1s infinite; }
.orx-shake               { animation: shake 0.5s; }
```

### Transições

```css
.orx-transition-all       { transition: all 300ms ease-out; }
.orx-transition-colors    { transition: color, background-color, border-color 300ms ease-out; }
.orx-transition-transform { transition: transform 300ms ease-out; }
.orx-transition-opacity   { transition: opacity 300ms ease-out; }
```

### Hover Effects

```css
.orx-hover-lift   { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.orx-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

.orx-hover-scale  { transition: transform 0.2s ease; }
.orx-hover-scale:hover { transform: scale(1.02); }

.orx-hover-glow   { transition: box-shadow 0.3s ease; }
.orx-hover-glow:hover { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
```

### Focus Effects

```css
.orx-focus-ring:focus { outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3); }
.orx-focus-glow:focus { outline: none; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
```

---

## ✨ Boas Práticas {#praticas}

### 1. Performance

**✅ Anime apenas transform e opacity**
```css
/* ✅ BOM - GPU accelerated */
.element {
  transition: transform 300ms, opacity 300ms;
}

/* ❌ RUIM - Causa reflow */
.element {
  transition: width 300ms, height 300ms, top 300ms;
}
```

### 2. Sutileza

**✅ Prefira animações sutis**
```tsx
// ✅ BOM - Sutil e rápido
<AnimatedCard animation="fade" duration={200} />

// ❌ RUIM - Dramático demais
<AnimatedCard animation="bounce" duration={1000} />
```

### 3. Consistência

**✅ Use durations consistentes no projeto**
```tsx
// ✅ BOM
const ANIMATION_DURATION = 300;

<AnimatedCard duration={ANIMATION_DURATION} />
<Transition duration={ANIMATION_DURATION} />

// ❌ RUIM - Valores aleatórios
<AnimatedCard duration={250} />
<Transition duration={320} />
```

### 4. Acessibilidade

**✅ Respeite prefers-reduced-motion**
```css
/* Já implementado em animations.css */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Propósito

**✅ Anime com propósito**
- ✅ Feedback (hover, click, focus)
- ✅ Direção (entradas, saídas)
- ✅ Atenção (alertas, notificações)
- ❌ Decoração sem motivo

### 6. Stagger Moderado

**✅ Stagger sutil**
```tsx
// ✅ BOM - 50ms * 8 = 400ms total
{items.map((item, i) => (
  <AnimatedCard delay={i * 50} />
))}

// ❌ RUIM - 200ms * 8 = 1600ms total
{items.map((item, i) => (
  <AnimatedCard delay={i * 200} />
))}
```

### 7. Loading States

**✅ Use shimmer para skeletons**
```tsx
<div className="orx-loading-shimmer h-20 rounded-lg" />
```

### 8. Status Indicators

**✅ Use pulse para status**
```tsx
<div className="orx-pulse-glow-error">
  <AlertIcon /> 3 alertas críticos
</div>
```

---

## 📊 Matriz de Decisão

| Situação | Animação | Duração | Easing |
|----------|----------|---------|--------|
| Aparecer conteúdo | `fadeIn` ou `slideUp` | 300ms | easeOut |
| Desaparecer conteúdo | `fadeOut` ou `scaleOut` | 200ms | easeIn |
| Modal abrir | `scaleIn` | 300ms | easeOut |
| Modal fechar | `scaleOut` | 200ms | easeIn |
| Hover button | `transform` | 150ms | easeOut |
| Focus input | `box-shadow` | 150ms | easeOut |
| Lista aparecer | `slideUp` + stagger | 300ms | easeOut |
| Loading | `shimmer` ou `spin` | 2s | linear |
| Status crítico | `pulseGlow` | 2s | ease-in-out |
| Erro validação | `shake` | 500ms | ease-in-out |
| Sucesso ação | `bounceIn` | 600ms | bounce |

---

## 🔧 Debugging

### Ver animações em slow motion

```css
/* Adicione temporariamente para debug */
* {
  animation-duration: 3s !important;
  transition-duration: 3s !important;
}
```

### Visualizar performance

```tsx
// Chrome DevTools > Performance
// Grave interação
// Procure por "Composite Layers" (verde = bom)
```

---

## 📚 Referências

- [MDN: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Material Design: Motion](https://m3.material.io/styles/motion)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [cubic-bezier.com](https://cubic-bezier.com/) - Visualizador de easing

---

**Versão:** 1.0.0  
**Última atualização:** 30/10/2025  
**Autor:** Equipe ICARUS v5.0

