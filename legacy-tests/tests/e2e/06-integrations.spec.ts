import { test, expect } from "@playwright/test";

/**
 * Test Suite 06: Integrações
 * ICARUS v5.0 - E2E
 */

test.describe("Integração - OCR (Tesseract)", () => {
  test("deve fazer upload de documento", async ({ page }) => {
    await page.goto("/documentos-upload");

    // Upload de arquivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/fixtures/documento-teste.pdf");

    // Aguarda processamento
    await expect(page.locator("text=/processando/i")).toBeVisible({
      timeout: 3000,
    });
  });

  test("deve exibir resultado do OCR", async ({ page }) => {
    await page.goto("/documentos-upload");

    // Mock da resposta OCR
    await page.route("**/api/ocr/process**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          text: "NOTA FISCAL\nValor: R$ 1.000,00",
          confidence: 0.95,
        }),
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/fixtures/nota-fiscal.jpg");

    // Aguarda resultado
    await expect(page.locator("text=NOTA FISCAL")).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Integração - Email (SendGrid)", () => {
  test("deve enviar email de notificação", async ({ page }) => {
    await page.goto("/configuracoes/notificacoes");

    // Mock do SendGrid
    await page.route("**/api/email/send**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, message_id: "123" }),
      });
    });

    await page.click('button:has-text("Enviar Teste")');

    await expect(page.locator("text=/email enviado/i")).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe("Integração - SMS (Twilio)", () => {
  test("deve enviar SMS", async ({ page }) => {
    await page.goto("/notificacoes");

    await page.route("**/api/sms/send**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, sid: "SM123" }),
      });
    });

    await page.fill('input[name="telefone"]', "+5511999999999");
    await page.fill('textarea[name="mensagem"]', "Mensagem de teste");
    await page.click('button:has-text("Enviar SMS")');

    await expect(page.locator("text=/SMS enviado/i")).toBeVisible({
      timeout: 3000,
    });
  });
});

test.describe("Integração - GPT Researcher", () => {
  test("deve fazer pesquisa com IA", async ({ page }) => {
    await page.goto("/gpt-researcher-demo");

    // Mock da API
    await page.route("**/api/gpt-researcher/research**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          report: "Relatório gerado pela IA sobre o tema pesquisado.",
          sources: [
            "https://example.com/source1",
            "https://example.com/source2",
          ],
        }),
      });
    });

    await page.fill('input[name="query"]', "Tendências em OPME 2025");
    await page.click('button:has-text("Pesquisar")');

    // Aguarda resultado
    await expect(page.locator("text=/relatório gerado/i")).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Integração - Analytics (PostHog)", () => {
  test("deve rastrear eventos", async ({ page }) => {
    await page.goto("/dashboard");

    // Mock do PostHog
    let eventCaptured = false;
    await page.route("**/posthog.com/**", async (route) => {
      eventCaptured = true;
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    // Interage com elemento
    await page.click("text=Dashboard");

    // Aguarda evento
    await page.waitForTimeout(1000);

    expect(eventCaptured).toBe(true);
  });
});

test.describe("Integração - Filas (BullMQ)", () => {
  test("deve adicionar job à fila", async ({ page }) => {
    await page.goto("/processamento-lote");

    await page.route("**/api/queue/add**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ job_id: "job-123", queue: "ml-processing" }),
      });
    });

    await page.click('button:has-text("Processar Lote")');

    await expect(page.locator("text=/adicionado à fila/i")).toBeVisible({
      timeout: 3000,
    });
  });

  test("deve monitorar progresso do job", async ({ page }) => {
    await page.goto("/jobs/job-123");

    // Mock do status do job
    await page.route("**/api/queue/job/job-123**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: "job-123",
          status: "active",
          progress: 50,
        }),
      });
    });

    await page.reload();

    // Verifica barra de progresso
    await expect(page.locator('[role="progressbar"]')).toBeVisible();
  });
});

test.describe("Integração - Supabase", () => {
  test("deve autenticar com Supabase", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/auth/v1/token**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          user: { email: "test@icarus.com", id: "123" },
        }),
      });
    });

    await page.fill('input[type="email"]', "test@icarus.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });

  test("deve fazer query no Supabase", async ({ page }) => {
    await page.goto("/fornecedores");

    // Mock da query
    await page.route("**/rest/v1/fornecedores**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Range": "0-9/10" },
        body: JSON.stringify([
          { id: 1, razao_social: "Fornecedor A", cnpj: "11.111.111/0001-11" },
          { id: 2, razao_social: "Fornecedor B", cnpj: "22.222.222/0001-22" },
        ]),
      });
    });

    await page.reload();

    await expect(page.locator("text=Fornecedor A")).toBeVisible();
  });
});

test.describe("Integração - Brasil API", () => {
  test("deve buscar CEP", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    await page.route("**/brasilapi.com.br/api/cep/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          cep: "01310-100",
          street: "Avenida Paulista",
          neighborhood: "Bela Vista",
          city: "São Paulo",
          state: "SP",
        }),
      });
    });

    await page.fill('input[name="cep"]', "01310-100");
    await page.click('button:has-text("Buscar CEP")');

    await page.waitForTimeout(500);

    const street = await page.locator('input[name="logradouro"]').inputValue();
    expect(street).toContain("Paulista");
  });

  test("deve buscar CNPJ", async ({ page }) => {
    await page.goto("/fornecedores");
    await page.click('button:has-text("Novo")');

    await page.route("**/brasilapi.com.br/api/cnpj/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          razao_social: "EMPRESA TESTE LTDA",
          nome_fantasia: "Empresa Teste",
        }),
      });
    });

    await page.fill('input[name="cnpj"]', "12.345.678/0001-90");
    await page.click('button:has-text("Buscar CNPJ")');

    await page.waitForTimeout(500);

    const razao = await page.locator('input[name="razao_social"]').inputValue();
    expect(razao).toContain("EMPRESA TESTE");
  });
});
