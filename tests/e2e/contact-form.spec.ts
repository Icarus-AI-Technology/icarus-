import { test, expect } from "@playwright/test";

test.describe("Contato - Smoke", () => {
  test("formulário de contato aceita entrada mínima", async ({ page }) => {
    await page.goto("/contato");

    await expect(
      page.getByRole("heading", { level: 1, name: /Fale Conosco/i }),
    ).toBeVisible();

    await page.getByLabel("Nome").fill("Teste QA");
    await page.getByLabel("E-mail").fill("qa@example.com");
    await page.getByLabel("Assunto").fill("Smoke");
    await page
      .getByLabel("Mensagem")
      .fill("Mensagem de teste automatizado.");

    await page.getByRole("button", { name: /Enviar/i }).click();
    await expect(page.getByText(/Mensagem enviada|Falha ao enviar/)).toBeVisible();
  });
});
import { test, expect } from "@playwright/test";

test.describe("Contato - Smoke", () => {
  test("formulário de contato aceita entrada mínima", async ({ page }) => {
    await page.goto("/contato");

    await expect(
      page.getByRole("heading", { level: 1, name: /Fale Conosco/i }),
    ).toBeVisible();

    await page.getByLabel("Nome").fill("Teste QA");
    await page.getByLabel("E-mail").fill("qa@example.com");
    await page.getByLabel("Assunto").fill("Smoke");
    await page
      .getByLabel("Mensagem")
      .fill("Mensagem de teste automatizado.");

    await page.getByRole("button", { name: /Enviar/i }).click();
    await expect(page.getByText(/Mensagem enviada|Falha ao enviar/)).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Contato - Smoke', () => {
  test('formulário de contato aceita entrada mínima', async ({ page }) => {
    await page.goto('/contato');

    await expect(page.getByRole('heading', { level: 1, name: /Fale Conosco/i })).toBeVisible();

    await page.getByLabel('Nome').fill('Teste QA');
    await page.getByLabel('E-mail').fill('qa@example.com');
    await page.getByLabel('Assunto').fill('Smoke');
    await page.getByLabel('Mensagem').fill('Mensagem de teste automatizado.');

    await page.getByRole('button', { name: /Enviar/i }).click();
    await expect(page.getByText(/Mensagem enviada|Falha ao enviar/)).toBeVisible();
  });
});

