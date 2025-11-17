import { test, expect } from "@playwright/test";

/**
 * Test Suite 01: Autenticação
 * ICARUS v5.0 - E2E
 */

test.describe("Autenticação - Login/Logout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve exibir página de login", async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("h1")).toContainText("Login");
  });

  test("deve validar campos obrigatórios", async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    // Verifica mensagens de validação
    const emailError = page.locator("text=/email.*obrigat/i");
    await expect(emailError).toBeVisible({ timeout: 3000 });
  });

  test("deve validar formato de email", async ({ page }) => {
    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');

    const emailError = page.locator("text=/email.*válido/i");
    await expect(emailError).toBeVisible({ timeout: 3000 });
  });

  test("deve fazer login com credenciais válidas (mock)", async ({ page }) => {
    // Simula login bem-sucedido
    await page.fill('input[type="email"]', "admin@icarus.com");
    await page.fill('input[type="password"]', "IcarusAdmin2025!");

    // Mock da resposta do Supabase
    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: "mock-token",
          user: { email: "admin@icarus.com" },
        }),
      });
    });

    await page.click('button[type="submit"]');

    // Aguarda redirecionamento para dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test("deve exibir erro com credenciais inválidas", async ({ page }) => {
    await page.fill('input[type="email"]', "wrong@email.com");
    await page.fill('input[type="password"]', "wrongpass");

    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: "Invalid credentials" }),
      });
    });

    await page.click('button[type="submit"]');

    const errorMsg = page.locator("text=/credenciais inválidas/i");
    await expect(errorMsg).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Autenticação - Signup", () => {
  test("deve exibir página de cadastro", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Cadastr");
  });

  test("deve validar senha forte", async ({ page }) => {
    await page.goto("/signup");

    await page.fill('input[type="email"]', "novo@usuario.com");
    await page.fill('input[type="password"]', "123"); // Senha fraca

    await page.click('button[type="submit"]');

    const passwordError = page.locator("text=/senha.*caracteres/i");
    await expect(passwordError).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Autenticação - Reset Password", () => {
  test("deve exibir página de reset", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("h1")).toContainText(/Reset|Redefinir/);
  });

  test("deve enviar email de reset (mock)", async ({ page }) => {
    await page.goto("/reset-password");

    await page.route("**/auth/v1/recover**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('input[type="email"]', "user@example.com");
    await page.click('button[type="submit"]');

    const successMsg = page.locator("text=/email enviado/i");
    await expect(successMsg).toBeVisible({ timeout: 3000 });
  });
});
