import { test, expect, describe } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("Gestao Agent", () => {
  test("mapear-kpis deve executar em < 5 segundos", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Gestao",
      action: "mapear-kpis",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("auditar-modulos deve retornar análise", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Gestao",
      action: "auditar-modulos",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);
});
