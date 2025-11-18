#!/usr/bin/env node
/**
 * Verifica se o mapeamento FE ↔ BD descrito em fe-bd-map.md
 * está coerente com as tabelas criadas nas migrations do Supabase.
 *
 * Resultado: escreve docs/REPORTS/fe-bd-map-report.json
 * Retorna exit code 1 se houver tabelas ausentes.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const mapFile = path.join(rootDir, 'fe-bd-map.md');
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');
const reportsDir = path.join(rootDir, 'docs', 'REPORTS');
const reportFile = path.join(reportsDir, 'fe-bd-map-report.json');

const IGNORED_TOKENS = new Set([
  'current_empresa',
  'current_perfil',
  'current_user_id',
  'trg_auth_user_created',
  'perfil',
]);

const NON_TABLE_PATTERNS = [
  /^supabase\//,
  /^docs\//,
  /^src\//,
  /^\//,
  /sql$/i,
];

function normalizeName(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (NON_TABLE_PATTERNS.some((regex) => regex.test(trimmed))) {
    return null;
  }

  const base = trimmed
    .split('(')[0]
    .split(' ')[0]
    .replace(/[^a-z0-9_]/gi, '')
    .toLowerCase();

  if (!base || base.length < 3) return null;
  if (IGNORED_TOKENS.has(base)) return null;
  if (base.endsWith('_id')) return null;

  return base;
}

function extractTableNamesFromDoc(content) {
  const tokens = content.match(/`([^`]+)`/g) ?? [];
  const tables = new Set();

  for (const token of tokens) {
    const inner = token.slice(1, -1).trim();
    if (!inner) continue;

    const hasParentheses = inner.includes('(');

    // Lists separated por vírgulas (sem parênteses)
    if (!hasParentheses && inner.includes(',')) {
      inner.split(',').forEach((piece) => {
        const name = normalizeName(piece);
        if (name) tables.add(name);
      });
      continue;
    }

    // Skip bare functions like something()
    if (/^[a-z0-9_]+\s*\(\s*\)$/i.test(inner)) {
      const fn = normalizeName(inner.replace(/\(\s*\)$/, ''));
      if (fn) IGNORED_TOKENS.add(fn);
      continue;
    }

    const name = normalizeName(inner);
    if (name) tables.add(name);
  }

  return tables;
}

async function collectSqlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectSqlFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.sql')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function collectTablesFromMigrations() {
  const files = await collectSqlFiles(migrationsDir);
  const tables = new Set();
  const regex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:"?public"?\.)?"?([a-z0-9_]+)"?/gi;

  for (const file of files) {
    const sql = await fs.readFile(file, 'utf8');
    let match;
    while ((match = regex.exec(sql)) !== null) {
      tables.add(match[1].toLowerCase());
    }
  }

  return tables;
}

async function writeReport(data) {
  await fs.mkdir(reportsDir, { recursive: true });
  await fs.writeFile(reportFile, JSON.stringify(data, null, 2), 'utf8');
}

async function main() {
  console.log('🗺️  FE ↔ BD Map Checker');
  console.log('──────────────────────────');

  let docContent;
  try {
    docContent = await fs.readFile(mapFile, 'utf8');
  } catch (error) {
    console.error(`❌ Não foi possível ler ${mapFile}:`, error.message);
    process.exit(1);
  }

  const documentedTables = extractTableNamesFromDoc(docContent);
  if (documentedTables.size === 0) {
    console.error('❌ Nenhuma tabela encontrada em fe-bd-map.md');
    process.exit(1);
  }

  const migrationTables = await collectTablesFromMigrations();

  const missingTables = [...documentedTables].filter(
    (table) => !migrationTables.has(table),
  );

  const coverage =
    documentedTables.size === 0
      ? 0
      : ((documentedTables.size - missingTables.length) / documentedTables.size) *
        100;

  console.log(`📄 Tabelas documentadas: ${documentedTables.size}`);
  console.log(`📦 Tabelas nas migrations: ${migrationTables.size}`);
  console.log(`✅ Cobertura: ${coverage.toFixed(1)}%`);

  if (missingTables.length > 0) {
    console.error('❌ Tabelas não encontradas nas migrations:');
    missingTables.forEach((table) => console.error(`   - ${table}`));
  } else {
    console.log('🎯 Todas as tabelas documentadas foram encontradas nas migrations.');
  }

  await writeReport({
    generatedAt: new Date().toISOString(),
    documentedTables: documentedTables.size,
    migrationTables: migrationTables.size,
    coverage: Number(coverage.toFixed(2)),
    missingTables,
    status: missingTables.length > 0 ? 'incomplete' : 'ok',
  });

  if (missingTables.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erro inesperado:', error);
  process.exit(1);
});

