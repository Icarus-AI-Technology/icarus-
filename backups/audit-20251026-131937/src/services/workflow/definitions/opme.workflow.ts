/**
 * 📦 WORKFLOW: OPME (Rastreabilidade & Faturamento)
 *
 * Workflows para:
 * 1. Rastreabilidade de OPME
 * 2. Faturamento de OPME
 */

import type { WorkflowDefinition } from "@/types/workflow";

// ============================================
// WORKFLOW: RASTREABILIDADE OPME
// ============================================

export const OPME_RASTREABILIDADE_WORKFLOW: WorkflowDefinition = {
  id: "opme_rastreabilidade",
  name: "Rastreabilidade de OPME",
  description: "Workflow para rastreamento completo de materiais OPME",
  module: "opme",

  states: [
    {
      id: "em_estoque",
      label: "Em Estoque",
      description: "Material em estoque disponível",
      color: "var(--orx-success)",
      icon: "Package",
      allowedTransitions: ["reservado"],
      actions: [
        {
          id: "reservar",
          label: "Reservar para Cirurgia",
          icon: "Calendar",
          color: "var(--orx-info)",
        },
      ],
      isInitial: true,
    },
    {
      id: "reservado",
      label: "Reservado",
      description: "Reservado para uma cirurgia específica",
      color: "var(--orx-warning)",
      icon: "Lock",
      allowedTransitions: ["em_separacao", "em_estoque"],
      actions: [
        {
          id: "separar",
          label: "Iniciar Separação",
          icon: "PackageSearch",
          color: "var(--orx-primary)",
        },
        {
          id: "cancelar_reserva",
          label: "Cancelar Reserva",
          icon: "XCircle",
          color: "var(--orx-error)",
        },
      ],
    },
    {
      id: "em_separacao",
      label: "Em Separação",
      description: "Sendo separado para a cirurgia",
      color: "var(--orx-info)",
      icon: "PackageCheck",
      allowedTransitions: ["aguardando_esterilizacao", "pronto_uso"],
      actions: [
        {
          id: "enviar_esterilizacao",
          label: "Enviar para Esterilização",
          icon: "Droplets",
          color: "var(--orx-primary)",
        },
        {
          id: "marcar_pronto",
          label: "Marcar como Pronto",
          icon: "CheckCircle",
          color: "var(--orx-success)",
        },
      ],
    },
    {
      id: "aguardando_esterilizacao",
      label: "Aguardando Esterilização",
      description: "Aguardando processo de esterilização",
      color: "var(--orx-warning-dark)",
      icon: "Clock",
      allowedTransitions: ["pronto_uso"],
      actions: [
        {
          id: "confirmar_esterilizacao",
          label: "Confirmar Esterilização",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          allowedRoles: ["enfermeiro", "tecnico_esterilizacao"],
        },
      ],
      autoProgressAfterDays: 1,
    },
    {
      id: "pronto_uso",
      label: "Pronto para Uso",
      description: "Material pronto para uso na cirurgia",
      color: "var(--orx-success-light)",
      icon: "PackageCheck",
      allowedTransitions: ["em_uso"],
      actions: [
        {
          id: "utilizar",
          label: "Utilizar na Cirurgia",
          icon: "Activity",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "em_uso",
      label: "Em Uso",
      description: "Sendo utilizado na cirurgia",
      color: "var(--orx-primary)",
      icon: "Activity",
      allowedTransitions: ["utilizado", "devolvido"],
      actions: [
        {
          id: "confirmar_uso",
          label: "Confirmar Uso",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          requiresConfirmation: true,
        },
        {
          id: "devolver",
          label: "Devolver ao Estoque",
          icon: "RotateCcw",
          color: "var(--orx-warning)",
          requiresComment: true,
        },
      ],
    },
    {
      id: "utilizado",
      label: "Utilizado",
      description: "Material utilizado e rastreado",
      color: "var(--orx-success)",
      icon: "CheckCircle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: "devolvido",
      label: "Devolvido",
      description: "Devolvido ao estoque (não utilizado)",
      color: "var(--orx-info)",
      icon: "RotateCcw",
      allowedTransitions: ["em_estoque"],
      actions: [
        {
          id: "retornar_estoque",
          label: "Retornar ao Estoque",
          icon: "Package",
          color: "var(--orx-success)",
        },
      ],
    },
    {
      id: "descartado",
      label: "Descartado",
      description: "Material descartado (vencido/danificado)",
      color: "var(--orx-error)",
      icon: "Trash2",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: "extraviado",
      label: "Extraviado",
      description: "Material extraviado",
      color: "var(--orx-error-dark)",
      icon: "AlertTriangle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
  ],

  notifications: [
    {
      id: "notif-opme-reservado",
      trigger: "state_enter",
      stateId: "reservado",
      recipients: ["assignee"],
      recipientRoles: ["almoxarife"],
      template:
        "OPME reservado: {produto_nome} (Lote: {lote}) para cirurgia {cirurgia_id}",
      channels: ["in_app"],
    },
    {
      id: "notif-opme-pronto",
      trigger: "state_enter",
      stateId: "pronto_uso",
      recipients: ["assignee"],
      recipientRoles: ["enfermeiro", "instrumentador"],
      template: "OPME pronto para uso: {produto_nome} (Lote: {lote})",
      channels: ["whatsapp", "in_app"],
    },
    {
      id: "notif-opme-utilizado",
      trigger: "state_enter",
      stateId: "utilizado",
      recipients: ["assignee"],
      recipientRoles: ["faturamento", "gestor"],
      template:
        "OPME utilizado: {produto_nome} (S/N: {numero_serie}). Iniciar faturamento.",
      channels: ["email", "in_app"],
    },
    {
      id: "notif-opme-extraviado",
      trigger: "state_enter",
      stateId: "extraviado",
      recipients: ["assignee", "creator"],
      recipientRoles: ["gestor", "almoxarife", "compliance"],
      template: "ALERTA: OPME EXTRAVIADO! {produto_nome} (S/N: {numero_serie})",
      channels: ["email", "whatsapp", "push", "in_app"],
    },
  ],

  validations: [
    {
      stateId: "utilizado",
      type: "required_fields",
      message: "É necessário informar o paciente que utilizou o OPME",
      validator: async (instance) => {
        return (
          !!instance.metadata?.pacienteId && !!instance.metadata?.cirurgiaId
        );
      },
    },
  ],
};

// ============================================
// WORKFLOW: FATURAMENTO OPME
// ============================================

export const FATURAMENTO_OPME_WORKFLOW: WorkflowDefinition = {
  id: "faturamento_opme",
  name: "Faturamento de OPME",
  description: "Workflow para faturamento de materiais OPME junto a convênios",
  module: "opme",

  states: [
    {
      id: "pendente_digitacao",
      label: "Pendente Digitação",
      description: "Aguardando digitação da guia",
      color: "var(--orx-gray-400)",
      icon: "FileText",
      allowedTransitions: ["em_digitacao"],
      actions: [
        {
          id: "iniciar_digitacao",
          label: "Iniciar Digitação",
          icon: "Edit",
          color: "var(--orx-primary)",
        },
      ],
      isInitial: true,
    },
    {
      id: "em_digitacao",
      label: "Em Digitação",
      description: "Guia sendo digitada",
      color: "var(--orx-info)",
      icon: "Edit",
      allowedTransitions: ["aguardando_conferencia"],
      actions: [
        {
          id: "enviar_conferencia",
          label: "Enviar para Conferência",
          icon: "Send",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "aguardando_conferencia",
      label: "Aguardando Conferência",
      description: "Aguardando conferência da guia",
      color: "var(--orx-warning)",
      icon: "Clock",
      allowedTransitions: ["conferido", "em_digitacao"], // Pode voltar para correção
      actions: [
        {
          id: "conferir",
          label: "Conferir Guia",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          allowedRoles: ["conferente", "gestor_faturamento"],
        },
        {
          id: "retornar_digitacao",
          label: "Retornar para Digitação",
          icon: "ArrowLeft",
          color: "var(--orx-warning)",
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 2,
    },
    {
      id: "conferido",
      label: "Conferido",
      description: "Guia conferida e aprovada",
      color: "var(--orx-success-light)",
      icon: "CheckCircle",
      allowedTransitions: ["aguardando_envio"],
      actions: [
        {
          id: "agendar_envio",
          label: "Agendar Envio",
          icon: "Calendar",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "aguardando_envio",
      label: "Aguardando Envio",
      description: "Aguardando envio ao convênio",
      color: "var(--orx-warning-dark)",
      icon: "Clock",
      allowedTransitions: ["enviado"],
      actions: [
        {
          id: "enviar_convenio",
          label: "Enviar ao Convênio",
          icon: "Send",
          color: "var(--orx-primary)",
          requiresConfirmation: true,
        },
      ],
    },
    {
      id: "enviado",
      label: "Enviado",
      description: "Enviado ao convênio",
      color: "var(--orx-info)",
      icon: "Send",
      allowedTransitions: ["aguardando_autorizacao"],
      actions: [
        {
          id: "confirmar_protocolo",
          label: "Confirmar Protocolo",
          icon: "FileCheck",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "aguardando_autorizacao",
      label: "Aguardando Autorização",
      description: "Aguardando retorno do convênio",
      color: "var(--orx-warning)",
      icon: "Clock",
      allowedTransitions: ["autorizado", "glosado"],
      actions: [
        {
          id: "confirmar_autorizacao",
          label: "Confirmar Autorização",
          icon: "CheckCircle",
          color: "var(--orx-success)",
        },
        {
          id: "registrar_glosa",
          label: "Registrar Glosa",
          icon: "XCircle",
          color: "var(--orx-error)",
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 30, // Alerta após 30 dias sem retorno
    },
    {
      id: "autorizado",
      label: "Autorizado",
      description: "Faturamento autorizado pelo convênio",
      color: "var(--orx-success-light)",
      icon: "CheckCircle",
      allowedTransitions: ["pago"],
      actions: [
        {
          id: "confirmar_pagamento",
          label: "Confirmar Pagamento",
          icon: "DollarSign",
          color: "var(--orx-success)",
        },
      ],
    },
    {
      id: "glosado",
      label: "Glosado",
      description: "Faturamento glosado (negado)",
      color: "var(--orx-error)",
      icon: "XCircle",
      allowedTransitions: ["em_recurso", "aguardando_conferencia"], // Pode contestar ou corrigir
      actions: [
        {
          id: "criar_recurso",
          label: "Criar Recurso",
          icon: "AlertTriangle",
          color: "var(--orx-warning)",
          requiresComment: true,
        },
        {
          id: "corrigir_reenviar",
          label: "Corrigir e Reenviar",
          icon: "RefreshCcw",
          color: "var(--orx-info)",
        },
      ],
    },
    {
      id: "em_recurso",
      label: "Em Recurso",
      description: "Recurso de glosa em análise",
      color: "var(--orx-warning-dark)",
      icon: "AlertTriangle",
      allowedTransitions: ["autorizado", "glosado"], // Pode ser aceito ou negado novamente
      actions: [
        {
          id: "registrar_resultado_recurso",
          label: "Registrar Resultado",
          icon: "FileCheck",
          color: "var(--orx-primary)",
          requiresComment: true,
        },
      ],
    },
    {
      id: "pago",
      label: "Pago",
      description: "Faturamento pago pelo convênio",
      color: "var(--orx-success)",
      icon: "DollarSign",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
  ],

  notifications: [
    {
      id: "notif-faturamento-conferido",
      trigger: "state_enter",
      stateId: "conferido",
      recipients: ["creator"],
      recipientRoles: ["faturamento"],
      template: "Guia conferida: {numero_guia}. Valor total: R$ {valor_total}",
      channels: ["email", "in_app"],
    },
    {
      id: "notif-faturamento-enviado",
      trigger: "state_enter",
      stateId: "enviado",
      recipients: ["creator"],
      recipientRoles: ["gestor_faturamento"],
      template:
        "Guia enviada ao convênio: {convenio_nome}. Protocolo: {numero_autorizacao}",
      channels: ["email", "in_app"],
    },
    {
      id: "notif-faturamento-autorizado",
      trigger: "state_enter",
      stateId: "autorizado",
      recipients: ["creator"],
      recipientRoles: ["faturamento", "financeiro"],
      template:
        "Faturamento AUTORIZADO! Valor: R$ {valor_total}. Convênio: {convenio_nome}",
      channels: ["email", "whatsapp", "in_app"],
    },
    {
      id: "notif-faturamento-glosado",
      trigger: "state_enter",
      stateId: "glosado",
      recipients: ["creator", "assignee"],
      recipientRoles: ["faturamento", "gestor_faturamento", "medico"],
      template:
        "ALERTA: Glosa de R$ {valor_glosado}! Motivo: {motivo_glosa}. Guia: {numero_guia}",
      channels: ["email", "whatsapp", "push", "in_app"],
    },
    {
      id: "notif-faturamento-pago",
      trigger: "state_enter",
      stateId: "pago",
      recipients: ["creator"],
      recipientRoles: ["financeiro", "gestor"],
      template:
        "Faturamento PAGO! Valor: R$ {valor_total}. Convênio: {convenio_nome}",
      channels: ["email", "in_app"],
    },
  ],

  validations: [
    {
      stateId: "aguardando_conferencia",
      type: "required_fields",
      message: "É necessário informar todos os OPME utilizados",
      validator: async (instance) => {
        const opmeUtilizados = instance.metadata?.opmeUtilizados || [];
        return opmeUtilizados.length > 0;
      },
    },
    {
      stateId: "enviado",
      type: "required_fields",
      message: "É necessário informar o número da guia e do convênio",
      validator: async (instance) => {
        return (
          !!instance.metadata?.numeroGuia && !!instance.metadata?.convenioId
        );
      },
    },
  ],
};
