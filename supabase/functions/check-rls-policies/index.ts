// Edge Function: check-rls-policies
// Auditoria de RLS - valida se todas as tabelas têm policies configuradas

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Query SQL para listar todas as tabelas e suas policies RLS
    const { data: tabelas, error: tabelasError } = await supabase.rpc('get_rls_status')

    if (tabelasError) {
      // Fallback: query manual via REST
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public')

      if (error) throw error

      const tabelasPublicas = data || []
      const relatorio = []

      for (const tabela of tabelasPublicas) {
        const tablename = tabela.tablename

        // Verificar se RLS está habilitado
        const { data: rlsEnabled } = await supabase.rpc('check_rls_enabled', { tablename })

        // Contar policies
        const { count: policiesCount } = await supabase
          .from('pg_policies')
          .select('*', { count: 'exact', head: true })
          .eq('tablename', tablename)

        relatorio.push({
          tabela: tablename,
          rls_habilitado: rlsEnabled,
          total_policies: policiesCount || 0,
          status: (rlsEnabled && policiesCount > 0) ? '✅ OK' : '⚠️ FALTA RLS',
        })
      }

      return new Response(JSON.stringify({
        total_tabelas: relatorio.length,
        tabelas_sem_rls: relatorio.filter(t => t.status.includes('FALTA')).length,
        relatorio: relatorio.sort((a, b) => a.status.localeCompare(b.status)),
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ tabelas }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

