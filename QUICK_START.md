# 🎯 Quick Start - Sistema de Agentes ICARUS

## ✅ Tudo Está Pronto!

O sistema completo de agentes está operacional. Aqui está como usar:

---

## 🚀 1. Iniciar Aplicação

```bash
cd /Users/daxmeneghel/icarus-make
pnpm dev
```

---

## 💬 2. Chatbot de Agentes

**URL:** http://localhost:3000/chat-agentes

### Como usar:

1. Selecione um agente no dropdown
2. Escolha um comando
3. Click em "Executar"
4. Veja o resultado em tempo real

### Agentes disponíveis:

- **IA-Validator** - Validação de topologia IA
- **Contador** - Compliance fiscal
- **Advogado** - Compliance legal
- **Gestao** - KPIs e métricas
- **Tutor** - Diagnóstico e parecer

---

## 📊 3. Dashboard de Monitoramento

**URL:** http://localhost:3000/admin/agentes

### Features:

- ✅ Status de todos os agentes
- 📈 Métricas em tempo real
- 🔄 Auto-refresh (5 segundos)
- 📝 Log de execuções recentes
- ⏱️ Performance tracking

---

## 🧪 4. Executar Testes

### Testes de Integração

```bash
# Executar todos os testes
pnpm test

# Com interface visual
pnpm test:ui

# Com cobertura
pnpm test:coverage
```

### Testes E2E (Playwright)

```bash
# Executar E2E
pnpm test:e2e

# Com interface visual
pnpm test:e2e:ui

# Ver relatório HTML
pnpm test:e2e:report
```

---

## 🔧 5. CI/CD (Git Hooks)

O sistema valida automaticamente antes de cada commit:

```bash
git add .
git commit -m "feat: nova feature"

# Automaticamente executa:
# ✅ Validação de topologia IA
# ✅ Lint dos arquivos staged
# ✅ Type check TypeScript
```

---

## 📋 6. Validação Manual

Se quiser validar manualmente:

```bash
# Validar topologia IA
node tools/ia/ia-validator.js

# Auditar Edge Functions
node tools/ia/check-edge-functions.js

# Auto-corrigir configs
node tools/ia/auto-fix-configs.js

# Lint
pnpm lint

# Type check
pnpm type-check
```

---

## 🎯 7. Exemplos de Uso

### Executar comando via chatbot:

1. Abrir http://localhost:3000/chat-agentes
2. Selecionar "IA-Validator"
3. Selecionar "validar-topologia"
4. Click "Executar"
5. Ver resultado em < 5 segundos

### Monitorar performance:

1. Abrir http://localhost:3000/admin/agentes
2. Ver métricas atualizando
3. Click "Auto-refresh ON"
4. Observar em tempo real

### Testar via API:

```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "IA-Validator",
    "action": "validar-topologia"
  }'
```

---

## 📚 8. Documentação Completa

- `FASE2_COMPLETA.md` - Resumo completo
- `TAREFA_2_1_CONCLUIDA.md` - Chatbot
- `TAREFA_2_4_CONCLUIDA.md` - CI/CD
- `GUIA_CONFIGURACAO_CI_CD.md` - Setup CI/CD
- `.cursor/agents/PROGRESSO_FASE2.md` - Progresso

---

## ✅ Checklist Rápido

Verifique se tudo está funcionando:

```bash
# 1. Aplicação sobe sem erros
pnpm dev
# ✅ Deve abrir em http://localhost:3000

# 2. Testes passam
pnpm test
# ✅ Deve mostrar todos os testes passando

# 3. Dashboard carrega
# Abrir http://localhost:3000/admin/agentes
# ✅ Deve mostrar 6 agentes online

# 4. Chatbot funciona
# Abrir http://localhost:3000/chat-agentes
# ✅ Deve mostrar interface de chat

# 5. Hook funciona
git add .
git commit -m "test" --allow-empty
# ✅ Deve executar validações antes do commit
```

---

## 🎉 Pronto para Usar!

Tudo está configurado e funcionando. Comece agora:

```bash
pnpm dev
```

Depois acesse:

- 💬 Chat: http://localhost:3000/chat-agentes
- 📊 Dashboard: http://localhost:3000/admin/agentes

---

**Dúvidas?** Consulte `FASE2_COMPLETA.md` para detalhes técnicos.
