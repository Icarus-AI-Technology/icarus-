function readFromImportMeta(key: string): string | undefined {
  if (typeof import.meta === 'undefined') return undefined;
  const env = (import.meta as unknown as { env?: Record<string, unknown> }).env;
  const raw = env?.[key];
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'boolean') return raw ? 'true' : 'false';
  return undefined;
}

function readFromProcessEnv(key: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined;
  return process.env[key];
}

export function isFeatureEnabled(envKey: string): boolean {
  const raw = readFromImportMeta(envKey) ?? readFromProcessEnv(envKey);
  if (!raw) return false;
  return /^(1|true|on|enabled)$/i.test(String(raw).trim());
}
