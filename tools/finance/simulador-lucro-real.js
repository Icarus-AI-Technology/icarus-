#!/usr/bin/env node
// tools/finance/simulador-lucro-real.js
// Simulador de tributação Lucro Real

console.log("\n💰 CONTADOR - Simulador Lucro Real\n");

function simularLucroReal(receita, custos, despesas) {
  const lucro = receita - custos - despesas;
  const irpj = lucro * 0.15; // 15% IRPJ
  const csll = lucro * 0.09; // 9% CSLL
  const adicional = lucro > 20000 ? (lucro - 20000) * 0.1 : 0;

  const totalImpostos = irpj + csll + adicional;
  const lucroLiquido = lucro - totalImpostos;

  return {
    receita,
    custos,
    despesas,
    lucro,
    tributos: {
      irpj,
      csll,
      adicional,
      total: totalImpostos,
    },
    lucroLiquido,
    aliquotaEfetiva: ((totalImpostos / lucro) * 100).toFixed(2) + "%",
  };
}

// Exemplo
const exemplo = simularLucroReal(500000, 200000, 100000);

console.log("📊 Simulação Lucro Real (exemplo):");
console.log(`   Receita: R$ ${exemplo.receita.toLocaleString("pt-BR")}`);
console.log(`   (-) Custos: R$ ${exemplo.custos.toLocaleString("pt-BR")}`);
console.log(`   (-) Despesas: R$ ${exemplo.despesas.toLocaleString("pt-BR")}`);
console.log(`   (=) Lucro: R$ ${exemplo.lucro.toLocaleString("pt-BR")}`);
console.log(`\n   Tributos:`);
console.log(
  `   IRPJ (15%): R$ ${exemplo.tributos.irpj.toLocaleString("pt-BR")}`,
);
console.log(
  `   CSLL (9%): R$ ${exemplo.tributos.csll.toLocaleString("pt-BR")}`,
);
console.log(
  `   Adicional IRPJ: R$ ${exemplo.tributos.adicional.toLocaleString("pt-BR")}`,
);
console.log(`   Total: R$ ${exemplo.tributos.total.toLocaleString("pt-BR")}`);
console.log(
  `\n   (=) Lucro Líquido: R$ ${exemplo.lucroLiquido.toLocaleString("pt-BR")}`,
);
console.log(`   Alíquota Efetiva: ${exemplo.aliquotaEfetiva}\n`);

export { simularLucroReal };
export default exemplo;
