#!/usr/bin/env node
import { fetchDreData } from "./lib/fetchData.js";

async function main() {
  try {
    const { mapping, plano } = await fetchDreData({
      periodStart: null,
      periodEnd: null
    });

    console.log("=== DRE INTELIGENTE :: MAPEAR PLANO DE CONTAS ===");
    console.log("Tabela de plano de contas:", mapping.origem.tabela_plano_contas);
    console.log("Total de contas encontradas:", plano.length);

    const o = mapping.origem;
    const preview = plano.slice(0, 20).map((c) => ({
      codigo: c[o.campo_conta_codigo],
      nome: c[o.campo_conta_nome],
      tipo: c[o.campo_conta_tipo]
    }));

    console.table(preview);
    console.log(
      "\nAjuste o arquivo config/dre-mapping.json para apontar os códigos corretos de cada seção da DRE."
    );
  } catch (err) {
    console.error("[DRE-INTELIGENTE] Erro ao mapear plano de contas:", err.message);
    process.exit(1);
  }
}

main();

