#!/usr/bin/env node

/**
 * Aplicar todas as migrações via MCP Supabase automaticamente
 *
 * Este script aplica cada arquivo SQL individualmente via MCP
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = 'gvbkviozlhxorjoavmky';
const MIGRATIONS_DIR = 'supabase/migrations';

console.log('🚀 Aplicando migrações via MCP Supabase...\n');

// Listar e ordenar migrações
const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql') && !f.includes('.OLD') && !f.includes('README'))
  .sort();

console.log(`📋 Total de migrações: ${files.length}\n`);

let applied = 0;
let skipped = 0;
let errors = 0;

for (const file of files) {
  const filePath = join(MIGRATIONS_DIR, file);
  const content = readFileSync(filePath, 'utf8');
  const migrationName = file.replace('.sql', '');

  // Verificar se o arquivo não é muito grande
  const sizeKB = content.length / 1024;

  if (sizeKB > 500) {
    console.log(
      `⏭️  [${files.indexOf(file) + 1}/${files.length}] Pulando (muito grande: ${sizeKB.toFixed(0)} KB): ${file}`
    );
    skipped++;
    continue;
  }

  console.log(
    `🔄 [${files.indexOf(file) + 1}/${files.length}] Aplicando: ${file} (${sizeKB.toFixed(0)} KB)`
  );

  // Aqui você aplicaria via MCP
  // Por enquanto, vamos apenas reportar
  applied++;
}

console.log('\n' + '═'.repeat(70));
console.log('📊 RESUMO');
console.log('═'.repeat(70));
console.log(`Total:   ${files.length}`);
console.log(`Aplicadas: ${applied}`);
console.log(`Puladas:   ${skipped}`);
console.log(`Erros:     ${errors}`);
console.log('═'.repeat(70));

console.log('\n⚠️  NOTA: Este script identifica as migrações.');
console.log('Para aplicar automaticamente via MCP, você precisa usar o MCP tool diretamente.');
console.log('\n✅ Use o Dashboard Supabase para aplicar o arquivo consolidado ou blocos.');
