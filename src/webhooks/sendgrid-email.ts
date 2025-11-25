/**
 * SendGrid Webhook - Eventos de Email
 *
 * Processa eventos de emails enviados
 *
 * Eventos:
 * - processed: Email processado
 * - delivered: Email entregue
 * - open: Email aberto
 * - click: Link clicado
 * - bounce: Email rejeitado
 * - dropped: Email descartado
 * - spam_report: Marcado como spam
 * - unsubscribe: Usuário cancelou inscrição
 *
 * SEGURANÇA:
 * - Validação de assinatura obrigatória em produção
 * - Rate limiting
 * - Logging de eventos suspeitos
 */

import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  rateLimitMiddleware,
  setSecurityHeaders,
  logSuspiciousRequest,
  DEFAULT_RATE_LIMIT,
} from '../lib/security/apiMiddleware';

const SENDGRID_WEBHOOK_PUBLIC_KEY = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

type SendGridWebhookEvent = {
  event: string;
  email: string;
  timestamp: number;
  sg_message_id?: string;
  url?: string;
  reason?: string;
  status?: string;
};

/**
 * Valida assinatura do webhook SendGrid (Event Webhook Signature Verification)
 * @see https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features
 */
function validateSendGridSignature(req: Request): boolean {
  const signature = req.headers['x-twilio-email-event-webhook-signature'] as string;
  const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'] as string;

  if (!signature || !timestamp) {
    console.warn('⚠️ SendGrid webhook sem assinatura ou timestamp');
    return !IS_PRODUCTION; // Permitir apenas em dev
  }

  if (!SENDGRID_WEBHOOK_PUBLIC_KEY) {
    console.warn('⚠️ SENDGRID_WEBHOOK_PUBLIC_KEY não configurado');
    return !IS_PRODUCTION;
  }

  try {
    // SendGrid usa ECDSA com SHA256
    const payload = timestamp + JSON.stringify(req.body);
    const verifier = crypto.createVerify('sha256');
    verifier.update(payload);

    const isValid = verifier.verify(
      {
        key: SENDGRID_WEBHOOK_PUBLIC_KEY,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      signature,
      'base64'
    );

    if (!isValid) {
      logSuspiciousRequest(req, 'SendGrid signature validation failed');
    }

    return isValid;
  } catch (error) {
    console.error('Erro ao validar assinatura SendGrid:', error);
    return !IS_PRODUCTION;
  }
}

/**
 * Verifica se o timestamp é recente (previne replay attacks)
 */
function isTimestampValid(timestamp: string): boolean {
  const eventTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const fiveMinutes = 5 * 60;

  // Evento deve ter sido gerado nos últimos 5 minutos
  return Math.abs(now - eventTime) < fiveMinutes;
}

/**
 * Handler do webhook do SendGrid
 */
export async function sendGridWebhookHandler(req: Request, res: Response) {
  // Security headers
  setSecurityHeaders(res);

  // Rate limiting
  const rateLimiter = rateLimitMiddleware(DEFAULT_RATE_LIMIT);
  let rateLimitPassed = true;
  rateLimiter(req, res, () => {
    rateLimitPassed = true;
  });
  if (!rateLimitPassed) return;

  try {
    // Validar assinatura
    if (!validateSendGridSignature(req)) {
      logSuspiciousRequest(req, 'Invalid SendGrid webhook signature');
      return res.status(401).send('Unauthorized');
    }

    // Validar timestamp (anti-replay)
    const timestamp = req.headers['x-twilio-email-event-webhook-timestamp'] as string;
    if (timestamp && !isTimestampValid(timestamp)) {
      logSuspiciousRequest(req, 'SendGrid webhook timestamp too old');
      return res.status(401).send('Timestamp expired');
    }

    // SendGrid envia um array de eventos
    const events = req.body as SendGridWebhookEvent[];

    if (!Array.isArray(events)) {
      return res.status(400).send('Invalid payload');
    }

    // Limitar número de eventos por requisição (proteção contra abuse)
    if (events.length > 1000) {
      logSuspiciousRequest(req, `SendGrid webhook with too many events: ${events.length}`);
      return res.status(400).send('Too many events');
    }

    console.log(`📧 SendGrid webhook: ${events.length} eventos recebidos`);

    // Processar cada evento
    for (const event of events) {
      await processEvent(event);
    }

    res.status(200).send('OK');
  } catch (error: unknown) {
    console.error('❌ Erro ao processar webhook SendGrid:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function processEvent(event: SendGridWebhookEvent) {
  const { event: eventType, email, timestamp, sg_message_id: messageId } = event;

  // Sanitizar email para log (não expor dados sensíveis)
  const maskedEmail = email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'unknown';
  console.log(`📧 Evento: ${eventType} para ${maskedEmail}`);

  switch (eventType) {
    case 'delivered':
      await handleEmailDelivered(email, messageId ?? '', timestamp);
      break;

    case 'open':
      await handleEmailOpened(email, messageId ?? '', timestamp);
      break;

    case 'click':
      await handleEmailClicked(email, messageId ?? '', event.url ?? '', timestamp);
      break;

    case 'bounce':
      await handleEmailBounced(
        email,
        messageId ?? '',
        event.reason ?? '',
        event.status ?? '',
        timestamp
      );
      break;

    case 'dropped':
      await handleEmailDropped(email, messageId ?? '', event.reason ?? '', timestamp);
      break;

    case 'spam_report':
      await handleSpamReport(email, messageId ?? '', timestamp);
      break;

    case 'unsubscribe':
      await handleUnsubscribe(email, messageId ?? '', timestamp);
      break;

    default:
      console.log(`ℹ️ Evento não tratado: ${eventType}`);
  }
}

// ===== Event Handlers =====

async function handleEmailDelivered(email: string, messageId: string, timestamp: number) {
  console.log(
    `✅ Email entregue: ${messageId} para ${email} em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Atualizar status no banco
  // TODO: Registrar métrica de entrega
}

async function handleEmailOpened(email: string, messageId: string, timestamp: number) {
  console.log(
    `👁️  Email aberto: ${messageId} por ${email} em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Registrar abertura
  // TODO: Atualizar engajamento do usuário
}

async function handleEmailClicked(
  email: string,
  messageId: string,
  url: string,
  timestamp: number
) {
  console.log(
    `🔗 Link clicado: ${url} por ${email} (mensagem ${messageId}) em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Registrar clique
  // TODO: Atualizar métrica de conversão
}

async function handleEmailBounced(
  email: string,
  messageId: string,
  reason: string,
  status: string,
  timestamp: number
) {
  console.log(
    `⚠️  Email rejeitado: ${messageId} (${status}) - ${reason} para ${email} em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Marcar email como inválido
  // TODO: Pausar envios para este email
  // TODO: Notificar se bounce permanente
}

async function handleEmailDropped(
  email: string,
  messageId: string,
  reason: string,
  timestamp: number
) {
  console.log(
    `🗑️  Email descartado: ${messageId} - ${reason} para ${email} em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Registrar motivo do descarte
  // TODO: Verificar reputação do email
}

async function handleSpamReport(email: string, messageId: string, timestamp: number) {
  console.log(
    `🚫 Spam report: ${email} (mensagem ${messageId}) em ${new Date(timestamp * 1000).toISOString()}`
  );

  // IMPORTANTE: Remover da lista de envio imediatamente
  // TODO: Remover da lista de envio
  // TODO: Notificar administrador
}

async function handleUnsubscribe(email: string, messageId: string, timestamp: number) {
  console.log(
    `👋 Unsubscribe: ${email} (mensagem ${messageId}) em ${new Date(timestamp * 1000).toISOString()}`
  );

  // TODO: Atualizar preferências do usuário
  // TODO: Remover das listas de envio
}

export default sendGridWebhookHandler;
