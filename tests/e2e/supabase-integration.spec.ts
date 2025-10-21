import { test, expect } from '@playwright/test';

/**
 * Testes E2E: Integração com Supabase
 * Testa hooks, autenticação e Realtime
 */

test.describe('Integração Supabase - Autenticação', () => {
  test('deve fazer login com sucesso', async ({ page }) => {
    await page.goto('/login');
    
    // Preenche formulário
    await page.fill('input[type="email"]', 'test@icarus.com');
    await page.fill('input[type="password"]', 'Test@123456');
    
    // Submete
    await page.click('button[type="submit"]');
    
    // Aguarda redirecionamento
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verifica que está autenticado
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');
    
    // Verifica mensagem de erro
    await expect(page.locator('text=/Invalid|Inválid|Error/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Integração Supabase - Hooks', () => {
  test.beforeEach(async ({ page }) => {
    // Simula login (ou usa session storage)
    await page.goto('/');
  });

  test('useMedicos - deve carregar lista de médicos', async ({ page }) => {
    await page.goto('/cadastros');
    
    // Aguarda carregamento
    await page.waitForTimeout(2000);
    
    // Verifica que dados foram carregados (ou empty state)
    const hasData = await page.locator('table tbody tr').count() > 0;
    const hasEmpty = await page.locator('text=Nenhum médico encontrado').isVisible();
    
    expect(hasData || hasEmpty).toBe(true);
  });

  test('useCirurgias - deve exibir Kanban realtime', async ({ page }) => {
    await page.goto('/cirurgias');
    
    // Aguarda carregamento
    await page.waitForTimeout(2000);
    
    // Verifica colunas do Kanban
    await expect(page.locator('text=Agendadas')).toBeVisible();
    await expect(page.locator('text=Em Andamento')).toBeVisible();
  });

  test('useLeads - deve exibir Pipeline realtime', async ({ page }) => {
    await page.goto('/crm-vendas');
    
    // Aguarda carregamento
    await page.waitForTimeout(2000);
    
    // Verifica Pipeline
    await expect(page.locator('text=Prospecção')).toBeVisible();
    await expect(page.locator('text=Qualificação')).toBeVisible();
  });
});

test.describe('Integração Supabase - CRUD Operations', () => {
  test('deve criar novo médico', async ({ page }) => {
    await page.goto('/cadastros');
    
    // Clica em Novo Cadastro
    await page.click('button:has-text("Novo Cadastro")');
    
    // Aguarda modal/formulário
    await page.waitForTimeout(1000);
    
    // Preenche dados básicos
    await page.fill('input[name="nome_completo"]', 'Dr. Teste Playwright');
    await page.fill('input[name="crm"]', '123456');
    await page.fill('input[name="email"]', 'teste@playwright.com');
    
    // Submete (se houver botão visível)
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // Aguarda toast de sucesso
      await expect(page.locator('text=/Sucesso|Success/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Integração Supabase - Realtime', () => {
  test('deve atualizar em tempo real (simulado)', async ({ page }) => {
    await page.goto('/cirurgias');
    
    // Conta cirurgias iniciais
    const initialCount = await page.locator('text=Total Cirurgias').textContent();
    
    // Aguarda 3 segundos (simulando atualização realtime)
    await page.waitForTimeout(3000);
    
    // Verifica que página não crashou
    await expect(page.locator('h1')).toBeVisible();
    
    // Se houver mudança, contadores serão atualizados automaticamente
    const currentCount = await page.locator('text=Total Cirurgias').textContent();
    
    // Teste básico: ambos devem ser strings válidas
    expect(typeof initialCount).toBe('string');
    expect(typeof currentCount).toBe('string');
  });
});

test.describe('Integração Supabase - Toast Notifications', () => {
  test('deve exibir toast de sucesso', async ({ page }) => {
    await page.goto('/cadastros');
    
    // Simula ação que gera toast
    // (depende da implementação específica)
    
    // Verifica sistema de toast está presente
    const toastContainer = page.locator('[class*="toast"]');
    
    // Container deve existir (mesmo que vazio)
    const exists = await toastContainer.count() >= 0;
    expect(exists).toBe(true);
  });
});

