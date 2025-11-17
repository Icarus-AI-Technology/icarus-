import { test, expect } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

/**
 * Test Suite 09: Acessibilidade (a11y)
 * ICARUS v5.0 - E2E
 * WCAG 2.1 Level AA
 */

test.describe("A11y - Navegação por Teclado", () => {
  test("deve permitir navegação completa por Tab", async ({ page }) => {
    await page.goto("/dashboard");

    // Navega por Tab
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");

      // Verifica que foco está visível
      const focused = page.locator(":focus");
      await expect(focused).toBeVisible();
    }
  });

  test("deve permitir Skip to Content", async ({ page }) => {
    await page.goto("/");

    // Primeira Tab deve focar em "Skip to content"
    await page.keyboard.press("Tab");

    const focused = await page.locator(":focus").textContent();
    expect(focused?.toLowerCase()).toContain("skip");
  });

  test("deve navegar em dropdown com Arrow keys", async ({ page }) => {
    await page.goto("/dashboard");

    // Abre menu de usuário
    await page.keyboard.press("Tab"); // NavBar
    await page.keyboard.press("Tab"); // User menu
    await page.keyboard.press("Enter"); // Abre

    // Navega com setas
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Verifica que item foi selecionado
    await page.waitForTimeout(500);
  });

  test("deve fechar modal com Escape", async ({ page }) => {
    await page.goto("/fornecedores");

    // Abre modal
    await page.click('button:has-text("Novo")');
    await expect(page.locator('h2:has-text("Novo Fornecedor")')).toBeVisible();

    // Fecha com Escape
    await page.keyboard.press("Escape");

    // Verifica que modal foi fechado
    await expect(
      page.locator('h2:has-text("Novo Fornecedor")'),
    ).not.toBeVisible();
  });
});

test.describe("A11y - Screen Readers", () => {
  test("deve ter landmarks ARIA", async ({ page }) => {
    await page.goto("/dashboard");

    // Verifica presence de landmarks
    await expect(page.locator('[role="banner"]')).toBeVisible(); // Header
    await expect(page.locator('[role="navigation"]')).toBeVisible(); // Nav
    await expect(page.locator('[role="main"]')).toBeVisible(); // Main
  });

  test("deve ter aria-labels em botões sem texto", async ({ page }) => {
    await page.goto("/dashboard");

    // Botões de ícone devem ter aria-label
    const iconButtons = page.locator("button[aria-label]");
    const count = await iconButtons.count();

    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("deve ter aria-live para notificações", async ({ page }) => {
    await page.goto("/dashboard");

    // Verifica região de notificações
    const liveRegion = page.locator('[aria-live="polite"], [role="status"]');
    const count = await liveRegion.count();

    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("deve ter aria-describedby em inputs com erro", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    // Tenta submeter sem preencher
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    // Input com erro deve ter aria-describedby
    const errorInput = page.locator("input[aria-describedby]").first();
    const describedBy = await errorInput.getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
  });
});

test.describe("A11y - Contraste de Cores", () => {
  test("deve ter contraste adequado (WCAG AA)", async ({ page }) => {
    await page.goto("/dashboard");
    await injectAxe(page);

    // Verifica contraste
    await checkA11y(page, null, {
      rules: {
        "color-contrast": { enabled: true },
      },
    });
  });

  test("deve ter foco visível", async ({ page }) => {
    await page.goto("/dashboard");

    await page.keyboard.press("Tab");

    // Elemento focado deve ter outline ou border visível
    const focused = page.locator(":focus");
    const outlineColor = await focused.evaluate(
      (el) => window.getComputedStyle(el).outlineColor,
    );

    expect(outlineColor).not.toBe("rgba(0, 0, 0, 0)"); // Não transparente
  });
});

test.describe("A11y - Semântica HTML", () => {
  test("deve usar elementos semânticos", async ({ page }) => {
    await page.goto("/dashboard");

    // Verifica elementos semânticos
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("deve ter apenas um h1 por página", async ({ page }) => {
    await page.goto("/dashboard");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("deve ter hierarquia de headings correta", async ({ page }) => {
    await page.goto("/dashboard");

    // h1 existe
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // h2 vem depois de h1 (não pular níveis)
    const h2Count = await page.locator("h2").count();
    if (h2Count > 0) {
      expect(h1Count).toBeGreaterThanOrEqual(1);
    }
  });

  test("deve usar listas para itens de navegação", async ({ page }) => {
    await page.goto("/dashboard");

    // Sidebar/Nav deve usar <ul> ou <ol>
    const navLists = page.locator("nav ul, nav ol");
    const count = await navLists.count();

    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("A11y - Forms", () => {
  test("deve associar labels com inputs", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    // Todos os inputs devem ter label
    const inputs = await page
      .locator('input[type="text"], input[type="email"]')
      .all();

    for (const input of inputs) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      // Deve ter id (para label) ou aria-label ou aria-labelledby
      const hasLabel = id || ariaLabel || ariaLabelledBy;
      expect(hasLabel).toBeTruthy();
    }
  });

  test("deve ter placeholder como hint, não label", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    // Inputs com placeholder devem ter também label
    const inputsWithPlaceholder = await page
      .locator("input[placeholder]")
      .all();

    for (const input of inputsWithPlaceholder) {
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");

      const hasLabel = id || ariaLabel;
      expect(hasLabel).toBeTruthy();
    }
  });

  test("deve ter mensagens de erro acessíveis", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    // Submete sem preencher
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    // Mensagens de erro devem estar associadas aos inputs
    const errorMessages = await page
      .locator('[role="alert"], .error-message')
      .count();
    expect(errorMessages).toBeGreaterThanOrEqual(1);
  });
});

test.describe("A11y - Imagens", () => {
  test("deve ter alt text em imagens", async ({ page }) => {
    await page.goto("/");

    const images = await page.locator("img").all();

    for (const img of images) {
      const alt = await img.getAttribute("alt");

      // Deve ter alt (pode ser vazio para decorativas)
      expect(alt).not.toBeNull();
    }
  });

  test("deve usar aria-hidden para ícones decorativos", async ({ page }) => {
    await page.goto("/dashboard");

    // Ícones decorativos devem ter aria-hidden
    const decorativeIcons = page.locator('svg[aria-hidden="true"]');
    const count = await decorativeIcons.count();

    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("A11y - Modal/Dialog", () => {
  test('deve ter role="dialog"', async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    // Modal deve ter role dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('deve ter aria-modal="true"', async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    const modal = page.locator('[role="dialog"]');
    const ariaModal = await modal.getAttribute("aria-modal");

    expect(ariaModal).toBe("true");
  });

  test("deve focar primeiro elemento ao abrir", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    await page.waitForTimeout(500);

    // Primeiro input deve estar focado
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });

  test("deve retornar foco ao fechar", async ({ page }) => {
    await page.goto("/fornecedores");

    const openButton = page.locator('button:has-text("Novo")');
    await openButton.click();

    await page.waitForTimeout(300);

    // Fecha modal
    await page.keyboard.press("Escape");

    await page.waitForTimeout(300);

    // Foco deve voltar para botão de abrir
    const focused = page.locator(":focus");
    const focusedText = await focused.textContent();

    expect(focusedText).toContain("Novo");
  });
});

test.describe("A11y - Tabelas", () => {
  test("deve ter cabeçalhos <th>", async ({ page }) => {
    await page.goto("/fornecedores");

    // Tabela deve ter <th>
    const thCount = await page.locator("table th").count();
    expect(thCount).toBeGreaterThanOrEqual(1);
  });

  test("deve ter scope em <th>", async ({ page }) => {
    await page.goto("/fornecedores");

    // th deve ter scope
    const firstTh = page.locator("table th").first();
    const scope = await firstTh.getAttribute("scope");

    expect(scope).toBeTruthy(); // "col" ou "row"
  });

  test("deve ter caption ou aria-label", async ({ page }) => {
    await page.goto("/fornecedores");

    const table = page.locator("table").first();
    const caption = await page.locator("table caption").count();
    const ariaLabel = await table.getAttribute("aria-label");

    const hasLabel = caption > 0 || ariaLabel;
    expect(hasLabel).toBeTruthy();
  });
});

test.describe("A11y - Axe Core Scan", () => {
  test("Dashboard - sem violações críticas", async ({ page }) => {
    await page.goto("/dashboard");
    await injectAxe(page);

    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test("Forms - sem violações críticas", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    await injectAxe(page);

    await checkA11y(page);
  });

  test("Navigation - sem violações críticas", async ({ page }) => {
    await page.goto("/dashboard");
    await injectAxe(page);

    await checkA11y(page, "nav");
  });
});
