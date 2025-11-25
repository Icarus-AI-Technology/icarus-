#!/usr/bin/env node

/**
 * DEPLOY AUTOMÁTICO — ICARUS-PRO
 * Utiliza Supabase MCP para aplicar migrations
 *
 * Requisitos: Supabase MCP configurado no Cursor
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function deployWithMCP() {
  try {
    log('\n🚀 DEPLOY AUTOMÁTICO — ICARUS-PRO (via MCP)\n', 'cyan');

    // Listar migrations locais
    const migrationsDir = join(__dirname, '../../supabase/migrations');
    const localFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    log(`📁 ${localFiles.length} migrations encontradas localmente\n`, 'blue');

    // Aplicar cada migration
    let successCount = 0;
    let errorCount = 0;

    for (const file of localFiles) {
      const name = file.replace('.sql', '');
      const sqlContent = readFileSync(join(migrationsDir, file), 'utf8');

      log(`⚙️  Aplicando: ${file}...`, 'yellow');

      try {
        // Usar MCP para aplicar migration
        // Nota: Esta chamada precisa ser feita via Cursor Agent/MCP
        log(`   📝 Lendo arquivo: ${sqlContent.split('\n').length} linhas`, 'blue');
        log(`   💡 Use o Cursor Agent para executar: mcp_supabase_apply_migration`, 'cyan');
        log(`      - name: ${name}`, 'cyan');
        log(`      - query: [conteúdo do arquivo]\n`, 'cyan');

        successCount++;
      } catch (err) {
        log(`   ❌ Erro: ${err.message}\n`, 'red');
        errorCount++;
      }
    }

    // Resumo
    log('\n═══════════════════════════════════════', 'cyan');
    log('📊 RESUMO DO DEPLOY', 'cyan');
    log('═══════════════════════════════════════', 'cyan');
    log(`✅ Sucesso: ${successCount}`, 'green');
    log(`❌ Erros: ${errorCount}`, 'red');
    log(`📁 Total: ${localFiles.length}`, 'blue');

    // Instruções
    log('\n💡 PRÓXIMOS PASSOS:\n', 'yellow');
    log('Como o MCP requer interação via Cursor Agent,', 'reset');
    log('você pode pedir ao agent:', 'reset');
    log('  "Aplique todas as migrations usando o Supabase MCP"\n', 'cyan');

    log('Ou siga o guia manual:', 'reset');
    log('  → DEPLOY_ICARUS_PRO.md\n', 'cyan');
  } catch (err) {
    log(`\n❌ ERRO: ${err.message}`, 'red');
    log('\n💡 Alternativa: Use DEPLOY_ICARUS_PRO.md', 'yellow');
    process.exit(1);
  }
}

// Lista de migrations para aplicar via MCP
function getMigrationsList() {
  const migrationsDir = join(__dirname, '../../supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  return files.map((file) => {
    const name = file.replace('.sql', '');
    const content = readFileSync(join(migrationsDir, file), 'utf8');
    return { name, file, content, lines: content.split('\n').length };
  });
}

// Exibir migrations disponíveis
function showMigrations() {
  log('\n📋 MIGRATIONS DISPONÍVEIS\n', 'cyan');
  const migrations = getMigrationsList();

  migrations.forEach((m, i) => {
    log(`${i + 1}. ${m.file}`, 'blue');
    log(`   Nome: ${m.name}`, 'reset');
    log(`   Linhas: ${m.lines}`, 'reset');
    log(`   Path: supabase/migrations/${m.file}\n`, 'reset');
  });

  return migrations;
}

// Main
const args = process.argv.slice(2);

if (args.includes('--list')) {
  showMigrations();
  log('💡 Para aplicar via MCP, peça ao Cursor Agent:', 'yellow');
  log('   "Aplique migration X usando mcp_supabase_apply_migration"\n', 'cyan');
} else if (args.includes('--help') || args.includes('-h')) {
  log('\n🔧 DEPLOY VIA SUPABASE MCP\n', 'cyan');
  log('Uso:', 'reset');
  log('  node deploy-mcp.mjs [opções]\n', 'reset');
  log('Opções:', 'reset');
  log('  --list     Lista todas as migrations disponíveis', 'reset');
  log('  --help     Exibe esta ajuda\n', 'reset');
  log('💡 Como usar com MCP:', 'yellow');
  log('  1. Execute: node scripts/db/deploy-mcp.mjs --list', 'reset');
  log('  2. Peça ao Cursor Agent:', 'reset');
  log('     "Aplique todas as migrations usando o Supabase MCP"\n', 'cyan');
} else {
  const migrations = showMigrations();
  log('\n═══════════════════════════════════════', 'cyan');
  log('🤖 INSTRUÇÕES PARA CURSOR AGENT', 'cyan');
  log('═══════════════════════════════════════\n', 'cyan');

  log('Para aplicar automaticamente via MCP, use:\n', 'yellow');

  migrations.forEach((m, i) => {
    log(`${i + 1}. mcp_supabase_apply_migration`, 'blue');
    log(`   name: "${m.name}"`, 'reset');
    log(`   query: [conteúdo de ${m.file}]\n`, 'reset');
  });

  log('Ou peça ao agent:', 'yellow');
  log(
    '  "Leia e aplique todas as migrations de supabase/migrations/ usando o Supabase MCP"\n',
    'cyan'
  );
}
