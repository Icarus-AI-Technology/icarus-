// src/lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.generated';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const isBrowser = typeof window !== 'undefined';
const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

const memoryStorage: StorageLike = (() => {
  const store = new Map<string, string>();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
})();

// Supabase: sempre use variáveis de ambiente em produção; usamos placeholders para permitir build em preview.
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'your_anon_key_here';

if (!isTestEnv) {
  console.log('🔍 Supabase Config Debug:', {
    url: supabaseUrl,
    keyLength: supabaseAnonKey?.length,
    envUrl: import.meta.env.VITE_SUPABASE_URL,
  });
}

const authStorage = (isBrowser ? window.localStorage : memoryStorage) as StorageLike;

const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: isTestEnv ? 'icarus-auth-test' : 'icarus-web-auth',
    persistSession: isBrowser && !isTestEnv,
    autoRefreshToken: isBrowser && !isTestEnv,
    detectSessionInUrl: isBrowser && !isTestEnv,
    storage: authStorage,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application': 'icarus-v5',
    },
  },
});

/**
 * Cliente “solto” para cenários específicos (ex.: RPCs utilitárias que ainda
 * não estão descritas no schema). Evite usar fora dos helpers abaixo.
 */
const supabaseUntyped = supabaseClient as unknown as SupabaseClient<any>;

/**
 * Cliente tipado do Supabase. Utilize este export quando precisar de intellisense
 * alinhado ao schema.
 */
export const supabaseTyped = supabaseClient;

/**
 * Cliente padrão (relaxado) para neutralizar `SelectQueryError` até que o schema
 * esteja totalmente sincronizado.
 */
export const supabase = supabaseUntyped;

// Helper para configurar empresa_id atual (multi-tenant)
export async function setCurrentEmpresa(empresaId: string) {
  const { error } = await (supabaseUntyped as any).rpc('set_config', {
    setting: 'app.current_empresa_id',
    value: empresaId,
  });

  if (error) {
    console.error('Erro ao configurar empresa:', error);
  }
}

// Helper para configurar role do usuário
export async function setCurrentUserRole(role: string) {
  const { error } = await (supabaseUntyped as any).rpc('set_config', {
    setting: 'app.current_user_role',
    value: role,
  });

  if (error) {
    console.error('Erro ao configurar role:', error);
  }
}

// Realtime subscription helper
export function subscribeToTable(table: string, callback: (payload: unknown) => void) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}

export default supabase;
