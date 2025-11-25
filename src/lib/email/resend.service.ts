/**
 * Resend Email Service
 * Substitui SendGrid/Mailgun com free tier generoso (3k emails/mês)
 * Templates em React
 *
 * Economia: $180-600/ano
 */

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResponse {
  id: string;
  success: boolean;
  error?: string;
}

export class ResendService {
  private apiKey: string;
  private baseURL = 'https://api.resend.com';
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom = 'ICARUS <noreply@icarus.com.br>') {
    this.apiKey = apiKey || process.env.VITE_RESEND_API_KEY || '';
    this.defaultFrom = defaultFrom;

    if (!this.apiKey) {
      console.warn('[ResendService] API key not configured. Set VITE_RESEND_API_KEY');
    }
  }

  /**
   * Envia e-mail transacional
   */
  async sendEmail(template: EmailTemplate): Promise<EmailResponse> {
    if (!this.apiKey) {
      console.error('[ResendService] Cannot send email: API key not configured');
      return {
        id: 'mock',
        success: false,
        error: 'API key not configured',
      };
    }

    try {
      const response = await fetch(`${this.baseURL}/emails`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: template.from || this.defaultFrom,
          to: Array.isArray(template.to) ? template.to : [template.to],
          subject: template.subject,
          html: template.html,
          text: template.text,
          reply_to: template.replyTo,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend API error: ${error}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      console.error('[ResendService] Send error:', err);
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * E-mail: Cirurgia confirmada
   */
  async sendCirurgiaConfirmada(params: {
    to: string;
    medico: string;
    paciente: string;
    procedimento: string;
    data: string;
    hospital: string;
    cirurgiaId: string;
  }): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏥 Cirurgia Confirmada</h1>
            </div>
            <div class="content">
              <p>Olá <strong>Dr(a). ${params.medico}</strong>,</p>
              
              <p>A cirurgia foi confirmada com sucesso!</p>
              
              <h3>Detalhes:</h3>
              <ul>
                <li><strong>Paciente:</strong> ${params.paciente}</li>
                <li><strong>Procedimento:</strong> ${params.procedimento}</li>
                <li><strong>Data/Hora:</strong> ${params.data}</li>
                <li><strong>Hospital:</strong> ${params.hospital}</li>
              </ul>
              
              <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/cirurgias/${params.cirurgiaId}" class="button">
                Ver Detalhes da Cirurgia
              </a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </div>
            <div class="footer">
              <p>ICARUS v5.0 - Sistema de Gestão OPME</p>
              <p>&copy; 2025 Icarus AI Technology</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Cirurgia Confirmada

Olá Dr(a). ${params.medico},

A cirurgia foi confirmada com sucesso!

Detalhes:
- Paciente: ${params.paciente}
- Procedimento: ${params.procedimento}
- Data/Hora: ${params.data}
- Hospital: ${params.hospital}

Acesse o sistema para ver mais detalhes.

ICARUS v5.0 - Sistema de Gestão OPME
    `.trim();

    return this.sendEmail({
      to: params.to,
      subject: `✅ Cirurgia Confirmada - ${params.paciente}`,
      html,
      text,
    });
  }

  /**
   * E-mail: Alerta de estoque baixo
   */
  async sendAlertaEstoque(params: {
    to: string;
    produto: string;
    quantidadeAtual: number;
    pontoReposicao: number;
  }): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fffbeb; padding: 30px; border: 2px solid #f59e0b; border-radius: 0 0 8px 8px; }
            .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Estoque Baixo</h1>
            </div>
            <div class="content">
              <div class="alert">
                <h3 style="margin-top: 0;">⚠️ Atenção Necessária</h3>
                <p><strong>Produto:</strong> ${params.produto}</p>
                <p><strong>Quantidade Atual:</strong> ${params.quantidadeAtual} unidades</p>
                <p><strong>Ponto de Reposição:</strong> ${params.pontoReposicao} unidades</p>
              </div>
              
              <p>O produto atingiu o ponto de reposição. Recomendamos solicitar reposição imediatamente para evitar ruptura de estoque.</p>
              
              <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/estoque" class="button">
                Gerenciar Estoque
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.to,
      subject: `⚠️ Alerta: Estoque Baixo - ${params.produto}`,
      html,
    });
  }

  /**
   * E-mail: NFe emitida
   */
  async sendNFeEmitida(params: {
    to: string;
    numeroNFe: string;
    chaveAcesso: string;
    valor: number;
    cliente: string;
  }): Promise<EmailResponse> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; border: 1px solid #d1fae5; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ NFe Emitida com Sucesso</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              
              <p>A Nota Fiscal Eletrônica foi emitida com sucesso!</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Informações da NFe</h3>
                <p><strong>Número:</strong> ${params.numeroNFe}</p>
                <p><strong>Cliente:</strong> ${params.cliente}</p>
                <p><strong>Valor:</strong> R$ ${params.valor.toFixed(2)}</p>
                <p><strong>Chave de Acesso:</strong><br><code style="font-size: 12px; word-break: break-all;">${params.chaveAcesso}</code></p>
              </div>
              
              <a href="${process.env.VITE_APP_URL || 'http://localhost:3000'}/faturamento" class="button">
                Ver Faturamento
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: params.to,
      subject: `✅ NFe ${params.numeroNFe} Emitida - ${params.cliente}`,
      html,
    });
  }
}

// Export singleton
export const resendService = new ResendService();
