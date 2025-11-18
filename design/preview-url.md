# 🔧 Preview Frontend - Icarus v5.0

## 📍 URL do Preview

**Ambiente Local (Dev):**  
🌐 `http://localhost:3000`

**Status:** ✅ **ATIVO** (iniciado em: `$(date '+%Y-%m-%d %H:%M:%S')`)

---

## 🚀 Como Iniciar o Preview

```bash
# 1. Instalar dependências (se necessário)
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Acessar no navegador
# http://localhost:3000
```

---

## 📦 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Dev** | `npm run dev` | Servidor de desenvolvimento (hot reload) |
| **Build** | `npm run build` | Build de produção |
| **Preview** | `npm run preview` | Preview do build (porta 4173) |
| **Lint** | `npm run lint` | Verificação ESLint |
| **Type-Check** | `npm run type-check` | Verificação TypeScript |

---

## 🎨 Rotas Principais para Validação Visual

### 🏠 Dashboard & Shell
- **Dashboard Principal:** `/` ou `/dashboard`
- **Shell (Topbar/Sidebar):** Visível em todas as rotas

### 📋 Cadastros Inteligentes
- **Dashboard Cadastros:** `/cadastros`
- **Médicos:** `/cadastros/medicos`
- **Hospitais:** `/cadastros/hospitais`
- **Pacientes:** `/cadastros/pacientes`
- **Convênios:** `/cadastros/convenios`
- **Fornecedores:** `/cadastros/fornecedores`
- **Produtos OPME:** `/cadastros/produtos`
- **Tabelas de Preços:** `/cadastros/tabelas-precos`
- **Equipes Médicas:** `/cadastros/equipes`
- **Transportadoras:** `/cadastros/transportadoras`

### 🛒 Compras & Fornecedores
- **Gestão de Cotações:** `/compras/cotacoes`
- **Pedidos de Compra:** `/compras/pedidos`
- **Notas de Compra:** `/compras/notas`

### 🔌 Integrações
- **Gerenciador de Credenciais:** `/integracoes/credenciais`

---

## 🌓 Temas Disponíveis

- **Light Mode:** Neumorphism clássico (fundo claro)
- **Dark Mode:** Neumorphism dark (fundo escuro)

**Toggle:** Botão na Topbar (ícone Sol/Lua)

---

## 🎯 Design System

### ✅ Conformidade OraclusX DS
- ✅ **Tipografia:** Sem classes `text-*` / `font-*` (somente CSS variables)
- ✅ **Cores:** 100% CSS variables `var(--orx-*)`
- ✅ **Botões:** Cor brand `#6366F1` via variable
- ✅ **Sombras:** Neumórficas (utilitários `.neomorphic-*`)
- ✅ **Componentes:** Baseados em **shadcn/ui** + skin neumórfica

### 📐 Layout Shell
- **Topbar:** 64px altura
- **Sidebar:** 290px expandida / 80px colapsada
- **Main:** Grid 12 colunas, responsivo

---

## 📸 Capturas Planejadas

- [ ] Dashboard Principal (light/dark)
- [ ] Cadastros Médicos (light/dark)
- [ ] Compras - Cotações (light/dark)
- [ ] Integrações - Credenciais (light/dark)

---

## 🛠️ Stack Tecnológica

- **React:** 18.3.1
- **TypeScript:** 5.6.x (strict)
- **Vite:** 6.x
- **Tailwind CSS:** 3.4.10 (infraestrutura)
- **shadcn/ui:** Componentes base
- **OraclusX DS:** Tokens e variáveis CSS

---

## 🔄 Hot Reload

O preview possui **hot reload** ativo, qualquer alteração nos arquivos `.tsx`, `.ts` ou `.css` será refletida automaticamente no navegador.

---

## 🧪 Ambiente de Testes

```bash
# Type-check
npm run type-check

# Linter
npm run lint

# Validação completa
npm run validate:all

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e
```

---

## 📝 Notas Técnicas

- **Port Dev:** `3000` (configurado em `vite.config.ts`)
- **Port Preview:** `4173` (pós-build)
- **Browser Compatibility:** Chrome, Firefox, Safari, Edge (últimas 2 versões)
- **A11y:** WCAG 2.1 AA

---

**Última atualização:** `$(date '+%Y-%m-%d %H:%M:%S')`  
**Agente:** AGENTE_DESIGNER_NEUMORPHIC_PREVIEW v5.0
