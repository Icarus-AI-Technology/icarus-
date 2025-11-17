import { test, expect } from "@playwright/test";

/**
 * Test Suite 07: Features de IA
 * ICARUS v5.0 - E2E
 */

test.describe("IA - ChatBot Tutor OPME", () => {
  test("deve exibir interface do chatbot", async ({ page }) => {
    await page.goto("/tutor-opme");

    await expect(page.locator('h1:has-text("Tutor OPME")')).toBeVisible();
    await expect(
      page.locator('textarea[placeholder*="pergunta"]'),
    ).toBeVisible();
  });

  test("deve enviar mensagem ao chatbot", async ({ page }) => {
    await page.goto("/tutor-opme");

    // Mock da resposta do LLM
    await page.route("**/api/ai/chat**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          response: "OPME significa Órtese, Prótese e Materiais Especiais...",
          sources: ["doc1", "doc2"],
        }),
      });
    });

    const textarea = page.locator('textarea[placeholder*="pergunta"]');
    await textarea.fill("O que é OPME?");
    await page.click('button:has-text("Enviar")');

    // Aguarda resposta
    await expect(page.locator("text=/OPME significa/i")).toBeVisible({
      timeout: 5000,
    });
  });

  test("deve exibir fontes das respostas", async ({ page }) => {
    await page.goto("/tutor-opme");

    await page.route("**/api/ai/chat**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          response: "Resposta da IA",
          sources: [
            { title: "Documento 1", url: "/docs/doc1" },
            { title: "Documento 2", url: "/docs/doc2" },
          ],
        }),
      });
    });

    await page.fill('textarea[placeholder*="pergunta"]', "Teste");
    await page.click('button:has-text("Enviar")');

    await page.waitForTimeout(1000);

    // Verifica fontes
    await expect(page.locator("text=Documento 1")).toBeVisible();
    await expect(page.locator("text=Documento 2")).toBeVisible();
  });
});

test.describe("IA - Análise Preditiva", () => {
  test("deve exibir previsões de estoque", async ({ page }) => {
    await page.goto("/estoque-ia");

    await page.route("**/api/ml/predict-stock**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          predictions: [
            {
              item: "Parafuso Pedicular",
              demand_forecast: 45,
              confidence: 0.87,
            },
            { item: "Placa Ortopédica", demand_forecast: 23, confidence: 0.92 },
          ],
        }),
      });
    });

    await page.reload();

    await expect(page.locator("text=Previsão de Demanda")).toBeVisible();
    await expect(page.locator("text=Parafuso Pedicular")).toBeVisible();
  });

  test("deve exibir nível de confiança da IA", async ({ page }) => {
    await page.goto("/estoque-ia");

    await page.route("**/api/ml/predict-stock**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          predictions: [{ item: "Item A", confidence: 0.95 }],
        }),
      });
    });

    await page.reload();

    // Verifica exibição de confiança (95%)
    await expect(page.locator("text=/95%|0\\.95/")).toBeVisible();
  });
});

test.describe("IA - Recomendações", () => {
  test("deve sugerir produtos similares", async ({ page }) => {
    await page.goto("/produto/123");

    await page.route("**/api/ml/recommend**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          recommendations: [
            { id: "124", name: "Produto Similar A", score: 0.89 },
            { id: "125", name: "Produto Similar B", score: 0.82 },
          ],
        }),
      });
    });

    await page.reload();

    await expect(page.locator("text=Produtos Similares")).toBeVisible();
    await expect(page.locator("text=Produto Similar A")).toBeVisible();
  });

  test("deve sugerir fornecedores", async ({ page }) => {
    await page.goto("/compras/novo-pedido");

    await page.route("**/api/ml/recommend-suppliers**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          suppliers: [
            {
              id: "1",
              name: "Fornecedor A",
              score: 0.95,
              reason: "Melhor preço",
            },
            {
              id: "2",
              name: "Fornecedor B",
              score: 0.88,
              reason: "Melhor prazo",
            },
          ],
        }),
      });
    });

    await page.fill('input[name="produto"]', "Parafuso");
    await page.click('button:has-text("Buscar Fornecedores")');

    await page.waitForTimeout(1000);

    await expect(page.locator("text=Fornecedor A")).toBeVisible();
    await expect(page.locator("text=Melhor preço")).toBeVisible();
  });
});

test.describe("IA - Detecção de Anomalias", () => {
  test("deve detectar preços anômalos", async ({ page }) => {
    await page.goto("/compras/pedido-123");

    await page.route("**/api/ml/detect-anomaly**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          anomaly_detected: true,
          reason: "Preço 40% acima da média histórica",
          confidence: 0.91,
        }),
      });
    });

    await page.reload();

    // Verifica alerta de anomalia
    await expect(page.locator("text=/anomalia|atenção/i")).toBeVisible();
    await expect(page.locator("text=/40%.*acima/i")).toBeVisible();
  });

  test("deve detectar consumo anômalo", async ({ page }) => {
    await page.goto("/estoque/item-456");

    await page.route("**/api/ml/detect-anomaly**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          anomaly_detected: true,
          reason: "Consumo 3x maior que o esperado",
        }),
      });
    });

    await page.reload();

    await expect(page.locator("text=/3x maior/i")).toBeVisible();
  });
});

test.describe("IA - Busca Semântica (Vector)", () => {
  test("deve fazer busca por similaridade", async ({ page }) => {
    await page.goto("/busca-semantica");

    await page.route("**/api/vector/search**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          results: [
            { id: "1", title: "Parafuso Pedicular Titanio", similarity: 0.94 },
            { id: "2", title: "Parafuso Cortical Titanio", similarity: 0.87 },
          ],
        }),
      });
    });

    await page.fill('input[name="query"]', "parafuso para coluna");
    await page.click('button:has-text("Buscar")');

    await page.waitForTimeout(1000);

    await expect(page.locator("text=Parafuso Pedicular")).toBeVisible();
  });
});

test.describe("IA - Classificação Automática", () => {
  test("deve classificar documento automaticamente", async ({ page }) => {
    await page.goto("/documentos/classificar");

    await page.route("**/api/ml/classify**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          category: "Nota Fiscal",
          confidence: 0.96,
          tags: ["fiscal", "compra", "fornecedor"],
        }),
      });
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("./tests/fixtures/documento.pdf");

    await page.waitForTimeout(2000);

    await expect(page.locator("text=Nota Fiscal")).toBeVisible();
    await expect(page.locator("text=96%")).toBeVisible();
  });
});

test.describe("IA - Automações", () => {
  test("deve listar automações ativas", async ({ page }) => {
    await page.goto("/automacao-ia");

    await expect(page.locator('h1:has-text("Automação IA")')).toBeVisible();
    await expect(page.locator("text=Automações Ativas")).toBeVisible();
  });

  test("deve criar nova automação", async ({ page }) => {
    await page.goto("/automacao-ia");

    await page.click('button:has-text("Nova Automação")');

    await expect(page.locator('h2:has-text("Nova Automação")')).toBeVisible();

    // Preenche campos
    await page.fill('input[name="nome"]', "Auto-reorder de estoque");
    await page.selectOption('select[name="trigger"]', "estoque_baixo");
    await page.selectOption('select[name="action"]', "criar_pedido");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/automação criada/i")).toBeVisible({
      timeout: 3000,
    });
  });

  test("deve ativar/desativar automação", async ({ page }) => {
    await page.goto("/automacao-ia");

    // Mock da lista
    await page.route("**/api/automations**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: "1", name: "Auto-reorder", active: true }]),
      });
    });

    await page.reload();

    // Toggle switch
    await page.click('[data-automation-id="1"] input[type="checkbox"]');

    await page.waitForTimeout(500);

    // Verifica estado atualizado
    const isChecked = await page
      .locator('[data-automation-id="1"] input[type="checkbox"]')
      .isChecked();
    expect(isChecked).toBe(false);
  });
});
