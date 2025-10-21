/**
 * ICARUS v5.0 - Captura Automatizada de Screenshots
 * Captura telas em modo claro e escuro para validação visual
 * 
 * Uso: node tools/design/capture-previews.mjs
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:3002';
const OUTPUT_DIR = path.join(__dirname, '../../docs/design/prints');

// Garantir que o diretório existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ROUTES = [
  { path: '/', name: 'dashboard-principal' },
  { path: '/dashboard', name: 'dashboard-alias' },
  { path: '/cadastros', name: 'cadastros-dashboard' },
  { path: '/cadastros/medicos', name: 'cadastros-medicos' },
  { path: '/cadastros/hospitais', name: 'cadastros-hospitais' },
  { path: '/cadastros/produtos', name: 'cadastros-produtos' },
  { path: '/compras/cotacoes', name: 'compras-cotacoes' },
];

async function captureScreenshots() {
  console.log('🎨 ICARUS v5.0 - Captura de Screenshots');
  console.log('==========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  
  try {
    // Capturar em modo LIGHT
    console.log('☀️  Capturando modo LIGHT...');
    await captureMode(browser, 'light');
    
    // Capturar em modo DARK
    console.log('🌙 Capturando modo DARK...');
    await captureMode(browser, 'dark');
    
    console.log('');
    console.log('✅ Capturas concluídas com sucesso!');
    console.log(`📁 Arquivos salvos em: ${OUTPUT_DIR}`);
    
    // Gerar relatório
    generateReport();
    
  } catch (error) {
    console.error('❌ Erro durante captura:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function captureMode(browser, mode) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    colorScheme: mode === 'dark' ? 'dark' : 'light',
  });
  
  const page = await context.newPage();
  
  // Aguardar carregamento inicial
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (e) {
    console.log('     ⚠️  Usando carregamento alternativo...');
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 10000 });
  }
  
  // Aguardar renderização inicial
  await page.waitForTimeout(2000);
  
  // Aplicar modo escuro se necessário
  if (mode === 'dark') {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000); // Aguardar transições
  }
  
  for (const route of ROUTES) {
    try {
      console.log(`  📸 ${route.name} (${mode})...`);
      
      try {
        await page.goto(`${BASE_URL}${route.path}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
      } catch (e) {
        await page.goto(`${BASE_URL}${route.path}`, { 
          waitUntil: 'load',
          timeout: 10000 
        });
      }
      
      // Aguardar animações e renderização
      await page.waitForTimeout(2000);
      
      // Capturar screenshot
      const filename = `${route.name}-${mode}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: false, // Viewport apenas
      });
      
      console.log(`     ✓ Salvo: ${filename}`);
      
    } catch (error) {
      console.error(`     ✗ Erro em ${route.name}: ${error.message}`);
    }
  }
  
  await context.close();
}

function generateReport() {
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.png'))
    .sort();
  
  const timestamp = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  
  let report = `# 📸 Capturas de Tela - ICARUS v5.0\n\n`;
  report += `**Data**: ${timestamp}  \n`;
  report += `**Total de imagens**: ${files.length}  \n`;
  report += `**Modos**: Light + Dark  \n\n`;
  report += `---\n\n`;
  
  // Agrupar por rota
  const routes = {};
  files.forEach(file => {
    const parts = file.replace('.png', '').split('-');
    const mode = parts.pop(); // último elemento é o modo (light/dark)
    const name = parts.join('-');
    const routeName = name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (!routes[name]) {
      routes[name] = { name: routeName, light: null, dark: null };
    }
    
    if (mode === 'light') routes[name].light = file;
    if (mode === 'dark') routes[name].dark = file;
  });
  
  Object.values(routes).forEach(route => {
    report += `## ${route.name}\n\n`;
    
    if (route.light) {
      report += `### Modo Claro\n`;
      report += `![${route.name} - Light](../prints/${route.light})\n\n`;
    }
    
    if (route.dark) {
      report += `### Modo Escuro\n`;
      report += `![${route.name} - Dark](../prints/${route.dark})\n\n`;
    }
    
    report += `---\n\n`;
  });
  
  const reportPath = path.join(__dirname, '../../docs/design/previews/screenshots-report.md');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📄 Relatório gerado: ${reportPath}`);
}

// Executar
captureScreenshots().catch(console.error);

