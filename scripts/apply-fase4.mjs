#!/usr/bin/env node
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'xeO6xuDbpX749uyT',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  query_timeout: 60000,
};

const MIGRATIONS_FASE4 = [
  '202510201330_fase4_parte1_chatbot_gpt.sql',
  '202510201331_fase4_parte2_workflows.sql',
  '202510201332_fase4_parte3_api_gateway.sql',
  '202510201333_fase4_parte4_bi_analytics.sql',
  '202510201334_fase4_parte5_kpis.sql',
];

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

async function countTables(client) {
  const result = await client.query(`
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `);
  return parseInt(result.rows[0].count);
}

async function applyMigration(client, filename) {
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  log(`\n📄 Aplicando: ${filename}`, 'cyan');

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    log(`   ✅ Sucesso!`, 'green');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    log(`   ❌ Erro: ${error.message.substring(0, 120)}`, 'red');
    return { success: false, error: error.message };
  }
}

async function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('🚀 APLICADOR FASE 4 - Features Avançadas (20 tabelas)', 'cyan');
  log('='.repeat(80) + '\n', 'cyan');

  const client = new pg.Client(DB_CONFIG);

  try {
    log('🔌 Conectando...', 'blue');
    await client.connect();
    log('✅ Conectado!\n', 'green');

    const beforeCount = await countTables(client);
    log(`📊 Tabelas ANTES: ${beforeCount}\n`, 'blue');

    let applied = 0;
    for (const migration of MIGRATIONS_FASE4) {
      const result = await applyMigration(client, migration);
      if (result.success) applied++;
    }

    const afterCount = await countTables(client);

    log('\n' + '='.repeat(80), 'cyan');
    log('📊 RESUMO FASE 4', 'cyan');
    log('='.repeat(80), 'cyan');
    log(
      `Migrations aplicadas:     ${applied}/${MIGRATIONS_FASE4.length}`,
      applied === MIGRATIONS_FASE4.length ? 'green' : 'yellow'
    );
    log(`\n📊 Tabelas ANTES:         ${beforeCount}`, 'blue');
    log(`📊 Tabelas DEPOIS:        ${afterCount}`, 'green');
    log(`📈 Novas tabelas:         +${afterCount - beforeCount}`, 'green');

    const completude = Math.round((afterCount / 104) * 100);
    log(
      `\n📈 Completude do schema:  ${completude}% (${afterCount}/104)`,
      completude >= 80 ? 'green' : 'yellow'
    );

    if (applied === MIGRATIONS_FASE4.length) {
      log('\n✅ FASE 4 COMPLETA COM SUCESSO!', 'green');
      log('🎯 Meta de 83% do schema atingida!', 'green');
    }
  } catch (error) {
    log(`\n❌ ERRO FATAL: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
