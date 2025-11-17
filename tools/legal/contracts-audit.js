#!/usr/bin/env node
// tools/legal/contracts-audit.js
// Auditoria de contratos

console.log("\n📄 ADVOGADO - Auditoria de Contratos\n");

const contratos = [
  {
    tipo: "Fornecedor",
    status: "vigente",
    vencimento: "2024-12-31",
    clausulas_criticas: [
      "Garantia de qualidade",
      "Certificação ANVISA",
      "Prazo de entrega",
    ],
    conformidade: "ok",
  },
  {
    tipo: "Cliente - Hospital",
    status: "vigente",
    vencimento: "2025-06-30",
    clausulas_criticas: [
      "SLA de atendimento",
      "Rastreabilidade",
      "Garantia de produtos",
    ],
    conformidade: "ok",
  },
  {
    tipo: "Consignação",
    status: "vigente",
    vencimento: "2024-09-15",
    clausulas_criticas: [
      "Responsabilidade por perdas",
      "Prazo de faturamento",
      "Devolução de produtos",
    ],
    conformidade: "warning",
    nota: "Revisar cláusula de responsabilidade",
  },
];

console.log("📋 Contratos em Vigência:\n");

contratos.forEach((c, idx) => {
  const icon = c.conformidade === "ok" ? "✅" : "⚠️";
  console.log(`${icon} ${c.tipo}`);
  console.log(`   Status: ${c.status}`);
  console.log(`   Vencimento: ${c.vencimento}`);
  console.log(`   Cláusulas Críticas: ${c.clausulas_criticas.join(", ")}`);
  if (c.nota) console.log(`   ⚠️ Nota: ${c.nota}`);
  console.log("");
});

console.log(
  "💡 Recomendação: Implementar sistema de alertas 60 dias antes do vencimento.\n",
);

export default contratos;
