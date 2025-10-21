import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Edge Function: Recalcular KPIs
 * 
 * Recalcula views materializadas de KPIs do dashboard
 * Pode ser invocado manualmente ou via cron
 * 
 * @endpoint POST /functions/v1/recalcular_kpis
 * @body { view?: string, empresa_id?: string }
 * @returns { success: boolean, refreshed: string[], duration_ms: number }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RecalcularKPIsRequest {
  view?: string // 'vw_dashboard_kpis' | 'all'
  empresa_id?: string // Filtro opcional
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Autenticação (Service Role para operações privilegiadas)
    const authHeader = req.headers.get('Authorization')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!authHeader && !serviceRoleKey) {
      throw new Error('Missing authorization')
    }

    // Inicializar Supabase Client com Service Role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey ?? '',
    )

    // Parse do body
    const { view = 'all', empresa_id }: RecalcularKPIsRequest = await req.json().catch(() => ({}))

    const startTime = Date.now()
    const refreshed: string[] = []

    // Refresh view materializada: vw_dashboard_kpis
    if (view === 'all' || view === 'vw_dashboard_kpis') {
      console.log('[Refresh] Iniciando refresh: vw_dashboard_kpis')
      
      const { error } = await supabaseClient.rpc('refresh_dashboard_kpis')
      
      if (error) {
        console.error('[Refresh Error] vw_dashboard_kpis:', error)
        throw new Error(`Erro ao atualizar vw_dashboard_kpis: ${error.message}`)
      }
      
      refreshed.push('vw_dashboard_kpis')
      console.log('[Refresh] ✅ vw_dashboard_kpis atualizado')
    }

    // Adicionar outras views materializadas aqui
    // if (view === 'all' || view === 'vw_outra_view') { ... }

    const duration = Date.now() - startTime

    // Registrar evento de refresh
    await supabaseClient
      .from('system_events')
      .insert({
        event_type: 'kpi_refresh',
        event_data: {
          views_refreshed: refreshed,
          duration_ms: duration,
          empresa_id: empresa_id || null,
          timestamp: new Date().toISOString()
        }
      })
      .catch(err => console.error('[Event Log Error]', err))

    return new Response(
      JSON.stringify({
        success: true,
        refreshed,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('[Recalcular KPIs Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

/* Deno.serve(main) */

