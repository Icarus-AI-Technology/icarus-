import { test, expect } from '@playwright/test';

/**
 * Testes E2E: Módulos Core
 * ICARUS v5.0 - Cirurgias, Financeiro, CRM
 */

test.describe('Módulos Core', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve navegar para o módulo Cirurgias', async ({ page }) => {
    // Clica no link Cirurgias
    await page.click('text=Cirurgias');

    // Aguarda navegação
    await page.waitForURL('**/cirurgias');

    // Verifica título
    await expect(page.locator('h2:has-text("Cirurgias & Procedimentos")')).toBeVisible();

    // Verifica se o Kanban está visível
    await expect(page.locator('text=Agendadas')).toBeVisible();
    await expect(page.locator('text=Pré-Cirúrgico')).toBeVisible();
    await expect(page.locator('text=Em Andamento')).toBeVisible();
  });

  test('deve navegar para o módulo Financeiro', async ({ page }) => {
    // Clica no link Financeiro
    await page.click('text=Financeiro');

    // Aguarda navegação
    await page.waitForURL('**/financeiro');

    // Verifica título
    await expect(page.locator('h2:has-text("Financeiro Avançado")')).toBeVisible();

    // Verifica KPIs
    await expect(page.locator('text=Receitas')).toBeVisible();
    await expect(page.locator('text=Despesas')).toBeVisible();
    await expect(page.locator('text=Saldo')).toBeVisible();
  });

  test('deve navegar para o módulo CRM & Vendas', async ({ page }) => {
    // Clica no link CRM
    await page.click('text=CRM & Vendas');

    // Aguarda navegação
    await page.waitForURL('**/crm-vendas');

    // Verifica título
    await expect(page.locator('h2:has-text("CRM & Vendas")')).toBeVisible();

    // Verifica pipeline
    await expect(page.locator('text=Pipeline Total')).toBeVisible();
    await expect(page.locator('text=Prospecção')).toBeVisible();
    await expect(page.locator('text=Qualificação')).toBeVisible();
  });

  test('deve exibir tabs de navegação nos módulos', async ({ page }) => {
    // Navega para Cirurgias
    await page.goto('/cirurgias');

    // Verifica tabs
    await expect(page.locator('text=Kanban')).toBeVisible();
    await expect(page.locator('text=Calendário')).toBeVisible();
    await expect(page.locator('text=Relatórios')).toBeVisible();
  });

  test('deve alternar entre tabs no módulo Financeiro', async ({ page }) => {
    // Navega para Financeiro
    await page.goto('/financeiro');

    // Clica na tab DDA
    await page.click('text=DDA Bancário');
    await page.waitForTimeout(300);

    // Verifica conteúdo da tab
    await expect(page.locator('h3:has-text("DDA Bancário")')).toBeVisible();

    // Clica na tab NFe
    await page.click('text=NFe/SEFAZ');
    await page.waitForTimeout(300);

    // Verifica conteúdo da tab
    await expect(page.locator('h3:has-text("NFe e SEFAZ")')).toBeVisible();
  });
});

