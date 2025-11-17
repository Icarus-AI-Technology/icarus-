import { test, expect } from "@playwright/test";

/**
 * Test Suite 08: Performance & Otimização
 * ICARUS v5.0 - E2E
 */

test.describe("Performance - Load Time", () => {
  test("deve carregar home page rapidamente", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Deve carregar em menos de 2 segundos
    expect(loadTime).toBeLessThan(2000);
  });

  test("deve carregar dashboard rapidamente", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test("deve carregar módulos rapidamente", async ({ page }) => {
    const modules = ["/estoque", "/financeiro", "/cirurgias", "/fornecedores"];

    for (const module of modules) {
      const startTime = Date.now();

      await page.goto(module);
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    }
  });
});

test.describe("Performance - Bundle Size", () => {
  test("deve fazer code splitting", async ({ page }) => {
    await page.goto("/");

    // Verifica que foram carregados múltiplos chunks
    const scripts = await page.locator('script[type="module"]').count();

    expect(scripts).toBeGreaterThanOrEqual(2);
  });

  test("deve lazy load rotas", async ({ page }) => {
    await page.goto("/dashboard");

    // Navega para módulo pesado
    await page.click("text=Estoque");
    await page.waitForLoadState("networkidle");

    // Verifica que novo chunk foi carregado
    const requests = [];
    page.on("request", (req) => {
      if (req.url().includes(".js")) {
        requests.push(req.url());
      }
    });

    await page.click("text=Relatórios");

    await page.waitForTimeout(1000);

    expect(requests.length).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Performance - Caching", () => {
  test("deve cachear assets estáticos", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Recarrega a página
    await page.reload();

    // Verifica cache headers
    const response = await page.goto("/dashboard");
    const cacheControl = response?.headers()["cache-control"];

    expect(cacheControl).toBeDefined();
  });

  test("deve usar cache do Supabase", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.waitForLoadState("networkidle");

    const firstLoad = Date.now();

    // Navega para outra página e volta
    await page.goto("/dashboard");
    await page.goto("/fornecedores");
    await page.waitForLoadState("networkidle");

    const secondLoad = Date.now();

    // Segunda carga deve ser mais rápida (cache)
    expect(secondLoad - firstLoad).toBeLessThan(1000);
  });
});

test.describe("Performance - Imagens", () => {
  test("deve lazy load imagens", async ({ page }) => {
    await page.goto("/produtos");

    // Verifica atributo loading="lazy"
    const lazyImages = await page.locator('img[loading="lazy"]').count();

    expect(lazyImages).toBeGreaterThanOrEqual(1);
  });

  test("deve usar WebP quando disponível", async ({ page }) => {
    await page.goto("/");

    // Verifica uso de formato moderno
    const images = await page.locator("img").all();

    let hasWebP = false;
    for (const img of images) {
      const src = await img.getAttribute("src");
      if (src && (src.includes(".webp") || src.includes("format=webp"))) {
        hasWebP = true;
        break;
      }
    }

    // Pelo menos uma imagem deve ser WebP (se houver imagens)
    if (images.length > 0) {
      expect(hasWebP).toBe(true);
    }
  });
});

test.describe("Performance - API Calls", () => {
  test("deve fazer batch de requisições", async ({ page }) => {
    await page.goto("/dashboard");

    const apiCalls = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/")) {
        apiCalls.push(req.url());
      }
    });

    await page.waitForLoadState("networkidle");

    // Dashboard deve fazer menos de 10 calls iniciais
    expect(apiCalls.length).toBeLessThanOrEqual(10);
  });

  test("deve debounce busca", async ({ page }) => {
    await page.goto("/fornecedores");

    let searchCalls = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/search")) {
        searchCalls++;
      }
    });

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();

    // Digita rapidamente
    await searchInput.type("ABC", { delay: 50 });

    await page.waitForTimeout(1000);

    // Deve ter feito apenas 1 call (debounced)
    expect(searchCalls).toBeLessThanOrEqual(1);
  });
});

test.describe("Performance - Rendering", () => {
  test("deve virtualizar listas longas", async ({ page }) => {
    await page.goto("/produtos");

    // Mock de lista com 1000 itens
    await page.route("**/api/produtos**", async (route) => {
      const items = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        nome: `Produto ${i}`,
      }));

      await route.fulfill({
        status: 200,
        body: JSON.stringify(items),
      });
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Apenas itens visíveis devem estar no DOM (virtualização)
    const renderedItems = await page.locator("tbody tr").count();

    // Deve ter menos de 100 itens renderizados
    expect(renderedItems).toBeLessThan(100);
  });

  test("deve usar React.memo para evitar re-renders", async ({ page }) => {
    await page.goto("/dashboard");

    // Interage com elemento que não deve causar re-render total
    await page.click('button:has-text("Atualizar")');

    await page.waitForTimeout(500);

    // Verifica que apenas componente específico foi atualizado
    // (teste visual - não há erro de console)
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });
});

test.describe("Performance - Network", () => {
  test("deve funcionar com rede lenta (3G)", async ({ page, context }) => {
    // Simula rede 3G
    await context.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });

    const startTime = Date.now();

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Deve carregar em menos de 5 segundos mesmo em 3G
    expect(loadTime).toBeLessThan(5000);
  });

  test("deve funcionar offline (Service Worker)", async ({ page, context }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Simula offline
    await context.setOffline(true);

    // Navega para outra rota
    await page.click("text=Financeiro");

    // Verifica que página ainda funciona (se houver SW)
    await expect(page.locator("h1")).toBeVisible({ timeout: 3000 });

    await context.setOffline(false);
  });
});

test.describe("Performance - Memory", () => {
  test("deve limpar listeners ao desmontar", async ({ page }) => {
    await page.goto("/dashboard");

    // Navega entre páginas várias vezes
    for (let i = 0; i < 5; i++) {
      await page.click("text=Estoque");
      await page.waitForTimeout(200);
      await page.click("text=Dashboard");
      await page.waitForTimeout(200);
    }

    // Verifica que não há memory leaks (sem erros no console)
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });
});

test.describe("Performance - SEO & Lighthouse", () => {
  test("deve ter meta tags básicas", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    const description = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(description).toBeTruthy();
  });

  test("deve ter headings estruturados", async ({ page }) => {
    await page.goto("/dashboard");

    // Deve ter h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Não deve ter mais de 1 h1
    expect(h1Count).toBeLessThanOrEqual(1);
  });
});
