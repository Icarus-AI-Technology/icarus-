import { useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ErrorData {
  tipo: 'erro_aplicacao' | 'erro_validacao' | 'erro_permissao' | 'erro_rede' | 'erro_banco' | 'erro_integracao';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  modulo: string;
  mensagem: string;
  stack_trace?: string;
  contexto?: Record<string, unknown>;
  impacto?: string;
  solucao_sugerida?: string;
}

export const useErrorHandler = () => {
  const { usuario } = useAuth();

  // Função para registrar erro
  const logError = useCallback(async (errorData: ErrorData) => {
    try {
      const { error } = await supabase.from('system_errors').insert({
        usuario_id: usuario?.id,
        tipo: errorData.tipo,
        severidade: errorData.severidade,
        modulo: errorData.modulo,
        mensagem: errorData.mensagem,
        stack_trace: errorData.stack_trace,
        contexto: errorData.contexto,
        impacto: errorData.impacto,
        solucao_sugerida: errorData.solucao_sugerida,
      });

      if (error) {
        const err = error as Error;
        console.error('Erro ao registrar erro no sistema:', err);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Falha crítica ao registrar erro:', err);
    }
  }, [usuario]);

  // Handler global de erros não capturados
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logError({
        tipo: 'erro_aplicacao',
        severidade: 'alta',
        modulo: 'global',
        mensagem: event.message,
        stack_trace: event.error?.stack,
        contexto: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logError({
        tipo: 'erro_aplicacao',
        severidade: 'alta',
        modulo: 'global',
        mensagem: `Promise rejeitada: ${event.reason}`,
        stack_trace: event.reason?.stack,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [logError]);

  // Wrapper para try-catch com auto-logging
  const withErrorHandler = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => R | Promise<R>,
    modulo: string,
    severidade: ErrorData['severidade'] = 'media'
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        const err = error as Error;
        await logError({
          tipo: 'erro_aplicacao',
          severidade,
          modulo,
          mensagem: err.message || 'Erro desconhecido',
          stack_trace: err.stack,
          contexto: { args },
        });
        return null;
      }
    };
  }, [logError]);

  return {
    logError,
    withErrorHandler,
  };
};

