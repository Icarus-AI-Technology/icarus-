/**
 * E2E Tests - Autenticação e Login
 * Framework: Playwright
 * 
 * COBERTURA:
 * ✅ Login com credenciais válidas
 * ✅ Erro em login com credenciais inválidas
 * ✅ Redirecionamento para dashboard após login
 * ✅ Logout funcional
 * ✅ Persistência de sessão
 * ✅ Proteção de rotas privadas
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';
const TEST_USER = {
  email: 'dax@newortho.com.br',
  password: process.env.TEST_USER_PASSWORD || 'admin123',
};

test.describe('Autenticação - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('deve carregar página de login com todos os elementos', async ({ page }) => {
    // Verifica título da página
    await expect(page).toHaveTitle(/ICARUS|Login/i);

    // Verifica elementos do formulário
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();

    // Verifica link para signup
    await expect(page.getByText(/criar conta|cadastrar/i)).toBeVisible();
  });

  test('deve exibir erro ao tentar login com credenciais inválidas', async ({ page }) => {
    // Preenche formulário com credenciais inválidas
    await page.locator('input[type="email"]').fill('usuario@invalido.com');
    await page.locator('input[type="password"]').fill('senhaerrada123');
    
    // Clica no botão de login
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Aguarda mensagem de erro
    await expect(page.getByText(/credenciais inválidas|erro|falhou/i)).toBeVisible({ timeout: 5000 });

    // Não deve redirecionar
    await expect(page).toHaveURL(/\/login/);
  });

  test('deve fazer login com sucesso e redirecionar para dashboard', async ({ page }) => {
    // Preenche formulário com credenciais válidas
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    
    // Clica no botão de login
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Aguarda redirecionamento para dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verifica URL
    expect(page.url()).toContain('/dashboard');

    // Verifica elementos do dashboard
    await expect(page.getByText(/dashboard|painel/i)).toBeVisible({ timeout: 5000 });
  });

  test('deve persistir sessão após reload', async ({ page }) => {
    // Faz login
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Aguarda dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Recarrega página
    await page.reload();

    // Deve continuar no dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/dashboard|painel/i)).toBeVisible();
  });

  test('deve proteger rotas privadas quando não autenticado', async ({ page }) => {
    // Tenta acessar rota privada sem autenticação
    await page.goto(`${BASE_URL}/dashboard`);

    // Deve redirecionar para login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Autenticação - Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Faz login antes de cada teste
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').fill(TEST_USER.email);
    await page.locator('input[type="password"]').fill(TEST_USER.password);
    await page.getByRole('button', { name: /entrar|login/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test('deve fazer logout com sucesso', async ({ page }) => {
    // Clica no botão de logout (pode estar em menu dropdown)
    const logoutButton = page.getByRole('button', { name: /sair|logout/i });
    
    // Se estiver em dropdown, clica no avatar/menu primeiro
    if (!await logoutButton.isVisible()) {
      await page.click('[aria-label="Menu do usuário"], [data-testid="user-menu"]');
    }

    await logoutButton.click();

    // Aguarda redirecionamento para login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');

    // Tenta acessar dashboard novamente
    await page.goto(`${BASE_URL}/dashboard`);

    // Deve redirecionar para login
    await page.waitForURL(/\/login/, { timeout: 5000 });
  });
});

test.describe('Autenticação - Signup', () => {
  test('deve carregar página de cadastro', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);

    // Verifica elementos do formulário
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /cadastrar|criar conta/i })).toBeVisible();
  });
});

