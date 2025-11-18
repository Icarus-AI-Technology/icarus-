import { Queue } from "bullmq";
import { queueConnection } from "@/config/queue";
import { ML_QUEUE_NAME, ML_JOB_OPTIONS, MLJobPayload } from "./workers/ml.worker";

export const mlQueue = new Queue<MLJobPayload>(ML_QUEUE_NAME, {
  ...(queueConnection ? { connection: queueConnection } : {}),
  defaultJobOptions: ML_JOB_OPTIONS,
});

export * from "./workers/ml.worker";
