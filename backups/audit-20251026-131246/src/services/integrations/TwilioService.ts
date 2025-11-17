/**
 * Twilio Service - SMS e WhatsApp
 *
 * Funcionalidades:
 * - Envio de SMS
 * - Envio de WhatsApp
 * - Verificação de telefone
 * - Status de mensagens
 * - Webhooks para callbacks
 *
 * Documentação API: https://www.twilio.com/docs/sms
 */

import twilio from "twilio";
import type { Twilio, MessageInstance } from "twilio/lib/rest/Twilio";

export interface SMSParams {
  para: string; // Número de telefone com código do país: +5511999999999
  mensagem: string;
  agendarPara?: Date; // Data para agendamento
  callback?: string; // URL para callback de status
}

export interface WhatsAppParams {
  para: string; // Número de telefone com código do país: +5511999999999
  mensagem: string;
  midia?: string[]; // URLs de imagens/vídeos
  callback?: string;
}

export interface MessageStatus {
  sid: string;
  status:
    | "queued"
    | "sending"
    | "sent"
    | "delivered"
    | "undelivered"
    | "failed";
  para: string;
  de: string;
  mensagem: string;
  dataEnvio: Date;
  erro?: string;
  preco?: number;
}

export class TwilioService {
  private client: Twilio;
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;
  private whatsappNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || "";
    this.phoneNumber = process.env.TWILIO_PHONE_NUMBER || "";
    this.whatsappNumber =
      process.env.TWILIO_WHATSAPP_NUMBER || this.phoneNumber;

    if (!this.isConfigured()) {
      console.warn(
        "⚠️ TwilioService: Credenciais não configuradas. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_PHONE_NUMBER no .env",
      );
    }

    this.client = twilio(this.accountSid, this.authToken);
  }

  /**
   * Envia um SMS
   */
  async enviarSMS(params: SMSParams): Promise<MessageStatus> {
    try {
      this.validarTelefone(params.para);
      this.validarMensagem(params.mensagem);

      const messageData: any = {
        body: params.mensagem,
        from: this.phoneNumber,
        to: params.para,
      };

      // Agendamento
      if (params.agendarPara) {
        messageData.sendAt = params.agendarPara;
        messageData.scheduleType = "fixed";
      }

      // Callback de status
      if (params.callback) {
        messageData.statusCallback = params.callback;
      }

      const message = await this.client.messages.create(messageData);

      return this.formatarMessageStatus(message);
    } catch (error: any) {
      console.error("Erro ao enviar SMS:", error);
      throw new Error(`Falha ao enviar SMS: ${error.message}`);
    }
  }

  /**
   * Envia uma mensagem pelo WhatsApp
   */
  async enviarWhatsApp(params: WhatsAppParams): Promise<MessageStatus> {
    try {
      this.validarTelefone(params.para);
      this.validarMensagem(params.mensagem);

      const messageData: any = {
        body: params.mensagem,
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${params.para}`,
      };

      // Mídia (imagens, vídeos)
      if (params.midia && params.midia.length > 0) {
        messageData.mediaUrl = params.midia;
      }

      // Callback de status
      if (params.callback) {
        messageData.statusCallback = params.callback;
      }

      const message = await this.client.messages.create(messageData);

      return this.formatarMessageStatus(message);
    } catch (error: any) {
      console.error("Erro ao enviar WhatsApp:", error);
      throw new Error(`Falha ao enviar WhatsApp: ${error.message}`);
    }
  }

  /**
   * Envia SMS em lote
   */
  async enviarSMSEmLote(
    destinatarios: string[],
    mensagem: string,
  ): Promise<{
    sucesso: MessageStatus[];
    falhas: Array<{ telefone: string; erro: string }>;
  }> {
    const sucesso: MessageStatus[] = [];
    const falhas: Array<{ telefone: string; erro: string }> = [];

    // Processar em paralelo (máximo 10 por vez)
    const chunks = this.chunkArray(destinatarios, 10);

    for (const chunk of chunks) {
      const promises = chunk.map(async (telefone) => {
        try {
          const status = await this.enviarSMS({
            para: telefone,
            mensagem,
          });
          sucesso.push(status);
        } catch (error: any) {
          falhas.push({
            telefone,
            erro: error.message,
          });
        }
      });

      await Promise.all(promises);
    }

    return { sucesso, falhas };
  }

  /**
   * Consulta o status de uma mensagem
   */
  async consultarStatus(messageSid: string): Promise<MessageStatus> {
    try {
      const message = await this.client.messages(messageSid).fetch();
      return this.formatarMessageStatus(message);
    } catch (error: any) {
      console.error("Erro ao consultar status:", error);
      throw new Error(`Falha ao consultar status: ${error.message}`);
    }
  }

  /**
   * Lista mensagens enviadas
   */
  async listarMensagens(params?: {
    de?: string;
    para?: string;
    dataInicio?: Date;
    dataFim?: Date;
    limite?: number;
  }): Promise<MessageStatus[]> {
    try {
      const options: any = {
        limit: params?.limite || 50,
      };

      if (params?.de) options.from = params.de;
      if (params?.para) options.to = params.para;
      if (params?.dataInicio) options.dateSentAfter = params.dataInicio;
      if (params?.dataFim) options.dateSentBefore = params.dataFim;

      const messages = await this.client.messages.list(options);

      return messages.map((msg) => this.formatarMessageStatus(msg));
    } catch (error: any) {
      console.error("Erro ao listar mensagens:", error);
      throw new Error(`Falha ao listar mensagens: ${error.message}`);
    }
  }

  /**
   * Verifica se um número de telefone é válido
   */
  async verificarTelefone(telefone: string): Promise<{
    valido: boolean;
    formatado: string;
    tipo: "mobile" | "landline" | "voip";
    pais: string;
    operadora?: string;
  }> {
    try {
      const lookup = await this.client.lookups.v1
        .phoneNumbers(telefone)
        .fetch({ type: ["carrier"] });

      return {
        valido: true,
        formatado: lookup.phoneNumber,
        tipo: (lookup.carrier?.type as any) || "mobile",
        pais: lookup.countryCode,
        operadora: lookup.carrier?.name,
      };
    } catch (error: any) {
      return {
        valido: false,
        formatado: telefone,
        tipo: "mobile",
        pais: "BR",
      };
    }
  }

  /**
   * Processa webhook de status de mensagem
   */
  processarWebhook(body: any): {
    messageSid: string;
    status: string;
    de: string;
    para: string;
    erro?: string;
  } {
    return {
      messageSid: body.MessageSid || body.SmsSid,
      status: body.MessageStatus || body.SmsStatus,
      de: body.From,
      para: body.To,
      erro: body.ErrorCode
        ? `${body.ErrorCode}: ${body.ErrorMessage}`
        : undefined,
    };
  }

  /**
   * Valida assinatura do webhook
   */
  validarWebhookSignature(
    signature: string,
    url: string,
    params: Record<string, string>,
  ): boolean {
    try {
      return twilio.validateRequest(this.authToken, signature, url, params);
    } catch (error) {
      console.error("Erro ao validar assinatura:", error);
      return false;
    }
  }

  // ===== Métodos Auxiliares =====

  private validarTelefone(telefone: string): void {
    if (!telefone) {
      throw new Error("Número de telefone é obrigatório");
    }

    // Deve começar com +
    if (!telefone.startsWith("+")) {
      throw new Error("Telefone deve começar com + seguido do código do país");
    }

    // Deve ter pelo menos 10 dígitos
    const digitos = telefone.replace(/\D/g, "");
    if (digitos.length < 10) {
      throw new Error("Telefone inválido (mínimo 10 dígitos)");
    }
  }

  private validarMensagem(mensagem: string): void {
    if (!mensagem || mensagem.trim().length === 0) {
      throw new Error("Mensagem não pode estar vazia");
    }

    // SMS tem limite de 1600 caracteres
    if (mensagem.length > 1600) {
      throw new Error("Mensagem muito longa (máximo 1600 caracteres)");
    }
  }

  private formatarMessageStatus(message: MessageInstance): MessageStatus {
    return {
      sid: message.sid,
      status: message.status as any,
      para: message.to,
      de: message.from,
      mensagem: message.body,
      dataEnvio: message.dateCreated,
      erro: message.errorCode
        ? `${message.errorCode}: ${message.errorMessage}`
        : undefined,
      preco: message.price ? parseFloat(message.price) : undefined,
    };
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(this.accountSid && this.authToken && this.phoneNumber);
  }

  /**
   * Testa a conexão com a API
   */
  async testarConexao(): Promise<boolean> {
    try {
      await this.client.api.accounts(this.accountSid).fetch();
      return true;
    } catch (error) {
      console.error("Erro ao testar conexão Twilio:", error);
      return false;
    }
  }
}

export default TwilioService;
