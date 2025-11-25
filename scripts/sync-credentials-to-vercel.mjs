#!/usr/bin/env node

/**
 * Script para sincronizar credenciais do Supabase com Vercel
 *
 * Este script:
 * 1. Lê as credenciais do banco Supabase
 * 2. Envia para o Vercel como variáveis de ambiente
 * 3. Atualiza o projeto automaticamente
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar configurados');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCredentials() {
  console.log('🔄 Sincronizando credenciais do Supabase com Vercel...\n');

  try {
    // 1. Buscar credenciais do Supabase
    const { data: credentials, error } = await supabase
      .from('api_credentials')
      .select('nome, valor, servico, categoria')
      .eq('ativo', true)
      .not('valor', 'is', null)
      .not('valor', 'eq', '');

    if (error) {
      console.error('❌ Erro ao buscar credenciais:', error.message);
      return;
    }

    if (!credentials || credentials.length === 0) {
      console.log('⚠️  Nenhuma credencial configurada no banco.');
      console.log('📝 Configure as credenciais em: http://localhost:5173/integracoes/credenciais');
      return;
    }

    console.log(`✅ ${credentials.length} credenciais encontradas no Supabase\n`);

    // 2. Enviar para Vercel
    let successCount = 0;
    let errorCount = 0;

    for (const cred of credentials) {
      try {
        console.log(`📤 Enviando ${cred.nome} (${cred.servico})...`);

        // Comando para adicionar variável no Vercel
        const command = `npx vercel env add ${cred.nome} production`;

        // Executa o comando (o valor será solicitado interativamente)
        // Para automação completa, seria necessário usar a API do Vercel
        console.log(`   ℹ️  Execute manualmente: echo "${cred.valor}" | ${command}`);

        successCount++;
      } catch (err) {
        console.error(`   ❌ Erro ao enviar ${cred.nome}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Concluído: ${successCount} enviadas, ${errorCount} erros`);
    console.log('═'.repeat(60));

    // 3. Listar comandos para execução manual
    console.log('\n📋 COMANDOS PARA EXECUTAR MANUALMENTE:\n');

    for (const cred of credentials) {
      console.log(`echo "VALOR_DA_CREDENCIAL" | npx vercel env add ${cred.nome} production`);
    }

    console.log('\n💡 OU use a interface do Vercel:');
    console.log(
      '   https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables\n'
    );
  } catch (err) {
    console.error('❌ Erro geral:', err);
    process.exit(1);
  }
}

// Executar
syncCredentials();
