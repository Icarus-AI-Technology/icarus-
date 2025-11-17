#!/usr/bin/env node
// tools/compliance/fiscal/generate-alerts.js
// Gera alertas legais/fiscais

import fs from "fs";
import path from "path";

console.log("\n🚨 CONTADOR - Gerador de Alertas Fiscais\n");

const alertas = [
  {
    tipo: "critico",
    categoria: "SPED",
    titulo: "Prazo SPED Fiscal",
    mensagem:
      "Envio do SPED Fiscal deve ser realizado até o 15º dia do mês subsequente",
    acao: "Configurar automação de geração e envio",
  },
  {
    tipo: "medio",
    categoria: "NF-e",
    titulo: "Contingência NF-e",
    mensagem: "Sistema deve ter mecanismo de contingência para emissão de NF-e",
    acao: "Implementar FS-DA (Formulário de Segurança)",
  },
  {
    tipo: "critico",
    categoria: "ANVISA",
    titulo: "Rastreabilidade OPME",
    mensagem: "Produtos OPME Classe IV requerem rastreabilidade completa",
    acao: "Implementar tracking end-to-end com integração ANVISA",
  },
  {
    tipo: "baixo",
    categoria: "Backup",
    titulo: "Backup Escrituração",
    mensagem: "Manter backup de toda escrituração fiscal por no mínimo 5 anos",
    acao: "Configurar backup automático com retenção de 7 anos",
  },
];

console.log("📋 Alertas Fiscais e de Compliance:\n");

alertas.forEach((alerta, idx) => {
  const icon =
    alerta.tipo === "critico" ? "🔴" : alerta.tipo === "medio" ? "🟡" : "🟢";
  console.log(`${icon} [${alerta.tipo.toUpperCase()}] ${alerta.titulo}`);
  console.log(`   Categoria: ${alerta.categoria}`);
  console.log(`   Mensagem: ${alerta.mensagem}`);
  console.log(`   Ação: ${alerta.acao}\n`);
});

// Salvar relatório
const report = {
  timestamp: new Date().toISOString(),
  alertas,
  resumo: {
    total: alertas.length,
    criticos: alertas.filter((a) => a.tipo === "critico").length,
    medios: alertas.filter((a) => a.tipo === "medio").length,
    baixos: alertas.filter((a) => a.tipo === "baixo").length,
  },
};

const outPath = path.join(
  ".cursor",
  "agents",
  "contador",
  `alertas-${Date.now()}.json`,
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(`📄 Relatório salvo em: ${outPath}\n`);

export default report;
