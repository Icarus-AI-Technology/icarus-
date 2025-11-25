/**
 * Utilitários para normalização de erros em blocos try/catch.
 */

/**
 * Converte qualquer valor desconhecido em uma instância de Error.
 */
export function toAppError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

/**
 * Faz o log e retorna o erro normalizado.
 */
export function logAndWrapError(prefix: string, error: unknown): Error {
  const err = toAppError(error);
  if (prefix) {
    console.error(prefix, err);
  }
  return err;
}
