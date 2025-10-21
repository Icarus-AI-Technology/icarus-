/**
 * 🏛️ WORKFLOW: LICITAÇÕES
 * 
 * Workflow completo para gerenciamento de processos licitatórios
 * Desde a identificação da oportunidade até a assinatura do contrato
 * 
 * Modalidades suportadas:
 * - Pregão Eletrônico/Presencial
 * - Concorrência
 * - Tomada de Preços
 * - Convite
 * - Dispensa de Licitação
 * - Inexigibilidade
 */

import type { WorkflowDefinition } from '@/types/workflow';

export const LICITACAO_WORKFLOW: WorkflowDefinition = {
  id: 'licitacao',
  name: 'Gestão de Licitações',
  description: 'Workflow completo para participação em processos licitatórios públicos',
  module: 'licitacoes',
  
  states: [
    {
      id: 'identificada',
      label: 'Oportunidade Identificada',
      description: 'Edital identificado e cadastrado no sistema',
      color: 'var(--orx-info)',
      icon: 'Search',
      allowedTransitions: ['em_analise', 'descartada'],
      actions: [
        {
          id: 'iniciar_analise',
          label: 'Iniciar Análise',
          icon: 'FileSearch',
          color: 'var(--orx-primary)',
        },
        {
          id: 'descartar',
          label: 'Descartar Oportunidade',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      isInitial: true,
    },
    {
      id: 'em_analise',
      label: 'Em Análise',
      description: 'Analisando viabilidade e requisitos do edital',
      color: 'var(--orx-warning)',
      icon: 'FileSearch',
      allowedTransitions: ['analise_aprovada', 'descartada'],
      actions: [
        {
          id: 'aprovar_participacao',
          label: 'Aprovar Participação',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
          allowedRoles: ['gestor_licitacoes', 'comercial'],
        },
        {
          id: 'descartar',
          label: 'Descartar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 3, // Alerta se ficar mais de 3 dias sem decisão
    },
    {
      id: 'analise_aprovada',
      label: 'Análise Aprovada',
      description: 'Participação aprovada, iniciando preparação',
      color: 'var(--orx-success-light)',
      icon: 'CheckCircle',
      allowedTransitions: ['preparando_documentacao'],
      actions: [
        {
          id: 'iniciar_preparacao',
          label: 'Iniciar Preparação',
          icon: 'FileText',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'preparando_documentacao',
      label: 'Preparando Documentação',
      description: 'Reunindo e preparando toda documentação exigida',
      color: 'var(--orx-info)',
      icon: 'FolderOpen',
      allowedTransitions: ['documentacao_pronta', 'descartada'],
      actions: [
        {
          id: 'confirmar_documentacao',
          label: 'Confirmar Documentação',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'descartar',
          label: 'Descartar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 5,
    },
    {
      id: 'documentacao_pronta',
      label: 'Documentação Pronta',
      description: 'Toda documentação preparada e conferida',
      color: 'var(--orx-success-light)',
      icon: 'FolderCheck',
      allowedTransitions: ['preparando_proposta'],
      actions: [
        {
          id: 'iniciar_proposta',
          label: 'Iniciar Proposta Comercial',
          icon: 'DollarSign',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'preparando_proposta',
      label: 'Preparando Proposta',
      description: 'Elaborando proposta comercial e planilha de custos',
      color: 'var(--orx-warning)',
      icon: 'Calculator',
      allowedTransitions: ['proposta_pronta', 'descartada'],
      actions: [
        {
          id: 'finalizar_proposta',
          label: 'Finalizar Proposta',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
          allowedRoles: ['comercial', 'gestor_licitacoes'],
        },
        {
          id: 'descartar',
          label: 'Descartar',
          icon: 'X',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 5,
    },
    {
      id: 'proposta_pronta',
      label: 'Proposta Pronta',
      description: 'Proposta finalizada, aguardando envio',
      color: 'var(--orx-success-light)',
      icon: 'FileCheck',
      allowedTransitions: ['aguardando_sessao'],
      actions: [
        {
          id: 'enviar_proposta',
          label: 'Enviar Proposta',
          icon: 'Send',
          color: 'var(--orx-primary)',
          requiresConfirmation: true,
        },
      ],
    },
    {
      id: 'aguardando_sessao',
      label: 'Aguardando Sessão',
      description: 'Proposta enviada, aguardando data da sessão pública',
      color: 'var(--orx-info)',
      icon: 'Calendar',
      allowedTransitions: ['em_sessao', 'cancelada_orgao'],
      actions: [
        {
          id: 'iniciar_sessao',
          label: 'Iniciar Sessão',
          icon: 'Play',
          color: 'var(--orx-primary)',
        },
        {
          id: 'registrar_cancelamento',
          label: 'Registrar Cancelamento',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'em_sessao',
      label: 'Em Sessão',
      description: 'Sessão pública em andamento (disputa/lances)',
      color: 'var(--orx-primary)',
      icon: 'Activity',
      allowedTransitions: ['vencedora', 'perdedora', 'em_recurso_impugnacao'],
      actions: [
        {
          id: 'registrar_vitoria',
          label: 'Registrar Vitória',
          icon: 'Trophy',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'registrar_derrota',
          label: 'Registrar Derrota',
          icon: 'TrendingDown',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
        {
          id: 'entrar_recurso',
          label: 'Entrar com Recurso',
          icon: 'AlertTriangle',
          color: 'var(--orx-warning)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'vencedora',
      label: 'Vencedora',
      description: 'Proposta vencedora da licitação',
      color: 'var(--orx-success)',
      icon: 'Trophy',
      allowedTransitions: ['aguardando_homologacao', 'em_recurso_terceiros'],
      actions: [
        {
          id: 'aguardar_homologacao',
          label: 'Aguardar Homologação',
          icon: 'Clock',
          color: 'var(--orx-warning)',
        },
        {
          id: 'registrar_recurso_terceiros',
          label: 'Recurso de Terceiros',
          icon: 'AlertTriangle',
          color: 'var(--orx-warning)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'em_recurso_terceiros',
      label: 'Recurso de Terceiros',
      description: 'Terceiros entraram com recurso contra resultado',
      color: 'var(--orx-warning-dark)',
      icon: 'AlertTriangle',
      allowedTransitions: ['vencedora', 'perdedora'],
      actions: [
        {
          id: 'recurso_improcedente',
          label: 'Recurso Improcedente',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresComment: true,
        },
        {
          id: 'recurso_procedente',
          label: 'Recurso Procedente',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'em_recurso_impugnacao',
      label: 'Em Recurso/Impugnação',
      description: 'Empresa entrou com recurso ou impugnação',
      color: 'var(--orx-warning-dark)',
      icon: 'AlertTriangle',
      allowedTransitions: ['vencedora', 'perdedora', 'em_sessao'],
      actions: [
        {
          id: 'recurso_deferido',
          label: 'Recurso Deferido',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresComment: true,
        },
        {
          id: 'recurso_indeferido',
          label: 'Recurso Indeferido',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
    },
    {
      id: 'aguardando_homologacao',
      label: 'Aguardando Homologação',
      description: 'Aguardando homologação oficial do resultado',
      color: 'var(--orx-warning)',
      icon: 'Clock',
      allowedTransitions: ['homologada', 'cancelada_orgao'],
      actions: [
        {
          id: 'confirmar_homologacao',
          label: 'Confirmar Homologação',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'registrar_cancelamento',
          label: 'Registrar Cancelamento',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 15,
    },
    {
      id: 'homologada',
      label: 'Homologada',
      description: 'Licitação homologada oficialmente',
      color: 'var(--orx-success-light)',
      icon: 'CheckCircle',
      allowedTransitions: ['aguardando_contrato'],
      actions: [
        {
          id: 'iniciar_contrato',
          label: 'Iniciar Processo de Contrato',
          icon: 'FileText',
          color: 'var(--orx-primary)',
        },
      ],
    },
    {
      id: 'aguardando_contrato',
      label: 'Aguardando Assinatura',
      description: 'Aguardando assinatura do contrato',
      color: 'var(--orx-info)',
      icon: 'FileSignature',
      allowedTransitions: ['contrato_assinado', 'cancelada_orgao'],
      actions: [
        {
          id: 'confirmar_assinatura',
          label: 'Confirmar Assinatura',
          icon: 'CheckCircle',
          color: 'var(--orx-success)',
          requiresConfirmation: true,
        },
        {
          id: 'registrar_cancelamento',
          label: 'Registrar Cancelamento',
          icon: 'XCircle',
          color: 'var(--orx-error)',
          requiresComment: true,
        },
      ],
      autoProgressAfterDays: 30,
    },
    {
      id: 'contrato_assinado',
      label: 'Contrato Assinado',
      description: 'Contrato assinado, licitação concluída com sucesso',
      color: 'var(--orx-success)',
      icon: 'Trophy',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'perdedora',
      label: 'Perdedora',
      description: 'Proposta não venceu a licitação',
      color: 'var(--orx-error)',
      icon: 'TrendingDown',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'descartada',
      label: 'Descartada',
      description: 'Oportunidade descartada pela empresa',
      color: 'var(--orx-gray-500)',
      icon: 'X',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
    {
      id: 'cancelada_orgao',
      label: 'Cancelada pelo Órgão',
      description: 'Licitação cancelada pelo órgão público',
      color: 'var(--orx-error-dark)',
      icon: 'Ban',
      allowedTransitions: [],
      actions: [],
      isFinal: true,
    },
  ],
  
  notifications: [
    {
      id: 'notif-licitacao-identificada',
      trigger: 'state_enter',
      stateId: 'identificada',
      recipients: ['assignee'],
      recipientRoles: ['gestor_licitacoes', 'comercial'],
      template: 'Nova oportunidade de licitação: {orgao_nome} - {objeto}. Valor estimado: R$ {valor_estimado}',
      channels: ['email', 'whatsapp', 'in_app'],
    },
    {
      id: 'notif-licitacao-analise-aprovada',
      trigger: 'state_enter',
      stateId: 'analise_aprovada',
      recipients: ['creator'],
      recipientRoles: ['documentacao', 'juridico'],
      template: 'Participação aprovada! Iniciar preparação de documentação. Edital: {numero_edital}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-licitacao-prazo-3-dias',
      trigger: 'overdue',
      stateId: 'preparando_documentacao',
      recipients: ['assignee'],
      recipientRoles: ['gestor_licitacoes'],
      template: 'ALERTA: Faltam 3 dias para o prazo de envio! Edital: {numero_edital}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-licitacao-proposta-pronta',
      trigger: 'state_enter',
      stateId: 'proposta_pronta',
      recipients: ['creator'],
      recipientRoles: ['gestor_licitacoes'],
      template: 'Proposta finalizada! Valor: R$ {valor_proposta}. Prazo de envio: {data_limite}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-licitacao-aguardando-sessao',
      trigger: 'state_enter',
      stateId: 'aguardando_sessao',
      recipients: ['assignee', 'creator'],
      recipientRoles: ['gestor_licitacoes', 'comercial'],
      template: 'Proposta enviada! Sessão pública em: {data_sessao}. Preparar lances.',
      channels: ['email', 'whatsapp', 'in_app'],
    },
    {
      id: 'notif-licitacao-lembrete-sessao-24h',
      trigger: 'overdue',
      stateId: 'aguardando_sessao',
      recipients: ['assignee'],
      recipientRoles: ['gestor_licitacoes', 'comercial'],
      template: 'LEMBRETE: Sessão pública em 24 horas! Modalidade: {modalidade}. Edital: {numero_edital}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-licitacao-vencedora',
      trigger: 'state_enter',
      stateId: 'vencedora',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['gestor_licitacoes', 'comercial', 'diretor', 'financeiro'],
      template: '🏆 VITÓRIA NA LICITAÇÃO! Órgão: {orgao_nome}. Valor: R$ {valor_contrato}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-licitacao-recurso-terceiros',
      trigger: 'state_enter',
      stateId: 'em_recurso_terceiros',
      recipients: ['assignee'],
      recipientRoles: ['gestor_licitacoes', 'juridico'],
      template: 'ALERTA: Recurso de terceiros contra resultado. Acompanhar processo.',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-licitacao-homologada',
      trigger: 'state_enter',
      stateId: 'homologada',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['gestor_licitacoes', 'juridico', 'financeiro'],
      template: '✅ Licitação HOMOLOGADA! Iniciar processo de assinatura de contrato.',
      channels: ['email', 'whatsapp', 'in_app'],
    },
    {
      id: 'notif-licitacao-contrato-assinado',
      trigger: 'state_enter',
      stateId: 'contrato_assinado',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['gestor_licitacoes', 'comercial', 'diretor', 'financeiro', 'operacional'],
      template: '🎉 CONTRATO ASSINADO! Órgão: {orgao_nome}. Valor: R$ {valor_contrato}. Vigência: {data_inicio} a {data_termino}',
      channels: ['email', 'whatsapp', 'push', 'in_app'],
    },
    {
      id: 'notif-licitacao-perdedora',
      trigger: 'state_enter',
      stateId: 'perdedora',
      recipients: ['creator'],
      recipientRoles: ['gestor_licitacoes', 'comercial'],
      template: 'Licitação não vencida. Vencedor: {vencedor_nome}. Valor vencedor: R$ {valor_vencedor}. Motivo: {motivo_derrota}',
      channels: ['email', 'in_app'],
    },
    {
      id: 'notif-licitacao-cancelada',
      trigger: 'state_enter',
      stateId: 'cancelada_orgao',
      recipients: ['creator', 'assignee'],
      recipientRoles: ['gestor_licitacoes'],
      template: 'Licitação CANCELADA pelo órgão. Motivo: {motivo_cancelamento}',
      channels: ['email', 'whatsapp', 'in_app'],
    },
  ],
  
  validations: [
    {
      stateId: 'analise_aprovada',
      type: 'required_fields',
      message: 'É necessário verificar se a empresa possui as certidões exigidas',
      validator: async (instance) => {
        const certidoesOk = instance.metadata?.certidoesRegulares || false;
        return certidoesOk;
      },
    },
    {
      stateId: 'documentacao_pronta',
      type: 'required_fields',
      message: 'É necessário anexar todos os documentos exigidos no edital',
      validator: async (instance) => {
        const documentosExigidos = instance.metadata?.documentosExigidos || [];
        const documentosAnexados = instance.metadata?.documentosAnexados || [];
        return documentosExigidos.length > 0 && documentosAnexados.length >= documentosExigidos.length;
      },
    },
    {
      stateId: 'proposta_pronta',
      type: 'required_fields',
      message: 'É necessário preencher a planilha de custos e valor final da proposta',
      validator: async (instance) => {
        return !!instance.metadata?.valorProposta && instance.metadata.valorProposta > 0;
      },
    },
    {
      stateId: 'aguardando_sessao',
      type: 'custom_rule',
      message: 'A proposta não pode ser enviada após o prazo limite',
      validator: async (instance) => {
        const dataLimite = new Date(instance.metadata?.dataLimiteEnvio);
        return new Date() <= dataLimite;
      },
    },
    {
      stateId: 'homologada',
      type: 'approval',
      message: 'Contratos acima de R$ 500.000 requerem aprovação da diretoria',
      validator: async (instance) => {
        const valorContrato = instance.metadata?.valorContrato || 0;
        const aprovadoDiretoria = instance.metadata?.aprovadoDiretoria || false;
        
        if (valorContrato > 500000) {
          return aprovadoDiretoria;
        }
        return true;
      },
    },
  ],
};

// ============================================
// TIPOS ESPECÍFICOS PARA LICITAÇÕES
// ============================================

export interface LicitacaoWorkflowMetadata {
  // Dados do Edital
  numeroEdital: string;
  modalidade: 'pregao_eletronico' | 'pregao_presencial' | 'concorrencia' | 'tomada_precos' | 'convite' | 'dispensa' | 'inexigibilidade';
  orgaoNome: string;
  orgaoCNPJ: string;
  objeto: string;
  valorEstimado?: number;
  
  // Prazos
  dataPublicacao: Date;
  dataLimiteImpugnacao?: Date;
  dataLimiteEsclarecimentos?: Date;
  dataLimiteEnvio: Date;
  dataSessao: Date;
  
  // Documentação
  certidoesRegulares: boolean;
  documentosExigidos: string[];
  documentosAnexados: Array<{
    tipo: string;
    arquivo: string;
    dataAnexo: Date;
  }>;
  
  // Proposta Comercial
  valorProposta?: number;
  planilhaCustos?: string;
  prazoExecucao?: string;
  garantiaOferta?: string;
  
  // Resultado
  vencedorNome?: string;
  valorVencedor?: number;
  motivoDerrota?: string;
  valorContrato?: number;
  dataInicio?: Date;
  dataTermino?: Date;
  
  // Recursos e Impugnações
  recursoCriado?: boolean;
  recursoMotivo?: string;
  recursoResultado?: 'deferido' | 'indeferido';
  
  // Aprovações
  aprovadoDiretoria?: boolean;
  aprovadores?: Array<{
    usuarioId: string;
    cargo: string;
    aprovadoEm?: Date;
  }>;
  
  // Cancelamento
  motivoCancelamento?: string;
  
  // Observações
  observacoes?: string;
}

