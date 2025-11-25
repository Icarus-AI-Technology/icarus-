/**
 * Queue Configuration - BullMQ/Redis
 *
 * Gerenciamento de filas para processamento assíncrono.
 */

import { Queue } from 'bullmq';
import type { DefaultJobOptions, QueueOptions, RepeatOptions } from 'bullmq';
import { Redis, type RedisOptions } from 'ioredis';

function resolveRedisConnection(): RedisOptions | undefined {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: Number(parsed.port || 6379),
        password: parsed.password || undefined,
        db: Number(parsed.pathname.replace('/', '') || 0),
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      };
    } catch (error) {
      console.warn('⚠️ BullMQ: REDIS_URL inválida. Caindo para variáveis individuais.', error);
    }
  }

  if (process.env.REDIS_HOST) {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }

  return undefined;
}

export const redisConnection = resolveRedisConnection();

if (!redisConnection) {
  console.warn(
    '⚠️ BullMQ: Redis não configurado. Filas serão inicializadas sem conexão persistente.'
  );
}

export const redis = redisConnection ? new Redis(redisConnection) : undefined;

const queueConnectionOptions: Pick<QueueOptions, 'connection'> = redisConnection
  ? { connection: redisConnection }
  : {};

export const queueConnection = redisConnection;

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600,
    count: 1000,
  },
  removeOnFail: {
    age: 7 * 24 * 3600,
  },
};

export const emailQueue = new Queue('email', {
  ...queueConnectionOptions,
  defaultJobOptions: {
    ...defaultJobOptions,
    priority: 1,
  },
});

export const smsQueue = new Queue('sms', {
  ...queueConnectionOptions,
  defaultJobOptions: {
    ...defaultJobOptions,
    priority: 2,
  },
});

export const whatsappQueue = new Queue('whatsapp', {
  ...queueConnectionOptions,
  defaultJobOptions: {
    ...defaultJobOptions,
    priority: 2,
  },
});

const rastreioDefaultJobOptions: DefaultJobOptions & { repeat?: RepeatOptions } = {
  ...defaultJobOptions,
  priority: 3,
  repeat: {
    pattern: '0 */4 * * *',
  },
};

export const rastreioQueue = new Queue('rastreio', {
  ...queueConnectionOptions,
  defaultJobOptions: rastreioDefaultJobOptions,
});

export const notificacoesQueue = new Queue('notificacoes', {
  ...queueConnectionOptions,
  defaultJobOptions,
});

export const deadLetterQueue = new Queue('dead-letter', {
  ...queueConnectionOptions,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: false,
    removeOnFail: false,
  },
});

export interface EmailJob {
  para: string | string[];
  assunto: string;
  html?: string;
  texto?: string;
  template?: {
    id: string;
    dados: Record<string, unknown>;
  };
}

export interface SMSJob {
  para: string;
  mensagem: string;
  agendarPara?: Date;
}

export interface WhatsAppJob {
  para: string;
  mensagem: string;
  midia?: string[];
}

export interface RastreioJob {
  codigo: string;
  idPedido: string;
  transportadora: string;
}

export interface NotificacaoJob {
  userId: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensagem: string;
  link?: string;
}

export async function adicionarEmailNaFila(dados: EmailJob, options?: Partial<DefaultJobOptions>) {
  return emailQueue.add('send-email', dados, options);
}

export async function adicionarSMSNaFila(dados: SMSJob, options?: Partial<DefaultJobOptions>) {
  return smsQueue.add('send-sms', dados, options);
}

export async function adicionarWhatsAppNaFila(
  dados: WhatsAppJob,
  options?: Partial<DefaultJobOptions>
) {
  return whatsappQueue.add('send-whatsapp', dados, options);
}

export async function adicionarRastreioNaFila(
  dados: RastreioJob,
  options?: Partial<DefaultJobOptions>
) {
  return rastreioQueue.add('track-package', dados, options);
}

export async function moverParaDLQ(
  queueName: string,
  jobId: string | number,
  jobData: Record<string, unknown>,
  error: unknown
) {
  const normalizedError =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };

  return deadLetterQueue.add('failed-job', {
    originalQueue: queueName,
    originalJobId: jobId,
    jobData,
    error: normalizedError,
    timestamp: new Date(),
  });
}

export async function limparJobsAntigos() {
  const queues = [emailQueue, smsQueue, whatsappQueue, rastreioQueue, notificacoesQueue];

  for (const queue of queues) {
    await queue.clean(24 * 3600 * 1000, 1000, 'completed');
    await queue.clean(7 * 24 * 3600 * 1000, 1000, 'failed');
  }
}

export async function obterEstatisticas() {
  const queues = {
    email: emailQueue,
    sms: smsQueue,
    whatsapp: whatsappQueue,
    rastreio: rastreioQueue,
    notificacoes: notificacoesQueue,
    'dead-letter': deadLetterQueue,
  };

  const stats: Record<string, Record<string, number>> = {};

  for (const [name, queue] of Object.entries(queues)) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    stats[name] = {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  return stats;
}

export async function pausarTodasAsFilas() {
  await Promise.all([
    emailQueue.pause(),
    smsQueue.pause(),
    whatsappQueue.pause(),
    rastreioQueue.pause(),
    notificacoesQueue.pause(),
  ]);
}

export async function resumirTodasAsFilas() {
  await Promise.all([
    emailQueue.resume(),
    smsQueue.resume(),
    whatsappQueue.resume(),
    rastreioQueue.resume(),
    notificacoesQueue.resume(),
  ]);
}

export async function fecharConexoes() {
  await Promise.all([
    emailQueue.close(),
    smsQueue.close(),
    whatsappQueue.close(),
    rastreioQueue.close(),
    notificacoesQueue.close(),
    deadLetterQueue.close(),
    redis?.quit(),
  ]);
}

process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM, fechando filas...');
  await fecharConexoes();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Recebido SIGINT, fechando filas...');
  await fecharConexoes();
  process.exit(0);
});

export default {
  emailQueue,
  smsQueue,
  whatsappQueue,
  rastreioQueue,
  notificacoesQueue,
  deadLetterQueue,
  redis,
};
