import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

const vectorSchema = z.object({
  external_id: z.string().min(1),
  module: z.string().min(1),
  metadata: z.record(z.any()).default({}),
  embedding: z.array(z.number()),
});

const insertSchema = z.object({ vectors: z.array(vectorSchema).min(1) });

const featureFlags = ['FF_AI_TUTOR_CIRURGIAS', 'FF_TUTOR_CIRURGIAS', 'FF_ML_QUEUE'];

function isFeatureEnabled() {
  return featureFlags.some((key) => {
    const value = Deno.env.get(key);
    return value ? /^(1|true|on|enabled)$/i.test(value) : false;
  });
}

async function getSupabaseClient(req: Request) {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) {
    throw new Error('SUPABASE_URL não configurada');
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('authorization');
  const token = serviceKey ?? authHeader;

  if (!token) {
    throw new Error('Token de autenticação ausente');
  }

  return createClient(url, token, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
}

async function handleInsert(req: Request) {
  const payload = await req.json();
  const parsed = insertSchema.safeParse(payload);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Payload inválido', details: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = await getSupabaseClient(req);

  const rows = parsed.data.vectors.map((item) => ({
    external_id: item.external_id,
    module: item.module,
    metadata: item.metadata,
    embedding: item.embedding,
    dimension: item.embedding.length,
  }));

  const { error, data } = await supabase.from('ml_vectors').upsert(rows).select('id, external_id');

  if (error) {
    console.error('[ml-vectors] insert error', error);
    return new Response(JSON.stringify({ error: 'Falha ao persistir vetores', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'ok', upserted: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleClear(req: Request) {
  const supabase = await getSupabaseClient(req);

  const { error } = await supabase.from('ml_vectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('[ml-vectors] clear error', error);
    return new Response(JSON.stringify({ error: 'Falha ao limpar vetores', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ status: 'cleared' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRetrieve(req: Request) {
  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get('external_id');
  const module = searchParams.get('module');

  const supabase = await getSupabaseClient(req);

  let query = supabase.from('ml_vectors').select('id, external_id, module, metadata, embedding, dimension');

  if (externalId) {
    query = query.eq('external_id', externalId);
  }

  if (module) {
    query = query.eq('module', module);
  }

  const { data, error } = await query.limit(200);

  if (error) {
    console.error('[ml-vectors] retrieve error', error);
    return new Response(JSON.stringify({ error: 'Falha ao listar vetores', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ vectors: data ?? [] }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (!isFeatureEnabled()) {
    return new Response(JSON.stringify({ error: 'Recurso desabilitado via feature flag' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await handleInsert(req);
      case 'DELETE':
        return await handleClear(req);
      case 'GET':
        return await handleRetrieve(req);
      default:
        return new Response(JSON.stringify({ error: 'Método não suportado' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', Allow: 'GET, POST, DELETE, OPTIONS' },
        });
    }
  } catch (error) {
    console.error('[ml-vectors] erro inesperado', error);
    return new Response(JSON.stringify({ error: 'Erro interno', details: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
