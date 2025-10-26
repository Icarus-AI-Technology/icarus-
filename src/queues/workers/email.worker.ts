/**
 * Email Worker - Processa jobs de envio de email
 * 
 * Responsabilidades:
 * - Processar jobs da fila de emails
 * - Enviar emails via SendGrid
 * - Registrar falhas
 * - Mover para DLQ após tentativas esgotadas
 */

import { Worker, Job } from 'bullmq';
import { SendGridService } from '../../services/integrations/SendGridService';
import { EmailJob, moverParaDLQ } from '../../config/queue';

const sendGridService = new SendGridService();

// Conexão Redis
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379')
};

/**
 * Worker de Email
 */
export const emailWorker = new Worker<EmailJob>(
  'email',
  async (job: Job<EmailJob>) => {
    console.log(`📧 Processando email job ${job.id} (tentativa ${job.attemptsMade + 1}/${job.opts.attempts})`);

    try {
      const { para, assunto, html, texto, template } = job.data;

      // Atualizar progresso
      await job.updateProgress(10);

      let resultado;

      if (template) {
        // Enviar usando template
        resultado = await sendGridService.enviarEmailTemplate({
          para,
          templateId: template.id,
          dados: template.dados
        });
      } else {
        // Enviar email simples
        resultado = await sendGridService.enviarEmail({
          para,
          assunto,
          html,
          texto
        });
      }

      await job.updateProgress(100);

      console.log(`✅ Email enviado com sucesso! MessageID: ${resultado.messageId}`);

      return {
        sucesso: true,
        messageId: resultado.messageId,
        statusCode: resultado.statusCode,
        enviadoEm: new Date()
      };

    } catch (error: any) {
      console.error(`❌ Erro ao processar email job ${job.id}:`, error);

      // Se esgotou as tentativas, move para DLQ
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        console.log(`🔴 Job ${job.id} esgotou tentativas. Movendo para DLQ...`);
        await moverParaDLQ('email', job.id!, job.data, error);
      }

      throw error; // Relançar para triggerar retry
    }
  },
  {
    connection,
    concurrency: 10, // Processar até 10 emails simultaneamente
    limiter: {
      max: 100, // Máximo 100 emails
      duration: 1000 // por segundo
    }
  }
);

// ===== Event Listeners =====

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completado com sucesso`);
});

emailWorker.on('failed', (job, error) => {
  console.error(`❌ Email job ${job?.id} falhou:`, error.message);
});

emailWorker.on('error', (error) => {
  console.error('❌ Email worker error:', error);
});

emailWorker.on('stalled', (jobId) => {
  console.warn(`⚠️ Email job ${jobId} travado (stalled)`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Fechando email worker...');
  await emailWorker.close();
});

process.on('SIGINT', async () => {
  console.log('Fechando email worker...');
  await emailWorker.close();
});

export default emailWorker;

