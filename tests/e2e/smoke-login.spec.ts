import { test, expect } from "@playwright/test";

test.describe("Autenticação - Smoke", () => {
  test("login básico renderiza elementos principais", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("ICARUS v5.0")).toBeVisible();
    await expect(page.getByRole("textbox", { name: /E-mail/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Entrar no Sistema/i }),
    ).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Autenticação - Smoke', () => {
  test('login básico renderiza elementos principais', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('ICARUS v5.0')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /E-mail/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Entrar no Sistema/i })).toBeVisible();
  });
});

