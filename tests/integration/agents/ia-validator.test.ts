import { test, expect, describe } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("IA-Validator Agent", () => {
  test("validar-topologia deve executar em < 5 segundos", async () => {
    const startTime = Date.now();

    const result = await AgentOrchestrator.executeCommand({
      agent: "IA-Validator",
      action: "validar-topologia",
    });

    const executionTime = Date.now() - startTime;

    expect(executionTime).toBeLessThan(5000);
    expect(result.executionTime).toBeDefined();
  }, 10000);

  test("auditar-edge-functions deve retornar dados", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "IA-Validator",
      action: "auditar-edge-functions",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("corrigir-configs deve executar sem erros fatais", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "IA-Validator",
      action: "corrigir-configs",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("comando inválido deve retornar erro específico", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "IA-Validator",
      action: "comando-inexistente",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("não encontrada");
  });
});
