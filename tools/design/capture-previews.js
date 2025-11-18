#!/usr/bin/env node
/**
 * 📸 ICARUS v5.0 - Preview Capture Tool
 * 
 * Captura screenshots automáticos de rotas críticas em modo light/dark
 * para validação visual contínua contra o design Figma.
 * 
 * @version 2.0.0
 * @date 2025-11-18
 */

import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====================================
// CONFIGURAÇÃO
// ====================================
const CONFIG = {
  baseUrl: process.env.PREVIEW_URL || 'http://localhost:4173',
  outputDir: join(__dirname, '../../docs/design/prints'),
  viewport: {
    width: 1920,
    height: 1080
  },
  timeout: 30000,
  waitTime: 2000, // Tempo para componentes renderizarem
  
  // Rotas críticas para captura
  routes: [
    { path: '/', name: 'welcome', description: 'Página de boas-vindas' },
    { path: '/dashboard', name: 'dashboard', description: 'Dashboard principal' },
    { path: '/cirurgias', name: 'cirurgias', description: 'Gestão de Cirurgias' },
    { path: '/consignacao', name: 'consignacao', description: 'Consignação Avançada' },
    { path: '/estoque', name: 'estoque', description: 'Estoque Inteligente' },
    { path: '/financeiro', name: 'financeiro', description: 'Financeiro Avançado' },
    { path: '/cadastros', name: 'cadastros', description: 'Cadastros Inteligentes' },
    { path: '/compras', name: 'compras', description: 'Compras & Fornecedores' },
    { path: '/contratos', name: 'contratos', description: 'Gestão de Contratos' },
    { path: '/vendas', name: 'vendas', description: 'Vendas & CRM' },
    { path: '/compliance', name: 'compliance', description: 'Compliance & Auditoria' },
    { path: '/rastreabilidade', name: 'rastreabilidade', description: 'Rastreabilidade OPME' },
    { path: '/analytics', name: 'analytics', description: 'Analytics & BI' },
    { path: '/logistica', name: 'logistica', description: 'Logística Avançada' },
    { path: '/ia-central', name: 'ia-central', description: 'IA Central' },
  ],
  
  themes: ['light', 'dark']
};

// ====================================
// UTILIDADES
// ====================================
const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
};

// ====================================
// FUNÇÕES PRINCIPAIS
// ====================================

/**
 * Garante que o diretório de saída existe
 */
async function ensureOutputDir() {
  try {
    await mkdir(CONFIG.outputDir, { recursive: true });
    log.success(`Diretório de saída: ${CONFIG.outputDir}`);
  } catch (error) {
    log.error(`Erro ao criar diretório: ${error.message}`);
    throw error;
  }
}

/**
 * Alterna o tema da aplicação
 */
async function setTheme(page, theme) {
  try {
    if (theme === 'dark') {
      await page.evaluate(() => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      });
    } else {
      await page.evaluate(() => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      });
    }
    await page.waitForTimeout(500); // Aguarda transição de tema
  } catch (error) {
    log.error(`Erro ao definir tema ${theme}: ${error.message}`);
    throw error;
  }
}

/**
 * Captura screenshot de uma rota
 */
async function captureRoute(page, route, theme) {
  const url = `${CONFIG.baseUrl}${route.path}`;
  const filename = `${route.name}-${theme}.png`;
  const filepath = join(CONFIG.outputDir, filename);
  
  try {
    log.info(`Capturando: ${route.description} (${theme})`);
    
    // Navegar para a rota (usar 'load' ao invés de 'networkidle')
    await page.goto(url, { 
      waitUntil: 'load',
      timeout: CONFIG.timeout 
    });
    
    // Aguardar renderização completa
    await page.waitForTimeout(CONFIG.waitTime);
    
    // Definir tema
    await setTheme(page, theme);
    
    // Aguardar estabilização
    await page.waitForTimeout(1000);
    
    // Capturar screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true,
      animations: 'disabled'
    });
    
    log.success(`Salvo: ${filename}`);
    
    return {
      route: route.name,
      theme,
      filename,
      filepath,
      url,
      success: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    log.error(`Falha em ${route.name} (${theme}): ${error.message}`);
    return {
      route: route.name,
      theme,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Verifica se o servidor de preview está ativo
 */
async function checkServer() {
  try {
    const response = await fetch(CONFIG.baseUrl);
    if (response.ok) {
      log.success(`Servidor preview ativo: ${CONFIG.baseUrl}`);
      return true;
    }
    log.error(`Servidor retornou status ${response.status}`);
    return false;
  } catch (error) {
    log.error(`Servidor não acessível: ${error.message}`);
    log.warn(`Certifique-se de que o preview está rodando: npm run preview:start`);
    return false;
  }
}

/**
 * Executa a captura completa
 */
async function captureAll() {
  const startTime = Date.now();
  const results = [];
  
  log.info('🚀 Iniciando captura de previews...');
  log.info(`Base URL: ${CONFIG.baseUrl}`);
  log.info(`Rotas: ${CONFIG.routes.length}`);
  log.info(`Temas: ${CONFIG.themes.join(', ')}`);
  log.info(`Total de capturas: ${CONFIG.routes.length * CONFIG.themes.length}`);
  console.log('');
  
  // Verificar servidor
  const serverOk = await checkServer();
  if (!serverOk) {
    process.exit(1);
  }
  
  // Garantir diretório de saída
  await ensureOutputDir();
  
  // Iniciar navegador
  log.info('🌐 Iniciando navegador Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      deviceScaleFactor: 2, // Retina/HiDPI
    });
    
    const page = await context.newPage();
    
    // Capturar todas as combinações de rota x tema
    for (const route of CONFIG.routes) {
      for (const theme of CONFIG.themes) {
        const result = await captureRoute(page, route, theme);
        results.push(result);
      }
    }
    
    await browser.close();
    
  } catch (error) {
    log.error(`Erro durante captura: ${error.message}`);
    await browser.close();
    throw error;
  }
  
  // Gerar relatório
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('');
  log.info('📊 RELATÓRIO DE CAPTURA');
  console.log('━'.repeat(50));
  console.log(`Total: ${results.length}`);
  console.log(`✅ Sucesso: ${successful}`);
  console.log(`❌ Falhas: ${failed}`);
  console.log(`⏱️  Tempo: ${elapsed}s`);
  console.log('━'.repeat(50));
  
  // Salvar relatório JSON
  const reportPath = join(CONFIG.outputDir, `capture-report-${timestamp()}.json`);
  await writeFile(
    reportPath,
    JSON.stringify({
      timestamp: new Date().toISOString(),
      config: {
        baseUrl: CONFIG.baseUrl,
        viewport: CONFIG.viewport,
        totalRoutes: CONFIG.routes.length,
        themes: CONFIG.themes
      },
      summary: {
        total: results.length,
        successful,
        failed,
        elapsedSeconds: parseFloat(elapsed)
      },
      results
    }, null, 2)
  );
  
  log.success(`Relatório salvo: ${reportPath}`);
  
  // Retornar código de saída
  return failed === 0 ? 0 : 1;
}

// ====================================
// EXECUÇÃO
// ====================================
captureAll()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    log.error(`Erro fatal: ${error.message}`);
    console.error(error);
    process.exit(1);
  });

