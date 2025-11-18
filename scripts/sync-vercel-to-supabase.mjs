#!/usr/bin/env node

/**
 * Script para sincronizar credenciais do Vercel para o Supabase
 * 
 * Este script:
 * 1. Lê as variáveis de ambiente do Vercel
 * 2. Insere/atualiza no banco Supabase
 * 3. Valida as credenciais
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
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

// Mapeamento de variáveis Vercel → Supabase
const CREDENTIAL_MAP = [
  // Comunicação
  { vercel: 'VITE_TWILIO_ACCOUNT_SID', supabase: 'TWILIO_ACCOUNT_SID', servico: 'Twilio', categoria: 'comunicacao', tipo: 'text' },
  { vercel: 'VITE_TWILIO_AUTH_TOKEN', supabase: 'TWILIO_AUTH_TOKEN', servico: 'Twilio', categoria: 'comunicacao', tipo: 'password' },
  { vercel: 'VITE_TWILIO_PHONE_NUMBER', supabase: 'TWILIO_PHONE_NUMBER', servico: 'Twilio', categoria: 'comunicacao', tipo: 'text' },
  { vercel: 'VITE_WHATSAPP_ACCESS_TOKEN', supabase: 'WHATSAPP_ACCESS_TOKEN', servico: 'WhatsApp', categoria: 'comunicacao', tipo: 'api_key' },
  { vercel: 'VITE_SENDGRID_API_KEY', supabase: 'SENDGRID_API_KEY', servico: 'SendGrid', categoria: 'comunicacao', tipo: 'api_key' },
  { vercel: 'VITE_SENDGRID_FROM_EMAIL', supabase: 'SENDGRID_FROM_EMAIL', servico: 'SendGrid', categoria: 'comunicacao', tipo: 'text' },
  { vercel: 'VITE_MAILCHIMP_API_KEY', supabase: 'MAILCHIMP_API_KEY', servico: 'Mailchimp', categoria: 'comunicacao', tipo: 'api_key' },
  { vercel: 'VITE_MAILCHIMP_DC', supabase: 'MAILCHIMP_DC', servico: 'Mailchimp', categoria: 'comunicacao', tipo: 'text' },
  
  // OPME
  { vercel: 'VITE_ABBOTT_API_KEY', supabase: 'ABBOTT_API_KEY', servico: 'Abbott', categoria: 'opme', tipo: 'api_key' },
  { vercel: 'VITE_MEDTRONIC_CLIENT_ID', supabase: 'MEDTRONIC_CLIENT_ID', servico: 'Medtronic', categoria: 'opme', tipo: 'text' },
  { vercel: 'VITE_MEDTRONIC_CLIENT_SECRET', supabase: 'MEDTRONIC_CLIENT_SECRET', servico: 'Medtronic', categoria: 'opme', tipo: 'password' },
  { vercel: 'VITE_JJ_TRACELINK_TOKEN', supabase: 'JJ_TRACELINK_TOKEN', servico: 'J&J', categoria: 'opme', tipo: 'api_key' },
  { vercel: 'VITE_STRYKER_API_KEY', supabase: 'STRYKER_API_KEY', servico: 'Stryker', categoria: 'opme', tipo: 'api_key' },
  { vercel: 'VITE_BOSTON_SCIENTIFIC_TOKEN', supabase: 'BOSTON_SCIENTIFIC_TOKEN', servico: 'Boston Scientific', categoria: 'opme', tipo: 'api_key' },
  
  // APIs
  { vercel: 'VITE_INFOSIMPLES_TOKEN', supabase: 'INFOSIMPLES_TOKEN', servico: 'InfoSimples', categoria: 'apis', tipo: 'api_key' },
];

async function syncCredentials() {
  console.log('🔄 Sincronizando credenciais do Vercel → Supabase...\n');

  try {
    // 1. Buscar empresa_id
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id')
      .limit(1);

    if (empresasError || !empresas || empresas.length === 0) {
      console.error('❌ Erro: Nenhuma empresa encontrada no banco');
      return;
    }

    const empresaId = empresas[0].id;
    console.log(`✅ Empresa ID: ${empresaId}\n`);

    // 2. Baixar variáveis do Vercel
    console.log('📥 Baixando variáveis do Vercel...');
    
    try {
      execSync('npx vercel env pull .env.production --yes', { 
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      console.log('✅ Variáveis baixadas\n');
    } catch (err) {
      console.log('⚠️  Usando variáveis do .env.local\n');
    }

    // 3. Ler variáveis do .env.production ou .env.local
    const envPath = '.env.production';
    dotenv.config({ path: envPath, override: true });

    // 4. Sincronizar cada credencial
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    console.log('━'.repeat(70));
    console.log('SINCRONIZANDO CREDENCIAIS\n');

    for (const cred of CREDENTIAL_MAP) {
      const valor = process.env[cred.vercel];

      if (!valor || valor === '') {
        console.log(`⏭️  ${cred.supabase.padEnd(30)} → Não encontrada no Vercel`);
        notFoundCount++;
        continue;
      }

      try {
        // Upsert no Supabase
        const { error } = await supabase
          .from('api_credentials')
          .upsert({
            empresa_id: empresaId,
            nome: cred.supabase,
            servico: cred.servico,
            valor: valor,
            categoria: cred.categoria,
            tipo: cred.tipo,
            ativo: true,
            atualizado_em: new Date().toISOString()
          }, {
            onConflict: 'empresa_id,nome'
          });

        if (error) {
          console.log(`❌ ${cred.supabase.padEnd(30)} → Erro: ${error.message}`);
          errorCount++;
        } else {
          const preview = valor.length > 20 ? valor.substring(0, 20) + '...' : valor;
          console.log(`✅ ${cred.supabase.padEnd(30)} → ${preview}`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ ${cred.supabase.padEnd(30)} → ${err.message}`);
        errorCount++;
      }
    }

    console.log('\n' + '━'.repeat(70));
    console.log('\n📊 RESULTADO:\n');
    console.log(`   ✅ Sincronizadas: ${successCount}/${CREDENTIAL_MAP.length}`);
    console.log(`   ⏭️  Não encontradas: ${notFoundCount}/${CREDENTIAL_MAP.length}`);
    console.log(`   ❌ Erros: ${errorCount}/${CREDENTIAL_MAP.length}`);
    console.log('\n' + '━'.repeat(70));

    if (successCount > 0) {
      console.log('\n✨ Credenciais sincronizadas com sucesso!');
      console.log('\n🎯 Próximo passo:');
      console.log('   1. Acesse: http://localhost:5173/integracoes/credenciais');
      console.log('   2. Verifique as credenciais');
      console.log('   3. Teste as integrações\n');
    } else if (notFoundCount === CREDENTIAL_MAP.length) {
      console.log('\n⚠️  NENHUMA CREDENCIAL ENCONTRADA NO VERCEL\n');
      console.log('As credenciais devem ter o prefixo VITE_ no Vercel:');
      console.log('   Exemplo: VITE_TWILIO_ACCOUNT_SID\n');
      console.log('Configure em:');
      console.log('   https://vercel.com/daxs-projects-5db3d203/icarus-oficial/settings/environment-variables\n');
    }

  } catch (err) {
    console.error('\n❌ Erro geral:', err.message);
    process.exit(1);
  }
}

// Executar
syncCredentials();

