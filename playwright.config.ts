import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration - ICARUS v5.0
 * Testes E2E para OraclusX DS
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Máximo de falhas antes de parar */
  maxFailures: 5,
  
  /* Execução paralela */
  fullyParallel: true,
  
  /* Não permitir testes órfãos em CI */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-results.json' }],
    ['list'],
  ],
  
  /* Configuração global */
  use: {
    /* URL base */
    baseURL: 'http://localhost:5173',
    
    /* Screenshots em caso de falha */
    screenshot: 'only-on-failure',
    
    /* Traços em caso de falha */
    trace: 'on-first-retry',
    
    /* Video em caso de falha */
    video: 'retain-on-failure',
    
    /* Timeout de navegação */
    navigationTimeout: 10000,
    
    /* Timeout de ação */
    actionTimeout: 5000,
  },

  /* Configuração de projetos (browsers) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Servidor dev */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

