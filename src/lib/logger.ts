/**
 * Sistema de Logging Estruturado
 * Fornece logging consistente em toda a aplicação
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to save', { error: err });
 * ```
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

/**
 * Classe de Logger estruturado
 */
class Logger {
  private enabled: boolean;
  private minLevel: LogLevel;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.enabled = true;
    this.minLevel = this.getMinLevel();
  }

  /**
   * Obtém o nível mínimo de log baseado no ambiente
   */
  private getMinLevel(): LogLevel {
    const env = import.meta.env.MODE || "development";

    if (env === "production") {
      return "warn";
    } else if (env === "staging") {
      return "info";
    }
    return "debug";
  }

  /**
   * Verifica se deve logar baseado no nível
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);

    return this.enabled && currentIndex >= minIndex;
  }

  /**
   * Formata a mensagem de log
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getLevelEmoji(level);

    let formatted = `${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      formatted += `\n   Context: ${JSON.stringify(context, null, 2)}`;
    }

    return formatted;
  }

  /**
   * Obtém emoji para o nível de log
   */
  private getLevelEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    };
    return emojis[level];
  }

  /**
   * Adiciona log ao histórico
   */
  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);

    // Limitar tamanho do histórico
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Registra mensagem de debug (apenas em ambiente de desenvolvimento)
   *
   * @param message - Mensagem descritiva do evento
   * @param context - Contexto adicional com dados relevantes
   *
   * @example
   * ```typescript
   * logger.debug('User data fetched', { userId: '123', records: 45 });
   * ```
   *
   * @remarks
   * - Logs de debug não aparecem em produção
   * - Use para informações detalhadas de desenvolvimento
   * - Inclua dados que ajudem no troubleshooting
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;

    const entry: LogEntry = {
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    console.debug(this.formatMessage("debug", message, context));
    this.addToHistory(entry);
  }

  /**
   * Registra evento informativo importante
   *
   * @param message - Descrição clara do evento
   * @param context - Dados contextuais do evento
   *
   * @example
   * ```typescript
   * logger.info('Order created', {
   *   orderId: 'ORD-123',
   *   total: 1500.00,
   *   customerId: 'C-456'
   * });
   * ```
   *
   * @remarks
   * - Use para eventos de negócio importantes
   * - Aparece em staging e production
   * - Útil para analytics e auditoria
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;

    const entry: LogEntry = {
      level: "info",
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    console.info(this.formatMessage("info", message, context));
    this.addToHistory(entry);
  }

  /**
   * Registra situação que requer atenção mas não é crítica
   *
   * @param message - Descrição do problema potencial
   * @param context - Informações sobre o contexto do aviso
   *
   * @example
   * ```typescript
   * logger.warn('API rate limit approaching', {
   *   currentRate: 950,
   *   limit: 1000,
   *   endpoint: '/api/users'
   * });
   * ```
   *
   * @remarks
   * - Use para situações que podem evoluir para erro
   * - Sempre visível em todos os ambientes
   * - Considere alertas automáticos em produção
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;

    const entry: LogEntry = {
      level: "warn",
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    console.warn(this.formatMessage("warn", message, context));
    this.addToHistory(entry);
  }

  /**
   * Registra erro crítico que requer investigação imediata
   *
   * @param message - Descrição clara do erro
   * @param error - Objeto Error com stack trace
   * @param context - Contexto adicional para debugging
   *
   * @example
   * ```typescript
   * try {
   *   await saveOrder(data);
   * } catch (error) {
   *   logger.error('Failed to save order', error as Error, {
   *     orderId: data.id,
   *     userId: currentUser.id,
   *     attempt: retryCount
   *   });
   * }
   * ```
   *
   * @remarks
   * - Sempre inclua o objeto Error para stack trace
   * - Adicione contexto relevante para debugging
   * - Em produção, pode disparar alertas automáticos
   * - Integra com Sentry/GlitchTip quando configurado
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog("error")) return;

    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        errorName: error?.name,
        errorMessage: error?.message,
        errorStack: error?.stack,
      },
      error,
    };

    console.error(this.formatMessage("error", message, context), error);
    this.addToHistory(entry);

    // TODO: Enviar para serviço de monitoramento
    // this.sendToMonitoring(entry);
  }

  /**
   * Obtém histórico de logs
   */
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter((entry) => entry.level === level);
    }
    return [...this.logHistory];
  }

  /**
   * Limpa histórico de logs
   */
  clearHistory(): void {
    this.logHistory = [];
  }

  /**
   * Habilita/desabilita logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Define nível mínimo de log
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Exporta logs em formato JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Cria um logger filho com contexto fixo
   *
   * @example
   * ```typescript
   * const userLogger = logger.child({ userId: '123' });
   * userLogger.info('Action performed'); // Sempre inclui userId
   * ```
   */
  child(fixedContext: LogContext): Logger {
    const childLogger = new Logger();

    // Sobrescrever métodos para incluir contexto fixo
    const originalDebug = childLogger.debug.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);

    childLogger.debug = (msg: string, ctx?: LogContext) =>
      originalDebug(msg, { ...fixedContext, ...ctx });
    childLogger.info = (msg: string, ctx?: LogContext) =>
      originalInfo(msg, { ...fixedContext, ...ctx });
    childLogger.warn = (msg: string, ctx?: LogContext) =>
      originalWarn(msg, { ...fixedContext, ...ctx });
    childLogger.error = (msg: string, err?: Error, ctx?: LogContext) =>
      originalError(msg, err, { ...fixedContext, ...ctx });

    return childLogger;
  }
}

/**
 * Instância singleton do logger
 */
export const logger = new Logger();

/**
 * Cria timer de performance para medir duração de operações
 *
 * @param operation - Nome da operação sendo medida
 * @returns Objeto com método `end()` para finalizar medição
 *
 * @example
 * ```typescript
 * const timer = createTimer('database-query');
 * const results = await db.query('SELECT * FROM users');
 * timer.end({ recordCount: results.length }); // Log: "database-query completed in 45.23ms"
 * ```
 *
 * @example
 * ```typescript
 * // Medir operação complexa
 * const timer = createTimer('generate-report');
 * const report = await generateMonthlyReport(month);
 * const duration = timer.end({ reportSize: report.pages });
 * console.log(`Report took ${duration}ms`);
 * ```
 *
 * @remarks
 * - Use para identificar gargalos de performance
 * - Duração retornada em milissegundos com 2 casas decimais
 * - Timer automaticamente loga em nível debug
 * - Contexto adicional pode ser passado ao finalizar
 */
export function createTimer(operation: string) {
  const startTime = performance.now();

  return {
    end: (context?: LogContext) => {
      const duration = performance.now() - startTime;
      logger.debug(`${operation} completed`, {
        ...context,
        duration_ms: duration.toFixed(2),
      });
      return duration;
    },
  };
}

/**
 * Decorator para logar chamadas de função
 */
export function logFunctionCall(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    logger.debug(`Calling ${propertyKey}`, { args });
    const timer = createTimer(propertyKey);

    try {
      const result = await originalMethod.apply(this, args);
      timer.end({ success: true });
      return result;
    } catch (error) {
      timer.end({ success: false });
      logger.error(`${propertyKey} failed`, error as Error);
      throw error;
    }
  };

  return descriptor;
}

export default logger;
