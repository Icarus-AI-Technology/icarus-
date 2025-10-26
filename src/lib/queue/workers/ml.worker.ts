import { JobsOptions } from 'bullmq';
import { MlService } from '@/services/integrations';

export type MLJobPayload =
  | { type: 'llm'; prompt: string }
  | { type: 'finance-sentiment'; text: string }
  | { type: 'optimizer'; objective: number[] }
  | { type: 'timeseries'; timestamps: string[]; values: number[]; horizon?: number }
  | {
      type: 'vector-store';
      vectors: Array<{ externalId: string; module: string; embedding: number[]; metadata?: Record<string, unknown> }>;
    };

export const ML_QUEUE_NAME = 'ml-jobs';

// Worker instantiation is disabled in the frontend/build environment.
// In production, run a dedicated worker process importing this file and create the Worker there.

export async function processMlJob(job: MLJobPayload) {
  switch (job.type) {
    case 'llm':
      return MlService.generateLLM(job.prompt);
    case 'finance-sentiment':
      return MlService.analyzeFinance(job.text);
    case 'optimizer':
      return MlService.optimizeObjective(job.objective);
    case 'timeseries':
      return MlService.forecastSeries(job.timestamps, job.values, job.horizon);
    case 'vector-store':
      return MlService.persistVectors(job.vectors);
    default: {
      const neverType: never = job;
      throw new Error(`Tipo de job não suportado: ${(neverType as MLJobPayload)['type']}`);
    }
  }
}

export const ML_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};
