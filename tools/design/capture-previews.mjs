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

const BASE_URL = process.env.PREVIEW_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.join(__dirname, '../../docs/screenshots');
const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH || '1920', 10);
const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT || '1080', 10);
const WAIT_TIMEOUT = parseInt(process.env.WAIT_TIMEOUT || '3000', 10);

// Garantir que o diretório existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Rotas e alvos de arquivo (para substituir placeholders do manual)
const ROUTES = [
  // Dashboard e Home
  { path: '/', name: 'Home', shots: [{ file: 'dashboard/dashboard-principal' }] },
  { path: '/dashboard', name: 'Dashboard', shots: [{ file: 'dashboard/dashboard-alias' }] },
  { path: '/dashboard/ia', name: 'Dashboard IA', shots: [{ file: 'dashboard/dashboard-ia' }] },
  
  // Cadastros
  { path: '/cadastros', name: 'Cadastros', shots: [{ file: 'cadastros/cadastros-dashboard' }] },
  { path: '/cadastros/medicos', name: 'Médicos', shots: [{ file: 'cadastros/cadastros-medicos' }] },
  { path: '/cadastros/hospitais', name: 'Hospitais', shots: [{ file: 'cadastros/cadastros-hospitais' }] },
  { path: '/cadastros/produtos', name: 'Produtos', shots: [{ file: 'cadastros/cadastros-produtos' }] },
  { path: '/cadastros/fornecedores', name: 'Fornecedores', shots: [{ file: 'cadastros/fornecedores' }] },
  { path: '/cadastros/convenios', name: 'Convênios', shots: [{ file: 'cadastros/convenios' }] },
  
  // Compras
  { path: '/compras/cotacoes', name: 'Cotações', shots: [
    { file: 'compras/cotacao-comparativo' },
    { file: 'compras/pedido-detalhe' }
  ]},
  { path: '/compras/pedidos', name: 'Pedidos de Compra', shots: [{ file: 'compras/pedidos-compra' }] },
  { path: '/compras/notas', name: 'Notas de Compra', shots: [
    { file: 'compras/notas-importacao' },
    { file: 'compras/notas-impostos' },
    { file: 'compras/recebimento-conferencia' }
  ]},
  { path: '/compras/pesquisa-precos', name: 'Pesquisa de Preços', shots: [{ file: 'compras/pesquisa-precos' }] },
  
  // Estoque
  { path: '/estoque', name: 'Estoque', shots: [{ file: 'estoque/estoque-dashboard' }] },
  { path: '/estoque/inventario', name: 'Inventário', shots: [{ file: 'estoque/inventario' }] },
  { path: '/estoque/lotes', name: 'Gestão de Lotes', shots: [{ file: 'estoque/lotes' }] },
  { path: '/estoque/ia', name: 'Estoque IA', shots: [{ file: 'estoque/estoque-ia' }] },
  
  // Consignação
  { path: '/consignacao', name: 'Consignação', shots: [
    { file: 'consignacao/kpis' },
    { file: 'consignacao/conferencia' },
    { file: 'consignacao/faturamento-uso' }
  ]},
  { path: '/consignacao/avancada', name: 'Consignação Avançada', shots: [{ file: 'consignacao/avancada' }] },
  
  // Cirurgias
  { path: '/cirurgias', name: 'Cirurgias', shots: [{ file: 'cirurgias/cirurgias-dashboard' }] },
  { path: '/cirurgias/procedimentos', name: 'Procedimentos', shots: [{ file: 'cirurgias/procedimentos' }] },
  
  // Financeiro
  { path: '/financeiro', name: 'Financeiro', shots: [
    { file: 'financeiro/fluxo-conciliacao' },
    { file: 'financeiro/projecao-90d' },
    { file: 'financeiro/score-inadimplencia' }
  ]},
  { path: '/financeiro/contas-pagar', name: 'Contas a Pagar', shots: [{ file: 'financeiro/contas-pagar' }] },
  { path: '/financeiro/contas-receber', name: 'Contas a Receber', shots: [{ file: 'financeiro/contas-receber' }] },
  { path: '/financeiro/dre', name: 'DRE', shots: [{ file: 'financeiro/dre' }] },
  { path: '/financeiro/ia', name: 'Financeiro IA', shots: [{ file: 'financeiro/financeiro-ia' }] },
  
  // Faturamento
  { path: '/faturamento', name: 'Faturamento', shots: [{ file: 'faturamento/faturamento-dashboard' }] },
  { path: '/faturamento/tiss', name: 'TISS', shots: [{ file: 'faturamento/tiss' }] },
  { path: '/faturamento/nfe', name: 'NF-e', shots: [{ file: 'faturamento/nfe' }] },
  
  // Compliance e Regulatório
  { path: '/compliance/anvisa', name: 'Compliance ANVISA', shots: [{ file: 'compliance/anvisa' }] },
  { path: '/compliance/abbott', name: 'Compliance Abbott', shots: [{ file: 'compliance/abbott' }] },
  { path: '/compliance/ans', name: 'Compliance ANS', shots: [{ file: 'compliance/ans' }] },
  { path: '/compliance/auditoria', name: 'Auditoria', shots: [{ file: 'compliance/auditoria' }] },
  { path: '/compliance/lgpd', name: 'LGPD', shots: [{ file: 'compliance/lgpd' }] },
  
  // CRM e Vendas
  { path: '/crm', name: 'CRM', shots: [{ file: 'crm/crm-dashboard' }] },
  { path: '/crm/propostas', name: 'Propostas', shots: [{ file: 'crm/propostas' }] },
  { path: '/crm/contratos', name: 'Contratos', shots: [{ file: 'crm/contratos' }] },
  
  // BI e Analytics
  { path: '/bi', name: 'BI Analytics', shots: [{ file: 'bi/bi-dashboard' }] },
  { path: '/bi/dashboards', name: 'Dashboards Analíticos', shots: [{ file: 'bi/dashboards-analiticos' }] },
  
  // Relatórios
  { path: '/relatorios', name: 'Relatórios', shots: [{ file: 'relatorios/relatorios-dashboard' }] },
  { path: '/relatorios/regulatorios', name: 'Relatórios Regulatórios', shots: [{ file: 'relatorios/regulatorios' }] },
  
  // Integrações
  { path: '/integracoes', name: 'Integrações', shots: [{ file: 'integracoes/integracoes-dashboard' }] },
  { path: '/integracoes/api', name: 'APIs', shots: [{ file: 'integracoes/api' }] },
  { path: '/integracoes/credenciais', name: 'Credenciais', shots: [{ file: 'integracoes/credenciais' }] },
  
  // Configurações
  { path: '/configuracoes', name: 'Configurações', shots: [{ file: 'configuracoes/configuracoes-sistema' }] },
  { path: '/configuracoes/usuarios', name: 'Usuários e Permissões', shots: [{ file: 'configuracoes/usuarios-permissoes' }] },
  { path: '/configuracoes/empresa', name: 'Dados da Empresa', shots: [{ file: 'configuracoes/empresa' }] },
];

async function captureScreenshots() {
  console.log('🎨 ICARUS v5.0 - Captura de Screenshots');
  console.log('==========================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Viewport: ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}`);
  console.log(`Wait Timeout: ${WAIT_TIMEOUT}ms`);
  console.log(`Total de rotas: ${ROUTES.length}`);
  console.log('');

  const browser = await chromium.launch({ headless: true });
  
  const stats = {
    light: { captured: 0, failed: 0 },
    dark: { captured: 0, failed: 0 }
  };
  
  try {
    // Capturar em modo LIGHT
    console.log('☀️  Capturando modo LIGHT...');
    stats.light = await captureMode(browser, 'light');
    console.log(`   ✓ ${stats.light.captured} capturas / ✗ ${stats.light.failed} falhas`);
    console.log('');
    
    // Capturar em modo DARK
    console.log('🌙 Capturando modo DARK...');
    stats.dark = await captureMode(browser, 'dark');
    console.log(`   ✓ ${stats.dark.captured} capturas / ✗ ${stats.dark.failed} falhas`);
    console.log('');
    
    const totalCaptured = stats.light.captured + stats.dark.captured;
    const totalFailed = stats.light.failed + stats.dark.failed;
    
    console.log('==========================================');
    console.log('📊 RESUMO:');
    console.log(`  ✅ Total capturado: ${totalCaptured} screenshots`);
    console.log(`  ❌ Total falhado: ${totalFailed} screenshots`);
    console.log(`  📁 Salvos em: ${OUTPUT_DIR}`);
    console.log('');
    
    // Gerar relatório
    generateReport();
    
    console.log('✅ Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante captura:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

async function captureMode(browser, mode) {
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
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
  await page.waitForTimeout(WAIT_TIMEOUT);
  
  // Aplicar modo escuro se necessário
  if (mode === 'dark') {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    await page.waitForTimeout(1000); // Aguardar transições
  }
  
  let captured = 0;
  let failed = 0;
  
  for (const route of ROUTES) {
    try {
      console.log(`  📸 ${route.name || route.path} (${mode})...`);
      
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
      await page.waitForTimeout(WAIT_TIMEOUT);
      
      // Capturar múltiplos alvos por rota
      for (const shot of route.shots) {
        const filename = `${shot.file}-${mode}.png`;
        const dir = path.dirname(path.join(OUTPUT_DIR, filename));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filepath = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: filepath, fullPage: false });
        console.log(`     ✓ Salvo: ${path.relative(OUTPUT_DIR, filepath)}`);
        captured++;
      }
      
    } catch (error) {
      console.error(`     ✗ Erro em ${route.name || route.path}: ${error.message}`);
      failed++;
    }
  }
  
  await context.close();
  
  return { captured, failed };
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

