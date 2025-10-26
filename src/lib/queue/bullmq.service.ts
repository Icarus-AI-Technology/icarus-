import { Queue } from 'bullmq';
// import { upstashRedis } from './upstash.adapter'; // não utilizado aqui
import { ML_QUEUE_NAME, ML_JOB_OPTIONS, MLJobPayload } from './workers/ml.worker';

export const mlQueue = new Queue<MLJobPayload>(ML_QUEUE_NAME, {
  // Upstash adapter provides REST API, BullMQ will use ioredis if available.
  // For local/dev without Redis, leave connection undefined to avoid crashes.
  // In production, set REDIS_URL to enable BullMQ connection.
  defaultJobOptions: ML_JOB_OPTIONS,
});

export * from './workers/ml.worker';
