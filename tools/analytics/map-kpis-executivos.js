#!/usr/bin/env node
// tools/analytics/map-kpis-executivos.js
// Mapeia KPIs executivos

console.log("\n📈 GESTÃO - KPIs Executivos\n");

const kpis = {
  financeiro: [
    {
      nome: "Receita Mensal",
      valor: "R$ 2.5M",
      variacao: "+12%",
      status: "positivo",
    },
    { nome: "Margem Bruta", valor: "38%", variacao: "+2%", status: "positivo" },
    { nome: "EBITDA", valor: "R$ 450K", variacao: "-5%", status: "atencao" },
    { nome: "Inadimplência", valor: "8%", variacao: "-1%", status: "positivo" },
  ],
  operacional: [
    {
      nome: "Tempo Médio Faturamento",
      valor: "3.2 dias",
      variacao: "-0.5d",
      status: "positivo",
    },
    {
      nome: "Taxa de Consignação Ativa",
      valor: "72%",
      variacao: "+5%",
      status: "positivo",
    },
    {
      nome: "Giro de Estoque",
      valor: "45 dias",
      variacao: "+3d",
      status: "atencao",
    },
    {
      nome: "NPS Clientes",
      valor: "8.5",
      variacao: "+0.3",
      status: "positivo",
    },
  ],
  compliance: [
    {
      nome: "Conformidade ANVISA",
      valor: "98%",
      variacao: "0%",
      status: "positivo",
    },
    {
      nome: "Auditorias Pendentes",
      valor: "2",
      variacao: "-1",
      status: "positivo",
    },
    {
      nome: "Rastreabilidade",
      valor: "100%",
      variacao: "0%",
      status: "positivo",
    },
  ],
};

console.log("💰 KPIs Financeiros:");
kpis.financeiro.forEach((k) => {
  const icon = k.status === "positivo" ? "✅" : "⚠️";
  console.log(`${icon} ${k.nome}: ${k.valor} (${k.variacao})`);
});

console.log("\n⚙️  KPIs Operacionais:");
kpis.operacional.forEach((k) => {
  const icon = k.status === "positivo" ? "✅" : "⚠️";
  console.log(`${icon} ${k.nome}: ${k.valor} (${k.variacao})`);
});

console.log("\n📋 KPIs de Compliance:");
kpis.compliance.forEach((k) => {
  const icon = k.status === "positivo" ? "✅" : "⚠️";
  console.log(`${icon} ${k.nome}: ${k.valor} (${k.variacao})`);
});

console.log(
  "\n💡 Implementar dashboard executivo com atualização em tempo real.\n",
);

export default kpis;
