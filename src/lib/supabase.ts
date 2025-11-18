// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types.generated'

// Credenciais do projeto ICARUS
const supabaseUrl = 'https://gvbkviozlhxorjoavmky.supabase.co'

  // ANON KEY obtida via Supabase CLI (válida até 2078)
  // Dashboard: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/settings/api
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ3NjUsImV4cCI6MjA3ODk5MDc2NX0.RtCGqdZ8KE-sbqG1w4E9dg2tqSEdusO4vbbr-3456c8'

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
  const { error } = await supabase.rpc('set_config', {
    setting: 'app.current_empresa_id',
    value: empresaId
  })
  
  if (error) {
    console.error('Erro ao configurar empresa:', error)
  }
}

// Helper para configurar role do usuário
export async function setCurrentUserRole(role: string) {
  const { error } = await supabase.rpc('set_config', {
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
