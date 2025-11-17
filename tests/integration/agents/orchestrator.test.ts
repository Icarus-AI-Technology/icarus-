import { test, expect, describe, beforeAll } from "vitest";
import { AgentOrchestrator, AgentCommand } from "@/lib/agents/orchestrator";

describe("AgentOrchestrator", () => {
  describe("getAvailableAgents", () => {
    test("deve retornar todos os 6 agentes", () => {
      const agents = AgentOrchestrator.getAvailableAgents();

      expect(agents).toHaveLength(5); // IA-Validator, Contador, Advogado, Gestao, Tutor
      expect(agents).toContain("IA-Validator");
      expect(agents).toContain("Contador");
      expect(agents).toContain("Advogado");
      expect(agents).toContain("Gestao");
      expect(agents).toContain("Tutor");
    });
  });

  describe("getAvailableCommands", () => {
    test("IA-Validator deve ter 3 comandos", () => {
      const commands = AgentOrchestrator.getAvailableCommands("IA-Validator");

      expect(commands).toHaveLength(3);
      expect(commands).toContain("validar-topologia");
      expect(commands).toContain("auditar-edge-functions");
      expect(commands).toContain("corrigir-configs");
    });

    test("Contador deve ter 3 comandos", () => {
      const commands = AgentOrchestrator.getAvailableCommands("Contador");

      expect(commands).toHaveLength(3);
      expect(commands).toContain("check-fiscal-erp");
      expect(commands).toContain("list-obrigacoes");
      expect(commands).toContain("simular-lucro-real");
    });

    test("Advogado deve ter 2 comandos", () => {
      const commands = AgentOrchestrator.getAvailableCommands("Advogado");

      expect(commands).toHaveLength(2);
      expect(commands).toContain("check-compliance-erp");
      expect(commands).toContain("monitor-regulatorio");
    });

    test("Gestao deve ter 2 comandos", () => {
      const commands = AgentOrchestrator.getAvailableCommands("Gestao");

      expect(commands).toHaveLength(2);
      expect(commands).toContain("mapear-kpis");
      expect(commands).toContain("auditar-modulos");
    });

    test("Tutor deve ter 3 comandos", () => {
      const commands = AgentOrchestrator.getAvailableCommands("Tutor");

      expect(commands).toHaveLength(3);
      expect(commands).toContain("diagnosticar");
      expect(commands).toContain("classificar-gaps");
      expect(commands).toContain("parecer-compliance");
    });
  });

  describe("executeCommand", () => {
    test("deve falhar com agente inválido", async () => {
      const command: AgentCommand = {
        agent: "InvalidAgent" as any,
        action: "test",
      };

      const result = await AgentOrchestrator.executeCommand(command);

      expect(result.success).toBe(false);
      expect(result.error).toContain("não encontrado");
    });

    test("deve falhar com ação inválida", async () => {
      const command: AgentCommand = {
        agent: "IA-Validator",
        action: "invalid-action",
      };

      const result = await AgentOrchestrator.executeCommand(command);

      expect(result.success).toBe(false);
      expect(result.error).toContain("não encontrada");
    });

    test("deve medir tempo de execução", async () => {
      const command: AgentCommand = {
        agent: "IA-Validator",
        action: "validar-topologia",
      };

      const result = await AgentOrchestrator.executeCommand(command);

      expect(result.executionTime).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });
  });
});
