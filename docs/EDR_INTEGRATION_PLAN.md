# Integração Enterprise Deep Research (EDR) + ICARUS v5.0

## 📋 Visão Geral

Integração do **Enterprise Deep Research (EDR)** da Salesforce no backend ICARUS v5.0, mantendo compatibilidade com GPT-Researcher e Ollama existentes.

### Arquitetura EDR Original

- **Multi-agent system** com Master Planning Agent
- **4 agentes especializados**: General, Academic, GitHub, LinkedIn
- **MCP-based tools**: NL2SQL, file analysis, enterprise workflows
- **Visualization Agent** para insights visuais
- **Reflection mechanism** com human-in-the-loop
- **Real-time steering** para refinamento contínuo

### Adaptação para ICARUS v5.0

```
┌─────────────────────────────────────────────────────┐
│           Frontend React (ICARUS UI)                │
│  /chatbot (GPT-Researcher) │ /edr-research (NEW)   │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────┐
│         Backend API Layer (Supabase Edge)           │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────────┐    │
│  │ GPT-Researcher  │  │  EDR Service (NEW)    │    │
│  │  (Existente)    │  │  - Master Agent       │    │
│  └─────────────────┘  │  - Specialized Agents │    │
│                       │  - Reflection Engine  │    │
│                       └──────────────────────┘    │
└───────────────────┬─────────────────────────────────┘
                    │
┌───────────────────┴─────────────────────────────────┐
│              Storage Layer (Supabase)               │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ PostgreSQL   │  │ Vector Store │               │
│  │ - edr_*      │  │ (pgvector)   │               │
│  │ - agent_*    │  └──────────────┘               │
│  └──────────────┘                                  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Realtime     │  │ Storage      │               │
│  │ (Streaming)  │  │ (Documents)  │               │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Schema de Banco de Dados

### Tabelas EDR no PostgreSQL

```sql
-- ============================================
-- EDR: Research Sessions
-- ============================================
CREATE TABLE edr_research_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),

  -- Research metadata
  query TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, paused
  max_loops INTEGER DEFAULT 10,
  current_loop INTEGER DEFAULT 0,

  -- Configuration
  llm_provider VARCHAR(50) DEFAULT 'openai', -- openai, anthropic, google, groq, sambanova
  llm_model VARCHAR(100),
  search_provider VARCHAR(50) DEFAULT 'tavily',

  -- Steering & control
  steering_enabled BOOLEAN DEFAULT false,
  human_in_loop BOOLEAN DEFAULT false,

  -- Results
  final_report TEXT,
  report_url TEXT,
  visualization_data JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Audit
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index para performance
CREATE INDEX idx_edr_sessions_org ON edr_research_sessions(organization_id);
CREATE INDEX idx_edr_sessions_user ON edr_research_sessions(user_id);
CREATE INDEX idx_edr_sessions_status ON edr_research_sessions(status);
CREATE INDEX idx_edr_sessions_created ON edr_research_sessions(created_at DESC);

-- RLS policies
ALTER TABLE edr_research_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's research sessions"
  ON edr_research_sessions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create research sessions"
  ON edr_research_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- EDR: Agent Tasks (Decomposition)
-- ============================================
CREATE TABLE edr_agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,

  -- Task hierarchy
  parent_task_id UUID REFERENCES edr_agent_tasks(id),
  task_order INTEGER DEFAULT 0,

  -- Task details
  agent_type VARCHAR(50) NOT NULL, -- master, general, academic, github, linkedin, visualization
  task_description TEXT NOT NULL,
  task_query TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, completed, failed, skipped
  priority INTEGER DEFAULT 5,

  -- Results
  result TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  confidence_score DECIMAL(3,2),

  -- Execution
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_edr_tasks_session ON edr_agent_tasks(session_id);
CREATE INDEX idx_edr_tasks_status ON edr_agent_tasks(status);
CREATE INDEX idx_edr_tasks_parent ON edr_agent_tasks(parent_task_id);
CREATE INDEX idx_edr_tasks_agent ON edr_agent_tasks(agent_type);

-- ============================================
-- EDR: Search Results (Cache)
-- ============================================
CREATE TABLE edr_search_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES edr_agent_tasks(id) ON DELETE CASCADE,

  -- Search metadata
  search_type VARCHAR(50), -- general, academic, github, linkedin
  query TEXT NOT NULL,

  -- Results
  url TEXT,
  title TEXT,
  snippet TEXT,
  content TEXT,
  score DECIMAL(3,2),

  -- Source metadata
  source_type VARCHAR(50), -- web, paper, repo, profile
  author TEXT,
  published_date DATE,

  -- Vector embedding for similarity
  embedding vector(1536),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_edr_search_task ON edr_search_results(task_id);
CREATE INDEX idx_edr_search_type ON edr_search_results(search_type);
CREATE INDEX idx_edr_search_embedding ON edr_search_results USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- EDR: Reflection Logs
-- ============================================
CREATE TABLE edr_reflection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,

  -- Reflection metadata
  loop_number INTEGER NOT NULL,
  reflection_type VARCHAR(50), -- gap_detection, quality_assessment, direction_update

  -- Analysis
  knowledge_gaps JSONB DEFAULT '[]'::jsonb,
  quality_score DECIMAL(3,2),
  suggested_actions JSONB DEFAULT '[]'::jsonb,

  -- Human feedback
  human_feedback TEXT,
  human_steering JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_edr_reflection_session ON edr_reflection_logs(session_id);
CREATE INDEX idx_edr_reflection_loop ON edr_reflection_logs(loop_number);

-- ============================================
-- EDR: Steering Commands
-- ============================================
CREATE TABLE edr_steering_commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Command
  command_type VARCHAR(50) NOT NULL, -- pause, resume, refine, expand, focus, stop
  command_text TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, rejected
  applied_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_edr_steering_session ON edr_steering_commands(session_id);
CREATE INDEX idx_edr_steering_status ON edr_steering_commands(status);

-- ============================================
-- EDR: Visualization Data
-- ============================================
CREATE TABLE edr_visualizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES edr_research_sessions(id) ON DELETE CASCADE,

  -- Visualization metadata
  viz_type VARCHAR(50), -- chart, graph, table, network
  title TEXT,
  description TEXT,

  -- Data
  viz_data JSONB NOT NULL,
  viz_config JSONB DEFAULT '{}'::jsonb,

  -- Generated images
  image_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_edr_viz_session ON edr_visualizations(session_id);
CREATE INDEX idx_edr_viz_type ON edr_visualizations(viz_type);
```

---

## 🔧 Serviço de Integração EDR

### Camadas de Abstração

```typescript
// src/lib/edr/types.ts
export interface EDRResearchConfig {
  query: string;
  llmProvider: "openai" | "anthropic" | "google" | "groq" | "sambanova";
  llmModel?: string;
  maxLoops?: number;
  steeringEnabled?: boolean;
  humanInLoop?: boolean;
  searchProvider?: "tavily" | "brave" | "serper";
}

export interface EDRAgentTask {
  id: string;
  agentType:
    | "master"
    | "general"
    | "academic"
    | "github"
    | "linkedin"
    | "visualization";
  query: string;
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
  sources?: any[];
  confidence?: number;
}

export interface EDRResearchSession {
  id: string;
  query: string;
  status: "pending" | "running" | "completed" | "failed" | "paused";
  currentLoop: number;
  maxLoops: number;
  tasks: EDRAgentTask[];
  reflections: EDRReflection[];
  finalReport?: string;
  visualizations?: any[];
}

export interface EDRReflection {
  id: string;
  loopNumber: number;
  knowledgeGaps: string[];
  qualityScore: number;
  suggestedActions: string[];
}
```

---

## 🚀 Próximos Passos

Vou criar os seguintes arquivos:

1. **Schema SQL** completo para Supabase
2. **Serviço EDR** TypeScript
3. **Edge Functions** para orquestração
4. **Página Frontend** EDR Research
5. **Integração** com pipeline existente
6. **Documentação** completa

Deseja que eu continue implementando? Posso começar por:

- ✅ Schema SQL (Migration)
- ✅ Serviço EDR TypeScript
- ✅ Edge Functions
- ✅ Frontend React
- ✅ Documentação

Qual você prefere que eu implemente primeiro?
