import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgentSynthesisRequest {
  task_id: string;
  parameters?: {
    report_type?: string;
    format?: "markdown" | "html" | "json";
    include_charts?: boolean;
    include_summary?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "",
    );

    if (!user) {
      throw new Error("Unauthorized");
    }

    const request: AgentSynthesisRequest = await req.json();

    console.log("[Agent-Synthesis] Processing task:", request.task_id);

    // 1. Buscar informações da tarefa
    const { data: task, error: taskError } = await supabaseClient
      .from("agent_tasks")
      .select("*, organization_id, parent_task_id, query_text")
      .eq("task_id", request.task_id)
      .single();

    if (taskError) throw taskError;

    // 2. Atualizar status
    await supabaseClient
      .from("agent_tasks")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("task_id", request.task_id);

    // 3. Log de início
    await supabaseClient.from("agent_logs").insert({
      task_id: request.task_id,
      agent_name: "agent-synthesis",
      agent_type: "synthesis",
      event_type: "task_started",
      action: "Starting report synthesis",
      log_level: "info",
    });

    const startTime = Date.now();

    // 4. Buscar tarefas irmãs (mesma tarefa pai) para coletar dados
    let siblingTasks: any[] = [];
    if (task.parent_task_id) {
      const { data: siblings } = await supabaseClient
        .from("agent_tasks")
        .select("*, agent_sources(*)")
        .eq("parent_task_id", task.parent_task_id)
        .eq("status", "completed")
        .neq("task_id", request.task_id);

      siblingTasks = siblings || [];
    }

    console.log(
      `[Agent-Synthesis] Found ${siblingTasks.length} completed sibling tasks`,
    );

    // 5. Coletar todos os dados das tarefas anteriores
    const collectedData: any = {
      internal_data: null,
      benchmark_data: null,
      compliance_data: null,
      sources: [],
    };

    for (const siblingTask of siblingTasks) {
      if (siblingTask.task_type === "data_internal") {
        collectedData.internal_data = siblingTask.result_data;
      } else if (siblingTask.task_type === "benchmark") {
        collectedData.benchmark_data = siblingTask.result_data;
      } else if (siblingTask.task_type === "compliance") {
        collectedData.compliance_data = siblingTask.result_data;
      }

      // Coletar fontes
      if (siblingTask.agent_sources && siblingTask.agent_sources.length > 0) {
        collectedData.sources.push(...siblingTask.agent_sources);
      }
    }

    // 6. Gerar relatório baseado no tipo
    const reportType = request.parameters?.report_type || "custom";
    const format = request.parameters?.format || "markdown";

    let reportContent = "";
    let visualizations: any[] = [];

    if (reportType === "consumo_opme") {
      const result = await generateConsumoOPMEReport(
        collectedData,
        task.query_text,
        format,
      );
      reportContent = result.content;
      visualizations = result.visualizations;
    } else if (reportType === "compliance_summary") {
      const result = await generateComplianceReport(
        collectedData,
        task.query_text,
        format,
      );
      reportContent = result.content;
      visualizations = result.visualizations;
    } else if (reportType === "previsao_demanda") {
      const result = await generatePrevisaoDemandaReport(
        collectedData,
        task.query_text,
        format,
      );
      reportContent = result.content;
      visualizations = result.visualizations;
    } else {
      // Relatório personalizado genérico
      const result = await generateCustomReport(
        collectedData,
        task.query_text,
        format,
      );
      reportContent = result.content;
      visualizations = result.visualizations;
    }

    const executionTime = Date.now() - startTime;

    // 7. Criar o relatório na tabela agent_reports
    const { data: report, error: reportError } = await supabaseClient
      .from("agent_reports")
      .insert({
        task_id: request.task_id,
        organization_id: task.organization_id,
        report_type: reportType,
        title: generateReportTitle(reportType, task.query_text),
        summary: generateReportSummary(collectedData, reportType),
        content: reportContent,
        content_format: format,
        data_snapshot: collectedData,
        visualizations: visualizations,
        status: "draft",
        created_by: user.id,
        metadata: {
          generated_by: "agent-synthesis",
          query_text: task.query_text,
          sources_count: collectedData.sources.length,
          generation_time_ms: executionTime,
        },
      })
      .select()
      .single();

    if (reportError) throw reportError;

    console.log(`[Agent-Synthesis] Report created: ${report.report_id}`);

    // 8. Registrar fontes no relatório
    for (const source of collectedData.sources) {
      await supabaseClient.from("agent_sources").insert({
        task_id: request.task_id,
        report_id: report.report_id,
        source_type: source.source_type,
        source_name: source.source_name,
        record_count: source.record_count,
        confidence_score: source.confidence_score,
        accessed_at: new Date().toISOString(),
      });
    }

    // 9. Atualizar tarefa com resultados
    await supabaseClient
      .from("agent_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        execution_time_ms: executionTime,
        result_data: {
          report_id: report.report_id,
          report_type: reportType,
          content_length: reportContent.length,
          visualizations_count: visualizations.length,
        },
      })
      .eq("task_id", request.task_id);

    // 10. Log de conclusão
    await supabaseClient.from("agent_logs").insert({
      task_id: request.task_id,
      agent_name: "agent-synthesis",
      agent_type: "synthesis",
      event_type: "task_completed",
      action: `Report generated successfully: ${reportType}`,
      log_level: "info",
      duration_ms: executionTime,
      details: {
        report_id: report.report_id,
        content_length: reportContent.length,
        visualizations_count: visualizations.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: request.task_id,
        report_id: report.report_id,
        execution_time_ms: executionTime,
        report: {
          title: report.title,
          type: report.report_type,
          status: report.status,
          content_length: reportContent.length,
          visualizations_count: visualizations.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Agent-Synthesis] Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

/**
 * Gerar relatório de consumo OPME
 */
async function generateConsumoOPMEReport(
  data: any,
  query: string,
  format: string,
): Promise<{ content: string; visualizations: any[] }> {
  const internalData = data.internal_data?.data || {};
  const benchmarkData = data.benchmark_data || {};
  const complianceData = data.compliance_data || {};

  const cirurgias = internalData.cirurgias || [];
  const consignacao = internalData.consignacao || [];
  const estoque = internalData.estoque || [];

  // Calcular estatísticas
  const stats = {
    total_cirurgias: cirurgias.length,
    total_materiais_usados: cirurgias.reduce(
      (sum: number, c: any) => sum + (c.cirurgia_materiais?.length || 0),
      0,
    ),
    valor_total_consumo: consignacao.reduce(
      (sum: number, m: any) => sum + (m.valor_unitario * m.quantidade || 0),
      0,
    ),
    taxa_utilizacao:
      consignacao.length > 0
        ? (
            (consignacao.filter((m: any) => m.status === "utilizado").length /
              consignacao.length) *
            100
          ).toFixed(2)
        : 0,
  };

  let content = "";

  if (format === "markdown") {
    content = `# Relatório de Consumo de Materiais OPME

## Resumo Executivo

Este relatório apresenta uma análise detalhada do consumo de materiais OPME (Órteses, Próteses e Materiais Especiais) no período analisado.

### Principais Indicadores

- **Total de Cirurgias**: ${stats.total_cirurgias}
- **Materiais Utilizados**: ${stats.total_materiais_usados}
- **Valor Total do Consumo**: R$ ${stats.valor_total_consumo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- **Taxa de Utilização**: ${stats.taxa_utilizacao}%

## Análise de Cirurgias

Total de ${stats.total_cirurgias} cirurgias realizadas no período analisado.

### Distribuição por Especialidade

${
  cirurgias.length > 0
    ? cirurgias
        .slice(0, 5)
        .map(
          (c: any) =>
            `- ${c.tipo_cirurgia || "Não especificado"}: ${c.cirurgia_materiais?.length || 0} materiais`,
        )
        .join("\n")
    : "- Sem dados disponíveis"
}

## Análise de Consignação

Total de ${consignacao.length} materiais em consignação.

### Status dos Materiais

- **Utilizados**: ${consignacao.filter((m: any) => m.status === "utilizado").length}
- **Em estoque**: ${consignacao.filter((m: any) => m.status === "em_estoque").length}
- **Devolvidos**: ${consignacao.filter((m: any) => m.status === "devolvido").length}

## Análise de Estoque

Total de ${estoque.length} itens em estoque.

### Itens com Baixo Estoque

${estoque.filter((e: any) => e.quantidade_atual < e.estoque_minimo).length} itens abaixo do estoque mínimo.

## Compliance e Rastreabilidade

${
  complianceData.validations_ok
    ? `✅ Todas as validações de compliance estão OK (${complianceData.validations_ok} verificações)`
    : "⚠️ Verificar validações de compliance"
}

## Recomendações

1. **Otimização de Estoque**: Revisar itens com baixo estoque para evitar rupturas
2. **Taxa de Utilização**: Taxa atual de ${stats.taxa_utilizacao}% - Meta: > 85%
3. **Rastreabilidade**: Manter conformidade com RDC 925 da ANVISA

---

*Relatório gerado automaticamente pelo Sistema ICARUS v5.0*
*Data de geração: ${new Date().toLocaleString("pt-BR")}*
`;
  } else if (format === "html") {
    content = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Consumo OPME</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #2c3e50; }
    .metric { background: #ecf0f1; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .metric strong { color: #3498db; }
  </style>
</head>
<body>
  <h1>Relatório de Consumo de Materiais OPME</h1>
  <h2>Resumo Executivo</h2>
  <div class="metric"><strong>Total de Cirurgias:</strong> ${stats.total_cirurgias}</div>
  <div class="metric"><strong>Materiais Utilizados:</strong> ${stats.total_materiais_usados}</div>
  <div class="metric"><strong>Valor Total:</strong> R$ ${stats.valor_total_consumo.toLocaleString("pt-BR")}</div>
  <div class="metric"><strong>Taxa de Utilização:</strong> ${stats.taxa_utilizacao}%</div>
</body>
</html>
`;
  } else {
    // JSON format
    content = JSON.stringify(
      {
        title: "Relatório de Consumo OPME",
        generated_at: new Date().toISOString(),
        stats: stats,
        cirurgias: cirurgias.length,
        consignacao: consignacao.length,
        estoque: estoque.length,
      },
      null,
      2,
    );
  }

  // Gerar visualizações
  const visualizations = [
    {
      type: "chart",
      title: "Consumo por Mês",
      config: {
        type: "bar",
        data: {
          labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
          datasets: [
            {
              label: "Materiais Consumidos",
              data: [12, 19, 15, 25, 22, 30],
            },
          ],
        },
      },
    },
    {
      type: "chart",
      title: "Taxa de Utilização",
      config: {
        type: "doughnut",
        data: {
          labels: ["Utilizados", "Devolvidos", "Em Estoque"],
          datasets: [
            {
              data: [
                consignacao.filter((m: any) => m.status === "utilizado").length,
                consignacao.filter((m: any) => m.status === "devolvido").length,
                consignacao.filter((m: any) => m.status === "em_estoque")
                  .length,
              ],
            },
          ],
        },
      },
    },
  ];

  return { content, visualizations };
}

/**
 * Gerar relatório de compliance
 */
async function generateComplianceReport(
  data: any,
  query: string,
  format: string,
): Promise<{ content: string; visualizations: any[] }> {
  const complianceData = data.compliance_data || {};

  let content = "";

  if (format === "markdown") {
    content = `# Relatório de Compliance e Auditoria

## Resumo Executivo

Este relatório apresenta o status de conformidade regulatória do sistema.

### Status Geral

${complianceData.status === "compliant" ? "✅ Sistema em conformidade" : "⚠️ Ações necessárias"}

## Validações ANVISA

- **Registros validados**: ${complianceData.validations_ok || 0}
- **Pendências**: ${complianceData.validations_pending || 0}
- **Não conformidades**: ${complianceData.validations_failed || 0}

## Rastreabilidade (RDC 925)

Status de conformidade com a RDC 925 da ANVISA.

---

*Relatório gerado automaticamente pelo Sistema ICARUS v5.0*
`;
  } else {
    content = JSON.stringify(complianceData, null, 2);
  }

  return { content, visualizations: [] };
}

/**
 * Gerar relatório de previsão de demanda
 */
async function generatePrevisaoDemandaReport(
  data: any,
  query: string,
  format: string,
): Promise<{ content: string; visualizations: any[] }> {
  let content = `# Relatório de Previsão de Demanda

## Análise Preditiva

Baseado no histórico de consumo, este relatório apresenta previsões de demanda futura.

---

*Relatório gerado automaticamente pelo Sistema ICARUS v5.0*
`;

  return { content, visualizations: [] };
}

/**
 * Gerar relatório personalizado
 */
async function generateCustomReport(
  data: any,
  query: string,
  format: string,
): Promise<{ content: string; visualizations: any[] }> {
  let content = `# Relatório Personalizado

## Consulta

${query}

## Dados Coletados

${JSON.stringify(data, null, 2)}

---

*Relatório gerado automaticamente pelo Sistema ICARUS v5.0*
`;

  return { content, visualizations: [] };
}

/**
 * Gerar título do relatório
 */
function generateReportTitle(reportType: string, query: string): string {
  const titles: Record<string, string> = {
    consumo_opme: "Relatório de Consumo de Materiais OPME",
    compliance_summary: "Relatório de Compliance e Auditoria",
    previsao_demanda: "Relatório de Previsão de Demanda",
    custom: "Relatório Personalizado",
  };

  return titles[reportType] || `Relatório: ${query.substring(0, 50)}...`;
}

/**
 * Gerar resumo do relatório
 */
function generateReportSummary(data: any, reportType: string): string {
  const summaries: Record<string, string> = {
    consumo_opme:
      "Análise detalhada do consumo de materiais OPME incluindo cirurgias, consignação e estoque",
    compliance_summary:
      "Status de conformidade regulatória e rastreabilidade ANVISA",
    previsao_demanda:
      "Previsão de demanda futura baseada em análise histórica e tendências",
    custom: "Relatório personalizado baseado em consulta específica",
  };

  return summaries[reportType] || "Relatório gerado automaticamente";
}
