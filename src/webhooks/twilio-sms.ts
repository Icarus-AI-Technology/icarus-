/**
 * Twilio Webhook - Status de SMS/WhatsApp
 *
 * Processa callbacks de status de mensagens enviadas
 *
 * Status possíveis:
 * - queued: Mensagem na fila
 * - sending: Enviando
 * - sent: Enviada
 * - delivered: Entregue
 * - undelivered: Não entregue
 * - failed: Falhou
 */

import { Request, Response } from "express";
import twilio from "twilio";

const authToken = process.env.TWILIO_AUTH_TOKEN || "";

/**
 * Handler do webhook do Twilio
 */
export async function twilioWebhookHandler(req: Request, res: Response) {
  try {
    const signature = req.headers["x-twilio-signature"] as string;
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    // Verificar assinatura
    const isValid = twilio.validateRequest(authToken, signature, url, req.body);

    if (!isValid) {
      console.error("❌ Assinatura Twilio inválida");
      return res.status(403).send("Forbidden");
    }

    const {
      MessageSid,
      SmsSid,
      MessageStatus,
      SmsStatus,
      From,
      To,
      ErrorCode,
      ErrorMessage,
    } = req.body;

    const messageSid = MessageSid || SmsSid;
    const status = MessageStatus || SmsStatus;

    console.log(`📱 Twilio webhook: ${messageSid} - Status: ${status}`);

    // Processar status
    switch (status) {
      case "delivered":
        await handleMessageDelivered(messageSid, From, To);
        break;

      case "undelivered":
      case "failed":
        await handleMessageFailed(
          messageSid,
          From,
          To,
          ErrorCode,
          ErrorMessage,
        );
        break;

      case "sent":
        await handleMessageSent(messageSid, From, To);
        break;

      default:
        console.log(`ℹ️ Status: ${status} para ${messageSid}`);
    }

    res.status(200).send("OK");
  } catch (error) {
    const err = error as Error;
    console.error("❌ Erro ao processar webhook Twilio:", err);
    res.status(500).send("Internal Server Error");
  }
}

// ===== Event Handlers =====

async function handleMessageDelivered(sid: string, _from: string, _to: string) {
  console.log(`✅ Mensagem entregue: ${sid}`);

  // TODO: Atualizar status no banco de dados
  // TODO: Registrar métrica de entrega
}

async function handleMessageSent(sid: string, _from: string, _to: string) {
  console.log(`📤 Mensagem enviada: ${sid}`);

  // TODO: Atualizar status no banco
}

async function handleMessageFailed(
  sid: string,
  _from: string,
  _to: string,
  errorCode?: string,
  errorMessage?: string,
) {
  console.log(`❌ Mensagem falhou: ${sid} - ${errorCode}: ${errorMessage}`);

  // TODO: Registrar falha
  // TODO: Notificar administrador se erro crítico
  // TODO: Tentar alternativa (email)
}

export default twilioWebhookHandler;
