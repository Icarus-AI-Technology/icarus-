/**
 * Script de Testes - Modelos de IA
 * Testa previsões dos novos modelos criados
 */

import { EstoqueAI } from "../services/EstoqueAI";
import { CirurgiasAI } from "../services/CirurgiasAI";
import { FinanceiroAI } from "../services/FinanceiroAI";
import { ComplianceAutomaticoAI } from "../services/compliance/ComplianceAutomaticoAI";

// ============================================
// TESTES DE PREVISÃO
// ============================================

async function testarEstoqueAI() {
  console.log("\n🤖 Testando EstoqueAI...");

  try {
    // Teste 1: Prever demanda
    const produtoId = "00000000-0000-0000-0000-000000000001"; // Mock ID
    console.log("  ⏳ Previsão de demanda...");
    const previsao = await EstoqueAI.preverDemanda(produtoId);
    console.log("  ✅ Previsão:", {
      demanda_30d: previsao.demanda_prevista_30_dias,
      tendencia: previsao.tendencia,
      confianca: `${previsao.confianca}%`,
    });

    // Teste 2: Análise ABC/XYZ
    console.log("  ⏳ Análise ABC/XYZ...");
    const analise = await EstoqueAI.analisarABCXYZ();
    console.log(`  ✅ ${analise.length} produtos classificados`);

    // Teste 3: Detectar anomalias
    console.log("  ⏳ Detecção de anomalias...");
    const anomalias = await EstoqueAI.detectarAnomalias();
    console.log(`  ✅ ${anomalias.length} anomalias detectadas`);

    return true;
  } catch (error) {
    console.error("  ❌ Erro:", error);
    return false;
  }
}

async function testarCirurgiasAI() {
  console.log("\n🏥 Testando CirurgiasAI...");

  try {
    // Teste 1: Prever demanda cirúrgica
    console.log("  ⏳ Previsão de demanda cirúrgica...");
    const demanda = await CirurgiasAI.preverDemanda();
    console.log(`  ✅ ${demanda.length} especialidades analisadas`);
    if (demanda.length > 0) {
      console.log("  📊 Top especialidade:", {
        nome: demanda[0].especialidade,
        previsao_30d: demanda[0].demanda_prevista_30d,
        crescimento: `${demanda[0].crescimento_percentual}%`,
      });
    }

    // Teste 2: Análise de complexidade
    const cirurgiaId = "00000000-0000-0000-0000-000000000001"; // Mock ID
    console.log("  ⏳ Análise de complexidade...");
    const complexidade = await CirurgiasAI.analisarComplexidade(cirurgiaId);
    console.log("  ✅ Complexidade:", {
      nivel: complexidade.nivel_complexidade,
      score: complexidade.score,
      duracao_estimada: `${complexidade.fatores.duracao_estimada}min`,
    });

    // Teste 3: Predição de tempo
    console.log("  ⏳ Predição de tempo cirúrgico...");
    const tempo = await CirurgiasAI.predizerTempo("Ortopédica");
    console.log("  ✅ Tempo previsto:", {
      media: `${tempo.tempo_previsto}min`,
      margem: `±${tempo.margem_erro}min`,
      confianca: `${tempo.confianca}%`,
    });

    return true;
  } catch (error) {
    console.error("  ❌ Erro:", error);
    return false;
  }
}

async function testarFinanceiroAI() {
  console.log("\n💰 Testando FinanceiroAI...");

  try {
    // Teste 1: Score de inadimplência
    const clienteId = "00000000-0000-0000-0000-000000000001"; // Mock ID
    console.log("  ⏳ Score de inadimplência...");
    const score = await FinanceiroAI.calcularScoreInadimplencia(clienteId);
    console.log("  ✅ Score:", {
      valor: score.score,
      categoria: score.categoria_risco,
      probabilidade: `${score.probabilidade_inadimplencia}%`,
    });

    // Teste 2: Previsão de fluxo de caixa
    console.log("  ⏳ Previsão de fluxo de caixa (30 dias)...");
    const fluxo = await FinanceiroAI.preverFluxoCaixa(30);
    console.log(`  ✅ ${fluxo.length} dias previstos`);
    if (fluxo.length > 0) {
      console.log("  📊 Primeiro dia:", {
        data: fluxo[0].data,
        entradas: `R$ ${fluxo[0].entradas_previstas.toLocaleString("pt-BR")}`,
        saldo: `R$ ${fluxo[0].saldo_previsto.toLocaleString("pt-BR")}`,
      });
    }

    // Teste 3: Análise de risco de crédito
    console.log("  ⏳ Análise de risco de crédito...");
    const risco = await FinanceiroAI.analisarRiscoCredito(clienteId);
    console.log("  ✅ Limite sugerido:", {
      valor: `R$ ${risco.limite_credito_sugerido.toLocaleString("pt-BR")}`,
      prazo: `${risco.prazo_maximo_sugerido} dias`,
      garantia: risco.exige_garantia ? "Sim" : "Não",
    });

    // Teste 4: Detectar anomalias
    console.log("  ⏳ Detecção de anomalias financeiras...");
    const anomalias = await FinanceiroAI.detectarAnomalias();
    console.log(`  ✅ ${anomalias.length} anomalias detectadas`);

    return true;
  } catch (error) {
    console.error("  ❌ Erro:", error);
    return false;
  }
}

async function testarComplianceAI() {
  console.log("\n🛡️ Testando ComplianceAI...");

  try {
    // Teste 1: Executar análise completa
    console.log("  ⏳ Análise completa de compliance...");
    const alertas = await ComplianceAutomaticoAI.executarAnalise();
    console.log(`  ✅ ${alertas.length} alertas gerados`);

    // Agrupar por severidade
    const porSeveridade = alertas.reduce(
      (acc, a) => {
        acc[a.severidade] = (acc[a.severidade] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("  📊 Por severidade:", porSeveridade);

    // Teste 2: Obter estatísticas
    console.log("  ⏳ Estatísticas do agente...");
    const stats = await ComplianceAutomaticoAI.obterEstatisticas();
    if (stats) {
      console.log("  ✅ Taxa de acerto:", `${stats.taxa_acerto}%`);
    }

    return true;
  } catch (error) {
    console.error("  ❌ Erro:", error);
    return false;
  }
}

// ============================================
// EXECUTOR PRINCIPAL
// ============================================

export async function executarTestesIA() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                                                        ║");
  console.log("║           🤖 TESTES DE MODELOS DE IA                   ║");
  console.log("║                                                        ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const resultados = {
    estoque: false,
    cirurgias: false,
    financeiro: false,
    compliance: false,
  };

  // Executar testes
  resultados.estoque = await testarEstoqueAI();
  resultados.cirurgias = await testarCirurgiasAI();
  resultados.financeiro = await testarFinanceiroAI();
  resultados.compliance = await testarComplianceAI();

  // Resumo
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                    RESUMO DOS TESTES                   ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const total = Object.keys(resultados).length;
  const sucesso = Object.values(resultados).filter(Boolean).length;
  const taxa = Math.round((sucesso / total) * 100);

  console.log(`  📊 Taxa de Sucesso: ${taxa}% (${sucesso}/${total})`);
  console.log("");
  console.log(`  ${resultados.estoque ? "✅" : "❌"} EstoqueAI`);
  console.log(`  ${resultados.cirurgias ? "✅" : "❌"} CirurgiasAI`);
  console.log(`  ${resultados.financeiro ? "✅" : "❌"} FinanceiroAI`);
  console.log(`  ${resultados.compliance ? "✅" : "❌"} ComplianceAI`);
  console.log("");

  if (taxa === 100) {
    console.log("  🎉 Todos os modelos estão funcionando perfeitamente!");
  } else if (taxa >= 75) {
    console.log("  ⚠️  Alguns modelos precisam de atenção.");
  } else {
    console.log("  ❌ Vários modelos apresentaram problemas.");
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  return resultados;
}

// Permitir execução direta via console do browser
if (typeof window !== "undefined") {
  (window as any).testarModelos = executarTestesIA;
  console.log("💡 Use window.testarModelos() para executar os testes");
}
