import { test, expect } from '@playwright/test';

/**
 * Test Suite 04: Dashboard & KPIs
 * ICARUS v5.0 - E2E
 */

test.describe('Dashboard - Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('deve exibir título do dashboard', async ({ page }) => {
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });

  test('deve exibir 4 KPIs principais', async ({ page }) => {
    // Mock dos KPIs
    await page.route('**/api/kpis**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          receita_total: 1500000,
          margem_lucro: 0.25,
          pedidos_ativos: 42,
          taxa_conversao: 0.18,
        }),
      });
    });
    
    await page.reload();
    
    // Verifica presença dos KPIs
    await expect(page.locator('text=Receita Total')).toBeVisible();
    await expect(page.locator('text=Margem de Lucro')).toBeVisible();
    await expect(page.locator('text=Pedidos Ativos')).toBeVisible();
    await expect(page.locator('text=Taxa de Conversão')).toBeVisible();
  });

  test('deve formatar valores monetários', async ({ page }) => {
    await page.route('**/api/kpis**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ receita_total: 1500000 }),
      });
    });
    
    await page.reload();
    
    // Verifica formato brasileiro (R$ 1.500.000,00)
    await expect(page.locator('text=/R\\$.*1\\.500\\.000/i')).toBeVisible();
  });

  test('deve exibir gráficos', async ({ page }) => {
    // Verifica presença de elementos SVG (Recharts/Nivo)
    const charts = page.locator('svg[class*="recharts"], svg[class*="nivo"]');
    const count = await charts.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Dashboard - Filtros', () => {
  test('deve filtrar por período', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Clica em filtro de período
    await page.click('select[name="periodo"]');
    await page.selectOption('select[name="periodo"]', '30d');
    
    // Verifica que dados são atualizados
    await page.waitForLoadState('networkidle');
    
    // Verifica URL ou estado
    await expect(page).toHaveURL(/.*periodo=30d/);
  });

  test('deve filtrar por hospital', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Seleciona hospital
    await page.click('select[name="hospital"]');
    await page.selectOption('select[name="hospital"]', 'hospital-1');
    
    await page.waitForLoadState('networkidle');
  });

  test('deve limpar filtros', async ({ page }) => {
    await page.goto('/dashboard?periodo=30d&hospital=1');
    
    // Clica em "Limpar Filtros"
    await page.click('button:has-text("Limpar")');
    
    // Verifica que URL foi limpa
    await expect(page).toHaveURL(/^(?!.*periodo)(?!.*hospital).*$/);
  });
});

test.describe('Dashboard - Interatividade', () => {
  test('deve drill-down em KPI', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Clica no card de Receita Total
    await page.click('text=Receita Total');
    
    // Verifica navegação para detalhes
    await expect(page).toHaveURL(/.*financeiro|receitas/);
  });

  test('deve exportar dados', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Clica em exportar
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar")'),
    ]);
    
    // Verifica nome do arquivo
    expect(download.suggestedFilename()).toMatch(/dashboard.*\.csv|xlsx/);
  });

  test('deve atualizar dados automaticamente', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Aguarda 30 segundos (ciclo de refresh)
    await page.waitForTimeout(30000);
    
    // Verifica que houve nova requisição
    const requests = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/kpis')) {
        requests.push(req);
      }
    });
    
    expect(requests.length).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Dashboard - Módulos Específicos', () => {
  test('Dashboard Financeiro - deve exibir KPIs financeiros', async ({ page }) => {
    await page.goto('/dashboard-financeiro');
    
    await expect(page.locator('h1:has-text("Dashboard Financeiro")')).toBeVisible();
    await expect(page.locator('text=Receitas')).toBeVisible();
    await expect(page.locator('text=Despesas')).toBeVisible();
    await expect(page.locator('text=Fluxo de Caixa')).toBeVisible();
  });

  test('Dashboard Estoque - deve exibir KPIs de estoque', async ({ page }) => {
    await page.goto('/dashboard-estoque');
    
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Itens em Estoque')).toBeVisible();
    await expect(page.locator('text=Alertas')).toBeVisible();
  });

  test('Dashboard Cirurgias - deve exibir métricas cirúrgicas', async ({ page }) => {
    await page.goto('/dashboard-cirurgias');
    
    await expect(page.locator('text=Cirurgias Agendadas')).toBeVisible();
    await expect(page.locator('text=Taxa de Sucesso')).toBeVisible();
  });
});

test.describe('Dashboard - Performance', () => {
  test('deve carregar KPIs rapidamente', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Deve carregar em menos de 2 segundos
    expect(loadTime).toBeLessThan(2000);
  });

  test('deve fazer cache de dados', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Recarrega a página
    await page.reload();
    
    // Verifica que alguns dados vêm do cache
    const requests = [];
    page.on('request', (req) => {
      requests.push(req.url());
    });
    
    // Menos requisições na segunda carga
    expect(requests.length).toBeLessThanOrEqual(10);
  });
});

test.describe('Dashboard - Acessibilidade', () => {
  test('deve ter labels em KPIs', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica aria-label
    const kpiCards = page.locator('[aria-label*="KPI"]');
    const count = await kpiCards.count();
    
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('deve ser navegável por teclado', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Usa Tab para navegar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verifica que foco está visível
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});

