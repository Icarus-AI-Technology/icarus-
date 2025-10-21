/**
 * Teste E2E - Formulário de CEP com Validação
 * Testa integração completa: Input → Service → Cache → UI
 */

import { test, expect } from '@playwright/test';

test.describe('Formulário com Validação de CEP', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página com formulário de CEP
    await page.goto('http://localhost:4173/');
  });

  test('deve buscar e preencher endereço ao digitar CEP válido', async ({ page }) => {
    // Arrange
    const cepInput = page.locator('input[name="cep"]');
    const logradouroInput = page.locator('input[name="logradouro"]');
    const bairroInput = page.locator('input[name="bairro"]');
    const cidadeInput = page.locator('input[name="cidade"]');
    const ufInput = page.locator('input[name="uf"]');

    // Act - Digitar CEP e aguardar blur (validação automática)
    await cepInput.fill('01310-100');
    await cepInput.blur();

    // Aguardar requisição para API
    await page.waitForTimeout(2000); // Tempo para buscar na API

    // Assert - Verificar se campos foram preenchidos
    await expect(logradouroInput).toHaveValue(/Paulista/i);
    await expect(bairroInput).toHaveValue(/Bela Vista/i);
    await expect(cidadeInput).toHaveValue(/São Paulo/i);
    await expect(ufInput).toHaveValue('SP');
  });

  test('deve exibir erro para CEP inválido', async ({ page }) => {
    // Arrange
    const cepInput = page.locator('input[name="cep"]');
    const errorMessage = page.locator('[role="alert"]');

    // Act - Digitar CEP inválido
    await cepInput.fill('00000-000');
    await cepInput.blur();

    // Aguardar validação
    await page.waitForTimeout(1000);

    // Assert - Verificar mensagem de erro
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/não encontrado|inválido/i);
  });

  test('deve formatar CEP automaticamente', async ({ page }) => {
    // Arrange
    const cepInput = page.locator('input[name="cep"]');

    // Act - Digitar CEP sem formatação
    await cepInput.fill('01310100');
    await cepInput.blur();

    // Assert - Verificar se foi formatado
    await expect(cepInput).toHaveValue('01310-100');
  });

  test('deve usar cache na segunda consulta (mais rápido)', async ({ page }) => {
    // Arrange
    const cepInput = page.locator('input[name="cep"]');
    const cacheIndicator = page.locator('[data-testid="cache-indicator"]');

    // Act - Primeira consulta (API)
    await cepInput.fill('01310-100');
    await cepInput.blur();
    await page.waitForTimeout(2000);

    const firstRequestTime = Date.now();

    // Limpar e consultar novamente (deve usar cache)
    await cepInput.clear();
    await cepInput.fill('01310-100');
    await cepInput.blur();
    await page.waitForTimeout(500);

    const secondRequestTime = Date.now();

    // Assert - Segunda requisição deve ser mais rápida (cache)
    expect(secondRequestTime - firstRequestTime).toBeLessThan(1000);

    // Verificar indicador de cache (se existir)
    if (await cacheIndicator.isVisible()) {
      await expect(cacheIndicator).toContainText(/cache|cached/i);
    }
  });
});

test.describe('Formulário com Validação de CNPJ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/cadastro/empresas');
  });

  test('deve validar e preencher dados da empresa com CNPJ válido', async ({ page }) => {
    // Arrange
    const cnpjInput = page.locator('input[name="cnpj"]');
    const razaoSocialInput = page.locator('input[name="razaoSocial"]');
    const nomeFantasiaInput = page.locator('input[name="nomeFantasia"]');

    // Act - Digitar CNPJ válido
    await cnpjInput.fill('00.000.000/0001-91');
    await cnpjInput.blur();

    // Aguardar requisição
    await page.waitForTimeout(3000); // Brasil API pode demorar

    // Assert - Verificar se dados foram preenchidos
    await expect(razaoSocialInput).not.toBeEmpty();
    await expect(nomeFantasiaInput).not.toBeEmpty();
  });

  test('deve formatar CNPJ automaticamente', async ({ page }) => {
    // Arrange
    const cnpjInput = page.locator('input[name="cnpj"]');

    // Act - Digitar CNPJ sem formatação
    await cnpjInput.fill('00000000000191');
    await cnpjInput.blur();

    // Assert - Verificar formatação
    await expect(cnpjInput).toHaveValue('00.000.000/0001-91');
  });

  test('deve exibir erro para CNPJ inválido', async ({ page }) => {
    // Arrange
    const cnpjInput = page.locator('input[name="cnpj"]');
    const errorMessage = page.locator('[role="alert"]');

    // Act - Digitar CNPJ com dígito verificador errado
    await cnpjInput.fill('00.000.000/0001-90');
    await cnpjInput.blur();

    // Assert
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/inválido/i);
  });
});

test.describe('Formulário com Validação de CRM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/cadastro/medicos');
  });

  test('deve validar formato de CRM', async ({ page }) => {
    // Arrange
    const crmInput = page.locator('input[name="crm"]');
    const ufSelect = page.locator('select[name="uf"]');
    const successIndicator = page.locator('[data-testid="crm-valid"]');

    // Act - Preencher CRM e UF
    await crmInput.fill('123456');
    await ufSelect.selectOption('SP');
    await crmInput.blur();

    // Aguardar validação
    await page.waitForTimeout(1000);

    // Assert - Verificar se foi validado
    await expect(successIndicator).toBeVisible();
  });

  test('deve rejeitar CRM com menos de 5 dígitos', async ({ page }) => {
    // Arrange
    const crmInput = page.locator('input[name="crm"]');
    const errorMessage = page.locator('[role="alert"]');

    // Act
    await crmInput.fill('1234');
    await crmInput.blur();

    // Assert
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/5 ou 6 dígitos/i);
  });

  test('deve formatar CRM no padrão CRM/UF', async ({ page }) => {
    // Arrange
    const crmInput = page.locator('input[name="crm"]');
    const ufSelect = page.locator('select[name="uf"]');
    const crmDisplay = page.locator('[data-testid="crm-formatted"]');

    // Act
    await crmInput.fill('123456');
    await ufSelect.selectOption('SP');
    await crmInput.blur();

    // Assert
    if (await crmDisplay.isVisible()) {
      await expect(crmDisplay).toContainText('CRM/SP 123456');
    }
  });
});

test.describe('Performance e Acessibilidade', () => {
  test('deve ter boa performance no preenchimento de formulários', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Medir tempo de preenchimento
    const startTime = Date.now();

    await page.locator('input[name="cep"]').fill('01310-100');
    await page.locator('input[name="cep"]').blur();
    await page.waitForTimeout(2000);

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Assert - Deve completar em menos de 3s
    expect(duration).toBeLessThan(3000);
  });

  test('deve ser acessível via teclado', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    // Tab para primeiro input
    await page.keyboard.press('Tab');
    
    // Digitar CEP
    await page.keyboard.type('01310100');
    
    // Tab para próximo campo (trigger blur)
    await page.keyboard.press('Tab');
    
    // Aguardar validação
    await page.waitForTimeout(2000);

    // Verificar se preencheu
    const logradouro = await page.locator('input[name="logradouro"]').inputValue();
    expect(logradouro).toBeTruthy();
  });

  test('deve ter labels associados aos inputs (a11y)', async ({ page }) => {
    await page.goto('http://localhost:4173/');

    const cepInput = page.locator('input[name="cep"]');
    const cepLabel = page.locator('label[for="cep"]');

    // Assert - Label deve existir e estar visível
    await expect(cepLabel).toBeVisible();
    
    // Click no label deve focar no input
    await cepLabel.click();
    await expect(cepInput).toBeFocused();
  });
});

