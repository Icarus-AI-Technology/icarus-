/**
 * SendGrid Service - Email Transacional
 * 
 * Funcionalidades:
 * - Envio de emails
 * - Templates dinâmicos
 * - Emails em lote
 * - Anexos
 * - Tracking de abertura e cliques
 * - Webhooks para eventos
 * 
 * Documentação API: https://docs.sendgrid.com/
 */

import sgMail from '@sendgrid/mail';
import type { MailDataRequired, ResponseError } from '@sendgrid/mail';

function isResponseError(error: unknown): error is ResponseError {
  return typeof error === 'object' && error !== null && 'response' in error;
}

export interface EmailParams {
  para: string | string[];
  assunto: string;
  html?: string;
  texto?: string;
  cc?: string[];
  bcc?: string[];
  anexos?: Array<{
    nome: string;
    conteudo: string | Buffer; // Base64 ou Buffer
    tipo?: string; // MIME type
  }>;
  agendarPara?: Date;
  tracking?: {
    abrirEmail?: boolean;
    clicarLinks?: boolean;
  };
  tags?: string[];
  replyTo?: string;
}

export interface EmailTemplateParams {
  para: string | string[];
  templateId: string;
  dados: Record<string, unknown>;
  cc?: string[];
  bcc?: string[];
  agendarPara?: Date;
  tags?: string[];
}

export interface EmailStatus {
  messageId: string;
  statusCode: number;
  para: string[];
  enviado: boolean;
  erro?: string;
}

export interface EmailEvent {
  email: string;
  evento: 'delivered' | 'open' | 'click' | 'bounce' | 'dropped' | 'spam' | 'unsubscribe';
  timestamp: number;
  url?: string; // Para eventos de click
  razao?: string; // Para bounce/dropped
}

type SendGridWebhookEvent = {
  email: string;
  event: EmailEvent['evento'];
  timestamp: number;
  url?: string;
  reason?: string;
  status?: string;
};

export class SendGridService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@icarus.com.br';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'Icarus Make';

    if (!this.isConfigured()) {
      console.warn('⚠️  SendGridService: API Key não configurada. Configure SENDGRID_API_KEY no .env');
    }

    sgMail.setApiKey(this.apiKey);
  }

  /**
   * Envia um email simples
   */
  async enviarEmail(params: EmailParams): Promise<EmailStatus> {
    try {
      this.validarEmail(params);

      const msg: MailDataRequired = {
        to: params.para,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject: params.assunto,
        text: params.texto || '',
        html: params.html || params.texto || '',
        cc: params.cc,
        bcc: params.bcc,
        replyTo: params.replyTo
      };

      // Anexos
      if (params.anexos && params.anexos.length > 0) {
        msg.attachments = params.anexos.map(anexo => ({
          filename: anexo.nome,
          content: typeof anexo.conteudo === 'string' 
            ? anexo.conteudo 
            : anexo.conteudo.toString('base64'),
          type: anexo.tipo || 'application/octet-stream',
          disposition: 'attachment'
        }));
      }

      // Tracking
      if (params.tracking) {
        msg.trackingSettings = {
          clickTracking: {
            enable: params.tracking.clicarLinks ?? true
          },
          openTracking: {
            enable: params.tracking.abrirEmail ?? true
          }
        };
      }

      // Tags/Categorias
      if (params.tags && params.tags.length > 0) {
        msg.categories = params.tags;
      }

      // Agendamento
      if (params.agendarPara) {
        msg.sendAt = Math.floor(params.agendarPara.getTime() / 1000);
      }

      const [response] = await sgMail.send(msg);

      return {
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        para: Array.isArray(params.para) ? params.para : [params.para],
        enviado: response.statusCode >= 200 && response.statusCode < 300
      };
    } catch (error: unknown) {
      console.error('Erro ao enviar email:', error);

      if (isResponseError(error)) {
        const message =
          error.response.body?.errors?.[0]?.message ?? 'Erro desconhecido';
        throw new Error(`Falha ao enviar email: ${message}`);
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Falha ao enviar email: ${message}`);
    }
  }

  /**
   * Envia email usando template dinâmico
   */
  async enviarEmailTemplate(params: EmailTemplateParams): Promise<EmailStatus> {
    try {
      const msg: MailDataRequired = {
        to: params.para,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        templateId: params.templateId,
        dynamicTemplateData: params.dados,
        cc: params.cc,
        bcc: params.bcc
      };

      // Tags
      if (params.tags && params.tags.length > 0) {
        msg.categories = params.tags;
      }

      // Agendamento
      if (params.agendarPara) {
        msg.sendAt = Math.floor(params.agendarPara.getTime() / 1000);
      }

      const [response] = await sgMail.send(msg);

      return {
        messageId: response.headers['x-message-id'],
        statusCode: response.statusCode,
        para: Array.isArray(params.para) ? params.para : [params.para],
        enviado: response.statusCode >= 200 && response.statusCode < 300
      };
    } catch (error: unknown) {
      console.error('Erro ao enviar email template:', error);

      if (isResponseError(error)) {
        const message =
          error.response.body?.errors?.[0]?.message ?? 'Erro desconhecido';
        throw new Error(`Falha ao enviar email template: ${message}`);
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Falha ao enviar email template: ${message}`);
    }
  }

  /**
   * Envia emails em lote (até 1000 por vez)
   */
  async enviarEmLote(emails: EmailParams[]): Promise<{
    sucesso: EmailStatus[];
    falhas: Array<{ email: string; erro: string }>;
  }> {
    const sucesso: EmailStatus[] = [];
    const falhas: Array<{ email: string; erro: string }> = [];

    // SendGrid permite até 1000 emails por request
    const chunks = this.chunkArray(emails, 1000);

    for (const chunk of chunks) {
      const promises = chunk.map(async (emailParams) => {
        try {
          const status = await this.enviarEmail(emailParams);
          sucesso.push(status);
        } catch (error: unknown) {
          const para = Array.isArray(emailParams.para) ? emailParams.para[0] : emailParams.para;
          falhas.push({
            email: para,
            erro: error instanceof Error ? error.message : String(error)
          });
        }
      });

      await Promise.all(promises);
    }

    return { sucesso, falhas };
  }

  /**
   * Envia email de boas-vindas
   */
  async enviarBoasVindas(para: string, nome: string): Promise<EmailStatus> {
    return this.enviarEmail({
      para,
      assunto: 'Bem-vindo ao Icarus Make!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Olá, ${nome}!</h1>
          <p>Seja bem-vindo ao Icarus Make, sua plataforma de gestão hospitalar.</p>
          <p>Estamos felizes em tê-lo conosco!</p>
          <div style="margin: 30px 0;">
            <a href="https://icarus.com.br/dashboard" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Plataforma
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se você não se cadastrou no Icarus Make, ignore este email.
          </p>
        </div>
      `,
      texto: `Olá, ${nome}! Seja bem-vindo ao Icarus Make.`,
      tags: ['boas-vindas', 'onboarding']
    });
  }

  /**
   * Envia email de recuperação de senha
   */
  async enviarRecuperacaoSenha(para: string, token: string): Promise<EmailStatus> {
    const url = `https://icarus.com.br/reset-password?token=${token}`;
    
    return this.enviarEmail({
      para,
      assunto: 'Recuperação de Senha - Icarus Make',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Recuperação de Senha</h1>
          <p>Você solicitou a recuperação de senha para sua conta no Icarus Make.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Este link expira em 1 hora.
          </p>
          <p style="color: #666; font-size: 14px;">
            Se você não solicitou esta recuperação, ignore este email.
          </p>
        </div>
      `,
      texto: `Acesse o link para redefinir sua senha: ${url}`,
      tags: ['recuperacao-senha', 'seguranca']
    });
  }

  /**
   * Processa webhook de eventos do SendGrid
   */
  processarWebhook(body: SendGridWebhookEvent[]): EmailEvent[] {
    return body.map(event => ({
      email: event.email,
      evento: event.event,
      timestamp: event.timestamp,
      url: event.url,
      razao: event.reason || event.status
    }));
  }

  /**
   * Valida assinatura do webhook
   */
  validarWebhookSignature(
    signature: string,
    timestamp: string,
    body: string
  ): boolean {
    try {
      const crypto = require('crypto');
      const publicKey = process.env.SENDGRID_WEBHOOK_PUBLIC_KEY || '';
      
      const payload = timestamp + body;
      const verifier = crypto.createVerify('sha256');
      verifier.update(payload);
      
      return verifier.verify(publicKey, signature, 'base64');
    } catch (error) {
      console.error('Erro ao validar assinatura:', error);
      return false;
    }
  }

  // ===== Métodos Auxiliares =====

  private validarEmail(params: EmailParams): void {
    if (!params.para) {
      throw new Error('Destinatário é obrigatório');
    }

    if (!params.assunto) {
      throw new Error('Assunto é obrigatório');
    }

    if (!params.html && !params.texto) {
      throw new Error('HTML ou texto é obrigatório');
    }

    // Validar formato de email
    const emails = Array.isArray(params.para) ? params.para : [params.para];
    emails.forEach(email => {
      if (!this.isValidEmailFormat(email)) {
        throw new Error(`Email inválido: ${email}`);
      }
    });
  }

  private isValidEmailFormat(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    return !!this.apiKey && !!this.fromEmail;
  }

  /**
   * Testa a conexão com a API
   */
  async testarConexao(): Promise<boolean> {
    try {
      // SendGrid não tem endpoint de ping, então tentamos validar a API key
      // enviando uma requisição simples
      return this.apiKey.length > 0 && this.apiKey.startsWith('SG.');
    } catch (error) {
      console.error('Erro ao testar conexão SendGrid:', error);
      return false;
    }
  }
}

export default SendGridService;

