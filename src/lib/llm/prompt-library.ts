/**
 * Prompt Library - ICARUS v5.0
 * Biblioteca centralizada de prompts para LLMs
 * Versioning, A/B testing e reutilização
 */

export interface PromptTemplate {
  id: string;
  version: string;
  category: "opme" | "compliance" | "financial" | "clinical" | "general";
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  examples?: Array<{ input: Record<string, string>; output: string }>;
  metadata?: {
    author?: string;
    created: string;
    lastUpdated: string;
    performance?: {
      avgAccuracy?: number;
      avgLatency?: number;
      usageCount?: number;
    };
  };
}

/**
 * CATEGORIA: OPME (Materiais Cirúrgicos)
 */
export const OPME_PROMPTS: Record<string, PromptTemplate> = {
  MATERIAL_SUGGESTION: {
    id: "opme_material_suggestion_v1",
    version: "1.0.0",
    category: "opme",
    systemPrompt:
      "Você é um especialista em materiais OPME com 15+ anos de experiência. Seu objetivo é sugerir materiais adequados para procedimentos cirúrgicos com base em guidelines ANVISA e boas práticas médicas.",
    userPromptTemplate: `Procedimento cirúrgico: {{procedimento}}
Especialidade: {{especialidade}}
Hospital: {{hospital}}
Restrições: {{restricoes}}

Sugira os materiais OPME necessários, incluindo:
1. Nome do material
2. Código ANVISA
3. Quantidade recomendada
4. Justificativa técnica`,
    variables: ["procedimento", "especialidade", "hospital", "restricoes"],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },

  RASTREABILITY_ANALYSIS: {
    id: "opme_rastreability_v1",
    version: "1.0.0",
    category: "opme",
    systemPrompt:
      "Você é um auditor ANVISA especializado em rastreabilidade de materiais OPME. Analise cadeias de rastreamento e identifique não-conformidades.",
    userPromptTemplate: `Analise a seguinte rastreabilidade OPME:

Produto: {{produto}}
Lote: {{lote}}
Número de série: {{numero_serie}}
Data fabricação: {{data_fabricacao}}
Data validade: {{data_validade}}
Fornecedor: {{fornecedor}}
Nota fiscal: {{nota_fiscal}}

Verifique:
1. Conformidade ANVISA
2. Validade e recall
3. Documentação completa
4. Recomendações`,
    variables: [
      "produto",
      "lote",
      "numero_serie",
      "data_fabricacao",
      "data_validade",
      "fornecedor",
      "nota_fiscal",
    ],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },
};

/**
 * CATEGORIA: COMPLIANCE
 */
export const COMPLIANCE_PROMPTS: Record<string, PromptTemplate> = {
  DOCUMENT_ANALYSIS: {
    id: "compliance_doc_analysis_v1",
    version: "1.0.0",
    category: "compliance",
    systemPrompt:
      "Você é um auditor de compliance especializado em normas ANVISA, RDC 36/2015, ISO 13485 e regulamentos OPME. Analise documentos e identifique não-conformidades.",
    userPromptTemplate: `Analise o seguinte documento de compliance:

Documento: {{tipo_documento}}
Conteúdo: {{conteudo}}
Norma aplicável: {{norma}}

Forneça:
1. Status de conformidade (Conforme/Não-conforme/Parcialmente conforme)
2. Lista de não-conformidades (se houver)
3. Severidade (Crítica/Alta/Média/Baixa)
4. Recomendações de adequação
5. Prazo sugerido para correção`,
    variables: ["tipo_documento", "conteudo", "norma"],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
      performance: {
        avgAccuracy: 0.982, // Abbott Score
        avgLatency: 2500,
        usageCount: 1247,
      },
    },
  },

  ABBOTT_SCORE_CALCULATION: {
    id: "compliance_abbott_score_v1",
    version: "1.0.0",
    category: "compliance",
    systemPrompt:
      "Você é um especialista em Abbott Score (sistema de pontuação de compliance). Calcule scores e forneça insights para melhoria.",
    userPromptTemplate: `Calcule o Abbott Score com base nos seguintes requisitos:

Total de requisitos: {{total_requisitos}}
Requisitos conformes: {{conformes}}
Requisitos não-conformes: {{nao_conformes}}
Requisitos em adequação: {{em_adequacao}}
Requisitos dispensados: {{dispensados}}

Detalhes por categoria:
{{detalhes_categorias}}

Forneça:
1. Score total (0-100)
2. Classificação (Excelente/Bom/Regular/Insuficiente)
3. Breakdown por categoria
4. Top 3 ações para melhorar score
5. Prazo estimado para próximo nível`,
    variables: [
      "total_requisitos",
      "conformes",
      "nao_conformes",
      "em_adequacao",
      "dispensados",
      "detalhes_categorias",
    ],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },
};

/**
 * CATEGORIA: FINANCIAL
 */
export const FINANCIAL_PROMPTS: Record<string, PromptTemplate> = {
  CASHFLOW_FORECAST: {
    id: "financial_cashflow_forecast_v1",
    version: "1.0.0",
    category: "financial",
    systemPrompt:
      "Você é um analista financeiro especializado em gestão hospitalar e OPME. Analise fluxos de caixa e forneça previsões precisas.",
    userPromptTemplate: `Analise o fluxo de caixa e forneça previsão:

Período de análise: {{periodo}}
Entradas planejadas: {{entradas}}
Saídas planejadas: {{saidas}}
Saldo inicial: {{saldo_inicial}}
Histórico (últimos 90 dias): {{historico}}

Forneça:
1. Projeção de fluxo de caixa (próximos {{horizonte}} dias)
2. Identificação de gaps de caixa
3. Sugestões para otimização
4. Alertas de risco
5. Recomendações financeiras`,
    variables: [
      "periodo",
      "entradas",
      "saidas",
      "saldo_inicial",
      "historico",
      "horizonte",
    ],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },
};

/**
 * CATEGORIA: CLINICAL
 */
export const CLINICAL_PROMPTS: Record<string, PromptTemplate> = {
  SURGERY_OPTIMIZATION: {
    id: "clinical_surgery_optimization_v1",
    version: "1.0.0",
    category: "clinical",
    systemPrompt:
      "Você é um gestor cirúrgico especializado em otimização de agenda e recursos. Ajude a maximizar eficiência e reduzir custos.",
    userPromptTemplate: `Otimize a agenda cirúrgica:

Data: {{data}}
Cirurgias agendadas: {{cirurgias}}
Recursos disponíveis: {{recursos}}
Restrições: {{restricoes}}

Forneça:
1. Agenda otimizada (ordem de procedimentos)
2. Alocação de salas
3. Conflitos identificados
4. Tempo ocioso estimado
5. Sugestões de melhoria`,
    variables: ["data", "cirurgias", "recursos", "restricoes"],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },
};

/**
 * CATEGORIA: GENERAL
 */
export const GENERAL_PROMPTS: Record<string, PromptTemplate> = {
  TEXT_ANALYSIS: {
    id: "general_text_analysis_v1",
    version: "1.0.0",
    category: "general",
    systemPrompt:
      "Você é um assistente de análise de texto com expertise em gestão hospitalar e OPME.",
    userPromptTemplate: `Analise o seguinte texto e responda: {{question}}

Texto: {{text}}`,
    variables: ["question", "text"],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },

  SMART_SUGGESTIONS: {
    id: "general_smart_suggestions_v1",
    version: "1.0.0",
    category: "general",
    systemPrompt:
      "Você é um especialista em gestão hospitalar. Forneça sugestões práticas e diretas.",
    userPromptTemplate: `Com base no contexto fornecido, sugira 3-5 ações ou insights relevantes para: {{query}}

Contexto: {{context}}`,
    variables: ["query", "context"],
    metadata: {
      author: "ICARUS AI Team",
      created: "2025-10-26",
      lastUpdated: "2025-10-26",
    },
  },
};

/**
 * PROMPT LIBRARY CONSOLIDADA
 */
export const PROMPT_LIBRARY = {
  opme: OPME_PROMPTS,
  compliance: COMPLIANCE_PROMPTS,
  financial: FINANCIAL_PROMPTS,
  clinical: CLINICAL_PROMPTS,
  general: GENERAL_PROMPTS,
};

/**
 * Helper: Renderizar template com variáveis
 */
export function renderPrompt(
  template: PromptTemplate,
  variables: Record<string, string>,
): { systemPrompt: string; userPrompt: string } {
  let userPrompt = template.userPromptTemplate;

  // Substituir variáveis
  for (const [key, value] of Object.entries(variables)) {
    userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, "g"), value);
  }

  return {
    systemPrompt: template.systemPrompt,
    userPrompt,
  };
}

/**
 * Helper: Buscar prompt por ID
 */
export function getPromptById(id: string): PromptTemplate | null {
  for (const category of Object.values(PROMPT_LIBRARY)) {
    for (const prompt of Object.values(category)) {
      if (prompt.id === id) return prompt;
    }
  }
  return null;
}

/**
 * Helper: Listar prompts por categoria
 */
export function getPromptsByCategory(
  category: PromptTemplate["category"],
): PromptTemplate[] {
  return Object.values(PROMPT_LIBRARY[category] || {});
}

/**
 * Estatísticas da biblioteca
 */
export function getLibraryStats(): {
  totalPrompts: number;
  byCategory: Record<string, number>;
  avgPerformance: {
    accuracy: number;
    latency: number;
  };
} {
  let totalPrompts = 0;
  const byCategory: Record<string, number> = {};
  let totalAccuracy = 0;
  let totalLatency = 0;
  let promptsWithMetrics = 0;

  for (const [category, prompts] of Object.entries(PROMPT_LIBRARY)) {
    const count = Object.keys(prompts).length;
    byCategory[category] = count;
    totalPrompts += count;

    for (const prompt of Object.values(prompts)) {
      if (prompt.metadata?.performance) {
        totalAccuracy += prompt.metadata.performance.avgAccuracy || 0;
        totalLatency += prompt.metadata.performance.avgLatency || 0;
        promptsWithMetrics++;
      }
    }
  }

  return {
    totalPrompts,
    byCategory,
    avgPerformance: {
      accuracy: promptsWithMetrics > 0 ? totalAccuracy / promptsWithMetrics : 0,
      latency: promptsWithMetrics > 0 ? totalLatency / promptsWithMetrics : 0,
    },
  };
}
