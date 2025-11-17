/**
 * Script de Inserção de Dados via IA
 * Gera dados realistas para treinar os modelos ML
 */

import { supabase } from "@/lib/supabase";

// ============================================
// GERADOR DE DADOS REALISTAS
// ============================================

interface DadosGerados {
  produtos: number;
  lotes: number;
  cirurgias: number;
  financeiro: number;
  compliance: number;
}

/**
 * Gera produtos OPME realistas
 */
async function gerarProdutosOPME(quantidade: number = 100): Promise<number> {
  console.log(`📦 Gerando ${quantidade} produtos OPME...`);

  const categorias = [
    "Implantes Ortopédicos",
    "Próteses Cardiovasculares",
    "Materiais de Síntese",
    "Implantes Neurológicos",
    "Dispositivos Oftalmológicos",
  ];

  const fabricantes = [
    "Johnson & Johnson",
    "Medtronic",
    "Stryker",
    "Boston Scientific",
    "Abbott",
    "Baxter",
  ];

  const produtos = [];

  for (let i = 0; i < quantidade; i++) {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const fabricante =
      fabricantes[Math.floor(Math.random() * fabricantes.length)];

    produtos.push({
      nome: `${categoria} ${fabricante} ${1000 + i}`,
      descricao: `Material cirúrgico de alta precisão para procedimentos ${categoria.toLowerCase()}`,
      codigo: `OPME-${String(1000 + i).padStart(6, "0")}`,
      registro_anvisa: `${Math.floor(Math.random() * 9000000) + 1000000}`,
      categoria,
      fabricante,
      preco_compra: Math.round((Math.random() * 5000 + 500) * 100) / 100,
      preco_venda: Math.round((Math.random() * 8000 + 1000) * 100) / 100,
      custo_medio: Math.round((Math.random() * 6000 + 700) * 100) / 100,
      estoque_minimo: Math.floor(Math.random() * 10) + 5,
      estoque_maximo: Math.floor(Math.random() * 50) + 20,
      ponto_reposicao: Math.floor(Math.random() * 15) + 10,
      unidade_medida: "UN",
      ativo: true,
      controla_lote: true,
      controla_validade: true,
      empresa_id: "00000000-0000-0000-0000-000000000001", // Mock
    });
  }

  const { data, error } = await supabase
    .from("produtos_opme")
    .upsert(produtos)
    .select("id");

  if (error) {
    console.error("❌ Erro ao inserir produtos:", error);
    return 0;
  }

  console.log(`✅ ${data?.length || 0} produtos inseridos`);
  return data?.length || 0;
}

/**
 * Gera lotes de produtos
 */
async function gerarLotes(quantidade: number = 200): Promise<number> {
  console.log(`📊 Gerando ${quantidade} lotes...`);

  // Buscar produtos existentes
  const { data: produtos } = await supabase
    .from("produtos_opme")
    .select("id")
    .limit(100);

  if (!produtos || produtos.length === 0) {
    console.warn("⚠️  Nenhum produto encontrado para gerar lotes");
    return 0;
  }

  const lotes = [];

  for (let i = 0; i < quantidade; i++) {
    const produto = produtos[Math.floor(Math.random() * produtos.length)];
    const dataFabricacao = new Date();
    dataFabricacao.setDate(
      dataFabricacao.getDate() - Math.floor(Math.random() * 180),
    );

    const dataValidade = new Date(dataFabricacao);
    dataValidade.setDate(
      dataValidade.getDate() + Math.floor(Math.random() * 730) + 365,
    ); // 1-3 anos

    lotes.push({
      produto_id: produto.id,
      numero_lote: `LOTE-${String(Date.now() + i).slice(-10)}`,
      numero_serie: `SER-${String(Date.now() + i).slice(-8)}`,
      quantidade_inicial: Math.floor(Math.random() * 100) + 10,
      quantidade_atual: Math.floor(Math.random() * 50) + 5,
      data_fabricacao: dataFabricacao.toISOString().split("T")[0],
      data_validade: dataValidade.toISOString().split("T")[0],
      custo_unitario: Math.round((Math.random() * 500 + 100) * 100) / 100,
      fornecedor: "Fornecedor Teste",
      nota_fiscal: `NF-${Math.floor(Math.random() * 900000) + 100000}`,
      empresa_id: "00000000-0000-0000-0000-000000000001",
    });
  }

  const { data, error } = await supabase
    .from("lotes")
    .upsert(lotes)
    .select("id");

  if (error) {
    console.error("❌ Erro ao inserir lotes:", error);
    return 0;
  }

  console.log(`✅ ${data?.length || 0} lotes inseridos`);
  return data?.length || 0;
}

/**
 * Gera cirurgias históricas
 */
async function gerarCirurgias(quantidade: number = 150): Promise<number> {
  console.log(`🏥 Gerando ${quantidade} cirurgias...`);

  const tipos = [
    "Ortopédica - Prótese de Joelho",
    "Ortopédica - Prótese de Quadril",
    "Cardíaca - Stent Coronário",
    "Cardíaca - Válvula Aórtica",
    "Neurológica - Implante Cerebral",
    "Oftalmológica - Lente Intraocular",
  ];

  const status = ["concluida", "agendada", "em_andamento"];

  const cirurgias = [];

  for (let i = 0; i < quantidade; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const dataCirurgia = new Date();
    dataCirurgia.setDate(
      dataCirurgia.getDate() -
        Math.floor(Math.random() * 180) +
        Math.floor(Math.random() * 60),
    );

    cirurgias.push({
      tipo_cirurgia: tipo,
      data_cirurgia: dataCirurgia.toISOString().split("T")[0],
      status: status[Math.floor(Math.random() * status.length)],
      duracao_minutos: Math.floor(Math.random() * 180) + 60,
      paciente_nome: `Paciente ${1000 + i}`,
      medico_id: "00000000-0000-0000-0000-000000000001", // Mock
      hospital_id: "00000000-0000-0000-0000-000000000001", // Mock
      observacoes: `Procedimento ${tipo} realizado com sucesso`,
      empresa_id: "00000000-0000-0000-0000-000000000001",
    });
  }

  const { data, error } = await supabase
    .from("cirurgias")
    .upsert(cirurgias)
    .select("id");

  if (error) {
    console.error("❌ Erro ao inserir cirurgias:", error);
    return 0;
  }

  console.log(`✅ ${data?.length || 0} cirurgias inseridas`);
  return data?.length || 0;
}

/**
 * Gera dados financeiros (contas a receber/pagar)
 */
async function gerarDadosFinanceiros(
  quantidade: number = 200,
): Promise<number> {
  console.log(`💰 Gerando ${quantidade} transações financeiras...`);

  const contasReceber = [];
  const contasPagar = [];

  for (let i = 0; i < quantidade / 2; i++) {
    const dataVencimento = new Date();
    dataVencimento.setDate(
      dataVencimento.getDate() + Math.floor(Math.random() * 90) - 45,
    );

    const pago = Math.random() > 0.3; // 70% pagos
    const dataPagamento = pago ? new Date(dataVencimento) : null;
    if (dataPagamento) {
      dataPagamento.setDate(
        dataPagamento.getDate() + Math.floor(Math.random() * 10) - 3,
      );
    }

    // Contas a receber
    contasReceber.push({
      cliente_id: "00000000-0000-0000-0000-000000000001", // Mock
      valor: Math.round((Math.random() * 50000 + 5000) * 100) / 100,
      data_vencimento: dataVencimento.toISOString().split("T")[0],
      data_pagamento: dataPagamento?.toISOString().split("T")[0] || null,
      status: pago
        ? "pago"
        : dataVencimento < new Date()
          ? "atrasado"
          : "aberto",
      descricao: `Venda de OPME - Pedido ${10000 + i}`,
      empresa_id: "00000000-0000-0000-0000-000000000001",
    });

    // Contas a pagar
    contasPagar.push({
      fornecedor_id: "00000000-0000-0000-0000-000000000001", // Mock
      valor: Math.round((Math.random() * 30000 + 3000) * 100) / 100,
      data_vencimento: dataVencimento.toISOString().split("T")[0],
      data_pagamento: dataPagamento?.toISOString().split("T")[0] || null,
      status: pago
        ? "pago"
        : dataVencimento < new Date()
          ? "atrasado"
          : "aberto",
      descricao: `Compra de materiais - NF ${20000 + i}`,
      empresa_id: "00000000-0000-0000-0000-000000000001",
    });
  }

  let total = 0;

  const { data: dataReceber, error: errorReceber } = await supabase
    .from("contas_receber")
    .upsert(contasReceber)
    .select("id");

  if (errorReceber) {
    console.error("❌ Erro ao inserir contas a receber:", errorReceber);
  } else {
    console.log(`✅ ${dataReceber?.length || 0} contas a receber inseridas`);
    total += dataReceber?.length || 0;
  }

  const { data: dataPagar, error: errorPagar } = await supabase
    .from("contas_pagar")
    .upsert(contasPagar)
    .select("id");

  if (errorPagar) {
    console.error("❌ Erro ao inserir contas a pagar:", errorPagar);
  } else {
    console.log(`✅ ${dataPagar?.length || 0} contas a pagar inseridas`);
    total += dataPagar?.length || 0;
  }

  return total;
}

/**
 * Gera movimentações de estoque
 */
async function gerarMovimentacoesEstoque(
  quantidade: number = 300,
): Promise<number> {
  console.log(`📈 Gerando ${quantidade} movimentações de estoque...`);

  const { data: produtos } = await supabase
    .from("produtos_opme")
    .select("id")
    .limit(50);

  if (!produtos || produtos.length === 0) {
    console.warn("⚠️  Nenhum produto encontrado");
    return 0;
  }

  const movimentacoes = [];
  const tipos = ["entrada", "saida", "ajuste"];

  for (let i = 0; i < quantidade; i++) {
    const produto = produtos[Math.floor(Math.random() * produtos.length)];
    const dataMovimentacao = new Date();
    dataMovimentacao.setDate(
      dataMovimentacao.getDate() - Math.floor(Math.random() * 180),
    );

    movimentacoes.push({
      produto_id: produto.id,
      tipo: tipos[Math.floor(Math.random() * tipos.length)],
      quantidade: Math.floor(Math.random() * 50) + 1,
      data_movimentacao: dataMovimentacao.toISOString(),
      usuario_id: "00000000-0000-0000-0000-000000000001", // Mock
      observacao: `Movimentação automática ${i + 1}`,
      empresa_id: "00000000-0000-0000-0000-000000000001",
    });
  }

  const { data, error } = await supabase
    .from("estoque_movimentacoes")
    .upsert(movimentacoes)
    .select("id");

  if (error) {
    console.error("❌ Erro ao inserir movimentações:", error);
    return 0;
  }

  console.log(`✅ ${data?.length || 0} movimentações inseridas`);
  return data?.length || 0;
}

// ============================================
// EXECUTOR PRINCIPAL
// ============================================

export async function gerarDadosRealistasIA(): Promise<DadosGerados> {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                                                        ║");
  console.log("║        🤖 GERAÇÃO DE DADOS PARA TREINO DE IA           ║");
  console.log("║                                                        ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const resultados: DadosGerados = {
    produtos: 0,
    lotes: 0,
    cirurgias: 0,
    financeiro: 0,
    compliance: 0,
  };

  try {
    // 1. Produtos OPME
    resultados.produtos = await gerarProdutosOPME(100);

    // 2. Lotes
    resultados.lotes = await gerarLotes(200);

    // 3. Cirurgias
    resultados.cirurgias = await gerarCirurgias(150);

    // 4. Financeiro
    resultados.financeiro = await gerarDadosFinanceiros(200);

    // 5. Movimentações de estoque
    await gerarMovimentacoesEstoque(300);

    // Resumo
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║                    RESUMO DA GERAÇÃO                   ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    const total = Object.values(resultados).reduce((sum, val) => sum + val, 0);

    console.log(`  📊 Total de Registros: ${total}`);
    console.log("");
    console.log(`  📦 Produtos OPME:      ${resultados.produtos}`);
    console.log(`  📊 Lotes:              ${resultados.lotes}`);
    console.log(`  🏥 Cirurgias:          ${resultados.cirurgias}`);
    console.log(`  💰 Financeiro:         ${resultados.financeiro}`);
    console.log("");
    console.log("  🎉 Dados gerados com sucesso!");
    console.log(
      "  💡 Os modelos de IA agora têm dados realistas para treinar.",
    );
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("\n❌ Erro durante geração de dados:", error);
  }

  return resultados;
}

// Permitir execução direta via console do browser
if (typeof window !== "undefined") {
  (window as any).gerarDadosIA = gerarDadosRealistasIA;
  console.log("💡 Use window.gerarDadosIA() para gerar dados de treino");
}
