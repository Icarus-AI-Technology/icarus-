import fs from "node:fs";
import path from "node:path";
import { supabase } from "./supabaseClient.js";

function loadMapping() {
  const baseDir = path.resolve("tools/finance/dre-inteligente/config");
  const filePath = fs.existsSync(path.join(baseDir, "dre-mapping.json"))
    ? path.join(baseDir, "dre-mapping.json")
    : path.join(baseDir, "dre-mapping.example.json");

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Busca plano de contas + lançamentos de acordo com o mapeamento.
 * periodStart/periodEnd em ISO (yyyy-mm-dd).
 */
export async function fetchDreData({ periodStart, periodEnd }) {
  const mapping = loadMapping();
  const o = mapping.origem;

  // 1) Plano de contas
  const { data: plano, error: planoError } = await supabase
    .from(o.tabela_plano_contas)
    .select("*");

  if (planoError) {
    throw new Error(
      `[DRE-INTELIGENTE] Erro ao carregar plano de contas: ${planoError.message}`
    );
  }

  // 2) Lançamentos no período
  let query = supabase.from(o.tabela_lancamentos).select("*");

  if (periodStart) {
    query = query.gte(o.campo_lanc_data, periodStart);
  }
  if (periodEnd) {
    query = query.lte(o.campo_lanc_data, periodEnd);
  }

  const { data: lancamentos, error: lancError } = await query;

  if (lancError) {
    throw new Error(
      `[DRE-INTELIGENTE] Erro ao carregar lançamentos: ${lancError.message}`
    );
  }

  return { mapping, plano, lancamentos };
}

