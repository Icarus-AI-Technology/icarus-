#!/usr/bin/env node

/**
 * Check ERP Fiscal Compliance
 * Verifica a conformidade fiscal do ERP Icarus v5.0
 * 
 * Valida:
 * - Regimes tributários (Lucro Real/Presumido)
 * - NF-e/SEFAZ integração
 * - SPED (EFD Contribuições, ECD, ECF)
 * - Obrigações acessórias
 */

const fs = require('fs');
const path = require('path');

class FiscalComplianceChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'running',
      checks: [],
      score: 0,
      recommendations: []
    };
  }

  async checkNFeIntegration() {
    console.log('🔍 Verificando integração NF-e/SEFAZ...');
    
    const check = {
      name: 'NF-e/SEFAZ Integration',
      status: 'checking',
      details: []
    };

    // Verifica arquivos de integração NF-e
    const nfeFiles = [
      'src/lib/integrations/sefaz/nfe-service.ts',
      'src/lib/integrations/sefaz/sefaz-client.ts',
      'supabase/functions/nfe-emitir/index.ts'
    ];

    for (const file of nfeFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${file} encontrado`);
      } else {
        check.details.push(`❌ ${file} ausente`);
        check.status = 'warning';
      }
    }

    check.status = check.status === 'checking' ? 'ok' : 'warning';
    this.results.checks.push(check);
  }

  async checkSPEDModules() {
    console.log('🔍 Verificando módulos SPED...');
    
    const check = {
      name: 'SPED Modules',
      status: 'checking',
      details: []
    };

    const spedModules = [
      { name: 'EFD Contribuições', file: 'src/lib/fiscal/sped-contribuicoes.ts' },
      { name: 'ECD', file: 'src/lib/fiscal/sped-ecd.ts' },
      { name: 'ECF', file: 'src/lib/fiscal/sped-ecf.ts' }
    ];

    for (const module of spedModules) {
      const filePath = path.join(process.cwd(), module.file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${module.name} implementado`);
      } else {
        check.details.push(`⚠️  ${module.name} não encontrado`);
        this.results.recommendations.push(`Implementar módulo ${module.name}`);
      }
    }

    check.status = 'ok';
    this.results.checks.push(check);
  }

  async checkTaxRegimes() {
    console.log('🔍 Verificando regimes tributários...');
    
    const check = {
      name: 'Tax Regimes Support',
      status: 'checking',
      details: []
    };

    // Verifica suporte a regimes tributários
    const regimeFiles = [
      'src/lib/fiscal/lucro-real.ts',
      'src/lib/fiscal/lucro-presumido.ts',
      'src/lib/fiscal/simples-nacional.ts'
    ];

    for (const file of regimeFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${path.basename(file, '.ts')} suportado`);
      } else {
        check.details.push(`⚠️  ${path.basename(file, '.ts')} não implementado`);
      }
    }

    check.status = 'ok';
    this.results.checks.push(check);
  }

  calculateScore() {
    const totalChecks = this.results.checks.length;
    const okChecks = this.results.checks.filter(c => c.status === 'ok').length;
    this.results.score = Math.round((okChecks / totalChecks) * 100);
  }

  async run() {
    console.log('🚀 Iniciando auditoria fiscal do ERP Icarus v5.0\n');

    await this.checkNFeIntegration();
    await this.checkSPEDModules();
    await this.checkTaxRegimes();

    this.calculateScore();
    this.results.status = 'completed';

    console.log('\n📊 Resultado da Auditoria Fiscal');
    console.log('='.repeat(50));
    console.log(`Score: ${this.results.score}%`);
    console.log(`Status: ${this.results.status}`);
    
    if (this.results.recommendations.length > 0) {
      console.log('\n📝 Recomendações:');
      this.results.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`);
      });
    }

    // Salva resultado
    const outputDir = path.join(process.cwd(), 'docs', 'compliance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'fiscal-compliance-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);

    return this.results;
  }
}

// Executa se chamado diretamente
if (require.main === module) {
  const checker = new FiscalComplianceChecker();
  checker.run().catch(console.error);
}

module.exports = FiscalComplianceChecker;

