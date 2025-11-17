#!/usr/bin/env node

/**
 * Generate Legal Alerts
 * Gera alertas sobre mudanças legislativas e compliance fiscal
 */

const fs = require('fs');
const path = require('path');

class LegalAlertsGenerator {
  constructor() {
    this.alerts = [];
    this.sources = {
      ANVISA: 'Agência Nacional de Vigilância Sanitária',
      ANS: 'Agência Nacional de Saúde Suplementar',
      SEFAZ: 'Secretaria da Fazenda',
      RFB: 'Receita Federal do Brasil'
    };
  }

  generateAlerts() {
    console.log('🚨 Gerador de Alertas Legais - Icarus v5.0');
    console.log('='.repeat(60));
    console.log('\n');

    // Alertas ANVISA
    this.alerts.push({
      id: 'ANVISA-2025-001',
      fonte: this.sources.ANVISA,
      tipo: 'critico',
      titulo: 'Atualização RDC UDI - Sistema de Rastreabilidade',
      descricao: 'Nova resolução exige implementação de rastreabilidade via UDI para produtos OPME Classe III e IV',
      dataPublicacao: '2025-01-15',
      prazoAdequacao: '2025-07-01',
      impacto: 'Alto - Requer adequação do sistema de estoque e consignação',
      acoes: [
        'Implementar captura de UDI em todos os módulos de entrada',
        'Criar relatórios de rastreabilidade conforme RDC',
        'Atualizar integração com base ANVISA'
      ]
    });

    // Alertas ANS
    this.alerts.push({
      id: 'ANS-2025-002',
      fonte: this.sources.ANS,
      tipo: 'critico',
      titulo: 'TISS 4.06.00 - Nova Versão do Padrão',
      descricao: 'Publicação da nova versão do padrão TISS com alterações em guias de SP/SADT',
      dataPublicacao: '2025-02-01',
      prazoAdequacao: '2025-06-01',
      impacto: 'Alto - Afeta módulo de faturamento',
      acoes: [
        'Atualizar validações de guias TISS',
        'Ajustar layouts XML conforme nova versão',
        'Testar integração com operadoras'
      ]
    });

    // Alertas SEFAZ
    this.alerts.push({
      id: 'SEFAZ-2025-003',
      fonte: this.sources.SEFAZ,
      tipo: 'medio',
      titulo: 'NT 2025.001 - Alterações na NF-e',
      descricao: 'Ajuste no schema da NF-e versão 4.01 - novos campos obrigatórios',
      dataPublicacao: '2025-03-01',
      prazoAdequacao: '2025-08-01',
      impacto: 'Médio - Requer atualização na emissão de NF-e',
      acoes: [
        'Atualizar schema XML da NF-e',
        'Incluir novos campos obrigatórios',
        'Validar com ambiente de homologação SEFAZ'
      ]
    });

    // Alertas RFB
    this.alerts.push({
      id: 'RFB-2025-004',
      fonte: this.sources.RFB,
      tipo: 'critico',
      titulo: 'EFD Contribuições - Novos Registros',
      descricao: 'Inclusão de novos registros na EFD Contribuições para empresas do Lucro Real',
      dataPublicacao: '2025-01-20',
      prazoAdequacao: '2025-05-01',
      impacto: 'Alto - Afeta apuração de PIS/COFINS',
      acoes: [
        'Implementar geração dos novos registros',
        'Ajustar cálculos de PIS/COFINS',
        'Atualizar validador SPED'
      ]
    });

    this.printAlerts();
    this.saveAlerts();

    return this.alerts;
  }

  printAlerts() {
    const alertasCriticos = this.alerts.filter(a => a.tipo === 'critico');
    const alertasMedios = this.alerts.filter(a => a.tipo === 'medio');

    console.log('🔴 ALERTAS CRÍTICOS');
    console.log('-'.repeat(60));
    alertasCriticos.forEach(alert => {
      console.log(`\n[${alert.id}] ${alert.titulo}`);
      console.log(`Fonte: ${alert.fonte}`);
      console.log(`Impacto: ${alert.impacto}`);
      console.log(`Prazo: ${this.formatDate(alert.prazoAdequacao)}`);
      console.log(`\nAções necessárias:`);
      alert.acoes.forEach((acao, i) => {
        console.log(`  ${i + 1}. ${acao}`);
      });
    });

    if (alertasMedios.length > 0) {
      console.log('\n\n🟡 ALERTAS MÉDIOS');
      console.log('-'.repeat(60));
      alertasMedios.forEach(alert => {
        console.log(`\n[${alert.id}] ${alert.titulo}`);
        console.log(`Fonte: ${alert.fonte}`);
        console.log(`Prazo: ${this.formatDate(alert.prazoAdequacao)}`);
      });
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  saveAlerts() {
    const outputDir = path.join(process.cwd(), 'docs', 'compliance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'alertas-legais.json');
    fs.writeFileSync(outputFile, JSON.stringify(this.alerts, null, 2));
    
    console.log(`\n\n💾 Alertas salvos em: ${outputFile}`);
  }
}

if (require.main === module) {
  const generator = new LegalAlertsGenerator();
  generator.generateAlerts();
}

module.exports = LegalAlertsGenerator;

