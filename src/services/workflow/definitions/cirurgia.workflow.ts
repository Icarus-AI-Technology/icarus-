/**
 * 🏥 WORKFLOW: GESTÃO DE CIRURGIAS
 *
 * Workflow completo para gerenciamento do ciclo de vida de cirurgias
 * Desde o agendamento até a conclusão, com rastreabilidade total
 */

import type { WorkflowDefinition } from '@/types/workflow';

export const CIRURGIA_WORKFLOW: WorkflowDefinition = {
  id: 'cirurgia',
  name: 'Gestão de Cirurgias',
  description: 'Workflow completo para gerenciamento de cirurgias desde agendamento até conclusão',
  module: 'cirurgias',

  states: [
    {
      id: 'agendada',
      label: 'Agendada',
      description: 'Cirurgia agendada, aguardando confirmação',
      color: 'var(--orx-info)',
      icon: 'Calendar',
      allowedTransitions: ['confirmada', 'cancelada', 'adiada'],
      actions: [
        {
          id: 'confirmar',
          label: 'Confirmar Cirurgia',
          icon: 'Check',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'cancelar',
          label: 'Cancelar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
        },
        {
          id: 'adiar',
          label: 'Adiar',
          icon: 'Clock',
          color: 'var(--orx-warning)',
          requiresComment: true,
        },
      ],
      isInitial: true,
    },
    {
      id: 'confirmada',
      label: 'Confirmada',
      description: 'Cirurgia confirmada pelo hospital/médico',
      color: 'var(--orx-success-light)',
      icon: 'CheckCircle',
      allowedTransitions: ['em_preparacao', 'cancelada', 'adiada'],
      actions: [
        {
          id: 'iniciar_preparacao',
          label: 'Iniciar Preparação',
          icon: 'ArrowRight',
          color: 'var(--orx-primary)',
        },
        {
          id: 'cancelar',
          label: 'Cancelar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
        },
      ],
    },
    {
      id: 'em_preparacao',
      label: 'Em Preparação',
      description: 'OPME sendo separados, equipe confirmada',
      color: 'var(--orx-warning)',
      icon: 'Package',
      allowedTransitions: ['em_andamento', 'cancelada'],
      actions: [
        {
          id: 'iniciar_cirurgia',
          label: 'Iniciar Cirurgia',
          icon: 'Play',
          color: 'var(--orx-primary)',
          requiresConfirmation: true,
        },
        {
          id: 'cancelar',
          label: 'Cancelar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresConfirmation: true,
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 1, // Alerta se ficar mais de 1 dia em preparação
    },
    {
      id: 'em_andamento',
      label: 'Em Andamento',
      description: 'Cirurgia em andamento',
      color: 'var(--orx-primary)',
      icon: 'Activity',
      allowedTransitions: ['concluida'],
      actions: [
        {
          id: 'concluir',
          label: 'Concluir Cirurgia',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
      ],
    },
    {
      id: 'concluida',
      label: 'Concluída',
      description: 'Cirurgia concluída com sucesso',
      color: 'var(--orx-success)',
      icon: 'CheckCircle',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'cancelada',
      label: 'Cancelada',
      description: 'Cirurgia cancelada',
      color: 'var(--orx-error)',
      icon: 'XCircle',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'adiada',
      label: 'Adiada',
      description: 'Cirurgia adiada para nova data',
      color: 'var(--orx-warning-dark)',
      icon: 'Clock',
      allowedTransitions: ['agendada'], // Pode ser reagendada
      actions: [
        {
          id: 'reagendar',
          label: 'Reagendar',
          icon: 'Calendar',
          color: 'var(--orx-info)',
        },
      ],
    },
  ],

  notifications: [
    {
      id: 'notif-cirurgia-confirmada',
      trigger: 'state_enter',
      stateId: 'confirmada',
      recipients: ['assignee', 'creator'],
      template: 'Cirurgia confirmada para {data_hora}. Hospital: {hospital_nome}',
      channels: ['email', 'whatsapp', 'in_app'],
    },
    {
      id: 'notif-cirurgia-em-preparacao',
      trigger: 'state_enter',
      stateId: 'em_preparacao',
      recipients: ['assignee'],
      recipientRoles: ['almoxarife', 'enfermeiro'],
      template: 'Cirurgia {procedimento} entrando em preparação. Verificar OPME.',
      channels: ['whatsapp', 'in_app'],
    },
    {
      id: 'notif-cirurgia-iniciada',
      trigger: 'state_enter',
      stateId: 'em_andamento',
      recipients: ['assignee', 'creator'],
      recipientRoles: ['medico', 'enfermeiro', 'gestor'],
      template: 'Cirurgia {procedimento} iniciada. Paciente: {paciente_nome}',
      channels: ['in_app'],
    },
    {
      id: 'notif-cirurgia-concluida',
      trigger: 'state_enter',
      stateId: 'concluida',
      recipients: ['assignee', 'creator'],
      recipientRoles: ['faturamento', 'gestor'],
      template: 'Cirurgia {procedimento} concluída. Iniciar faturamento.',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-cirurgia-cancelada',
      trigger: 'state_enter',
      stateId: 'cancelada',
      recipients: ['assignee', 'creator'],
      recipientRoles: ['medico', 'hospital', 'gestor'],
      template: 'Cirurgia {procedimento} CANCELADA. Motivo: {motivo_cancelamento}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
  ],

  validations: [
    {
      stateId: 'em_preparacao',
      type: 'required_fields',
      message: 'É necessário confirmar a equipe médica antes de iniciar a preparação',
      validator: async (instance) => {
        return !!instance.metadata?.equipeMedicaId;
      },
    },
    {
      stateId: 'em_andamento',
      type: 'required_fields',
      message: 'Todos os OPME devem estar separados e esterilizados',
      validator: async (instance) => {
        const opmeIds = instance.metadata?.opmeIds || [];
        return opmeIds.length > 0;
      },
    },
  ],
};
