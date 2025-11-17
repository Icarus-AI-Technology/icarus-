/**
 * GPT Researcher Service
 *
 * Serviço para integração com GPT Researcher
 * (Deep Web Research Agent)
 *
 * @version 1.0.0
 * @author ICARUS Team
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface GPTResearcherOptions {
  host?: string;
  logListener?: (data: ResearchLog) => void;
}

export interface ResearchLog {
  type: "info" | "warning" | "error" | "progress" | "result";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageOptions {
  task: string;
  reportType?: "research_report" | "summary" | "detailed_analysis" | "outline";
  reportSource?: "web" | "local" | "hybrid";
  queryDomains?: string[];
  maxResults?: number;
  language?: string;
  tone?: "objective" | "informative" | "analytical" | "critical";
}

export interface ResearchResponse {
  success: boolean;
  report: string;
  sources: ResearchSource[];
  metadata: {
    duration: number;
    totalTokens: number;
    model: string;
    language: string;
  };
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
  publishedDate?: string;
}

// ============================================
// CLASSE: GPTResearcher
// ============================================

export class GPTResearcher {
  private host: string;
  private logListener?: (data: ResearchLog) => void;
  private abortController: AbortController | null = null;

  constructor(options: GPTResearcherOptions = {}) {
    this.host = options.host || "http://localhost:8000";
    this.logListener = options.logListener;

    this.log({
      type: "info",
      message: "GPT Researcher inicializado",
      timestamp: new Date().toISOString(),
      metadata: { host: this.host },
    });
  }

  // ============================================
  // LOGGING
  // ============================================

  private log(data: ResearchLog): void {
    if (this.logListener) {
      this.logListener(data);
    } else {
      console.log(`[GPT Researcher] ${data.type.toUpperCase()}:`, data.message);
    }
  }

  // ============================================
  // VERIFICAR CONEXÃO
  // ============================================

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.host}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        this.log({
          type: "info",
          message: "Conectado ao GPT Researcher",
          timestamp: new Date().toISOString(),
        });
        return true;
      } else {
        this.log({
          type: "warning",
          message: "GPT Researcher não responde",
          timestamp: new Date().toISOString(),
        });
        return false;
      }
    } catch (error) {
      const err = error as Error;
      this.log({
        type: "error",
        message: `Erro ao conectar: ${err instanceof Error ? err.message : "Desconhecido"}`,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  // ============================================
  // ENVIAR MENSAGEM (RESEARCH)
  // ============================================

  async sendMessage(options: SendMessageOptions): Promise<ResearchResponse> {
    const {
      task,
      reportType = "research_report",
      reportSource = "web",
      queryDomains = [],
      maxResults = 10,
      language = "pt-BR",
      tone = "informative",
    } = options;

    this.log({
      type: "info",
      message: `Iniciando pesquisa: ${task}`,
      timestamp: new Date().toISOString(),
      metadata: { reportType, reportSource, queryDomains },
    });

    const startTime = Date.now();

    // Criar novo AbortController
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${this.host}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task,
          report_type: reportType,
          report_source: reportSource,
          query_domains: queryDomains,
          max_results: maxResults,
          language,
          tone,
        }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const duration = Date.now() - startTime;

      this.log({
        type: "result",
        message: `Pesquisa concluída em ${(duration / 1000).toFixed(2)}s`,
        timestamp: new Date().toISOString(),
        metadata: {
          totalSources: data.sources?.length || 0,
          duration,
        },
      });

      return {
        success: true,
        report: data.report || data.content || "",
        sources: data.sources || [],
        metadata: {
          duration,
          totalTokens: data.totalTokens || 0,
          model: data.model || "gpt-4-turbo",
          language,
        },
      };
    } catch (error) {
      const err = error as Error;
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      this.log({
        type: "error",
        message: `Falha na pesquisa: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        report: "",
        sources: [],
        metadata: {
          duration: Date.now() - startTime,
          totalTokens: 0,
          model: "",
          language,
        },
      };
    } finally {
      this.abortController = null;
    }
  }

  // ============================================
  // CANCELAR PESQUISA
  // ============================================

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.log({
        type: "warning",
        message: "Pesquisa cancelada pelo usuário",
        timestamp: new Date().toISOString(),
      });
      this.abortController = null;
    }
  }

  // ============================================
  // PESQUISA RÁPIDA (SHORTHAND)
  // ============================================

  async quickResearch(task: string, domains?: string[]): Promise<string> {
    const response = await this.sendMessage({
      task,
      reportType: "summary",
      reportSource: "web",
      queryDomains: domains,
      maxResults: 5,
    });

    return response.report;
  }

  // ============================================
  // PESQUISA DETALHADA (SHORTHAND)
  // ============================================

  async detailedResearch(
    task: string,
    domains?: string[],
  ): Promise<ResearchResponse> {
    return await this.sendMessage({
      task,
      reportType: "detailed_analysis",
      reportSource: "web",
      queryDomains: domains,
      maxResults: 20,
      tone: "analytical",
    });
  }

  // ============================================
  // PESQUISA EM DOMÍNIOS ESPECÍFICOS
  // ============================================

  async researchInDomains(
    task: string,
    domains: string[],
  ): Promise<ResearchResponse> {
    this.log({
      type: "info",
      message: `Pesquisando em domínios: ${domains.join(", ")}`,
      timestamp: new Date().toISOString(),
    });

    return await this.sendMessage({
      task,
      reportType: "research_report",
      reportSource: "web",
      queryDomains: domains,
      maxResults: 15,
    });
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

let researcherInstance: GPTResearcher | null = null;

export const getGPTResearcher = (
  options?: GPTResearcherOptions,
): GPTResearcher => {
  if (!researcherInstance) {
    researcherInstance = new GPTResearcher(options);
  }
  return researcherInstance;
};

// ============================================
// DOMÍNIOS PRÉ-DEFINIDOS (HEALTHCARE & OPME)
// ============================================

export const HEALTHCARE_DOMAINS = [
  "anvisa.gov.br",
  "ans.gov.br",
  "saude.gov.br",
  "cnes.datasus.gov.br",
  "pubmed.ncbi.nlm.nih.gov",
  "scielo.br",
];

export const OPME_DOMAINS = [
  "anvisa.gov.br",
  "ans.gov.br",
  "cnes.datasus.gov.br",
  "tuss.ans.gov.br",
];

export const TECH_DOMAINS = [
  "techcrunch.com",
  "wired.com",
  "theverge.com",
  "arstechnica.com",
];

export const FINANCE_DOMAINS = [
  "bcb.gov.br",
  "cvm.gov.br",
  "b3.com.br",
  "infomoney.com.br",
];
