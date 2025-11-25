import * as Sentry from '@sentry/react';

/**
 * Inicializa o Sentry para monitoramento de erros
 *
 * Para configurar:
 * 1. Crie conta em: https://sentry.io
 * 2. Crie novo projeto React
 * 3. Copie o DSN
 * 4. Adicione VITE_SENTRY_DSN nas env vars da Vercel
 * 5. Adicione VITE_SENTRY_AUTH_TOKEN para source maps
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development';
const RELEASE = import.meta.env.VITE_APP_VERSION || 'unknown';

export function initSentry() {
  // Só inicializa se o DSN estiver configurado
  if (!SENTRY_DSN) {
    console.warn('[Sentry] DSN não configurado. Monitoring desabilitado.');
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Integrations
      integrations: [
        // Captura erros de React components
        Sentry.browserTracingIntegration(),

        // Captura interações do usuário
        Sentry.replayIntegration({
          // Replay apenas em erros (economiza dados)
          maskAllText: true,
          blockAllMedia: true,
        }),

        // Performance profiling
        Sentry.browserProfilingIntegration(),
      ],

      // Performance Monitoring
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0, // 10% em prod, 100% em dev

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% das sessões
      replaysOnErrorSampleRate: 1.0, // 100% dos erros

      // Profiling
      profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

      // Environment
      environment: ENVIRONMENT,
      release: RELEASE,

      // Filtros
      beforeSend(event, hint) {
        // Não envia erros em desenvolvimento (opcional)
        if (ENVIRONMENT === 'development' && !import.meta.env.VITE_SENTRY_DEV_MODE) {
          return null;
        }

        // Filtrar erros conhecidos/esperados
        const error = hint.originalException as Error;
        if (error?.message?.includes('ResizeObserver loop')) {
          // Erro conhecido do ResizeObserver que pode ser ignorado
          return null;
        }

        // Adicionar contexto extra
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'ICARUS',
            version: RELEASE,
          },
        };

        return event;
      },

      // Ignorar certos erros
      ignoreErrors: [
        // Erros de extensões de browser
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',

        // Erros de rede que não podemos controlar
        'NetworkError',
        'Network request failed',
        'Failed to fetch',

        // Erros de timeout
        'timeout',
        'AbortError',

        // Erros conhecidos que podem ser ignorados
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
      ],

      // Não capturar URLs de extensões de browser
      denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i],
    });

    // Configurar usuário (após login)
    // Sentry.setUser({ id, email, username });

    console.log('[Sentry] Inicializado com sucesso');
  } catch (error) {
    console.error('[Sentry] Erro ao inicializar:', error);
  }
}

/**
 * Captura erro manualmente
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;

  Sentry.captureException(error, {
    contexts: { extra: context },
  });
}

/**
 * Captura mensagem/evento manualmente
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!SENTRY_DSN) return;

  Sentry.captureMessage(message, level);
}

/**
 * Adiciona breadcrumb (rastro de eventos)
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  if (!SENTRY_DSN) return;

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Define usuário autenticado
 */
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (!SENTRY_DSN) return;

  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Define tags customizadas
 */
export function setTag(key: string, value: string) {
  if (!SENTRY_DSN) return;

  Sentry.setTag(key, value);
}

/**
 * Define contexto extra
 */
export function setContext(name: string, context: Record<string, unknown>) {
  if (!SENTRY_DSN) return;

  Sentry.setContext(name, context);
}

/**
 * HOC para ErrorBoundary
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Hooks do Sentry
 */
export { Sentry };
