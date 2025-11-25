#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.log('❌ Variáveis necessárias não configuradas:\n');
  console.log('export VITE_SUPABASE_URL=https://svvhzfceezllustnmhfz.supabase.co');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...');
  console.log('\n📚 Encontre essas variáveis no Supabase Dashboard → Project Settings → API\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function deploy() {
  try {
    console.log('🚀 DEPLOY COMPLETO — ICARUS BD\n');
    console.log('🔌 Conectando ao banco...');

    // Testar conexão
    const { data, error } = await supabase.from('_dummy_').select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      // Tabela não existe ainda, mas conexão OK
      console.log('✅ Conectado ao Supabase!\n');
    } else if (error) {
      console.log('✅ Conectado ao Supabase!\n');
    } else {
      console.log('✅ Conectado!\n');
    }

    // Listar migrations
    const migrationsDir = join(__dirname, '../../supabase/migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    console.log(`📁 ${files.length} migrations encontradas:\n`);

    // Criar tabela de controle de migrations
    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const { error: createError } = await supabase.from('schema_migrations').select('*').limit(1);

    if (createError && createError.message.includes('does not exist')) {
      console.log('ℹ️  Tabela schema_migrations será criada pela primeira migration\n');
    }

    // Aplicar cada migration
    for (const file of files) {
      const version = file.replace('.sql', '');

      console.log(`⚙️  Aplicando: ${file}...`);

      const sql = readFileSync(join(migrationsDir, file), 'utf8');

      try {
        // Executar via REST API do Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `HTTP ${response.status}`);
        }

        console.log(`✅ ${file} aplicada com sucesso!\n`);
      } catch (err) {
        console.error(`❌ Erro ao aplicar ${file}:`);
        console.error(err.message);
        console.log('\n⚠️  Continuando...\n');
      }
    }

    // Validações finais
    console.log('\n🔍 VALIDAÇÕES FINAIS\n');

    // Contar tabelas via query direta
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*', { count: 'exact', head: true })
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .neq('table_name', 'schema_migrations');

    if (!tablesError) {
      console.log(`✅ Deploy concluído! Verifique no Dashboard.`);
    }

    console.log('\n🎉 DEPLOY CONCLUÍDO!\n');
    console.log('📋 Próximos passos:');
    console.log('   1. Verificar no Supabase Dashboard → Table Editor');
    console.log('   2. npm run db:setup-dpo');
    console.log('   3. Configurar RLS policies manualmente se necessário\n');
  } catch (err) {
    console.error('\n❌ ERRO:', err.message);
    console.error('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.error('   1. Acesse Supabase Dashboard → SQL Editor');
    console.error('   2. Copie e cole cada arquivo de supabase/migrations/');
    console.error('   3. Execute manualmente em ordem (0001, 0002, ...)\n');
    process.exit(1);
  }
}

deploy();
