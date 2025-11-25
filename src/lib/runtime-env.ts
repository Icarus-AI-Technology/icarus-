/**
 * Utilitário para acessar variáveis de ambiente tanto no browser (Vite)
 * quanto em contextos Node (scripts, testes, Supabase Functions etc).
 */
type EnvRecord = Record<string, string | undefined>;

const browserEnv: EnvRecord | undefined =
  typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: EnvRecord }).env
    ? (import.meta as unknown as { env?: EnvRecord }).env
    : undefined;

const nodeEnv: EnvRecord | undefined =
  typeof process !== 'undefined' && typeof process === 'object' ? process.env : undefined;

/**
 * Retorna o valor de uma variável de ambiente considerando os diferentes runtimes.
 * @param name Nome da variável (ex.: `VITE_SUPABASE_URL` ou `INFOSIMPLES_TOKEN`)
 */
export function getRuntimeEnvVar(name: string): string | undefined {
  const value = browserEnv?.[name] ?? nodeEnv?.[name];
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Helper para obter a role corrente do JWT quando exposta em variáveis de ambiente,
 * usado em testes/unitários.
 */
export function getJwtRoleClaim(): string | undefined {
  return getRuntimeEnvVar('SUPABASE_JWT_ROLE');
}
