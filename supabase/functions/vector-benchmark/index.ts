import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requestSchema = z.object({
  query: z.array(z.number()).min(1),
  topK: z.number().int().positive().max(50).default(5),
  module: z.string().optional(),
  faissUrl: z.string().url(),
  vectorSearchUrl: z.string().url(),
  vectorSearchToken: z.string().optional(),
});

async function fetchFaiss(url: string, query: number[], topK: number) {
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });
  const latency = performance.now() - start;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FAISS request failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  const ids = Array.isArray(json.ids) ? json.ids : [];
  return { ids, latency };
}

async function fetchPgvector(url: string, token: string | undefined, query: number[], topK: number, module?: string) {
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, topK, module }),
  });
  const latency = performance.now() - start;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`pgvector request failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  type PgVectorRow = { external_id?: string; id?: string };
  const results: PgVectorRow[] = Array.isArray(json.results) ? (json.results as PgVectorRow[]) : [];
  const ids = results.map((row: PgVectorRow) => row.external_id ?? row.id ?? '');
  return { ids, latency };
}

function recallAtK(reference: string[], candidate: string[]) {
  if (reference.length === 0) return 0;
  const set = new Set(candidate);
  const intersection = reference.filter((id) => set.has(id));
  return intersection.length / reference.length;
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não suportado' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const payload = requestSchema.parse(body);

    const faiss = await fetchFaiss(payload.faissUrl, payload.query, payload.topK);
    const pgvector = await fetchPgvector(
      payload.vectorSearchUrl,
      payload.vectorSearchToken,
      payload.query,
      payload.topK,
      payload.module,
    );

    const recall = recallAtK(faiss.ids, pgvector.ids);

    const response = {
      summary: {
        faissLatencyMs: faiss.latency,
        pgvectorLatencyMs: pgvector.latency,
        recallAtK: recall,
      },
      detail: {
        faissIds: faiss.ids,
        pgvectorIds: pgvector.ids,
      },
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[vector-benchmark] erro', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao executar benchmark', details: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
}
