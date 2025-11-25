#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCredentials() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║     STATUS DAS CREDENCIAIS - GATEWAY API                     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const { data, error } = await supabase
    .from('api_credentials')
    .select('nome, servico, categoria, tipo, valor, ativo')
    .order('categoria', { ascending: true })
    .order('servico', { ascending: true })
    .order('nome', { ascending: true });

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  // Agrupar por categoria
  const grupos = {
    comunicacao: [],
    opme: [],
    apis: [],
  };

  data.forEach((cred) => {
    const status =
      !cred.valor || cred.valor === '' ? '⏳ Disponível para Configuração' : '✅ Configurada';

    grupos[cred.categoria].push({
      ...cred,
      status,
    });
  });

  // Exibir Comunicação
  console.log('📱 COMUNICAÇÃO (8 credenciais)');
  console.log('─'.repeat(70));
  grupos.comunicacao.forEach((c) => {
    console.log(`   ${c.status} ${c.nome.padEnd(35)} [${c.tipo}]`);
  });

  console.log('\n🏥 OPME (6 credenciais)');
  console.log('─'.repeat(70));
  grupos.opme.forEach((c) => {
    console.log(`   ${c.status} ${c.nome.padEnd(35)} [${c.tipo}]`);
  });

  console.log('\n🔗 APIs (1 credencial)');
  console.log('─'.repeat(70));
  grupos.apis.forEach((c) => {
    console.log(`   ${c.status} ${c.nome.padEnd(35)} [${c.tipo}]`);
  });

  // Resumo
  const total = data.length;
  const configuradas = data.filter((c) => c.valor && c.valor !== '').length;
  const pendentes = total - configuradas;

  console.log('\n' + '═'.repeat(70));
  console.log('\n📊 RESUMO:');
  console.log(`   Total: ${total} credenciais`);
  console.log(`   ✅ Configuradas: ${configuradas}/${total}`);
  console.log(`   ⏳ Disponíveis para configuração: ${pendentes}/${total}`);
  console.log('\n' + '═'.repeat(70));

  console.log('\n🎯 COMO CONFIGURAR:\n');
  console.log('   Opção 1: Interface Web');
  console.log('   → http://localhost:5173/integracoes/credenciais\n');
  console.log('   Opção 2: Vercel + Sincronização');
  console.log('   → Configure no Vercel com prefixo VITE_');
  console.log('   → Execute: npm run sync:from-vercel\n');
  console.log('   Opção 3: Script Interativo');
  console.log('   → bash scripts/add-vercel-credentials.sh\n');
  console.log('═'.repeat(70) + '\n');
}

checkCredentials();
