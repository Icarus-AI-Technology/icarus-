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
 */

import { Request, Response } from "express";
import crypto from "crypto";

const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY || "";

/**
 * Handler do webhook do SendGrid
 */
export async function sendGridWebhookHandler(req: Request, res: Response) {
  try {
    // SendGrid envia um array de eventos
    const events = req.body as Array<any>;

    if (!Array.isArray(events)) {
      return res.status(400).send("Invalid payload");
    }

    console.log(`📧 SendGrid webhook: ${events.length} eventos recebidos`);

    // Processar cada evento
    for (const event of events) {
      await processEvent(event);
    }

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("❌ Erro ao processar webhook SendGrid:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function processEvent(event: any) {
  const { event: eventType, email, timestamp, sg_message_id } = event;

  console.log(`📧 Evento: ${eventType} para ${email}`);

  switch (eventType) {
    case "delivered":
      await handleEmailDelivered(email, sg_message_id, timestamp);
      break;

    case "open":
      await handleEmailOpened(email, sg_message_id, timestamp);
      break;

    case "click":
      await handleEmailClicked(email, sg_message_id, event.url, timestamp);
      break;

    case "bounce":
      await handleEmailBounced(
        email,
        sg_message_id,
        event.reason,
        event.status,
        timestamp,
      );
      break;

    case "dropped":
      await handleEmailDropped(email, sg_message_id, event.reason, timestamp);
      break;

    case "spam_report":
      await handleSpamReport(email, sg_message_id, timestamp);
      break;

    case "unsubscribe":
      await handleUnsubscribe(email, sg_message_id, timestamp);
      break;

    default:
      console.log(`ℹ️ Evento não tratado: ${eventType}`);
  }
}

// ===== Event Handlers =====

async function handleEmailDelivered(
  email: string,
  messageId: string,
  timestamp: number,
) {
  console.log(`✅ Email entregue: ${messageId} para ${email}`);

  // TODO: Atualizar status no banco
  // TODO: Registrar métrica de entrega
}

async function handleEmailOpened(
  email: string,
  messageId: string,
  timestamp: number,
) {
  console.log(`👁️  Email aberto: ${messageId} por ${email}`);

  // TODO: Registrar abertura
  // TODO: Atualizar engajamento do usuário
}

async function handleEmailClicked(
  email: string,
  messageId: string,
  url: string,
  timestamp: number,
) {
  console.log(`🔗 Link clicado: ${url} por ${email}`);

  // TODO: Registrar clique
  // TODO: Atualizar métrica de conversão
}

async function handleEmailBounced(
  email: string,
  messageId: string,
  reason: string,
  status: string,
  timestamp: number,
) {
  console.log(`⚠️  Email rejeitado: ${messageId} - ${reason}`);

  // TODO: Marcar email como inválido
  // TODO: Pausar envios para este email
  // TODO: Notificar se bounce permanente
}

async function handleEmailDropped(
  email: string,
  messageId: string,
  reason: string,
  timestamp: number,
) {
  console.log(`🗑️  Email descartado: ${messageId} - ${reason}`);

  // TODO: Registrar motivo do descarte
  // TODO: Verificar reputação do email
}

async function handleSpamReport(
  email: string,
  messageId: string,
  timestamp: number,
) {
  console.log(`🚫 Spam report: ${email}`);

  // TODO: Remover da lista de envio
  // TODO: Notificar administrador
}

async function handleUnsubscribe(
  email: string,
  messageId: string,
  timestamp: number,
) {
  console.log(`👋 Unsubscribe: ${email}`);

  // TODO: Atualizar preferências do usuário
  // TODO: Remover das listas de envio
}

/**
 * Valida assinatura do webhook (opcional, mas recomendado)
 */
export function validateSendGridSignature(
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  if (!publicKey) {
    console.warn("⚠️ SENDGRID_WEBHOOK_PUBLIC_KEY não configurado");
    return true; // Permitir sem validação em dev
  }

  try {
    const payload = timestamp + body;
    const verifier = crypto.createVerify("sha256");
    verifier.update(payload);

    return verifier.verify(publicKey, signature, "base64");
  } catch (error) {
    console.error("Erro ao validar assinatura SendGrid:", error);
    return false;
  }
}

export default sendGridWebhookHandler;
