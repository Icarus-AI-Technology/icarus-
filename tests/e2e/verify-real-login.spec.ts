import { test, expect } from '@playwright/test';

test.describe('Verificação de Login Real', () => {
    test('deve realizar login com sucesso usando credenciais reais', async ({ page }) => {
        console.log('Iniciando teste de login real...');

        // Capturar logs do console do navegador
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()} `));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message} `));

        // 1. Acessar página de login
        await page.goto('/login');

        // 2. Preencher credenciais
        await page.fill('input[type="email"]', 'dax@newortho.com.br');
        await page.fill('input[type="password"]', 'NewOrtho@2025');

        // 3. Submeter formulário
        await page.click('button[type="submit"]');

        // 4. Verificar redirecionamento para dashboard
        // Se o RLS estiver quebrado, vai falhar aqui ou mostrar erro
        try {
            await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
            console.log('Redirecionamento para dashboard: SUCESSO');
        } catch (e) {
            console.log('Falha no redirecionamento. Verificando mensagens de erro...');
            // Tentar capturar erro visível
            const errorMsg = await page.locator('.Toastify__toast--error').textContent().catch(() => null);

            // Se não tiver toast, ver se tem mensagem de erro no formulário
            const formError = await page.locator('.text-red-500').textContent().catch(() => null);

            console.log('Mensagem de erro (Toast):', errorMsg);
            console.log('Mensagem de erro (Form):', formError);

            throw e;
        }


        // 5. Verificar que permaneceu no dashboard (não voltou para login)
        await page.waitForTimeout(2000); // Dar tempo para possíveis redirects
        await expect(page).toHaveURL(/.*dashboard/);

        console.log('✅ Login real funcionando! Usuário permaneceu autenticado.');
    });
});
