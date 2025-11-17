#!/usr/bin/env node

/**
 * Classify Gaps
 * Classifica gaps por prioridade (critico/medio/baixo)
 */

const fs = require('fs');
const path = require('path');

class GapsClassifier {
  constructor() {
    this.gaps = [];
    this.classification = {
      critico: [],
      medio: [],
      baixo: []
    };
  }

  async classifyGaps() {
    console.log('🎯 Classificando Gaps - Icarus v5.0\n');

    // Coleta gaps de diferentes fontes
    await this.collectFromModuleAudit();
    await this.collectFromCompliance();
    await this.collectFromDiagnostics();

    // Classifica por prioridade
    this.performClassification();

    this.generateReport();
  }

  async collectFromModuleAudit() {
    const auditFile = path.join(process.cwd(), 'docs/audit/modules-audit-report.json');
    if (fs.existsSync(auditFile)) {
      const audit = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      const pendingModules = audit.modules?.filter(m => m.status !== 'completo') || [];

      pendingModules.forEach(module => {
        this.gaps.push({
          source: 'module_audit',
          module: module.name,
          category: module.category,
          priority: module.priority,
          completeness: module.completeness,
          type: 'implementation'
        });
      });
    }
  }

  async collectFromCompliance() {
    const complianceFile = path.join(process.cwd(), 'docs/compliance/legal-compliance-report.json');
    if (fs.existsSync(complianceFile)) {
      const compliance = JSON.parse(fs.readFileSync(complianceFile, 'utf8'));
      const recommendations = compliance.recommendations || [];

      recommendations.forEach(rec => {
        this.gaps.push({
          source: 'compliance',
          item: rec.item,
          priority: rec.priority,
          type: 'regulatory'
        });
      });
    }
  }

  async collectFromDiagnostics() {
    const diagFile = path.join(process.cwd(), 'docs/tutor/system-diagnostics.json');
    if (fs.existsSync(diagFile)) {
      const diag = JSON.parse(fs.readFileSync(diagFile, 'utf8'));
      
      (diag.issues || []).forEach(issue => {
        this.gaps.push({
          source: 'diagnostics',
          category: issue.category,
          message: issue.message,
          action: issue.action,
          priority: 'critico',
          type: 'infrastructure'
        });
      });

      (diag.warnings || []).forEach(warning => {
        this.gaps.push({
          source: 'diagnostics',
          category: warning.category,
          message: warning.message,
          action: warning.action,
          priority: 'medio',
          type: 'infrastructure'
        });
      });
    }
  }

  performClassification() {
    console.log('📊 Classificando por prioridade...');

    this.gaps.forEach(gap => {
      // Calcula score de prioridade
      const score = this.calculatePriorityScore(gap);
      
      // Adiciona score ao gap
      gap.score = score;

      // Classifica
      if (score >= 80) {
        gap.final_priority = 'critico';
        this.classification.critico.push(gap);
      } else if (score >= 50) {
        gap.final_priority = 'medio';
        this.classification.medio.push(gap);
      } else {
        gap.final_priority = 'baixo';
        this.classification.baixo.push(gap);
      }
    });

    // Ordena cada categoria por score
    Object.keys(this.classification).forEach(key => {
      this.classification[key].sort((a, b) => b.score - a.score);
    });
  }

  calculatePriorityScore(gap) {
    let score = 0;

    // Base score por prioridade declarada
    const priorityScores = {
      'critico': 80,
      'medio': 50,
      'baixo': 20
    };
    score += priorityScores[gap.priority] || 50;

    // Ajustes por tipo
    if (gap.type === 'regulatory') {
      score += 20; // Compliance sempre é mais crítico
    }
    if (gap.type === 'infrastructure' && gap.priority === 'critico') {
      score += 15; // Problemas de infra críticos são urgentes
    }

    // Ajustes por fonte
    if (gap.source === 'compliance') {
      score += 10; // Compliance tem peso adicional
    }

    // Ajustes por completeness (módulos)
    if (gap.completeness !== undefined) {
      if (gap.completeness < 25) {
        score += 10;
      }
    }

    return Math.min(100, score); // Cap em 100
  }

  generateReport() {
    console.log('\n📋 Relatório de Classificação de Gaps - Icarus v5.0');
    console.log('='.repeat(70));
    console.log(`Total de Gaps: ${this.gaps.length}\n`);

    // Críticos
    if (this.classification.critico.length > 0) {
      console.log('🔴 PRIORIDADE CRÍTICA\n');
      console.log('-'.repeat(70));
      this.classification.critico.forEach((gap, i) => {
        console.log(`\n${i + 1}. [Score: ${gap.score}] ${this.formatGap(gap)}`);
        if (gap.action) console.log(`   Ação: ${gap.action}`);
      });
    }

    // Médios
    if (this.classification.medio.length > 0) {
      console.log('\n\n🟡 PRIORIDADE MÉDIA\n');
      console.log('-'.repeat(70));
      this.classification.medio.slice(0, 10).forEach((gap, i) => {
        console.log(`${i + 1}. [Score: ${gap.score}] ${this.formatGap(gap)}`);
      });
      if (this.classification.medio.length > 10) {
        console.log(`\n... e mais ${this.classification.medio.length - 10} itens`);
      }
    }

    // Baixos
    if (this.classification.baixo.length > 0) {
      console.log('\n\n🟢 PRIORIDADE BAIXA\n');
      console.log('-'.repeat(70));
      console.log(`Total: ${this.classification.baixo.length} itens`);
      console.log('(Implementar após conclusão de itens críticos e médios)');
    }

    // Estatísticas
    console.log('\n\n📊 ESTATÍSTICAS');
    console.log('='.repeat(70));
    console.log(`Críticos: ${this.classification.critico.length} (${this.percentage(this.classification.critico.length)}%)`);
    console.log(`Médios: ${this.classification.medio.length} (${this.percentage(this.classification.medio.length)}%)`);
    console.log(`Baixos: ${this.classification.baixo.length} (${this.percentage(this.classification.baixo.length)}%)`);

    this.saveReport();
  }

  formatGap(gap) {
    if (gap.module) {
      return `[${gap.source}] Módulo: ${gap.module} (${gap.category})`;
    }
    if (gap.item) {
      return `[${gap.source}] ${gap.item}`;
    }
    if (gap.message) {
      return `[${gap.source}] ${gap.message}`;
    }
    return `[${gap.source}] Gap não especificado`;
  }

  percentage(count) {
    return ((count / this.gaps.length) * 100).toFixed(1);
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total_gaps: this.gaps.length,
      classification: {
        critico: {
          count: this.classification.critico.length,
          percentage: this.percentage(this.classification.critico.length),
          items: this.classification.critico
        },
        medio: {
          count: this.classification.medio.length,
          percentage: this.percentage(this.classification.medio.length),
          items: this.classification.medio
        },
        baixo: {
          count: this.classification.baixo.length,
          percentage: this.percentage(this.classification.baixo.length),
          items: this.classification.baixo
        }
      }
    };

    const outputFile = path.join(outputDir, 'gaps-classification.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  async run() {
    console.log('🎯 Classificador de Gaps - Icarus v5.0\n');
    await this.classifyGaps();
    return this.classification;
  }
}

if (require.main === module) {
  const classifier = new GapsClassifier();
  classifier.run().catch(console.error);
}

module.exports = GapsClassifier;

