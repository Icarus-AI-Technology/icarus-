/**
 * Monta a DRE a partir do mapeamento, plano de contas e lançamentos.
 * Resultado: array com seções, valor total e, futuramente, detalhamento por dimensões.
 */
export function buildDre({ mapping, plano, lancamentos }) {
  const { estrutura_dre: secoes, origem: o } = mapping;

  // Indexar contas por código
  const contasByCodigo = new Map();
  for (const c of plano) {
    contasByCodigo.set(c[o.campo_conta_codigo], c);
  }

  // Agrupar lançamentos por código de conta
  const somaPorConta = new Map();

  for (const l of lancamentos) {
    const codigo = l[o.campo_lanc_conta_codigo];
    const valor = Number(l[o.campo_lanc_valor] || 0);
    if (!codigo || isNaN(valor)) continue;

    const atual = somaPorConta.get(codigo) || 0;
    somaPorConta.set(codigo, atual + valor);
  }

  // Helper: soma para uma lista de contas (pode usar prefixos, ex.: "3.01%")
  function somaContas(contas) {
    let total = 0;
    for (const padrao of contas) {
      const isPrefix = padrao.endsWith("%");
      const prefix = isPrefix ? padrao.replace("%", "") : padrao;

      for (const [codigo, valor] of somaPorConta.entries()) {
        if (isPrefix) {
          if (codigo.startsWith(prefix)) total += valor;
        } else {
          if (codigo === prefix) total += valor;
        }
      }
    }
    return total;
  }

  // Mapa de seções para permitir fórmulas
  const valoresSecao = new Map();

  const resultado = [];

  for (const secao of secoes) {
    const { secao: nome, sinal, contas, formula, codigo } = secao;

    let valor = 0;

    if (formula) {
      // Fórmula simples usando nomes de seções anteriores
      // ex: "RECEITA BRUTA - DEDUÇÕES DA RECEITA"
      const tokens =
        formula
          .match(/(\+|-)|([^+-]+)/g)
          ?.map((t) => t.trim())
          .filter(Boolean) ?? [];

      let acumulador = 0;
      let operador = "+";

      for (const t of tokens) {
        if (t === "+" || t === "-") {
          operador = t;
          continue;
        }

        const nomeSecao = t.replace(/\s+/g, " ").trim().toUpperCase();
        const registro = valoresSecao.get(nomeSecao);
        let v = 0;
        if (registro) {
          v =
            registro.sinal === "-"
              ? Math.abs(registro.valor)
              : registro.valor;
        }
        acumulador = operador === "+" ? acumulador + v : acumulador - v;
      }

      valor = acumulador;
    } else if (Array.isArray(contas) && contas.length > 0) {
      valor = somaContas(contas);
    }

    // Aplicar sinal se for obrigatório (+/-). "=" mantém o valor calculado.
    const valorComSinal = sinal === "-" ? -valor : valor;

    valoresSecao.set(nome.toUpperCase(), { valor: valorComSinal, sinal });

    resultado.push({
      codigo,
      secao: nome,
      sinal,
      valor: valorComSinal,
      detalhes: {} // reservado para futuro (centro de custo, médico, convênio)
    });
  }

  return {
    meta: {
      periodo: "não informado",
      geradoEm: new Date().toISOString()
    },
    secoes: resultado
  };
}

