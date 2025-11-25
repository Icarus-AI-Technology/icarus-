import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const requestSchema = z.object({
  query: z.array(z.number()).min(1),
  topK: z.number().int().positive().max(50).default(5),
  module: z.string().optional(),
});

type VectorResult = { id: string; distance?: number; metadata?: Record<string, unknown> };

// Tipos explícitos para respostas dos backends de vetor
type PgvectorRow = {
  id?: string;
  external_id?: string;
  distance?: number;
  metadata?: Record<string, unknown>;
};

type WeaviateDoc = {
  _additional?: { id?: string; distance?: number };
  module?: string;
};

type QdrantPoint = {
  id: string | number;
  score: number;
};

const featureFlags = ['FF_AI_TUTOR_CIRURGIAS', 'FF_TUTOR_CIRURGIAS', 'FF_ML_QUEUE'];
const MODULE_FILTER_REGEX = /^[A-Za-z0-9_-]{1,64}$/;
const VECTOR_BACKEND = process.env.VECTOR_BACKEND || 'pgvector';

function featureEnabled() {
  return featureFlags.some((key) => {
    const raw = process.env[key];
    return raw ? /^(1|true|on|enabled)$/i.test(raw) : false;
  });
}

function sanitizeModuleFilter(module?: string | null): string | undefined {
  if (!module) return undefined;
  const trimmed = module.trim();
  if (!trimmed) return undefined;
  if (!MODULE_FILTER_REGEX.test(trimmed)) {
    throw new Error(
      'Filtro "module" inválido. Use apenas letras, números, hífen ou underscore (máx. 64 caracteres).'
    );
  }
  return trimmed;
}

async function searchFaiss(query: number[], topK: number): Promise<VectorResult[]> {
  const baseUrl = process.env.ML_API_URL;
  if (!baseUrl) throw new Error('ML_API_URL não configurada para FAISS');

  const res = await fetch(`${baseUrl}/vector/faiss/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FAISS search failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  const ids: string[] = json.ids || [];
  const distances: number[] = json.distances || [];

  return ids.map((id, idx) => ({ id, distance: distances[idx] }));
}

async function searchPgvector(
  query: number[],
  topK: number,
  module?: string
): Promise<VectorResult[]> {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL não configurada');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc('vector_search_raw', {
    query,
    module,
    limit_rows: topK,
  });

  if (error) {
    throw new Error(`pgvector search failed: ${error.message}`);
  }

  const rows = (data || []) as PgvectorRow[];
  return rows
    .map((row) => ({
      id: String(row.external_id ?? row.id ?? ''),
      distance: row.distance,
      metadata: row.metadata,
    }))
    .filter((r) => r.id.length > 0);
}

async function searchMilvus(
  query: number[],
  topK: number,
  module?: string
): Promise<VectorResult[]> {
  const endpoint = process.env.MILVUS_ENDPOINT;
  if (!endpoint) throw new Error('MILVUS_ENDPOINT não configurada');

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topK, module }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Milvus search failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  return json.results || [];
}

async function searchWeaviate(
  query: number[],
  topK: number,
  module?: string
): Promise<VectorResult[]> {
  const baseUrl = process.env.WEAVIATE_URL;
  if (!baseUrl) throw new Error('WEAVIATE_URL não configurada');

  const graphqlQuery = {
    query: `{
      Get {
        Document(
          nearVector: {vector: [${query.join(',')}]}${module ? `, where: {path: ["module"], operator: Equal, valueText: "${module}"}` : ''}
          limit: ${topK}
        ) {
          _additional { id distance }
          module
        }
      }
    }`,
  };

  const res = await fetch(`${baseUrl}/v1/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphqlQuery),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Weaviate search failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  const docs: WeaviateDoc[] = json?.data?.Get?.Document || [];
  return docs
    .map((doc) => ({ id: doc._additional?.id ?? '', distance: doc._additional?.distance }))
    .filter((r) => r.id.length > 0);
}

async function searchQdrant(
  query: number[],
  topK: number,
  module?: string
): Promise<VectorResult[]> {
  const baseUrl = process.env.QDRANT_URL;
  const collection = process.env.QDRANT_COLLECTION || 'ml_vectors';
  if (!baseUrl) throw new Error('QDRANT_URL não configurada');

  const res = await fetch(`${baseUrl}/collections/${collection}/points/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vector: query,
      limit: topK,
      filter: module ? { must: [{ key: 'module', match: { value: module } }] } : undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Qdrant search failed: ${res.status} ${res.statusText} → ${body}`);
  }

  const json = await res.json();
  const points: QdrantPoint[] = json.result || [];
  return points.map((item) => ({ id: String(item.id), distance: item.score }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, x-client-info, apikey, content-type'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!featureEnabled()) {
    return res.status(403).json({ error: 'Recurso desabilitado via feature flag' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não suportado' });
  }

  let payload;
  try {
    payload = requestSchema.parse(req.body);
  } catch (error) {
    return res.status(400).json({ error: 'Payload inválido', details: (error as Error).message });
  }

  try {
    const topK = payload.topK ?? 5;
    const safeModule = sanitizeModuleFilter(payload.module);
    let results: VectorResult[] = [];

    switch (VECTOR_BACKEND) {
      case 'faiss':
        results = await searchFaiss(payload.query, topK);
        break;
      case 'pgvector':
        results = await searchPgvector(payload.query, topK, safeModule);
        break;
      case 'milvus':
        results = await searchMilvus(payload.query, topK, safeModule);
        break;
      case 'weaviate':
        results = await searchWeaviate(payload.query, topK, safeModule);
        break;
      case 'qdrant':
        results = await searchQdrant(payload.query, topK, safeModule);
        break;
      default:
        throw new Error(`VECTOR_BACKEND não suportado: ${VECTOR_BACKEND}`);
    }

    return res.status(200).json({ backend: VECTOR_BACKEND, results });
  } catch (error) {
    console.error('[vector-search] erro inesperado', error);
    return res.status(500).json({ error: 'Erro interno', details: (error as Error).message });
  }
}
