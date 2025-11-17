#!/usr/bin/env node

/**
 * Map Executive KPIs
 * Mapeia e calcula KPIs executivos para CEOs e gestores
 */

const fs = require('fs');
const path = require('path');

class ExecutiveKPIMapper {
  constructor() {
    this.kpis = {
      financeiros: [],
      operacionais: [],
      qualidade: [],
      comerciais: []
    };
    this.timestamp = new Date().toISOString();
  }

  calculateFinancialKPIs() {
    console.log('💰 Calculando KPIs Financeiros...');

    // Simula dados financeiros (em produção, buscaria do banco)
    const mockData = {
      receitaBruta: 5000000,
      custosMercadorias: 3200000,
      despesasOperacionais: 900000,
      impostos: 450000,
      receitaMesAnterior: 4800000
    };

    const margemBruta = ((mockData.receitaBruta - mockData.custosMercadorias) / mockData.receitaBruta) * 100;
    const margemLiquida = ((mockData.receitaBruta - mockData.custosMercadorias - mockData.despesasOperacionais - mockData.impostos) / mockData.receitaBruta) * 100;
    const crescimentoMensal = ((mockData.receitaBruta - mockData.receitaMesAnterior) / mockData.receitaMesAnterior) * 100;

    this.kpis.financeiros = [
      {
        nome: 'Receita Bruta Mensal',
        valor: mockData.receitaBruta,
        formatado: this.formatCurrency(mockData.receitaBruta),
        meta: 5500000,
        status: mockData.receitaBruta >= 5500000 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      },
      {
        nome: 'Margem Bruta',
        valor: margemBruta,
        formatado: `${margemBruta.toFixed(2)}%`,
        meta: 38,
        status: margemBruta >= 38 ? 'verde' : 'vermelho',
        tendencia: 'estavel'
      },
      {
        nome: 'Margem Líquida',
        valor: margemLiquida,
        formatado: `${margemLiquida.toFixed(2)}%`,
        meta: 8,
        status: margemLiquida >= 8 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      },
      {
        nome: 'Crescimento MoM',
        valor: crescimentoMensal,
        formatado: `${crescimentoMensal.toFixed(2)}%`,
        meta: 5,
        status: crescimentoMensal >= 5 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      }
    ];
  }

  calculateOperationalKPIs() {
    console.log('⚙️  Calculando KPIs Operacionais...');

    const mockData = {
      cirurgiasRealizadas: 450,
      cirurgiasCanceladas: 15,
      tempoMedioAtendimento: 2.5, // horas
      taxaOcupacaoEstoque: 78,
      pedidosEntreguesNoPrazo: 425,
      totalPedidos: 450
    };

    const taxaSucessoCirurgias = ((mockData.cirurgiasRealizadas - mockData.cirurgiasCanceladas) / mockData.cirurgiasRealizadas) * 100;
    const onTimeDelivery = (mockData.pedidosEntreguesNoPrazo / mockData.totalPedidos) * 100;

    this.kpis.operacionais = [
      {
        nome: 'Cirurgias Realizadas',
        valor: mockData.cirurgiasRealizadas,
        formatado: mockData.cirurgiasRealizadas.toString(),
        meta: 500,
        status: mockData.cirurgiasRealizadas >= 500 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      },
      {
        nome: 'Taxa de Sucesso Cirurgias',
        valor: taxaSucessoCirurgias,
        formatado: `${taxaSucessoCirurgias.toFixed(2)}%`,
        meta: 95,
        status: taxaSucessoCirurgias >= 95 ? 'verde' : 'amarelo',
        tendencia: 'estavel'
      },
      {
        nome: 'On-Time Delivery',
        valor: onTimeDelivery,
        formatado: `${onTimeDelivery.toFixed(2)}%`,
        meta: 95,
        status: onTimeDelivery >= 95 ? 'verde' : 'amarelo',
        tendencia: 'estavel'
      },
      {
        nome: 'Taxa de Ocupação Estoque',
        valor: mockData.taxaOcupacaoEstoque,
        formatado: `${mockData.taxaOcupacaoEstoque}%`,
        meta: 80,
        status: mockData.taxaOcupacaoEstoque >= 70 && mockData.taxaOcupacaoEstoque <= 85 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      }
    ];
  }

  calculateQualityKPIs() {
    console.log('🎯 Calculando KPIs de Qualidade...');

    const mockData = {
      naoConformidades: 3,
      reclamacoes: 8,
      tempoMedioResolucao: 24, // horas
      satisfacaoCliente: 4.2 // de 5
    };

    this.kpis.qualidade = [
      {
        nome: 'Não-Conformidades',
        valor: mockData.naoConformidades,
        formatado: mockData.naoConformidades.toString(),
        meta: 0,
        status: mockData.naoConformidades === 0 ? 'verde' : 'amarelo',
        tendencia: 'queda'
      },
      {
        nome: 'Reclamações de Clientes',
        valor: mockData.reclamacoes,
        formatado: mockData.reclamacoes.toString(),
        meta: 5,
        status: mockData.reclamacoes <= 5 ? 'verde' : 'amarelo',
        tendencia: 'queda'
      },
      {
        nome: 'Tempo Médio Resolução',
        valor: mockData.tempoMedioResolucao,
        formatado: `${mockData.tempoMedioResolucao}h`,
        meta: 48,
        status: mockData.tempoMedioResolucao <= 48 ? 'verde' : 'vermelho',
        tendencia: 'queda'
      },
      {
        nome: 'Satisfação do Cliente',
        valor: mockData.satisfacaoCliente,
        formatado: `${mockData.satisfacaoCliente.toFixed(1)}/5`,
        meta: 4.5,
        status: mockData.satisfacaoCliente >= 4.5 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      }
    ];
  }

  calculateCommercialKPIs() {
    console.log('📈 Calculando KPIs Comerciais...');

    const mockData = {
      novosClientes: 12,
      clientesAtivos: 145,
      taxaRetencao: 92,
      ticketMedio: 11200,
      conversaoLeads: 28
    };

    this.kpis.comerciais = [
      {
        nome: 'Novos Clientes',
        valor: mockData.novosClientes,
        formatado: mockData.novosClientes.toString(),
        meta: 15,
        status: mockData.novosClientes >= 15 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      },
      {
        nome: 'Clientes Ativos',
        valor: mockData.clientesAtivos,
        formatado: mockData.clientesAtivos.toString(),
        meta: 150,
        status: mockData.clientesAtivos >= 150 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      },
      {
        nome: 'Taxa de Retenção',
        valor: mockData.taxaRetencao,
        formatado: `${mockData.taxaRetencao}%`,
        meta: 90,
        status: mockData.taxaRetencao >= 90 ? 'verde' : 'vermelho',
        tendencia: 'crescimento'
      },
      {
        nome: 'Ticket Médio',
        valor: mockData.ticketMedio,
        formatado: this.formatCurrency(mockData.ticketMedio),
        meta: 12000,
        status: mockData.ticketMedio >= 12000 ? 'verde' : 'amarelo',
        tendencia: 'estavel'
      },
      {
        nome: 'Conversão de Leads',
        valor: mockData.conversaoLeads,
        formatado: `${mockData.conversaoLeads}%`,
        meta: 30,
        status: mockData.conversaoLeads >= 30 ? 'verde' : 'amarelo',
        tendencia: 'crescimento'
      }
    ];
  }

  generateExecutiveReport() {
    console.log('\n📊 Dashboard Executivo - Icarus v5.0');
    console.log('='.repeat(70));
    console.log(`Data: ${new Date(this.timestamp).toLocaleString('pt-BR')}\n`);

    // Financeiros
    console.log('💰 KPIs FINANCEIROS');
    console.log('-'.repeat(70));
    this.printKPIs(this.kpis.financeiros);

    // Operacionais
    console.log('\n⚙️  KPIs OPERACIONAIS');
    console.log('-'.repeat(70));
    this.printKPIs(this.kpis.operacionais);

    // Qualidade
    console.log('\n🎯 KPIs DE QUALIDADE');
    console.log('-'.repeat(70));
    this.printKPIs(this.kpis.qualidade);

    // Comerciais
    console.log('\n📈 KPIs COMERCIAIS');
    console.log('-'.repeat(70));
    this.printKPIs(this.kpis.comerciais);

    // Resumo Executivo
    this.printExecutiveSummary();

    this.saveReport();
  }

  printKPIs(kpiList) {
    kpiList.forEach(kpi => {
      const statusIcon = kpi.status === 'verde' ? '🟢' : kpi.status === 'amarelo' ? '🟡' : '🔴';
      const trendIcon = kpi.tendencia === 'crescimento' ? '📈' : kpi.tendencia === 'queda' ? '📉' : '➡️';
      console.log(`${statusIcon} ${kpi.nome}: ${kpi.formatado} (Meta: ${typeof kpi.meta === 'number' && kpi.meta > 1000 ? this.formatCurrency(kpi.meta) : kpi.meta}) ${trendIcon}`);
    });
  }

  printExecutiveSummary() {
    const allKPIs = [
      ...this.kpis.financeiros,
      ...this.kpis.operacionais,
      ...this.kpis.qualidade,
      ...this.kpis.comerciais
    ];

    const verdes = allKPIs.filter(k => k.status === 'verde').length;
    const amarelos = allKPIs.filter(k => k.status === 'amarelo').length;
    const vermelhos = allKPIs.filter(k => k.status === 'vermelho').length;
    const total = allKPIs.length;

    const score = Math.round(((verdes * 100 + amarelos * 50) / total));

    console.log('\n\n📋 RESUMO EXECUTIVO');
    console.log('='.repeat(70));
    console.log(`Score Geral: ${score}%`);
    console.log(`🟢 KPIs no Alvo: ${verdes}/${total}`);
    console.log(`🟡 KPIs em Atenção: ${amarelos}/${total}`);
    console.log(`🔴 KPIs Críticos: ${vermelhos}/${total}`);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  saveReport() {
    const outputDir = path.join(process.cwd(), 'docs', 'analytics');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const report = {
      timestamp: this.timestamp,
      kpis: this.kpis
    };

    const outputFile = path.join(outputDir, 'executive-kpis-report.json');
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    
    console.log(`\n💾 Relatório salvo em: ${outputFile}`);
  }

  run() {
    console.log('🎯 Mapeamento de KPIs Executivos - Icarus v5.0\n');
    
    this.calculateFinancialKPIs();
    this.calculateOperationalKPIs();
    this.calculateQualityKPIs();
    this.calculateCommercialKPIs();
    this.generateExecutiveReport();
    
    return this.kpis;
  }
}

if (require.main === module) {
  const mapper = new ExecutiveKPIMapper();
  mapper.run();
}

module.exports = ExecutiveKPIMapper;

