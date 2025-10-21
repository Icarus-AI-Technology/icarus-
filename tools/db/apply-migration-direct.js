#!/usr/bin/env node
/**
 * 🚀 APLICADOR DE MIGRAÇÃO — Supabase Direct
 * 
 * Aplica migração SQL diretamente no banco Supabase.
 * 
 * @usage node tools/db/apply-migration-direct.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURAÇÃO
// ============================================

const DB_CONFIG = {
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: "[%Ortho#New&25']",
  ssl: { rejectUnauthorized: false }
};

const MIGRATION_FILE = join(
  __dirname, 
  '../../supabase/migrations/0009_tutores_economia_corrigido.sql'
);

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function applyMigration() {
  console.log('🚀 Iniciando aplicação de migração...\n');
  
  try {
    // Importar driver PostgreSQL dinamicamente
    const { default: pkg } = await import('pg');
    const { Client } = pkg;
    
    // Conectar ao banco
    console.log('📡 Conectando ao Supabase...');
    const client = new Client(DB_CONFIG);
    await client.connect();
    console.log('✅ Conectado!\n');
    
    // Ler arquivo SQL
    console.log(`📄 Lendo migração: ${MIGRATION_FILE}`);
    const sql = readFileSync(MIGRATION_FILE, 'utf-8');
    console.log(`✅ ${sql.length} caracteres lidos\n`);
    
    // Executar migração
    console.log('⚙️  Executando migração...');
    await client.query(sql);
    console.log('✅ Migração aplicada com sucesso!\n');
    
    // Validar tabelas criadas
    console.log('🔍 Validando tabelas criadas...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' 
        AND table_name IN (
          'feature_flags', 
          'conhecimento_base', 
          'tutor_logs',
          'certificacoes_usuario',
          'legislacao_updates',
          'notificacoes_legislacao'
        )
      ORDER BY table_name;
    `);
    
    console.log('\n✅ TABELAS CRIADAS:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Verificar colunas adicionadas
    console.log('\n🔍 Verificando colunas atualizadas...');
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_name = 'documentos_regulatorios'
        AND column_name IN ('analise_ia_jsonb', 'status_conformidade')
      ORDER BY column_name;
    `);
    
    if (columns.rows.length > 0) {
      console.log('\n✅ COLUNAS ADICIONADAS (documentos_regulatorios):');
      columns.rows.forEach(row => {
        console.log(`   ✓ ${row.column_name}`);
      });
    }
    
    // Fechar conexão
    await client.end();
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ ERRO ao aplicar migração:');
    console.error(error.message);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('\n💡 SOLUÇÃO: Instale o driver PostgreSQL:');
      console.log('   npm install pg');
    }
    
    process.exit(1);
  }
}

// ============================================
// EXECUTAR
// ============================================

applyMigration();

