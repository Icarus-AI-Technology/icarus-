#!/bin/bash
# AUTOMATION - Criador de Issues GitHub para Próximos Passos
# Cria issues automaticamente no GitHub baseado no checklist

echo "🤖 Criando issues no GitHub para Próximos Passos..."
echo ""

# Verifica se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) não instalado"
    echo "   Instale com: brew install gh"
    echo "   Depois execute: gh auth login"
    exit 1
fi

# Verifica autenticação
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI não autenticado"
    echo "   Execute: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configurado"
echo ""

# Função para criar issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    local milestone="$4"
    local assignee="$5"
    
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        ${milestone:+--milestone "$milestone"} \
        ${assignee:+--assignee "$assignee"}
}

# Criar milestone
echo "📅 Criando milestones..."
gh api repos/:owner/:repo/milestones -f title="Fase 2 - Integração" -f due_on="2025-11-24T23:59:59Z" 2>/dev/null || echo "  Milestone já existe"
gh api repos/:owner/:repo/milestones -f title="Fase 3 - Tutores IA" -f due_on="2026-01-19T23:59:59Z" 2>/dev/null || echo "  Milestone já existe"

# Criar labels
echo ""
echo "🏷️  Criando labels..."
gh label create "agentes" --description "Sistema de Agentes ICARUS" --color "0075ca" 2>/dev/null || true
gh label create "fase-2" --description "Fase 2 - Integração" --color "d4c5f9" 2>/dev/null || true
gh label create "fase-3" --description "Fase 3 - Tutores IA" --color "c5def5" 2>/dev/null || true
gh label create "prioridade:critica" --description "Prioridade crítica" --color "d73a4a" 2>/dev/null || true
gh label create "prioridade:media" --description "Prioridade média" --color "fbca04" 2>/dev/null || true
gh label create "prioridade:baixa" --description "Prioridade baixa" --color "0e8a16" 2>/dev/null || true

echo ""
echo "📋 Criando issues para Fase 2..."

# Issue 1: Integração Chatbot - Backend
create_issue \
    "[Fase 2.1] Integração Chatbot - Backend (Orchestrator)" \
    "## Objetivo
Implementar orchestrator que roteia comandos do chatbot para os scripts de agentes.

## Tarefas
- [ ] Criar \`src/lib/agents/orchestrator.ts\`
- [ ] Implementar \`AgentOrchestrator.executeCommand()\`
- [ ] Suportar todos os 6 agentes
- [ ] Testes unitários (cobertura > 80%)
- [ ] Documentação da API

## Critérios de Aceitação
- [x] Todos os 6 agentes roteados corretamente
- [x] Retorna resultado em < 30s
- [x] Error handling robusto
- [x] 100% cobertura de testes

## Como Testar
\`\`\`typescript
import { AgentOrchestrator } from '@/lib/agents/orchestrator';

const result = await AgentOrchestrator.executeCommand({
  agent: 'Tutor',
  action: 'diagnosticar'
});
console.log(result); // { success: true, data: {...} }
\`\`\`

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 2.1)
- Quick Start: ./QUICK_START_PROXIMOS_PASSOS.sh (opção 1)

## Estimativa
2 dias (16 horas)" \
    "agentes,fase-2,prioridade:critica,backend" \
    "Fase 2 - Integração" \
    ""

# Issue 2: Integração Chatbot - Frontend
create_issue \
    "[Fase 2.2] Integração Chatbot - Frontend (UI)" \
    "## Objetivo
Criar interface de chat com seleção de agentes via @ mention.

## Tarefas
- [ ] Criar \`src/components/ChatAgent/AgentSelector.tsx\`
- [ ] Implementar autocomplete com @
- [ ] UI para exibir resultado dos agentes
- [ ] Loading states e error handling
- [ ] Histórico de comandos executados

## Critérios de Aceitação
- [x] Autocomplete funciona com @IA-Validator, @Tutor, etc.
- [x] Exibe resultado formatado
- [x] Loading state durante execução
- [x] Error handling com mensagem clara

## Design
\`\`\`
┌─────────────────────────────────────────┐
│ Chat com Agentes ICARUS                 │
├─────────────────────────────────────────┤
│ > @IA-Validator validar-topologia       │
│                                         │
│ 🤖 IA-Validator executando...          │
│                                         │
│ ✅ Topologia IA válida                  │
│ • Ollama: ok                            │
│ • Supabase: ok                          │
│ • Meilisearch: ok                       │
└─────────────────────────────────────────┘
\`\`\`

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 2.2)

## Estimativa
2 dias (16 horas)" \
    "agentes,fase-2,prioridade:critica,frontend" \
    "Fase 2 - Integração" \
    ""

# Issue 3: CI/CD GitHub Actions
create_issue \
    "[Fase 2.4] CI/CD - GitHub Actions" \
    "## Objetivo
Configurar pipeline que valida topologia IA e bloqueia deploys com violações.

## Tarefas
- [ ] Criar \`.github/workflows/validate-ia-topology.yml\`
- [ ] Configurar secrets no GitHub
- [ ] Testar workflow em PR
- [ ] Adicionar badge de status no README

## Workflow
\`\`\`yaml
name: Validar Topologia IA
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validar IA
        run: node tools/ia/ia-validator.js
\`\`\`

## Secrets Necessários
- \`VITE_SUPABASE_URL\`
- \`SUPABASE_FUNCTIONS_URL\`

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 2.4)
- Quick Start: ./QUICK_START_PROXIMOS_PASSOS.sh (opção 2)

## Estimativa
1 dia (8 horas)" \
    "agentes,fase-2,prioridade:critica,devops" \
    "Fase 2 - Integração" \
    ""

# Issue 4: Dashboard de Agentes
create_issue \
    "[Fase 2.7] Dashboard de Monitoramento" \
    "## Objetivo
Criar dashboard visual para monitorar status e executar agentes.

## Tarefas
- [ ] Criar \`src/app/admin/agentes/page.tsx\`
- [ ] Cards para cada agente (6 total)
- [ ] Status indicators (active/idle/error)
- [ ] Botão \"Executar Agora\"
- [ ] Gráficos de métricas

## Layout
Cards responsivos mostrando:
- Nome do agente
- Status atual (active/idle/error)
- Última execução
- Botão de ação

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 2.7)
- Quick Start: ./QUICK_START_PROXIMOS_PASSOS.sh (opção 4)

## Estimativa
2 dias (16 horas)" \
    "agentes,fase-2,prioridade:media,frontend" \
    "Fase 2 - Integração" \
    ""

echo ""
echo "📋 Criando issues para Fase 3..."

# Issue 5: Edge Function - Tutor Financeiro
create_issue \
    "[Fase 3.1] Edge Function - ai-tutor-financeiro" \
    "## Objetivo
Criar primeira Edge Function de IA para tutor financeiro.

## Tarefas
- [ ] \`supabase functions new ai-tutor-financeiro\`
- [ ] Implementar lógica com OpenAI/Anthropic
- [ ] Contexto: KPIs financeiros, fluxo de caixa
- [ ] Rate limiting e error handling
- [ ] Testes de integração
- [ ] Deploy: \`supabase functions deploy ai-tutor-financeiro\`

## Contexto da IA
\`\`\`
Você é um tutor especializado em gestão financeira de ERPs OPME.
Conhecimento:
- Lucro Real e Presumido
- Fluxo de caixa
- KPIs financeiros (margem bruta, EBITDA)
- Faturamento OPME
\`\`\`

## Testes
- \"Qual o status do fluxo de caixa?\"
- \"Como reduzir inadimplência?\"
- \"Explique margem EBITDA\"

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 3.1)
- Quick Start: ./QUICK_START_PROXIMOS_PASSOS.sh (opção 3)

## Estimativa
5 dias (40 horas)" \
    "agentes,fase-3,prioridade:critica,backend,ia" \
    "Fase 3 - Tutores IA" \
    ""

# Issue 6: Edge Function - Tutor OPME
create_issue \
    "[Fase 3.2] Edge Function - ai-tutor-opme" \
    "## Objetivo
Criar tutor IA especializado em gestão OPME.

## Tarefas
- [ ] \`supabase functions new ai-tutor-opme\`
- [ ] Contexto: cirurgias, consignação, TISS
- [ ] Conhecimento: ANVISA RDC 786/2023, ANS
- [ ] Testes específicos OPME
- [ ] Deploy e documentação

## Conhecimento Específico
- Rastreabilidade ANVISA
- Padrão TISS 4.1
- Gestão de consignação
- Faturamento cirúrgico

## Referências
- Checklist: CHECKLIST_EXECUCAO.md (Tarefa 3.2)

## Estimativa
5 dias (40 horas)" \
    "agentes,fase-3,prioridade:critica,backend,ia" \
    "Fase 3 - Tutores IA" \
    ""

echo ""
echo "✅ Issues criadas com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revisar issues no GitHub"
echo "   2. Atribuir responsáveis"
echo "   3. Ajustar estimativas se necessário"
echo "   4. Começar Sprint Planning"
echo ""
echo "🔗 Ver issues: gh issue list --label agentes"
echo ""

