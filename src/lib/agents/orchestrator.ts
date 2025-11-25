// src/lib/agents/orchestrator.ts
// Orquestrador de agentes ICARUS

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export type AgentCommand = {
  agent: 'IA-Validator' | 'Contador' | 'Advogado' | 'Gestao' | 'Tutor';
  action: string;
  params?: Record<string, unknown>;
};

export type AgentResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
};

/**
 * Orquestrador principal de agentes
 * Roteia comandos do chatbot para os scripts apropriados
 */
export class AgentOrchestrator {
  private static agentScripts = {
    'IA-Validator': {
      'validar-topologia': 'node tools/ia/ia-validator.js',
      'auditar-edge-functions': 'node tools/ia/check-edge-functions.js',
      'corrigir-configs': 'node tools/ia/auto-fix-configs.js',
    },
    Contador: {
      'check-fiscal-erp': 'node tools/compliance/fiscal/check-erp-fiscal.js',
      'list-obrigacoes': 'node tools/compliance/fiscal/list-obrigacoes.js',
      'simular-lucro-real': 'node tools/finance/simulador-lucro-real.js',
    },
    Advogado: {
      'check-compliance-erp': 'node tools/compliance/legal/check-erp-legal.js',
      'monitor-regulatorio': 'node tools/compliance/legal/monitor-regulatorio.js',
    },
    Gestao: {
      'mapear-kpis': 'node tools/analytics/map-kpis-executivos.js',
      'auditar-modulos': 'node tools/audit/auditar-modulos.js',
    },
    Tutor: {
      diagnosticar: 'node tools/tutor/diagnosticar-sistema.js',
      'classificar-gaps': 'node tools/tutor/classificar-gaps.js',
      'parecer-compliance': 'node tools/tutor/parecer-compliance.js',
    },
  };

  /**
   * Executa comando de agente
   */
  static async executeCommand(command: AgentCommand): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      const scripts = this.agentScripts[command.agent];
      if (!scripts) {
        return {
          success: false,
          error: `Agente "${command.agent}" não encontrado`,
        };
      }

      const script = scripts[command.action as keyof typeof scripts];
      if (!script) {
        return {
          success: false,
          error: `Ação "${command.action}" não encontrada para agente "${command.agent}"`,
        };
      }

      const { stdout } = await execAsync(script);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: stdout,
        executionTime,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Lista comandos disponíveis para um agente
   */
  static getAvailableCommands(agent: AgentCommand['agent']): string[] {
    const scripts = this.agentScripts[agent];
    return scripts ? Object.keys(scripts) : [];
  }

  /**
   * Lista todos os agentes disponíveis
   */
  static getAvailableAgents(): AgentCommand['agent'][] {
    return Object.keys(this.agentScripts) as AgentCommand['agent'][];
  }
}
