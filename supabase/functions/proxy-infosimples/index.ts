import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { endpoint, method = 'GET', body } = await req.json()
    const INFOSIMPLES_TOKEN = Deno.env.get('INFOSIMPLES_TOKEN')

    if (!INFOSIMPLES_TOKEN) {
      throw new Error('INFOSIMPLES_TOKEN not configured')
    }

    const payload =
      body && typeof body === 'object'
        ? { ...body, token: body.token ?? INFOSIMPLES_TOKEN }
        : { token: INFOSIMPLES_TOKEN }

    const response = await fetch(`https://api.infosimples.com/api/v2${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${INFOSIMPLES_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: method === 'GET' ? undefined : JSON.stringify(payload),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
