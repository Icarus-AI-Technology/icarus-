#!/usr/bin/env node
// tools/ia/auto-fix-configs.js
// Corrige automaticamente configurações de IA quando seguras

import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';

function isProd() {
  return env === 'production' || process.env.VITE_ENVIRONMENT === 'production';
}

async function autoFixConfigs() {
  console.log('\n🔧 Auto-fix de Configurações de IA...\n');

  const fixes = [];
  const warnings = [];

  // Verificar .env
  const envPath = path.join(process.cwd(), '.env');
  const envProdPath = path.join(process.cwd(), '.env.production');

  if (isProd()) {
    console.log('🔍 Verificando configurações de produção...\n');

    // Verificar se .env.production existe
    if (!fs.existsSync(envProdPath)) {
      warnings.push({
        type: 'missing_file',
        file: '.env.production',
        message: 'Arquivo .env.production não encontrado - criar manualmente'
      });
    }

    // Verificar localhost em produção
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const hasLocalhost = /localhost|127\.0\.0\.1/i.test(envContent);

      if (hasLocalhost) {
        warnings.push({
          type: 'localhost_in_prod',
          file: '.env',
          message: 'Arquivo .env contém localhost - usar .env.production em produção'
        });
      }
    }
  } else {
    console.log('🔍 Verificando configurações de desenvolvimento...\n');

    // Em dev, sugerir .env.local
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
      warnings.push({
        type: 'missing_env',
        message: 'Nenhum arquivo .env ou .env.local encontrado'
      });
    }
  }

  // Relatório
  const report = {
    timestamp: new Date().toISOString(),
    environment: env,
    fixes: fixes.length,
    warnings: warnings.length,
    details: { fixes, warnings }
  };

  const outPath = path.join('.cursor', 'agents', 'ia-validator', `auto-fix-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('📊 RESULTADOS:');
  console.log(`   ✅ Correções aplicadas: ${fixes.length}`);
  console.log(`   ⚠️  Avisos: ${warnings.length}\n`);

  if (warnings.length > 0) {
    console.log('⚠️  AVISOS:');
    warnings.forEach(w => console.log(`   • ${w.message}`));
  }

  console.log(`\n📄 Relatório salvo em: ${outPath}\n`);
}

autoFixConfigs().catch(e => {
  console.error('Erro:', e.message);
  process.exit(1);
});

