/**
 * 🔄 WORKFLOW REGISTRY
 * 
 * Registro central de todos os workflows do sistema ICARUS v5.0
 * Importa e registra automaticamente todos os workflows disponíveis
 */

import { workflowEngine } from './WorkflowEngine';
import { CIRURGIA_WORKFLOW } from './definitions/cirurgia.workflow';
import { COTACAO_WORKFLOW, PEDIDO_COMPRA_WORKFLOW } from './definitions/compras.workflow';
import { OPME_RASTREABILIDADE_WORKFLOW, FATURAMENTO_OPME_WORKFLOW } from './definitions/opme.workflow';
import { CONTRATO_WORKFLOW } from './definitions/contrato.workflow';
import { LICITACAO_WORKFLOW } from './definitions/licitacao.workflow';

// ============================================
// REGISTRAR TODOS OS WORKFLOWS
// ============================================

export function initializeWorkflows(): void {
  console.log('🔄 Inicializando sistema de workflows...');
  
  // Módulo: Gestão de Cirurgias
  workflowEngine.registerWorkflow(CIRURGIA_WORKFLOW);
  
  // Módulo: Compras & Fornecedores
  workflowEngine.registerWorkflow(COTACAO_WORKFLOW);
  workflowEngine.registerWorkflow(PEDIDO_COMPRA_WORKFLOW);
  
  // Módulo: OPME
  workflowEngine.registerWorkflow(OPME_RASTREABILIDADE_WORKFLOW);
  workflowEngine.registerWorkflow(FATURAMENTO_OPME_WORKFLOW);
  
  // Módulo: Contratos
  workflowEngine.registerWorkflow(CONTRATO_WORKFLOW);
  
  // Módulo: Licitações
  workflowEngine.registerWorkflow(LICITACAO_WORKFLOW);
  
  console.log('✅ Sistema de workflows inicializado com sucesso!');
  console.log(`📊 Total de workflows registrados: ${workflowEngine['workflows'].size}`);
}

// ============================================
// EXPORTS
// ============================================

export {
  workflowEngine,
  
  // Workflows individuais
  CIRURGIA_WORKFLOW,
  COTACAO_WORKFLOW,
  PEDIDO_COMPRA_WORKFLOW,
  OPME_RASTREABILIDADE_WORKFLOW,
  FATURAMENTO_OPME_WORKFLOW,
  CONTRATO_WORKFLOW,
  LICITACAO_WORKFLOW,
};

// ============================================
// MAPEAMENTO WORKFLOW → MÓDULO
// ============================================

export const WORKFLOW_MODULE_MAP = {
  'cirurgia': 'Gestão de Cirurgias',
  'cotacao': 'Compras & Fornecedores',
  'pedido_compra': 'Compras & Fornecedores',
  'opme_rastreabilidade': 'OPME',
  'faturamento_opme': 'OPME',
  'contrato': 'Contratos',
  'licitacao': 'Licitações',
} as const;

// ============================================
// HELPERS
// ============================================

/**
 * Obter todos os workflows de um módulo
 */
export function getWorkflowsByModule(module: string) {
  const workflows = [];
  
  for (const [, workflow] of workflowEngine['workflows']) {
    if (workflow.module === module) {
      workflows.push(workflow);
    }
  }
  
  return workflows;
}

/**
 * Obter workflow por ID
 */
export function getWorkflowById(workflowId: string) {
  return workflowEngine.getWorkflowDefinition(workflowId);
}

/**
 * Listar todos os workflows disponíveis
 */
export function listAllWorkflows() {
  const workflows = [];
  
  for (const [, workflow] of workflowEngine['workflows']) {
    workflows.push({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      module: workflow.module,
      stateCount: workflow.states.length,
    });
  }
  
  return workflows;
}

