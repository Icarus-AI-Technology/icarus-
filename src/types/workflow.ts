/**
 * 🔄 WORKFLOW SYSTEM — TYPE DEFINITIONS
 * 
 * Sistema completo de gerenciamento de fluxos de trabalho para ICARUS v5.0
 * Baseado em State Machine Pattern e melhores práticas de workflow management
 * 
 * @see https://functionpoint.com/blog/7-key-features-your-workflow-management-system-needs-to-have
 */

// ============================================
// CORE WORKFLOW TYPES
// ============================================

/**
 * Status base para todos os workflows
 */
export type WorkflowStatus = 
  | 'pending'       // Pendente (aguardando início)
  | 'in_progress'   // Em andamento
  | 'completed'     // Concluído
  | 'cancelled'     // Cancelado
  | 'on_hold'       // Em espera
  | 'rejected';     // Rejeitado

/**
 * Prioridade do item no workflow
 */
export type WorkflowPriority = 
  | 'low'           // Baixa
  | 'medium'        // Média
  | 'high'          // Alta
  | 'urgent';       // Urgente

/**
 * Ação que pode ser executada em um estado do workflow
 */
export interface WorkflowAction {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  requiresConfirmation?: boolean;
  requiresComment?: boolean;
  allowedRoles?: string[];
}

/**
 * Estado de um workflow
 */
export interface WorkflowState {
  id: string;
  label: string;
  description?: string;
  color: string;
  icon?: string;
  allowedTransitions: string[]; // IDs dos estados para onde pode transitar
  actions: WorkflowAction[];
  isInitial?: boolean;
  isFinal?: boolean;
  autoProgressAfterDays?: number; // Auto-progressão após X dias
}

/**
 * Definição completa de um workflow
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  module: string;
  states: WorkflowState[];
  notifications: WorkflowNotificationRule[];
  validations?: WorkflowValidation[];
}

/**
 * Instância de um item em um workflow
 */
export interface WorkflowInstance {
  id: string;
  workflowId: string;
  entityId: string;
  entityType: string;
  currentStateId: string;
  priority: WorkflowPriority;
  assignedTo?: string;
  assignedToName?: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  metadata?: Record<string, unknown>;
  history: WorkflowTransition[];
}

/**
 * Transição entre estados
 */
export interface WorkflowTransition {
  id: string;
  fromStateId: string;
  toStateId: string;
  action: string;
  executedBy: string;
  executedByName: string;
  executedAt: Date;
  comment?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Regra de notificação
 */
export interface WorkflowNotificationRule {
  id: string;
  trigger: 'state_enter' | 'state_exit' | 'overdue' | 'assigned';
  stateId?: string;
  recipients: Array<'assignee' | 'creator' | 'role' | 'email'>;
  recipientRoles?: string[];
  recipientEmails?: string[];
  template: string;
  channels: Array<'email' | 'whatsapp' | 'push' | 'in_app'>;
}

export type NotificationRule = WorkflowNotificationRule;

/**
 * Validação antes de transição
 */
export interface WorkflowValidation {
  stateId: string;
  type: 'required_fields' | 'custom_rule' | 'approval';
  message: string;
  validator: (instance: WorkflowInstance) => boolean | Promise<boolean>;
}

// ============================================
// MÓDULO: GESTÃO DE CIRURGIAS
// ============================================

export type CirurgiaWorkflowState = 
  | 'agendada'           // Cirurgia agendada
  | 'confirmada'         // Confirmada pelo hospital/médico
  | 'em_preparacao'      // Em preparação (OPME separados, equipe confirmada)
  | 'em_andamento'       // Cirurgia em andamento
  | 'concluida'          // Concluída com sucesso
  | 'cancelada'          // Cancelada
  | 'adiada';            // Adiada para nova data

export interface CirurgiaWorkflowMetadata {
  hospitalId: string;
  medicoId: string;
  pacienteId: string;
  procedimento: string;
  dataHora: Date;
  opmeIds: string[];
  equipeMedicaId?: string;
  salaCircurgica?: string;
  motivoCancelamento?: string;
  motivoAdiamento?: string;
  novaData?: Date;
}

// ============================================
// MÓDULO: COMPRAS & FORNECEDORES
// ============================================

export type CotacaoWorkflowState = 
  | 'rascunho'           // Cotação sendo criada
  | 'aguardando_respostas' // Enviada para fornecedores
  | 'em_analise'         // Analisando propostas
  | 'aprovada'           // Cotação aprovada
  | 'convertida_pedido'  // Convertida em pedido
  | 'cancelada';         // Cancelada

export interface CotacaoWorkflowMetadata {
  fornecedorIds: string[];
  itemIds: string[];
  quantidades: Record<string, number>;
  dataValidade: Date;
  responsavelId: string;
  motivoCancelamento?: string;
}

export type PedidoCompraWorkflowState = 
  | 'rascunho'           // Pedido sendo criado
  | 'aguardando_aprovacao' // Aguardando aprovação
  | 'aprovado'           // Aprovado
  | 'enviado_fornecedor' // Enviado ao fornecedor
  | 'em_transito'        // Em trânsito
  | 'recebido_parcial'   // Recebido parcialmente
  | 'recebido_total'     // Recebido totalmente
  | 'cancelado'          // Cancelado
  | 'rejeitado';         // Rejeitado

export interface PedidoCompraWorkflowMetadata {
  fornecedorId: string;
  cotacaoId?: string;
  valorTotal: number;
  itens: Array<{
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
  }>;
  aprovadores: Array<{
    usuarioId: string;
    nivel: number;
    aprovadoEm?: Date;
  }>;
  dataPrevistaEntrega?: Date;
  numeroNotaFiscal?: string;
  motivoCancelamento?: string;
  motivoRejeicao?: string;
}

// ============================================
// MÓDULO: OPME (Rastreabilidade)
// ============================================

export type OPMEWorkflowState = 
  | 'em_estoque'         // Em estoque
  | 'reservado'          // Reservado para cirurgia
  | 'em_separacao'       // Sendo separado
  | 'aguardando_esterilizacao' // Aguardando esterilização
  | 'pronto_uso'         // Pronto para uso
  | 'em_uso'             // Em uso na cirurgia
  | 'utilizado'          // Utilizado (rastreado)
  | 'devolvido'          // Devolvido ao estoque
  | 'descartado'         // Descartado
  | 'extraviado';        // Extraviado

export interface OPMEWorkflowMetadata {
  produtoId: string;
  lote: string;
  numeroSerie: string;
  codigoANVISA: string;
  fornecedorId: string;
  cirurgiaId?: string;
  pacienteId?: string;
  dataValidade: Date;
  localAtual: string;
  responsavelId: string;
  motivoDescarte?: string;
  motivoExtravio?: string;
}

export type FaturamentoOPMEWorkflowState = 
  | 'pendente_digitacao'  // Pendente digitação
  | 'em_digitacao'        // Em digitação
  | 'aguardando_conferencia' // Aguardando conferência
  | 'conferido'           // Conferido
  | 'aguardando_envio'    // Aguardando envio ao convênio
  | 'enviado'             // Enviado ao convênio
  | 'aguardando_autorizacao' // Aguardando autorização
  | 'autorizado'          // Autorizado
  | 'glosado'             // Glosado (negado)
  | 'pago'                // Pago
  | 'em_recurso';         // Em recurso (contestação de glosa)

export interface FaturamentoOPMEWorkflowMetadata {
  cirurgiaId: string;
  convenioId: string;
  pacienteId: string;
  opmeUtilizados: Array<{
    opmeId: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
  valorTotal: number;
  numeroGuia?: string;
  numeroAutorizacao?: string;
  dataEnvio?: Date;
  dataAutorizacao?: Date;
  valorGlosado?: number;
  motivoGlosa?: string;
  recursoCriado?: boolean;
}

// ============================================
// MÓDULO: CONTRATOS
// ============================================

export type ContratoWorkflowState = 
  | 'rascunho'           // Rascunho
  | 'em_revisao_juridica' // Em revisão jurídica
  | 'aguardando_ajustes'  // Aguardando ajustes
  | 'aguardando_aprovacao' // Aguardando aprovação
  | 'aprovado'           // Aprovado
  | 'aguardando_assinatura' // Aguardando assinatura
  | 'assinado'           // Assinado
  | 'vigente'            // Vigente
  | 'em_renovacao'       // Em renovação
  | 'vencido'            // Vencido
  | 'rescindido'         // Rescindido
  | 'rejeitado';         // Rejeitado

export interface ContratoWorkflowMetadata {
  tipo: 'fornecedor' | 'cliente' | 'hospital' | 'medico' | 'trabalho';
  parteId: string;
  parteNome: string;
  valorMensal?: number;
  valorTotal?: number;
  dataInicio: Date;
  dataTermino: Date;
  renovacaoAutomatica: boolean;
  clausulas: string[];
  anexos: string[];
  aprovadores: Array<{
    usuarioId: string;
    cargo: string;
    aprovadoEm?: Date;
  }>;
  assinaturas: Array<{
    parte: string;
    assinadoPor: string;
    assinadoEm?: Date;
    documentoAssinado?: string;
  }>;
  motivoRejeicao?: string;
  motivoRescisao?: string;
}

// ============================================
// MÓDULO: RECURSOS HUMANOS
// ============================================

export type RecrutamentoWorkflowState = 
  | 'vaga_aberta'        // Vaga aberta
  | 'triagem_curriculos' // Triagem de currículos
  | 'agendamento_entrevista' // Agendamento de entrevista
  | 'entrevista_rh'      // Entrevista com RH
  | 'entrevista_tecnica' // Entrevista técnica
  | 'em_avaliacao'       // Em avaliação
  | 'oferta_enviada'     // Oferta enviada
  | 'oferta_aceita'      // Oferta aceita
  | 'em_onboarding'      // Em onboarding
  | 'contratado'         // Contratado
  | 'rejeitado'          // Rejeitado
  | 'desistiu';          // Candidato desistiu

export interface RecrutamentoWorkflowMetadata {
  vagaId: string;
  candidatoId: string;
  candidatoNome: string;
  cargo: string;
  departamento: string;
  salarioOferecido?: number;
  dataEntrevista?: Date;
  entrevistadores?: string[];
  pontuacao?: number;
  motivoRejeicao?: string;
}

// ============================================
// MÓDULO: MANUTENÇÃO & CALIBRAÇÃO
// ============================================

export type ManutencaoWorkflowState = 
  | 'agendada'           // Manutenção agendada
  | 'aguardando_peca'    // Aguardando peça
  | 'em_execucao'        // Em execução
  | 'aguardando_teste'   // Aguardando teste
  | 'testado_ok'         // Testado OK
  | 'testado_falha'      // Testado com falha
  | 'concluida'          // Concluída
  | 'cancelada';         // Cancelada

export interface ManutencaoWorkflowMetadata {
  equipamentoId: string;
  tipo: 'preventiva' | 'corretiva' | 'calibracao';
  prioridade: WorkflowPriority;
  tecnicoId?: string;
  dataAgendada: Date;
  pecasNecessarias?: Array<{
    pecaId: string;
    quantidade: number;
  }>;
  laudoTecnico?: string;
  proximaManutencao?: Date;
  motivoCancelamento?: string;
}

// ============================================
// ANALYTICS & METRICS
// ============================================

export interface WorkflowMetrics {
  workflowId: string;
  totalInstances: number;
  averageCompletionTime: number; // em horas
  bottleneckStates: Array<{
    stateId: string;
    averageTimeInState: number;
    instanceCount: number;
  }>;
  stateDistribution: Record<string, number>;
  completionRate: number; // porcentagem
  cancellationRate: number; // porcentagem
}

export interface WorkflowSLA {
  workflowId: string;
  stateId: string;
  maxTimeInState: number; // em horas
  breachAction: 'notify' | 'escalate' | 'auto_progress';
  breachRecipients: string[];
}

// ============================================
// FILTERS & QUERIES
// ============================================

export interface WorkflowInstanceFilter {
  workflowId?: string;
  currentStateId?: string;
  assignedTo?: string;
  createdBy?: string;
  priority?: WorkflowPriority;
  overdue?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  entityType?: string;
  entityId?: string;
}

export interface WorkflowInstanceSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate';
  direction: 'asc' | 'desc';
}

