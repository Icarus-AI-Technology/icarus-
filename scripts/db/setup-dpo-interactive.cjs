#!/usr/bin/env node

/**
 * Configuração do DPO (Encarregado de Proteção de Dados)
 * Versão Node.js interativa
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ttswvavcisdnonytslom.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não configurada\n');
  console.log('Configure com:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDPO() {
  console.log('\n🛡️  CONFIGURAÇÃO DO DPO (LGPD Art. 41)\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('📋 INFORMAÇÕES NECESSÁRIAS:\n');
  
  // Coletar dados
  const nome = await question('Nome completo do DPO: ');
  const email = await question('E-mail institucional (ex: dpo@icarusai.com.br): ');
  const telefone = await question('Telefone (ex: (11) 98765-4321): ');
  const cpf = await question('CPF (opcional - Enter para pular): ');
  
  console.log('\nTipo de DPO:');
  console.log('  1) Interno (funcionário da empresa)');
  console.log('  2) Externo (consultoria/terceirizado)');
  const tipoOpt = await question('Escolha (1 ou 2): ');
  const tipo = tipoOpt === '2' ? 'externo' : 'interno';
  
  const cnpj = await question('\nCNPJ da empresa (formato: XX.XXX.XXX/0001-XX): ');
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📝 DADOS INFORMADOS:\n');
  console.log(`   Nome: ${nome}`);
  console.log(`   E-mail: ${email}`);
  console.log(`   Telefone: ${telefone}`);
  console.log(`   CPF: ${cpf || '(não informado)'}`);
  console.log(`   Tipo: ${tipo}`);
  console.log(`   CNPJ: ${cnpj}\n`);
  
  const confirma = await question('Confirma os dados? (S/n): ');
  
  if (confirma.toLowerCase() === 'n') {
    console.log('\n❌ Configuração cancelada.\n');
    rl.close();
    return;
  }
  
  console.log('\n⚙️  Salvando no banco de dados...\n');
  
  try {
    // Buscar empresa pelo CNPJ
    const { data: empresas, error: empresaError } = await supabase
      .from('empresas')
      .select('id, nome')
      .eq('cnpj', cnpj.replace(/[^\d]/g, ''))
      .limit(1);
    
    if (empresaError) throw empresaError;
    
    if (!empresas || empresas.length === 0) {
      console.log('❌ Empresa não encontrada com CNPJ:', cnpj);
      console.log('\n💡 Crie a empresa primeiro ou verifique o CNPJ.\n');
      rl.close();
      return;
    }
    
    const empresa = empresas[0];
    console.log(`✅ Empresa encontrada: ${empresa.nome}\n`);
    
    // Atualizar dados do DPO
    const { error: updateError } = await supabase
      .from('empresas')
      .update({
        dpo_nome: nome,
        dpo_email: email,
        dpo_telefone: telefone,
        dpo_cpf: cpf || null,
        dpo_tipo: tipo,
        dpo_nomeado_em: new Date().toISOString()
      })
      .eq('id', empresa.id);
    
    if (updateError) throw updateError;
    
    console.log('✅ DPO configurado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 PRÓXIMOS PASSOS:\n');
    console.log('1. ✅ Preencher termo de designação:');
    console.log('   → docs/lgpd/termo_designacao_dpo.md\n');
    console.log('2. ✅ Criar e-mail institucional:');
    console.log(`   → ${email}\n`);
    console.log('3. ✅ Publicar no site (footer):');
    console.log('   → Ver docs/lgpd/GUIA_RAPIDO_DPO.md\n');
    console.log('4. ✅ Comunicar à equipe:');
    console.log('   → docs/lgpd/email_comunicacao_dpo.md\n');
    console.log('5. ✅ Fazer curso LGPD (40h):');
    console.log('   → Ver recomendações em GUIA_RAPIDO_DPO.md\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Configuração concluída!\n');
    
  } catch (err) {
    console.log(`\n❌ Erro ao salvar: ${err.message}\n`);
  }
  
  rl.close();
}

setupDPO();

