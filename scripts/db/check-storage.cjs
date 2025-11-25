#!/usr/bin/env node

/**
 * Verificar configuração do Storage Bucket icarus_new
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ttswvavcisdnonytslom.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada\n');
  console.log('Configure com:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkStorage() {
  console.log('🔍 VERIFICANDO STORAGE: icarus_new\n');

  try {
    // Listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log(`❌ Erro ao listar buckets: ${bucketsError.message}\n`);
      return;
    }

    const icarusNew = buckets.find((b) => b.id === 'icarus_new');

    if (!icarusNew) {
      console.log('❌ Bucket icarus_new NÃO ENCONTRADO\n');
      console.log('📋 Buckets disponíveis:');
      buckets.forEach((b) => console.log(`   - ${b.id} (${b.public ? 'público' : 'privado'})`));
      console.log('\n🔧 Para criar, siga: docs/GUIA_STORAGE_ICARUS_NEW.md\n');
      return;
    }

    console.log('✅ Bucket icarus_new encontrado!\n');
    console.log('📦 CONFIGURAÇÃO:\n');
    console.log(`   ID: ${icarusNew.id}`);
    console.log(`   Nome: ${icarusNew.name}`);
    console.log(`   Público: ${icarusNew.public ? '🔓 Sim' : '🔒 Não (privado)'}`);
    console.log(`   Criado em: ${new Date(icarusNew.created_at).toLocaleString('pt-BR')}`);
    console.log('');

    // Tentar listar arquivos
    const { data: files, error: filesError } = await supabase.storage
      .from('icarus_new')
      .list('', { limit: 5 });

    if (filesError) {
      console.log(`⚠️  Não foi possível listar arquivos: ${filesError.message}`);
      console.log('   (Isso pode ser normal se ainda não há arquivos)\n');
    } else {
      console.log(`📁 ARQUIVOS:\n`);
      if (files.length === 0) {
        console.log('   (Nenhum arquivo ainda)');
      } else {
        files.forEach((f) => {
          console.log(`   - ${f.name} (${(f.metadata?.size / 1024).toFixed(2)} KB)`);
        });
      }
      console.log('');
    }

    console.log('✅ STATUS: Bucket configurado e acessível!\n');
    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('1. Configurar policies RLS (ver docs/GUIA_STORAGE_ICARUS_NEW.md)');
    console.log('2. Testar upload no frontend');
    console.log('3. Acessar: Dashboard → Storage → icarus_new\n');
    console.log(`🔗 URL: ${SUPABASE_URL}/storage/v1/object/public/icarus_new/\n`);
  } catch (err) {
    console.log(`❌ Erro: ${err.message}\n`);
  }
}

checkStorage();
