#!/usr/bin/env node
import { fetchDreData } from "./lib/fetchData.js";
import { buildDre } from "./lib/buildDRE.js";
import fs from "node:fs";
import path from "node:path";

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
  const { inicio, fim, output } = parseArgs();

  try {
    const { mapping, plano, lancamentos } = await fetchDreData({
      periodStart: inicio || null,
      periodEnd: fim || null
    });

    const dre = buildDre({ mapping, plano, lancamentos });
    dre.meta.periodo = inicio && fim ? `${inicio} a ${fim}` : "período não informado";

    const outDir = path.resolve("docs");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outFile = output
      ? path.resolve(output)
      : path.join(outDir, "dre_inteligente_raw.json");

    fs.writeFileSync(outFile, JSON.stringify(dre, null, 2), "utf-8");

    console.log("=== DRE INTELIGENTE :: GERADA COM SUCESSO ===");
    console.log("Período:", dre.meta.periodo);
    console.log("Arquivo:", outFile);
  } catch (err) {
    console.error("[DRE-INTELIGENTE] Erro ao gerar DRE:", err.message);
    process.exit(1);
  }
}

main();

