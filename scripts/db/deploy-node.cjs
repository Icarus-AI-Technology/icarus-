#!/usr/bin/env node

const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

// Configuração
const DB_URL = process.env.SUPABASE_DB_URL;

if (!DB_URL) {
  console.error('❌ SUPABASE_DB_URL não configurada');
  process.exit(1);
}

// Instalar pg dinamicamente se necessário
let Client;
try {
  Client = require('pg').Client;
} catch (err) {
  console.log('📦 Instalando driver PostgreSQL (pg)...');
  require('child_process').execSync('npm install --no-save pg', { stdio: 'inherit' });
  Client = require('pg').Client;
}

async function deploy() {
  const client = new Client({ connectionString: DB_URL });
  
  try {
    console.log('🚀 DEPLOY COMPLETO — ICARUS BD\n');
    console.log('🔌 Conectando ao banco...');
    await client.connect();
    console.log('✅ Conectado!\n');
    
    // Verificar versão
    const versionResult = await client.query('SELECT version();');
    console.log(`📊 PostgreSQL: ${versionResult.rows[0].version.split(',')[0]}\n`);
    
    // Listar migrations
    const migrationsDir = join(__dirname, '../../supabase/migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📁 ${files.length} migrations encontradas:\n`);
    
    // Criar tabela de controle de migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    // Aplicar cada migration
    for (const file of files) {
      const version = file.replace('.sql', '');
      
      // Verificar se já foi aplicada
      const check = await client.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [version]
      );
      
      if (check.rows.length > 0) {
        console.log(`⏭️  ${file} (já aplicada)`);
        continue;
      }
      
      console.log(`⚙️  Aplicando: ${file}...`);
      
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version) VALUES ($1)',
          [version]
        );
        await client.query('COMMIT');
        console.log(`✅ ${file} aplicada com sucesso!\n`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Erro ao aplicar ${file}:`);
        console.error(err.message);
        console.error('\nRollback executado.\n');
        throw err;
      }
    }
    
    // Validações finais
    console.log('\n🔍 VALIDAÇÕES FINAIS\n');
    
    // Contar tabelas
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != 'schema_migrations';
    `);
    console.log(`✅ Tabelas criadas: ${tablesResult.rows[0].count}`);
    
    // Contar policies RLS
    const policiesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);
    console.log(`✅ Policies RLS: ${policiesResult.rows[0].count}`);
    
    // Contar índices
    const indexesResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `);
    console.log(`✅ Índices criados: ${indexesResult.rows[0].count}`);
    
    // Contar funções
    const functionsResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public';
    `);
    console.log(`✅ Funções criadas: ${functionsResult.rows[0].count}`);
    
    console.log('\n🎉 DEPLOY CONCLUÍDO COM SUCESSO!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. npm run db:setup-dpo');
    console.log('   2. npm run db:backup');
    console.log('   3. npm run db:health\n');
    
  } catch (err) {
    console.error('\n❌ ERRO:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();

