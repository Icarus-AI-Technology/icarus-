import { test, expect } from "@playwright/test";

test.describe("Chat Agentes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat-agentes");
  });

  test("deve carregar a página do chat", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Chat com Agentes");
  });

  test("deve mostrar lista de agentes", async ({ page }) => {
    // Procurar por agentes disponíveis
    const agents = ["IA-Validator", "Contador", "Advogado", "Gestao", "Tutor"];

    for (const agent of agents) {
      await expect(page.getByText(agent, { exact: false })).toBeVisible();
    }
  });

  test("deve permitir selecionar agente", async ({ page }) => {
    // Click no select de agente
    await page.click('[data-testid="agent-select"]');

    // Selecionar IA-Validator
    await page.click("text=IA-Validator");

    await expect(page.locator('[data-testid="agent-select"]')).toContainText(
      "IA-Validator",
    );
  });

  test("deve mostrar comandos disponíveis ao selecionar agente", async ({
    page,
  }) => {
    // Selecionar agente
    await page.click('[data-testid="agent-select"]');
    await page.click("text=IA-Validator");

    // Verificar se comandos aparecem
    await expect(page.getByText("validar-topologia")).toBeVisible();
    await expect(page.getByText("auditar-edge-functions")).toBeVisible();
  });

  test("deve executar comando e mostrar resultado", async ({ page }) => {
    // Selecionar agente
    await page.click('[data-testid="agent-select"]');
    await page.click("text=IA-Validator");

    // Selecionar comando
    await page.click('[data-testid="action-select"]');
    await page.click("text=validar-topologia");

    // Executar
    await page.click('button:has-text("Executar")');

    // Aguardar resultado (máximo 10s)
    await page.waitForSelector('[data-testid="command-output"]', {
      timeout: 10000,
    });

    // Verificar que há output
    const output = page.locator('[data-testid="command-output"]');
    await expect(output).not.toBeEmpty();
  });

  test("deve mostrar loading durante execução", async ({ page }) => {
    await page.click('[data-testid="agent-select"]');
    await page.click("text=IA-Validator");

    await page.click('[data-testid="action-select"]');
    await page.click("text=validar-topologia");

    await page.click('button:has-text("Executar")');

    // Verificar loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test("deve permitir executar múltiplos comandos", async ({ page }) => {
    // Primeiro comando
    await page.click('[data-testid="agent-select"]');
    await page.click("text=IA-Validator");
    await page.click('[data-testid="action-select"]');
    await page.click("text=validar-topologia");
    await page.click('button:has-text("Executar")');

    await page.waitForSelector('[data-testid="command-output"]', {
      timeout: 10000,
    });

    // Segundo comando
    await page.click('[data-testid="action-select"]');
    await page.click("text=auditar-edge-functions");
    await page.click('button:has-text("Executar")');

    await page.waitForSelector('[data-testid="command-output"]', {
      timeout: 10000,
    });

    // Verificar que ambos os outputs existem
    const outputs = page.locator('[data-testid="command-output"]');
    await expect(outputs).toHaveCount(2);
  });
});
