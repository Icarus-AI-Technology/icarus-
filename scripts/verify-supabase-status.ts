#!/usr/bin/env tsx

/**
 * ICARUS-PRO: Supabase Status Verification
 * Checks current database state without requiring migrations
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 ICARUS-PRO: Supabase Status Check');
console.log('=====================================\n');

console.log(`📡 Connecting to: ${supabaseUrl}\n`);

// Critical tables to check
const CRITICAL_TABLES = [
  // Core system
  'empresas',
  'usuarios',
  'produtos',
  'lotes',
  'fornecedores',

  // Medical/Operations
  'medicos',
  'hospitais',
  'cirurgias',
  'kits',

  // Business
  'pedidos_compra',
  'faturas',
  'transacoes',
  'leads',

  // EDR Integration
  'edr_research_sessions',
  'edr_agent_tasks',
  'edr_search_results',
  'edr_reflection_logs',

  // Audit & Logs
  'audit_log',
  'activity_logs',
];

async function checkTable(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from(tableName).select('*').limit(1);

    if (error) {
      console.log(`  ✗ ${tableName} - ${error.message}`);
      return false;
    }

    console.log(`  ✓ ${tableName}`);
    return true;
  } catch (err) {
    console.log(`  ✗ ${tableName} - ${err instanceof Error ? err.message : 'Unknown error'}`);
    return false;
  }
}

async function checkEdgeFunctions() {
  console.log('\n⚡ Checking Edge Functions:\n');

  const functions = ['edr-orchestrator', 'edr-stream'];

  for (const funcName of functions) {
    try {
      const { data, error } = await supabase.functions.invoke(funcName, {
        body: { test: true },
      });

      if (error) {
        console.log(`  ✗ ${funcName} - ${error.message}`);
      } else {
        console.log(`  ✓ ${funcName}`);
      }
    } catch {
      console.log(`  ⊙ ${funcName} - Not deployed or not accessible`);
    }
  }
}

async function checkStorageBuckets() {
  console.log('\n🗄️  Checking Storage Buckets:\n');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log(`  ✗ Error listing buckets: ${error.message}`);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('  ⊙ No storage buckets found');
      return;
    }

    buckets.forEach((bucket) => {
      console.log(`  ✓ ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
  } catch (err) {
    console.log(`  ✗ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

async function getStatistics() {
  console.log('\n📊 Database Statistics:\n');

  const statsQueries = [
    { label: 'Empresas', table: 'empresas' },
    { label: 'Usuários', table: 'usuarios' },
    { label: 'Produtos', table: 'produtos' },
    { label: 'Cirurgias', table: 'cirurgias' },
    { label: 'EDR Sessions', table: 'edr_research_sessions' },
  ];

  for (const { label, table } of statsQueries) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        console.log(`  ${label}: ${count} records`);
      }
    } catch {
      // Skip if table doesn't exist
    }
  }
}

async function main() {
  console.log('📋 Checking Critical Tables:\n');

  let existingCount = 0;
  let missingCount = 0;

  for (const table of CRITICAL_TABLES) {
    const exists = await checkTable(table);
    if (exists) {
      existingCount++;
    } else {
      missingCount++;
    }
  }

  await checkEdgeFunctions();
  await checkStorageBuckets();
  await getStatistics();

  console.log('\n==========================================');
  console.log('Summary:');
  console.log(`  ✓ Existing tables: ${existingCount}/${CRITICAL_TABLES.length}`);
  console.log(`  ✗ Missing tables: ${missingCount}/${CRITICAL_TABLES.length}`);

  const completeness = (existingCount / CRITICAL_TABLES.length) * 100;
  console.log(`  📊 Completeness: ${completeness.toFixed(1)}%`);
  console.log('==========================================\n');

  if (completeness < 50) {
    console.log('⚠️  Database needs significant setup');
    console.log('Recommendation: Run migrations manually via Supabase Dashboard\n');
  } else if (completeness < 100) {
    console.log('⚠️  Some tables are missing');
    console.log('Recommendation: Apply missing migrations\n');
  } else {
    console.log('✅ Database is fully set up!\n');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
