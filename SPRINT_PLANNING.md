# 🎯 Sprint Planning - Agentes ICARUS

## 📅 Sprint 1: Integração Chatbot (28/10 - 03/11)

### 🎯 Objetivo do Sprint

Integrar sistema de agentes com o chatbot existente, permitindo execução de comandos via interface.

### 📊 Meta

- ✅ Orchestrator implementado e testado
- ✅ UI de chat com seleção de agentes
- ✅ 3+ comandos funcionando via chatbot

---

## 👥 Time Alocado

| Papel            | Nome | Dedicação | Responsabilidades       |
| ---------------- | ---- | --------- | ----------------------- |
| **Backend Dev**  | TBD  | 100%      | Orchestrator + API      |
| **Frontend Dev** | TBD  | 100%      | UI do chat + integração |
| **QA Engineer**  | TBD  | 50%       | Testes de integração    |
| **Tech Lead**    | TBD  | 25%       | Reviews + desbloqueio   |

---

## 📋 Backlog do Sprint

### 🔴 Prioridade Alta (Must Have)

#### Story 1: Orchestrator de Agentes

**Como** desenvolvedor  
**Quero** um orchestrator que roteia comandos  
**Para** executar agentes via chatbot

**Critérios de Aceitação:**

- [ ] Classe `AgentOrchestrator` implementada
- [ ] Método `executeCommand(cmd)` funcional
- [ ] Suporta todos os 6 agentes
- [ ] Retorna resultado em < 30s
- [ ] Error handling robusto
- [ ] 100% cobertura de testes

**Pontos:** 8  
**Assignee:** Backend Dev  
**Tarefas:**

- [ ] Criar `src/lib/agents/orchestrator.ts`
- [ ] Implementar roteamento de comandos
- [ ] Escrever testes unitários
- [ ] Documentar API

---

#### Story 2: UI de Seleção de Agentes

**Como** usuário  
**Quero** selecionar agentes no chat  
**Para** executar comandos específicos

**Critérios de Aceitação:**

- [ ] Autocomplete com @ (ex: @IA-Validator)
- [ ] Lista todos os 6 agentes
- [ ] Mostra comandos disponíveis por agente
- [ ] Loading state durante execução
- [ ] Exibe resultado formatado
- [ ] Error handling com mensagem clara

**Pontos:** 8  
**Assignee:** Frontend Dev  
**Tarefas:**

- [ ] Criar `AgentSelector.tsx`
- [ ] Implementar autocomplete
- [ ] Integrar com orchestrator
- [ ] Styled components

---

#### Story 3: Comandos via Chatbot

**Como** usuário  
**Quero** executar comandos de agentes  
**Para** obter informações rapidamente

**Critérios de Aceitação:**

- [ ] Comando: `@IA-Validator validar-topologia`
- [ ] Comando: `@Tutor diagnosticar`
- [ ] Comando: `@Contador check-fiscal-erp`
- [ ] Resultado exibido em < 5s
- [ ] Formatação legível
- [ ] Possível copiar resultado

**Pontos:** 5  
**Assignee:** Frontend Dev + Backend Dev  
**Tarefas:**

- [ ] Implementar 3 comandos principais
- [ ] Testes E2E
- [ ] Documentação de uso

---

### 🟡 Prioridade Média (Should Have)

#### Story 4: Histórico de Comandos

**Como** usuário  
**Quero** ver histórico de comandos executados  
**Para** consultar resultados anteriores

**Critérios de Aceitação:**

- [ ] Persiste últimos 50 comandos
- [ ] Exibe timestamp de execução
- [ ] Permite re-executar comando
- [ ] Filtro por agente
- [ ] Export para JSON

**Pontos:** 5  
**Assignee:** Frontend Dev

---

#### Story 5: Help System

**Como** usuário  
**Quero** ver ajuda sobre comandos disponíveis  
**Para** saber o que posso fazer

**Critérios de Aceitação:**

- [ ] Comando: `@help`
- [ ] Lista todos os agentes
- [ ] Lista comandos por agente
- [ ] Exemplos de uso
- [ ] Link para documentação

**Pontos:** 3  
**Assignee:** Frontend Dev

---

### 🟢 Prioridade Baixa (Nice to Have)

#### Story 6: Atalhos de Teclado

**Como** power user  
**Quero** atalhos de teclado  
**Para** executar comandos mais rápido

**Pontos:** 3  
**Assignee:** Frontend Dev

---

## 📈 Velocity & Capacity

### Capacity

- **Backend:** 40 horas (5 dias × 8h)
- **Frontend:** 40 horas (5 dias × 8h)
- **QA:** 20 horas (5 dias × 4h)
- **Total:** 100 horas

### Velocity Estimada

- Sprint Points: 29
- Velocity Target: 25-30 points
- Status: ✅ Dentro da capacidade

---

## 📅 Daily Standup Schedule

**Horário:** 9:00 AM  
**Duração:** 15 min  
**Formato:**

1. O que fiz ontem?
2. O que farei hoje?
3. Algum bloqueio?

---

## 🧪 Definition of Done

### Para Stories

- [ ] Código implementado e funcionando
- [ ] Testes unitários (cobertura > 80%)
- [ ] Testes E2E (casos principais)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Deploy em staging
- [ ] QA aprovado
- [ ] Demo para stakeholders

### Para o Sprint

- [ ] Todas as stories "Must Have" completas
- [ ] Zero bugs críticos abertos
- [ ] Documentação atualizada
- [ ] Deploy em produção
- [ ] Retrospectiva realizada

---

## 🎬 Cerimônias do Sprint

### Sprint Planning

**Data:** 28/10 (Segunda) 9:00  
**Duração:** 2h  
**Participantes:** Todo o time  
**Objetivo:** Planejar e estimar stories

### Daily Standups

**Datas:** 29/10 - 01/11 (9:00 AM)  
**Duração:** 15 min  
**Objetivo:** Sincronizar progresso

### Sprint Review

**Data:** 03/11 (Sexta) 14:00  
**Duração:** 1h  
**Participantes:** Time + Stakeholders  
**Objetivo:** Demo das features

### Sprint Retrospective

**Data:** 03/11 (Sexta) 15:30  
**Duração:** 1h  
**Participantes:** Time  
**Objetivo:** Melhoria contínua

---

## 🚧 Riscos Identificados

| Risco                         | Probabilidade | Impacto | Mitigação                    |
| ----------------------------- | ------------- | ------- | ---------------------------- |
| Complexidade do orchestrator  | Média         | Alto    | Pair programming + prototype |
| Integração com chat existente | Alta          | Médio   | Spike técnico dia 1          |
| Performance dos scripts       | Baixa         | Médio   | Cache + timeout              |
| Disponibilidade do time       | Baixa         | Alto    | Buffer de 20% no planning    |

---

## 📊 Sprint Burndown Chart

```
Story Points Remaining

30 │ ●
25 │   ●
20 │     ●
15 │       ●
10 │         ●
 5 │           ●
 0 │_____________●___
   28  29  30  31  1   2   3
   Out ────────── Nov ──────

   ● Ideal
   ○ Atual (atualizar diariamente)
```

---

## 🎯 Sprint Goals (SMART)

1. **Specific:** Integrar sistema de agentes com chatbot
2. **Measurable:** 3 comandos funcionando via @ mention
3. **Achievable:** Com 100h de capacidade do time
4. **Relevant:** Habilita uso dos agentes para todos
5. **Time-bound:** Até 03/11/2025

---

## 📝 Sprint Retrospective Template

### O que funcionou bem? 🎉

### O que pode melhorar? 🔧

### Action Items 🎯

---

## 📞 Contatos do Sprint

| Papel         | Nome | Slack | Email           |
| ------------- | ---- | ----- | --------------- |
| Product Owner | TBD  | @po   | po@icarus.com   |
| Scrum Master  | TBD  | @sm   | sm@icarus.com   |
| Tech Lead     | TBD  | @tech | tech@icarus.com |

---

**Sprint Criado:** 27/10/2025  
**Sprint Start:** 28/10/2025  
**Sprint End:** 03/11/2025  
**Sprint Duration:** 5 dias úteis

🚀 **Let's ship it!**
