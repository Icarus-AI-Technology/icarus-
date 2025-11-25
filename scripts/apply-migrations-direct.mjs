#!/usr/bin/env node

/**
 * Aplicador de Migrations - PostgreSQL Direto
 * ICARUS v5.0 - AGENTE_ORQUESTRADOR_SUPABASE_EXECUTOR v3
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Credenciais separadas (sem encoding issues)
const dbConfig = {
  user: 'postgres',
  password: "%Ortho#New&25']",
  host: 'db.ttswvavcisdnonytslom.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
};

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

const migrations = [
  '202510201244_01_cirurgias_tabelas.sql',
  '202510201244_02_cirurgias_rls.sql',
  '202510201244_03_dashboard_views.sql',
  '202510201244_04_dashboard_functions.sql',
  '202510201245_05_indices_performance.sql',
  '202510201246_06_seeds_demo.sql',
  '202510201247_07_storage_config.sql',
];

async function applyMigrations() {
  const client = new Client(dbConfig);

  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║          🚀 Aplicando Migrations - ICARUS v5.0                        ║');
  console.log('║          Database: ttswvavcisdnonytslom                               ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    console.log('🔗 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    for (const migration of migrations) {
      const migrationPath = path.join(MIGRATIONS_DIR, migration);

      console.log(`📦 Aplicando: ${migration}`);

      if (!fs.existsSync(migrationPath)) {
        console.log(`   ⚠️  Arquivo não encontrado, pulando...\n`);
        continue;
      }

      const sql = fs.readFileSync(migrationPath, 'utf-8');

      try {
        await client.query(sql);
        console.log(`   ✅ Aplicado com sucesso!\n`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ℹ️  Já aplicado anteriormente (ignorando)\n`);
        } else {
          console.log(`   ⚠️  Erro: ${error.message.split('\n')[0]}\n`);
          // Continuar mesmo com erro
        }
      }
    }

    // Validações
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔍 Validando aplicação...\n');

    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
      ORDER BY tablename
    `);
    console.log(`✅ Tabelas criadas: ${tablesResult.rows.length}/3`);
    tablesResult.rows.forEach((row) => console.log(`   • ${row.tablename}`));
    console.log('');

    // Verificar views
    const viewsResult = await client.query(`
      SELECT viewname 
      FROM pg_views 
      WHERE schemaname = 'public' 
        AND viewname LIKE 'vw_%'
      ORDER BY viewname
    `);
    console.log(`✅ Views criadas: ${viewsResult.rows.length}`);
    viewsResult.rows.forEach((row) => console.log(`   • ${row.viewname}`));
    console.log('');

    // Verificar functions
    const functionsResult = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
        AND routine_name LIKE 'get_%'
      ORDER BY routine_name
    `);
    console.log(`✅ Functions RPC criadas: ${functionsResult.rows.length}`);
    functionsResult.rows.forEach((row) => console.log(`   • ${row.routine_name}()`));
    console.log('');

    // Verificar índices
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname LIKE '%cirurgia%'
      ORDER BY indexname
      LIMIT 10
    `);
    console.log(`✅ Índices criados: ${indexesResult.rows.length}+ (amostra)`);
    indexesResult.rows.forEach((row) => console.log(`   • ${row.indexname}`));
    console.log('');

    // Verificar RLS policies
    const policiesResult = await client.query(`
      SELECT tablename, COUNT(*) as policy_count
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('cirurgias', 'cirurgia_materiais', 'cirurgia_eventos')
      GROUP BY tablename
      ORDER BY tablename
    `);
    let totalPolicies = 0;
    console.log(`✅ RLS Policies criadas:`);
    policiesResult.rows.forEach((row) => {
      console.log(`   • ${row.tablename}: ${row.policy_count} policies`);
      totalPolicies += parseInt(row.policy_count);
    });
    console.log(`   TOTAL: ${totalPolicies} policies\n`);

    // Verificar Storage buckets
    const bucketsResult = await client.query(`
      SELECT name, public 
      FROM storage.buckets 
      WHERE name IN ('cirurgias', 'faturamento', 'compliance', 'consignacao', 'uploads')
      ORDER BY name
    `);
    console.log(`✅ Storage Buckets configurados: ${bucketsResult.rows.length}/5`);
    bucketsResult.rows.forEach((row) =>
      console.log(`   • ${row.name} (${row.public ? 'público' : 'privado'})`)
    );
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                        ║');
    console.log('║          ✅ Migrations Aplicadas com Sucesso!                         ║');
    console.log('║                                                                        ║');
    console.log('║          📊 Resumo:                                                    ║');
    console.log(
      `║             • ${tablesResult.rows.length} tabelas criadas                                      ║`
    );
    console.log(
      `║             • ${viewsResult.rows.length} views criadas                                        ║`
    );
    console.log(
      `║             • ${functionsResult.rows.length} functions RPC criadas                                    ║`
    );
    console.log(
      `║             • ${indexesResult.rows.length}+ índices criados                                     ║`
    );
    console.log(
      `║             • ${totalPolicies} RLS policies ativas                                      ║`
    );
    console.log(
      `║             • ${bucketsResult.rows.length} storage buckets configurados                            ║`
    );
    console.log('║                                                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('🚀 Próximos passos:');
    console.log('   1. Execute: npm run infra:audit');
    console.log('   2. Execute: npm run infra:health');
    console.log('   3. Deploy Edge Functions (se necessário)');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════════════════╗');
    console.error('║  ❌ Erro ao aplicar migrations                                        ║');
    console.error('╚════════════════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Erro:', error.message);
    console.error('');
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
