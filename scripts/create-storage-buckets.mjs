#!/usr/bin/env node
/**
 * Criador Automático de Storage Buckets - Supabase
 * Cria os 5 buckets faltantes via API REST
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://ttswvavcisdnonytslom.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c3d2YXZjaXNkbm9ueXRzbG9tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzMTUzOSwiZXhwIjoyMDc2NDA3NTM5fQ.5-hOqi1jCpHfqRhlixWxKUc0nkyvchkbwEGmdKuGWzc';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuração dos buckets
const BUCKETS = [
  {
    id: 'cirurgias',
    name: 'cirurgias',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  {
    id: 'faturamento',
    name: 'faturamento',
    public: false,
    file_size_limit: 20971520, // 20MB
    allowed_mime_types: ['application/pdf', 'image/*', 'application/xml', 'text/xml']
  },
  {
    id: 'compliance',
    name: 'compliance',
    public: false,
    file_size_limit: 52428800, // 50MB
    allowed_mime_types: ['image/*', 'application/pdf', 'application/*', 'video/*']
  },
  {
    id: 'consignacao',
    name: 'consignacao',
    public: false,
    file_size_limit: 20971520, // 20MB
    allowed_mime_types: ['image/*', 'application/pdf']
  },
  {
    id: 'uploads',
    name: 'uploads',
    public: false,
    file_size_limit: 52428800, // 50MB (limite da API)
    allowed_mime_types: null // Aceita todos os tipos
  }
];

async function listBuckets() {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao listar buckets: ${response.statusText}`);
  }
  
  return await response.json();
}

async function createBucket(bucket) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bucket)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro ao criar bucket ${bucket.name}: ${error}`);
  }
  
  return await response.json();
}

async function main() {
  log('\n' + '='.repeat(80), 'magenta');
  log('📦 CRIADOR AUTOMÁTICO DE STORAGE BUCKETS', 'magenta');
  log('='.repeat(80) + '\n', 'magenta');
  
  try {
    // 1. Listar buckets existentes
    log('🔍 Verificando buckets existentes...', 'blue');
    const existingBuckets = await listBuckets();
    const existingNames = existingBuckets.map(b => b.name);
    
    log(`✅ Encontrados ${existingBuckets.length} buckets:\n`, 'green');
    existingBuckets.forEach(b => {
      log(`   📌 ${b.name} (${b.public ? 'público' : 'privado'})`, 'cyan');
    });
    
    // 2. Criar buckets faltantes
    log('\n' + '━'.repeat(80), 'cyan');
    log('📦 Criando buckets faltantes...', 'cyan');
    log('━'.repeat(80) + '\n', 'cyan');
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const bucket of BUCKETS) {
      if (existingNames.includes(bucket.name)) {
        log(`⏭️  ${bucket.name}: Já existe`, 'yellow');
        skipped++;
        continue;
      }
      
      try {
        log(`📦 Criando bucket: ${bucket.name}...`, 'blue');
        await createBucket(bucket);
        log(`   ✅ Bucket ${bucket.name} criado com sucesso!`, 'green');
        log(`      • Tamanho máximo: ${(bucket.file_size_limit / 1048576).toFixed(0)}MB`, 'cyan');
        log(`      • Público: ${bucket.public ? 'Sim' : 'Não'}`, 'cyan');
        log(`      • Tipos permitidos: ${bucket.allowed_mime_types ? bucket.allowed_mime_types.join(', ') : 'Todos'}`, 'cyan');
        created++;
      } catch (error) {
        log(`   ❌ Erro ao criar ${bucket.name}: ${error.message}`, 'red');
        errors++;
      }
      
      log(''); // Linha em branco
    }
    
    // 3. Listar buckets finais
    log('━'.repeat(80), 'cyan');
    log('📊 Verificando buckets finais...', 'blue');
    log('━'.repeat(80) + '\n', 'cyan');
    
    const finalBuckets = await listBuckets();
    log(`✅ Total de buckets: ${finalBuckets.length}\n`, 'green');
    finalBuckets.forEach(b => {
      const isNew = !existingNames.includes(b.name);
      log(`   ${isNew ? '🆕' : '📌'} ${b.name} ${isNew ? '(novo)' : ''}`, isNew ? 'green' : 'cyan');
    });
    
    // 4. Resumo
    log('\n' + '='.repeat(80), 'magenta');
    log('📋 RESUMO', 'magenta');
    log('='.repeat(80), 'magenta');
    log(`Buckets criados:   ${created}`, created > 0 ? 'green' : 'yellow');
    log(`Buckets existentes: ${skipped}`, 'yellow');
    log(`Erros:             ${errors}`, errors > 0 ? 'red' : 'green');
    log(`Total final:       ${finalBuckets.length}/6`, finalBuckets.length >= 6 ? 'green' : 'yellow');
    
    const completude = Math.round((finalBuckets.length / 6) * 100);
    log(`\nCompletude:        ${completude}%`, completude === 100 ? 'green' : 'yellow');
    
    if (finalBuckets.length >= 6) {
      log('\n🎉 TODOS OS STORAGE BUCKETS CRIADOS!', 'green');
      log('✅ Sistema 100% completo!', 'green');
    } else {
      log(`\n⚠️  Ainda faltam ${6 - finalBuckets.length} buckets`, 'yellow');
    }
    
    log('='.repeat(80) + '\n', 'magenta');
    
  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);

