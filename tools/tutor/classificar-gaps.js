#!/usr/bin/env node
// tools/tutor/classificar-gaps.js
// Classifica gaps por prioridade (critico/medio/baixo)

import fs from "fs";
import path from "path";

console.log("\n🎯 TUTOR - Classificação de Gaps\n");

const gaps = [
  {
    id: "GAP-001",
    area: "Integração TISS",
    descricao: "Migração para TISS 4.1 incompleta",
    impacto: "Impossibilita faturamento com planos após prazo ANS",
    prioridade: "critico",
    esforco: "medio",
    prazo_sugerido: "30 dias",
  },
  {
    id: "GAP-002",
    area: "Rastreabilidade ANVISA",
    descricao: "Sistema de rastreamento parcial",
    impacto: "Não conformidade com RDC 786/2023, risco de multas",
    prioridade: "critico",
    esforco: "alto",
    prazo_sugerido: "45 dias",
  },
  {
    id: "GAP-003",
    area: "Tutores IA",
    descricao: "Assistentes IA por módulo não implementados",
    impacto: "Aumento do tempo de treinamento e suporte",
    prioridade: "medio",
    esforco: "medio",
    prazo_sugerido: "60 dias",
  },
  {
    id: "GAP-004",
    area: "SPED Fiscal",
    descricao: "Integração SPED não implementada",
    impacto: "Obrigação acessória manual, suscetível a erros",
    prioridade: "medio",
    esforco: "alto",
    prazo_sugerido: "90 dias",
  },
  {
    id: "GAP-005",
    area: "ISO 13485",
    descricao: "Certificação em processo",
    impacto: "Limitação para exportação e alguns contratos",
    prioridade: "medio",
    esforco: "alto",
    prazo_sugerido: "120 dias",
  },
  {
    id: "GAP-006",
    area: "Análise Preditiva",
    descricao: "ML para previsão de demanda não implementado",
    impacto: "Oportunidade de otimização de estoque",
    prioridade: "baixo",
    esforco: "medio",
    prazo_sugerido: "90 dias",
  },
  {
    id: "GAP-007",
    area: "Relatórios Executivos",
    descricao: "Dashboard executivo básico",
    impacto: "Decisões baseadas em dados parciais",
    prioridade: "baixo",
    esforco: "baixo",
    prazo_sugerido: "60 dias",
  },
];

const criticos = gaps.filter((g) => g.prioridade === "critico");
const medios = gaps.filter((g) => g.prioridade === "medio");
const baixos = gaps.filter((g) => g.prioridade === "baixo");

console.log("🔴 GAPS CRÍTICOS (Ação Imediata):\n");
criticos.forEach((g) => {
  console.log(`${g.id} - ${g.area}`);
  console.log(`   Descrição: ${g.descricao}`);
  console.log(`   Impacto: ${g.impacto}`);
  console.log(`   Esforço: ${g.esforco} | Prazo: ${g.prazo_sugerido}\n`);
});

console.log("🟡 GAPS MÉDIOS (Planejar Sprint):\n");
medios.forEach((g) => {
  console.log(`${g.id} - ${g.area}`);
  console.log(`   Descrição: ${g.descricao}`);
  console.log(`   Impacto: ${g.impacto}`);
  console.log(`   Esforço: ${g.esforco} | Prazo: ${g.prazo_sugerido}\n`);
});

console.log("🟢 GAPS BAIXOS (Backlog):\n");
baixos.forEach((g) => {
  console.log(`${g.id} - ${g.area}`);
  console.log(`   Descrição: ${g.descricao}`);
  console.log(`   Impacto: ${g.impacto}`);
  console.log(`   Esforço: ${g.esforco} | Prazo: ${g.prazo_sugerido}\n`);
});

const report = {
  timestamp: new Date().toISOString(),
  total_gaps: gaps.length,
  criticos: criticos.length,
  medios: medios.length,
  baixos: baixos.length,
  gaps_detalhados: gaps,
};

const outPath = path.join(
  ".cursor",
  "agents",
  "tutor",
  `gaps-classificados-${Date.now()}.json`,
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(`📊 RESUMO:`);
console.log(`   Total de Gaps: ${report.total_gaps}`);
console.log(`   🔴 Críticos: ${report.criticos}`);
console.log(`   🟡 Médios: ${report.medios}`);
console.log(`   🟢 Baixos: ${report.baixos}`);
console.log(`\n📄 Relatório salvo em: ${outPath}\n`);

export default report;
