import { test, expect } from '@playwright/test';

test.describe('Verificação de Bypass de Login', () => {
    test('deve acessar o dashboard diretamente sem login', async ({ page }) => {
        // Capturar logs do console
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()} `));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message} `));

        console.log('Iniciando teste de bypass...');

        // 1. Acessar dashboard diretamente
        await page.goto('/dashboard');

        // 2. Verificar se carregou (não redirecionou para login)
        await expect(page).toHaveURL(/.*dashboard/);

        // 3. Verificar se o título do dashboard está visível (confirma renderização correta)
        await expect(page.getByRole('heading', { name: 'Dashboard Principal' })).toBeVisible();

        // 4. Screenshot para validação visual
        await page.screenshot({ path: 'dashboard-bypass-check.png' });

        console.log('✅ Bypass funcionando! Acesso direto ao dashboard confirmado.');
    });
});
