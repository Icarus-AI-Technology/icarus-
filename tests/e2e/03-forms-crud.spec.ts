import { test, expect } from '@playwright/test';

/**
 * Test Suite 03: Forms & CRUD
 * ICARUS v5.0 - E2E
 */

test.describe('CRUD - Fornecedores', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fornecedores');
  });

  test('deve listar fornecedores', async ({ page }) => {
    await expect(page.locator('h1:has-text("Fornecedores")')).toBeVisible();
    
    // Verifica presença de tabela
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('deve abrir modal de criação', async ({ page }) => {
    // Clica em "Novo Fornecedor"
    await page.click('button:has-text("Novo")');
    
    // Verifica modal
    await expect(page.locator('h2:has-text("Novo Fornecedor")')).toBeVisible();
    
    // Verifica campos
    await expect(page.locator('input[name="razao_social"]')).toBeVisible();
    await expect(page.locator('input[name="cnpj"]')).toBeVisible();
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.click('button:has-text("Novo")');
    
    // Tenta salvar sem preencher
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    // Verifica mensagens de erro
    const errors = page.locator('text=/obrigat/i');
    await expect(errors.first()).toBeVisible({ timeout: 3000 });
  });

  test('deve criar fornecedor (mock)', async ({ page }) => {
    await page.click('button:has-text("Novo")');
    
    // Preenche formulário
    await page.fill('input[name="razao_social"]', 'Fornecedor Teste LTDA');
    await page.fill('input[name="cnpj"]', '12.345.678/0001-90');
    await page.fill('input[name="email"]', 'contato@fornecedor.com');
    
    // Mock da API
    await page.route('**/api/fornecedores', async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({ id: '123', razao_social: 'Fornecedor Teste LTDA' }),
      });
    });
    
    await page.click('button[type="submit"]:has-text("Salvar")');
    
    // Verifica toast de sucesso
    await expect(page.locator('text=/criado com sucesso/i')).toBeVisible({ timeout: 3000 });
  });

  test('deve editar fornecedor', async ({ page }) => {
    // Mock da lista
    await page.route('**/api/fornecedores**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', razao_social: 'Fornecedor A', cnpj: '11.111.111/0001-11' },
        ]),
      });
    });
    
    await page.reload();
    
    // Clica em editar (primeiro item)
    await page.click('[data-action="edit"]').catch(() => {
      // Fallback: clica no ícone de editar
      return page.click('button[title="Editar"]').first();
    });
    
    // Verifica modal de edição
    await expect(page.locator('h2:has-text("Editar Fornecedor")')).toBeVisible({ timeout: 3000 });
  });

  test('deve deletar fornecedor (com confirmação)', async ({ page }) => {
    await page.route('**/api/fornecedores**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', razao_social: 'Fornecedor A', cnpj: '11.111.111/0001-11' },
        ]),
      });
    });
    
    await page.reload();
    
    // Clica em deletar
    await page.click('[data-action="delete"]').catch(() => {
      return page.click('button[title="Deletar"]').first();
    });
    
    // Verifica modal de confirmação
    await expect(page.locator('text=/tem certeza|confirmar/i')).toBeVisible({ timeout: 3000 });
    
    // Confirma deleção
    await page.click('button:has-text("Confirmar")');
    
    // Verifica toast de sucesso
    await expect(page.locator('text=/removido com sucesso/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Forms - Validação Zod', () => {
  test('deve validar CNPJ', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    await page.fill('input[name="cnpj"]', '12345678901234'); // CNPJ inválido
    await page.fill('input[name="razao_social"]', 'Teste');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/CNPJ.*inválido/i')).toBeVisible({ timeout: 3000 });
  });

  test('deve validar email', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="razao_social"]', 'Teste');
    await page.fill('input[name="cnpj"]', '12.345.678/0001-90');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/email.*válido/i')).toBeVisible({ timeout: 3000 });
  });

  test('deve validar telefone', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    await page.fill('input[name="telefone"]', '123'); // Telefone inválido
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/telefone.*inválido/i')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Forms - Auto-fill APIs', () => {
  test('deve buscar dados por CNPJ (Brasil API)', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Mock da Brasil API
    await page.route('**/brasilapi.com.br/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          razao_social: 'EMPRESA LTDA',
          nome_fantasia: 'Empresa',
          email: 'contato@empresa.com',
        }),
      });
    });
    
    await page.fill('input[name="cnpj"]', '12.345.678/0001-90');
    await page.click('button:has-text("Buscar")');
    
    // Aguarda auto-fill
    await page.waitForTimeout(1000);
    
    const razaoSocial = await page.locator('input[name="razao_social"]').inputValue();
    expect(razaoSocial).toBe('EMPRESA LTDA');
  });

  test('deve buscar endereço por CEP', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Mock da API de CEP
    await page.route('**/viacep.com.br/**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          logradouro: 'Rua Teste',
          bairro: 'Centro',
          localidade: 'São Paulo',
          uf: 'SP',
        }),
      });
    });
    
    await page.fill('input[name="cep"]', '01310-100');
    await page.click('button:has-text("Buscar CEP")');
    
    await page.waitForTimeout(1000);
    
    const logradouro = await page.locator('input[name="logradouro"]').inputValue();
    expect(logradouro).toBe('Rua Teste');
  });
});

test.describe('Forms - Multi-step', () => {
  test('deve navegar entre steps', async ({ page }) => {
    await page.goto('/cadastro-cirurgia');
    
    // Step 1: Dados básicos
    await expect(page.locator('text=Dados Básicos')).toBeVisible();
    await page.fill('input[name="paciente"]', 'João Silva');
    await page.click('button:has-text("Próximo")');
    
    // Step 2: Materiais
    await expect(page.locator('text=Materiais')).toBeVisible();
    await page.click('button:has-text("Voltar")');
    
    // Volta para step 1
    await expect(page.locator('text=Dados Básicos')).toBeVisible();
  });

  test('deve validar antes de avançar step', async ({ page }) => {
    await page.goto('/cadastro-cirurgia');
    
    // Tenta avançar sem preencher
    await page.click('button:has-text("Próximo")');
    
    // Verifica que permanece no step 1
    await expect(page.locator('text=/campo.*obrigat/i')).toBeVisible();
  });
});

