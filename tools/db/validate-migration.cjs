#!/usr/bin/env node
/**
 * 🔍 VALIDADOR PÓS-MIGRAÇÃO — Supabase
 * 
 * Verifica se a migração 0009 foi aplicada com sucesso.
 * 
 * @usage node tools/db/validate-migration.js
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// CONFIGURAÇÃO
// ============================================

const SUPABASE_URL = 'https://ttswvavcisdnonytslom.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc';

const EXPECTED_TABLES = [
  'feature_flags',
  'conhecimento_base',
  'tutor_logs',
  'certificacoes_usuario',
  'legislacao_updates',
  'notificacoes_legislacao'
];

const EXPECTED_COLUMNS = {
  documentos_regulatorios: ['analise_ia_jsonb', 'status_conformidade']
};

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function validateMigration() {
  console.log('🔍 Validando migração 0009...\n');
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  let allValid = true;
  
  try {
    // 1. Verificar tabelas criadas
    console.log('📋 Verificando tabelas criadas...');
    
    for (const tableName of EXPECTED_TABLES) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (error && error.code !== 'PGRST116') {
        console.log(`   ❌ ${tableName} - NÃO ENCONTRADA`);
        allValid = false;
      } else {
        console.log(`   ✅ ${tableName} - OK`);
      }
    }
    
    // 2. Verificar colunas adicionadas (via RPC se disponível)
    console.log('\n📋 Verificando colunas adicionadas...');
    
    // Tentar query direta (pode falhar por RLS)
    const { data: docTest, error: docError } = await supabase
      .from('documentos_regulatorios')
      .select('analise_ia_jsonb, status_conformidade')
      .limit(0);
    
    if (docError && docError.code !== 'PGRST116' && !docError.message.includes('column')) {
      console.log('   ℹ️  Tabela documentos_regulatorios não encontrada (OK se não existir)');
    } else if (docError && docError.message.includes('column')) {
      console.log('   ❌ Colunas não adicionadas em documentos_regulatorios');
      allValid = false;
    } else {
      console.log('   ✅ Colunas adicionadas - OK');
    }
    
    // 3. Verificar extension vector
    console.log('\n📋 Verificando extensions...');
    console.log('   ℹ️  Extension "vector" - Verificar manualmente no dashboard');
    
    // 4. Resumo final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (allValid) {
      console.log('✅ MIGRAÇÃO VALIDADA COM SUCESSO!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🎯 PRÓXIMOS PASSOS:');
      console.log('   1. npm run ai:tutor:reindex    - Popular base de conhecimento');
      console.log('   2. curl -fsSL https://ollama.com/install.sh | sh');
      console.log('   3. ollama pull llama3.1:8b');
      console.log('   4. docker run -d -p 7700:7700 getmeili/meilisearch:latest\n');
      
      return 0;
    } else {
      console.log('⚠️  ALGUMAS VERIFICAÇÕES FALHARAM');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('💡 AÇÕES CORRETIVAS:');
      console.log('   1. Verificar se o SQL foi executado completamente');
      console.log('   2. Verificar logs de erro no Supabase Dashboard');
      console.log('   3. Reexecutar migração se necessário\n');
      
      return 1;
    }
    
  } catch (error) {
    console.error('\n❌ ERRO ao validar migração:');
    console.error(error.message);
    return 1;
  }
}

// ============================================
// EXECUTAR
// ============================================

validateMigration().then(code => process.exit(code));

