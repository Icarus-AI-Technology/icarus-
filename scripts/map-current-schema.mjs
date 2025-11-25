#!/usr/bin/env node

/**
 * Mapeador de Schema Atual - ICARUS v5.0
 * Lista TODAS as tabelas existentes no Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ttswvavcisdnonytslom.supabase.co';
const serviceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function mapSchema() {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║          📊 Mapeamento de Schema - ICARUS v5.0                        ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Listar todas as tabelas via query SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          schemaname,
          tablename,
          tableowner
        FROM pg_tables 
        WHERE schemaname IN ('public', 'storage')
        ORDER BY schemaname, tablename;
      `,
    });

    if (error) {
      // Fallback: tentar via from()
      console.log('⚠️  RPC não disponível, tentando método alternativo...\n');

      // Listar tabelas conhecidas
      const knownTables = [
        'cirurgias',
        'cirurgia_materiais',
        'cirurgia_eventos',
        'materiais',
        'medicos',
        'pacientes',
        'hospitais',
        'convenios',
        'empresas',
        'profiles',
        'leads',
        'transacoes',
        'fornecedores',
        'pedidos_compra',
        'consignacoes',
        'contratos',
        'licitacoes',
        'propostas',
        'workflows',
        'auditorias',
        'notificacoes',
      ];

      console.log('📋 Tabelas Conhecidas (amostra):');
      console.log('');

      let found = 0;
      for (const table of knownTables) {
        try {
          const { error: tableError } = await supabase.from(table).select('*').limit(0);

          if (!tableError) {
            console.log(`   ✅ ${table}`);
            found++;
          }
        } catch (e) {
          // Tabela não existe
        }
      }

      console.log('');
      console.log(`Total encontradas: ${found}/${knownTables.length}`);
      console.log('');
      console.log('💡 Para mapeamento completo, use Supabase CLI:');
      console.log('   supabase db dump --schema public');
    } else {
      console.log('📋 Tabelas no Schema:');
      console.log('');
      data.forEach((row, idx) => {
        console.log(`   ${idx + 1}. ${row.schemaname}.${row.tablename}`);
      });
      console.log('');
      console.log(`Total: ${data.length} tabelas`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

mapSchema();
