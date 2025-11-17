#!/usr/bin/env node

/**
 * Suggest Improvements
 * Sugere melhorias com base na auditoria de módulos
 */

const fs = require('fs');
const path = require('path');

class ImprovementsSuggester {
  constructor() {
    this.improvements = [];
  }

  async analyzeAndSuggest() {
    console.log('💡 Analisando sistema e sugerindo melhorias...\n');

    // Lê relatório de auditoria se existir
    const auditFile = path.join(process.cwd(), 'docs/audit/modules-audit-report.json');
    let modules = [];
    
    if (fs.existsSync(auditFile)) {
      const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
      modules = auditData.modules || [];
    }

    // Analisa gaps por categoria
    this.analyzeGaps(modules);
    
    // Sugere melhorias por prioridade
    this.suggestByPriority();
    
    // Sugere integrações faltantes
    this.suggestIntegrations();
    
    // Sugere melhorias de UX/UI
    this.suggestUXImprovements();
    
    this.generateReport();
  }

  analyzeGaps(modules) {
    console.log('🔍 Analisando gaps de implementação...');

    if (modules.length === 0) {
      console.log('⚠️  Nenhum dado de auditoria encontrado. Execute auditar-modulos.js primeiro.');
      return;
    }

    const pendentes = modules.filter(m => m.status === 'pendente' || m.status === 'parcial');
    
    pendentes.forEach(module => {
      const missingComponents = [];
      
      if (!module.implementation.frontend) {
        missingComponents.push('Interface Frontend');
      }
      if (!module.implementation.backend) {
        missingComponents.push('Edge Functions');
      }
      if (!module.implementation.database) {
        missingComponents.push('Schema/Migrations');
      }
      if (!module.implementation.tests) {
        missingComponents.push('Testes Automatizados');
      }

      if (missingComponents.length > 0) {
        this.improvements.push({
          type: 'gap',
          priority: module.priority,
          module: module.name,
          category: module.category,
          missing: missingComponents,
          completeness: module.completeness || 0,
          impact: this.calculateImpact(module.priority),
          effort: missingComponents.length * 2, // dias estimados
          recommendation: `Implementar ${missingComponents.join(', ')} para o módulo ${module.name}`
        });
      }
    });
  }

  suggestByPriority() {
    console.log('📊 Priorizando melhorias...');

    // Melhorias específicas por funcionalidade crítica
    const criticalImprovements = [
      {
        type: 'feature',
        priority: 'critico',
        title: 'Rastreabilidade UDI ANVISA',
        description: 'Implementar captura e rastreamento completo de UDI para conformidade ANVISA',
        modules: ['Estoque', 'Consignação', 'Cirurgias'],
        impact: 'alto',
        effort: 10,
        business_value: 'Conformidade regulatória obrigatória',
        recommendation: 'Criar módulo centralizado de UDI com integração em todos os pontos de entrada/saída'
      },
      {
        type: 'feature',
        priority: 'critico',
        title: 'Integração TISS 4.06.00',
        description: 'Atualizar para nova versão do padrão TISS',
        modules: ['Faturamento', 'Guias TISS'],
        impact: 'alto',
        effort: 8,
        business_value: 'Manter faturamento com operadoras',
        recommendation: 'Atualizar validadores e schemas XML; testar com operadoras principais'
      },
      {
        type: 'feature',
        priority: 'critico',
        title: 'Dashboard Executivo BI',
        description: 'Dashboard com KPIs em tempo real para tomada de decisão',
        modules: ['Dashboard', 'Analytics'],
        impact: 'medio',
        effort: 12,
        business_value: 'Visibilidade e decisões data-driven',
        recommendation: 'Implementar dashboards interativos com Recharts e queries otimizadas'
      }
    ];

    this.improvements.push(...criticalImprovements);
  }

  suggestIntegrations() {
    console.log('🔌 Sugerindo integrações...');

    const integrations = [
      {
        type: 'integration',
        priority: 'medio',
        title: 'API Bancos (Open Banking)',
        description: 'Integração com APIs de bancos para conciliação automática',
        modules: ['Financeiro', 'Conciliação'],
        impact: 'medio',
        effort: 15,
        business_value: 'Redução de trabalho manual e erros de conciliação',
        recommendation: 'Implementar integração via Open Banking para principais bancos'
      },
      {
        type: 'integration',
        priority: 'medio',
        title: 'WhatsApp Business API',
        description: 'Notificações e comunicação via WhatsApp',
        modules: ['Notificações', 'CRM'],
        impact: 'medio',
        effort: 8,
        business_value: 'Melhor comunicação com clientes e redução de no-shows',
        recommendation: 'Integrar WhatsApp Business API para lembretes de cirurgias e atualizações'
      },
      {
        type: 'integration',
        priority: 'baixo',
        title: 'Power BI / Tableau',
        description: 'Exportação de dados para ferramentas de BI externas',
        modules: ['Analytics', 'Relatórios'],
        impact: 'baixo',
        effort: 6,
        business_value: 'Flexibilidade para análises customizadas',
        recommendation: 'Criar APIs de exportação de dados para ferramentas de BI'
      }
    ];

    this.improvements.push(...integrations);
  }

  suggestUXImprovements() {
    console.log('🎨 Sugerindo melhorias de UX/UI...');

    const uxImprovements = [
      {
        type: 'ux',
        priority: 'medio',
        title: 'Design System Completo',
        description: 'Completar componentes do OraclusX DS',
        modules: ['UI/UX'],
        impact: 'medio',
        effort: 10,
        business_value: 'Consistência visual e produtividade de desenvolvimento',
        recommendation: 'Implementar componentes enterprise faltantes (DataGrid, DateRangePicker, etc.)'
      },
      {
        type: 'ux',
        priority: 'medio',
        title: 'Modo Escuro',
        description: 'Implementar tema dark mode completo',
        modules: ['UI/UX'],
        impact: 'baixo',
        effort: 5,
        business_value: 'Melhor experiência para usuários que trabalham períodos longos',
        recommendation: 'Adicionar suporte completo a dark mode com toggle de tema'
      },
      {
        type: 'ux',
        priority: 'baixo',
        title: 'PWA Offline',
        description: 'Suporte offline para funcionalidades críticas',
        modules: ['PWA', 'Mobile'],
        impact: 'medio',
        effort: 12,
        business_value: 'Trabalho em ambientes com conectividade limitada',
        recommendation: 'Implementar service workers e cache estratégico'
      }
    ];

    this.improvements.push(...uxImprovements);
  }

  calculateImpact(priority) {
    const impactMap = {
      'critico': 'alto',
      'medio': 'medio',
      'baixo': 'baixo'
    };
    return impactMap[priority] || 'medio';
  }

  generateReport() {
    console.log('\n💡 Relatório de Sugestões de Melhorias - Icarus v5.0');
    console.log('='.repeat(70));

    // Agrupar por prioridade
    const criticos = this.improvements.filter(i => i.priority === 'critico');
    const medios = this.improvements.filter(i => i.priority === 'medio');
    const baixos = this.improvements.filter(i => i.priority === 'baixo');

    // Críticos
    if (criticos.length > 0) {
      console.log('\n🔴 PRIORIDADE CRÍTICA\n');
      console.log('-'.repeat(70));
      criticos.forEach((imp, i) => {
        console.log(`\n${i + 1}. ${imp.title || imp.module}`);
        console.log(`   Tipo: ${imp.type}`);
        if (imp.description) console.log(`   Descrição: ${imp.description}`);
        if (imp.missing) console.log(`   Faltando: ${imp.missing.join(', ')}`);
        console.log(`   Impacto: ${imp.impact}`);
        console.log(`   Esforço: ${imp.effort} dias`);
        if (imp.business_value) console.log(`   Valor: ${imp.business_value}`);
        console.log(`   Recomendação: ${imp.recommendation}`);
      });
    }

    // Médios
    if (medios.length > 0) {
      console.log('\n\n🟡 PRIORIDADE MÉDIA\n');
      console.log('-'.repeat(70));
      medios.forEach((imp, i) => {
        console.log(`\n${i + 1}. ${imp.title || imp.module}`);
        console.log(`   Tipo: ${imp.type}`);
        console.log(`   Impacto: ${imp.impact} | Esforço: ${imp.effort} dias`);
        console.log(`   Recomendação: ${imp.recommendation}`);
      });
    }

    // Baixos
    if (baixos.length > 0) {
      console.log('\n\n🟢 PRIORIDADE BAIXA\n');
      console.log('-'.repeat(70));
      baixos.forEach((imp, i) => {
        console.log(`${i + 1}. ${imp.title || imp.module} (${imp.type})`);
      });
    }

    // Resumo
    console.log('\n\n📊 RESUMO');
    console.log('='.repeat(70));
    console.log(`Total de melhorias: ${this.improvements.length}`);
    console.log(`Críticas: ${criticos.length}`);
    console.log(`Médias: ${medios.length}`);
    console.log(`Baixas: ${baixos.length}`);
    
    const totalEffort = this.improvements.reduce((sum, imp) => sum + imp.effort, 0);
    console.log(`\nEsforço total estimado: ${totalEffort} dias (~${Math.ceil(totalEffort / 20)} sprints)`);

    this.saveReport();
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'audit');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      total: this.improvements.length,
      by_priority: {
        critico: this.improvements.filter(i => i.priority === 'critico').length,
        medio: this.improvements.filter(i => i.priority === 'medio').length,
        baixo: this.improvements.filter(i => i.priority === 'baixo').length
      },
      total_effort_days: this.improvements.reduce((sum, i) => sum + i.effort, 0),
      improvements: this.improvements
    };

    const outputFile = path.join(outputDir, 'improvements-suggestions.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  async run() {
    console.log('🎯 Sugestor de Melhorias - Icarus v5.0\n');
    await this.analyzeAndSuggest();
    return this.improvements;
  }
}

if (require.main === module) {
  const suggester = new ImprovementsSuggester();
  suggester.run().catch(console.error);
}

module.exports = ImprovementsSuggester;

