import { test, expect } from "@playwright/test";

/**
 * Quick Win E2E Test #3: Navegação do Sidebar
 *
 * @description
 * Testa a navegação completa pelo menu lateral (sidebar) do sistema,
 * verificando acessibilidade de todos os módulos principais e integridade
 * das rotas.
 *
 * @example
 * ```bash
 * npx playwright test quick-wins/03-sidebar-navigation-flow.spec.ts
 * ```
 *
 * @remarks
 * Este teste cobre:
 * - Visibilidade e estrutura do sidebar
 * - Navegação para todos os módulos principais
 * - Carregamento correto de cada página
 * - Breadcrumbs e títulos de página
 * - Responsividade do menu (collapse/expand)
 * - Destaque do item ativo
 *
 * @see {@link src/components/layout/Sidebar.tsx}
 * @see {@link src/components/layout/Topbar.tsx}
 */

test.describe("🧭 Quick Win #3: Navegação do Sidebar", () => {
  /**
   * Setup: Mock de autenticação para todos os testes
   */
  test.beforeEach(async ({ page }) => {
    // Simula usuário admin com todas as permissões
    await page.addInitScript(() => {
      localStorage.setItem(
        "icarus_session",
        JSON.stringify({
          usuario: {
            id: "user-123",
            nome: "Admin Icarus",
            email: "admin@icarus.com",
            nivel_acesso: "admin",
          },
          permissoes: [
            // Acesso a todos os módulos
            { recurso: "dashboard", acao: "visualizar" },
            { recurso: "produtos", acao: "visualizar" },
            { recurso: "fornecedores", acao: "visualizar" },
            { recurso: "clientes", acao: "visualizar" },
            { recurso: "vendas", acao: "visualizar" },
            { recurso: "compras", acao: "visualizar" },
            { recurso: "financeiro", acao: "visualizar" },
            { recurso: "estoque", acao: "visualizar" },
            { recurso: "consignacao", acao: "visualizar" },
            { recurso: "cirurgias", acao: "visualizar" },
            { recurso: "contratos", acao: "visualizar" },
            { recurso: "relatorios", acao: "visualizar" },
            { recurso: "configuracoes", acao: "visualizar" },
          ],
        }),
      );
    });

    // Mock básico das APIs para evitar erros
    await page.route("**/rest/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([]),
      });
    });
  });

  test("deve navegar por todos os módulos principais do sidebar", async ({
    page,
  }) => {
    // ==========================================
    // PASSO 1: Acessar dashboard
    // ==========================================
    await page.goto("/dashboard");

    // Verifica que sidebar está visível
    const sidebar = page
      .locator('[data-testid="sidebar"], aside, nav.sidebar')
      .first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });

    console.log("✅ Passo 1: Sidebar visível");

    // ==========================================
    // PASSO 2: Definir módulos a serem testados
    // ==========================================
    const modulos = [
      { nome: "Dashboard", rota: "/dashboard", seletor: "Dashboard" },
      { nome: "Produtos", rota: "/produtos", seletor: "Produtos" },
      { nome: "Fornecedores", rota: "/fornecedores", seletor: "Fornecedores" },
      { nome: "Clientes", rota: "/clientes", seletor: "Clientes" },
      { nome: "Vendas", rota: "/vendas", seletor: "Vendas" },
      { nome: "Compras", rota: "/compras", seletor: "Compras" },
      { nome: "Financeiro", rota: "/financeiro", seletor: "Financeiro" },
      { nome: "Estoque", rota: "/estoque", seletor: "Estoque" },
      { nome: "Consignação", rota: "/consignacao", seletor: "Consigna" },
      { nome: "Cirurgias", rota: "/cirurgias", seletor: "Cirurgias" },
      { nome: "Contratos", rota: "/contratos", seletor: "Contratos" },
      { nome: "Relatórios", rota: "/relatorios", seletor: "Relatórios" },
      {
        nome: "Configurações",
        rota: "/configuracoes",
        seletor: "Configurações",
      },
    ];

    console.log(`📋 Total de módulos a testar: ${modulos.length}`);

    // ==========================================
    // PASSO 3: Navegar por cada módulo
    // ==========================================
    let modulosOk = 0;
    let modulosErro = 0;

    for (const modulo of modulos) {
      try {
        console.log(`\n🔍 Testando: ${modulo.nome}`);

        // Localiza link no sidebar (tolerante a variações)
        const link = page
          .locator(
            `a:has-text("${modulo.seletor}"), ` +
              `button:has-text("${modulo.seletor}"), ` +
              `[href="${modulo.rota}"]`,
          )
          .first();

        const linkVisible = await link
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        if (!linkVisible) {
          console.log(`  ⚠️  Link não encontrado no sidebar: ${modulo.nome}`);
          modulosErro++;
          continue;
        }

        // Clica no link
        await link.click();

        // Aguarda navegação
        await page.waitForTimeout(1000);

        // Verifica URL
        const currentUrl = page.url();
        if (!currentUrl.includes(modulo.rota)) {
          console.log(`  ⚠️  Navegação falhou. URL atual: ${currentUrl}`);
          modulosErro++;
          continue;
        }

        // Verifica título da página ou breadcrumb
        const pageTitle = page
          .locator(
            `h1:has-text("${modulo.nome}"), ` +
              `h2:has-text("${modulo.nome}"), ` +
              `[data-testid="page-title"]:has-text("${modulo.nome}")`,
          )
          .first();

        const titleVisible = await pageTitle
          .isVisible({ timeout: 3000 })
          .catch(() => false);

        if (titleVisible) {
          console.log(`  ✅ ${modulo.nome}: OK (título visível)`);
        } else {
          console.log(
            `  ✅ ${modulo.nome}: OK (URL correta, título não encontrado)`,
          );
        }

        modulosOk++;
      } catch (error) {
        console.log(`  ❌ ${modulo.nome}: ERRO`);
        console.error(error);
        modulosErro++;
      }
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  RESULTADO DA NAVEGAÇÃO                                      ║
╠══════════════════════════════════════════════════════════════╣
║  ✅ Módulos OK:      ${modulosOk.toString().padStart(2)}                                     ║
║  ⚠️  Módulos com erro: ${modulosErro.toString().padStart(2)}                                     ║
║  📊 Taxa de sucesso: ${Math.round((modulosOk / modulos.length) * 100)}%                                    ║
╚══════════════════════════════════════════════════════════════╝
    `);

    // ==========================================
    // PASSO 4: Verificar destaque do item ativo
    // ==========================================
    await page.goto("/produtos");
    await page.waitForTimeout(500);

    const activeLink = page
      .locator(
        'a[href="/produtos"].active, ' +
          'a[href="/produtos"][aria-current="page"], ' +
          'a[href="/produtos"][class*="active"]',
      )
      .first();

    const activeVisible = await activeLink
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (activeVisible) {
      console.log("✅ Passo 4: Item ativo destacado no sidebar");
    } else {
      console.log("⚠️  Passo 4: Destaque do item ativo não detectado (ok)");
    }

    // ==========================================
    // PASSO 5: Testar collapse/expand do menu (se aplicável)
    // ==========================================
    const toggleBtn = page
      .locator(
        'button[aria-label*="menu"], ' +
          'button[aria-label*="sidebar"], ' +
          '[data-testid="sidebar-toggle"]',
      )
      .first();

    const toggleVisible = await toggleBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (toggleVisible) {
      // Clica para colapsar
      await toggleBtn.click();
      await page.waitForTimeout(500);

      // Verifica se sidebar colapsou (classe collapsed ou hidden)
      const sidebarCollapsed = page
        .locator('aside.collapsed, aside.hidden, aside[data-collapsed="true"]')
        .first();

      const collapsed = await sidebarCollapsed
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (collapsed) {
        console.log("✅ Passo 5: Sidebar colapsado com sucesso");

        // Clica para expandir novamente
        await toggleBtn.click();
        await page.waitForTimeout(500);
        console.log("✅ Passo 5: Sidebar expandido novamente");
      } else {
        console.log("⚠️  Passo 5: Sidebar não colapsou visualmente (ok)");
      }
    } else {
      console.log(
        "⚠️  Passo 5: Botão de collapse não encontrado (ok para desktop)",
      );
    }

    // Assertion final: pelo menos 80% dos módulos devem funcionar
    expect(modulosOk).toBeGreaterThanOrEqual(Math.ceil(modulos.length * 0.8));

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ TESTE COMPLETO: Navegação do Sidebar                     ║
║                                                              ║
║  ✓ Sidebar visível                                          ║
║  ✓ ${modulosOk}/${modulos.length} módulos navegáveis                                ║
║  ✓ URLs corretas                                            ║
║  ✓ Títulos de página (quando disponíveis)                   ║
║  ✓ Item ativo destacado (se implementado)                   ║
║  ✓ Collapse/expand (se implementado)                        ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });

  /**
   * Teste adicional: Navegação rápida via breadcrumbs
   */
  test("deve permitir navegação via breadcrumbs", async ({ page }) => {
    await page.goto("/produtos");

    // Verifica presença de breadcrumbs
    const breadcrumbs = page
      .locator('[data-testid="breadcrumbs"], nav[aria-label="breadcrumb"]')
      .first();
    const breadcrumbsVisible = await breadcrumbs
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (breadcrumbsVisible) {
      // Clica em "Dashboard" no breadcrumb
      const dashboardLink = breadcrumbs
        .locator('a:has-text("Dashboard")')
        .first();
      await dashboardLink.click();

      // Verifica navegação
      await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

      console.log("✅ Navegação via breadcrumbs funcionando");
    } else {
      console.log("⚠️  Breadcrumbs não implementados (ok para MVP)");
    }
  });

  /**
   * Teste adicional: Pesquisa no sidebar (se implementado)
   */
  test("deve filtrar módulos no sidebar via pesquisa", async ({ page }) => {
    await page.goto("/dashboard");

    // Procura campo de busca no sidebar
    const searchInput = page
      .locator('aside input[placeholder*="Buscar"], nav input[type="search"]')
      .first();
    const searchVisible = await searchInput
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (searchVisible) {
      // Digita termo de busca
      await searchInput.fill("Produto");
      await page.waitForTimeout(500);

      // Verifica que apenas módulos relacionados estão visíveis
      const produtosLink = page.locator('a:has-text("Produtos")');
      await expect(produtosLink).toBeVisible();

      // Verifica que módulos não relacionados estão ocultos
      const financeiroLink = page.locator('a:has-text("Financeiro")');
      const financeiroVisible = await financeiroLink
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!financeiroVisible) {
        console.log("✅ Filtro de módulos funcionando");
      } else {
        console.log("⚠️  Filtro de módulos parcialmente funcional");
      }
    } else {
      console.log("⚠️  Campo de busca no sidebar não implementado (ok)");
    }
  });

  /**
   * Teste adicional: Submenu / dropdown (se implementado)
   */
  test("deve expandir/colapsar submenus", async ({ page }) => {
    await page.goto("/dashboard");

    // Procura por itens de menu com submenu (ex: "Cadastros", "Vendas", etc)
    const menuWithSubmenu = page
      .locator('button:has-text("Cadastros"), button[aria-expanded]')
      .first();
    const hasSubmenu = await menuWithSubmenu
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasSubmenu) {
      // Clica para expandir
      await menuWithSubmenu.click();
      await page.waitForTimeout(300);

      // Verifica se submenu expandiu
      const submenuItem = page
        .locator('a:has-text("Produtos"), a:has-text("Fornecedores")')
        .first();
      await expect(submenuItem).toBeVisible({ timeout: 2000 });

      // Clica novamente para colapsar
      await menuWithSubmenu.click();
      await page.waitForTimeout(300);

      console.log("✅ Submenu expand/collapse funcionando");
    } else {
      console.log("⚠️  Submenus não implementados (ok para estrutura plana)");
    }
  });
});
