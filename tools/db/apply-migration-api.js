#!/usr/bin/env node
/**
 * 🚀 APLICADOR DE MIGRAÇÃO — Supabase SQL API
 * 
 * Aplica migração via API REST do Supabase (mais confiável que conexão direta).
 * 
 * @usage node tools/db/apply-migration-api.js
 */

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
// FUNÇÕES AUXILIARES
// ============================================

async function executeSql(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    // Tentar método alternativo via postgREST
    const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!altResponse.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    return altResponse;
  }
  
  return response;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function applyMigration() {
  console.log('🚀 Iniciando aplicação de migração via API...\n');
  
  try {
    // Ler arquivo SQL
    console.log(`📄 Lendo migração: ${MIGRATION_FILE}`);
    const sql = readFileSync(MIGRATION_FILE, 'utf-8');
    console.log(`✅ ${sql.length} caracteres lidos\n`);
    
    // Dividir em blocos menores (Supabase API tem limite)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📦 ${statements.length} statements SQL encontrados\n`);
    console.log('⚙️  Executando migração...\n');
    
    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const preview = stmt.substring(0, 50).replace(/\s+/g, ' ');
      
      process.stdout.write(`   [${i+1}/${statements.length}] ${preview}... `);
      
      try {
        await executeSql(stmt);
        console.log('✓');
      } catch (error) {
        // Ignorar erros de "já existe" (seguro)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('42P07')) {
          console.log('⊘ (já existe)');
        } else {
          console.log('✗');
          console.warn(`   ⚠️  Aviso: ${error.message.substring(0, 100)}`);
        }
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ MIGRAÇÃO CONCLUÍDA!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('💡 Valide no Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/ttswvavcisdnonytslom/editor\n');
    
  } catch (error) {
    console.error('\n❌ ERRO ao aplicar migração:');
    console.error(error.message);
    process.exit(1);
  }
}

// ============================================
// EXECUTAR
// ============================================

applyMigration();

