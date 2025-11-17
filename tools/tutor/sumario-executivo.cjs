#!/usr/bin/env node

/**
 * Executive Summary
 * Gera sumário executivo consolidado para gestores
 */

const fs = require('fs');
const path = require('path');

class ExecutiveSummary {
  constructor() {
    this.data = {
      timestamp: new Date().toISOString(),
      kpis: null,
      diagnostics: null,
      compliance: null,
      improvements: null
    };
  }

  async loadReports() {
    console.log('📥 Carregando relatórios...');

    // Carrega KPIs
    const kpisFile = path.join(process.cwd(), 'docs/analytics/executive-kpis-report.json');
    if (fs.existsSync(kpisFile)) {
      this.data.kpis = JSON.parse(fs.readFileSync(kpisFile, 'utf8'));
    }

    // Carrega diagnóstico
    const diagFile = path.join(process.cwd(), 'docs/tutor/system-diagnostics.json');
    if (fs.existsSync(diagFile)) {
      this.data.diagnostics = JSON.parse(fs.readFileSync(diagFile, 'utf8'));
    }

    // Carrega compliance
    const complianceFile = path.join(process.cwd(), 'docs/compliance/legal-compliance-report.json');
    if (fs.existsSync(complianceFile)) {
      this.data.compliance = JSON.parse(fs.readFileSync(complianceFile, 'utf8'));
    }

    // Carrega melhorias
    const improvFile = path.join(process.cwd(), 'docs/audit/improvements-suggestions.json');
    if (fs.existsSync(improvFile)) {
      this.data.improvements = JSON.parse(fs.readFileSync(improvFile, 'utf8'));
    }
  }

  generateSummary() {
    console.log('\n📊 Sumário Executivo - Icarus v5.0');
    console.log('='.repeat(70));
    console.log(`Data: ${new Date(this.data.timestamp).toLocaleString('pt-BR')}\n`);

    // Status Geral do Sistema
    this.printSystemHealth();

    // KPIs Críticos
    this.printCriticalKPIs();

    // Compliance
    this.printCompliance();

    // Ações Prioritárias
    this.printPriorityActions();

    // Recomendações Estratégicas
    this.printStrategicRecommendations();

    this.saveSummary();
  }

  printSystemHealth() {
    console.log('🏥 STATUS GERAL DO SISTEMA');
    console.log('-'.repeat(70));

    if (this.data.diagnostics) {
      console.log(`Score de Saúde: ${this.data.diagnostics.score}%`);
      console.log(`Status: ${this.data.diagnostics.status}`);
      console.log(`Problemas Críticos: ${this.data.diagnostics.issues?.length || 0}`);
      console.log(`Avisos: ${this.data.diagnostics.warnings?.length || 0}`);
    } else {
      console.log('⚠️  Dados de diagnóstico não disponíveis');
      console.log('Execute: node tools/tutor/diagnosticar-sistema.js');
    }
  }

  printCriticalKPIs() {
    console.log('\n\n💰 KPIs CRÍTICOS');
    console.log('-'.repeat(70));

    if (this.data.kpis) {
      // KPIs financeiros mais importantes
      const financeiros = this.data.kpis.kpis?.financeiros || [];
      const operacionais = this.data.kpis.kpis?.operacionais || [];

      console.log('\nFinanceiros:');
      financeiros.slice(0, 3).forEach(kpi => {
        const icon = kpi.status === 'verde' ? '🟢' : kpi.status === 'amarelo' ? '🟡' : '🔴';
        console.log(`  ${icon} ${kpi.nome}: ${kpi.formatado}`);
      });

      console.log('\nOperacionais:');
      operacionais.slice(0, 3).forEach(kpi => {
        const icon = kpi.status === 'verde' ? '🟢' : kpi.status === 'amarelo' ? '🟡' : '🔴';
        console.log(`  ${icon} ${kpi.nome}: ${kpi.formatado}`);
      });
    } else {
      console.log('⚠️  Dados de KPIs não disponíveis');
      console.log('Execute: node tools/analytics/map-kpis-executivos.js');
    }
  }

  printCompliance() {
    console.log('\n\n⚖️  CONFORMIDADE REGULATÓRIA');
    console.log('-'.repeat(70));

    if (this.data.compliance) {
      console.log(`Score de Compliance: ${this.data.compliance.score}%`);
      console.log(`Status: ${this.data.compliance.status}`);
      
      if (this.data.compliance.recommendations?.length > 0) {
        const criticos = this.data.compliance.recommendations.filter(r => r.priority === 'critico');
        if (criticos.length > 0) {
          console.log(`\n🔴 Ações Críticas de Compliance: ${criticos.length}`);
        }
      }
    } else {
      console.log('⚠️  Dados de compliance não disponíveis');
      console.log('Execute: node tools/compliance/legal/check-erp-legal.js');
    }
  }

  printPriorityActions() {
    console.log('\n\n🎯 AÇÕES PRIORITÁRIAS (TOP 5)');
    console.log('-'.repeat(70));

    const actions = [];

    // Adiciona problemas críticos do diagnóstico
    if (this.data.diagnostics?.issues) {
      this.data.diagnostics.issues.forEach(issue => {
        actions.push({
          priority: 1,
          source: 'Sistema',
          action: issue.action,
          impact: 'Crítico'
        });
      });
    }

    // Adiciona melhorias críticas
    if (this.data.improvements?.improvements) {
      const criticalImprovements = this.data.improvements.improvements
        .filter(i => i.priority === 'critico')
        .slice(0, 3);
      
      criticalImprovements.forEach(imp => {
        actions.push({
          priority: 2,
          source: imp.type,
          action: imp.recommendation || imp.title,
          impact: imp.impact
        });
      });
    }

    // Adiciona compliance crítico
    if (this.data.compliance?.recommendations) {
      const criticalCompliance = this.data.compliance.recommendations
        .filter(r => r.priority === 'critico')
        .slice(0, 2);
      
      criticalCompliance.forEach(rec => {
        actions.push({
          priority: 1,
          source: 'Compliance',
          action: rec.item,
          impact: 'Alto'
        });
      });
    }

    // Ordena e mostra top 5
    actions.sort((a, b) => a.priority - b.priority);
    actions.slice(0, 5).forEach((action, i) => {
      console.log(`\n${i + 1}. [${action.source}] ${action.action}`);
      console.log(`   Impacto: ${action.impact}`);
    });

    if (actions.length === 0) {
      console.log('\n✅ Nenhuma ação prioritária pendente!');
    }
  }

  printStrategicRecommendations() {
    console.log('\n\n💡 RECOMENDAÇÕES ESTRATÉGICAS');
    console.log('-'.repeat(70));

    const recommendations = [
      '1. Priorizar conformidade ANVISA e ANS antes de expansão comercial',
      '2. Investir em automação de processos manuais (ROI estimado: 40%)',
      '3. Completar dashboard executivo para decisões data-driven',
      '4. Implementar rastreabilidade UDI completa (obrigatório)',
      '5. Considerar expansão de equipe técnica para acelerar roadmap'
    ];

    recommendations.forEach(rec => console.log(`  ${rec}`));
  }

  saveSummary() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const summary = {
      timestamp: this.data.timestamp,
      system_health: this.data.diagnostics?.score || 'N/A',
      compliance_score: this.data.compliance?.score || 'N/A',
      critical_issues: this.data.diagnostics?.issues?.length || 0,
      critical_improvements: this.data.improvements?.by_priority?.critico || 0,
      data: this.data
    };

    const outputFile = path.join(outputDir, 'executive-summary.json');
    fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
    
    console.log(`\n\n💾 Sumário salvo em: ${outputFile}`);
  }

  async run() {
    console.log('🎯 Gerador de Sumário Executivo - Icarus v5.0\n');
    await this.loadReports();
    this.generateSummary();
    
    return this.data;
  }
}

if (require.main === module) {
  const summary = new ExecutiveSummary();
  summary.run().catch(console.error);
}

module.exports = ExecutiveSummary;

