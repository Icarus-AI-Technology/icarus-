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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n' + '='.repeat(80), 'magenta');
  log('📊 APLICADOR - Módulo BI Completo (6 tabelas)', 'magenta');
  log('='.repeat(80) + '\n', 'magenta');
  
  const client = new pg.Client(DB_CONFIG);
  
  try {
    await client.connect();
    log('✅ Conectado!\n', 'green');
    
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '202510201410_modulo_bi_completo.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    log('📄 Aplicando módulo BI...', 'cyan');
    
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    log('✅ Módulo BI aplicado com sucesso!\n', 'green');
    
    // Contar tabelas
    const result = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    const total = parseInt(result.rows[0].count);
    log(`📊 Total de tabelas: ${total}`, 'cyan');
    log(`📈 Meta: 116 tabelas (100%)`, 'cyan');
    log(`✅ Completude: ${Math.round((total / 116) * 100)}%\n`, 'green');
    
    if (total >= 116) {
      log('🎉 100% DAS TABELAS IMPLEMENTADAS!', 'green');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    log(`\n❌ ERRO: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);

