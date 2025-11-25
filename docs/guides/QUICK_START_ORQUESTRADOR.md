# 🚀 QUICK START - Orquestrador ICARUS v5.0

## ⚡ Comandos Essenciais

### Execução Completa (Modo Automático)

```bash
# Resetar todos os agentes
pnpm reset:all

# Executar orquestração completa (Grupos 1, 2, 3 + Sequential)
pnpm audit:full

# Ver status de todos os agentes
pnpm status:all

# Gerar relatório consolidado
pnpm report:generate

# Visualizar relatório
pnpm report:view

# Verificar issues críticos
pnpm issues:critical
```

---

## 📋 Comandos por Categoria

### 🎯 Execução

```bash
# Orquestração completa (automática)
pnpm audit:full

# Executar agente específico
pnpm audit:agent 01
pnpm audit:agent 03
pnpm audit:agent 08
```

### 📊 Monitoramento

```bash
# Ver status de todos os agentes
pnpm status:all

# Ver logs (últimas 200 linhas)
pnpm logs:agent

# Verificar dependências de um agente
pnpm check:dependencies 05
pnpm check:dependencies 08
```

### 📄 Relatórios

```bash
# Gerar relatório consolidado
pnpm report:generate

# Ver relatório consolidado
pnpm report:view

# Ver relatório de agente específico
pnpm report:view 01
pnpm report:view 03

# Listar issues críticos
pnpm issues:critical
```

### 🔧 Manutenção

```bash
# Resetar todos os agentes
pnpm reset:all

# Resetar agente específico
pnpm reset:agent 01

# Limpar locks expirados
pnpm locks:clean
```

### 🚀 Deploy

```bash
# Validar pré-condições e preparar deploy
pnpm deploy:vercel
```

---

## 🎬 Fluxo de Trabalho Típico

### Cenário 1: Auditoria Completa (Primeira Vez)

```bash
# 1. Limpar estado anterior
pnpm reset:all
pnpm locks:clean

# 2. Executar orquestração
pnpm audit:full

# 3. Monitorar (em outro terminal, durante execução)
watch -n 2 pnpm status:all

# 4. Após conclusão, ver resultados
pnpm status:all
pnpm report:generate
pnpm report:view
pnpm issues:critical

# 5. Se tudo OK, fazer deploy
pnpm deploy:vercel
```

### Cenário 2: Re-executar Agente Específico

```bash
# 1. Resetar apenas o agente desejado
pnpm reset:agent 03

# 2. Executar
pnpm audit:agent 03

# 3. Verificar status
pnpm status:all

# 4. Ver relatório específico
pnpm report:view 03

# 5. Ver logs
pnpm logs:agent | grep "03-backend"
```

### Cenário 3: Debugar Problema de Dependência

```bash
# 1. Verificar qual agente está bloqueado
pnpm check:dependencies 05

# Output esperado:
# Agente 05 bloqueado por:
#  ❌ Agente 03 (Backend) - status: running (45%)

# 2. Ver status do agente bloqueador
pnpm status:all | grep "03"

# 3. Ver logs para entender o que está acontecendo
pnpm logs:agent | grep "03-backend"

# 4. Se travado, resetar e re-executar
pnpm reset:agent 03
pnpm audit:agent 03
```

### Cenário 4: Limpeza Geral (Resetar Tudo)

```bash
# Limpar locks expirados
pnpm locks:clean

# Resetar todos os status
pnpm reset:all

# Verificar que tudo está idle
pnpm status:all
```

---

## 🎯 Grupos de Execução

### 🟢 Grupo 1: Frontend & Design (Paralelo)
- Agente 01 (Design System)
- Agente 02 (Frontend)
- Agente 07 (Segurança)

**Dependências:** Nenhuma

### 🟡 Grupo 2: Backend & APIs (Paralelo)
- Agente 03 (Backend)
- Agente 04 (Integrações)

**Dependências:** Nenhuma

### 🔵 Grupo 3: IA & Módulos (Paralelo)
- Agente 05 (IA)
- Agente 06 (Módulos)

**Dependências:** Agente 03 (Backend)

### 🟣 Sequential: Testes & Deploy (Sequencial)
- Agente 08 (Testes)
- Agente 09 (Deploy)
- Agente 10 (Limpeza)

**Dependências:** Todos os anteriores (01-07)

---

## 📊 Interpretação de Status

```bash
pnpm status:all
```

**Possíveis Status:**

| Status | Emoji | Significado |
|--------|-------|-------------|
| `idle` | ⏳ | Aguardando execução |
| `running` | 🔄 | Em execução |
| `done` | ✅ | Concluído com sucesso |
| `blocked` | 🚫 | Bloqueado por dependências |
| `failed` | ❌ | Falhou (erro) |

**Progresso:**
- `0%` - Não iniciado
- `1-99%` - Em andamento
- `100%` - Concluído

---

## 🔍 Troubleshooting Rápido

### Problema: Agente não inicia

```bash
# Verificar dependências
pnpm check:dependencies <agentId>

# Se bloqueado, aguardar ou executar dependência manualmente
pnpm audit:agent <dependencyId>
```

### Problema: Execução travada

```bash
# Ver logs para identificar o problema
pnpm logs:agent | tail -50

# Limpar locks que podem estar travando
pnpm locks:clean

# Resetar e re-executar
pnpm reset:agent <agentId>
pnpm audit:agent <agentId>
```

### Problema: Relatório não gerado

```bash
# Gerar manualmente
pnpm report:generate

# Verificar se arquivo foi criado
ls -lh .cursor/reports/FINAL-REPORT.md
```

### Problema: Status inconsistente

```bash
# Resetar tudo e começar de novo
pnpm reset:all
pnpm locks:clean
pnpm audit:full
```

---

## 📁 Estrutura de Diretórios

```
.cursor/
├── scripts/              # Scripts CLI
│   ├── orchestrator.js
│   ├── run-agent.js
│   └── ...
├── agents/               # Diretórios dos agentes
│   ├── 01-design-system/
│   │   ├── STATUS.json
│   │   └── REPORT.md
│   └── ...
├── logs/                 # Logs consolidados
│   └── agents.log
├── locks/                # Locks de concorrência
└── reports/              # Relatórios gerados
    └── FINAL-REPORT.md
```

---

## ⏱️ Tempo Estimado de Execução

- **Grupo 1:** ~40 segundos (simulação)
- **Grupo 2:** ~50 segundos (simulação)
- **Grupo 3:** ~50 segundos (simulação)
- **Sequential:** ~150 segundos (simulação)
- **Total:** ~290 segundos (~5 minutos simulação)

*Nota: Tempos reais variarão conforme complexidade de cada agente.*

---

## 🎓 Dicas Pro

### 1. Monitoramento em Tempo Real

```bash
# Em um terminal separado
watch -n 2 'pnpm -s status:all'

# Ou com logs
tail -f .cursor/logs/agents.log
```

### 2. Execução em Background

```bash
# Executar e deixar rodando
nohup pnpm audit:full > orchestrator.out 2>&1 &

# Monitorar progresso
tail -f orchestrator.out
```

### 3. Notificação ao Concluir

```bash
# Linux/Mac
pnpm audit:full && say "Orquestração concluída"

# Ou com notificação desktop
pnpm audit:full && notify-send "ICARUS" "Orquestração concluída"
```

### 4. Salvar Relatório com Timestamp

```bash
pnpm report:generate
cp .cursor/reports/FINAL-REPORT.md \
   "reports/REPORT-$(date +%Y%m%d-%H%M%S).md"
```

---

## 📞 Referências

- **Documentação Completa:** `ORQUESTRADOR_MESTRE_ICARUS_V5.md`
- **Sumário Executivo:** `SUMARIO_ORQUESTRADOR_COMPLETO.md`
- **Este Guia:** `QUICK_START_ORQUESTRADOR.md`

---

## ✅ Checklist Pré-Deploy

Antes de fazer deploy, certifique-se de:

- [ ] `pnpm audit:full` concluído sem erros
- [ ] `pnpm status:all` mostra todos com status `done`
- [ ] `pnpm issues:critical` retorna 0 críticos
- [ ] `pnpm report:view` mostra score global >= 95/100
- [ ] Testes E2E passando (`pnpm test:e2e`)
- [ ] Build sem erros (`pnpm build`)
- [ ] Linter limpo (`pnpm lint`)
- [ ] Type-check OK (`pnpm type-check`)

Quando todos os itens estiverem ✅:

```bash
pnpm deploy:vercel
```

---

**Versão:** 1.0.0  
**Última Atualização:** 26/10/2025  
**Status:** 🟢 Pronto para Uso

