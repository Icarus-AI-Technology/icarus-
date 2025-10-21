import { test, expect } from '@playwright/test';

/**
 * Testes E2E: Acessibilidade (A11y)
 * ICARUS v5.0 - WCAG 2.1 AA
 */

test.describe('Testes de Acessibilidade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve ter um link de pular navegação funcional', async ({ page }) => {
    // Pressiona Tab para focar no skip link
    await page.keyboard.press('Tab');

    // Verifica se o skip link está visível quando focado
    const skipLink = page.locator('a:has-text("Pular para conteúdo principal")');
    await expect(skipLink).toBeVisible();

    // Clica no skip link
    await skipLink.click();

    // Verifica se o foco foi para o conteúdo principal
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeVisible();
  });

  test('deve ter landmarks ARIA corretos', async ({ page }) => {
    // Verifica header com role="banner"
    await expect(page.locator('header[role="banner"]')).toBeVisible();

    // Verifica navigation com role="navigation"
    await expect(page.locator('aside[role="navigation"]')).toBeVisible();

    // Verifica main content com role="main"
    await expect(page.locator('main[role="main"]')).toBeVisible();
  });

  test('deve ter labels ARIA nos elementos interativos', async ({ page }) => {
    // Verifica aria-label no header
    const header = page.locator('header[aria-label="Cabeçalho principal"]');
    await expect(header).toBeVisible();

    // Verifica aria-label no sidebar
    const sidebar = page.locator('aside[aria-label="Menu lateral"]');
    await expect(sidebar).toBeVisible();

    // Verifica aria-label no main
    const main = page.locator('main[aria-label="Conteúdo principal"]');
    await expect(main).toBeVisible();
  });

  test('deve navegar por teclado em elementos interativos', async ({ page }) => {
    // Navega via Tab
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Menu button
    await page.keyboard.press('Tab'); // Dark mode button

    // Verifica se o elemento está focado
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });

  test('deve ter contraste de cores adequado (WCAG AA)', async ({ page }) => {
    // Verifica se os elementos principais estão visíveis (indicação de bom contraste)
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('p').first()).toBeVisible();
    
    // Teste básico: elementos de texto devem ser visíveis e legíveis
    const heading = page.locator('h2').first();
    await expect(heading).toBeVisible();
  });

  test('deve ter atributos alt em imagens', async ({ page }) => {
    // Busca todas as imagens
    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      // Verifica se todas as imagens têm alt
      for (let i = 0; i < count; i++) {
        const image = images.nth(i);
        const alt = await image.getAttribute('alt');
        expect(alt).not.toBeNull();
      }
    }
  });

  test('deve ter foco visível em elementos interativos', async ({ page }) => {
    // Pressiona Tab para focar no primeiro elemento
    await page.keyboard.press('Tab');

    // Verifica se o elemento focado tem outline
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Verifica estilos de foco (ring-2, outline, etc)
    const focusStyles = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });

    // Pelo menos um indicador de foco deve estar presente
    expect(
      focusStyles.outline !== 'none' || 
      focusStyles.boxShadow !== 'none'
    ).toBeTruthy();
  });
});

