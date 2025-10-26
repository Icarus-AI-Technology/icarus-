import { test, expect } from '@playwright/test';

/**
 * Test Suite 02: Navegação
 * ICARUS v5.0 - E2E
 */

test.describe('Navegação - Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('deve exibir sidebar com categorias', async ({ page }) => {
    // Verifica presença da sidebar
    const sidebar = page.locator('[class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
    
    // Verifica categorias principais
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
    await expect(page.locator('text=Estoque')).toBeVisible();
  });

  test('deve expandir/recolher categorias', async ({ page }) => {
    const financeiroBtn = page.locator('text=Financeiro').first();
    await financeiroBtn.click();
    
    // Aguarda subcategorias aparecerem
    await expect(page.locator('text=Contas a Pagar')).toBeVisible({ timeout: 3000 });
    
    // Clica novamente para recolher
    await financeiroBtn.click();
    await expect(page.locator('text=Contas a Pagar')).not.toBeVisible({ timeout: 3000 });
  });

  test('deve navegar para módulos via sidebar', async ({ page }) => {
    // Expande Financeiro
    await page.click('text=Financeiro');
    
    // Clica em Contas a Pagar
    await page.click('text=Contas a Pagar');
    
    // Verifica URL
    await expect(page).toHaveURL(/.*contas-pagar/, { timeout: 5000 });
    
    // Verifica título do módulo
    await expect(page.locator('h1:has-text("Contas a Pagar")')).toBeVisible();
  });

  test('deve destacar item ativo na sidebar', async ({ page }) => {
    await page.goto('/estoque');
    
    // Verifica que "Estoque" está ativo/destacado
    const estoqueLink = page.locator('a[href*="estoque"]').first();
    await expect(estoqueLink).toHaveClass(/active|selected/);
  });
});

test.describe('Navegação - TopBar', () => {
  test('deve exibir topbar com user info', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica presença do avatar/nome do usuário
    const userAvatar = page.locator('[class*="avatar"]').first();
    await expect(userAvatar).toBeVisible({ timeout: 3000 });
  });

  test('deve abrir menu de usuário', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Clica no avatar
    const userBtn = page.locator('[class*="avatar"]').first();
    await userBtn.click();
    
    // Verifica menu dropdown
    await expect(page.locator('text=Perfil')).toBeVisible();
    await expect(page.locator('text=Sair')).toBeVisible();
  });

  test('deve fazer logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Abre menu de usuário
    await page.click('[class*="avatar"]');
    
    // Clica em Sair
    await page.click('text=Sair');
    
    // Aguarda redirecionamento para login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('deve exibir notificações', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica ícone de notificações
    const notificationIcon = page.locator('[class*="bell"]').first();
    await expect(notificationIcon).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Navegação - Breadcrumbs', () => {
  test('deve exibir breadcrumbs em módulos', async ({ page }) => {
    await page.goto('/contas-pagar');
    
    // Verifica presença de breadcrumbs
    const breadcrumb = page.locator('[class*="breadcrumb"]').first();
    await expect(breadcrumb).toBeVisible({ timeout: 3000 });
    
    // Verifica links
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
  });

  test('deve navegar via breadcrumbs', async ({ page }) => {
    await page.goto('/contas-pagar');
    
    // Clica em Home no breadcrumb
    await page.click('a:has-text("Home")');
    
    // Verifica navegação
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });
});

test.describe('Navegação - Deep Links', () => {
  test('deve acessar módulos via URL direta', async ({ page }) => {
    await page.goto('/cirurgias');
    
    await expect(page.locator('h1:has-text("Cirurgias")')).toBeVisible();
  });

  test('deve preservar query params', async ({ page }) => {
    await page.goto('/estoque?filtro=baixo-estoque');
    
    // Verifica que URL mantém params
    await expect(page).toHaveURL(/.*filtro=baixo-estoque/);
  });

  test('deve redirecionar 404 para NotFound', async ({ page }) => {
    await page.goto('/pagina-inexistente');
    
    await expect(page.locator('text=/404|não encontrada/i')).toBeVisible();
  });
});

test.describe('Navegação - Mobile', () => {
  test('deve exibir menu hamburguer em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Verifica botão de menu
    const menuBtn = page.locator('[class*="hamburger"]').first();
    await expect(menuBtn).toBeVisible({ timeout: 3000 });
  });

  test('deve abrir sidebar mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Clica no menu hamburguer
    await page.click('[class*="hamburger"]');
    
    // Verifica sidebar
    await expect(page.locator('text=Financeiro')).toBeVisible();
  });
});

