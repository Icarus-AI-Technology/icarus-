import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const supabaseDir = path.join(projectRoot, 'supabase');

console.log('🔍 Verificando configuração RLS (Row Level Security)...\n');

if (!fs.existsSync(supabaseDir)) {
  console.error('❌ Diretório supabase/ não encontrado!');
  process.exit(1);
}

const migrationsDir = path.join(supabaseDir, 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.warn('⚠️  Diretório de migrações não encontrado!');
  process.exit(0);
}

const migrations = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

const rlsReport = {
  timestamp: new Date().toISOString(),
  totalMigrations: migrations.length,
  tablesWithRLS: [],
  tablesWithoutRLS: [],
  policies: []
};

// Analisar migrações em busca de configurações de RLS
for (const migration of migrations) {
  const content = fs.readFileSync(path.join(migrationsDir, migration), 'utf8');
  
  // Procurar por CREATE TABLE
  const tableMatches = content.matchAll(/CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)/gi);
  for (const match of tableMatches) {
    const tableName = match[1];
    
    // Verificar se tem ALTER TABLE ... ENABLE ROW LEVEL SECURITY
    const hasRLS = content.includes(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY`) ||
                   content.includes(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY`);
    
    if (hasRLS) {
      rlsReport.tablesWithRLS.push({ table: tableName, migration });
    } else {
      rlsReport.tablesWithoutRLS.push({ table: tableName, migration });
    }
  }
  
  // Procurar por políticas
  const policyMatches = content.matchAll(/CREATE POLICY (\w+) ON (?:public\.)?(\w+)/gi);
  for (const match of policyMatches) {
    rlsReport.policies.push({
      name: match[1],
      table: match[2],
      migration
    });
  }
}

const outputPath = path.join(projectRoot, 'rls-report.json');
fs.writeFileSync(outputPath, JSON.stringify(rlsReport, null, 2));

console.log(`📊 Relatório RLS:`);
console.log(`   Migrações analisadas: ${rlsReport.totalMigrations}`);
console.log(`   Tabelas com RLS: ${rlsReport.tablesWithRLS.length}`);
console.log(`   Tabelas sem RLS: ${rlsReport.tablesWithoutRLS.length}`);
console.log(`   Políticas criadas: ${rlsReport.policies.length}`);

if (rlsReport.tablesWithoutRLS.length > 0) {
  console.log(`\n⚠️  Tabelas sem RLS detectadas:`);
  rlsReport.tablesWithoutRLS.forEach(({ table, migration }) => {
    console.log(`   - ${table} (${migration})`);
  });
}

console.log(`\n✅ Relatório salvo: ${outputPath}`);

if (rlsReport.tablesWithoutRLS.length > 0) {
  console.warn(`\n⚠️  ATENÇÃO: Algumas tabelas não têm RLS habilitado!`);
  process.exit(1);
}

console.log('\n✅ Todas as tabelas têm RLS habilitado!');

