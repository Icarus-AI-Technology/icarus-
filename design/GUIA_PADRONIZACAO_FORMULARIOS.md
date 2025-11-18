# 📋 GUIA DE PADRONIZAÇÃO — Formulários e Botões Neumórficos

**Sistema**: ICARUS v5.0  
**Data**: ${new Date().toLocaleDateString('pt-BR')}  
**Responsável**: AGENTE_DESIGNER_NEUMORPHIC  
**Padrão**: OraclusX DS + Neumorphism 3D

---

## 🎯 REGRAS OBRIGATÓRIAS DE PADRONIZAÇÃO

### 1. BOTÕES — Alinhamento de Ícones e Texto

#### ❌ ERRADO (Ícone e texto em linhas diferentes):
```tsx
// NÃO FAZER ISSO
<button className="flex flex-col items-center">
  <Icon size={20} />
  <span>Salvar</span>
</button>
```

#### ✅ CORRETO (Ícone e texto na mesma linha):
```tsx
// FAZER ASSIM
<button className="inline-flex items-center gap-2">
  <Icon size={16} />
  <span style={{ fontSize: '0.813rem' }}>Salvar</span>
</button>
```

### 2. TAMANHO DE FONTES — Botões Padronizados

| Tipo de Botão | Font Size | Ícone Size | Height |
|---------------|-----------|------------|--------|
| **Primário** | `0.813rem` (13px) | `16px` | `36px` |
| **Secundário** | `0.813rem` (13px) | `16px` | `36px` |
| **Small** | `0.75rem` (12px) | `14px` | `32px` |
| **Large** | `0.875rem` (14px) | `18px` | `40px` |

### 3. ESTRUTURA NEUMÓRFICA — Classes CSS

```css
/* Botão Primário Neumórfico */
.neuro-button-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem; /* 8px */
  padding: 0.625rem 1.25rem; /* 10px 20px */
  font-size: 0.813rem; /* 13px */
  font-weight: 500;
  border-radius: 0.75rem; /* 12px */
  background: linear-gradient(135deg, var(--orx-primary), var(--orx-primary-hover));
  color: white;
  box-shadow: 
    4px 4px 8px rgba(0, 0, 0, 0.15),
    -2px -2px 6px rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.neuro-button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.2),
    -3px -3px 8px rgba(255, 255, 255, 0.15);
}

.neuro-button-primary:active {
  transform: translateY(0);
  box-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.15) inset,
    -1px -1px 3px rgba(255, 255, 255, 0.1) inset;
}

/* Botão Secundário Neumórfico */
.neuro-button-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.813rem;
  font-weight: 500;
  border-radius: 0.75rem;
  background: var(--orx-bg-light);
  color: var(--orx-text-primary);
  box-shadow:
    5px 5px 10px var(--neumorphic-shadow-dark),
    -5px -5px 10px var(--neumorphic-shadow-light);
  transition: all 0.2s ease;
}

.neuro-button-secondary:hover {
  box-shadow:
    7px 7px 14px var(--neumorphic-shadow-dark),
    -7px -7px 14px var(--neumorphic-shadow-light);
}

.neuro-button-secondary:active {
  box-shadow:
    2px 2px 4px var(--neumorphic-shadow-dark) inset,
    -2px -2px 4px var(--neumorphic-shadow-light) inset;
}

/* Botão Ghost/Outline */
.neuro-button-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.813rem;
  font-weight: 500;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--orx-text-primary);
  border: 1px solid var(--orx-border);
  transition: all 0.2s ease;
}

.neuro-button-ghost:hover {
  background: var(--orx-surface);
  border-color: var(--orx-primary);
}
```

---

## 📐 PADRÕES DE LAYOUT

### 1. Grid de Botões de Navegação

```tsx
// Padrão para navegação de sub-módulos
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
  {categories.map((category) => (
    <button
      key={category.id}
      onClick={() => setActiveCategory(category.id)}
      className={cn(
        "relative p-4 rounded-xl transition-all duration-200",
        "inline-flex flex-col items-center gap-2",
        activeCategory === category.id
          ? "bg-primary text-white shadow-lg scale-105"
          : "bg-surface hover:shadow-md"
      )}
    >
      <category.icon size={20} />
      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
        {category.label}
      </span>
      {category.count > 0 && (
        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
          {category.count}
        </span>
      )}
    </button>
  ))}
</div>
```

### 2. Grupo de Botões de Ação

```tsx
// Padrão para botões de ação no topo da tela
<div className="flex items-center gap-3">
  <button className="neuro-button-primary inline-flex items-center gap-2">
    <Plus size={16} />
    <span style={{ fontSize: '0.813rem' }}>Novo Registro</span>
  </button>
  
  <button className="neuro-button-secondary inline-flex items-center gap-2">
    <Filter size={16} />
    <span style={{ fontSize: '0.813rem' }}>Filtros</span>
  </button>
  
  <button className="neuro-button-secondary inline-flex items-center gap-2">
    <Download size={16} />
    <span style={{ fontSize: '0.813rem' }}>Exportar</span>
  </button>
</div>
```

### 3. Botões de Formulário (Footer)

```tsx
// Padrão para rodapé de formulários
<div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-[var(--orx-border)]">
  <button
    type="button"
    onClick={onCancel}
    className="neuro-button-ghost inline-flex items-center gap-2"
    style={{ minWidth: '120px' }}
  >
    <X size={16} />
    <span style={{ fontSize: '0.813rem' }}>Cancelar</span>
  </button>
  
  <button
    type="submit"
    disabled={loading}
    className="neuro-button-primary inline-flex items-center gap-2"
    style={{ minWidth: '120px' }}
  >
    {loading ? (
      <Loader2 size={16} className="animate-spin" />
    ) : (
      <Check size={16} />
    )}
    <span style={{ fontSize: '0.813rem' }}>
      {loading ? 'Salvando...' : 'Salvar'}
    </span>
  </button>
</div>
```

---

## 🚫 ELIMINAÇÃO DE CARDS KPI

### ❌ NÃO USAR (Cards KPI separados):
```tsx
// EVITAR ISSO
<Card padding="md">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">Total de Produtos</p>
      <p className="text-2xl font-bold">1.234</p>
    </div>
    <Package className="w-8 h-8 text-primary" />
  </div>
</Card>
```

### ✅ USAR (Estatísticas inline):
```tsx
// PREFERIR ISSO - Mais limpo e direto
<div className="grid grid-cols-4 gap-6 mb-6">
  <div className="text-center">
    <Package className="w-6 h-6 mx-auto mb-2 text-primary" />
    <p style={{ fontSize: '0.75rem' }} className="text-muted-foreground mb-1">
      Total de Produtos
    </p>
    <p style={{ fontSize: '1.5rem', fontWeight: 700 }} className="text-foreground">
      1.234
    </p>
  </div>
  {/* Repetir para outros KPIs */}
</div>
```

---

## 🎨 MODO CLARO E ESCURO

### Variáveis CSS Automáticas (OraclusX DS)

```css
:root {
  /* Cores Base - Modo Claro */
  --orx-bg-light: #f0f0f3;
  --orx-bg-dark: #1a1a1a;
  --orx-text-primary: #2d3748;
  --orx-text-secondary: #718096;
  --orx-primary: #6366f1;
  --orx-primary-hover: #4f46e5;
  
  /* Sombras Neumórficas - Modo Claro */
  --neumorphic-shadow-dark: rgba(163, 177, 198, 0.6);
  --neumorphic-shadow-light: rgba(255, 255, 255, 0.9);
  
  /* Bordas */
  --orx-border: #e2e8f0;
  --orx-surface: #ffffff;
}

.dark {
  /* Cores Base - Modo Escuro */
  --orx-bg-light: #2d2d30;
  --orx-text-primary: #e2e8f0;
  --orx-text-secondary: #a0aec0;
  
  /* Sombras Neumórficas - Modo Escuro */
  --neumorphic-shadow-dark: rgba(0, 0, 0, 0.5);
  --neumorphic-shadow-light: rgba(255, 255, 255, 0.05);
  
  /* Bordas */
  --orx-border: #3f3f46;
  --orx-surface: #27272a;
}
```

---

## ✅ CHECKLIST DE PADRONIZAÇÃO

### Ao criar/editar um formulário:

- [ ] **Ícones e texto na mesma linha** (inline-flex)
- [ ] **Font-size: 0.813rem** para botões padrão
- [ ] **Ícone size: 16px** para botões padrão
- [ ] **Gap: 0.5rem (8px)** entre ícone e texto
- [ ] **Classes neumórficas** aplicadas (neuro-button-*)
- [ ] **Min-width: 120px** para botões de formulário
- [ ] **Sem Cards KPI** isolados (usar estatísticas inline)
- [ ] **Modo claro e escuro** funcionando corretamente
- [ ] **Transições suaves** (transition: all 0.2s ease)
- [ ] **Estados hover/active** implementados

---

## 📦 COMPONENTE BUTTON PADRONIZADO

```tsx
// src/components/oraclusx-ds/Button.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    icon: Icon, 
    loading = false,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'neuro-button-primary',
      secondary: 'neuro-button-secondary',
      ghost: 'neuro-button-ghost',
    };

    const sizeClasses = {
      sm: 'text-[0.75rem] h-8 px-3',
      md: 'text-[0.813rem] h-9 px-5',
      lg: 'text-[0.875rem] h-10 px-6',
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center gap-2',
          'font-medium rounded-xl transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : Icon ? (
          <Icon size={iconSizes[size]} />
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

**Uso do componente padronizado**:

```tsx
import { Button } from '@/components/oraclusx-ds/Button';
import { Plus, Filter, Download, Check, X } from 'lucide-react';

// Botão primário
<Button variant="primary" icon={Plus}>
  Novo Registro
</Button>

// Botão secundário
<Button variant="secondary" icon={Filter}>
  Filtros
</Button>

// Botão com loading
<Button variant="primary" icon={Check} loading={isLoading}>
  Salvar
</Button>

// Botão ghost
<Button variant="ghost" icon={X} onClick={handleCancel}>
  Cancelar
</Button>
```

---

## 🎯 CONCLUSÃO

Este guia estabelece um padrão visual consistente e profissional para todos os formulários e botões do sistema ICARUS v5.0, garantindo:

- ✅ **Harmonia visual** entre todos os componentes
- ✅ **UX consistente** em modo claro e escuro
- ✅ **Performance otimizada** (sem Cards KPI desnecessários)
- ✅ **Acessibilidade** (tamanhos mínimos, contraste adequado)
- ✅ **Manutenibilidade** (código padronizado e reutilizável)

**Próximo passo**: Aplicar este padrão em todos os formulários existentes e criar o novo módulo de Tabelas de Preços OPME.

