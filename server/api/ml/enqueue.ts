import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { mlQueue } from '@/lib/queue/bullmq.service';
import type { MLJobPayload } from '@/lib/queue/workers/ml.worker';

const jobSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('llm'),
    prompt: z.string().min(1, 'prompt é obrigatório'),
  }),
  z.object({
    type: z.literal('finance-sentiment'),
    text: z.string().min(1, 'text é obrigatório'),
  }),
  z.object({
    type: z.literal('optimizer'),
    objective: z.array(z.number()).min(1, 'objective precisa de pelo menos um valor'),
  }),
  z
    .object({
      type: z.literal('timeseries'),
      timestamps: z.array(z.string()).min(2, 'timestamps insuficientes'),
      values: z.array(z.number()).min(2, 'values insuficientes'),
      horizon: z.number().int().positive().max(180).optional(),
    })
    .refine((data) => data.timestamps.length === data.values.length, {
      message: 'timestamps e values devem possuir o mesmo comprimento',
      path: ['values'],
    }),
]);

const requestEnvelopeSchema = z.object({
  job: jobSchema,
  options: z
    .object({
      jobId: z.string().max(128).optional(),
      priority: z.number().int().min(1).max(10).optional(),
      delayMs: z.number().int().nonnegative().optional(),
    })
    .optional(),
});

const requestSchema = z.union([jobSchema, requestEnvelopeSchema]);

const ENABLE_FLAG_KEYS = ['FF_AI_TUTOR_CIRURGIAS', 'FF_ML_QUEUE', 'FF_TUTOR_CIRURGIAS'];

function isFeatureEnabled(): boolean {
  for (const key of ENABLE_FLAG_KEYS) {
    const raw = process.env[key];
    if (!raw) continue;
    if (/^(1|true|on|enabled)$/i.test(raw.trim())) {
      return true;
    }
  }
  return false;
}

function parseBody(req: VercelRequest): unknown {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  const raw = req.body as string | undefined;
  if (!raw) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isFeatureEnabled()) {
    return res.status(403).json({ error: 'Fila ML desabilitada via feature flag' });
  }

  const body = parseBody(req);

  if (!body) {
    return res.status(400).json({ error: 'Corpo da requisição inválido ou ausente' });
  }

  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Payload inválido',
      details: parsed.error.flatten(),
    });
  }

  const jobData = ('job' in parsed.data ? parsed.data.job : parsed.data) as z.infer<
    typeof jobSchema
  >;
  const options = 'job' in parsed.data ? parsed.data.options : undefined;

  try {
    const job = await mlQueue.add(jobData.type, jobData as MLJobPayload, {
      ...(options?.jobId ? { jobId: options.jobId } : {}),
      ...(options?.priority ? { priority: options.priority } : {}),
      ...(options?.delayMs ? { delay: options.delayMs } : {}),
    });

    return res.status(202).json({
      status: 'enqueued',
      jobId: job.id,
      queue: job.queueName,
      scheduled: Boolean(options?.delayMs),
    });
  } catch (error) {
    console.error('[ml/enqueue] Falha ao enfileirar job', error);
    return res.status(502).json({
      error: 'Não foi possível enfileirar o job',
      details: (error as Error).message,
    });
  }
}
