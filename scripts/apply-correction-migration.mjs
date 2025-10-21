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

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

async function main() {
  log('\n' + '='.repeat(80), 'magenta');
  log('🔧 APLICADOR - Migration de Correção (Tabelas Faltantes)', 'magenta');
  log('='.repeat(80) + '\n', 'magenta');
  
  const client = new pg.Client(DB_CONFIG);
  
  try {
    log('🔌 Conectando...', 'blue');
    await client.connect();
    log('✅ Conectado!\n', 'green');
    
    const beforeCount = await countTables(client);
    log(`📊 Tabelas ANTES: ${beforeCount}\n`, 'blue');
    
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '202510201400_correcao_tabelas_faltantes.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    log('📄 Aplicando migration de correção...', 'cyan');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    log('✅ Migration aplicada com sucesso!\n', 'green');
    
    const afterCount = await countTables(client);
    
    log('='.repeat(80), 'magenta');
    log('📊 RESULTADO', 'magenta');
    log('='.repeat(80), 'magenta');
    log(`Tabelas ANTES:  ${beforeCount}`, 'blue');
    log(`Tabelas DEPOIS: ${afterCount}`, 'green');
    log(`Adicionadas:    +${afterCount - beforeCount}`, 'green');
    
    const expected = 103 + 7; // 103 atuais + 7 faltantes
    const completude = Math.round((afterCount / expected) * 100);
    log(`\nCompletude:     ${completude}% (${afterCount}/${expected})`, 'cyan');
    
    if (afterCount >= 110) {
      log('\n🎉 TODAS AS TABELAS FALTANTES ADICIONADAS!', 'green');
    } else {
      log(`\n⚠️  Ainda faltam ${expected - afterCount} tabelas`, 'yellow');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    log(`\n❌ ERRO: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);

