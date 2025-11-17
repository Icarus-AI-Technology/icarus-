#!/usr/bin/env node

/**
 * ICARUS v5.0 - Supabase Migration Integrity Checker
 * --------------------------------------------------
 * Ensures critical components (schema, RLS, functions, edge functions)
 * are present in the Supabase migrations directory.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIGRATIONS_DIR = path.join(ROOT_DIR, 'supabase', 'migrations');
const FUNCTIONS_DIR = path.join(ROOT_DIR, 'supabase', 'functions');

function listFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter((name) => !name.startsWith('.'));
}

const migrationFiles = listFiles(MIGRATIONS_DIR);
const functionDirs = listFiles(FUNCTIONS_DIR);

const COMPONENTS = [
  { label: 'Schema inicial', keywords: ['init_schema', 'icarus_pro_master'] },
  { label: 'Políticas RLS', keywords: ['rls', 'rbac'] },
  { label: 'Índices & performance', keywords: ['index', 'indexes', 'performance'] },
  { label: 'Seeds essenciais', keywords: ['seed', 'demo'] },
  { label: 'Cirurgias & operações', keywords: ['cirurgias', 'operacoes', 'cirurgia'] },
  { label: 'Financeiro e faturamento', keywords: ['financeiro', 'faturas', 'contabil'] },
  { label: 'Consignação', keywords: ['consignacao'] },
  { label: 'Compliance & LGPD', keywords: ['compliance', 'lgpd'] },
  { label: 'Logs & auditoria', keywords: ['audit', 'logs'] },
  { label: 'EDR / AI', keywords: ['edr', 'agent', 'ml', 'vector'] },
  { label: 'Integrações externas', keywords: ['api_gateway', 'webhook', 'integracao'] },
];

const EXPECTED_FUNCTIONS = [
  'orchestrator',
  'agent-erp',
  'agent-benchmark',
  'agent-compliance',
  'agent-synthesis',
  'ml-job',
  'ml-vectors',
  'vector-benchmark',
  'edr-orchestrator',
  'edr-stream',
  'consulta_anvisa_produto',
  'valida_crm_cfm',
  'recalcular_kpis',
  'webhook-processor',
  'create-admin',
  'test-credential',
];

const missingComponents = [];
for (const component of COMPONENTS) {
  const found = migrationFiles.some((file) =>
    component.keywords.some((keyword) => file.toLowerCase().includes(keyword))
  );
  if (!found) {
    missingComponents.push(component.label);
  }
}

const missingFunctions = EXPECTED_FUNCTIONS.filter((fn) => !functionDirs.includes(fn));

console.log('🔍 ICARUS v5.0 - Supabase Migration Audit');
console.log('=========================================\n');
console.log(`📁 Total migrations: ${migrationFiles.length}`);
console.log(`⚡ Edge functions: ${functionDirs.length}`);
console.log('');

if (missingComponents.length === 0) {
  console.log('✅ Todos os domínios críticos possuem migrations registradas');
} else {
  console.log('❌ Domínios sem migrations detectadas:');
  missingComponents.forEach((label) => console.log(`   - ${label}`));
}

console.log('');

if (missingFunctions.length === 0) {
  console.log('✅ Todas as edge functions esperadas estão presentes');
} else {
  console.log('❌ Edge functions ausentes:');
  missingFunctions.forEach((fn) => console.log(`   - ${fn}`));
}

console.log('\nResumo concluído.');
