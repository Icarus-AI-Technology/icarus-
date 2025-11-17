/**
 * 🛒 WORKFLOW: COMPRAS & FORNECEDORES
 *
 * Workflows para:
 * 1. Gestão de Cotações
 * 2. Pedidos de Compra
 */

import type { WorkflowDefinition } from "@/types/workflow";

// ============================================
// WORKFLOW: COTAÇÕES
// ============================================

export const COTACAO_WORKFLOW: WorkflowDefinition = {
  id: "cotacao",
  name: "Gestão de Cotações",
  description: "Workflow para gerenciamento de cotações de fornecedores",
  module: "compras",

  states: [
    {
      id: "rascunho",
      label: "Rascunho",
      description: "Cotação sendo criada",
      color: "var(--orx-gray-400)",
      icon: "Edit",
      allowedTransitions: ["aguardando_respostas", "cancelada"],
      actions: [
        {
          id: "enviar",
          label: "Enviar para Fornecedores",
          icon: "Send",
          color: "var(--orx-primary)",
          requiresConfirmation: true,
        },
        {
          id: "cancelar",
          label: "Cancelar",
          icon: "X",
          color: "var(--orx-error)",
        },
      ],
      isInitial: true,
    },
    {
      id: "aguardando_respostas",
      label: "Aguardando Respostas",
      description: "Enviada para fornecedores",
      color: "var(--orx-warning)",
      icon: "Clock",
      allowedTransitions: ["em_analise", "cancelada"],
      actions: [
        {
          id: "analisar",
          label: "Iniciar Análise",
          icon: "Search",
          color: "var(--orx-primary)",
        },
        {
          id: "cancelar",
          label: "Cancelar",
          icon: "X",
          color: "var(--orx-error)",
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 7, // Alerta se passar de 7 dias sem resposta
    },
    {
      id: "em_analise",
      label: "Em Análise",
      description: "Analisando propostas recebidas",
      color: "var(--orx-info)",
      icon: "FileSearch",
      allowedTransitions: ["aprovada", "cancelada"],
      actions: [
        {
          id: "aprovar",
          label: "Aprovar Cotação",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          requiresConfirmation: true,
          allowedRoles: ["gestor_compras", "diretor"],
        },
        {
          id: "cancelar",
          label: "Cancelar",
          icon: "X",
          color: "var(--orx-error)",
          requiresComment: true,
        },
      ],
    },
    {
      id: "aprovada",
      label: "Aprovada",
      description: "Cotação aprovada",
      color: "var(--orx-success-light)",
      icon: "CheckCircle",
      allowedTransitions: ["convertida_pedido"],
      actions: [
        {
          id: "converter_pedido",
          label: "Converter em Pedido",
          icon: "ShoppingCart",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "convertida_pedido",
      label: "Convertida em Pedido",
      description: "Cotação convertida em pedido de compra",
      color: "var(--orx-success)",
      icon: "CheckCircle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: "cancelada",
      label: "Cancelada",
      description: "Cotação cancelada",
      color: "var(--orx-error)",
      icon: "XCircle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
  ],

  notifications: [
    {
      id: "notif-cotacao-enviada",
      trigger: "state_enter",
      stateId: "aguardando_respostas",
      recipients: ["creator"],
      recipientRoles: ["comprador"],
      template: "Cotação enviada para {numero_fornecedores} fornecedores",
      channels: ["email", "in_app"],
    },
    {
      id: "notif-cotacao-aprovada",
      trigger: "state_enter",
      stateId: "aprovada",
      recipients: ["creator"],
      template: "Cotação aprovada! Valor: R$ {valor_total}",
      channels: ["email", "in_app"],
    },
  ],

  validations: [
    {
      stateId: "aguardando_respostas",
      type: "required_fields",
      message: "É necessário selecionar pelo menos 3 fornecedores",
      validator: async (instance) => {
        const fornecedores = instance.metadata?.fornecedorIds || [];
        return fornecedores.length >= 3;
      },
    },
    {
      stateId: "aprovada",
      type: "custom_rule",
      message: "É necessário ter pelo menos 2 propostas para aprovar",
      validator: async (instance) => {
        const propostas = instance.metadata?.propostas || [];
        return propostas.length >= 2;
      },
    },
  ],
};

// ============================================
// WORKFLOW: PEDIDOS DE COMPRA
// ============================================

export const PEDIDO_COMPRA_WORKFLOW: WorkflowDefinition = {
  id: "pedido_compra",
  name: "Pedidos de Compra",
  description: "Workflow para gerenciamento de pedidos de compra",
  module: "compras",

  states: [
    {
      id: "rascunho",
      label: "Rascunho",
      description: "Pedido sendo criado",
      color: "var(--orx-gray-400)",
      icon: "Edit",
      allowedTransitions: ["aguardando_aprovacao", "cancelado"],
      actions: [
        {
          id: "solicitar_aprovacao",
          label: "Solicitar Aprovação",
          icon: "Send",
          color: "var(--orx-primary)",
          requiresConfirmation: true,
        },
        {
          id: "cancelar",
          label: "Cancelar",
          icon: "X",
          color: "var(--orx-error)",
        },
      ],
      isInitial: true,
    },
    {
      id: "aguardando_aprovacao",
      label: "Aguardando Aprovação",
      description: "Aguardando aprovação do gestor",
      color: "var(--orx-warning)",
      icon: "Clock",
      allowedTransitions: ["aprovado", "rejeitado"],
      actions: [
        {
          id: "aprovar",
          label: "Aprovar Pedido",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          requiresConfirmation: true,
          allowedRoles: ["gestor_compras", "diretor_financeiro"],
        },
        {
          id: "rejeitar",
          label: "Rejeitar",
          icon: "XCircle",
          color: "var(--orx-error)",
          requiresConfirmation: true,
          requiresComment: true,
          allowedRoles: ["gestor_compras", "diretor_financeiro"],
        },
      ],
      autoProgressAfterDays: 3, // Alerta se passar de 3 dias sem aprovação
    },
    {
      id: "aprovado",
      label: "Aprovado",
      description: "Pedido aprovado, pronto para envio",
      color: "var(--orx-success-light)",
      icon: "CheckCircle",
      allowedTransitions: ["enviado_fornecedor"],
      actions: [
        {
          id: "enviar_fornecedor",
          label: "Enviar ao Fornecedor",
          icon: "Send",
          color: "var(--orx-primary)",
        },
      ],
    },
    {
      id: "enviado_fornecedor",
      label: "Enviado ao Fornecedor",
      description: "Pedido enviado, aguardando confirmação",
      color: "var(--orx-info)",
      icon: "Truck",
      allowedTransitions: ["em_transito", "cancelado"],
      actions: [
        {
          id: "confirmar_envio",
          label: "Confirmar Envio",
          icon: "Package",
          color: "var(--orx-primary)",
        },
        {
          id: "cancelar",
          label: "Cancelar",
          icon: "X",
          color: "var(--orx-error)",
          requiresConfirmation: true,
          requiresComment: true,
        },
      ],
    },
    {
      id: "em_transito",
      label: "Em Trânsito",
      description: "Mercadoria em transporte",
      color: "var(--orx-primary)",
      icon: "Navigation",
      allowedTransitions: ["recebido_parcial", "recebido_total"],
      actions: [
        {
          id: "receber_parcial",
          label: "Receber Parcial",
          icon: "PackageCheck",
          color: "var(--orx-warning)",
        },
        {
          id: "receber_total",
          label: "Receber Total",
          icon: "CheckCircle",
          color: "var(--orx-success)",
          requiresConfirmation: true,
        },
      ],
    },
    {
      id: "recebido_parcial",
      label: "Recebido Parcial",
      description: "Parte da mercadoria recebida",
      color: "var(--orx-warning-dark)",
      icon: "Package",
      allowedTransitions: ["recebido_total"],
      actions: [
        {
          id: "receber_restante",
          label: "Receber Restante",
          icon: "CheckCircle",
          color: "var(--orx-success)",
        },
      ],
    },
    {
      id: "recebido_total",
      label: "Recebido Total",
      description: "Pedido totalmente recebido e conferido",
      color: "var(--orx-success)",
      icon: "CheckCircle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: "cancelado",
      label: "Cancelado",
      description: "Pedido cancelado",
      color: "var(--orx-error)",
      icon: "XCircle",
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: "rejeitado",
      label: "Rejeitado",
      description: "Pedido rejeitado pela aprovação",
      color: "var(--orx-error-dark)",
      icon: "Ban",
      allowedTransitions: ["rascunho"], // Pode ser refeito
      actions: [
        {
          id: "refazer",
          label: "Refazer Pedido",
          icon: "RefreshCcw",
          color: "var(--orx-info)",
        },
      ],
    },
  ],

  notifications: [
    {
      id: "notif-pedido-aguardando-aprovacao",
      trigger: "state_enter",
      stateId: "aguardando_aprovacao",
      recipients: ["assignee"],
      recipientRoles: ["gestor_compras", "diretor_financeiro"],
      template:
        "Pedido de compra aguardando aprovação. Valor: R$ {valor_total}",
      channels: ["email", "whatsapp", "in_app"],
    },
    {
      id: "notif-pedido-aprovado",
      trigger: "state_enter",
      stateId: "aprovado",
      recipients: ["creator"],
      template:
        "Seu pedido de compra foi APROVADO! Fornecedor: {fornecedor_nome}",
      channels: ["email", "in_app"],
    },
    {
      id: "notif-pedido-rejeitado",
      trigger: "state_enter",
      stateId: "rejeitado",
      recipients: ["creator"],
      template: "Pedido de compra REJEITADO. Motivo: {motivo_rejeicao}",
      channels: ["email", "push", "in_app"],
    },
    {
      id: "notif-pedido-em-transito",
      trigger: "state_enter",
      stateId: "em_transito",
      recipients: ["creator"],
      recipientRoles: ["almoxarife", "recebimento"],
      template:
        "Pedido em trânsito. Previsão de entrega: {data_prevista_entrega}",
      channels: ["whatsapp", "in_app"],
    },
    {
      id: "notif-pedido-recebido",
      trigger: "state_enter",
      stateId: "recebido_total",
      recipients: ["creator"],
      recipientRoles: ["comprador", "financeiro"],
      template: "Pedido totalmente recebido! Iniciar processo de pagamento.",
      channels: ["email", "in_app"],
    },
  ],

  validations: [
    {
      stateId: "aguardando_aprovacao",
      type: "required_fields",
      message: "É necessário preencher todos os itens do pedido",
      validator: async (instance) => {
        const itens =
          (instance.metadata?.itens as
            | Array<{ quantidade: number; precoUnitario: number }>
            | undefined) || [];
        return (
          itens.length > 0 &&
          itens.every((i) => i.quantidade > 0 && i.precoUnitario > 0)
        );
      },
    },
    {
      stateId: "aprovado",
      type: "approval",
      message: "Pedidos acima de R$ 50.000 requerem aprovação de 2 níveis",
      validator: async (instance) => {
        const valorTotal = instance.metadata?.valorTotal || 0;
        const aprovadores = instance.metadata?.aprovadores || [];

        if (valorTotal > 50000) {
          return aprovadores.length >= 2;
        }
        return true;
      },
    },
  ],
};
