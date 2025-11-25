/**
 * 📄 WORKFLOW: CONTRATOS
 *
 * Workflow para gerenciamento completo de contratos
 * Desde a criação até a assinatura e vigência
 */

import type { WorkflowDefinition } from '@/types/workflow';

export const CONTRATO_WORKFLOW: WorkflowDefinition = {
  id: 'contrato',
  name: 'Gestão de Contratos',
  description: 'Workflow para gerenciamento de contratos com fornecedores, clientes e parceiros',
  module: 'contratos',

  states: [
    {
      id: 'rascunho',
      label: 'Rascunho',
      description: 'Contrato sendo elaborado',
      color: 'var(--orx-gray-400)',
      icon: 'FileText',
      allowedTransitions: ['em_revisao_juridica'],
      actions: [
        {
          id: 'enviar_revisao',
          label: 'Enviar para Revisão Jurídica',
          icon: 'Send',
          color: 'var(--orx-primary)',
          requiresConfirmation: true,
        },
      ],
      isInitial: true,
    },
    {
      id: 'em_revisao_juridica',
      label: 'Em Revisão Jurídica',
      description: 'Contrato em análise jurídica',
      color: 'var(--orx-info)',
      icon: 'FileSearch',
      allowedTransitions: ['aguardando_ajustes', 'aguardando_aprovacao', 'rejeitado'],
      actions: [
        {
          id: 'solicitar_ajustes',
          label: 'Solicitar Ajustes',
          icon: 'AlertCircle',
          color: 'var(--orx-warning)',
          requiresComment: true,
          allowedRoles: ['juridico'],
        },
        {
          id: 'aprovar_juridico',
          label: 'Aprovar (Jurídico)',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
          allowedRoles: ['juridico', 'advogado'],
        },
        {
          id: 'rejeitar',
          label: 'Rejeitar Contrato',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
          allowedRoles: ['juridico', 'advogado'],
        },
      ],
      autoProgressAfterDays: 7,
    },
    {
      id: 'aguardando_ajustes',
      label: 'Aguardando Ajustes',
      description: 'Aguardando correções solicitadas pelo jurídico',
      color: 'var(--orx-warning)',
      icon: 'Edit',
      allowedTransitions: ['em_revisao_juridica'],
      actions: [
        {
          id: 'reenviar_revisao',
          label: 'Reenviar para Revisão',
          icon: 'Send',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'aguardando_aprovacao',
      label: 'Aguardando Aprovação',
      description: 'Aguardando aprovação final da diretoria',
      color: 'var(--orx-warning-dark)',
      icon: 'Clock',
      allowedTransitions: ['aprovado', 'aguardando_ajustes', 'rejeitado'],
      actions: [
        {
          id: 'aprovar',
          label: 'Aprovar Contrato',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
          allowedRoles: ['diretor', 'presidente'],
        },
        {
          id: 'solicitar_ajustes',
          label: 'Solicitar Ajustes',
          icon: 'AlertCircle',
          color: 'var(--orx-warning)',
          requiresComment: true,
        },
        {
          id: 'rejeitar',
          label: 'Rejeitar',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
          allowedRoles: ['diretor', 'presidente'],
        },
      ],
      autoProgressAfterDays: 5,
    },
    {
      id: 'aprovado',
      label: 'Aprovado',
      description: 'Contrato aprovado, pronto para assinatura',
      color: 'var(--orx-success-light)',
      icon: 'CheckCircle',
      allowedTransitions: ['aguardando_assinatura'],
      actions: [
        {
          id: 'enviar_assinatura',
          label: 'Enviar para Assinatura',
          icon: 'Send',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'aguardando_assinatura',
      label: 'Aguardando Assinatura',
      description: 'Aguardando assinatura das partes',
      color: 'var(--orx-info)',
      icon: 'FileSignature',
      allowedTransitions: ['assinado'],
      actions: [
        {
          id: 'confirmar_assinatura',
          label: 'Confirmar Assinatura',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
      ],
      autoProgressAfterDays: 15,
    },
    {
      id: 'assinado',
      label: 'Assinado',
      description: 'Contrato assinado por todas as partes',
      color: 'var(--orx-success)',
      icon: 'CheckCircle',
      allowedTransitions: ['vigente'],
      actions: [
        {
          id: 'iniciar_vigencia',
          label: 'Iniciar Vigência',
          icon: 'Play',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'vigente',
      label: 'Vigente',
      description: 'Contrato em vigência',
      color: 'var(--orx-primary)',
      icon: 'FileCheck',
      allowedTransitions: ['em_renovacao', 'vencido', 'rescindido'],
      actions: [
        {
          id: 'iniciar_renovacao',
          label: 'Iniciar Renovação',
          icon: 'RefreshCcw',
          color: 'var(--orx-info)',
        },
        {
          id: 'rescindir',
          label: 'Rescindir Contrato',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
          allowedRoles: ['diretor', 'juridico'],
        },
      ],
    },
    {
      id: 'em_renovacao',
      label: 'Em Renovação',
      description: 'Processo de renovação em andamento',
      color: 'var(--orx-warning)',
      icon: 'RefreshCcw',
      allowedTransitions: ['vigente', 'vencido'],
      actions: [
        {
          id: 'confirmar_renovacao',
          label: 'Confirmar Renovação',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'nao_renovar',
          label: 'Não Renovar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'vencido',
      label: 'Vencido',
      description: 'Contrato vencido (não renovado)',
      color: 'var(--orx-error)',
      icon: 'Clock',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'rescindido',
      label: 'Rescindido',
      description: 'Contrato rescindido antes do término',
      color: 'var(--orx-error-dark)',
      icon: 'XCircle',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'rejeitado',
      label: 'Rejeitado',
      description: 'Contrato rejeitado na aprovação',
      color: 'var(--orx-error)',
      icon: 'Ban',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
  ],

  notifications: [
    {
      id: 'notif-contrato-revisao-juridica',
      trigger: 'state_enter',
      stateId: 'em_revisao_juridica',
      recipients: ['assignee'],
      recipientRoles: ['juridico', 'advogado'],
      template:
        'Novo contrato para revisão jurídica: {tipo} com {parte_nome}. Valor: R$ {valor_total}',
      channels: ['email', 'whatsapp', 'in_app'],
    },
    {
      id: 'notif-contrato-aguardando-aprovacao',
      trigger: 'state_enter',
      stateId: 'aguardando_aprovacao',
      recipients: ['assignee'],
      recipientRoles: ['diretor', 'presidente'],
      template: 'Contrato aguardando aprovação: {tipo} com {parte_nome}. Valor: R$ {valor_total}',
      channels: ['email', 'push', 'in_app'],
    },
    {
      id: 'notif-contrato-aprovado',
      trigger: 'state_enter',
      stateId: 'aprovado',
      recipients: ['creator'],
      recipientRoles: ['compras', 'comercial'],
      template: 'Contrato APROVADO! Próximo passo: assinatura. Parte: {parte_nome}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-contrato-assinado',
      trigger: 'state_enter',
      stateId: 'assinado',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['juridico', 'gestor'],
      template: 'Contrato ASSINADO! Parte: {parte_nome}. Início: {data_inicio}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-contrato-vigente',
      trigger: 'state_enter',
      stateId: 'vigente',
      recipients: ['creator'],
      recipientRoles: ['compras', 'comercial', 'financeiro'],
      template: 'Contrato entrou em VIGÊNCIA! Término: {data_termino}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-contrato-renovacao-30-dias',
      trigger: 'overdue',
      stateId: 'vigente',
      recipients: ['creator'],
      recipientRoles: ['juridico', 'gestor'],
      template: 'ALERTA: Contrato vence em 30 dias! Iniciar processo de renovação.',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-contrato-rescindido',
      trigger: 'state_enter',
      stateId: 'rescindido',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['juridico', 'diretor', 'financeiro'],
      template: 'Contrato RESCINDIDO! Motivo: {motivo_rescisao}. Parte: {parte_nome}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
  ],

  validations: [
    {
      stateId: 'em_revisao_juridica',
      type: 'required_fields',
      message: 'É necessário anexar o documento do contrato',
      validator: async (instance) => {
        const anexos = instance.metadata?.anexos || [];
        return anexos.length > 0;
      },
    },
    {
      stateId: 'aguardando_aprovacao',
      type: 'approval',
      message: 'Contratos acima de R$ 100.000 requerem aprovação da presidência',
      validator: async (instance) => {
        const valorTotal = instance.metadata?.valorTotal || 0;
        const aprovadores = instance.metadata?.aprovadores || [];

        if (valorTotal > 100000) {
          return (aprovadores as Array<{ cargo?: string }>).some((a) => a.cargo === 'presidente');
        }
        return true;
      },
    },
    {
      stateId: 'assinado',
      type: 'required_fields',
      message: 'Todas as partes devem assinar o contrato',
      validator: async (instance) => {
        const assinaturas =
          (instance.metadata?.assinaturas as Array<{ assinadoEm?: string }> | undefined) || [];
        return assinaturas.every((a) => !!a.assinadoEm);
      },
    },
  ],
};
