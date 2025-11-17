/**
 * Componente de Fallback para Error Boundary
 * Exibe UI amigável quando ocorre um erro
 */

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "./oraclusx-ds";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  showDetails?: boolean;
}

/**
 * Fallback UI padrão para erros
 */
export function ErrorFallback({
  error,
  resetError,
  showDetails = false,
}: ErrorFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-surface dark:bg-card rounded-lg p-8 shadow-neu-lg">
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-semibold text-center text-primary dark:text-gray-100 mb-3">
          Ops! Algo deu errado
        </h2>

        {/* Descrição */}
        <p className="text-body-sm text-center text-secondary dark:text-gray-300 mb-6">
          Ocorreu um erro inesperado. Nossa equipe foi notificada
          automaticamente.
        </p>

        {/* Detalhes do erro (apenas em desenvolvimento) */}
        {(isDev || showDetails) && error && (
          <details className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400 mb-2">
              Detalhes Técnicos
            </summary>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-300">
                  Mensagem:
                </span>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  {error.message}
                </p>
              </div>
              {error.stack && (
                <div>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-300">
                    Stack Trace:
                  </span>
                  <pre className="text-xs text-red-600 dark:text-red-300 overflow-auto mt-1 max-h-40">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Ações */}
        <div className="flex flex-col gap-3">
          {resetError && (
            <Button onClick={resetError} variant="primary" className="w-full">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}

          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>

          {isDev && (
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="w-full text-sm"
            >
              Recarregar Página
            </Button>
          )}
        </div>

        {/* Informações de suporte */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-secondary dark:text-gray-400">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback minimalista para erros
 */
export function MinimalErrorFallback() {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        <p className="text-sm text-red-700 dark:text-red-300">
          Erro ao carregar este componente.
        </p>
      </div>
    </div>
  );
}
