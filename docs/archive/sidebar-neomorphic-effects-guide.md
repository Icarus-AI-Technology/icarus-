# 🎨 Guia de Efeitos Neumórficos para Botões da Sidebar

**Compatível com OraclusX Design System v5.0**

---

## 📋 Contexto Atual

**Classe base:** `.neumorphic-button`  
**Classe ativa:** `.neumorphic-button-active` (não definida ainda)  
**Tokens disponíveis:** Design tokens OraclusX (sombras, cores, transições)

---

## 🎯 Opções de Efeitos Neumórficos

### **1. Efeito Pressed Sutil (Recomendado)**
**Uso:** Estado ativo do botão na sidebar  
**Característica:** Botão afunda suavemente no fundo, indicando seleção

```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: var(--orx-shadow-inset-light-1), var(--orx-shadow-inset-light-2);
  border-left: 3px solid var(--orx-primary);
  color: var(--orx-primary);
  font-weight: 700;
  transform: translateY(0);
}

.dark .neumorphic-button-active {
  background: var(--orx-bg-dark);
  box-shadow: var(--orx-shadow-inset-dark-1), var(--orx-shadow-inset-dark-2);
  border-left: 3px solid var(--orx-primary-light);
  color: var(--orx-primary-light);
}
```

**Vantagens:**
- ✅ Fiel ao conceito neumórfico
- ✅ Indicação visual clara (afundado)
- ✅ Barra lateral de destaque
- ✅ Acessível (contraste AA)

---

### **2. Efeito Glow Minimalista**
**Uso:** Estado hover + ativo com brilho suave  
**Característica:** Contorno luminoso sutil + elevação leve

```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: 
    var(--orx-shadow-light-1), 
    var(--orx-shadow-light-2),
    0 0 20px rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: var(--orx-primary);
  transform: translateY(-1px);
}

.neumorphic-button-active:hover {
  box-shadow: 
    var(--orx-shadow-light-1), 
    var(--orx-shadow-light-2),
    0 0 30px rgba(99, 102, 241, 0.25);
}

.dark .neumorphic-button-active {
  box-shadow: 
    var(--orx-shadow-dark-1), 
    var(--orx-shadow-dark-2),
    0 0 24px rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
}
```

**Vantagens:**
- ✅ Elegante e moderno
- ✅ Compatível com dark mode
- ✅ Transição suave no hover
- ⚠️ Pode competir visualmente com outros elementos

---

### **3. Efeito Gradient Inner Pressed**
**Uso:** Estado ativo com gradiente interno afundado  
**Característica:** Gradiente sutil + sombra interna

```css
.neumorphic-button-active {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(139, 92, 246, 0.05) 100%);
  box-shadow: var(--orx-shadow-inset-light-1), var(--orx-shadow-inset-light-2);
  border-left: 4px solid var(--orx-primary);
  color: var(--orx-primary);
  font-weight: 600;
  padding-left: 8px; /* Compensa borda */
}

.dark .neumorphic-button-active {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.12) 0%, 
    rgba(139, 92, 246, 0.08) 100%);
  box-shadow: var(--orx-shadow-inset-dark-1), var(--orx-shadow-inset-dark-2);
  border-left: 4px solid var(--orx-primary-light);
  color: var(--orx-primary-light);
}
```

**Vantagens:**
- ✅ Destaque visual forte
- ✅ Gradiente sutil (não agressivo)
- ✅ Borda esquerda como indicador
- ⚠️ Requer ajuste de padding

---

### **4. Efeito Lift & Shadow (Elevado)**
**Uso:** Estado ativo com elevação 3D  
**Característica:** Botão se eleva do fundo (oposto ao pressed)

```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: 
    12px 12px 24px rgba(143, 157, 179, 0.4),
    -12px -12px 24px rgba(245, 247, 250, 0.8);
  color: var(--orx-primary);
  font-weight: 700;
  transform: translateY(-2px);
}

.neumorphic-button-active:hover {
  transform: translateY(-3px);
  box-shadow: 
    14px 14px 28px rgba(143, 157, 179, 0.5),
    -14px -14px 28px rgba(245, 247, 250, 0.9);
}

.dark .neumorphic-button-active {
  box-shadow: 
    12px 12px 24px rgba(26, 32, 44, 0.6),
    -12px -12px 24px rgba(61, 74, 92, 0.4);
}
```

**Vantagens:**
- ✅ Efeito dramático e premium
- ✅ Boa para hierarquia visual
- ⚠️ Menos neumórfico puro (mais material design)
- ⚠️ Pode cansar visualmente em sidebar

---

### **5. Efeito Ripple Border Animation**
**Uso:** Estado ativo com borda animada  
**Característica:** Animação sutil de borda + pressed

```css
.neumorphic-button-active {
  position: relative;
  background: var(--orx-bg-light);
  box-shadow: var(--orx-shadow-inset-light-1), var(--orx-shadow-inset-light-2);
  color: var(--orx-primary);
  font-weight: 600;
}

.neumorphic-button-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, 
    var(--orx-primary) 0%, 
    var(--orx-purple-500) 100%);
  border-radius: 2px 0 0 2px;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.dark .neumorphic-button-active {
  box-shadow: var(--orx-shadow-inset-dark-1), var(--orx-shadow-inset-dark-2);
}
```

**Vantagens:**
- ✅ Animação chama atenção
- ✅ Gradiente alinhado com brand
- ⚠️ Pode distrair (considerar desabilitar em acessibilidade)

---

### **6. Efeito Icon Highlight (Foco no Ícone)**
**Uso:** Estado ativo com destaque no ícone  
**Característica:** Botão pressed + ícone com glow

```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: var(--orx-shadow-inset-light-1), var(--orx-shadow-inset-light-2);
  color: var(--orx-text-primary);
  font-weight: 600;
}

.neumorphic-button-active svg,
.neumorphic-button-active .icon {
  color: var(--orx-primary);
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
  transition: all 0.3s ease;
}

.dark .neumorphic-button-active {
  box-shadow: var(--orx-shadow-inset-dark-1), var(--orx-shadow-inset-dark-2);
}

.dark .neumorphic-button-active svg,
.dark .neumorphic-button-active .icon {
  color: var(--orx-primary-light);
  filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
}
```

**Vantagens:**
- ✅ Destaque visual no ícone
- ✅ Mantém neumórfico no botão
- ✅ Sutil e elegante

---

### **7. Efeito Double Layer (Camadas)**
**Uso:** Estado ativo com dupla camada de sombra  
**Característica:** Profundidade extra com múltiplas sombras

```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: 
    inset 4px 4px 8px rgba(143, 157, 179, 0.3),
    inset -4px -4px 8px rgba(245, 247, 250, 0.5),
    inset 8px 8px 16px rgba(143, 157, 179, 0.15),
    inset -8px -8px 16px rgba(245, 247, 250, 0.25);
  border-left: 2px solid var(--orx-primary);
  color: var(--orx-primary);
  font-weight: 600;
}

.dark .neumorphic-button-active {
  box-shadow: 
    inset 4px 4px 8px rgba(26, 32, 44, 0.4),
    inset -4px -4px 8px rgba(61, 74, 92, 0.3),
    inset 8px 8px 16px rgba(26, 32, 44, 0.2),
    inset -8px -8px 16px rgba(61, 74, 92, 0.15);
  border-left: 2px solid var(--orx-primary-light);
  color: var(--orx-primary-light);
}
```

**Vantagens:**
- ✅ Profundidade 3D máxima
- ✅ Neumórfico autêntico
- ⚠️ Pode ser pesado visualmente

---

## 🏆 Recomendação Final

### **Melhor para Sidebar do ICARUS v5.0:**

**Opção 1 (Pressed Sutil)** + **Opção 6 (Icon Highlight)**

**Combinação ideal:**
```css
.neumorphic-button-active {
  background: var(--orx-bg-light);
  box-shadow: var(--orx-shadow-inset-light-1), var(--orx-shadow-inset-light-2);
  border-left: 3px solid var(--orx-primary);
  color: var(--orx-primary);
  font-weight: 700;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.neumorphic-button-active svg {
  color: var(--orx-primary);
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.3));
}

.dark .neumorphic-button-active {
  background: var(--orx-bg-dark);
  box-shadow: var(--orx-shadow-inset-dark-1), var(--orx-shadow-inset-dark-2);
  border-left: 3px solid var(--orx-primary-light);
  color: var(--orx-primary-light);
}

.dark .neumorphic-button-active svg {
  color: var(--orx-primary-light);
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
}
```

**Justificativa:**
- ✅ Neumórfico autêntico (pressed)
- ✅ Acessível (contraste, sem animações excessivas)
- ✅ Barra lateral clara
- ✅ Ícone destacado sem ser agressivo
- ✅ Dark mode consistente
- ✅ Performance (sem animações pesadas)

---

## 📊 Tabela Comparativa

| Efeito | Neumórfico | A11y | Performance | Dark Mode | Complexidade |
|--------|-----------|------|-------------|-----------|--------------|
| **1. Pressed Sutil** | ★★★★★ | ★★★★★ | ★★★★★ | ★★★★★ | ★★☆☆☆ |
| **2. Glow Minimalista** | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **3. Gradient Inner** | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **4. Lift & Shadow** | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★☆☆☆ |
| **5. Ripple Border** | ★★★★☆ | ★★★☆☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| **6. Icon Highlight** | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **7. Double Layer** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |

---

## 🎨 Sugestões de Hover para Sidebar

**Hover suave (não ativo):**
```css
.neumorphic-button:hover:not(.neumorphic-button-active) {
  box-shadow: 
    10px 10px 20px rgba(143, 157, 179, 0.3),
    -10px -10px 20px rgba(245, 247, 250, 0.8);
  transform: translateY(-1px);
  border-left: 2px solid rgba(99, 102, 241, 0.2);
}

.dark .neumorphic-button:hover:not(.neumorphic-button-active) {
  box-shadow: 
    10px 10px 20px rgba(26, 32, 44, 0.5),
    -10px -10px 20px rgba(61, 74, 92, 0.3);
}
```

---

## 🔧 Implementação Recomendada

**Arquivo:** `src/styles/globals.css` ou `src/styles/oraclusx-ds.css`

**Localização:** Após a definição de `.neumorphic-button`

**Testes obrigatórios:**
- ✅ `pnpm qa:ui` (componentes)
- ✅ `pnpm qa:a11y` (acessibilidade)
- ✅ Testar dark/light mode manualmente
- ✅ Verificar contraste WCAG AA (mínimo 4.5:1)

---

## 📝 Notas de Acessibilidade

1. **Foco visível:** Manter `:focus-visible` com outline claro
2. **Contraste:** Validar cores de texto contra fundo (WCAG AA)
3. **Animações:** Respeitar `prefers-reduced-motion`
4. **Navegação por teclado:** Garantir estados claros (focus, active, hover)

```css
@media (prefers-reduced-motion: reduce) {
  .neumorphic-button-active,
  .neumorphic-button-active::before {
    animation: none;
    transition: none;
  }
}
```

---

**Criado para:** ICARUS v5.0  
**Design System:** OraclusX v5.0  
**Autor:** Agente Webdesign Expert (Neumorphism 3D)  
**Data:** 30 de outubro de 2025

