import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Edge Function: Validação de CRM no CFM
 * 
 * Valida se um CRM de médico está ativo e regular no Conselho Federal de Medicina
 * 
 * @endpoint POST /functions/v1/valida_crm_cfm
 * @body { crm: string, uf: string }
 * @returns { valido: boolean, dados: object, cache: boolean }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidaCRMRequest {
  crm: string
  uf: string
}

interface CRMCacheData {
  crm: string
  uf: string
  valido: boolean
  nome?: string
  especialidade?: string
  situacao?: string
  cached_at: string
  expires_at: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Inicializar Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Parse do body
    const { crm, uf }: ValidaCRMRequest = await req.json()

    if (!crm || !uf) {
      throw new Error('CRM e UF são obrigatórios')
    }

    // Verificar cache (TTL: 30 dias)
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('crm_cache')
      .select('*')
      .eq('crm', crm)
      .eq('uf', uf.toUpperCase())
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .single()

    if (cachedData && !cacheError) {
      console.log(`[CRM Cache HIT] ${crm}/${uf}`)
      return new Response(
        JSON.stringify({
          valido: cachedData.valido,
          dados: {
            nome: cachedData.nome,
            especialidade: cachedData.especialidade,
            situacao: cachedData.situacao,
          },
          cache: true,
          cached_at: cachedData.cached_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`[CRM Cache MISS] ${crm}/${uf} - Consultando CFM...`)

    // Consultar API do CFM (simulado - implementar integração real)
    // URL Real: https://portal.cfm.org.br/api/v1/medicos?crm={crm}&uf={uf}
    
    // MOCK para demonstração (substituir por chamada real)
    const mockResponse = await simulateAPICall(crm, uf)

    // Salvar no cache
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // TTL: 30 dias

    const { error: insertError } = await supabaseClient
      .from('crm_cache')
      .upsert({
        crm,
        uf: uf.toUpperCase(),
        valido: mockResponse.valido,
        nome: mockResponse.nome,
        especialidade: mockResponse.especialidade,
        situacao: mockResponse.situacao,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('[CRM Cache Error]', insertError)
    }

    return new Response(
      JSON.stringify({
        valido: mockResponse.valido,
        dados: {
          nome: mockResponse.nome,
          especialidade: mockResponse.especialidade,
          situacao: mockResponse.situacao,
        },
        cache: false,
        consulted_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('[Validação CRM Error]', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

/**
 * Simula chamada à API do CFM
 * TODO: Implementar integração real com https://portal.cfm.org.br/api
 */
async function simulateAPICall(crm: string, uf: string) {
  // Simulação: 80% dos CRMs são válidos
  const valido = Math.random() > 0.2
  
  // Delay simulado
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    valido,
    nome: valido ? `Dr(a). Exemplo ${crm}` : null,
    especialidade: valido ? 'Ortopedia' : null,
    situacao: valido ? 'Ativo' : 'Inativo'
  }
}

/* Deno.serve(main) */

