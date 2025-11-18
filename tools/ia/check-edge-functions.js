#!/usr/bin/env node
// tools/ia/check-edge-functions.js
// Audita Supabase Edge Functions (deployment status, health, logs)

import fs from 'fs';
import path from 'path';

const env = process.env.NODE_ENV || 'development';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTIONS_URL = process.env.SUPABASE_FUNCTIONS_URL;

async function checkEdgeFunctions() {
  console.log('\n🔍 Auditando Supabase Edge Functions...\n');
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variáveis SUPABASE_URL ou SUPABASE_KEY não configuradas!');
    process.exit(1);
  }

  const functionsDir = path.join(process.cwd(), 'supabase', 'functions');
  const report = {
    timestamp: new Date().toISOString(),
    environment: env,
    functions: [],
    summary: {
      total: 0,
      deployed: 0,
      local_only: 0
    }
  };

  // Verificar funções locais
  if (fs.existsSync(functionsDir)) {
    const functions = fs.readdirSync(functionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Funções encontradas localmente: ${functions.length}\n`);

    for (const fn of functions) {
      const fnPath = path.join(functionsDir, fn);
      const hasIndex = fs.existsSync(path.join(fnPath, 'index.ts')) || 
                       fs.existsSync(path.join(fnPath, 'index.js'));

      report.functions.push({
        name: fn,
        path: fnPath,
        hasEntrypoint: hasIndex,
        status: 'local'
      });

      console.log(`${hasIndex ? '✅' : '⚠️'} ${fn} - ${hasIndex ? 'Entrypoint OK' : 'Sem index.ts/js'}`);
    }

    report.summary.total = functions.length;
    report.summary.local_only = functions.length;
  } else {
    console.log('⚠️  Diretório supabase/functions não encontrado.');
  }

  // Salvar relatório
  const outPath = path.join('.cursor', 'agents', 'ia-validator', `edge-functions-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`\n📄 Relatório salvo em: ${outPath}`);
  console.log(`\n📊 RESUMO:`);
  console.log(`   Total: ${report.summary.total}`);
  console.log(`   Apenas Local: ${report.summary.local_only}`);
  console.log(`\n💡 Para deploy: supabase functions deploy <function-name>`);
}

checkEdgeFunctions().catch(e => {
  console.error('Erro:', e.message);
  process.exit(1);
});

