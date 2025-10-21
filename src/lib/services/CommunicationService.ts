/**
 * Service: Communication Service
 * 
 * Gerenciamento centralizado de comunicações via:
 * - Twilio (SMS)
 * - WhatsApp Business API
 * - SendGrid (Email)
 * - Mailchimp (Campanhas)
 */

import { APIGatewayService, APIRequest } from './APIGatewayService';

export interface SMSRequest {
  to: string; // Telefone no formato +5511999999999
  message: string;
  from?: string; // Opcional, usa padrão da conta Twilio
}

export interface WhatsAppRequest {
  to: string; // Telefone no formato +5511999999999
  message: string;
  template?: string; // Nome do template aprovado
  templateParams?: Record<string, string>; // Parâmetros do template
}

export interface EmailRequest {
  to: string | string[]; // Email(s) do destinatário
  from?: string; // Opcional, usa padrão SendGrid
  subject: string;
  html?: string; // Corpo HTML
  text?: string; // Corpo texto puro
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string; // Base64
    type: string; // MIME type
  }>;
}

export interface CampaignRequest {
  listId: string; // ID da lista Mailchimp
  subject: string;
  fromName: string;
  replyTo: string;
  htmlContent: string;
  textContent?: string;
  schedule?: string; // ISO date para agendar
}

export class CommunicationService {
  /**
   * Enviar SMS via Twilio
   */
  static async sendSMS(request: SMSRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validações
      if (!request.to || !request.message) {
        throw new Error('Campos obrigatórios: to, message');
      }

      // Formatar telefone (remover espaços, adicionar +55 se necessário)
      const phone = this.formatPhoneNumber(request.to);

      // Construir request para API Gateway
      const apiRequest: APIRequest = {
        endpoint: 'twilio_send_sms',
        body: {
          To: phone,
          Body: request.message,
          From: request.from || process.env.TWILIO_PHONE_NUMBER
        }
      };

      // Fazer chamada via API Gateway
      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        return {
          success: true,
          messageId: response.data.sid
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao enviar SMS'
        };
      }
    } catch (error) {
      console.error('[Communication Service] Erro ao enviar SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Enviar mensagem via WhatsApp Business API
   */
  static async sendWhatsApp(request: WhatsAppRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validações
      if (!request.to || (!request.message && !request.template)) {
        throw new Error('Campos obrigatórios: to, message ou template');
      }

      const phone = this.formatPhoneNumber(request.to);

      // Construir payload baseado em template ou mensagem livre
      const payload: any = {
        messaging_product: 'whatsapp',
        to: phone
      };

      if (request.template) {
        // Mensagem com template aprovado
        payload.type = 'template';
        payload.template = {
          name: request.template,
          language: { code: 'pt_BR' }
        };

        if (request.templateParams) {
          payload.template.components = [
            {
              type: 'body',
              parameters: Object.values(request.templateParams).map(value => ({
                type: 'text',
                text: value
              }))
            }
          ];
        }
      } else {
        // Mensagem de texto livre
        payload.type = 'text';
        payload.text = { body: request.message };
      }

      const apiRequest: APIRequest = {
        endpoint: 'whatsapp_send_message',
        body: payload
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success && response.data) {
        return {
          success: true,
          messageId: response.data.messages?.[0]?.id
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao enviar WhatsApp'
        };
      }
    } catch (error) {
      console.error('[Communication Service] Erro ao enviar WhatsApp:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Enviar email via SendGrid
   */
  static async sendEmail(request: EmailRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validações
      if (!request.to || !request.subject || (!request.html && !request.text)) {
        throw new Error('Campos obrigatórios: to, subject, html ou text');
      }

      // Normalizar destinatários
      const toArray = Array.isArray(request.to) ? request.to : [request.to];

      const payload = {
        personalizations: [
          {
            to: toArray.map(email => ({ email })),
            ...(request.cc && { cc: (Array.isArray(request.cc) ? request.cc : [request.cc]).map(email => ({ email })) }),
            ...(request.bcc && { bcc: (Array.isArray(request.bcc) ? request.bcc : [request.bcc]).map(email => ({ email })) })
          }
        ],
        from: {
          email: request.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@icarus.com.br',
          name: 'ICARUS v5.0'
        },
        subject: request.subject,
        content: [
          ...(request.html ? [{ type: 'text/html', value: request.html }] : []),
          ...(request.text ? [{ type: 'text/plain', value: request.text }] : [])
        ],
        ...(request.attachments && { attachments: request.attachments })
      };

      const apiRequest: APIRequest = {
        endpoint: 'sendgrid_send_email',
        body: payload
      };

      const response = await APIGatewayService.request(apiRequest);

      if (response.success) {
        return {
          success: true,
          messageId: response.headers?.['x-message-id']
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erro ao enviar email'
        };
      }
    } catch (error) {
      console.error('[Communication Service] Erro ao enviar email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Criar e enviar campanha via Mailchimp
   */
  static async sendCampaign(request: CampaignRequest): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      // Validações
      if (!request.listId || !request.subject || !request.htmlContent) {
        throw new Error('Campos obrigatórios: listId, subject, htmlContent');
      }

      // 1. Criar campanha
      const createPayload = {
        type: 'regular',
        recipients: {
          list_id: request.listId
        },
        settings: {
          subject_line: request.subject,
          from_name: request.fromName,
          reply_to: request.replyTo,
          title: `ICARUS - ${request.subject}`
        }
      };

      const createRequest: APIRequest = {
        endpoint: 'mailchimp_create_campaign',
        body: createPayload
      };

      const createResponse = await APIGatewayService.request(createRequest);

      if (!createResponse.success || !createResponse.data?.id) {
        throw new Error('Falha ao criar campanha');
      }

      const campaignId = createResponse.data.id;

      // 2. Adicionar conteúdo
      const contentRequest: APIRequest = {
        endpoint: 'mailchimp_set_content',
        params: { campaignId },
        body: {
          html: request.htmlContent,
          ...(request.textContent && { plain_text: request.textContent })
        }
      };

      const contentResponse = await APIGatewayService.request(contentRequest);

      if (!contentResponse.success) {
        throw new Error('Falha ao adicionar conteúdo');
      }

      // 3. Enviar ou agendar
      if (request.schedule) {
        // Agendar
        const scheduleRequest: APIRequest = {
          endpoint: 'mailchimp_schedule_campaign',
          params: { campaignId },
          body: {
            schedule_time: request.schedule
          }
        };

        await APIGatewayService.request(scheduleRequest);
      } else {
        // Enviar imediatamente
        const sendRequest: APIRequest = {
          endpoint: 'mailchimp_send_campaign',
          params: { campaignId }
        };

        await APIGatewayService.request(sendRequest);
      }

      return {
        success: true,
        campaignId
      };
    } catch (error) {
      console.error('[Communication Service] Erro ao enviar campanha:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Formatar número de telefone para padrão internacional
   */
  private static formatPhoneNumber(phone: string): string {
    // Remover caracteres não numéricos
    let cleaned = phone.replace(/\D/g, '');

    // Adicionar +55 se não tiver código do país
    if (!cleaned.startsWith('55') && cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }

    // Adicionar + se não tiver
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Enviar notificação multi-canal
   * Tenta SMS primeiro, depois WhatsApp como fallback
   */
  static async sendNotification(params: {
    phone: string;
    message: string;
    preferredChannel?: 'sms' | 'whatsapp';
  }): Promise<{ success: boolean; channel?: string; error?: string }> {
    const { phone, message, preferredChannel = 'sms' } = params;

    try {
      if (preferredChannel === 'sms') {
        const smsResult = await this.sendSMS({ to: phone, message });
        if (smsResult.success) {
          return { success: true, channel: 'sms' };
        }
        // Fallback para WhatsApp
        const waResult = await this.sendWhatsApp({ to: phone, message });
        return waResult.success 
          ? { success: true, channel: 'whatsapp' }
          : { success: false, error: 'Falha em ambos canais' };
      } else {
        const waResult = await this.sendWhatsApp({ to: phone, message });
        if (waResult.success) {
          return { success: true, channel: 'whatsapp' };
        }
        // Fallback para SMS
        const smsResult = await this.sendSMS({ to: phone, message });
        return smsResult.success
          ? { success: true, channel: 'sms' }
          : { success: false, error: 'Falha em ambos canais' };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const communicationService = new CommunicationService();

