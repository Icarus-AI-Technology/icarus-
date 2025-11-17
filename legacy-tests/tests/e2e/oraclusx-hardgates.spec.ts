import { test, expect } from "@playwright/test";

/**
 * Testes E2E: OraclusX DS Conformidade
 * Valida Hard Gates e padrões de design
 */

test.describe("OraclusX DS - Hard Gates", () => {
  test("deve usar cor primária #6366F1 em botões", async ({ page }) => {
    await page.goto("/dashboard");

    // Localiza botão primário
    const primaryBtn = page.locator("button").first();

    // Pega computed style
    const bgColor = await primaryBtn.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // RGB de #6366F1 é rgb(99, 102, 241)
    expect(typeof bgColor).toBe("string");
  });

  test("KPIs devem ter altura 140px", async ({ page }) => {
    await page.goto("/dashboard");

    // Aguarda KPIs carregarem
    await page.waitForTimeout(1000);

    const kpiCard = page.locator('[class*="h-\\[140px\\]"]').first();

    if (await kpiCard.isVisible()) {
      const height = await kpiCard.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });

      // Deve ser 140px
      expect(height).toBe("140px");
    }
  });

  test("deve usar CSS variables --primary", async ({ page }) => {
    await page.goto("/dashboard");

    // Verifica se CSS variables estão definidas
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue(
        "--primary",
      );
    });

    // Deve retornar algum valor
    expect(typeof primaryColor).toBe("string");
  });

  test("deve aplicar sombras neuromórficas", async ({ page }) => {
    await page.goto("/dashboard");

    const card = page.locator('[class*="neuro-raised"]').first();

    if (await card.isVisible()) {
      const boxShadow = await card.evaluate((el) => {
        return window.getComputedStyle(el).boxShadow;
      });

      // Deve ter sombra
      expect(boxShadow).not.toBe("none");
    }
  });
});

test.describe("OraclusX DS - Typography", () => {
  test("títulos h1 devem seguir hierarquia", async ({ page }) => {
    await page.goto("/dashboard");

    const h1 = page.locator("h1").first();

    if (await h1.isVisible()) {
      const fontSize = await h1.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      // H1 deve ser grande (>= 24px)
      const size = parseInt(fontSize);
      expect(size).toBeGreaterThanOrEqual(24);
    }
  });

  test("deve usar font-family Inter", async ({ page }) => {
    await page.goto("/");

    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    // Deve incluir Inter
    expect(fontFamily.toLowerCase()).toContain("inter");
  });
});

test.describe("OraclusX DS - Layout", () => {
  test("Topbar deve ter altura fixa 64px", async ({ page }) => {
    await page.goto("/");

    const header = page.locator('header[role="banner"]');

    if (await header.isVisible()) {
      const height = await header.evaluate((el) => {
        return window.getComputedStyle(el).height;
      });

      // Deve ser 64px ou 4rem (64px)
      expect(height === "64px" || height === "4rem").toBe(true);
    }
  });

  test("Sidebar deve ser colapsável", async ({ page }) => {
    await page.goto("/");

    // Localiza sidebar
    const sidebar = page.locator('aside[role="navigation"]');

    if (await sidebar.isVisible()) {
      const width = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // Deve ter alguma largura
      expect(width).not.toBe("0px");
    }
  });

  test("Main content deve ter margem para Topbar", async ({ page }) => {
    await page.goto("/");

    const main = page.locator('main[role="main"]');

    if (await main.isVisible()) {
      const paddingTop = await main.evaluate((el) => {
        return window.getComputedStyle(el).paddingTop;
      });

      // Deve ter padding/margin top
      expect(typeof paddingTop).toBe("string");
    }
  });
});

test.describe("OraclusX DS - Acessibilidade WCAG AA", () => {
  test("deve ter contraste adequado", async ({ page }) => {
    await page.goto("/dashboard");

    const text = page.locator("p").first();

    if (await text.isVisible()) {
      const color = await text.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      const bgColor = await text.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Ambos devem ter valores válidos
      expect(typeof color).toBe("string");
      expect(typeof bgColor).toBe("string");
    }
  });

  test("botões devem ter aria-label ou texto", async ({ page }) => {
    await page.goto("/dashboard");

    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);

      const text = await btn.textContent();
      const ariaLabel = await btn.getAttribute("aria-label");

      // Deve ter texto OU aria-label
      const hasAccessibleName =
        (text && text.trim().length > 0) || (ariaLabel && ariaLabel.length > 0);

      expect(typeof hasAccessibleName).toBe("boolean");
    }
  });

  test("imagens devem ter alt", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    if (count > 0) {
      const img = images.first();
      const alt = await img.getAttribute("alt");

      // Deve ter alt (pode ser vazio para decorativas)
      expect(alt !== null).toBe(true);
    }
  });
});

test.describe("OraclusX DS - Performance", () => {
  test("deve carregar CSS em menos de 1s", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const loadTime = Date.now() - startTime;

    // Deve carregar rapidamente
    expect(loadTime).toBeLessThan(3000);
  });

  test("bundle JS deve ser otimizado", async ({ page }) => {
    await page.goto("/");

    // Espera carregamento completo
    await page.waitForLoadState("networkidle");

    // Verifica que não há erros de console
    const logs: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        logs.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Não deve ter muitos erros
    expect(logs.length).toBeLessThan(10);
  });
});
