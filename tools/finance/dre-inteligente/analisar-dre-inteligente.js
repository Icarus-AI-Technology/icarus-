#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { analyzeDre } from "./lib/analyzeDRE.js";

function loadDreJson(input) {
  const defaultPath = path.resolve("docs/dre_inteligente_raw.json");
  const filePath = input ? path.resolve(input) : defaultPath;

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `[DRE-INTELIGENTE] Arquivo de DRE não encontrado: ${filePath}. ` +
        "Gere primeiro com gerar-dre-inteligente.js."
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (const a of args) {
    const [k, v] = a.split("=");
    if (k && v) params[k.replace(/^--/, "")] = v;
  }
  return params;
}

async function main() {
  const { input, output } = parseArgs();

  try {
    const dre = loadDreJson(input);
    const analise = analyzeDre(dre);

    const outDir = path.resolve("docs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outFile = output
      ? path.resolve(output)
      : path.join(outDir, "dre_inteligente_analise.json");

    fs.writeFileSync(outFile, JSON.stringify(analise, null, 2), "utf-8");

    console.log("=== DRE INTELIGENTE :: ANÁLISE ===");
    console.log("Período:", analise.meta.periodo || "não informado");
    console.log("Receita Líquida:", analise.indicadores.receitaLiquida);
    console.log("Resultado Operacional:", analise.indicadores.resultadoOperacional);
    console.log("Margem Bruta (%):", (analise.indicadores.margemBruta * 100).toFixed(2));
    console.log(
      "Margem Operacional (%):",
      (analise.indicadores.margemOperacional * 100).toFixed(2)
    );
    console.log("\nInsights:");
    for (const i of analise.insights) {
      console.log("-", i.comentario);
    }
    console.log("\nArquivo completo:", outFile);
  } catch (err) {
    console.error("[DRE-INTELIGENTE] Erro ao analisar DRE:", err.message);
    process.exit(1);
  }
}

main();

