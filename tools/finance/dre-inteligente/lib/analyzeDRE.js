/**
 * Gera insights básicos sobre a DRE gerada.
 * Aqui é só um começo – depois pode sofisticar com IA.
 */
export function analyzeDre(dre) {
  const secoes = dre.secoes || [];
  const byName = new Map();
  for (const s of secoes) {
    byName.set(s.secao.toUpperCase(), s.valor);
  }

  const receitaLiquida = byName.get("RECEITA LÍQUIDA") ?? 0;
  const lucroBruto = byName.get("LUCRO BRUTO") ?? 0;
  const resultadoOperacional = byName.get("RESULTADO OPERACIONAL") ?? 0;

  const margemBruta = receitaLiquida ? lucroBruto / receitaLiquida : 0;
  const margemOperacional = receitaLiquida ? resultadoOperacional / receitaLiquida : 0;

  const insights = [];

  insights.push({
    tipo: "margem",
    chave: "margem_bruta",
    valor: margemBruta,
    comentario:
      margemBruta < 0.3
        ? "Margem bruta baixa; revisar custos diretos (OPMEs, materiais, equipe técnica)."
        : "Margem bruta saudável para o segmento OPME, mantendo competitividade."
  });

  insights.push({
    tipo: "margem",
    chave: "margem_operacional",
    valor: margemOperacional,
    comentario:
      margemOperacional < 0.1
        ? "Margem operacional muito comprimida; revisar despesas operacionais e eficiência administrativa."
        : "Margem operacional coerente; manter disciplina de custos e monitorar crescimento."
  });

  return {
    meta: dre.meta,
    secoes,
    indicadores: {
      receitaLiquida,
      lucroBruto,
      resultadoOperacional,
      margemBruta,
      margemOperacional
    },
    insights
  };
}

