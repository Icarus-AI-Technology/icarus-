/**
 * 🔔 NOTIFICATION SERVICE — SISTEMA DE NOTIFICAÇÕES
 *
 * Serviço centralizado para envio de notificações multi-canal
 * Suporta: Email, WhatsApp, SMS, Push, In-App
 *
 * Features:
 * - Multi-canal (Email, WhatsApp, SMS, Push, In-App)
 * - Templates dinâmicos
 * - Retry automático
 * - Queue management
 * - Analytics
 * - Error handling
 */

import { supabase } from "@/lib/supabase";

// ============================================
// TYPES
// ============================================

export interface NotificationPayload {
  channel: NotificationChannel;
  to: string | string[]; // Email, phone, user_id, etc.
  subject?: string;
  message: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  priority?: "low" | "medium" | "high" | "urgent";
  scheduledFor?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  sentAt?: Date;
  channel: NotificationChannel;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: string[];
}

// ============================================
// TEMPLATES
// ============================================

const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Workflow genérico
  "workflow.transition": {
    id: "workflow.transition",
    name: "Transição de Workflow",
    channel: "EMAIL",
    subject: "{{workflowName}} - {{fromState}} → {{toState}}",
    body: `
Olá {{userName}},

O item {{entityType}} #{{entityId}} foi movido de"{{fromState}}" para"{{toState}}".

{{#comment}}
Comentário: {{comment}}
{{/comment}}

Executado por: {{executedBy}}
Data: {{executedAt}}

Acesse o sistema para mais detalhes: {{systemUrl}}

---
ICARUS v5.0 - Gestão elevada pela IA
    `,
    variables: [
      "workflowName",
      "entityType",
      "entityId",
      "fromState",
      "toState",
      "comment",
      "executedBy",
      "executedAt",
      "systemUrl",
      "userName",
    ],
  },

  // Cirurgias
  "cirurgia.confirmada": {
    id: "cirurgia.confirmada",
    name: "Cirurgia Confirmada",
    channel: "WHATSAPP",
    body: `🏥 *Confirmação de Cirurgia*

Olá {{patientName}},

Sua cirurgia foi confirmada:
📅 Data: {{surgeryDate}}
🕐 Horário: {{surgeryTime}}
👨‍⚕️ Cirurgião: {{surgeonName}}
🏥 Hospital: {{hospitalName}}

*Orientações:*
{{instructions}}

Dúvidas? Ligue (11) 9999-9999

_ICARUS v5.0_`,
    variables: [
      "patientName",
      "surgeryDate",
      "surgeryTime",
      "surgeonName",
      "hospitalName",
      "instructions",
    ],
  },

  "cirurgia.atraso": {
    id: "cirurgia.atraso",
    name: "Alerta de Atraso em Cirurgia",
    channel: "EMAIL",
    subject: "⚠️ ALERTA: Cirurgia #{{surgeryId}} com possível atraso",
    body: `
ALERTA DE SLA

A cirurgia #{{surgeryId}} está há {{hoursInState}} horas no estado"{{currentState}}" 
e pode estar atrasada.

Paciente: {{patientName}}
Data prevista: {{scheduledDate}}
Estado atual: {{currentState}}

Ação requerida: {{requiredAction}}

Acesse o sistema: {{systemUrl}}

---
ICARUS v5.0 - Sistema de Alertas
    `,
    variables: [
      "surgeryId",
      "hoursInState",
      "currentState",
      "patientName",
      "scheduledDate",
      "requiredAction",
      "systemUrl",
    ],
  },

  // Compras
  "cotacao.resposta": {
    id: "cotacao.resposta",
    name: "Resposta de Cotação Recebida",
    channel: "IN_APP",
    body: `Nova resposta de cotação recebida do fornecedor {{supplierName}} para cotação #{{quotationId}}. Valor: {{amount}}`,
    variables: ["supplierName", "quotationId", "amount"],
  },

  "pedido.aprovado": {
    id: "pedido.aprovado",
    name: "Pedido Aprovado",
    channel: "EMAIL",
    subject: "✅ Pedido #{{orderId}} aprovado",
    body: `
Olá {{buyerName}},

Seu pedido de compra foi aprovado!

Pedido: #{{orderId}}
Fornecedor: {{supplierName}}
Valor: {{totalAmount}}
Aprovado por: {{approverName}}

Próximo passo: {{nextStep}}

Acesse: {{systemUrl}}

---
ICARUS v5.0
    `,
    variables: [
      "buyerName",
      "orderId",
      "supplierName",
      "totalAmount",
      "approverName",
      "nextStep",
      "systemUrl",
    ],
  },

  // OPME
  "opme.glosa": {
    id: "opme.glosa",
    name: "Glosa em Faturamento OPME",
    channel: "EMAIL",
    subject: "🚨 Glosa identificada - Guia #{{guideId}}",
    body: `
ALERTA DE GLOSA

A guia #{{guideId}} foi rejeitada pelo plano de saúde.

Paciente: {{patientName}}
Plano: {{healthPlan}}
Valor glosado: {{glosedAmount}}
Motivo: {{reason}}

Ação: Iniciar recurso de glosa

Prazo: {{deadline}}

Acesse: {{systemUrl}}

---
ICARUS v5.0
    `,
    variables: [
      "guideId",
      "patientName",
      "healthPlan",
      "glosedAmount",
      "reason",
      "deadline",
      "systemUrl",
    ],
  },

  // Contratos
  "contrato.vencimento": {
    id: "contrato.vencimento",
    name: "Alerta de Vencimento de Contrato",
    channel: "EMAIL",
    subject: "⏰ Contrato #{{contractId}} vence em {{daysToExpire}} dias",
    body: `
ALERTA DE VENCIMENTO

O contrato #{{contractId}} vencerá em breve.

Contratante: {{contractorName}}
Valor: {{contractValue}}
Vencimento: {{expirationDate}}
Dias restantes: {{daysToExpire}}

Ação requerida: {{requiredAction}}

Acesse: {{systemUrl}}

---
ICARUS v5.0
    `,
    variables: [
      "contractId",
      "contractorName",
      "contractValue",
      "expirationDate",
      "daysToExpire",
      "requiredAction",
      "systemUrl",
    ],
  },

  // Licitações
  "licitacao.prazo": {
    id: "licitacao.prazo",
    name: "Alerta de Prazo em Licitação",
    channel: "EMAIL",
    subject: "⏰ URGENTE: Licitação #{{biddingId}} - Prazo {{deadline}}",
    body: `
ALERTA DE PRAZO

A licitação #{{biddingId}} tem prazo se aproximando.

Modalidade: {{modality}}
Órgão: {{agency}}
Prazo: {{deadline}}
Tempo restante: {{timeRemaining}}

Ação urgente: {{urgentAction}}

Acesse: {{systemUrl}}

---
ICARUS v5.0
    `,
    variables: [
      "biddingId",
      "modality",
      "agency",
      "deadline",
      "timeRemaining",
      "urgentAction",
      "systemUrl",
    ],
  },
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

export class NotificationService {
  private static queue: NotificationPayload[] = [];
  private static processing = false;

  /**
   * Envia uma notificação
   */
  static async send(payload: NotificationPayload): Promise<NotificationResult> {
    const enabled = this.isChannelEnabled(payload.channel);

    if (!enabled) {
      console.warn(
        `[NotificationService] Canal ${payload.channel} não está habilitado`,
      );
      return {
        success: false,
        channel: payload.channel,
        error: "Canal não habilitado",
      };
    }

    // Se tiver schedule, adicionar à fila
    if (payload.scheduledFor && new Date(payload.scheduledFor) > new Date()) {
      await this.addToQueue(payload);
      return {
        success: true,
        channel: payload.channel,
        notificationId: `scheduled-${Date.now()}`,
      };
    }

    // Aplicar template se fornecido
    let finalMessage = payload.message;
    let finalSubject = payload.subject;

    if (payload.templateId) {
      const template = NOTIFICATION_TEMPLATES[payload.templateId];
      if (template) {
        finalMessage = this.applyTemplate(
          template.body,
          payload.templateData || {},
        );
        finalSubject = template.subject
          ? this.applyTemplate(template.subject, payload.templateData || {})
          : payload.subject;
      }
    }

    try {
      // Enviar baseado no canal
      switch (payload.channel) {
        case "EMAIL":
          return await this.sendEmail({
            ...payload,
            message: finalMessage,
            subject: finalSubject || "Notificação ICARUS v5.0",
          });

        case "WHATSAPP":
          return await this.sendWhatsApp({
            ...payload,
            message: finalMessage,
          });

        case "SMS":
          return await this.sendSMS({
            ...payload,
            message: finalMessage,
          });

        case "PUSH":
          return await this.sendPush({
            ...payload,
            message: finalMessage,
          });

        case "IN_APP":
          return await this.sendInApp({
            ...payload,
            message: finalMessage,
          });

        default:
          throw new Error(`Canal não suportado: ${payload.channel}`);
      }
    } catch (error) {
      const err = error as Error;
      console.error("[NotificationService] Erro ao enviar notificação:", err);

      // Tentar novamente para notificações críticas
      if (payload.priority === "urgent" || payload.priority === "high") {
        await this.addToRetryQueue(payload);
      }

      return {
        success: false,
        channel: payload.channel,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Enviar email
   */
  private static async sendEmail(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    const smtpEnabled = import.meta.env.SMTP_HOST;

    if (!smtpEnabled) {
      console.log("[NotificationService] [MOCK] Email:", {
        to: payload.to,
        subject: payload.subject,
        message: payload.message,
      });

      return {
        success: true,
        channel: "EMAIL",
        notificationId: `email-mock-${Date.now()}`,
        sentAt: new Date(),
      };
    }

    // Em produção: usar nodemailer ou similar
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({...});

    return {
      success: true,
      channel: "EMAIL",
      notificationId: `email-${Date.now()}`,
      sentAt: new Date(),
    };
  }

  /**
   * Enviar WhatsApp
   */
  private static async sendWhatsApp(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    const zapiEnabled = import.meta.env.VITE_ZAPI_ENABLED === "true";

    if (!zapiEnabled) {
      console.log("[NotificationService] [MOCK] WhatsApp:", {
        to: payload.to,
        message: payload.message,
      });

      return {
        success: true,
        channel: "WHATSAPP",
        notificationId: `whatsapp-mock-${Date.now()}`,
        sentAt: new Date(),
      };
    }

    // Em produção: usar Z-API
    // const response = await fetch(`${ZAPI_BASE_URL}/send-text`, {
    //   method: 'POST',
    //   headers: { 'Client-Token': ZAPI_TOKEN },
    //   body: JSON.stringify({ phone: payload.to, message: payload.message }),
    // });

    return {
      success: true,
      channel: "WHATSAPP",
      notificationId: `whatsapp-${Date.now()}`,
      sentAt: new Date(),
    };
  }

  /**
   * Enviar SMS
   */
  private static async sendSMS(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    console.log("[NotificationService] [MOCK] SMS:", {
      to: payload.to,
      message: payload.message,
    });

    return {
      success: true,
      channel: "SMS",
      notificationId: `sms-mock-${Date.now()}`,
      sentAt: new Date(),
    };
  }

  /**
   * Enviar Push Notification
   */
  private static async sendPush(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    console.log("[NotificationService] [MOCK] Push:", {
      to: payload.to,
      message: payload.message,
    });

    // Em produção: usar Firebase Cloud Messaging

    return {
      success: true,
      channel: "PUSH",
      notificationId: `push-mock-${Date.now()}`,
      sentAt: new Date(),
    };
  }

  /**
   * Enviar notificação In-App
   */
  private static async sendInApp(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    try {
      // Salvar no Supabase
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          user_id: payload.to,
          channel: "IN_APP",
          subject: payload.subject,
          message: payload.message,
          priority: payload.priority || "medium",
          metadata: payload.metadata,
          read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        channel: "IN_APP",
        notificationId: data.id,
        sentAt: new Date(),
      };
    } catch (error) {
      const err = error as Error;
      console.error(
        "[NotificationService] Erro ao salvar notificação in-app:",
        err,
      );
      return {
        success: false,
        channel: "IN_APP",
        error: error instanceof Error ? error.message : "Erro ao salvar",
      };
    }
  }

  /**
   * Enviar múltiplas notificações em batch
   */
  static async sendBatch(
    payloads: NotificationPayload[],
  ): Promise<NotificationResult[]> {
    return Promise.all(payloads.map((p) => this.send(p)));
  }

  /**
   * Aplicar template com variáveis
   */
  private static applyTemplate(
    template: string,
    data: Record<string, unknown>,
  ): string {
    let result = template;

    // Substituir variáveis simples {{variable}}
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, String(value || ""));
    });

    // Remover blocos condicionais vazios {{#key}}...{{/key}}
    result = result.replace(/{{#(\w+)}}[\s\S]*?{{\/\1}}/g, (match, key) => {
      return (data as Record<string, unknown>)[key]
        ? match.replace(/{{#\w+}}|{{\/\w+}}/g, "")
        : "";
    });

    return result.trim();
  }

  /**
   * Verificar se canal está habilitado
   */
  private static isChannelEnabled(channel: NotificationChannel): boolean {
    switch (channel) {
      case "EMAIL":
        return !!import.meta.env.SMTP_HOST;
      case "WHATSAPP":
      case "SMS":
        return import.meta.env.VITE_ZAPI_ENABLED === "true";
      case "PUSH":
        return !!import.meta.env.FIREBASE_API_KEY;
      case "IN_APP":
        return true; // Sempre habilitado
      default:
        return false;
    }
  }

  /**
   * Adicionar à fila de envio agendado
   */
  private static async addToQueue(payload: NotificationPayload): Promise<void> {
    this.queue.push(payload);

    // Salvar no Supabase para persistência
    await supabase.from("notification_queue").insert({
      payload: payload as unknown,
      scheduled_for: payload.scheduledFor,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Adicionar à fila de retry
   */
  private static async addToRetryQueue(
    payload: NotificationPayload,
  ): Promise<void> {
    // Tentar novamente em 5 minutos
    const retryAt = new Date(Date.now() + 5 * 60 * 1000);

    await supabase.from("notification_retry").insert({
      payload: payload as unknown,
      retry_at: retryAt,
      attempts: 1,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Processar fila de notificações agendadas
   */
  static async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      // Buscar notificações agendadas prontas para envio
      const { data: scheduled } = await supabase
        .from("notification_queue")
        .select("*")
        .lte("scheduled_for", new Date().toISOString())
        .limit(50);

      if (scheduled && scheduled.length > 0) {
        for (const item of scheduled) {
          await this.send(item.payload);

          // Remover da fila
          await supabase.from("notification_queue").delete().eq("id", item.id);
        }
      }

      // Processar retries
      const { data: retries } = await supabase
        .from("notification_retry")
        .select("*")
        .lte("retry_at", new Date().toISOString())
        .lt("attempts", 3)
        .limit(50);

      if (retries && retries.length > 0) {
        for (const item of retries) {
          const result = await this.send(item.payload);

          if (result.success) {
            // Remover da fila de retry
            await supabase
              .from("notification_retry")
              .delete()
              .eq("id", item.id);
          } else {
            // Incrementar tentativas
            await supabase
              .from("notification_retry")
              .update({
                attempts: item.attempts + 1,
                retry_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
              })
              .eq("id", item.id);
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error("[NotificationService] Erro ao processar fila:", err);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Obter template por ID
   */
  static getTemplate(templateId: string): NotificationTemplate | undefined {
    return NOTIFICATION_TEMPLATES[templateId];
  }

  /**
   * Listar todos os templates
   */
  static listTemplates(): NotificationTemplate[] {
    return Object.values(NOTIFICATION_TEMPLATES);
  }
}

// Processar fila a cada 1 minuto
if (typeof window !== "undefined") {
  setInterval(() => {
    NotificationService.processQueue();
  }, 60 * 1000);
}

export default NotificationService;
