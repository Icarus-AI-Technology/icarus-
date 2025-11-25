/**
 * OraclusX Forms - Helper Utilities
 * Funções auxiliares para manipulação de formulários e Supabase
 */

import { supabase } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Insere um registro em uma tabela do Supabase
 */
export async function insertRecord<T extends Record<string, unknown>>(
  tableName: string,
  data: Partial<T>
): Promise<{ data: T | null; error: PostgrestError | null; success: boolean }> {
  const { data: result, error } = await supabase.from(tableName).insert(data).select().single();

  return { data: result as T | null, error, success: !error };
}

/**
 * Extrai mensagem de erro legível de um erro do Supabase
 */
export function getSupabaseErrorMessage(error: PostgrestError | Error | unknown): string {
  if (!error) return 'Erro desconhecido';

  if (isPostgrestError(error)) {
    const pgError = error;

    // Mensagens comuns do Postgres traduzidas
    if (pgError.code === '23505') {
      return 'Já existe um registro com esses dados.';
    }
    if (pgError.code === '23503') {
      return 'Referência inválida a outro registro.';
    }
    if (pgError.code === '23502') {
      return 'Campo obrigatório não preenchido.';
    }

    return pgError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

/**
 * Formata dados do formulário removendo campos vazios
 */
export function cleanFormData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value !== '' && value !== null && value !== undefined) {
        cleaned[key] = value;
      }
    }
  }

  return cleaned;
}
