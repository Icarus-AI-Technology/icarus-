#!/usr/bin/env node
/**
 * 🚀 APLICADOR DE MIGRAÇÃO — Via Supabase Client
 * 
 * Aplica migração SQL usando o cliente Supabase diretamente.
 * 
 * @usage node tools/db/apply-migration-client.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = 'https://ttswvavcisdnonytslom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc';

const MIGRATION_FILE = join(
  __dirname, 
  '../../supabase/migrations/0009_tutores_economia_corrigido.sql'
);

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function applyMigration() {
  console.log('🚀 Aplicando migração via Supabase Client...\n');
  
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false
      }
    });
    
    // Ler arquivo SQL
    console.log(`📄 Lendo migração: ${MIGRATION_FILE}`);
    const sql = readFileSync(MIGRATION_FILE, 'utf-8');
    console.log(`✅ ${sql.length} caracteres lidos\n`);
    
    // Executar via RPC (se disponível)
    console.log('⚙️  Tentando executar via RPC...');
    
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.log('⚠️  RPC não disponível, tentando método manual...\n');
      
      // Método manual: criar tabelas uma por uma
      console.log('📦 Criando tabelas individualmente...\n');
      
      // 1. feature_flags
      console.log('   [1/6] Criando feature_flags...');
      const { error: err1 } = await supabase.from('feature_flags').select('*').limit(0);
      if (err1 && err1.code === '42P01') {
        console.log('   ℹ️  Tabela não existe, precisa ser criada via SQL Editor');
      } else {
        console.log('   ✅ OK');
      }
      
      // 2-6. Outras tabelas...
      const tables = [
        'conhecimento_base',
        'tutor_logs', 
        'certificacoes_usuario',
        'legislacao_updates',
        'notificacoes_legislacao'
      ];
      
      for (let i = 0; i < tables.length; i++) {
        console.log(`   [${i+2}/6] Verificando ${tables[i]}...`);
        const { error: errN } = await supabase.from(tables[i]).select('*').limit(0);
        if (errN && errN.code === '42P01') {
          console.log('   ℹ️  Tabela não existe');
        } else {
          console.log('   ✅ OK');
        }
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  MIGRAÇÃO PRECISA SER APLICADA VIA SQL EDITOR');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('📋 INSTRUÇÕES:');
      console.log('   1. Abrir: https://supabase.com/dashboard/project/ttswvavcisdnonytslom/sql/new');
      console.log('   2. Colar o SQL da migração');
      console.log('   3. Clicar em RUN');
      console.log('   4. Executar: npm run db:validate\n');
      
      console.log('💡 O SQL está em:');
      console.log(`   ${MIGRATION_FILE}\n`);
      
      console.log('🔄 Ou copie novamente:');
      console.log('   cat supabase/migrations/0009_tutores_economia_corrigido.sql | pbcopy\n');
      
      return 1;
    }
    
    console.log('✅ Migração aplicada via RPC!\n');
    return 0;
    
  } catch (error) {
    console.error('\n❌ ERRO ao aplicar migração:');
    console.error(error.message);
    return 1;
  }
}

// ============================================
// EXECUTAR
// ============================================

applyMigration().then(code => process.exit(code));

