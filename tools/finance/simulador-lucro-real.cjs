#!/usr/bin/env node

/**
 * Simulador de Lucro Real
 * Simula cálculos e apurações para empresas no regime de Lucro Real
 */

const fs = require('fs');
const path = require('path');

class LucroRealSimulator {
  constructor(params = {}) {
    this.params = {
      receitaBruta: params.receitaBruta || 1000000,
      custos: params.custos || 600000,
      despesas: params.despesas || 200000,
      periodo: params.periodo || '2025-Q1',
      ...params
    };

    this.tributos = {
      IRPJ: 0.15, // 15%
      IRPJ_adicional: 0.10, // 10% sobre o que exceder R$ 60.000 no trimestre
      CSLL: 0.09, // 9%
      PIS: 0.0165, // 1,65% (não-cumulativo)
      COFINS: 0.076 // 7,6% (não-cumulativo)
    };
  }

  calcularLucroLiquido() {
    const { receitaBruta, custos, despesas } = this.params;
    return receitaBruta - custos - despesas;
  }

  calcularIRPJ() {
    const lucro = this.calcularLucroLiquido();
    const baseCalculo = Math.max(0, lucro);
    
    let irpj = baseCalculo * this.tributos.IRPJ;
    
    // Adicional de 10% sobre o que exceder R$ 60.000 no trimestre
    const limiteAdicional = 60000;
    if (baseCalculo > limiteAdicional) {
      const adicional = (baseCalculo - limiteAdicional) * this.tributos.IRPJ_adicional;
      irpj += adicional;
    }

    return irpj;
  }

  calcularCSLL() {
    const lucro = this.calcularLucroLiquido();
    const baseCalculo = Math.max(0, lucro);
    return baseCalculo * this.tributos.CSLL;
  }

  calcularPISCOFINS() {
    const { receitaBruta } = this.params;
    return {
      PIS: receitaBruta * this.tributos.PIS,
      COFINS: receitaBruta * this.tributos.COFINS
    };
  }

  simular() {
    console.log('💰 Simulador Lucro Real - Icarus v5.0');
    console.log('='.repeat(60));
    console.log(`\n📅 Período: ${this.params.periodo}\n`);

    const lucroLiquido = this.calcularLucroLiquido();
    const irpj = this.calcularIRPJ();
    const csll = this.calcularCSLL();
    const { PIS, COFINS } = this.calcularPISCOFINS();

    const totalTributos = irpj + csll + PIS + COFINS;
    const lucroAposTributos = lucroLiquido - totalTributos;
    const cargaTributaria = (totalTributos / this.params.receitaBruta) * 100;

    const resultado = {
      periodo: this.params.periodo,
      receitas: {
        receitaBruta: this.params.receitaBruta,
        formatada: this.formatCurrency(this.params.receitaBruta)
      },
      custos: {
        valor: this.params.custos,
        formatada: this.formatCurrency(this.params.custos)
      },
      despesas: {
        valor: this.params.despesas,
        formatada: this.formatCurrency(this.params.despesas)
      },
      lucroLiquido: {
        valor: lucroLiquido,
        formatada: this.formatCurrency(lucroLiquido)
      },
      tributos: {
        IRPJ: {
          valor: irpj,
          formatada: this.formatCurrency(irpj),
          aliquota: '15% + 10% adicional'
        },
        CSLL: {
          valor: csll,
          formatada: this.formatCurrency(csll),
          aliquota: '9%'
        },
        PIS: {
          valor: PIS,
          formatada: this.formatCurrency(PIS),
          aliquota: '1,65%'
        },
        COFINS: {
          valor: COFINS,
          formatada: this.formatCurrency(COFINS),
          aliquota: '7,6%'
        },
        total: {
          valor: totalTributos,
          formatada: this.formatCurrency(totalTributos)
        }
      },
      resultado: {
        lucroAposTributos: {
          valor: lucroAposTributos,
          formatada: this.formatCurrency(lucroAposTributos)
        },
        cargaTributaria: {
          percentual: cargaTributaria.toFixed(2) + '%',
          valor: cargaTributaria
        }
      }
    };

    this.printResults(resultado);
    this.saveResults(resultado);

    return resultado;
  }

  printResults(resultado) {
    console.log('📊 DEMONSTRATIVO DE RESULTADOS');
    console.log('-'.repeat(60));
    console.log(`Receita Bruta:        ${resultado.receitas.formatada}`);
    console.log(`(-) Custos:           ${resultado.custos.formatada}`);
    console.log(`(-) Despesas:         ${resultado.despesas.formatada}`);
    console.log(`(=) Lucro Líquido:    ${resultado.lucroLiquido.formatada}`);
    
    console.log('\n💸 TRIBUTOS FEDERAIS');
    console.log('-'.repeat(60));
    console.log(`IRPJ (${resultado.tributos.IRPJ.aliquota}):          ${resultado.tributos.IRPJ.formatada}`);
    console.log(`CSLL (${resultado.tributos.CSLL.aliquota}):                 ${resultado.tributos.CSLL.formatada}`);
    console.log(`PIS (${resultado.tributos.PIS.aliquota}):               ${resultado.tributos.PIS.formatada}`);
    console.log(`COFINS (${resultado.tributos.COFINS.aliquota}):            ${resultado.tributos.COFINS.formatada}`);
    console.log(`Total Tributos:       ${resultado.tributos.total.formatada}`);
    
    console.log('\n📈 RESULTADO FINAL');
    console.log('-'.repeat(60));
    console.log(`Lucro após Tributos:  ${resultado.resultado.lucroAposTributos.formatada}`);
    console.log(`Carga Tributária:     ${resultado.resultado.cargaTributaria.percentual}`);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  saveResults(resultado) {
    const outputDir = path.join(process.cwd(), 'docs', 'compliance');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, `simulacao-lucro-real-${resultado.periodo}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(resultado, null, 2));
    
    console.log(`\n💾 Simulação salva em: ${outputFile}`);
  }
}

if (require.main === module) {
  const simulator = new LucroRealSimulator({
    receitaBruta: 1500000,
    custos: 800000,
    despesas: 350000,
    periodo: '2025-Q1'
  });
  
  simulator.simular();
}

module.exports = LucroRealSimulator;

