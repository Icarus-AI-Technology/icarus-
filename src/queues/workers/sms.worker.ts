/**
 * SMS Worker - Processa jobs de envio de SMS
 *
 * Responsabilidades:
 * - Processar jobs da fila de SMS
 * - Enviar SMS via Twilio
 * - Registrar falhas
 * - Mover para DLQ após tentativas esgotadas
 */

import { Worker, Job } from 'bullmq';
import { TwilioService } from '../../services/integrations/TwilioService';
import { SMSJob, moverParaDLQ } from '../../config/queue';

const twilioService = new TwilioService();

// Conexão Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

/**
 * Worker de SMS
 */
export const smsWorker = new Worker<SMSJob>(
  'sms',
  async (job: Job<SMSJob>) => {
    console.log(
      `📱 Processando SMS job ${job.id} (tentativa ${job.attemptsMade + 1}/${job.opts.attempts})`
    );

    try {
      const { para, mensagem, agendarPara } = job.data;

      await job.updateProgress(10);

      const resultado = await twilioService.enviarSMS({
        para,
        mensagem,
        agendarPara,
      });

      await job.updateProgress(100);

      console.log(`✅ SMS enviado com sucesso! SID: ${resultado.sid}`);

      return {
        sucesso: true,
        sid: resultado.sid,
        status: resultado.status,
        enviadoEm: new Date(),
      };
    } catch (error: unknown) {
      console.error(`❌ Erro ao processar SMS job ${job.id}:`, error);

      // Se esgotou as tentativas, move para DLQ
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.log(`🔴 Job ${job.id} esgotou tentativas. Movendo para DLQ...`);
        await moverParaDLQ('sms', job.id!, job.data, error);
      }

      throw error;
    }
  },
  {
    connection,
    concurrency: 5, // Processar até 5 SMS simultaneamente
    limiter: {
      max: 10, // Máximo 10 SMS
      duration: 1000, // por segundo
    },
  }
);

// ===== Event Listeners =====

smsWorker.on('completed', (job) => {
  console.log(`✅ SMS job ${job.id} completado`);
});

smsWorker.on('failed', (job, error) => {
  console.error(`❌ SMS job ${job?.id} falhou:`, error.message);
});

smsWorker.on('error', (error) => {
  console.error('❌ SMS worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Fechando SMS worker...');
  await smsWorker.close();
});

process.on('SIGINT', async () => {
  console.log('Fechando SMS worker...');
  await smsWorker.close();
});

export default smsWorker;
