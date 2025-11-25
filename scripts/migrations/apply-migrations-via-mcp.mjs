#!/usr/bin/env node
/**
 * Script para aplicar migrações Supabase via MCP
 * Aplica arquivo por arquivo com retry logic
 */

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const MIGRATIONS_DIR = 'supabase/migrations';
const PROJECT_ID = 'gvbkviozlhxorjoavmky';
const LOG_FILE = 'MIGRACAO_MCP_LOG.md';

// Migrações já aplicadas manualmente (base inicial)
const APPLIED_MIGRATIONS = [
  '0001_init_schema.sql', // Extensions + tabelas core (empresas, usuarios, produtos, lotes)
];

// Migrações para pular (versões antigas/consolidadas/duplicadas)
const SKIP_MIGRATIONS = [
  '20250126_consolidated_all_tables.sql', // Consolidado (usar as individuais)
  '0007_feature_flags_compliance.sql.OLD', // Arquivo OLD
  'CREATE_STORAGE_BUCKETS.sql', // Aplicar por último
  'README_MIGRATIONS_CORRETIVAS.md', // Documentação
];

function getAllMigrations() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .filter((f) => !SKIP_MIGRATIONS.includes(f))
    .filter((f) => !APPLIED_MIGRATIONS.includes(f))
    .sort(); // Ordem cronológica

  return files;
}

function formatMigrationForMCP(filename) {
  const content = readFileSync(join(MIGRATIONS_DIR, filename), 'utf8');

  // Remove comentários de múltiplas linhas e simplifica
  let cleaned = content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* ... */
    .replace(/--[^\n]*/g, '') // Remove comentários de linha
    .trim();

  // Nome da migração (sem extensão)
  const name = filename.replace('.sql', '');

  return { name, query: cleaned, filename };
}

function generateMCPInstructions() {
  const migrations = getAllMigrations();

  console.log(`\n📦 Total de migrações a aplicar: ${migrations.length}\n`);

  let markdown = `# 🚀 Aplicação de Migrações via MCP Supabase\n\n`;
  markdown += `**Data**: ${new Date().toISOString()}\n`;
  markdown += `**Projeto**: ${PROJECT_ID}\n`;
  markdown += `**Total**: ${migrations.length} migrações\n\n`;
  markdown += `---\n\n`;

  migrations.forEach((file, idx) => {
    const { name, query } = formatMigrationForMCP(file);
    const num = idx + 1;

    console.log(`[${num}/${migrations.length}] ${file}`);

    markdown += `## ${num}. ${file}\n\n`;
    markdown += `\`\`\`typescript\n`;
    markdown += `mcp_supabase_apply_migration({\n`;
    markdown += `  name: "${name}",\n`;
    markdown += `  project_id: "${PROJECT_ID}",\n`;
    markdown += `  query: \`\n`;
    markdown += query.substring(0, 500); // Preview
    if (query.length > 500) {
      markdown += `\n... (${query.length} caracteres total)\n`;
    }
    markdown += `\`\n`;
    markdown += `});\n`;
    markdown += `\`\`\`\n\n`;
    markdown += `---\n\n`;
  });

  markdown += `\n## ✅ Status\n\n`;
  markdown += `- [ ] Fase 1: Init Schema (0001-0006) - 6 migrações\n`;
  markdown += `- [ ] Fase 2: Cadastros (0007-0013) - 7 migrações\n`;
  markdown += `- [ ] Fase 3: Módulos Core (20251018-20251020) - ~30 migrações\n`;
  markdown += `- [ ] Fase 4: Features Avançadas (202510201244+) - ~20 migrações\n`;
  markdown += `- [ ] Fase 5: Correções e Ajustes (20251023+) - ~20 migrações\n`;
  markdown += `- [ ] Fase 6: Storage Buckets (CREATE_STORAGE_BUCKETS.sql) - 1 migração\n\n`;

  writeFileSync(LOG_FILE, markdown);
  console.log(`\n✅ Instruções geradas em: ${LOG_FILE}\n`);
}

// Executar
generateMCPInstructions();
