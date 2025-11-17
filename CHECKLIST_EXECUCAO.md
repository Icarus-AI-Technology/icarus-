# 📋 Checklist de Execução - Próximos Passos Agentes ICARUS

## ✅ FASE 1 - FUNDAÇÃO (COMPLETA)

- [x] Estrutura de 6 agentes
- [x] 18 scripts executáveis
- [x] Validação topologia IA
- [x] Documentação completa
- [x] Testes aprovados

**Status:** ✅ 100% COMPLETO | **Data:** 27/10/2025

---

## 📋 FASE 2 - INTEGRAÇÃO E AUTOMAÇÃO (0-30 dias)

### Semana 1 (28/10 - 03/11)

#### [ ] Tarefa 2.1: Integração Chatbot - Backend

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 2 dias

- [ ] Executar: `./QUICK_START_PROXIMOS_PASSOS.sh` (opção 1)
- [ ] Criar `src/lib/agents/orchestrator.ts`
- [ ] Implementar roteamento de comandos
- [ ] Testes unitários do orchestrator
- [ ] Documentar API do orchestrator

**Entregável:** Orchestrator funcional que roteia comandos para scripts

**Como testar:**

```typescript
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

const result = await AgentOrchestrator.executeCommand({
  agent: "Tutor",
  action: "diagnosticar",
});
console.log(result); // { success: true, data: {...} }
```

---

#### [ ] Tarefa 2.2: Integração Chatbot - Frontend

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 2 dias

- [ ] Criar `src/components/ChatAgent/AgentSelector.tsx`
- [ ] Implementar autocomplete de agentes (@IA-Validator, @Tutor, etc.)
- [ ] UI para exibir resultado dos agentes
- [ ] Histórico de comandos executados
- [ ] Loading states e error handling

**Entregável:** Interface de chat com seleção de agentes

**Exemplo de uso:**

```tsx
<ChatAgent
  onAgentCommand={(cmd) => AgentOrchestrator.executeCommand(cmd)}
  availableAgents={["IA-Validator", "Tutor", "Contador"]}
/>
```

---

#### [ ] Tarefa 2.3: Testes de Integração Chatbot

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 1 dia

- [ ] Testar comando: `@IA-Validator validar-topologia`
- [ ] Testar comando: `@Tutor classificar-gaps`
- [ ] Testar comando: `@Contador check-fiscal-erp`
- [ ] Testar error handling (comando inválido)
- [ ] Performance test (< 5s por comando)

**Critério de sucesso:** Todos os comandos funcionam via chatbot

---

### Semana 2 (04/11 - 10/11)

#### [ ] Tarefa 2.4: CI/CD - GitHub Actions

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 1 dia

- [ ] Executar: `./QUICK_START_PROXIMOS_PASSOS.sh` (opção 2)
- [ ] Criar `.github/workflows/validate-ia-topology.yml`
- [ ] Configurar secrets no GitHub:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `SUPABASE_FUNCTIONS_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Testar workflow em PR
- [ ] Adicionar badge de status no README

**Entregável:** Pipeline que bloqueia deploys com violações

**Como testar:**

1. Criar branch com localhost em produção
2. Abrir PR
3. Verificar que CI falha
4. Corrigir e verificar que passa

---

#### [ ] Tarefa 2.5: Pre-commit Hooks

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 1 dia

- [ ] Instalar: `pnpm add -D husky lint-staged`
- [ ] Configurar husky: `pnpm exec husky init`
- [ ] Criar `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validar topologia IA antes de commit
node tools/ia/ia-validator.js

# Rodar linter
pnpm lint-staged
```

- [ ] Testar hook localmente
- [ ] Documentar no README

**Entregável:** Hook que previne commits com violações

---

#### [ ] Tarefa 2.6: Build Gates - Vercel

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 1 dia

- [ ] Adicionar no `vercel.json`:

```json
{
  "buildCommand": "node tools/ia/ia-validator.js && pnpm build",
  "env": {
    "NODE_ENV": "production",
    "ENABLE_IA_VALIDATION": "true"
  }
}
```

- [ ] Testar build localmente: `NODE_ENV=production pnpm build`
- [ ] Deploy de teste
- [ ] Verificar logs do Vercel

**Entregável:** Build que falha se violações detectadas

---

### Semana 3 (11/11 - 17/11)

#### [ ] Tarefa 2.7: Dashboard - UI

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 2 dias

- [ ] Executar: `./QUICK_START_PROXIMOS_PASSOS.sh` (opção 4)
- [ ] Criar `src/app/admin/agentes/page.tsx`
- [ ] Cards para cada agente (6 total)
- [ ] Status indicators (active/idle/error)
- [ ] Botão "Executar Agora"
- [ ] Gráficos de métricas (Chart.js ou Recharts)

**Entregável:** Dashboard visual de agentes

**Layout:**

```
┌─────────────────────────────────────────────────┐
│ 🤖 Sistema de Agentes ICARUS                     │
├──────────────┬──────────────┬──────────────┐
│ IA-Validator │ Contador     │ Advogado     │
│ ✅ Active     │ ⏸ Idle       │ ⏸ Idle       │
│ 2 min ago    │ 1 hour ago   │ 3 hours ago  │
│ [Executar]   │ [Executar]   │ [Executar]   │
├──────────────┼──────────────┼──────────────┤
│ Gestão       │ Tutor        │ Status Geral │
│ ✅ Active     │ ✅ Active     │ 📊 Score: 85 │
│ 5 min ago    │ 1 min ago    │ 5/6 ativos   │
│ [Executar]   │ [Executar]   │              │
└──────────────┴──────────────┴──────────────┘
```

---

#### [ ] Tarefa 2.8: Dashboard - API

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 2 dias

- [ ] Criar `src/app/api/agents/status/route.ts`
- [ ] Endpoint GET: retornar status de todos os agentes
- [ ] Endpoint POST: executar agente específico
- [ ] Ler últimos relatórios de `.cursor/agents/*/`
- [ ] Cache com revalidação (5 minutos)

**Entregável:** API REST para status de agentes

**Exemplo de resposta:**

```json
{
  "timestamp": "2025-10-27T14:00:00Z",
  "agents": [
    {
      "name": "IA-Validator",
      "status": "active",
      "lastRun": "2025-10-27T13:58:00Z",
      "lastReport": "/path/to/report.json",
      "metrics": { "violations": 0, "warnings": 2 }
    }
  ]
}
```

---

#### [ ] Tarefa 2.9: WebSocket Real-time

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 1 dia

- [ ] Implementar WebSocket server (Pusher ou Ably)
- [ ] Emitir evento quando agente executado
- [ ] Atualizar dashboard em tempo real
- [ ] Notificações toast para gaps críticos
- [ ] Fallback para polling se WS falhar

**Entregável:** Dashboard com updates em tempo real

---

### Semana 4 (18/11 - 24/11)

#### [ ] Tarefa 2.10: Alertas Automáticos

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 2 dias

- [ ] Integração Slack (webhooks)
- [ ] Integração Email (Resend/SendGrid)
- [ ] Configurar alertas:
  - [ ] Gaps críticos detectados
  - [ ] Violações de topologia IA
  - [ ] Não conformidades fiscais/legais
- [ ] Dashboard de configuração de alertas
- [ ] Testes de notificações

**Entregável:** Sistema de alertas automáticos

---

#### [ ] Tarefa 2.11: Documentação Fase 2

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 1 dia

- [ ] Atualizar README com novo fluxo de chatbot
- [ ] Documentar API de status de agentes
- [ ] Guia de configuração de alertas
- [ ] Screenshots do dashboard
- [ ] Vídeo demo (Loom)

**Entregável:** Documentação atualizada

---

#### [ ] Tarefa 2.12: Review e Deploy Fase 2

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 1 dia

- [ ] Code review completo
- [ ] Testes E2E (Playwright)
- [ ] Deploy em staging
- [ ] Smoke tests em staging
- [ ] Deploy em produção
- [ ] Monitor por 24h

**Entregável:** Fase 2 em produção

---

## 🎓 FASE 3 - TUTORES IA NATIVOS (30-90 dias)

### Semana 5-6 (25/11 - 08/12)

#### [ ] Tarefa 3.1: Edge Function - ai-tutor-financeiro

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 5 dias

- [ ] Executar: `./QUICK_START_PROXIMOS_PASSOS.sh` (opção 3)
- [ ] Criar função: `supabase functions new ai-tutor-financeiro`
- [ ] Implementar lógica:
  - [ ] Integração OpenAI/Anthropic
  - [ ] Contexto: KPIs financeiros, fluxo de caixa
  - [ ] Prompts especializados
  - [ ] Rate limiting
  - [ ] Error handling
- [ ] Testes:
  - [ ] "Qual o status do fluxo de caixa?"
  - [ ] "Como reduzir inadimplência?"
  - [ ] "Explique margem EBITDA"
- [ ] Deploy: `supabase functions deploy ai-tutor-financeiro`
- [ ] Documentação da API

**Entregável:** Tutor financeiro funcional via Edge Function

**Exemplo de uso:**

```bash
curl -X POST \
  https://xyz.supabase.co/functions/v1/ai-tutor-financeiro \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"question": "Como melhorar o fluxo de caixa?"}'
```

---

#### [ ] Tarefa 3.2: Edge Function - ai-tutor-opme

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 5 dias

- [ ] Criar função: `supabase functions new ai-tutor-opme`
- [ ] Contexto: cirurgias, consignação, TISS
- [ ] Conhecimento: ANVISA RDC 786/2023, ANS
- [ ] Testes específicos OPME
- [ ] Deploy e documentação

**Entregável:** Tutor OPME especializado

---

### Semana 7-8 (09/12 - 22/12)

#### [ ] Tarefa 3.3: Edge Function - ai-tutor-compliance

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 5 dias

- [ ] Criar função: `supabase functions new ai-tutor-compliance`
- [ ] Contexto: LGPD, ISO 13485, regulatório
- [ ] Alertas automáticos de mudanças
- [ ] Deploy e documentação

**Entregável:** Tutor de compliance

---

#### [ ] Tarefa 3.4: Edge Function - ai-tutor-fiscal

**Prioridade:** 🔴 CRÍTICA | **Estimativa:** 5 dias

- [ ] Criar função: `supabase functions new ai-tutor-fiscal`
- [ ] Contexto: Lucro Real, SPED
- [ ] Integração com scripts fiscais existentes
- [ ] Deploy e documentação

**Entregável:** Tutor fiscal

---

### Semana 9-10 (23/12 - 05/01)

#### [ ] Tarefa 3.5: Edge Function - ai-tutor-crm

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 5 dias

- [ ] Criar função: `supabase functions new ai-tutor-crm`
- [ ] Contexto: pipeline, clientes
- [ ] Análise preditiva de fechamento
- [ ] Deploy e documentação

**Entregável:** Tutor de vendas/CRM

---

#### [ ] Tarefa 3.6: Edge Function - ml-predicao-demanda

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 5 dias

- [ ] Criar função: `supabase functions new ml-predicao-demanda`
- [ ] Modelo: ARIMA ou Prophet
- [ ] Treinar com dados históricos
- [ ] API de previsão 30/60/90 dias
- [ ] Deploy e documentação

**Entregável:** Modelo de previsão de demanda

---

### Semana 11-12 (06/01 - 19/01)

#### [ ] Tarefa 3.7: Interface de Tutores

**Prioridade:** 🟡 MÉDIA | **Estimativa:** 7 dias

- [ ] Criar `src/components/AiTutor/TutorChat.tsx`
- [ ] Botão flutuante em cada módulo
- [ ] Contexto automático (módulo atual)
- [ ] Biblioteca de 20+ prompts pré-definidos
- [ ] Sistema de feedback (útil/não útil)
- [ ] Histórico de conversas

**Entregável:** UI unificada para todos os tutores

---

## 📊 Métricas de Progresso

### Fase 2 (0-30 dias)

```
Progress: [░░░░░░░░░░░░░░░░░░░░] 0/12 tarefas (0%)

Bloqueadores:
  - Nenhum (pode começar hoje)

Dependências:
  - Nenhuma (todas as tarefas da Fase 1 completas)
```

### Fase 3 (30-90 dias)

```
Progress: [░░░░░░░░░░░░░░░░░░░░] 0/7 tarefas (0%)

Bloqueadores:
  - Aguardando conclusão Fase 2

Dependências:
  - Tarefa 2.11 (API de status) para integração
```

---

## 🎯 KPIs por Fase

### Fase 2

- [ ] Chatbot integrando 100% dos agentes
- [ ] CI/CD bloqueando 100% das violações
- [ ] Dashboard atualizado < 5s
- [ ] Zero downtime no deploy

### Fase 3

- [ ] 6 Edge Functions deployadas
- [ ] Tempo de resposta < 2s
- [ ] 95% de satisfação (feedback)
- [ ] 100+ conversas por dia

---

## 📞 Suporte

**Dúvidas sobre tarefas:**

- Criar issue no GitHub com label `próximos-passos`
- Canal Slack: `#agentes-icarus-dev`

**Bloqueio técnico:**

- Escalar para tech lead
- Documentar no issue

**Review de código:**

- Solicitar review antes de merge
- Mínimo 1 aprovação necessária

---

**Última Atualização:** 27/10/2025  
**Versão:** 1.0  
**Próxima Review:** 03/11/2025 (fim da Semana 1)

---

🚀 **Comece pela Tarefa 2.1 hoje mesmo!**
