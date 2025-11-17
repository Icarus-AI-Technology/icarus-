#!/usr/bin/env node

/**
 * Contracts Audit
 * Audita contratos e documentos legais
 */

const fs = require('fs');
const path = require('path');

class ContractsAuditor {
  constructor() {
    this.contracts = [];
    this.issues = [];
  }

  checkContractTemplates() {
    console.log('📄 Auditando Templates de Contratos...');
    
    const templates = [
      {
        type: 'fornecedor',
        file: 'docs/templates/contrato-fornecedor.md',
        required: true,
        clauses: [
          'Identificação das partes',
          'Objeto do contrato',
          'Preço e forma de pagamento',
          'Prazo e vigência',
          'Garantia de produtos',
          'Conformidade regulatória (ANVISA)',
          'Rescisão',
          'Foro'
        ]
      },
      {
        type: 'cliente-hospital',
        file: 'docs/templates/contrato-cliente-hospital.md',
        required: true,
        clauses: [
          'Identificação das partes',
          'Escopo dos serviços',
          'Condições comerciais',
          'Consignação de produtos',
          'Responsabilidades',
          'Conformidade ANS/TISS',
          'SLA e atendimento',
          'Rescisão'
        ]
      },
      {
        type: 'representante-comercial',
        file: 'docs/templates/contrato-representante.md',
        required: false,
        clauses: [
          'Identificação das partes',
          'Território de atuação',
          'Comissões',
          'Exclusividade',
          'Prazo',
          'Rescisão'
        ]
      }
    ];

    templates.forEach(template => {
      const filePath = path.join(process.cwd(), template.file);
      const exists = fs.existsSync(filePath);

      this.contracts.push({
        type: template.type,
        exists,
        required: template.required,
        clauses: template.clauses,
        path: template.file
      });

      if (template.required && !exists) {
        this.issues.push({
          severity: 'alto',
          type: 'template_ausente',
          message: `Template de contrato ${template.type} não encontrado`,
          action: `Criar template em ${template.file}`
        });
      }
    });
  }

  checkLegalDocuments() {
    console.log('📋 Verificando Documentos Legais Obrigatórios...');

    const documents = [
      {
        name: 'Política de Privacidade',
        file: 'docs/legal/politica-privacidade.md',
        required: true,
        lgpd: true
      },
      {
        name: 'Termos de Uso',
        file: 'docs/legal/termos-uso.md',
        required: true,
        lgpd: false
      },
      {
        name: 'Política de Cookies',
        file: 'docs/legal/politica-cookies.md',
        required: false,
        lgpd: true
      },
      {
        name: 'Manual de Conformidade ANVISA',
        file: 'docs/legal/manual-anvisa.md',
        required: true,
        lgpd: false
      }
    ];

    documents.forEach(doc => {
      const filePath = path.join(process.cwd(), doc.file);
      const exists = fs.existsSync(filePath);

      if (doc.required && !exists) {
        this.issues.push({
          severity: doc.lgpd ? 'critico' : 'alto',
          type: 'documento_legal_ausente',
          message: `${doc.name} não encontrado${doc.lgpd ? ' (LGPD)' : ''}`,
          action: `Criar documento em ${doc.file}`
        });
      }
    });
  }

  generateReport() {
    console.log('\n⚖️  Relatório de Auditoria de Contratos - Icarus v5.0');
    console.log('='.repeat(60));
    
    // Contratos
    console.log('\n📄 TEMPLATES DE CONTRATOS');
    console.log('-'.repeat(60));
    this.contracts.forEach(contract => {
      const status = contract.exists ? '✅' : (contract.required ? '❌' : '⚠️');
      console.log(`${status} ${contract.type}`);
      if (!contract.exists && contract.required) {
        console.log(`   Ação: Criar template em ${contract.path}`);
      }
    });

    // Issues
    if (this.issues.length > 0) {
      console.log('\n\n🚨 PENDÊNCIAS IDENTIFICADAS');
      console.log('-'.repeat(60));
      
      const criticos = this.issues.filter(i => i.severity === 'critico');
      const altos = this.issues.filter(i => i.severity === 'alto');
      
      if (criticos.length > 0) {
        console.log('\n🔴 CRÍTICO (LGPD):');
        criticos.forEach((issue, i) => {
          console.log(`\n${i + 1}. ${issue.message}`);
          console.log(`   Ação: ${issue.action}`);
        });
      }
      
      if (altos.length > 0) {
        console.log('\n🟠 ALTO:');
        altos.forEach((issue, i) => {
          console.log(`\n${i + 1}. ${issue.message}`);
          console.log(`   Ação: ${issue.action}`);
        });
      }
    } else {
      console.log('\n✅ Nenhuma pendência crítica identificada');
    }

    this.saveReport();
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'compliance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      contracts: this.contracts,
      issues: this.issues,
      summary: {
        total_contracts: this.contracts.length,
        existing_contracts: this.contracts.filter(c => c.exists).length,
        total_issues: this.issues.length,
        critical_issues: this.issues.filter(i => i.severity === 'critico').length,
        high_issues: this.issues.filter(i => i.severity === 'alto').length
      }
    };

    const outputFile = path.join(outputDir, 'contracts-audit-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  run() {
    this.checkContractTemplates();
    this.checkLegalDocuments();
    this.generateReport();
  }
}

if (require.main === module) {
  const auditor = new ContractsAuditor();
  auditor.run();
}

module.exports = ContractsAuditor;

