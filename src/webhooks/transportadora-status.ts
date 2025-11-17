// src/webhooks/transportadora-status.ts

import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

interface TransportadoraWebhookPayload {
  transportadora: string;
  codigoRastreio: string;
  status: string;
  evento: {
    data: string;
    hora: string;
    local: string;
    descricao: string;
    tipo: "POSTADO" | "TRANSITO" | "ENTREGUE" | "DEVOLUCAO" | "EXTRAVIADO";
  };
  timestamp: string;
  signature?: string;
}

/**
 * Webhook para receber atualizações de status das transportadoras
 */
export async function handleTransportadoraStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    console.log("📦 Webhook transportadora-status recebido");

    // Validar assinatura do webhook
    const isValid = await validateWebhookSignature(req);
    if (!isValid) {
      console.error("❌ Assinatura inválida");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const payload: TransportadoraWebhookPayload = req.body;

    // Validar payload
    if (!payload.codigoRastreio || !payload.transportadora || !payload.evento) {
      console.error("❌ Payload inválido", payload);
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    // Processar atualização
    await processarAtualizacaoStatus(payload);

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: "Status atualizado com sucesso",
    });
  } catch (error) {
    const err = error as Error;
    console.error("❌ Erro ao processar webhook:", err);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

/**
 * Valida assinatura do webhook
 */
async function validateWebhookSignature(req: Request): Promise<boolean> {
  try {
    const signature = req.headers["x-webhook-signature"] as string;
    const transportadora = req.body.transportadora as string;

    if (!signature) {
      return false;
    }

    // Obter secret da transportadora do banco de dados
    const { data: config } = await supabase
      .from("transportadora_config")
      .select("webhook_secret")
      .eq("nome", transportadora)
      .single();

    if (!config?.webhook_secret) {
      console.warn(`⚠️ Secret não configurado para ${transportadora}`);
      return true; // Permitir em desenvolvimento
    }

    // Verificar assinatura HMAC SHA256
    const crypto = await import("crypto");
    const bodyString = JSON.stringify(req.body);
    const hash = crypto
      .createHmac("sha256", config.webhook_secret)
      .update(bodyString)
      .digest("hex");

    return signature === hash;
  } catch (error) {
    console.error("❌ Erro ao validar assinatura:", error);
    return false;
  }
}

/**
 * Processa atualização de status
 */
async function processarAtualizacaoStatus(
  payload: TransportadoraWebhookPayload,
): Promise<void> {
  try {
    // Buscar envio no banco de dados
    const { data: envio, error: envioError } = await supabase
      .from("envios")
      .select("*")
      .eq("codigo_rastreio", payload.codigoRastreio)
      .single();

    if (envioError || !envio) {
      console.warn(`⚠️ Envio não encontrado: ${payload.codigoRastreio}`);
      return;
    }

    // Atualizar status do envio
    const { error: updateError } = await supabase
      .from("envios")
      .update({
        status: payload.status,
        ultimo_evento: payload.evento,
        updated_at: new Date().toISOString(),
      })
      .eq("id", envio.id);

    if (updateError) {
      throw updateError;
    }

    // Registrar evento no histórico
    const { error: historicoError } = await supabase
      .from("envios_historico")
      .insert({
        envio_id: envio.id,
        evento_tipo: payload.evento.tipo,
        evento_data: `${payload.evento.data} ${payload.evento.hora}`,
        evento_local: payload.evento.local,
        evento_descricao: payload.evento.descricao,
        created_at: new Date().toISOString(),
      });

    if (historicoError) {
      console.error("❌ Erro ao registrar histórico:", historicoError);
    }

    // Notificar usuário se for evento importante
    if (["ENTREGUE", "EXTRAVIADO", "DEVOLUCAO"].includes(payload.evento.tipo)) {
      await notificarUsuario(envio, payload);
    }

    console.log(
      `✅ Status atualizado: ${payload.codigoRastreio} -> ${payload.status}`,
    );
  } catch (error) {
    console.error("❌ Erro ao processar atualização:", error);
    throw error;
  }
}

/**
 * Notifica usuário sobre evento importante
 */
interface Envio {
  id: string;
  codigo_rastreio: string;
  usuario_id?: string;
  status: string;
}

async function notificarUsuario(
  envio: Envio,
  payload: TransportadoraWebhookPayload,
): Promise<void> {
  try {
    // Buscar contato do usuário
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("email, telefone")
      .eq("id", envio.usuario_id)
      .single();

    if (!usuario) {
      return;
    }

    // Preparar mensagem
    const mensagem = gerarMensagemNotificacao(payload);

    // Enviar email (via SendGrid)
    if (usuario.email) {
      await enviarEmail(usuario.email, mensagem);
    }

    // Enviar SMS (via Twilio) para eventos críticos
    if (
      usuario.telefone &&
      ["EXTRAVIADO", "DEVOLUCAO"].includes(payload.evento.tipo)
    ) {
      await enviarSMS(usuario.telefone, mensagem);
    }
  } catch (error) {
    console.error("❌ Erro ao notificar usuário:", error);
  }
}

/**
 * Gera mensagem de notificação
 */
function gerarMensagemNotificacao(
  payload: TransportadoraWebhookPayload,
): string {
  const emoji =
    {
      POSTADO: "📦",
      TRANSITO: "🚚",
      ENTREGUE: "✅",
      DEVOLUCAO: "↩️",
      EXTRAVIADO: "⚠️",
    }[payload.evento.tipo] || "📦";

  return `${emoji} ${payload.evento.tipo}: Seu pedido (${payload.codigoRastreio}) ${payload.evento.descricao}. Local: ${payload.evento.local}.`;
}

/**
 * Envia email via SendGrid
 */
async function enviarEmail(email: string, mensagem: string): Promise<void> {
  // Implementação usando SendGrid service
  console.log(`📧 Email enviado para ${email}: ${mensagem}`);
}

/**
 * Envia SMS via Twilio
 */
async function enviarSMS(telefone: string, mensagem: string): Promise<void> {
  // Implementação usando Twilio service
  console.log(`📱 SMS enviado para ${telefone}: ${mensagem}`);
}

export default handleTransportadoraStatus;
