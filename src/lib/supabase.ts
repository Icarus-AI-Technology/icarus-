// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types.generated'

// Supabase: sempre use variáveis de ambiente em produção; usamos placeholders para permitir build em preview.
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  'https://placeholder.supabase.co'
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  'your_anon_key_here'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application': 'icarus-v5'
    }
  }
})

// Helper para configurar empresa_id atual (multi-tenant)
export async function setCurrentEmpresa(empresaId: string) {
  const { error } = await (supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }> }).rpc('set_config', {
    setting: 'app.current_empresa_id',
    value: empresaId
  })
  
  if (error) {
    console.error('Erro ao configurar empresa:', error)
  }
}

// Helper para configurar role do usuário
export async function setCurrentUserRole(role: string) {
  const { error } = await (supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }> }).rpc('set_config', {
    setting: 'app.current_user_role',
    value: role
  })
  
  if (error) {
    console.error('Erro ao configurar role:', error)
  }
}

// Realtime subscription helper
export function subscribeToTable(
  table: string,
  callback: (payload: unknown) => void
) {
  return supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      callback
    )
    .subscribe()
}

export default supabase
