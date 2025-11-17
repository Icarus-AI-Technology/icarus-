#!/usr/bin/env node
// tools/compliance/fiscal/list-obrigacoes.js
// Lista obrigações acessórias fiscais

console.log("\n📋 CONTADOR - Obrigações Acessórias\n");

const obrigacoes = [
  {
    nome: "SPED Fiscal (EFD ICMS/IPI)",
    periodicidade: "Mensal",
    status: "pending",
  },
  {
    nome: "SPED Contribuições (EFD Contribuições)",
    periodicidade: "Mensal",
    status: "pending",
  },
  { nome: "SPED Contábil (ECD)", periodicidade: "Anual", status: "pending" },
  {
    nome: "ECF (Escrituração Contábil Fiscal)",
    periodicidade: "Anual",
    status: "pending",
  },
  {
    nome: "DCTF (Declaração de Débitos e Créditos Tributários Federais)",
    periodicidade: "Mensal",
    status: "pending",
  },
  { nome: "DCTF-Web", periodicidade: "Mensal", status: "pending" },
  { nome: "eSocial", periodicidade: "Mensal", status: "pending" },
  { nome: "EFD-Reinf", periodicidade: "Mensal", status: "pending" },
  { nome: "DIRF", periodicidade: "Anual", status: "pending" },
  { nome: "RAIS", periodicidade: "Anual", status: "pending" },
];

console.log("📊 Obrigações Acessórias para OPME (Lucro Real):\n");

obrigacoes.forEach((ob, idx) => {
  console.log(`${idx + 1}. ${ob.nome}`);
  console.log(`   Periodicidade: ${ob.periodicidade}`);
  console.log(
    `   Status: ${ob.status === "pending" ? "⏳ Pendente" : "✅ Configurado"}\n`,
  );
});

console.log(
  "💡 Todas as obrigações devem ser automatizadas via integração com contador/sistema.\n",
);

export default obrigacoes;
