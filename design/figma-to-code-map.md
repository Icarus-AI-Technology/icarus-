# 🗺️ Mapeamento Figma → Código — Icarus v5.0

**Última atualização:** 2025-10-21  
**Agente:** AGENTE_DESIGNER_NEUMORPHIC_PREVIEW v5.0

---

## 📋 Índice
1. [Shell do Sistema](#shell-do-sistema)
2. [Dashboard Principal](#dashboard-principal)
3. [Módulo Cadastros](#módulo-cadastros)
4. [Módulo Compras](#módulo-compras)
5. [Módulo Integrações](#módulo-integrações)
6. [Componentes Reutilizáveis](#componentes-reutilizáveis)

---

## 🏗️ Shell do Sistema

### Topbar (Barra Superior)
**Figma Frame:** `Shell / Topbar 64px`  
**Path:** `/src/components/layout/IcarusTopbar.tsx`

**Especificações:**
- ✅ Altura: `64px`
- ✅ Background: `var(--orx-bg-light)` (adaptável light/dark)
- ✅ Sombras: Neumórficas (`.neomorphic-card`)
- ✅ Componentes:
  - Botão Menu (toggle sidebar)
  - Busca Global (SearchContainer)
  - Botões de ação: Ajuda, Notificações, Dark Mode, Configurações
  - Perfil do usuário

**Conformidade OraclusX DS:**
- ✅ Sem classes `text-*` / `font-*`
- ✅ Cores via CSS variables
- ✅ Tipografia via tags nativas

---

### Sidebar (Menu Lateral)
**Figma Frame:** `Shell / Sidebar 290px expandida | 80px colapsada`  
**Path:** `/src/components/layout/IcarusSidebar.tsx`

**Especificações:**
- ✅ Largura: `290px` expandida / `80px` colapsada
- ✅ Top: `96px` (16px + 64px Icarus + 16px gap)
- ✅ Background: `var(--orx-bg-light)` (adaptável)
- ✅ Sombras: Neumórficas (`.neumorphic-container`)
- ✅ 58 módulos hierarquizados
- ✅ Tooltips em modo colapsado
- ✅ Ícones coloridos (text-indigo-500, text-green-500, etc.)
- ✅ Estados: normal, hover, active

**Conformidade OraclusX DS:**
- ✅ Sem classes `text-*` / `font-*` (exceto ícones coloridos)
- ✅ Cores via CSS variables
- ✅ Ícones: Lucide React

---

### Brand Container (ICARUS v5.0)
**Figma Frame:** `Shell / Brand Icarus`  
**Path:** `/src/App.tsx` (linhas 80-173)

**Especificações:**
- ✅ Posição: `fixed top-16px left-16px`
- ✅ Largura: `290px` expandida / `64px` colapsada
- ✅ Altura: `64px` (alinhada com Topbar)
- ✅ Background: `rgba(99, 102, 241, 0.85)` (indigo brand)
- ✅ Efeito: **Liquid Glass** (backdrop-filter blur + saturate)
- ✅ Sombras: Neumórficas 3D Premium
- ✅ Ícone: `BrainCircuit` (Lucide)
- ✅ Transições: `cubic-bezier(0.4, 0, 0.2, 1)`

**Conformidade OraclusX DS:**
- ✅ Cor brand `#6366F1` via rgba
- ✅ Tipografia via inline style (não usa classes Tailwind)

---

## 📊 Dashboard Principal

**Figma Frame:** `Dashboard / Principal`  
**Path:** `/src/pages/DashboardPrincipal.tsx`

**Especificações:**
- ✅ Grid: 12 colunas, gap 24px
- ✅ Cards KPI: 4 colunas (3+3+3+3)
- ✅ Faturamento: 8 colunas
- ✅ Distribuição Geográfica: 4 colunas
- ✅ Ações Rápidas: 6 botões grid 3x2

**Componentes:**
1. **Header**
   - Título: `Dashboard Principal` (h1)
   - Subtítulo: `Visão geral do sistema ICARUS v5.0`
   - Botões: `Atualizar Dados`, `Relatório Completo`

2. **KPIs** (4 cards)
   - Sistema Status: 98% (+2.3%)
   - Médicos Ativos: 1.847 (+12.5%)
   - Produtos OPME: 12.4K (+5.2%)
   - Pedidos Urgentes: 89 (-8.1%)

3. **Faturamento Mensal** (card grande)
   - Valor: R$ 3.8M
   - Média diária: R$ 127K
   - Variação: +15.3%
   - Mini Bar Chart (8 barras animadas)

4. **Distribuição Geográfica** (card médio)
   - Hospitais: 147
   - Cidades: 28
   - Variação: +8.7%
   - Ícone mapa: MapPin (Lucide)

5. **Ações Rápidas** (6 botões)
   - Novo Pedido, Nova NF, Orçamento
   - Cadastro, Relatórios, Configurar
   - Ícones: Plus, FileText, Calculator, UserPlus, BarChart3, Settings

**Conformidade OraclusX DS:**
- ✅ Sem classes `text-*` / `font-*`
- ✅ Cores via CSS variables
- ✅ Sombras neumórficas
- ✅ Botões brand `#6366F1` via variable

**Preview URLs:**
- Light: `http://localhost:3000/` ou `/dashboard`
- Dark: (toggle via botão topbar)

---

## 📋 Módulo Cadastros

### Dashboard Cadastros
**Figma Frame:** `Cadastros / Dashboard Cadastros`  
**Path:** `/src/pages/cadastros/DashboardCadastros.tsx`

**Rotas:**
- `/cadastros` - Dashboard overview

### Cadastro de Médicos
**Figma Frame:** `Cadastros / Médicos / Formulário Completo`  
**Path:** `/src/pages/cadastros/CadastroMedicos.tsx`

**Especificações:**
- ✅ Formulário multi-seção:
  1. Dados Pessoais (nome, CPF, RG, data nasc., sexo)
  2. Dados Profissionais (CRM, UF, especialidade, ANS)
  3. Contato (tel fixo, celular, email, LinkedIn)
  4. Endereço (CEP auto-complete via ViaCEP)
  5. Dados Bancários (banco, agência, conta, PIX)
  6. Observações (textarea)

- ✅ Validações:
  - CPF: máscara + validação dígitos verificadores
  - CRM: consulta CFM via API (mock)
  - Email: regex + unicidade
  - CEP: auto-complete endereço
  - Duplicatas: detecção em tempo real

- ✅ Botões:
  - Cancelar (secondary)
  - Cadastrar Médico (primary brand #6366F1)

**Conformidade OraclusX DS:**
- ✅ Inputs: `.neumorphic-input`
- ✅ Botões: `.neumorphic-button` + brand color
- ✅ Labels: sem classes Tailwind

**Preview URLs:**
- Light: `http://localhost:3000/cadastros/medicos`
- Dark: (toggle via botão topbar)

### Outros Cadastros
**Paths:**
- `/cadastros/hospitais` → `CadastroHospitais.tsx`
- `/cadastros/pacientes` → `CadastroPacientes.tsx`
- `/cadastros/convenios` → `CadastroConvenios.tsx`
- `/cadastros/fornecedores` → `CadastroFornecedores.tsx`
- `/cadastros/produtos` → `CadastroProdutosOPME.tsx`
- `/cadastros/tabelas-precos` → `TabelasPrecos.tsx`
- `/cadastros/equipes` → `CadastroEquipesMedicas.tsx`
- `/cadastros/transportadoras` → `CadastroTransportadoras.tsx`

---

## 🛒 Módulo Compras

### Gestão de Cotações
**Figma Frame:** `Compras / Cotações / Dashboard`  
**Path:** `/src/pages/compras/GestaoCotacoes.tsx`

**Especificações:**
- ✅ Tabela responsiva com filtros
- ✅ Status: Aberta, Aguardando, Aprovada, Recusada
- ✅ Ações: Visualizar, Editar, Aprovar, Recusar
- ✅ Comparador de propostas (3+ fornecedores)

**Preview URL:** `http://localhost:3000/compras/cotacoes`

### Pedidos de Compra
**Path:** `/src/pages/compras/PedidosCompra.tsx`  
**Preview URL:** `http://localhost:3000/compras/pedidos`

### Notas de Compra
**Path:** `/src/pages/compras/NotasCompra.tsx`  
**Preview URL:** `http://localhost:3000/compras/notas`

---

## 🔌 Módulo Integrações

### Gerenciador de Credenciais
**Figma Frame:** `Integrações / Credenciais`  
**Path:** `/src/pages/integracoes/GerenciadorCredenciais.tsx`

**Especificações:**
- ✅ Lista de integrações: Supabase, Microsoft 365, Pluggy, APIs Gov
- ✅ Status: Ativo, Inativo, Erro
- ✅ Ações: Testar, Editar, Revogar
- ✅ Modais de configuração (por tipo)

**Preview URL:** `http://localhost:3000/integracoes/credenciais`

---

## 🧩 Componentes Reutilizáveis

### OraclusX DS (shadcn + Neumorphism)

#### Button
**Path:** `/src/components/ui/button.tsx`  
**Variants:**
- `default` - Brand #6366F1 (neumórfico)
- `secondary` - Neutro (neumórfico)
- `destructive` - Vermelho (neumórfico)
- `outline` - Borda (neumórfico)
- `ghost` - Transparente

**Conformidade:**
- ✅ Cores via CSS variables
- ✅ Sombras neumórficas
- ✅ Estados: hover, active, disabled

---

#### Card
**Path:** `/src/components/ui/card.tsx`  
**Composição:**
- `Card` - Container
- `CardHeader` - Cabeçalho
- `CardTitle` - Título (h3)
- `CardDescription` - Subtítulo
- `CardContent` - Conteúdo
- `CardFooter` - Rodapé

**Conformidade:**
- ✅ Background: `var(--orx-bg-light)`
- ✅ Sombras: `.neumorphic-card`

---

#### Input / Textarea
**Path:** `/src/components/ui/input.tsx`, `textarea.tsx`  
**Variantes:**
- `default` - Neumórfico inset
- `error` - Borda vermelha (erro de validação)

**Conformidade:**
- ✅ Classe: `.neumorphic-input`
- ✅ Focus: sombra inset intensificada

---

#### Select / Combobox
**Path:** `/src/components/ui/select.tsx`  
**Base:** Radix UI + skin neumórfica

**Conformidade:**
- ✅ Dropdown: background adaptável
- ✅ Options: hover neumórfico

---

#### Dialog / Modal
**Path:** `/src/components/ui/dialog.tsx`  
**Animações:** fade-in + scale-in

**Conformidade:**
- ✅ Overlay: backdrop blur
- ✅ Content: neumórfico card
- ✅ Botões: brand + secondary

---

#### Tabs
**Path:** `/src/components/ui/tabs.tsx`  
**Estados:** normal, active (neumórfico pressed)

---

#### Table
**Path:** `/src/components/ui/table.tsx`  
**Especificações:**
- ✅ Header: background `var(--orx-muted)`
- ✅ Rows: hover neumórfico suave
- ✅ Responsivo: scroll horizontal em mobile

---

#### Tooltip
**Path:** `/src/components/ui/tooltip.tsx`  
**Uso:** Sidebar colapsada, botões sem label

**Conformidade:**
- ✅ Background: `var(--orx-popover)`
- ✅ Arrow: presente
- ✅ Delay: 200ms

---

### Componentes Customizados OraclusX

#### SearchContainer
**Path:** `/src/components/oraclusx-ds/SearchContainer.tsx`  
**Uso:** Topbar (busca global)

**Especificações:**
- ✅ Ícone: Search (Lucide)
- ✅ Input: neumórfico
- ✅ Filtros opcionais (expandível)
- ✅ Placeholder: "Buscar médicos, cirurgias, produtos..."

---

#### ChatbotWithResearch
**Path:** `/src/components/oraclusx-ds/ChatbotWithResearch.tsx`  
**Uso:** Widget flutuante (bottom-right)

**Especificações:**
- ✅ Botão: Liquid Glass (indigo brand)
- ✅ Drawer: animado (slide-in-right)
- ✅ Integração: GPT Researcher (backend)

---

#### TutorOPME
**Path:** `/src/components/ai/TutorOPME.tsx`  
**Uso:** Widget flutuante (bottom-left)

**Especificações:**
- ✅ Botão: Liquid Glass (roxo)
- ✅ Drawer: animado
- ✅ Conteúdo: tutoriais e help contextuais

---

## 📸 Prints Capturados

### Dashboard Principal
- ✅ `dashboard-light-current.png` - Modo light
- ✅ `dashboard-dark-current.png` - Modo dark

### Cadastros
- ✅ `cadastros-medicos-light-current.png` - Formulário médicos (light)
- 🔄 `cadastros-medicos-dark-current.png` - Formulário médicos (dark) [pendente]

### Compras
- 🔄 `compras-cotacoes-light-current.png` - Gestão cotações (light) [pendente]
- 🔄 `compras-cotacoes-dark-current.png` - Gestão cotações (dark) [pendente]

### Integrações
- 🔄 `integracoes-credenciais-light-current.png` - Gerenciador (light) [pendente]
- 🔄 `integracoes-credenciais-dark-current.png` - Gerenciador (dark) [pendente]

---

## ✅ Checklist de Conformidade por Rota

### Shell (Topbar + Sidebar + Brand)
- ✅ Layout 1:1 com Figma
- ✅ Sombras neumórficas
- ✅ Cores via CSS variables
- ✅ Sem classes `text-*` / `font-*` (exceto ícones coloridos)
- ✅ Dark mode funcional
- ✅ Responsivo (sidebar colapsável)

### Dashboard Principal
- ✅ Layout 1:1 com Figma
- ✅ KPIs + cards neumórficos
- ✅ Mini bar chart animado
- ✅ Ações rápidas (6 botões)
- ✅ Conformidade OraclusX DS

### Cadastros - Médicos
- ✅ Formulário multi-seção
- ✅ Validações em tempo real
- ✅ Inputs neumórficos
- ✅ Botões brand #6366F1
- ✅ Conformidade OraclusX DS

### Compras - Cotações
- 🔄 Layout em implementação
- 🔄 Tabela responsiva
- 🔄 Filtros e ações

### Integrações - Credenciais
- 🔄 Lista de integrações
- 🔄 Status e ações
- 🔄 Modais de configuração

---

## 🔄 Próximos Passos

1. ✅ **Preview ativo** em `http://localhost:3000`
2. ✅ **Prints principais** capturados (Dashboard + Médicos)
3. 🔄 **Capturar prints restantes** (Compras, Integrações)
4. 🔄 **Validação visual** completa (comparação Figma vs Código)
5. 🔄 **Ajustes finais** de conformidade (se necessário)

---

## 📚 Referências

- **Figma:** [Link do projeto Make]
- **OraclusX DS:** `/docs/ORACLUSX_DS_COMPLETO.md`
- **shadcn/ui:** https://ui.shadcn.com/
- **Lucide Icons:** https://lucide.dev/

---

**Última sincronização Figma:** 2025-10-21  
**Status:** ✅ **Preview operacional + prints iniciais capturados**
