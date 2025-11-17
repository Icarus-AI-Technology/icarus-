// src/lib/agents/orchestrator.ts
// Orquestrador de agentes ICARUS

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type AgentCommand = {
  agent: "IA-Validator" | "Contador" | "Advogado" | "Gestao" | "Tutor";
  action: string;
  params?: Record<string, any>;
};

export type AgentResponse = {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
};

/**
 * Orquestrador principal de agentes
 * Roteia comandos do chatbot para os scripts apropriados
 */
export class AgentOrchestrator {
  private static agentScripts = {
    "IA-Validator": {
      "validar-topologia": "node tools/ia/ia-validator.js",
      "auditar-edge-functions": "node tools/ia/check-edge-functions.js",
      "corrigir-configs": "node tools/ia/auto-fix-configs.js",
    },
    Contador: {
      "check-fiscal-erp": "node tools/compliance/fiscal/check-erp-fiscal.js",
      "list-obrigacoes": "node tools/compliance/fiscal/list-obrigacoes.js",
      "simular-lucro-real": "node tools/finance/simulador-lucro-real.js",
    },
    Advogado: {
      "check-compliance-erp": "node tools/compliance/legal/check-erp-legal.js",
      "monitor-regulatorio":
        "node tools/compliance/legal/monitor-regulatorio.js",
    },
    Gestao: {
      "mapear-kpis": "node tools/analytics/map-kpis-executivos.js",
      "auditar-modulos": "node tools/audit/auditar-modulos.js",
    },
    Tutor: {
      diagnosticar: "node tools/tutor/diagnosticar-sistema.js",
      "classificar-gaps": "node tools/tutor/classificar-gaps.js",
      "parecer-compliance": "node tools/tutor/parecer-compliance.js",
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

      const { stdout, stderr } = await execAsync(script);
      const executionTime = Date.now() - startTime;

      // Salvar métricas
      await this.saveMetrics(
        command.agent,
        command.action,
        executionTime,
        true,
      );

      return {
        success: true,
        data: stdout,
        executionTime,
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Salvar métricas mesmo em caso de erro
      await this.saveMetrics(
        command.agent,
        command.action,
        executionTime,
        false,
      );

      return {
        success: false,
        error: error.message,
        executionTime,
      };
    }
  }

  /**
   * Salva métricas de execução
   */
  private static async saveMetrics(
    agent: string,
    action: string,
    executionTime: number,
    success: boolean,
  ): Promise<void> {
    // Skip em ambiente de testes
    if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
      return;
    }

    try {
      // Apenas tenta salvar se houver baseURL configurada ou estiver em browser
      if (typeof window !== "undefined") {
        await fetch("/api/agents/metrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent, action, executionTime, success }),
        });
      }
    } catch (error) {
      // Silently fail - não queremos bloquear a execução por falha de métrica
    }
  }

  /**
   * Lista comandos disponíveis para um agente
   */
  static getAvailableCommands(agent: AgentCommand["agent"]): string[] {
    const scripts = this.agentScripts[agent];
    return scripts ? Object.keys(scripts) : [];
  }

  /**
   * Lista todos os agentes disponíveis
   */
  static getAvailableAgents(): AgentCommand["agent"][] {
    return Object.keys(this.agentScripts) as AgentCommand["agent"][];
  }
}
