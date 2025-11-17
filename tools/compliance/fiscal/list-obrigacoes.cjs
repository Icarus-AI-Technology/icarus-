#!/usr/bin/env node

/**
 * List Tax Obligations
 * Lista todas as obrigações fiscais e acessórias aplicáveis
 */

const fs = require('fs');
const path = require('path');

const obrigacoes = {
  federais: [
    {
      nome: 'DCTF',
      descricao: 'Declaração de Débitos e Créditos Tributários Federais',
      periodicidade: 'Mensal',
      prazo: '15º dia útil do mês subsequente',
      prioridade: 'critico'
    },
    {
      nome: 'EFD-Contribuições',
      descricao: 'Escrituração Fiscal Digital das Contribuições',
      periodicidade: 'Mensal',
      prazo: '10º dia útil do 2º mês subsequente',
      prioridade: 'critico'
    },
    {
      nome: 'ECF',
      descricao: 'Escrituração Contábil Fiscal',
      periodicidade: 'Anual',
      prazo: 'Último dia útil de julho',
      prioridade: 'critico'
    },
    {
      nome: 'ECD',
      descricao: 'Escrituração Contábil Digital',
      periodicidade: 'Anual',
      prazo: 'Último dia útil de maio',
      prioridade: 'critico'
    },
    {
      nome: 'DIRF',
      descricao: 'Declaração do Imposto de Renda Retido na Fonte',
      periodicidade: 'Anual',
      prazo: 'Último dia útil de fevereiro',
      prioridade: 'critico'
    }
  ],
  estaduais: [
    {
      nome: 'GIA',
      descricao: 'Guia de Informação e Apuração do ICMS',
      periodicidade: 'Mensal',
      prazo: 'Varia por estado',
      prioridade: 'critico'
    },
    {
      nome: 'SINTEGRA',
      descricao: 'Sistema Integrado de Informações sobre Operações Interestaduais',
      periodicidade: 'Mensal',
      prazo: 'Varia por estado',
      prioridade: 'medio'
    }
  ],
  municipais: [
    {
      nome: 'DMS',
      descricao: 'Declaração Mensal de Serviços',
      periodicidade: 'Mensal',
      prazo: 'Varia por município',
      prioridade: 'medio'
    }
  ],
  especificas_opme: [
    {
      nome: 'ANVISA - Relatórios',
      descricao: 'Relatórios de comercialização de produtos OPME',
      periodicidade: 'Trimestral/Anual',
      prazo: 'Conforme RDC específica',
      prioridade: 'critico'
    },
    {
      nome: 'ANS - TISS',
      descricao: 'Padrão TISS para faturamento',
      periodicidade: 'Por evento',
      prazo: 'Conforme contrato',
      prioridade: 'critico'
    }
  ]
};

function generateReport() {
  console.log('📋 Obrigações Fiscais e Acessórias - Icarus v5.0');
  console.log('='.repeat(60));
  console.log('\n');

  // Federais
  console.log('🇧🇷 OBRIGAÇÕES FEDERAIS');
  console.log('-'.repeat(60));
  obrigacoes.federais.forEach((obr, i) => {
    console.log(`\n${i + 1}. ${obr.nome} [${obr.prioridade.toUpperCase()}]`);
    console.log(`   ${obr.descricao}`);
    console.log(`   Periodicidade: ${obr.periodicidade}`);
    console.log(`   Prazo: ${obr.prazo}`);
  });

  // Estaduais
  console.log('\n\n📍 OBRIGAÇÕES ESTADUAIS');
  console.log('-'.repeat(60));
  obrigacoes.estaduais.forEach((obr, i) => {
    console.log(`\n${i + 1}. ${obr.nome} [${obr.prioridade.toUpperCase()}]`);
    console.log(`   ${obr.descricao}`);
    console.log(`   Periodicidade: ${obr.periodicidade}`);
    console.log(`   Prazo: ${obr.prazo}`);
  });

  // Municipais
  console.log('\n\n🏛️  OBRIGAÇÕES MUNICIPAIS');
  console.log('-'.repeat(60));
  obrigacoes.municipais.forEach((obr, i) => {
    console.log(`\n${i + 1}. ${obr.nome} [${obr.prioridade.toUpperCase()}]`);
    console.log(`   ${obr.descricao}`);
    console.log(`   Periodicidade: ${obr.periodicidade}`);
    console.log(`   Prazo: ${obr.prazo}`);
  });

  // Específicas OPME
  console.log('\n\n⚕️  OBRIGAÇÕES ESPECÍFICAS OPME');
  console.log('-'.repeat(60));
  obrigacoes.especificas_opme.forEach((obr, i) => {
    console.log(`\n${i + 1}. ${obr.nome} [${obr.prioridade.toUpperCase()}]`);
    console.log(`   ${obr.descricao}`);
    console.log(`   Periodicidade: ${obr.periodicidade}`);
    console.log(`   Prazo: ${obr.prazo}`);
  });

  // Salva em arquivo
  const outputDir = path.join(process.cwd(), 'docs', 'compliance');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'obrigacoes-fiscais.json');
  fs.writeFileSync(outputFile, JSON.stringify(obrigacoes, null, 2));
  
  console.log(`\n\n💾 Relatório salvo em: ${outputFile}`);
  
  return obrigacoes;
}

if (require.main === module) {
  generateReport();
}

module.exports = { obrigacoes, generateReport };

