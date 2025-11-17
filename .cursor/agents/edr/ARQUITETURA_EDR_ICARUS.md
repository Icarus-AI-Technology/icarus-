# 🚀 ENTERPRISE DEEP RESEARCH (EDR) - ARQUITETURA ICARUS V5.0

## 📊 Visão Geral

Sistema multiagente avançado para pesquisa profunda empresarial integrado às IAs nativas do Icarus.

---

## 🏗️ ARQUITETURA DO SISTEMA

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ENTERPRISE DEEP RESEARCH (EDR)                  │
│                         Sistema Multiagente                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    🧠 AGENTE DE PLANEJAMENTO MESTRE                 │
│                                                                     │
│  • Decomposição de consulta adaptável                              │
│  • Orquestração de agentes especializados                          │
│  • Gestão de fluxo de trabalho                                     │
│  • Priorização de tarefas                                          │
│                                                                     │
│  IA: Ollama (llama3.1:8b) + Claude 3.5 Sonnet                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────────────────────────────────────────────────────┐
│            🔍 CAMADA DE AGENTES DE PESQUISA ESPECIALIZADOS            │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────────┐   │
│  │ 🌐 AGENTE       │  │ 📚 AGENTE       │  │ 💻 AGENTE        │   │
│  │ GERAL           │  │ ACADÊMICO       │  │ GITHUB           │   │
│  │                 │  │                 │  │                  │   │
│  │ • Web scraping  │  │ • ArXiv         │  │ • Repo analysis  │   │
│  │ • APIs públicas │  │ • PubMed        │  │ • Code search    │   │
│  │ • News feeds    │  │ • IEEE Xplore   │  │ • Issue tracking │   │
│  │ • Social media  │  │ • Google Scholar│  │ • PR analysis    │   │
│  │                 │  │                 │  │                  │   │
│  │ IA: Meilisearch │  │ IA: Ollama      │  │ IA: Ollama       │   │
│  └─────────────────┘  └─────────────────┘  └──────────────────┘   │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │ 👔 AGENTE       │  │ 🗄️ AGENTE        │                          │
│  │ LINKEDIN        │  │ DATABASE         │                          │
│  │                 │  │                 │                          │
│  │ • Profile scan  │  │ • NL2SQL        │                          │
│  │ • Company data  │  │ • Query exec    │                          │
│  │ • Job postings  │  │ • Data analysis │                          │
│  │ • Network graph │  │ • ETL processes │                          │
│  │                 │  │                 │                          │
│  │ IA: Web scraping│  │ IA: Supabase    │                          │
│  └─────────────────┘  └─────────────────┘                          │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│              🛠️ ECOSSISTEMA DE FERRAMENTAS MCP                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💾 NL2SQL Engine                                            │   │
│  │ • Natural language to SQL translation                       │   │
│  │ • Query optimization                                        │   │
│  │ • Schema introspection                                      │   │
│  │ • Result formatting                                         │   │
│  │ Backend: Supabase + Ollama                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 File Analysis Engine                                     │   │
│  │ • PDF parsing                                               │   │
│  │ • OCR (Tesseract.js)                                        │   │
│  │ • Document classification                                   │   │
│  │ • Metadata extraction                                       │   │
│  │ Backend: Tesseract.js + Ollama                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔄 Workflow Automation                                      │   │
│  │ • Task scheduling                                           │   │
│  │ • Event triggers                                            │   │
│  │ • Integration hooks                                         │   │
│  │ • Notification system                                       │   │
│  │ Backend: Supabase Edge Functions                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│                   📊 AGENTE DE VISUALIZAÇÃO                           │
│                                                                       │
│  • Geração de gráficos e dashboards                                  │
│  • Análise de tendências                                             │
│  • Relatórios interativos                                            │
│  • Export para múltiplos formatos                                    │
│                                                                       │
│  Stack: React + D3.js + Recharts + PostHog                           │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│              🔄 MECANISMO DE REFLEXÃO E FEEDBACK                      │
│                                                                       │
│  • Detecção de lacunas de conhecimento                               │
│  • Atualização dinâmica de direção                                   │
│  • Orientação humana opcional (Human-in-the-loop)                    │
│  • Aprendizado contínuo                                              │
│  • Quality scoring                                                   │
│                                                                       │
│  IA: Ollama + Claude 3.5 Sonnet                                      │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│           ⚡ COMANDOS DE DIREÇÃO EM TEMPO REAL                        │
│                                                                       │
│  • WebSocket para comunicação real-time                              │
│  • Refinamento contínuo de pesquisa                                  │
│  • Ajuste de prioridades                                             │
│  • Interrupção e redirecionamento                                    │
│                                                                       │
│  Backend: Supabase Realtime + WebSockets                             │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 INTEGRAÇÃO COM IAs NATIVAS ICARUS

### 1. 🦙 Ollama (LLM Local)

**Uso no EDR:**

- Agente de Planejamento Mestre
- Agente Acadêmico
- Agente GitHub
- Agente Database (NL2SQL)
- Mecanismo de Reflexão

**Configuração:**

```typescript
// src/lib/edr/agents/master-planner.ts
import { Ollama } from "ollama";

const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
});

export async function decomposeQuery(query: string) {
  const response = await ollama.generate({
    model: "llama3.1:8b",
    prompt: `Decomponha a seguinte consulta de pesquisa em subtarefas:
    
    Consulta: ${query}
    
    Retorne um plano estruturado com:
    1. Objetivo principal
    2. Subtarefas
    3. Agentes necessários
    4. Ordem de execução`,
    stream: false,
  });

  return parseResearchPlan(response.response);
}
```

### 2. 🗄️ Supabase (Database + Edge Functions)

**Uso no EDR:**

- Agente Database (NL2SQL)
- Armazenamento de resultados
- Workflow automation
- Comandos em tempo real (Realtime)

**Schema EDR:**

```sql
-- Research Sessions
CREATE TABLE edr_research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  status TEXT NOT NULL, -- 'planning', 'researching', 'analyzing', 'completed'
  master_plan JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Research Results
CREATE TABLE edr_research_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id),
  agent_type TEXT NOT NULL, -- 'general', 'academic', 'github', 'linkedin', 'database'
  data JSONB NOT NULL,
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Gaps
CREATE TABLE edr_knowledge_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id),
  gap_description TEXT NOT NULL,
  suggested_actions JSONB,
  status TEXT DEFAULT 'open', -- 'open', 'addressing', 'resolved'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Human Feedback
CREATE TABLE edr_human_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id),
  feedback_type TEXT NOT NULL, -- 'redirect', 'refine', 'approve', 'reject'
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE edr_research_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE edr_human_feedback;
```

**NL2SQL Engine:**

```typescript
// src/lib/edr/tools/nl2sql.ts
import { createClient } from "@supabase/supabase-js";
import { Ollama } from "ollama";

export async function naturalLanguageToSQL(query: string) {
  const ollama = new Ollama({ baseUrl: "http://localhost:11434" });

  // Get schema context
  const schema = await getSchemaContext();

  // Generate SQL
  const response = await ollama.generate({
    model: "llama3.1:8b",
    prompt: `Traduza a seguinte consulta em SQL:
    
    Consulta: ${query}
    
    Schema disponível:
    ${schema}
    
    Retorne apenas a query SQL válida.`,
    stream: false,
  });

  const sql = extractSQL(response.response);

  // Execute and return results
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.rpc("execute_dynamic_query", {
    query: sql,
  });

  return { data, error, sql };
}
```

### 3. 👁️ Tesseract.js (OCR)

**Uso no EDR:**

- File Analysis Engine
- PDF parsing
- Document classification

**Configuração:**

```typescript
// src/lib/edr/tools/file-analysis.ts
import { createWorker } from "tesseract.js";

export async function analyzeDocument(file: File) {
  const worker = await createWorker();

  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const {
    data: { text },
  } = await worker.recognize(file);
  await worker.terminate();

  // Analyze with Ollama
  const ollama = new Ollama({ baseUrl: "http://localhost:11434" });
  const analysis = await ollama.generate({
    model: "llama3.1:8b",
    prompt: `Analise o seguinte documento e extraia:
    1. Tópico principal
    2. Palavras-chave
    3. Entidades mencionadas
    4. Resumo
    
    Documento:
    ${text}`,
    stream: false,
  });

  return {
    text,
    analysis: JSON.parse(analysis.response),
  };
}
```

### 4. 🔍 Meilisearch (Search Engine)

**Uso no EDR:**

- Agente Geral (indexação e busca)
- Busca semântica
- Ranking de resultados

**Configuração:**

```typescript
// src/lib/edr/agents/general-research.ts
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: "http://localhost:7700",
  apiKey: "MASTER_KEY_DEV_ICARUS",
});

export async function searchWeb(query: string) {
  // Index external data
  await indexWebResults(query);

  // Search with Meilisearch
  const results = await client.index("web_research").search(query, {
    limit: 20,
    attributesToRetrieve: ["title", "url", "snippet", "relevance"],
    sort: ["relevance:desc"],
  });

  return results.hits;
}
```

### 5. 📊 PostHog (Analytics)

**Uso no EDR:**

- Tracking de sessões de pesquisa
- Métricas de performance
- User behavior analysis
- A/B testing de agentes

**Configuração:**

```typescript
// src/lib/edr/analytics.ts
import posthog from "posthog-js";

export function trackResearchSession(session: ResearchSession) {
  posthog.capture("research_session_started", {
    session_id: session.id,
    query: session.query,
    agents_used: session.agents,
    timestamp: new Date(),
  });
}

export function trackAgentPerformance(agent: string, metrics: Metrics) {
  posthog.capture("agent_performance", {
    agent_type: agent,
    response_time: metrics.responseTime,
    confidence_score: metrics.confidence,
    results_count: metrics.resultsCount,
  });
}
```

---

## 🔧 IMPLEMENTAÇÃO PRÁTICA

### Estrutura de Diretórios

```
src/lib/edr/
├── agents/
│   ├── master-planner.ts      # Agente de planejamento
│   ├── general-research.ts    # Agente geral
│   ├── academic-research.ts   # Agente acadêmico
│   ├── github-research.ts     # Agente GitHub
│   ├── linkedin-research.ts   # Agente LinkedIn
│   └── database-agent.ts      # Agente database (NL2SQL)
├── tools/
│   ├── nl2sql.ts             # Natural Language to SQL
│   ├── file-analysis.ts      # Análise de arquivos
│   ├── workflow.ts           # Automação de workflows
│   └── mcp-connector.ts      # Conector MCP
├── visualization/
│   ├── charts.ts             # Geração de gráficos
│   ├── dashboard.ts          # Dashboard interativo
│   └── export.ts             # Export de relatórios
├── reflection/
│   ├── gap-detector.ts       # Detector de lacunas
│   ├── feedback-loop.ts      # Loop de feedback
│   └── quality-scorer.ts     # Avaliação de qualidade
├── realtime/
│   ├── websocket.ts          # WebSocket server
│   ├── commands.ts           # Comandos em tempo real
│   └── state-sync.ts         # Sincronização de estado
└── orchestrator.ts           # Orquestrador principal
```

### Componentes React

```
src/components/edr/
├── ResearchInterface.tsx      # Interface principal
├── MasterPlanViewer.tsx      # Visualização do plano
├── AgentMonitor.tsx          # Monitor de agentes
├── ResultsPanel.tsx          # Painel de resultados
├── KnowledgeGapsPanel.tsx    # Painel de lacunas
├── VisualizationPanel.tsx    # Painel de visualização
├── FeedbackControls.tsx      # Controles de feedback
└── RealtimeCommands.tsx      # Comandos em tempo real
```

---

## 📊 FLUXO DE TRABALHO EDR

### 1. Inicialização

```typescript
// src/lib/edr/orchestrator.ts
export class EDROrchestrator {
  async startResearch(query: string) {
    // 1. Criar sessão
    const session = await this.createSession(query);

    // 2. Planejamento mestre
    const plan = await this.masterPlanner.decompose(query);

    // 3. Atribuir agentes
    const agents = this.assignAgents(plan);

    // 4. Executar pesquisa paralela
    const results = await Promise.all(agents.map((agent) => agent.research()));

    // 5. Detectar lacunas
    const gaps = await this.reflectionEngine.detectGaps(results);

    // 6. Iterar se necessário
    if (gaps.length > 0) {
      await this.addressGaps(gaps);
    }

    // 7. Gerar visualizações
    const visualizations = await this.visualizationAgent.create(results);

    // 8. Retornar relatório
    return {
      session,
      plan,
      results,
      gaps,
      visualizations,
    };
  }
}
```

### 2. Pesquisa Paralela

```typescript
// Execução paralela de agentes
const [generalResults, academicResults, githubResults, linkedinResults] =
  await Promise.all([
    generalAgent.research(query),
    academicAgent.research(query),
    githubAgent.research(query),
    linkedinAgent.research(query),
  ]);
```

### 3. Reflexão e Feedback

```typescript
// Detecção de lacunas
const gaps = await reflectionEngine.analyze({
  query,
  results: allResults,
  coverage: calculateCoverage(allResults),
});

// Solicitar feedback humano se necessário
if (gaps.some((g) => g.severity === "high")) {
  await requestHumanGuidance(gaps);
}
```

### 4. Comandos em Tempo Real

```typescript
// WebSocket para comandos
const ws = new WebSocket("ws://localhost:3000/edr/commands");

ws.on("message", async (command) => {
  switch (command.type) {
    case "redirect":
      await orchestrator.redirectResearch(command.newQuery);
      break;
    case "refine":
      await orchestrator.refineScope(command.refinements);
      break;
    case "stop":
      await orchestrator.stopResearch();
      break;
  }
});
```

---

## 🚀 PRÓXIMOS PASSOS DE IMPLEMENTAÇÃO

### Fase 1: Fundação (Semana 1-2)

- [ ] Criar schema Supabase EDR
- [ ] Implementar Agente de Planejamento Mestre
- [ ] Configurar MCP connectors
- [ ] Setup WebSocket server

### Fase 2: Agentes Especializados (Semana 3-4)

- [ ] Implementar Agente Geral (Meilisearch)
- [ ] Implementar Agente Acadêmico (Ollama)
- [ ] Implementar Agente GitHub
- [ ] Implementar Agente LinkedIn
- [ ] Implementar Agente Database (NL2SQL)

### Fase 3: Ferramentas MCP (Semana 5-6)

- [ ] NL2SQL Engine
- [ ] File Analysis Engine (Tesseract.js)
- [ ] Workflow Automation

### Fase 4: Visualização (Semana 7)

- [ ] Agente de Visualização
- [ ] Dashboard interativo
- [ ] Export de relatórios

### Fase 5: Reflexão e Feedback (Semana 8)

- [ ] Mecanismo de Reflexão
- [ ] Detector de lacunas
- [ ] Human-in-the-loop integration

### Fase 6: Tempo Real (Semana 9)

- [ ] Comandos em tempo real
- [ ] State synchronization
- [ ] WebSocket polish

### Fase 7: Testes e Otimização (Semana 10)

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Performance optimization
- [ ] Documentation

---

## 📝 EXEMPLO DE USO

```typescript
// Iniciar pesquisa profunda
const edr = new EDROrchestrator({
  ollama: { baseUrl: "http://localhost:11434" },
  supabase: { url: SUPABASE_URL, key: SUPABASE_KEY },
  meilisearch: { host: "http://localhost:7700" },
});

// Query de pesquisa
const result = await edr.startResearch(
  "Análise completa das tendências de IA em 2025",
);

// Monitorar progresso em tempo real
edr.on("progress", (update) => {
  console.log(`${update.agent}: ${update.status}`);
});

// Fornecer feedback humano
edr.on("gap_detected", async (gap) => {
  const guidance = await promptUser(gap);
  edr.provideGuidance(guidance);
});

// Obter resultados finais
const { masterPlan, results, visualizations, report } = await result;
```

---

## 💡 BENEFÍCIOS DA INTEGRAÇÃO

1. **LLM Local (Ollama)** - Sem custos de API, privacidade garantida
2. **Supabase** - Database robusto, edge functions, realtime
3. **Meilisearch** - Busca ultrarrápida e relevante
4. **Tesseract.js** - OCR sem custos externos
5. **PostHog** - Analytics detalhado

## 🎯 RESULTADO ESPERADO

Sistema de pesquisa empresarial de nível mundial rodando 100% on-premise/cloud controlado, sem dependências de APIs pagas, com todas as IAs integradas do Icarus.

---

**Status:** 🟡 Pronto para Implementação  
**Complexidade:** Alta  
**Tempo Estimado:** 10 semanas  
**Dependências:** Todas as IAs do Icarus já configuradas ✅
