#!/usr/bin/env node

/**
 * Check ERP Legal Compliance
 * Verifica conformidade legal do ERP (ANVISA, ANS, LGPD, ISO 13485)
 */

const fs = require('fs');
const path = require('path');

class LegalComplianceChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'running',
      checks: [],
      score: 0,
      recommendations: []
    };
  }

  async checkANVISACompliance() {
    console.log('🔍 Verificando conformidade ANVISA...');
    
    const check = {
      name: 'ANVISA Compliance (OPME)',
      status: 'checking',
      details: [],
      regulations: [
        'RDC 16/2013 - Boas Práticas de Distribuição',
        'RDC 23/2012 - Rastreabilidade',
        'UDI (Unique Device Identification)'
      ]
    };

    // Verifica módulos de rastreabilidade
    const anvisaModules = [
      'src/lib/compliance/anvisa/udi-tracker.ts',
      'src/lib/compliance/anvisa/batch-control.ts',
      'supabase/functions/anvisa-report/index.ts'
    ];

    for (const file of anvisaModules) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${file} implementado`);
      } else {
        check.details.push(`❌ ${file} ausente`);
        this.results.recommendations.push({
          priority: 'critico',
          item: `Implementar ${path.basename(file)} para conformidade ANVISA`
        });
      }
    }

    check.status = 'warning';
    this.results.checks.push(check);
  }

  async checkANSCompliance() {
    console.log('🔍 Verificando conformidade ANS/TISS...');
    
    const check = {
      name: 'ANS/TISS Compliance',
      status: 'checking',
      details: [],
      standards: [
        'TISS 4.06.00',
        'Guias SP/SADT',
        'Padrão XML para envio'
      ]
    };

    const tissModules = [
      'src/lib/integrations/ans/tiss-validator.ts',
      'src/lib/integrations/ans/guia-spsadt.ts',
      'supabase/functions/tiss-enviar/index.ts'
    ];

    for (const file of tissModules) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${file} implementado`);
      } else {
        check.details.push(`⚠️  ${file} não encontrado`);
        this.results.recommendations.push({
          priority: 'critico',
          item: `Implementar ${path.basename(file)} para faturamento ANS`
        });
      }
    }

    check.status = 'warning';
    this.results.checks.push(check);
  }

  async checkLGPDCompliance() {
    console.log('🔍 Verificando conformidade LGPD...');
    
    const check = {
      name: 'LGPD (Lei Geral de Proteção de Dados)',
      status: 'checking',
      details: [],
      requirements: [
        'Política de Privacidade',
        'Termos de Consentimento',
        'RLS (Row Level Security)',
        'Logs de Acesso',
        'Direito ao Esquecimento'
      ]
    };

    // Verifica políticas RLS no Supabase
    const rlsFile = path.join(process.cwd(), 'supabase', 'migrations');
    if (fs.existsSync(rlsFile)) {
      const migrations = fs.readdirSync(rlsFile);
      const rlsMigrations = migrations.filter(m => m.includes('rls') || m.includes('policies'));
      
      if (rlsMigrations.length > 0) {
        check.details.push(`✅ ${rlsMigrations.length} políticas RLS encontradas`);
      } else {
        check.details.push(`⚠️  Nenhuma política RLS encontrada`);
        this.results.recommendations.push({
          priority: 'critico',
          item: 'Implementar políticas RLS para todas as tabelas sensíveis'
        });
      }
    }

    // Verifica módulo de consentimento
    const consentModule = path.join(process.cwd(), 'src/lib/lgpd/consent-manager.ts');
    if (fs.existsSync(consentModule)) {
      check.details.push(`✅ Módulo de consentimento implementado`);
    } else {
      check.details.push(`❌ Módulo de consentimento ausente`);
      this.results.recommendations.push({
        priority: 'medio',
        item: 'Implementar gerenciamento de consentimento LGPD'
      });
    }

    check.status = 'warning';
    this.results.checks.push(check);
  }

  async checkISO13485() {
    console.log('🔍 Verificando conformidade ISO 13485...');
    
    const check = {
      name: 'ISO 13485 (Sistema de Gestão da Qualidade)',
      status: 'checking',
      details: [],
      requirements: [
        'Rastreabilidade de produtos médicos',
        'Controle de não-conformidades',
        'Gestão de reclamações',
        'Validação de processos'
      ]
    };

    const qualityModules = [
      'src/lib/quality/non-conformity.ts',
      'src/lib/quality/complaints.ts',
      'src/lib/quality/traceability.ts'
    ];

    for (const file of qualityModules) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        check.details.push(`✅ ${path.basename(file)} implementado`);
      } else {
        check.details.push(`⚠️  ${path.basename(file)} não encontrado`);
        this.results.recommendations.push({
          priority: 'medio',
          item: `Implementar ${path.basename(file)} para ISO 13485`
        });
      }
    }

    check.status = 'warning';
    this.results.checks.push(check);
  }

  calculateScore() {
    const totalChecks = this.results.checks.length;
    const okChecks = this.results.checks.filter(c => c.status === 'ok').length;
    const warningChecks = this.results.checks.filter(c => c.status === 'warning').length;
    
    // Score ponderado: ok = 100%, warning = 50%
    this.results.score = Math.round(((okChecks * 100 + warningChecks * 50) / totalChecks));
  }

  async run() {
    console.log('⚖️  Iniciando auditoria legal do ERP Icarus v5.0\n');

    await this.checkANVISACompliance();
    await this.checkANSCompliance();
    await this.checkLGPDCompliance();
    await this.checkISO13485();

    this.calculateScore();
    this.results.status = 'completed';

    console.log('\n📊 Resultado da Auditoria Legal');
    console.log('='.repeat(60));
    console.log(`Score: ${this.results.score}%`);
    console.log(`Status: ${this.results.status}`);
    
    if (this.results.recommendations.length > 0) {
      console.log('\n📝 Recomendações por Prioridade:\n');
      
      const criticos = this.results.recommendations.filter(r => r.priority === 'critico');
      const medios = this.results.recommendations.filter(r => r.priority === 'medio');
      
      if (criticos.length > 0) {
        console.log('🔴 CRÍTICO:');
        criticos.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec.item}`);
        });
      }
      
      if (medios.length > 0) {
        console.log('\n🟡 MÉDIO:');
        medios.forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec.item}`);
        });
      }
    }

    // Salva resultado
    const outputDir = path.join(process.cwd(), 'docs', 'compliance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'legal-compliance-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);

    return this.results;
  }
}

if (require.main === module) {
  const checker = new LegalComplianceChecker();
  checker.run().catch(console.error);
}

module.exports = LegalComplianceChecker;

