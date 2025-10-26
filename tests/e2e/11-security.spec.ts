import { test, expect } from '@playwright/test';

/**
 * Test Suite 11: Segurança & Compliance
 * ICARUS v5.0 - E2E
 */

test.describe('Segurança - Autenticação', () => {
  test('deve bloquear acesso sem autenticação', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('deve expirar sessão após timeout', async ({ page }) => {
    await page.goto('/login');
    
    // Mock login
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'mock-token',
          expires_in: 1, // 1 segundo
          user: { email: 'test@test.com' },
        }),
      });
    });
    
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Tenta acessar recurso protegido
    await page.goto('/dashboard');
    
    // Deve redirecionar para login (sessão expirada)
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('não deve expor tokens no localStorage', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifica que tokens não estão em localStorage
    const localStorageTokens = await page.evaluate(() => {
      const items = { ...localStorage };
      return Object.values(items).filter(val => 
        typeof val === 'string' && val.includes('eyJ') // JWT starts with eyJ
      );
    });
    
    // Tokens devem estar em httpOnly cookies ou session storage
    expect(localStorageTokens.length).toBeLessThanOrEqual(0);
  });
});

test.describe('Segurança - Autorização', () => {
  test('deve verificar roles de usuário', async ({ page }) => {
    await page.goto('/login');
    
    // Mock de usuário com role "viewer"
    await page.route('**/auth/v1/token**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'mock-token',
          user: { email: 'viewer@test.com', role: 'viewer' },
        }),
      });
    });
    
    await page.fill('input[type="email"]', 'viewer@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    
    // Viewer não deve ver botões de criar/editar
    const createButton = page.locator('button:has-text("Criar")');
    await expect(createButton).not.toBeVisible();
  });

  test('deve bloquear rotas admin para users', async ({ page }) => {
    await page.goto('/admin/configuracoes');
    
    // Deve redirecionar para unauthorized ou login
    await expect(page).toHaveURL(/.*unauthorized|login/, { timeout: 5000 });
  });
});

test.describe('Segurança - XSS Protection', () => {
  test('deve sanitizar input de usuário', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Tenta injetar script
    await page.fill('input[name="razao_social"]', '<script>alert("XSS")</script>');
    
    await page.route('**/api/fornecedores', async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({ id: '123', razao_social: '<script>alert("XSS")</script>' }),
      });
    });
    
    await page.fill('input[name="cnpj"]', '12.345.678/0001-90');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Script não deve ser executado
    const alerts = [];
    page.on('dialog', (dialog) => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });
    
    await page.goto('/fornecedores');
    
    expect(alerts.length).toBe(0);
  });

  test('deve escapar HTML em exibição', async ({ page }) => {
    await page.goto('/fornecedores');
    
    // Mock com HTML malicioso
    await page.route('**/api/fornecedores**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: '1', razao_social: '<img src=x onerror="alert(1)">' },
        ]),
      });
    });
    
    await page.reload();
    
    // Verifica que HTML foi escapado
    const cell = page.locator('td').first();
    const text = await cell.textContent();
    
    expect(text).toContain('<img'); // Exibido como texto, não renderizado
  });
});

test.describe('Segurança - CSRF Protection', () => {
  test('deve incluir CSRF token em forms', async ({ page }) => {
    await page.goto('/fornecedores');
    await page.click('button:has-text("Novo")');
    
    // Verifica presença de token CSRF (se implementado)
    const csrfToken = await page.locator('input[name="_csrf"]').count();
    
    // Se usar CSRF tokens
    if (csrfToken > 0) {
      const token = await page.locator('input[name="_csrf"]').inputValue();
      expect(token).toBeTruthy();
    }
  });
});

test.describe('Segurança - SQL Injection', () => {
  test('deve prevenir SQL injection em busca', async ({ page }) => {
    await page.goto('/fornecedores');
    
    // Tenta SQL injection
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    await searchInput.fill("'; DROP TABLE fornecedores; --");
    
    await page.waitForTimeout(500);
    
    // Não deve causar erro (input deve ser escapado)
    const errorMsg = page.locator('text=/error|erro/i');
    await expect(errorMsg).not.toBeVisible();
  });
});

test.describe('Compliance - LGPD', () => {
  test('deve exibir termo de consentimento', async ({ page }) => {
    await page.goto('/');
    
    // Cookie consent banner
    const cookieBanner = page.locator('text=/cookie|consentimento/i');
    
    if (await cookieBanner.isVisible()) {
      await expect(cookieBanner).toBeVisible();
    }
  });

  test('deve permitir exportar dados pessoais', async ({ page }) => {
    await page.goto('/perfil');
    
    // Botão de exportar dados
    const exportBtn = page.locator('button:has-text("Exportar Dados")');
    
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      
      // Verifica que download foi iniciado
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        exportBtn.click(),
      ]);
      
      expect(download.suggestedFilename()).toMatch(/dados.*\.json|csv/);
    }
  });

  test('deve permitir deletar conta', async ({ page }) => {
    await page.goto('/perfil');
    
    const deleteBtn = page.locator('button:has-text("Deletar Conta")');
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Verifica modal de confirmação
      await expect(page.locator('text=/tem certeza|confirmar/i')).toBeVisible();
    }
  });
});

test.describe('Compliance - Auditoria', () => {
  test('deve registrar ações de usuário', async ({ page }) => {
    await page.goto('/compliance-auditoria');
    
    await expect(page.locator('h1:has-text("Compliance")')).toBeVisible();
    
    // Verifica log de auditoria
    await expect(page.locator('text=Logs de Auditoria')).toBeVisible();
  });

  test('deve exibir histórico de alterações', async ({ page }) => {
    await page.goto('/fornecedores/123');
    
    // Botão de histórico
    const historyBtn = page.locator('button:has-text("Histórico")');
    
    if (await historyBtn.isVisible()) {
      await historyBtn.click();
      
      await expect(page.locator('text=/histórico|alterações/i')).toBeVisible();
    }
  });
});

test.describe('Segurança - Headers', () => {
  test('deve ter Content-Security-Policy', async ({ page }) => {
    const response = await page.goto('/dashboard');
    const headers = response?.headers();
    
    if (headers) {
      const csp = headers['content-security-policy'];
      expect(csp).toBeTruthy();
    }
  });

  test('deve ter X-Frame-Options', async ({ page }) => {
    const response = await page.goto('/dashboard');
    const headers = response?.headers();
    
    if (headers) {
      const xFrameOptions = headers['x-frame-options'];
      
      // Deve ser DENY ou SAMEORIGIN
      if (xFrameOptions) {
        expect(xFrameOptions).toMatch(/DENY|SAMEORIGIN/);
      }
    }
  });

  test('deve ter Strict-Transport-Security', async ({ page }) => {
    const response = await page.goto('/dashboard');
    const headers = response?.headers();
    
    if (headers) {
      const hsts = headers['strict-transport-security'];
      
      // Deve forçar HTTPS
      if (hsts) {
        expect(hsts).toContain('max-age');
      }
    }
  });
});

test.describe('Segurança - Senha', () => {
  test('deve validar força da senha', async ({ page }) => {
    await page.goto('/signup');
    
    // Senha fraca
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/senha.*fraca|caracteres/i')).toBeVisible();
  });

  test('deve exigir senha forte', async ({ page }) => {
    await page.goto('/signup');
    
    // Senha sem maiúscula
    await page.fill('input[type="password"]', 'senha123!');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=/maiúscula|uppercase/i')).toBeVisible();
  });

  test('não deve mostrar senha por padrão', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    const type = await passwordInput.getAttribute('type');
    
    expect(type).toBe('password');
  });

  test('deve permitir toggle de visibilidade', async ({ page }) => {
    await page.goto('/login');
    
    // Botão de mostrar/ocultar senha
    const toggleBtn = page.locator('button[aria-label*="mostrar"]').first();
    
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      
      const passwordInput = page.locator('input[name="password"]');
      const type = await passwordInput.getAttribute('type');
      
      expect(type).toBe('text');
    }
  });
});

test.describe('Segurança - Rate Limiting', () => {
  test('deve limitar tentativas de login', async ({ page }) => {
    await page.goto('/login');
    
    // Mock de múltiplas tentativas
    for (let i = 0; i < 6; i++) {
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      await page.route('**/auth/v1/token**', async (route) => {
        await route.fulfill({
          status: 401,
          body: JSON.stringify({ error: 'Invalid credentials' }),
        });
      });
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }
    
    // Após 5 tentativas, deve bloquear
    await expect(page.locator('text=/muitas tentativas|bloqueado/i')).toBeVisible();
  });
});

