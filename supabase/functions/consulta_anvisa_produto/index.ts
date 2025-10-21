import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Edge Function: Consulta ANVISA
 * 
 * Consulta informações de produtos OPME no banco de dados da ANVISA
 * 
 * @endpoint POST /functions/v1/consulta_anvisa_produto
 * @body { registro_anvisa: string }
 * @returns { encontrado: boolean, dados: object, cache: boolean }
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConsultaAnvisaRequest {
  registro_anvisa: string
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
    const { registro_anvisa }: ConsultaAnvisaRequest = await req.json()

    if (!registro_anvisa) {
      throw new Error('Registro ANVISA é obrigatório')
    }

    // Verificar cache (TTL: 90 dias)
    const { data: cachedData, error: cacheError } = await supabaseClient
      .from('anvisa_cache')
      .select('*')
      .eq('registro_anvisa', registro_anvisa)
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .single()

    if (cachedData && !cacheError) {
      console.log(`[ANVISA Cache HIT] ${registro_anvisa}`)
      return new Response(
        JSON.stringify({
          encontrado: cachedData.encontrado,
          dados: cachedData.dados,
          cache: true,
          cached_at: cachedData.cached_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`[ANVISA Cache MISS] ${registro_anvisa} - Consultando ANVISA...`)

    // Consultar API da ANVISA (simulado - implementar integração real)
    // URL Real: https://consultas.anvisa.gov.br/api/consulta/produtos
    
    const mockResponse = await simulateAnvisaAPI(registro_anvisa)

    // Salvar no cache
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90) // TTL: 90 dias

    const { error: insertError } = await supabaseClient
      .from('anvisa_cache')
      .upsert({
        registro_anvisa,
        encontrado: mockResponse.encontrado,
        dados: mockResponse.dados,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      })

    if (insertError) {
      console.error('[ANVISA Cache Error]', insertError)
    }

    return new Response(
      JSON.stringify({
        encontrado: mockResponse.encontrado,
        dados: mockResponse.dados,
        cache: false,
        consulted_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('[Consulta ANVISA Error]', error)
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
 * Simula chamada à API da ANVISA
 * TODO: Implementar integração real com https://consultas.anvisa.gov.br/api
 */
async function simulateAnvisaAPI(registro: string) {
  // Simulação: 70% dos registros são encontrados
  const encontrado = Math.random() > 0.3
  
  // Delay simulado
  await new Promise(resolve => setTimeout(resolve, 800))
  
  if (!encontrado) {
    return {
      encontrado: false,
      dados: null
    }
  }
  
  return {
    encontrado: true,
    dados: {
      registro_anvisa: registro,
      numero_processo: `25351.${Math.floor(Math.random() * 999999)}/2024-${Math.floor(Math.random() * 99)}`,
      nome_produto: 'Exemplo OPME ' + registro,
      fabricante: 'Fabricante Demo Ltda',
      categoria: 'OPME - Órtese/Prótese',
      situacao: 'Ativo',
      data_vencimento: null,
      classe_risco: 'III',
      modelo_aplicavel: true
    }
  }
}

/* Deno.serve(main) */

