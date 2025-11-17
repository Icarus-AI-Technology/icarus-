import { test, expect, describe } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("Contador Agent", () => {
  test("check-fiscal-erp deve executar em < 5 segundos", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Contador",
      action: "check-fiscal-erp",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("list-obrigacoes deve retornar lista", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Contador",
      action: "list-obrigacoes",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("simular-lucro-real deve executar", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Contador",
      action: "simular-lucro-real",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);
});
