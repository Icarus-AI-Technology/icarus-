import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z, ZodError } from 'zod';
import { createClient } from '@supabase/supabase-js';

type VectorRow = {
  external_id: string;
  module: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
};

const vectorSchema = z.object({
  external_id: z.string().min(1),
  module: z.string().min(1),
  embedding: z.array(z.number()),
  metadata: z.record(z.any()).default({}),
});

const bodySchema = z.object({ vectors: z.array(vectorSchema).min(1) });

const featureFlags = ['FF_AI_TUTOR_CIRURGIAS', 'FF_TUTOR_CIRURGIAS', 'FF_ML_QUEUE'];

function isFeatureEnabled() {
  return featureFlags.some((key) => {
    const value = process.env[key];
    return value ? /^(1|true|on|enabled)$/i.test(value) : false;
  });
}

function getSupabaseClient(req: VercelRequest) {
  const url = process.env.SUPABASE_URL;
  if (!url) {
    throw new Error('SUPABASE_URL não configurada');
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = req.headers.authorization;
  const token = serviceKey ?? authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    throw new Error('Token de autenticação ausente');
  }

  return createClient(url, token, { auth: { persistSession: false } });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, x-client-info, apikey, content-type'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isFeatureEnabled()) {
    return res.status(403).json({ error: 'Recurso desabilitado via feature flag' });
  }

  let client;
  try {
    client = getSupabaseClient(req);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }

  try {
    if (req.method === 'POST') {
      let parsed;
      try {
        parsed = bodySchema.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ error: 'Payload inválido', details: error.flatten() });
        }
        throw error;
      }

      const rows = parsed.vectors.map((item) => ({
        external_id: item.external_id,
        module: item.module,
        embedding: item.embedding,
        metadata: item.metadata,
        dimension: item.embedding.length,
      }));

      const { error } = await client.from('ml_vectors').upsert(rows);

      if (error) {
        return res
          .status(500)
          .json({ error: 'Falha ao persistir vetores', details: error.message });
      }

      return res.status(200).json({ status: 'ok' });
    }

    if (req.method === 'DELETE') {
      const { error } = await client
        .from('ml_vectors')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        return res.status(500).json({ error: 'Falha ao apagar vetores', details: error.message });
      }

      return res.status(200).json({ status: 'cleared' });
    }

    if (req.method === 'GET') {
      const { external_id: externalId, module } = req.query as Partial<VectorRow>;
      let query = client.from('ml_vectors').select('id, external_id, module, metadata');

      if (externalId) {
        query = query.eq('external_id', externalId as string);
      }

      if (module) {
        query = query.eq('module', module as string);
      }

      const { data, error } = await query.limit(200);

      if (error) {
        return res.status(500).json({ error: 'Falha ao listar vetores', details: error.message });
      }

      return res.status(200).json({ vectors: data });
    }

    return res.status(405).json({ error: 'Método não suportado' });
  } catch (error) {
    console.error('[ml/vectors] erro inesperado', error);
    return res.status(500).json({ error: 'Erro interno', details: (error as Error).message });
  }
}
