#!/usr/bin/env tsx
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { z } from 'zod';

const optionsSchema = z.object({
  input: z.string().optional(),
  externalId: z.string().optional(),
  module: z.string().optional(),
  embedding: z.string().optional(),
  metadata: z.string().optional(),
  jobId: z.string().optional(),
  priority: z.coerce.number().int().optional(),
  delay: z.coerce.number().int().nonnegative().optional(),
  dryRun: z.boolean().optional(),
});

type CliOptions = z.infer<typeof optionsSchema>;

const vectorSchema = z.object({
  externalId: z.string().min(1),
  module: z.string().min(1),
  embedding: z.array(z.number()).min(1),
  metadata: z.record(z.any()).optional(),
});

const payloadSchema = z.object({
  vectors: z.array(vectorSchema).min(1),
});

type VectorPayload = z.infer<typeof vectorSchema>;

function parseArgs(argv: string[]): CliOptions {
  const args: Record<string, unknown> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--input':
        args.input = argv[++i];
        break;
      case '--external-id':
        args.externalId = argv[++i];
        break;
      case '--module':
        args.module = argv[++i];
        break;
      case '--embedding':
        args.embedding = argv[++i];
        break;
      case '--metadata':
        args.metadata = argv[++i];
        break;
      case '--job-id':
        args.jobId = argv[++i];
        break;
      case '--priority':
        args.priority = argv[++i];
        break;
      case '--delay':
        args.delay = argv[++i];
        break;
      case '--dry-run':
        args.dryRun = true;
        break;
      default:
        throw new Error(`Argumento desconhecido: ${arg}`);
    }
  }

  return optionsSchema.parse(args);
}

function loadFromFile(filePath: string): VectorPayload[] {
  const fullPath = path.resolve(process.cwd(), filePath);
  const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  if (Array.isArray(data)) {
    return payloadSchema.parse({ vectors: data }).vectors;
  }

  return payloadSchema.parse(data).vectors;
}

function loadFromArgs(options: CliOptions): VectorPayload[] {
  if (!options.externalId || !options.module || !options.embedding) {
    throw new Error('Informe --external-id, --module e --embedding quando não usar --input.');
  }

  let embedding: unknown;
  try {
    embedding = JSON.parse(options.embedding);
  } catch (error) {
    throw new Error(`Embedding inválido (esperado JSON array). Detalhes: ${(error as Error).message}`);
  }

  if (!Array.isArray(embedding) || embedding.some((val) => typeof val !== 'number')) {
    throw new Error('Embedding deve ser um array de números.');
  }

  let metadata: Record<string, unknown> | undefined;
  if (options.metadata) {
    try {
      metadata = JSON.parse(options.metadata);
    } catch (error) {
      throw new Error(`Metadata inválida (esperado JSON object). Detalhes: ${(error as Error).message}`);
    }
  }

  return payloadSchema.parse({
    vectors: [
      {
        externalId: options.externalId,
        module: options.module,
        embedding,
        metadata,
      },
    ],
  }).vectors;
}

async function enqueueVectors(vectors: VectorPayload[], options: CliOptions) {
  const endpoint = process.env.ML_ENQUEUE_URL || 'http://localhost:3000/api/ml/enqueue';

  const body = {
    job: {
      type: 'vector-store',
      vectors: vectors.map((vector) => ({
        externalId: vector.externalId,
        module: vector.module,
        embedding: vector.embedding,
        metadata: vector.metadata ?? {},
      })),
    },
    options: {
      jobId: options.jobId,
      priority: options.priority,
      delayMs: options.delay,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.ML_ENQUEUE_TOKEN ? { Authorization: `Bearer ${process.env.ML_ENQUEUE_TOKEN}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha ao enfileirar vetores: ${response.status} ${response.statusText} → ${errorText}`);
  }

  const json = await response.json();
  console.log('✅ Job enfileirado com sucesso:');
  console.log(JSON.stringify(json, null, 2));
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));

    if (!options.input && !options.externalId) {
      throw new Error('Use --input <arquivo.json> ou --external-id/--module/--embedding.');
    }

    const vectors = options.input ? loadFromFile(options.input) : loadFromArgs(options);

    if (options.dryRun) {
      console.log('DRY RUN – payload validado:');
      console.log(JSON.stringify({ vectors, options }, null, 2));
      process.exit(0);
    }

    await enqueueVectors(vectors, options);
    process.exit(0);
  } catch (error) {
    console.error('❌', (error as Error).message);
    process.exit(1);
  }
}

void main();
