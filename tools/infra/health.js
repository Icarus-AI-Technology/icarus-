#!/usr/bin/env node

/**
 * 🏥 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3 - Healthcheck
 * 
 * Valida saúde da infraestrutura:
 * - ICARUS_WEB_URL (preview/dev)
 * - Supabase (URL, ANON_KEY, SERVICE_ROLE_KEY)
 * - Meilisearch (se configurado)
 * - Conectividade e responsividade
 * 
 * @version 3.0.0
 * @date 2025-10-20
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');
const DOCS_INFRA_DIR = path.join(PROJECT_ROOT, 'docs/infra');

// ======================================
// 🔧 CONFIGURAÇÃO
// ======================================

const CONFIG = {
  ICARUS_WEB_URL: process.env.ICARUS_WEB_URL || process.env.PREVIEW_URL || 'http://localhost:4173',
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  MEILISEARCH_HOST: process.env.VITE_MEILISEARCH_HOST || process.env.MEILISEARCH_HOST || '',
  MEILISEARCH_KEY: process.env.VITE_MEILISEARCH_ADMIN_KEY || process.env.MEILISEARCH_ADMIN_KEY || ''
};

// ======================================
// 🧰 UTILITÁRIOS
// ======================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function httpCheck(url, timeout = 5000) {
  return new Promise((resolve) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      resolve({
        success: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage
      });
      res.resume(); // consume response
    });
    
    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Timeout'
      });
    });
  });
}

// ======================================
// 🧪 HEALTHCHECKS
// ======================================

async function checkIcarusWeb() {
  console.log('\n🌐 ICARUS WEB (Preview/Dev)...');
  
  const url = CONFIG.ICARUS_WEB_URL;
  
  if (!url) {
    return {
      name: 'ICARUS_WEB_URL',
      status: '❌ FALHA',
      message: 'URL não configurada',
      priority: 'CRÍTICA'
    };
  }
  
  console.log(`   Testando: ${url}`);
  const result = await httpCheck(url, 10000);
  
  if (result.success) {
    return {
      name: 'ICARUS_WEB_URL',
      url,
      status: '✅ OK',
      statusCode: result.statusCode,
      message: 'Frontend acessível',
      priority: 'OK'
    };
  } else {
    return {
      name: 'ICARUS_WEB_URL',
      url,
      status: '❌ FALHA',
      error: result.error || `HTTP ${result.statusCode}`,
      message: 'Frontend não acessível - verifique se o preview está rodando',
      priority: 'CRÍTICA',
      action: 'Executar: npm run preview:start'
    };
  }
}

async function checkSupabase() {
  console.log('\n🗄️  SUPABASE...');
  
  const checks = [];
  
  // 1. URL
  if (!CONFIG.SUPABASE_URL) {
    checks.push({
      name: 'SUPABASE_URL',
      status: '❌ AUSENTE',
      message: 'Variável de ambiente não definida',
      priority: 'CRÍTICA',
      action: 'Definir VITE_SUPABASE_URL no .env'
    });
  } else {
    console.log(`   URL: ${CONFIG.SUPABASE_URL}`);
    const result = await httpCheck(`${CONFIG.SUPABASE_URL}/rest/v1/`, 10000);
    
    if (result.success || result.statusCode === 401) {
      // 401 é esperado sem autenticação
      checks.push({
        name: 'SUPABASE_URL',
        url: CONFIG.SUPABASE_URL,
        status: '✅ OK',
        statusCode: result.statusCode,
        message: 'API acessível',
        priority: 'OK'
      });
    } else {
      checks.push({
        name: 'SUPABASE_URL',
        url: CONFIG.SUPABASE_URL,
        status: '❌ FALHA',
        error: result.error || `HTTP ${result.statusCode}`,
        message: 'API não acessível',
        priority: 'CRÍTICA'
      });
    }
  }
  
  // 2. ANON_KEY
  if (!CONFIG.SUPABASE_ANON_KEY) {
    checks.push({
      name: 'SUPABASE_ANON_KEY',
      status: '❌ AUSENTE',
      message: 'Variável de ambiente não definida',
      priority: 'CRÍTICA',
      action: 'Definir VITE_SUPABASE_ANON_KEY no .env'
    });
  } else {
    checks.push({
      name: 'SUPABASE_ANON_KEY',
      status: '✅ OK',
      length: CONFIG.SUPABASE_ANON_KEY.length,
      message: 'Chave pública configurada',
      priority: 'OK'
    });
  }
  
  // 3. SERVICE_ROLE_KEY (opcional mas recomendado para scripts)
  if (!CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
    checks.push({
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      status: '⚠️  AUSENTE',
      message: 'Chave de serviço não configurada (opcional)',
      priority: 'BAIXA',
      action: 'Definir SUPABASE_SERVICE_ROLE_KEY para scripts backend'
    });
  } else {
    checks.push({
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      status: '✅ OK',
      length: CONFIG.SUPABASE_SERVICE_ROLE_KEY.length,
      message: 'Chave de serviço configurada',
      priority: 'OK'
    });
  }
  
  return checks;
}

async function checkMeilisearch() {
  console.log('\n🔍 MEILISEARCH...');
  
  if (!CONFIG.MEILISEARCH_HOST) {
    return [{
      name: 'MEILISEARCH',
      status: '⚠️  NÃO CONFIGURADO',
      message: 'Serviço de busca não configurado (opcional)',
      priority: 'BAIXA',
      action: 'Configurar VITE_MEILISEARCH_HOST se quiser busca avançada'
    }];
  }
  
  console.log(`   Host: ${CONFIG.MEILISEARCH_HOST}`);
  const result = await httpCheck(`${CONFIG.MEILISEARCH_HOST}/health`, 10000);
  
  if (result.success) {
    return [{
      name: 'MEILISEARCH',
      host: CONFIG.MEILISEARCH_HOST,
      status: '✅ OK',
      statusCode: result.statusCode,
      message: 'Serviço de busca acessível',
      priority: 'OK'
    }];
  } else {
    return [{
      name: 'MEILISEARCH',
      host: CONFIG.MEILISEARCH_HOST,
      status: '❌ FALHA',
      error: result.error || `HTTP ${result.statusCode}`,
      message: 'Serviço de busca não acessível',
      priority: 'MÉDIA',
      action: 'Verificar se Meilisearch está rodando'
    }];
  }
}

// ======================================
// 📝 RELATÓRIO
// ======================================

function generateMarkdownReport(allChecks) {
  console.log('\n📝 GERANDO RELATÓRIO...\n');
  
  const timestamp = new Date().toISOString();
  let md = `# 🏥 Healthcheck - ICARUS v5.0\n\n`;
  md += `**AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3**\n\n`;
  md += `📅 Data: ${timestamp}\n\n`;
  md += `---\n\n`;
  
  // Sumário
  const stats = {
    total: allChecks.length,
    ok: allChecks.filter(c => c.status.includes('✅')).length,
    warning: allChecks.filter(c => c.status.includes('⚠️')).length,
    fail: allChecks.filter(c => c.status.includes('❌')).length
  };
  
  md += `## 📊 Sumário\n\n`;
  md += `| Status | Quantidade |\n`;
  md += `|--------|------------|\n`;
  md += `| ✅ OK | ${stats.ok} |\n`;
  md += `| ⚠️  Avisos | ${stats.warning} |\n`;
  md += `| ❌ Falhas | ${stats.fail} |\n`;
  md += `| **Total** | **${stats.total}** |\n\n`;
  
  const health = stats.fail === 0 ? '🟢 SAUDÁVEL' : (stats.fail <= 2 ? '🟡 PARCIAL' : '🔴 CRÍTICO');
  md += `**Status Geral:** ${health}\n\n`;
  
  md += `---\n\n`;
  
  // Detalhes
  md += `## 📋 Detalhamento\n\n`;
  
  for (const check of allChecks) {
    md += `### ${check.status} ${check.name}\n\n`;
    
    if (check.url || check.host) {
      md += `**Endpoint:** \`${check.url || check.host}\`\n\n`;
    }
    
    md += `**Mensagem:** ${check.message}\n\n`;
    
    if (check.statusCode) {
      md += `**HTTP Status:** ${check.statusCode}\n\n`;
    }
    
    if (check.error) {
      md += `**Erro:** \`${check.error}\`\n\n`;
    }
    
    if (check.action) {
      md += `**Ação Recomendada:** ${check.action}\n\n`;
    }
    
    md += `**Prioridade:** **${check.priority}**\n\n`;
    md += `---\n\n`;
  }
  
  // Troubleshooting
  md += `## 🔧 Troubleshooting\n\n`;
  md += `### ICARUS_WEB_URL não acessível\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Verificar se o preview está rodando\n`;
  md += `npm run preview:start\n\n`;
  md += `# Ou iniciar com PM2\n`;
  md += `npm run preview:setup\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Supabase não configurado\n\n`;
  md += `1. Criar projeto em [supabase.com](https://supabase.com)\n`;
  md += `2. Copiar URL e chaves do Dashboard\n`;
  md += `3. Adicionar ao \`.env\`:\n\n`;
  md += `\`\`\`env\n`;
  md += `VITE_SUPABASE_URL=https://xxx.supabase.co\n`;
  md += `VITE_SUPABASE_ANON_KEY=eyJhbGc...\n`;
  md += `SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...\n`;
  md += `\`\`\`\n\n`;
  
  md += `### Meilisearch não acessível\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Docker (recomendado)\n`;
  md += `docker run -d -p 7700:7700 getmeili/meilisearch:latest\n\n`;
  md += `# Ou instalar localmente\n`;
  md += `curl -L https://install.meilisearch.com | sh\n`;
  md += `./meilisearch\n`;
  md += `\`\`\`\n\n`;
  
  md += `---\n\n`;
  md += `*Relatório gerado automaticamente por AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3*\n`;
  
  return md;
}

// ======================================
// 🎬 MAIN
// ======================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🏥 AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3              ║');
  console.log('║  Healthcheck - ICARUS v5.0                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Executar checks
  const icarusCheck = await checkIcarusWeb();
  const supabaseChecks = await checkSupabase();
  const meilisearchCheck = await checkMeilisearch();
  
  const allChecks = [
    icarusCheck,
    ...supabaseChecks,
    ...meilisearchCheck
  ];
  
  // Gerar relatório
  ensureDir(DOCS_INFRA_DIR);
  const markdown = generateMarkdownReport(allChecks);
  const reportPath = path.join(DOCS_INFRA_DIR, 'healthcheck.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');
  
  console.log(`\n✅ Relatório salvo em: ${reportPath}\n`);
  
  // Estatísticas finais
  const fails = allChecks.filter(c => c.status.includes('❌'));
  const warnings = allChecks.filter(c => c.status.includes('⚠️'));
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log(`║  📊 Total de checks: ${allChecks.length.toString().padEnd(36)}║`);
  console.log(`║  ✅ OK: ${allChecks.filter(c => c.status.includes('✅')).length.toString().padEnd(48)}║`);
  console.log(`║  ⚠️  Avisos: ${warnings.length.toString().padEnd(43)}║`);
  console.log(`║  ❌ Falhas: ${fails.length.toString().padEnd(44)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Exit code
  process.exit(fails.length > 0 ? 1 : 0);
}

main();

