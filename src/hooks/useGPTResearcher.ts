import { useState, useCallback, useEffect, useRef } from 'react';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface GPTResearcherConfig {
  host?: string;
  onLog?: (data: ResearchLog) => void;
  onError?: (error: Error) => void;
}

export interface ResearchLog {
  // Compatível com componentes que esperam 'content'/'output' e tipo 'logs'
  type: 'info' | 'warning' | 'error' | 'progress' | 'logs';
  message?: string;
  content?: string;
  output?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ResearchTask {
  task: string;
  reportType?: 'research_report' | 'summary' | 'detailed';
  reportSource?: 'web' | 'local' | 'hybrid';
  queryDomains?: string[];
  maxResults?: number;
  language?: string;
}

export interface ResearchResult {
  id: string;
  task: string;
  report: string;
  sources: ResearchSource[];
  metadata: {
    duration: number;
    totalSources: number;
    language: string;
    timestamp: Date;
  };
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  relevance: number;
}

// ============================================
// HOOK: useGPTResearcher
// ============================================

export const useGPTResearcher = (config: GPTResearcherConfig = {}) => {
  const {
    host = 'http://localhost:8000',
    onLog,
    onError,
  } = config;

  const [isConnected, setIsConnected] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [logs, setLogs] = useState<ResearchLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const addLog = useCallback((log: Omit<ResearchLog, 'timestamp'>) => {
    const fullLog: ResearchLog = {
      type: log.type,
      message: log.message,
      content: log.content ?? log.message,
      output: log.output,
      metadata: log.metadata,
      timestamp: new Date(),
    };

    setLogs((prev) => [...prev, fullLog]);

    if (onLog) {
      onLog(fullLog);
    }
  }, [onLog]);

  const handleError = useCallback((err: Error) => {
    setError(err.message);
    addLog({
      type: 'error',
      message: err.message,
    });

    if (onError) {
      onError(err);
    }
  }, [onError, addLog]);

  // ============================================
  // VERIFICAR CONEXÃO
  // ============================================

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch(`${host}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setIsConnected(true);
        addLog({
          type: 'info',
          message: 'Conectado ao GPT Researcher',
        });
        return true;
      } else {
        setIsConnected(false);
        addLog({
          type: 'warning',
          message: 'GPT Researcher não está disponível',
        });
        return false;
      }
    } catch {
      setIsConnected(false);
      addLog({
        type: 'warning',
        message: 'Não foi possível conectar ao GPT Researcher (rodando localmente?)',
      });
      return false;
    }
  }, [host, addLog]);

  // ============================================
  // EXECUTAR PESQUISA
  // ============================================

  const research = useCallback(async (task: ResearchTask): Promise<ResearchResult | null> => {
    if (!isConnected) {
      const connected = await checkConnection();
      if (!connected) {
        handleError(new Error('GPT Researcher não está disponível. Certifique-se de que o servidor está rodando.'));
        return null;
      }
    }

    setIsResearching(true);
    setError(null);

    const startTime = Date.now();

    addLog({
      type: 'info',
      message: `Iniciando pesquisa: ${task.task}`,
    });

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${host}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: task.task,
          report_type: task.reportType || 'research_report',
          report_source: task.reportSource || 'web',
          query_domains: task.queryDomains || [],
          max_results: task.maxResults || 10,
          language: task.language || 'pt-BR',
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro na pesquisa: ${response.statusText}`);
      }

      const data = await response.json();

      const duration = Date.now() - startTime;

      const result: ResearchResult = {
        id: `research_${Date.now()}`,
        task: task.task,
        report: data.report || data.content || '',
        sources: data.sources || [],
        metadata: {
          duration,
          totalSources: data.sources?.length || 0,
          language: task.language || 'pt-BR',
          timestamp: new Date(),
        },
      };

      setCurrentResult(result);

      addLog({
        type: 'info',
        message: `Pesquisa concluída em ${(duration / 1000).toFixed(2)}s`,
        metadata: {
          totalSources: result.metadata.totalSources,
        },
      });

      // Emitir log final compatível com Chatbot/Exemplos
      addLog({
        type: 'logs',
        content: 'research_complete',
        output: result.report,
        metadata: { sources: result.sources as unknown as Record<string, unknown> },
      });

      return result;
    } catch (error) {
   const err = error as Error;
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          addLog({
            type: 'warning',
            message: 'Pesquisa cancelada',
          });
        } else {
          handleError(err);
        }
      }
      return null;
    } finally {
      setIsResearching(false);
      abortControllerRef.current = null;
    }
  }, [host, isConnected, checkConnection, addLog, handleError]);

  // ============================================
  // CANCELAR PESQUISA
  // ============================================

  const cancelResearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      addLog({
        type: 'warning',
        message: 'Cancelamento solicitado',
      });
    }
  }, [addLog]);

  // ============================================
  // LIMPAR LOGS
  // ============================================

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // ============================================
  // LIMPAR ERRO
  // ============================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // EFFECT: VERIFICAR CONEXÃO NO MOUNT
  // ============================================

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // ============================================
  // RETURN
  // ============================================

  return {
    isConnected,
    isResearching,
    logs,
    error,
    currentResult,
    research,
    cancelResearch,
    clearLogs,
    clearError,
    checkConnection,
  };
};
