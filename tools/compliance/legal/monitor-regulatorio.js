#!/usr/bin/env node
// tools/compliance/legal/monitor-regulatorio.js
// Monitor de atualizações regulatórias ANVISA/ANS

console.log("\n🔍 ADVOGADO - Monitor Regulatório ANVISA/ANS\n");

const updates = [
  {
    orgao: "ANVISA",
    data: "2024-01-15",
    tipo: "RDC",
    numero: "786/2023",
    assunto: "Rastreabilidade de dispositivos médicos",
    impacto: "alto",
    prazo: "2024-12-31",
    acao_necessaria: "Implementar sistema de rastreabilidade completo",
  },
  {
    orgao: "ANS",
    data: "2024-02-01",
    tipo: "Normativa",
    numero: "598/2024",
    assunto: "Atualização padrão TISS 4.1",
    impacto: "medio",
    prazo: "2024-06-30",
    acao_necessaria: "Atualizar validações TISS para versão 4.1",
  },
  {
    orgao: "ANVISA",
    data: "2024-03-10",
    tipo: "Alerta",
    numero: "A-123/2024",
    assunto: "Recall de lote específico",
    impacto: "critico",
    prazo: "imediato",
    acao_necessaria: "Verificar estoque e notificar clientes",
  },
];

console.log("📊 Atualizações Regulatórias Recentes:\n");

updates.forEach((u, idx) => {
  const icon =
    u.impacto === "critico" ? "🔴" : u.impacto === "alto" ? "🟠" : "🟡";
  console.log(`${icon} [${u.orgao}] ${u.tipo} ${u.numero}`);
  console.log(`   Data: ${u.data}`);
  console.log(`   Assunto: ${u.assunto}`);
  console.log(`   Impacto: ${u.impacto}`);
  console.log(`   Prazo: ${u.prazo}`);
  console.log(`   Ação: ${u.acao_necessaria}\n`);
});

console.log(
  "💡 Recomendação: Configurar alertas automáticos via API ANVISA/ANS.\n",
);

export default updates;
