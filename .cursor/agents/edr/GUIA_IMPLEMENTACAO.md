# 🚀 GUIA DE IMPLEMENTAÇÃO DO EDR - PASSO A PASSO

## 📋 Overview

Este guia mostra como implementar o Enterprise Deep Research (EDR) no Icarus V5.0 de forma progressiva.

---

## ✅ PRÉ-REQUISITOS (JÁ CONFIGURADOS)

- ✅ Ollama instalado e rodando (llama3.1:8b)
- ✅ Supabase configurado
- ✅ Tesseract.js instalado
- ⚠️ Meilisearch (instalação em andamento)
- ⚠️ PostHog (opcional)

---

## 📅 ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: FUNDAÇÃO (Semana 1-2)

#### 1.1 Aplicar Schema Supabase

```bash
# Aplicar migração do schema EDR
cd /Users/daxmeneghel/icarus-make
supabase db push
```

#### 1.2 Configurar Variáveis de Ambiente

```bash
# Adicionar ao .env
cat >> .env << 'EOF'

# EDR Configuration
VITE_EDR_ENABLED=true
VITE_EDR_MAX_SESSIONS=10
VITE_EDR_DEFAULT_DEPTH=medium
VITE_EDR_TIMEOUT=300000
EOF
```

#### 1.3 Instalar Dependências Adicionais

```bash
pnpm add \
  @supabase/realtime-js \
  ws \
  d3 \
  recharts \
  react-flow-renderer \
  marked \
  dompurify
```

#### 1.4 Estrutura de Diretórios

```bash
mkdir -p src/lib/edr/{agents,tools,visualization,reflection,realtime}
mkdir -p src/components/edr
mkdir -p src/pages/edr
```

---

### FASE 2: AGENTES ESPECIALIZADOS (Semana 3-4)

#### 2.1 Implementar Agente de Planejamento Mestre

```typescript
// src/lib/edr/agents/master-planner.ts

import { Ollama } from "ollama";

export class MasterPlannerAgent {
  private ollama: Ollama;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.ollama = new Ollama({ baseUrl });
  }

  async decompose(query: string): Promise<MasterPlan> {
    const response = await this.ollama.generate({
      model: "llama3.1:8b",
      prompt: this.buildPlanningPrompt(query),
      stream: false,
    });

    return this.parsePlan(response.response);
  }

  private buildPlanningPrompt(query: string): string {
    return `Como um planejador mestre de pesquisa, decomponha a seguinte consulta:

Query: ${query}

Retorne um JSON estruturado com:
{
  "objective": "objetivo principal claro",
  "subtasks": [
    {
      "id": "task_1",
      "description": "descrição específica",
      "agent": "general|academic|github|linkedin|database",
      "dependencies": [],
      "priority": 1-10,
      "estimatedTime": tempo_em_segundos
    }
  ],
  "agents": ["lista de agentes necessários"],
  "executionOrder": [["task_1"], ["task_2", "task_3"]], 
  "estimatedTime": tempo_total_em_segundos
}

Importante:
- Subtarefas devem ser específicas e mensuráveis
- Prioridades: 10 = crítico, 1 = baixo
- Tarefas sem dependências podem ser executadas em paralelo
- Escolha o agente mais adequado para cada subtarefa`;
  }

  private parsePlan(response: string): MasterPlan {
    // Extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Falha ao extrair plano JSON");
    }

    return JSON.parse(jsonMatch[0]);
  }
}
```

#### 2.2 Implementar Agente Geral (Meilisearch)

```typescript
// src/lib/edr/agents/general-research.ts

import { MeiliSearch } from "meilisearch";

export class GeneralResearchAgent {
  private client: MeiliSearch;

  constructor(config: { host: string; apiKey: string }) {
    this.client = new MeiliSearch(config);
  }

  async research(subtask: Subtask): Promise<AgentResult> {
    const startTime = Date.now();

    // 1. Buscar em índices existentes
    const searchResults = await this.searchExistingData(subtask.description);

    // 2. Buscar em fontes externas (web scraping)
    const webResults = await this.fetchWebData(subtask.description);

    // 3. Indexar novos resultados
    await this.indexResults(webResults);

    // 4. Rankear e filtrar
    const rankedResults = this.rankResults([...searchResults, ...webResults]);

    // 5. Calcular confiança
    const confidence = this.calculateConfidence(rankedResults);

    return {
      agentType: "general",
      data: rankedResults,
      confidence,
      executionTime: Date.now() - startTime,
      sources: ["meilisearch", "web"],
      metadata: {
        totalResults: rankedResults.length,
        avgRelevance: this.calculateAvgRelevance(rankedResults),
      },
    };
  }

  private async searchExistingData(query: string) {
    const results = await this.client.index("general_research").search(query, {
      limit: 50,
      attributesToRetrieve: ["title", "content", "url", "relevance"],
      sort: ["relevance:desc"],
    });

    return results.hits;
  }

  private async fetchWebData(query: string) {
    // TODO: Implementar web scraping
    // Pode usar bibliotecas como cheerio, puppeteer, etc.
    return [];
  }

  private async indexResults(results: any[]) {
    if (results.length === 0) return;

    await this.client.index("general_research").addDocuments(results);
  }

  private rankResults(results: any[]): any[] {
    return results
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 20);
  }

  private calculateConfidence(results: any[]): number {
    if (results.length === 0) return 0;

    const avgRelevance =
      results.reduce((sum, r) => sum + (r.relevance || 0), 0) / results.length;
    const sourceDiversity = new Set(results.map((r) => r.source)).size;

    return Math.min(avgRelevance * 0.7 + sourceDiversity * 0.1, 1.0);
  }

  private calculateAvgRelevance(results: any[]): number {
    if (results.length === 0) return 0;
    return (
      results.reduce((sum, r) => sum + (r.relevance || 0), 0) / results.length
    );
  }
}
```

#### 2.3 Implementar Agente Acadêmico

```typescript
// src/lib/edr/agents/academic-research.ts

import { Ollama } from "ollama";

export class AcademicResearchAgent {
  private ollama: Ollama;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.ollama = new Ollama({ baseUrl });
  }

  async research(subtask: Subtask): Promise<AgentResult> {
    const startTime = Date.now();

    // 1. Buscar em ArXiv
    const arxivResults = await this.searchArxiv(subtask.description);

    // 2. Buscar em PubMed (se aplicável)
    const pubmedResults = await this.searchPubMed(subtask.description);

    // 3. Analisar papers com Ollama
    const analyzedPapers = await this.analyzePapers([
      ...arxivResults,
      ...pubmedResults,
    ]);

    // 4. Calcular confiança
    const confidence = this.calculateConfidence(analyzedPapers);

    return {
      agentType: "academic",
      data: analyzedPapers,
      confidence,
      executionTime: Date.now() - startTime,
      sources: ["arxiv", "pubmed"],
      metadata: {
        totalPapers: analyzedPapers.length,
        avgCitations: this.calculateAvgCitations(analyzedPapers),
      },
    };
  }

  private async searchArxiv(query: string): Promise<any[]> {
    // ArXiv API
    const response = await fetch(
      `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=20`,
    );

    const text = await response.text();
    return this.parseArxivXML(text);
  }

  private async searchPubMed(query: string): Promise<any[]> {
    // PubMed API
    // TODO: Implementar
    return [];
  }

  private async analyzePapers(papers: any[]): Promise<any[]> {
    // Analisar cada paper com Ollama
    const analyzed = await Promise.all(
      papers.map(async (paper) => {
        const analysis = await this.ollama.generate({
          model: "llama3.1:8b",
          prompt: `Analise o seguinte paper acadêmico:

Título: ${paper.title}
Resumo: ${paper.abstract}

Extraia:
1. Principais contribuições
2. Metodologia utilizada
3. Resultados principais
4. Relevância para o tópico
5. Score de relevância (0-1)

Retorne JSON estruturado.`,
          stream: false,
        });

        return {
          ...paper,
          analysis: JSON.parse(analysis.response),
        };
      }),
    );

    return analyzed;
  }

  private parseArxivXML(xml: string): any[] {
    // TODO: Parser de XML do ArXiv
    return [];
  }

  private calculateConfidence(papers: any[]): number {
    if (papers.length === 0) return 0;

    const avgRelevance =
      papers.reduce((sum, p) => sum + (p.analysis?.relevanceScore || 0), 0) /
      papers.length;
    return avgRelevance * 0.9; // 90% confidence cap for academic
  }

  private calculateAvgCitations(papers: any[]): number {
    if (papers.length === 0) return 0;
    return (
      papers.reduce((sum, p) => sum + (p.citations || 0), 0) / papers.length
    );
  }
}
```

---

### FASE 3: FERRAMENTAS MCP (Semana 5-6)

#### 3.1 NL2SQL Engine

```typescript
// src/lib/edr/tools/nl2sql.ts

import { createClient } from "@supabase/supabase-js";
import { Ollama } from "ollama";

export class NL2SQLEngine {
  private supabase: any;
  private ollama: Ollama;

  constructor(supabaseConfig: any, ollamaUrl: string) {
    this.supabase = createClient(supabaseConfig.url, supabaseConfig.key);
    this.ollama = new Ollama({ baseUrl: ollamaUrl });
  }

  async translate(naturalLanguageQuery: string): Promise<SQLResult> {
    // 1. Obter schema context
    const schema = await this.getSchemaContext();

    // 2. Gerar SQL com Ollama
    const sql = await this.generateSQL(naturalLanguageQuery, schema);

    // 3. Validar SQL
    const isValid = await this.validateSQL(sql);
    if (!isValid) {
      throw new Error("SQL gerado inválido");
    }

    // 4. Executar query
    const { data, error } = await this.executeSQL(sql);

    if (error) {
      throw new Error(`Erro ao executar SQL: ${error.message}`);
    }

    return {
      sql,
      data,
      rowCount: data?.length || 0,
    };
  }

  private async getSchemaContext(): Promise<string> {
    // Obter schema do Supabase
    const { data: tables } = await this.supabase
      .from("information_schema.tables")
      .select("table_name, table_schema")
      .eq("table_schema", "public");

    // TODO: Obter colunas e relacionamentos
    return JSON.stringify(tables);
  }

  private async generateSQL(query: string, schema: string): Promise<string> {
    const response = await this.ollama.generate({
      model: "llama3.1:8b",
      prompt: `Traduza a seguinte consulta em natural language para SQL válido:

Consulta: ${query}

Schema disponível:
${schema}

Importante:
- Retorne APENAS a query SQL, sem explicações
- Use PostgreSQL syntax
- Inclua apenas colunas que existem no schema
- Use JOINs apropriados se necessário

SQL:`,
      stream: false,
    });

    return this.extractSQL(response.response);
  }

  private extractSQL(response: string): string {
    // Extrair SQL da resposta
    const sqlMatch = response.match(/SELECT[\s\S]*?;/i);
    if (!sqlMatch) {
      throw new Error("Falha ao extrair SQL da resposta");
    }
    return sqlMatch[0];
  }

  private async validateSQL(sql: string): Promise<boolean> {
    // Validação básica
    if (!sql.toLowerCase().startsWith("select")) {
      return false; // Apenas SELECT permitido
    }

    // TODO: Validação mais robusta
    return true;
  }

  private async executeSQL(sql: string) {
    return await this.supabase.rpc("execute_query", { query: sql });
  }
}
```

---

### FASE 4: INTERFACE REACT (Semana 7)

#### 4.1 Componente Principal

```tsx
// src/pages/edr/ResearchInterface.tsx

import React, { useState } from "react";
import { EDROrchestrator } from "@/lib/edr/orchestrator";
import { MasterPlanViewer } from "@/components/edr/MasterPlanViewer";
import { AgentMonitor } from "@/components/edr/AgentMonitor";
import { ResultsPanel } from "@/components/edr/ResultsPanel";

export function ResearchInterface() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  const handleStartResearch = async () => {
    setIsResearching(true);

    const edr = new EDROrchestrator({
      ollama: { baseUrl: "http://localhost:11434" },
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        key: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      meilisearch: { host: "http://localhost:7700" },
    });

    try {
      const researchResult = await edr.startResearch(query);
      setResult(researchResult);
    } catch (error) {
      console.error("Erro na pesquisa:", error);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="edr-interface">
      <div className="query-input">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite sua consulta de pesquisa profunda..."
        />
        <button
          onClick={handleStartResearch}
          disabled={isResearching || !query}
        >
          {isResearching ? "Pesquisando..." : "Iniciar Pesquisa"}
        </button>
      </div>

      {result && (
        <>
          <MasterPlanViewer plan={result.plan} />
          <AgentMonitor results={result.results} />
          <ResultsPanel results={result.results} />
        </>
      )}
    </div>
  );
}
```

---

## 🚀 EXECUÇÃO RÁPIDA

```bash
# 1. Aplicar schema
cd /Users/daxmeneghel/icarus-make
supabase db push

# 2. Instalar dependências
pnpm install

# 3. Configurar .env (já feito)
# ...

# 4. Iniciar Meilisearch (se não estiver rodando)
meilisearch --master-key="MASTER_KEY_DEV_ICARUS" &

# 5. Iniciar dev server
pnpm dev

# 6. Acessar interface EDR
# http://localhost:5173/edr
```

---

## 📚 PRÓXIMOS PASSOS

1. ✅ Arquitetura completa documentada
2. ✅ Schema Supabase criado
3. ✅ Orquestrador base implementado
4. ⚠️ Implementar agentes especializados
5. ⚠️ Criar ferramentas MCP
6. ⚠️ Desenvolver interface React
7. ⚠️ Testes e otimização

---

**Status:** 🟡 Em Implementação  
**Progresso:** 30% (Fundação completa)  
**Próxima Fase:** Agentes Especializados
