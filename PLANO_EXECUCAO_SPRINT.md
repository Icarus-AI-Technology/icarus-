# 🚀 Plano de Execução - Sprint Imediato (8h)

**Data:** 19 de novembro de 2025  
**Status:** 🔴 EM EXECUÇÃO  
**Objetivo:** Implementar 7 tarefas críticas para paridade Figma → Código

---

## 📊 Estado Atual (Análise Completa)

### Rotas Atuais no App.tsx
**Total identificado:** ~50 rotas

**Rotas implementadas:**
- ✅ Auth: /login, /signup, /reset-password
- ✅ Dashboard: /dashboard
- ✅ Cadastros: 10 rotas (/cadastros/*)
- ✅ Compras: 6 rotas (/compras/*)
- ✅ Cirurgias: 2 rotas
- ✅ Estoque: 4 rotas
- ✅ Vendas: 3 rotas
- ✅ Financeiro: 6 rotas
- ✅ Compliance: 3 rotas
- ✅ Relatórios: 2 rotas
- ✅ Outros: chatbot, usuários, configurações, integrações

**Rotas faltantes:** ~33 rotas (não 59)
  
### Módulos Existentes em /src/components/modules/
Precisamos verificar quantos estão criados mas não roteados.

---

## 🎯 ESTRATÉGIA RECOMENDADA

### Opção A: **Sequencial Focado** (Recomendado)
Execute uma tarefa de cada vez, testando entre cada uma.

**Vantagens:**
- ✅ Menor risco de erros acumulados
- ✅ Feedback imediato
- ✅ Rollback fácil se algo der errado
- ✅ Progresso visível

**Desvantagens:**
- ⏱️ Pode ser mais lento

### Opção B: **Paralelo Agressivo**
Faça todas as mudanças de uma vez e teste no final.

**Vantagens:**
- ⚡ Mais rápido se tudo funcionar

**Desvantagens:**
- ❌ Alto risco
- ❌ Difícil debugar erros
- ❌ Pode perder tempo corrigindo

---

## 📋 PLANO SEQUENCIAL (8h)

### 🔥 Fase 1: Análise Profunda (30min)
**Objetivo:** Mapear precisamente o que falta

```bash
✅ Ler App.tsx completo - FEITO
✅ Identificar rotas atuais - FEITO (~50 rotas)
⏳ Listar módulos em /components/modules/
⏳ Comparar com lista de 83 módulos esperados
⏳ Criar lista precisa de rotas faltantes
```

### 🚀 Fase 2: Páginas de Erro (1h) - PRIORIDADE 1
**Por que começar aqui?**
- ✅ Independente das outras tarefas
- ✅ Rápido de implementar
- ✅ Melhora UX imediatamente
- ✅ Necessário para testar rotas inválidas

**Implementação:**
1. Criar `/src/pages/errors/NotFound.tsx` (20min)
2. Criar `/src/pages/errors/Unauthorized.tsx` (15min)
3. Criar `/src/pages/errors/ServerError.tsx` (15min)
4. Atualizar rotas no App.tsx (10min)

### 🛣️ Fase 3: Rotas Faltantes (2h) - PRIORIDADE 2
**Após ter os erros configurados**

**Sub-tarefas:**
1. Listar módulos não roteados (15min)
2. Importar com lazy loading (30min)
3. Adicionar rotas em App.tsx (45min)
4. Testar navegação básica (30min)

### 📐 Fase 4: Layout Crítico (1.5h) - PRIORIDADE 3

**Sub-tarefas:**
1. Dashboard KPIs Grid (1h)
   - Implementar grid-cols-12
   - Ajustar col-spans
   - Testar responsividade

2. Ajustes de medidas (30min)
   - Topbar: 72px → 64px
   - Main margin: 292px → 284px  
   - Sidebar transition: 300ms → 200ms

### ♿ Fase 5: Acessibilidade (30min) - PRIORIDADE 4
**Focus ring 3px**

Arquivos a atualizar:
- Button.tsx
- Input.tsx
- Select.tsx
- Checkbox.tsx
- Radio.tsx

Ação: `ring-2 → ring-3` (global replace)

### ✅ Fase 6: Validações (1h) - PRIORIDADE 5
**FormularioMedicoAvancado**

1. Instalar Zod (se necessário)
2. Criar schemas de validação
3. Implementar validações:
   - CPF (11 dígitos + checksum)
   - CRM (numérico + UF)
   - Telefone (formato BR)
4. Feedback visual de erros

### 💡 Fase 7: Tooltips Sidebar (1h) - PRIORIDADE 6

1. Verificar se componente Tooltip existe
2. Implementar em itens da sidebar
3. Testar em estado collapsed
4. Validar posicionamento (right)

### 🧪 Fase 8: Testes Finais (30min)

1. Navegação em todas rotas novas
2. Páginas de erro funcionando
3. Layout responsivo
4. Focus visível
5. Validações funcionando
6. Tooltips aparecendo

---

## ⚡ PRÓXIMA AÇÃO IMEDIATA

**Vou executar Fase 1 agora:**

```
1. Listar todos os módulos em /components/modules/
2. Comparar com rotas do App.tsx
3. Identificar precisamente o que falta
4. Gerar lista de ações específicas
```

**Após análise, te apresento:**
- Lista exata de rotas faltantes
- Estimativa ajustada de tempo
- Ordem de implementação otimizada

---

## 🎯 Decisão Necessária

**Qual abordagem prefere?**

A) ✅ **Sequencial Focado** (Recomendo)
   - Faço análise profunda agora
   - Implemento tarefa por tarefa
   - Testo entre cada fase
   - Menor risco, progresso visível

B) ⚡ **Começar Direto**
   - Pulo análise detalhada
   - Implemento baseado no documento
   - Corrijo erros depois
   - Mais rápido, mais arriscado

**Sua escolha?** 🤔

