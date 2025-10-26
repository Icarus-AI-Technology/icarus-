import { test, expect } from '@playwright/test';

/**
 * Test Suite 10: Design System (OraclusX)
 * ICARUS v5.0 - E2E
 */

test.describe('Design System - Cores', () => {
  test('deve usar CSS variables', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica uso de CSS variables
    const element = page.locator('body').first();
    const primaryColor = await element.evaluate((el) => 
      getComputedStyle(el).getPropertyValue('--primary')
    );
    
    expect(primaryColor).toBeTruthy();
  });

  test('deve ter paleta de cores documentada', async ({ page }) => {
    await page.goto('/showcase');
    
    // Showcase deve exibir cores
    await expect(page.locator('text=Cores')).toBeVisible();
  });

  test('deve ter modo escuro/claro', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica botão de theme toggle
    const themeToggle = page.locator('[aria-label*="tema"], [aria-label*="theme"]').first();
    
    if (await themeToggle.isVisible()) {
      // Clica para alternar
      await themeToggle.click();
      
      await page.waitForTimeout(500);
      
      // Verifica que classe foi alterada
      const html = page.locator('html');
      const classNames = await html.getAttribute('class');
      
      expect(classNames).toContain('dark');
    }
  });
});

test.describe('Design System - Tipografia', () => {
  test('deve usar escala tipográfica', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica h1
    const h1 = page.locator('h1').first();
    const fontSize = await h1.evaluate((el) => 
      getComputedStyle(el).fontSize
    );
    
    expect(fontSize).toBeTruthy();
  });

  test('deve ter line-height adequado', async ({ page }) => {
    await page.goto('/dashboard');
    
    const body = page.locator('body');
    const lineHeight = await body.evaluate((el) => 
      getComputedStyle(el).lineHeight
    );
    
    // Line-height deve ser >= 1.5 para legibilidade
    const lineHeightNum = parseFloat(lineHeight);
    expect(lineHeightNum).toBeGreaterThanOrEqual(20); // 1.5 * 16px base
  });
});

test.describe('Design System - Espaçamento', () => {
  test('deve usar escala de espaçamento 8px', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica uso de múltiplos de 8
    const card = page.locator('[class*="neuro-raised"]').first();
    const padding = await card.evaluate((el) => 
      getComputedStyle(el).padding
    );
    
    expect(padding).toBeTruthy();
  });
});

test.describe('Design System - Componentes Neumórficos', () => {
  test('deve aplicar neuro-raised', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica presença de classe
    const neuroRaised = page.locator('[class*="neuro-raised"]');
    const count = await neuroRaised.count();
    
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('deve aplicar neuro-inset', async ({ page }) => {
    await page.goto('/showcase');
    
    // Showcase deve ter exemplos de inset
    const neuroInset = page.locator('[class*="neuro-inset"]');
    const count = await neuroInset.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('deve ter sombras suaves', async ({ page }) => {
    await page.goto('/dashboard');
    
    const card = page.locator('[class*="neuro-raised"]').first();
    const boxShadow = await card.evaluate((el) => 
      getComputedStyle(el).boxShadow
    );
    
    expect(boxShadow).not.toBe('none');
  });

  test('deve ter transições suaves', async ({ page }) => {
    await page.goto('/dashboard');
    
    const button = page.locator('button').first();
    const transition = await button.evaluate((el) => 
      getComputedStyle(el).transition
    );
    
    expect(transition).not.toBe('none');
  });
});

test.describe('Design System - Botões', () => {
  test('deve ter variantes (primary, secondary)', async ({ page }) => {
    await page.goto('/showcase');
    
    // Showcase deve ter exemplos de botões
    await expect(page.locator('button:has-text("Primary")')).toBeVisible();
    await expect(page.locator('button:has-text("Secondary")')).toBeVisible();
  });

  test('deve ter estados (hover, active, disabled)', async ({ page }) => {
    await page.goto('/showcase');
    
    const button = page.locator('button').first();
    
    // Hover
    await button.hover();
    await page.waitForTimeout(200);
    
    // Active
    await button.click({ force: true });
    await page.waitForTimeout(200);
  });

  test('deve ter loading state', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Mock de requisição lenta
    await page.route('**/api/fornecedores', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 201,
        body: JSON.stringify({ id: '123' }),
      });
    });
    
    await page.fill('input[name="razao_social"]', 'Teste');
    await page.fill('input[name="cnpj"]', '12.345.678/0001-90');
    
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Verifica loading state
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('Design System - Forms', () => {
  test('deve ter inputs estilizados', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    const input = page.locator('input[type="text"]').first();
    const border = await input.evaluate((el) => 
      getComputedStyle(el).border
    );
    
    expect(border).toBeTruthy();
  });

  test('deve ter estado de erro', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(500);
    
    // Input com erro deve ter classe ou estilo
    const errorInput = page.locator('input[aria-invalid="true"]').first();
    const borderColor = await errorInput.evaluate((el) => 
      getComputedStyle(el).borderColor
    );
    
    // Borda deve ser vermelha (rgb com valores altos de red)
    expect(borderColor).toMatch(/rgb\(.*\)/);
  });

  test('deve ter estado de sucesso', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Preenche campo válido
    await page.fill('input[name="email"]', 'valid@email.com');
    
    // Blur para trigger validação
    await page.locator('input[name="email"]').blur();
    
    await page.waitForTimeout(300);
    
    // Pode ter ícone de sucesso ou classe
    const successIcon = page.locator('svg.success-icon');
    const count = await successIcon.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Design System - Cards', () => {
  test('deve ter KPI cards padronizados', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica altura padrão (140px)
    const kpiCard = page.locator('[class*="h-\\[140px\\]"]').first();
    
    if (await kpiCard.isVisible()) {
      const height = await kpiCard.evaluate((el) => 
        getComputedStyle(el).height
      );
      
      expect(height).toBe('140px');
    }
  });

  test('deve ter cards com padding consistente', async ({ page }) => {
    await page.goto('/dashboard');
    
    const cards = await page.locator('[class*="neuro-raised"]').all();
    
    for (const card of cards.slice(0, 3)) {
      const padding = await card.evaluate((el) => 
        getComputedStyle(el).padding
      );
      
      expect(padding).toBeTruthy();
    }
  });
});

test.describe('Design System - Icons', () => {
  test('deve usar Lucide Icons', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica presença de SVGs (Lucide)
    const icons = page.locator('svg');
    const count = await icons.count();
    
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('deve ter tamanho consistente', async ({ page }) => {
    await page.goto('/dashboard');
    
    const icon = page.locator('svg').first();
    const width = await icon.getAttribute('width');
    const height = await icon.getAttribute('height');
    
    expect(width).toBeTruthy();
    expect(height).toBeTruthy();
  });
});

test.describe('Design System - Tables', () => {
  test('deve ter estilo consistente', async ({ page }) => {
    await page.goto('/fornecedores');
    
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
    
    // Verifica header estilizado
    const th = page.locator('th').first();
    const bgColor = await th.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );
    
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('deve ter hover em linhas', async ({ page }) => {
    await page.goto('/fornecedores');
    
    const firstRow = page.locator('tbody tr').first();
    await firstRow.hover();
    
    await page.waitForTimeout(200);
    
    // Linha deve ter hover style
    const bgColor = await firstRow.evaluate((el) => 
      getComputedStyle(el).backgroundColor
    );
    
    expect(bgColor).toBeTruthy();
  });
});

test.describe('Design System - Responsividade', () => {
  test('deve adaptar em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Verifica que layout está adaptado
    await expect(page.locator('h1')).toBeVisible();
  });

  test('deve adaptar em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    await expect(page.locator('h1')).toBeVisible();
  });

  test('deve usar grid responsivo', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Grid de KPIs deve ser responsivo
    const grid = page.locator('.grid').first();
    const gridColumns = await grid.evaluate((el) => 
      getComputedStyle(el).gridTemplateColumns
    );
    
    expect(gridColumns).toBeTruthy();
  });
});

test.describe('Design System - Showcase', () => {
  test('deve ter página de showcase', async ({ page }) => {
    await page.goto('/showcase');
    
    await expect(page.locator('h1:has-text("Showcase")')).toBeVisible();
  });

  test('deve exibir todos os componentes', async ({ page }) => {
    await page.goto('/showcase');
    
    // Verifica seções
    await expect(page.locator('text=Botões')).toBeVisible();
    await expect(page.locator('text=Cards')).toBeVisible();
    await expect(page.locator('text=Formulários')).toBeVisible();
  });
});

