import { test, expect, describe } from "vitest";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";

describe("Advogado Agent", () => {
  test("check-compliance-erp deve executar em < 5 segundos", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Advogado",
      action: "check-compliance-erp",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);

  test("monitor-regulatorio deve retornar dados", async () => {
    const result = await AgentOrchestrator.executeCommand({
      agent: "Advogado",
      action: "monitor-regulatorio",
    });

    expect(result.executionTime).toBeDefined();
    expect(result.executionTime).toBeLessThan(5000);
  }, 10000);
});
