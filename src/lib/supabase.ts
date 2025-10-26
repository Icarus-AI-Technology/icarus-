import { createClient } from "@supabase/supabase-js";

function getEnvOr(name: string, fallback?: string): string {
  const env = import.meta.env as unknown as Record<string, string | boolean | undefined>;
  const raw = env[name];
  const value = typeof raw === "string" && raw.trim().length > 0 ? raw : undefined;
  if (value) return value;
  if (typeof fallback === "string" && fallback.length > 0) {
    if (env?.DEV) console.warn(`[supabase] Missing ${name}; using dev fallback.`);
    return fallback;
  }
  throw new Error(`Missing required environment variable: ${name}`);
}

const isDev = Boolean((import.meta.env as unknown as Record<string, unknown>)?.DEV);

// Dev fallbacks avoid crashing the dev server when env is not configured.
const supabaseUrl = getEnvOr("VITE_SUPABASE_URL", isDev ? "http://localhost:54321" : undefined);
const supabaseAnonKey = getEnvOr("VITE_SUPABASE_ANON_KEY", isDev ? "anon_key" : undefined);

// Use untyped client until Supabase CLI generates real Database types
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
