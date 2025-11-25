import { Queue } from 'bullmq';
import { queueConnection } from '@/config/queue';
import { ML_QUEUE_NAME, ML_JOB_OPTIONS, MLJobPayload } from './workers/ml.worker';

export const mlQueue = new Queue<MLJobPayload>(ML_QUEUE_NAME, {
  ...(queueConnection ? { connection: queueConnection } : {}),
  defaultJobOptions: ML_JOB_OPTIONS,
});

// Alias for backwards compatibility
export const queueService = {
  mlQueue,
  addJob: async (name: string, data: MLJobPayload) => {
    return mlQueue.add(name, data);
  },
  getJobs: async () => {
    return mlQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
  },
  getJobCounts: async () => {
    return mlQueue.getJobCounts('waiting', 'active', 'completed', 'failed');
  },
};

export * from './workers/ml.worker';
