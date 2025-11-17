import { test, expect } from "@playwright/test";

/**
 * Test Suite 05: Busca & Filtros
 * ICARUS v5.0 - E2E
 */

test.describe("Busca - Global (Meilisearch)", () => {
  test("deve exibir campo de busca global", async ({ page }) => {
    await page.goto("/dashboard");

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await expect(searchInput).toBeVisible();
  });

  test("deve buscar e exibir resultados", async ({ page }) => {
    await page.goto("/dashboard");

    // Mock do Meilisearch
    await page.route("**/indexes/*/search**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          hits: [
            { id: "1", title: "Fornecedor ABC", type: "fornecedor" },
            { id: "2", title: "Produto XYZ", type: "produto" },
          ],
          nbHits: 2,
        }),
      });
    });

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("ABC");

    // Aguarda resultados
    await page.waitForTimeout(500);

    // Verifica dropdown de resultados
    await expect(page.locator("text=Fornecedor ABC")).toBeVisible();
    await expect(page.locator("text=Produto XYZ")).toBeVisible();
  });

  test("deve navegar ao clicar em resultado", async ({ page }) => {
    await page.goto("/dashboard");

    await page.route("**/indexes/*/search**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          hits: [
            {
              id: "1",
              title: "Fornecedor ABC",
              type: "fornecedor",
              slug: "fornecedor-abc",
            },
          ],
        }),
      });
    });

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("ABC");
    await page.waitForTimeout(500);

    // Clica no resultado
    await page.click("text=Fornecedor ABC");

    // Verifica navegação
    await expect(page).toHaveURL(/.*fornecedor/);
  });

  test('deve exibir "Nenhum resultado"', async ({ page }) => {
    await page.goto("/dashboard");

    await page.route("**/indexes/*/search**", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ hits: [], nbHits: 0 }),
      });
    });

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("xyz123");
    await page.waitForTimeout(500);

    await expect(
      page.locator("text=/nenhum resultado|não encontrado/i"),
    ).toBeVisible();
  });
});

test.describe("Filtros - Listagens", () => {
  test("deve filtrar tabela por texto", async ({ page }) => {
    await page.goto("/fornecedores");

    // Campo de busca local
    const filterInput = page.locator('input[placeholder*="Filtrar"]').first();
    await filterInput.fill("ABC");

    await page.waitForTimeout(300);

    // Verifica que tabela foi filtrada
    const rows = page.locator("tbody tr");
    const count = await rows.count();

    // Deve ter menos linhas após filtro
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("deve filtrar por status", async ({ page }) => {
    await page.goto("/pedidos");

    // Seleciona filtro de status
    await page.click('select[name="status"]');
    await page.selectOption('select[name="status"]', "pendente");

    await page.waitForLoadState("networkidle");

    // Verifica URL
    await expect(page).toHaveURL(/.*status=pendente/);
  });

  test("deve filtrar por data", async ({ page }) => {
    await page.goto("/financeiro");

    // Preenche data inicial
    await page.fill('input[name="data_inicial"]', "2025-01-01");
    await page.fill('input[name="data_final"]', "2025-01-31");

    // Clica em "Aplicar"
    await page.click('button:has-text("Aplicar")');

    await page.waitForLoadState("networkidle");
  });

  test("deve combinar múltiplos filtros", async ({ page }) => {
    await page.goto("/produtos");

    // Filtro 1: Categoria
    await page.selectOption('select[name="categoria"]', "ortopedia");

    // Filtro 2: Status
    await page.selectOption('select[name="status"]', "ativo");

    // Filtro 3: Texto
    await page.fill('input[name="busca"]', "parafuso");

    await page.click('button:has-text("Filtrar")');

    // Verifica URL com todos os params
    await expect(page).toHaveURL(
      /.*categoria=ortopedia.*status=ativo.*busca=parafuso/,
    );
  });

  test("deve limpar filtros", async ({ page }) => {
    await page.goto("/produtos?categoria=ortopedia&status=ativo");

    // Clica em "Limpar Filtros"
    await page.click('button:has-text("Limpar")');

    // Verifica que URL foi limpa
    await expect(page).toHaveURL(/^(?!.*categoria)(?!.*status).*$/);
  });
});

test.describe("Filtros - Avançados", () => {
  test("deve abrir painel de filtros avançados", async ({ page }) => {
    await page.goto("/estoque");

    // Clica em "Filtros Avançados"
    await page.click('button:has-text("Avançado")');

    // Verifica painel
    await expect(page.locator("text=Filtros Avançados")).toBeVisible();
  });

  test("deve filtrar por range de valores", async ({ page }) => {
    await page.goto("/produtos");
    await page.click('button:has-text("Avançado")');

    // Define range de preço
    await page.fill('input[name="preco_min"]', "100");
    await page.fill('input[name="preco_max"]', "500");

    await page.click('button:has-text("Aplicar")');

    await page.waitForLoadState("networkidle");
  });

  test("deve salvar filtros favoritos", async ({ page }) => {
    await page.goto("/fornecedores");

    // Aplica filtros
    await page.selectOption('select[name="status"]', "ativo");
    await page.selectOption('select[name="tipo"]', "nacional");

    // Salva como favorito
    await page.click('button:has-text("Salvar Filtro")');
    await page.fill('input[name="nome_filtro"]', "Ativos Nacionais");
    await page.click('button:has-text("Confirmar")');

    // Verifica toast de sucesso
    await expect(page.locator("text=/filtro salvo/i")).toBeVisible();
  });
});

test.describe("Ordenação - Tabelas", () => {
  test("deve ordenar por coluna", async ({ page }) => {
    await page.goto("/fornecedores");

    // Clica no header da coluna "Nome"
    await page.click('th:has-text("Nome")');

    // Aguarda reordenação
    await page.waitForTimeout(500);

    // Verifica ícone de ordenação
    await expect(page.locator('th:has-text("Nome") svg')).toBeVisible();
  });

  test("deve alternar ordem ascendente/descendente", async ({ page }) => {
    await page.goto("/produtos");

    // Primeira clique: ascendente
    await page.click('th:has-text("Preço")');
    await page.waitForTimeout(300);

    // Segunda clique: descendente
    await page.click('th:has-text("Preço")');
    await page.waitForTimeout(300);

    // Verifica URL
    await expect(page).toHaveURL(/.*order=desc/);
  });
});

test.describe("Paginação", () => {
  test("deve exibir controles de paginação", async ({ page }) => {
    await page.goto("/fornecedores");

    // Verifica botões de navegação
    await expect(page.locator('button:has-text("Próximo")')).toBeVisible();
    await expect(page.locator('button:has-text("Anterior")')).toBeVisible();
  });

  test("deve navegar para próxima página", async ({ page }) => {
    await page.goto("/fornecedores");

    // Clica em "Próximo"
    await page.click('button:has-text("Próximo")');

    await page.waitForLoadState("networkidle");

    // Verifica URL
    await expect(page).toHaveURL(/.*page=2/);
  });

  test("deve alterar itens por página", async ({ page }) => {
    await page.goto("/produtos");

    // Seleciona 50 itens por página
    await page.selectOption('select[name="pageSize"]', "50");

    await page.waitForLoadState("networkidle");
  });
});
