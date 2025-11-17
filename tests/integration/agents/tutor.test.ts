import { test, expect, describe } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("Tutor Agent", () => {
  test("diagnosticar deve executar em < 5 segundos", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Tutor",
      action: "diagnosticar",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("classificar-gaps deve retornar classificação", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Tutor",
      action: "classificar-gaps",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("parecer-compliance deve gerar parecer", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Tutor",
      action: "parecer-compliance",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);
});
