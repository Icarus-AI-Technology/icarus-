import { test, expect } from "@playwright/test";

test.describe("Dashboard de Agentes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/agentes");
  });

  test("deve carregar o dashboard", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(
      "Dashboard de Agentes ICARUS",
    );
  });

  test("deve mostrar métricas principais", async ({ page }) => {
    // Verificar cards de métricas
    await expect(page.getByText("Total de Agentes")).toBeVisible();
    await expect(page.getByText("Comandos Disponíveis")).toBeVisible();
    await expect(page.getByText("Taxa de Sucesso")).toBeVisible();
    await expect(page.getByText("Tempo Médio")).toBeVisible();
  });

  test("deve listar todos os agentes", async ({ page }) => {
    const agents = ["IA-Validator", "Contador", "Advogado", "Gestao", "Tutor"];

    for (const agent of agents) {
      await expect(page.getByText(agent)).toBeVisible();
    }
  });

  test("deve mostrar status online dos agentes", async ({ page }) => {
    // Verificar indicadores de status
    const statusIndicators = page.locator(".bg-green-500");
    expect(await statusIndicators.count()).toBeGreaterThan(0);
  });

  test("botão de refresh deve funcionar", async ({ page }) => {
    const refreshButton = page.getByRole("button", { name: /atualizar/i });

    await refreshButton.click();

    // Verificar que spinner aparece brevemente
    await expect(page.locator(".animate-spin")).toBeVisible();
  });

  test("auto-refresh pode ser ativado", async ({ page }) => {
    const autoRefreshButton = page.getByRole("button", {
      name: /auto-refresh/i,
    });

    await autoRefreshButton.click();

    await expect(autoRefreshButton).toContainText("Auto-refresh ON");
  });

  test("deve mostrar dados de validação IA", async ({ page }) => {
    // Procurar pela seção de validação
    await expect(
      page.getByText("Última Validação de Topologia IA"),
    ).toBeVisible();
  });
});
