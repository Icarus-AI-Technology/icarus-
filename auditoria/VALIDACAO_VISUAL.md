# ✅ Guia de Validação Visual - ICARUS v5.0

**Data:** 31 de outubro de 2025  
**Servidor:** http://localhost:3000  
**Status:** ✅ Servidor rodando

---

## 🎯 Objetivo

Validar visualmente todas as correções implementadas, verificando:
- ✅ Contraste de cores em modo claro/escuro
- ✅ Layouts padronizados (grids, espaçamentos)
- ✅ Componentes neumórficos consistentes
- ✅ Formulários com validação e feedback correto
- ✅ KPI Cards padronizados

---

## 📋 Checklist de Validação

### **1. PÁGINA DE LOGIN** 
**Rota:** `/` ou `/login`

#### Modo Claro:
- [ ] Texto "ICARUS v5.0" visível e legível
- [ ] Botão de login com contraste adequado
- [ ] Link "Esqueceu sua senha?" com contraste adequado
- [ ] Formulário com campos bem visíveis
- [ ] Sem texto branco em fundo claro

#### Modo Escuro:
- [ ] Todos os elementos visíveis
- [ ] Contraste adequado em todos os textos
- [ ] Botões com sombras neumórficas corretas

---

### **2. DASHBOARD PRINCIPAL**
**Rota:** `/dashboard` (após login)

#### KPIs Cards:
- [ ] Grid responsivo (4 colunas em desktop, 2 em tablet, 1 em mobile)
- [ ] Cards com sombras neumórficas consistentes
- [ ] Ícones e valores bem visíveis
- [ ] Cores usando tokens do DS (não hardcoded)
- [ ] Trend indicators funcionando

#### Modo Claro:
- [ ] Textos em `text-[var(--orx-text-primary)]` ou equivalentes
- [ ] Nenhum texto branco invisível
- [ ] Backgrounds usando `var(--orx-bg-light)`

#### Modo Escuro:
- [ ] Todos os elementos legíveis
- [ ] Contraste WCAG AA mínimo

---

### **3. MÓDULO DE CADASTROS**
**Rota:** `/cadastros`

#### Dashboard de Cadastros:
- [ ] Cards de estatísticas padronizados
- [ ] Grid responsivo
- [ ] Botões com ícone + texto na mesma linha

#### Formulários Principais:
- [ ] **Formulário Médicos** (`/cadastros/medicos`)
  - [ ] Grid responsivo (`md:grid-cols-2 xl:grid-cols-3`)
  - [ ] Ícones usando `text-[hsl(var(--primary))]`
  - [ ] Validação CEP funcionando
  - [ ] Loading states durante validação CRM
  - [ ] Mensagens de erro visíveis

- [ ] **Formulário Hospitais** (`/cadastros/hospitais`)
  - [ ] Grid responsivo
  - [ ] Validação CEP
  - [ ] Tokens de cor aplicados

- [ ] **Formulário Pacientes** (`/cadastros/pacientes`)
  - [ ] Grid responsivo
  - [ ] Seção LGPD estilizada corretamente
  - [ ] Validação de CPF/CEP

- [ ] **Formulário Fornecedores** (`/cadastros/fornecedores`)
  - [ ] Grid responsivo
  - [ ] Validação CNPJ/CEP

- [ ] **Tabelas de Preços** (`/cadastros/tabelas-precos`)
  - [ ] KPI Cards usando `KPICard` padronizado
  - [ ] Grid usando `KPI_GRID` e `KPI_COL`

---

### **4. MÓDULO DE CIRURGIAS**
**Rota:** `/cirurgias` ou `/cirurgias/procedimentos`

#### Validações:
- [ ] Imports de ícones corrigidos (Activity, Clock, CheckCircle2, etc.)
- [ ] KPIs usando `kpi.title` (não `kpi.label`)
- [ ] Ícones com `className="w-5 h-5"` (não `size={20}`)
- [ ] Cards neumórficos consistentes
- [ ] Textos com contraste adequado

---

### **5. MÓDULO DE ESTOQUE**
**Rota:** `/estoque` ou `/estoque/ia`

#### Estoque IA:
- [ ] Imports de ícones corrigidos (AlertCircle, QrCode, Boxes, etc.)
- [ ] Tipo `Material` funcionando corretamente
- [ ] Cards de categorias visíveis
- [ ] KPIs padronizados

#### Consignação Avançada:
- [ ] Botões com contraste adequado
- [ ] Cards neumórficos
- [ ] Textos legíveis em ambos os modos

---

### **6. MÓDULO FINANCEIRO**
**Rota:** `/financeiro` ou `/financeiro/dashboard`

#### Validações:
- [ ] KPI Cards usando padrão `KPICard`
- [ ] Grid usando `KPI_GRID` e `KPI_COL`
- [ ] Contraste adequado em gráficos
- [ ] Botões com estilos consistentes

---

### **7. MÓDULO COMPLIANCE**
**Rota:** `/compliance` ou `/compliance/auditoria`

#### Validações:
- [ ] Botão "Nova Auditoria" com contraste adequado
- [ ] Cards de KPIs padronizados
- [ ] Textos legíveis em ambos os modos

---

### **8. DASHBOARD IA**
**Rota:** `/ia` ou `/ia/dashboard`

#### Validações:
- [ ] Cards de estatísticas com `dark:text-white` (correto)
- [ ] Botões ativos com gradiente (correto)
- [ ] Textos sempre legíveis

---

### **9. NAVEGAÇÃO E LAYOUT**

#### Sidebar:
- [ ] Hover com borda roxa (`hover:border-2 hover:border-[var(--orx-primary)]`)
- [ ] Espaçamento entre botões correto (8px marginBottom)
- [ ] Ícones e textos alinhados

#### Topbar:
- [ ] Tema claro/escuro funcionando
- [ ] Botões acessíveis
- [ ] Contraste adequado

#### Chatbot FAB:
- [ ] Posicionamento correto (bottom-right)
- [ ] Contraste adequado
- [ ] Modal funcional

---

### **10. FORMULÁRIOS OPERACIONAIS**

#### Formulário Cirurgias:
- [ ] Grid responsivo
- [ ] Ícones usando tokens
- [ ] Validação funcionando

---

## 🎨 Validações de Design System

### Tokens de Cor:
- [ ] Todos os textos usam `--orx-text-primary` ou `--orx-text-secondary`
- [ ] Botões usam `--orx-primary` ou `--orx-primary-foreground`
- [ ] Backgrounds usam `--orx-bg-light` ou `--orx-bg-dark`
- [ ] Nenhuma cor hex hardcoded em textos principais

### Sombras Neumórficas:
- [ ] Cards com `neumorphic-card` class
- [ ] Botões com sombras consistentes
- [ ] Efeito 3D visível e consistente

### Grids Responsivos:
- [ ] Formulários usando `formGridClasses`
- [ ] Dashboards usando `KPI_GRID` e `KPI_COL`
- [ ] Breakpoints funcionando (md:, xl:)

### Espaçamentos:
- [ ] Uso de `var(--orx-spacing-*)` ou `gap-6`
- [ ] Consistência entre módulos

---

## 🔍 Problemas a Observar

### ❌ NÃO DEVE APARECER:
1. **Texto branco invisível em modo claro**
2. **Cores hex hardcoded** (`#ffffff`, `#000000`, etc.) em textos
3. **Grids desalinhados** ou não responsivos
4. **Cards sem sombras neumórficas**
5. **Ícones quebrados** (imports faltantes)
6. **Erros de console** (verificar DevTools)

### ✅ DEVE APARECER:
1. **Textos sempre legíveis** (contraste adequado)
2. **Layouts consistentes** entre módulos
3. **Feedback visual** em formulários (loading, erros)
4. **Transições suaves** em modo claro/escuro
5. **Responsividade** em diferentes tamanhos de tela

---

## 📝 Como Reportar Problemas

Se encontrar algum problema, documente:

1. **Rota/URL:** `/cadastros/medicos`
2. **Modo:** Claro / Escuro
3. **Problema:** Texto branco invisível no campo X
4. **Screenshot:** (opcional)
5. **Console Errors:** (se houver)

---

## ✅ Checklist Rápido (5 minutos)

Execute esta validação rápida primeiro:

- [ ] **Login** → Verificar contraste
- [ ] **Dashboard** → Verificar KPIs padronizados
- [ ] **Cadastros/Medicos** → Verificar grid e validação
- [ ] **Cirurgias** → Verificar ícones e cards
- [ ] **Estoque IA** → Verificar tipo Material
- [ ] **Alternar modo claro/escuro** → Verificar transições

---

## 🚀 Próximos Passos Após Validação

1. Se tudo estiver OK: ✅ **Projeto pronto para produção**
2. Se houver problemas: Documentar em `docs/auditoria/problemas-visuais.md`
3. Executar `pnpm build` e `pnpm preview` para testar build de produção
4. Executar `pnpm qa:a11y` em build preview (porta 4173)

---

**Última atualização:** 31/10/2025 23:58  
**Servidor:** http://localhost:3000 ✅

