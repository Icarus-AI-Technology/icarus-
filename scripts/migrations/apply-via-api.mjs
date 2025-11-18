#!/usr/bin/env node

/**
 * Aplicar migrações via Supabase API
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvbkviozlhxorjoavmky.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2Ymt2aW96bGh4b3Jqb2F2bWt5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxNDc2NSwiZXhwIjoyMDc4OTkwNzY1fQ.9PaCxFGQdRhM00Cf3LSEn6PuBz1hcG1Pds1Kjp4XnL0';

console.log('🚀 Aplicando migrações via Supabase API...\n');

// Ler arquivo consolidado
const sql = readFileSync('supabase/migrations_consolidated.sql', 'utf8');

console.log(`📊 Tamanho do SQL: ${(sql.length / 1024 / 1024).toFixed(2)} MB`);
console.log(`📝 Total de linhas: ${sql.split('\n').length}`);
console.log('');

// Tentar aplicar via REST API
console.log('⚠️  ATENÇÃO: Migrações grandes via API podem dar timeout.');
console.log('📝 Recomendação: Use o Dashboard Supabase SQL Editor');
console.log('');
console.log('🔗 Acesse: https://supabase.com/dashboard/project/gvbkviozlhxorjoavmky/sql');
console.log('');
console.log('📋 Passos:');
console.log('1. Copie o conteúdo de: supabase/migrations_consolidated.sql');
console.log('2. Cole no SQL Editor');
console.log('3. Execute (⏱️  ~5-10 minutos)');
console.log('');
console.log('Ou use os blocos menores:');
console.log('📦 supabase/migrations_blocks/block_01.sql até block_10.sql');
console.log('');

process.exit(0);

