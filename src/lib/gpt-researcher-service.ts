/**
 * Serviço GPT Researcher
 * Encapsula toda a lógica de comunicação com o GPT Researcher
 */

export interface GPTResearcherOptions {
  host?: string;
  timeout?: number;
}

export interface ResearchQuery {
  task: string;
  reportType?: 'research_report' | 'detailed_report' | 'resource_report';
  reportSource?: 'web' | 'local' | 'hybrid';
  tone?: 'objective' | 'formal' | 'analytical' | 'informative';
  queryDomains?: string[];
}

export interface ResearchLog {
  type: 'logs' | 'report' | 'error';
  content: string;
  output: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export type ResearchCallback = (log: ResearchLog) => void;

export class GPTResearcherService {
  private host: string;
  private timeout: number;
  private researcher: { sendMessage: (message: ResearchQuery) => Promise<void> } | null = null;
  private callbacks: Set<ResearchCallback> = new Set();

  constructor(options: GPTResearcherOptions = {}) {
    this.host = options.host || 'http://localhost:8000';
    this.timeout = options.timeout || 60000;
  }

  /**
   * Inicializa a conexão com o GPT Researcher
   */
  async initialize(): Promise<boolean> {
    // Versão stub: opera apenas via HTTP (hooks já fazem comunicação)
    // Mantém API para compatibilidade, sem importar pacote externo.
    this.researcher = {
      sendMessage: async (_message: ResearchQuery) => {
        return Promise.resolve();
      }
    };
    return true;
  }

  /**
   * Adiciona um listener para logs
   */
  addLogListener(callback: ResearchCallback): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove um listener
   */
  removeLogListener(callback: ResearchCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Notifica todos os callbacks
   */
  private notifyCallbacks(log: ResearchLog): void {
    this.callbacks.forEach(callback => callback(log));
  }

  /**
   * Executa uma pesquisa
   */
  async research(query: ResearchQuery): Promise<void> {
    if (!this.researcher) {
      throw new Error('GPT Researcher não inicializado. Chame initialize() primeiro.');
    }

    try {
      await this.researcher.sendMessage({
        task: query.task,
        reportType: query.reportType || 'research_report',
        reportSource: query.reportSource || 'web',
        tone: query.tone,
        queryDomains: query.queryDomains
      });
    } catch (error) {
   const err = error as Error;
      console.error('Erro durante pesquisa:', err);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está pronto
   */
  isReady(): boolean {
    return this.researcher !== null;
  }

  /**
   * Desconecta o serviço
   */
  disconnect(): void {
    this.researcher = null;
    this.callbacks.clear();
  }
}

// Singleton instance
let instance: GPTResearcherService | null = null;

export function getGPTResearcherService(options?: GPTResearcherOptions): GPTResearcherService {
  if (!instance) {
    instance = new GPTResearcherService(options);
  }
  return instance;
}

export default GPTResearcherService;

