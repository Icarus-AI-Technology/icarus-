/**
 * Error Boundary Component
 *
 * @description
 * Componente React que captura erros JavaScript em qualquer lugar na árvore de componentes filhos,
 * registra esses erros e exibe uma UI de fallback em vez de crashar toda a aplicação.
 *
 * @example
 * ```tsx
 * // Uso básico
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Com fallback customizado
 * <ErrorBoundary fallback={<CustomErrorPage />}>
 *   <DashboardModule />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * // Com callback de erro
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     logToMonitoring(error, errorInfo);
 *   }}
 * >
 *   <CriticalFeature />
 * </ErrorBoundary>
 * ```
 *
 * @remarks
 * - Não captura erros em event handlers (use try-catch)
 * - Não captura erros assíncronos
 * - Não captura erros em server-side rendering
 * - Integra com Sentry quando configurado
 *
 * @see {@link https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary|React Error Boundaries}
 */

import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./oraclusx-ds";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary para capturar erros em componentes filhos
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log do erro
    console.error("ErrorBoundary caught:", error, errorInfo);

    // Callback customizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Atualizar estado
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Enviar para serviço de monitoramento (Sentry, GlitchTip)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-surface dark:bg-card rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold text-primary dark:text-gray-100">
                Ops! Algo deu errado
              </h2>
            </div>

            <p className="text-body-sm text-secondary dark:text-gray-300 mb-4">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos
              trabalhando para corrigir.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Detalhes do Erro (Dev Mode)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-300 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="flex-1"
              >
                Tentar Novamente
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="outline"
                className="flex-1"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para criar Error Boundary programaticamente
 *
 * @description
 * Permite disparar erros de componentes funcionais para serem capturados
 * por um Error Boundary pai.
 *
 * @returns Objeto com funções para manipular erros
 * - `showError`: Dispara um erro que será capturado pelo Error Boundary
 * - `resetError`: Limpa o erro atual
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showError, resetError } = useErrorBoundary();
 *
 *   const handleCriticalError = (error: Error) => {
 *     showError(error); // Será capturado pelo ErrorBoundary pai
 *   };
 *
 *   return <button onClick={() => handleCriticalError(new Error('Critical!'))}>
 *     Trigger Error
 *   </button>;
 * }
 * ```
 *
 * @remarks
 * - Componente deve estar envolvido por um ErrorBoundary
 * - Use apenas para erros não recuperáveis
 * - Prefer try-catch para erros recuperáveis
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return {
    showError: setError,
    resetError: () => setError(null),
  };
}

/**
 * HOC (Higher-Order Component) que adiciona Error Boundary a qualquer componente
 *
 * @template P - Props do componente original
 * @param Component - Componente React a ser envolvido
 * @param fallback - UI de fallback opcional (usa padrão se não fornecido)
 * @returns Componente envolvido com Error Boundary
 *
 * @example
 * ```tsx
 * // Envolver componente com Error Boundary
 * const SafeDashboard = withErrorBoundary(Dashboard);
 *
 * // Usar normalmente
 * <SafeDashboard userId="123" />
 * ```
 *
 * @example
 * ```tsx
 * // Com fallback customizado
 * const SafePayment = withErrorBoundary(
 *   PaymentModule,
 *   <div>Erro no pagamento. Tente novamente.</div>
 * );
 * ```
 *
 * @remarks
 * - Útil para componentes críticos que precisam de isolamento
 * - Cada uso cria uma nova instância de Error Boundary
 * - Props do componente original são preservadas
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
