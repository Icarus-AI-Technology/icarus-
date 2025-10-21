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

async function main() {
  const client = new pg.Client(DB_CONFIG);
  
  try {
    console.log('🔌 Conectando...');
    await client.connect();
    console.log('✅ Conectado!\n');
    
    const beforeCount = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    console.log(`📊 Tabelas ANTES: ${beforeCount.rows[0].count}\n`);
    
    const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', '202510201300_fase1_10tabelas_criticas.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('🚀 Aplicando FASE 1...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    const afterCount = await client.query(`
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    console.log('\n✅ Migration aplicada com sucesso!');
    console.log(`📊 Tabelas DEPOIS: ${afterCount.rows[0].count}`);
    console.log(`📈 Novas tabelas: +${afterCount.rows[0].count - beforeCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`\n❌ Erro: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
