/**
 * Serviço de Notificações - ICARUS v5.0
 *
 * Responsável por enviar notificações via:
 * - Email (Resend API)
 * - SMS (Twilio)
 * - Push notifications (FCM)
 * - In-app notifications
 *
 * @version 5.0.0
 */

import { legacySupabase as supabase } from '@/lib/legacySupabase';

export interface NotificationPayload {
  tipo: 'email' | 'sms' | 'push' | 'in-app';
  destinatario: string; // email, telefone, ou user_id
  assunto?: string;
  mensagem: string;
  template?: string;
  dados?: Record<string, unknown>;
  prioridade?: 'baixa' | 'normal' | 'alta';
}

export interface NotificationResult {
  sucesso: boolean;
  mensagem_id?: string;
  erro?: string;
}

export class NotificacaoService {
  /**
   * Enviar notificação via Edge Function
   */
  async enviar(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          type: payload.tipo,
          to: payload.destinatario,
          subject: payload.assunto,
          message: payload.mensagem,
          template: payload.template,
          data: payload.dados,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Salvar log de notificação
      await this.salvarLog(payload, data);

      return {
        sucesso: true,
        mensagem_id: data?.result?.id,
      };
    } catch (error) {
      const err = error as Error;
      return {
        sucesso: false,
        erro: err.message,
      };
    }
  }

  /**
   * Enviar email simples
   */
  async enviarEmail(
    destinatario: string,
    assunto: string,
    mensagem: string
  ): Promise<NotificationResult> {
    return this.enviar({
      tipo: 'email',
      destinatario,
      assunto,
      mensagem,
    });
  }

  /**
   * Enviar SMS
   */
  async enviarSMS(telefone: string, mensagem: string): Promise<NotificationResult> {
    return this.enviar({
      tipo: 'sms',
      destinatario: telefone,
      mensagem,
    });
  }

  /**
   * Enviar notificação in-app
   */
  async enviarInApp(
    usuarioId: string,
    assunto: string,
    mensagem: string
  ): Promise<NotificationResult> {
    try {
      const { error } = await supabase.from('notificacoes').insert({
        usuario_id: usuarioId,
        assunto,
        mensagem,
        lida: false,
        criado_em: new Date().toISOString(),
      });

      if (error) throw error;

      return { sucesso: true };
    } catch (error) {
      const err = error as Error;
      return {
        sucesso: false,
        erro: err.message,
      };
    }
  }

  /**
   * Enviar notificação de estoque baixo (template pré-definido)
   */
  async notificarEstoqueBaixo(
    empresaId: string,
    produto: { nome: string; quantidade: number; ponto_reposicao: number }
  ): Promise<NotificationResult> {
    const mensagem = `⚠️ ALERTA DE ESTOQUE CRÍTICO

Produto: ${produto.nome}
Quantidade Atual: ${produto.quantidade}
Ponto de Reposição: ${produto.ponto_reposicao}

Ação necessária: Realizar pedido de compra urgente.`;

    // Buscar administradores da empresa
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('id, email')
      .eq('empresa_id', empresaId)
      .eq('role', 'admin');

    if (!usuarios || usuarios.length === 0) {
      return {
        sucesso: false,
        erro: 'Nenhum administrador encontrado',
      };
    }

    // Enviar para todos os admins
    const promises = usuarios.map((user) =>
      this.enviarEmail(user.email, 'Alerta de Estoque Crítico - ICARUS', mensagem)
    );

    await Promise.all(promises);

    return { sucesso: true };
  }

  /**
   * Enviar notificação de cirurgia cancelada
   */
  async notificarCirurgiaCancelada(
    cirurgiaId: string,
    motivo: string
  ): Promise<NotificationResult> {
    const { data: cirurgia } = await supabase
      .from('cirurgias')
      .select('*, medico:medicos(nome, email), paciente:pacientes(nome)')
      .eq('id', cirurgiaId)
      .single();

    if (!cirurgia) {
      return {
        sucesso: false,
        erro: 'Cirurgia não encontrada',
      };
    }

    const mensagem = `🚨 CIRURGIA CANCELADA

Paciente: ${cirurgia.paciente.nome}
Data: ${new Date(cirurgia.data).toLocaleDateString('pt-BR')}
Motivo: ${motivo}

Por favor, reagendar com o paciente.`;

    return this.enviarEmail(cirurgia.medico.email, 'Cirurgia Cancelada - ICARUS', mensagem);
  }

  /**
   * Salvar log de notificação enviada
   */
  private async salvarLog(payload: NotificationPayload, resultado: unknown): Promise<void> {
    try {
      await supabase.from('notificacoes_log').insert({
        tipo: payload.tipo,
        destinatario: payload.destinatario,
        assunto: payload.assunto,
        mensagem: payload.mensagem,
        status: 'enviado',
        resultado: resultado,
        criado_em: new Date().toISOString(),
      });
    } catch (error) {
      // Log silencioso - não bloqueia envio
      console.error('Erro ao salvar log de notificação:', error);
    }
  }

  /**
   * Buscar notificações não lidas de um usuário
   */
  async buscarNaoLidas(usuarioId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('lida', false)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Marcar notificação como lida
   */
  async marcarComoLida(notificacaoId: string): Promise<void> {
    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true, lida_em: new Date().toISOString() })
      .eq('id', notificacaoId);

    if (error) throw error;
  }
}

// Instância singleton
export const notificacaoService = new NotificacaoService();
