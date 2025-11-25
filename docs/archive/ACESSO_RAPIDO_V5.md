# 🚀 Acesso Rápido - ICARUS v5.0 Cyberpunk Theme

## ⚡ Como Iniciar

```bash
# 1. Iniciar o servidor de desenvolvimento
npm run dev

# 2. Abrir no navegador
http://localhost:5173/v5
```

## 🗺️ Mapa de Rotas

| Rota | Descrição | Componente |
|------|-----------|------------|
| `/v5` | Dashboard Principal | `Dashboard.tsx` |
| `/v5/dashboard` | Dashboard Principal | `Dashboard.tsx` |
| `/v5/cadastros` | Cadastros Inteligentes | `Cadastros.tsx` |
| `/v5/analytics` | Analytics & BI | `Analytics.tsx` |

## 🎨 Paleta de Cores (Copiar & Colar)

```css
/* Fundo */
background: #0f111a;

/* Cards */
background: #181b29;
background: #11131f; /* Sidebar/Header */

/* Bordas */
border: 1px solid rgba(255, 255, 255, 0.05);

/* Texto */
color: #f3f4f6; /* Principal */
color: #9ca3af; /* Secundário */

/* Accent */
background: #6366f1; /* Indigo */
background: #22c55e; /* Verde */
```

## 📦 Componentes Disponíveis

### Layout
```tsx
import { CyberpunkLayout } from '@/components/layout/CyberpunkLayout';
```

### Charts
```tsx
import { RevenueChart } from '@/components/charts/RevenueChart';
import { GeoChart } from '@/components/charts/GeoChart';
```

### UI
```tsx
import { Modal } from '@/components/Modal';
import { AIChatWidget } from '@/components/AIChatWidget';
import { SecondaryCard } from '@/components/SecondaryCard';
```

## 🔧 Classes CSS Úteis

```tsx
// Esconder scrollbar
className="scrollbar-hide"

// Efeito de vidro
className="glass-panel"

// Border radius alto
className="rounded-[2rem]"

// Sombra com brilho
className="shadow-[0_0_20px_rgba(99,102,241,0.15)]"

// Hover com elevação
className="hover:translate-x-1 transition-all"
```

## 📊 Estrutura de Grid Responsivo

```tsx
// Layout Principal
<div className="flex h-screen bg-[#0f111a] p-4 gap-4">
  <aside className="w-72 bg-[#11131f] rounded-[2rem]">
    {/* Sidebar */}
  </aside>
  <main className="flex-1 flex flex-col gap-4">
    {/* Content */}
  </main>
</div>

// Grid de Cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>

// Tabela com Linhas Flutuantes
<table className="w-full border-separate" style={{ borderSpacing: '0 12px' }}>
  {/* Tabela */}
</table>
```

## 🎯 Snippets de Código

### StatCard
```tsx
<div className="bg-[#11131f] p-6 rounded-[2rem] border border-white/5">
  <div className="flex items-center gap-4 mb-6">
    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-gray-400 text-sm">Título</h3>
      <p className="text-xs text-gray-500">Subtítulo</p>
    </div>
  </div>
  <h2 className="text-3xl font-bold text-white">Valor</h2>
</div>
```

### Input Dark
```tsx
<input 
  type="text"
  className="w-full bg-[#11131f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-600"
  placeholder="Digite algo..."
/>
```

### Button Primary
```tsx
<button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-900/20">
  Ação Principal
</button>
```

### Badge de Status
```tsx
<span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
  Ativo
</span>
```

## 📱 Breakpoints

```tsx
// Mobile First
sm:  640px   // Tablet
md:  768px   // Desktop pequeno
lg:  1024px  // Desktop médio
xl:  1280px  // Desktop grande
2xl: 1536px  // Desktop extra grande
```

## 🎨 Gradientes

```tsx
// Header Gradient
className="bg-gradient-to-r from-indigo-600 to-purple-600"

// Background Glow
className="bg-gradient-to-t from-emerald-500/5 to-transparent"

// Footer Gradient
className="bg-gradient-to-t from-black/40 to-transparent"
```

## 🔍 Debugging

```bash
# Ver erros de tipo
npm run type-check

# Ver erros de lint
npm run lint

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 📝 Checklist de Desenvolvimento

- [ ] Página usa `CyberpunkLayout` como wrapper
- [ ] Cores seguem paleta `#0f111a`, `#181b29`, `#11131f`
- [ ] Border radius é `rounded-[2rem]` ou `rounded-xl`
- [ ] Bordas são `border-white/5` ou `border-white/10`
- [ ] Hover states tem `transition-all` ou `transition-colors`
- [ ] Inputs têm `focus:border-indigo-500`
- [ ] Scrollbars usam `scrollbar-hide`
- [ ] Gráficos usam tema dark customizado
- [ ] Componentes são TypeScript com types
- [ ] Responsivo com grid breakpoints

## 🚨 Erros Comuns

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Type error"
```bash
npm run type-check
```

### Página em branco
- Verificar console do navegador
- Verificar se rota está em `/v5`
- Limpar cache: Ctrl+Shift+R

## 📚 Referências Rápidas

- **Tailwind**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/en-US/api
- **Lucide Icons**: https://lucide.dev/icons
- **React Router**: https://reactrouter.com/en/main

---

**Dica**: Mantenha este arquivo aberto em uma segunda aba do editor para referência rápida! 🚀

