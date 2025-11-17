#!/usr/bin/env node

/**
 * Compliance Opinion
 * Emite parecer técnico de compliance
 */

const fs = require('fs');
const path = require('path');

class ComplianceOpinion {
  constructor() {
    this.opinion = {
      timestamp: new Date().toISOString(),
      conclusion: '',
      details: [],
      recommendations: []
    };
  }

  async generateOpinion() {
    console.log('⚖️  Emitindo Parecer de Compliance - Icarus v5.0\n');

    // Carrega dados de compliance
    await this.loadComplianceData();

    // Analisa conformidade
    this.analyzeANVISA();
    this.analyzeANS();
    this.analyzeLGPD();

    // Gera conclusão
    this.generateConclusion();

    this.printOpinion();
    this.saveOpinion();
  }

  async loadComplianceData() {
    const complianceFile = path.join(process.cwd(), 'docs/compliance/legal-compliance-report.json');
    if (fs.existsSync(complianceFile)) {
      this.complianceData = JSON.parse(fs.readFileSync(complianceFile, 'utf8'));
    }
  }

  analyzeANVISA() {
    this.opinion.details.push({
      area: 'ANVISA - Rastreabilidade e Distribuição',
      status: 'parcial',
      findings: [
        'Sistema implementa controle básico de lotes e validades',
        'Rastreabilidade UDI requer implementação completa',
        'Relatórios ANVISA parcialmente implementados'
      ],
      requirements: [
        'RDC 16/2013 - Boas Práticas de Distribuição',
        'RDC 23/2012 - Rastreabilidade de produtos',
        'Sistema UDI - Identificação Única de Dispositivos'
      ],
      risks: [
        'Não conformidade pode resultar em multas e suspensão de atividades',
        'Impossibilidade de rastrear lotes em recall',
        'Perda de credibilidade no mercado'
      ],
      actions: [
        'URGENTE: Implementar captura e rastreamento UDI completo',
        'Criar relatórios de distribuição conforme RDC',
        'Treinar equipe em processos de rastreabilidade'
      ]
    });
  }

  analyzeANS() {
    this.opinion.details.push({
      area: 'ANS - Faturamento e Padrão TISS',
      status: 'parcial',
      findings: [
        'Módulo de faturamento OPME implementado',
        'Padrão TISS 4.06.00 requer atualização',
        'Integração com operadoras precisa ser validada'
      ],
      requirements: [
        'Padrão TISS 4.06.00 (vigência a partir de 2025-07-01)',
        'Guias SP/SADT conforme especificação ANS',
        'Validação XML e envio eletrônico'
      ],
      risks: [
        'Rejeição de guias por operadoras após prazo',
        'Atraso no recebimento de faturamentos',
        'Necessidade de refaturamento manual'
      ],
      actions: [
        'Atualizar validadores para TISS 4.06.00',
        'Implementar novos campos obrigatórios',
        'Testar integração com top 5 operadoras'
      ]
    });
  }

  analyzeLGPD() {
    this.opinion.details.push({
      area: 'LGPD - Proteção de Dados',
      status: 'atencao',
      findings: [
        'Políticas RLS implementadas no Supabase',
        'Documentação de privacidade incompleta',
        'Gestão de consentimento requer melhorias'
      ],
      requirements: [
        'Lei nº 13.709/2018 - LGPD',
        'Política de Privacidade pública',
        'Termos de Consentimento claros',
        'Logs de acesso a dados sensíveis',
        'Direito ao esquecimento'
      ],
      risks: [
        'Multas de até 2% do faturamento (máx. R$ 50 milhões)',
        'Dano reputacional',
        'Ações judiciais de titulares'
      ],
      actions: [
        'Publicar Política de Privacidade completa',
        'Implementar portal de consentimento',
        'Criar logs de auditoria de acesso',
        'Nomear DPO (Data Protection Officer)'
      ]
    });
  }

  generateConclusion() {
    const totalAreas = this.opinion.details.length;
    const conforme = this.opinion.details.filter(d => d.status === 'conforme').length;
    const parcial = this.opinion.details.filter(d => d.status === 'parcial').length;
    const atencao = this.opinion.details.filter(d => d.status === 'atencao').length;

    let conclusion = '';
    
    if (conforme === totalAreas) {
      conclusion = 'PARECER FAVORÁVEL - Sistema em conformidade com principais regulamentações.';
    } else if (parcial > 0 && atencao === 0) {
      conclusion = 'PARECER FAVORÁVEL COM RESSALVAS - Sistema possui conformidade parcial. Recomenda-se implementação das ações prioritárias para conformidade total.';
    } else {
      conclusion = 'PARECER DESFAVORÁVEL - Sistema apresenta gaps críticos de conformidade. URGENTE implementar ações corretivas antes de expansão comercial.';
    }

    this.opinion.conclusion = conclusion;

    // Consolida recomendações
    this.opinion.recommendations = [
      {
        priority: 'critico',
        item: 'Implementar rastreabilidade UDI completa (ANVISA)',
        deadline: '90 dias'
      },
      {
        priority: 'critico',
        item: 'Atualizar padrão TISS para versão 4.06.00 (ANS)',
        deadline: '60 dias'
      },
      {
        priority: 'alto',
        item: 'Publicar documentação LGPD completa',
        deadline: '30 dias'
      },
      {
        priority: 'medio',
        item: 'Nomear DPO e estruturar governança de dados',
        deadline: '120 dias'
      }
    ];
  }

  printOpinion() {
    console.log('📋 PARECER TÉCNICO DE COMPLIANCE');
    console.log('='.repeat(70));
    console.log(`Data: ${new Date(this.opinion.timestamp).toLocaleString('pt-BR')}\n`);

    // Análises por área
    this.opinion.details.forEach((detail, i) => {
      console.log(`\n${i + 1}. ${detail.area.toUpperCase()}`);
      console.log('-'.repeat(70));
      console.log(`Status: ${detail.status.toUpperCase()}`);
      
      console.log('\nConstatações:');
      detail.findings.forEach(f => console.log(`  • ${f}`));
      
      console.log('\nRiscos:');
      detail.risks.forEach(r => console.log(`  ⚠️  ${r}`));
      
      console.log('\nAções Necessárias:');
      detail.actions.forEach(a => console.log(`  ✓ ${a}`));
    });

    // Conclusão
    console.log('\n\n📊 CONCLUSÃO');
    console.log('='.repeat(70));
    console.log(this.opinion.conclusion);

    // Recomendações
    console.log('\n\n🎯 PLANO DE AÇÃO');
    console.log('='.repeat(70));
    this.opinion.recommendations.forEach((rec, i) => {
      const priorityIcon = rec.priority === 'critico' ? '🔴' : 
                          rec.priority === 'alto' ? '🟠' : '🟡';
      console.log(`\n${i + 1}. ${priorityIcon} ${rec.item}`);
      console.log(`   Prazo: ${rec.deadline}`);
    });
  }

  saveOpinion() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'parecer-compliance.json');
    fs.writeFileSync(outputFile, JSON.stringify(this.opinion, null, 2));
    
    console.log(`\n\n💾 Parecer salvo em: ${outputFile}`);

    // Também gera versão Markdown para fácil leitura
    this.saveMarkdownVersion();
  }

  saveMarkdownVersion() {
    const outputDir = path.join(process.cwd(), 'docs', 'tutor');
    let markdown = `# Parecer Técnico de Compliance - Icarus v5.0\n\n`;
    markdown += `**Data:** ${new Date(this.opinion.timestamp).toLocaleString('pt-BR')}\n\n`;
    markdown += `---\n\n`;

    this.opinion.details.forEach((detail, i) => {
      markdown += `## ${i + 1}. ${detail.area}\n\n`;
      markdown += `**Status:** ${detail.status.toUpperCase()}\n\n`;
      
      markdown += `### Constatações\n\n`;
      detail.findings.forEach(f => markdown += `- ${f}\n`);
      
      markdown += `\n### Riscos\n\n`;
      detail.risks.forEach(r => markdown += `- ⚠️  ${r}\n`);
      
      markdown += `\n### Ações Necessárias\n\n`;
      detail.actions.forEach(a => markdown += `- [ ] ${a}\n`);
      
      markdown += `\n---\n\n`;
    });

    markdown += `## Conclusão\n\n`;
    markdown += `${this.opinion.conclusion}\n\n`;

    markdown += `## Plano de Ação\n\n`;
    this.opinion.recommendations.forEach((rec, i) => {
      const priorityIcon = rec.priority === 'critico' ? '🔴' : 
                          rec.priority === 'alto' ? '🟠' : '🟡';
      markdown += `${i + 1}. ${priorityIcon} **${rec.item}**\n`;
      markdown += `   - Prazo: ${rec.deadline}\n\n`;
    });

    const outputFile = path.join(outputDir, 'parecer-compliance.md');
    fs.writeFileSync(outputFile, markdown);
    console.log(`💾 Versão Markdown salva em: ${outputFile}`);
  }

  async run() {
    await this.generateOpinion();
    return this.opinion;
  }
}

if (require.main === module) {
  const opinion = new ComplianceOpinion();
  opinion.run().catch(console.error);
}

module.exports = ComplianceOpinion;

