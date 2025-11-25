import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgentERPRequest {
  task_id: string;
  parameters?: {
    source?: string;
    tables?: string[];
    filters?: Record<string, any>;
    date_range?: {
      start: string;
      end: string;
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Service role para acesso completo
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") ?? "",
    );

    if (!user) {
      throw new Error("Unauthorized");
    }

    const request: AgentERPRequest = await req.json();

    console.log("[Agent-ERP] Processing task:", request.task_id);

    // 1. Buscar informações da tarefa
    const { data: task, error: taskError } = await supabaseClient
      .from("agent_tasks")
      .select("*, empresa_id")
      .eq("id", request.task_id)
      .single();

    if (taskError) throw taskError;

    // 2. Atualizar status para "em progresso"
    await supabaseClient
      .from("agent_tasks")
      .update({
        status: "in_progress",
        metadata: {
          ...(task.metadata || {}),
          started_at: new Date().toISOString(),
        },
      })
      .eq("id", request.task_id);

    // 3. Log de início
    await supabaseClient.from("agent_logs").insert({
      task_id: request.task_id,
      agent_name: "agent-erp",
      agent_type: "data_internal",
      event_type: "task_started",
      action: "Fetching internal ERP data",
      log_level: "info",
      details: {
        parameters: request.parameters,
      },
    });

    // 4. Coletar dados internos
    const startTime = Date.now();
    const collectedData: any = {};
    const sources: any[] = [];

    // 4.1 Buscar dados de cirurgias
    if (
      !request.parameters?.tables ||
      request.parameters.tables.includes("cirurgias")
    ) {
      const cirurgiasData = await fetchCirurgiasData(
        supabaseClient,
        task.empresa_id,
        request.parameters?.date_range,
      );
      collectedData.cirurgias = cirurgiasData.data;
      sources.push({
        source_type: "database_internal",
        source_name: "cirurgias",
        record_count: cirurgiasData.count,
        confidence_score: 1.0,
      });

      console.log(
        `[Agent-ERP] Fetched ${cirurgiasData.count} cirurgias records`,
      );
    }

    // 4.2 Buscar dados de consignação
    if (
      !request.parameters?.tables ||
      request.parameters.tables.includes("consignacao_materiais")
    ) {
      const consignacaoData = await fetchConsignacaoData(
        supabaseClient,
        task.empresa_id,
        request.parameters?.date_range,
      );
      collectedData.consignacao = consignacaoData.data;
      sources.push({
        source_type: "database_internal",
        source_name: "materiais_consignados",
        record_count: consignacaoData.count,
        confidence_score: 1.0,
      });

      console.log(
        `[Agent-ERP] Fetched ${consignacaoData.count} consignacao records`,
      );
    }

    // 4.3 Buscar dados de estoque
    if (
      !request.parameters?.tables ||
      request.parameters.tables.includes("estoque")
    ) {
      const estoqueData = await fetchEstoqueData(
        supabaseClient,
        task.empresa_id,
      );
      collectedData.estoque = estoqueData.data;
      sources.push({
        source_type: "database_internal",
        source_name: "estoque",
        record_count: estoqueData.count,
        confidence_score: 1.0,
      });

      console.log(`[Agent-ERP] Fetched ${estoqueData.count} estoque records`);
    }

    // 4.4 Buscar dados IoT (se aplicável)
    if (
      request.parameters?.source === "iot" ||
      request.parameters?.tables?.includes("iot_readings")
    ) {
      const iotData = await fetchIoTData(
        supabaseClient,
        task.empresa_id,
        request.parameters?.date_range,
      );
      collectedData.iot_readings = iotData.data;
      sources.push({
        source_type: "iot_sensor",
        source_name: "iot_readings",
        record_count: iotData.count,
        confidence_score: 0.95,
      });

      console.log(`[Agent-ERP] Fetched ${iotData.count} IoT readings`);
    }

    const executionTime = Date.now() - startTime;

    // 5. Registrar fontes de dados utilizadas
    for (const source of sources) {
      await supabaseClient.from("agent_sources").insert({
        task_id: request.task_id,
        source_type: source.source_type,
        source_name: source.source_name,
        record_count: source.record_count,
        confidence_score: source.confidence_score,
        data_excerpt: {
          sample_size: Math.min(5, source.record_count),
        },
        accessed_at: new Date().toISOString(),
      });
    }

    // 6. Calcular métricas agregadas
    const metrics = calculateMetrics(collectedData);

    // 7. Registrar métricas
    for (const [metricName, metricValue] of Object.entries(metrics)) {
      await supabaseClient.from("agent_metrics").insert({
        task_id: request.task_id,
        agent_name: "agent-erp",
        metric_name: metricName,
        metric_category: "quality",
        metric_value: metricValue as number,
        measurement_time: new Date().toISOString(),
      });
    }

    // 8. Atualizar tarefa com resultados
    await supabaseClient
      .from("agent_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: {
          ...(task.metadata || {}),
          execution_time_ms: executionTime,
          result_data: {
            data: collectedData,
            metrics: metrics,
            sources_count: sources.length,
          },
        },
      })
      .eq("id", request.task_id);

    // 9. Log de conclusão
    await supabaseClient.from("agent_logs").insert({
      task_id: request.task_id,
      agent_name: "agent-erp",
      agent_type: "data_internal",
      event_type: "task_completed",
      action: `Data collection completed: ${sources.length} sources, ${executionTime}ms`,
      log_level: "info",
      duration_ms: executionTime,
      details: {
        sources: sources.map((s) => s.source_name),
        metrics: metrics,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: request.task_id,
        execution_time_ms: executionTime,
        sources_count: sources.length,
        metrics: metrics,
        data_summary: {
          cirurgias_count: collectedData.cirurgias?.length || 0,
          consignacao_count: collectedData.consignacao?.length || 0,
          estoque_count: collectedData.estoque?.length || 0,
          iot_readings_count: collectedData.iot_readings?.length || 0,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Agent-ERP] Error:", error);

    // Registrar erro no log
    if (error.task_id) {
      try {
        const supabaseClient = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        );

        await supabaseClient.from("agent_logs").insert({
          task_id: error.task_id,
          agent_name: "agent-erp",
          event_type: "error_occurred",
          action: "Error during data collection",
          log_level: "error",
          details: {
            error_message: error.message,
            stack_trace: error.stack,
          },
        });

        await supabaseClient
          .from("agent_tasks")
          .update({
            status: "failed",
            error_message: error.message,
            completed_at: new Date().toISOString(),
          })
          .eq("task_id", error.task_id);
      } catch (logError) {
        console.error("[Agent-ERP] Error logging failed:", logError);
      }
    }

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
 * Buscar dados de cirurgias
 */
async function fetchCirurgiasData(
  client: any,
  organizationId: string,
  dateRange?: { start: string; end: string },
) {
  let query = client
    .from("cirurgias")
    .select("*, cirurgia_materiais(*), pacientes(*)")
    .eq("empresa_id", organizationId)
    .order("data_cirurgia", { ascending: false });

  if (dateRange) {
    query = query
      .gte("data_cirurgia", dateRange.start)
      .lte("data_cirurgia", dateRange.end);
  } else {
    // Padrão: últimos 90 dias
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    query = query.gte("data_cirurgia", ninetyDaysAgo.toISOString());
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data: data || [], count: data?.length || 0 };
}

/**
 * Buscar dados de consignação
 */
async function fetchConsignacaoData(
  client: any,
  organizationId: string,
  dateRange?: { start: string; end: string },
) {
  let query = client
    .from("materiais_consignados")
    .select("*, produtos(*), lotes(*)")
    .eq("empresa_id", organizationId)
    .order("created_at", { ascending: false });

  if (dateRange) {
    query = query
      .gte("created_at", dateRange.start)
      .lte("created_at", dateRange.end);
  }

  const { data, error } = await query.limit(1000);

  if (error) throw error;

  return { data: data || [], count: data?.length || 0 };
}

/**
 * Buscar dados de estoque
 */
async function fetchEstoqueData(client: any, organizationId: string) {
  const { data, error } = await client
    .from("estoque")
    .select("*, produtos(*), lotes(*)")
    .eq("empresa_id", organizationId)
    .gte("quantidade", 0)
    .order("quantidade", { ascending: true });

  if (error) throw error;

  return { data: data || [], count: data?.length || 0 };
}

/**
 * Buscar dados IoT
 */
async function fetchIoTData(
  client: any,
  organizationId: string,
  dateRange?: { start: string; end: string },
) {
  // Buscar devices da organização
  const { data: devices } = await client
    .from("iot_devices")
    .select("device_id")
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (!devices || devices.length === 0) {
    return { data: [], count: 0 };
  }

  const deviceIds = devices.map((d: any) => d.device_id);

  let query = client
    .from("iot_readings")
    .select("*, iot_devices(*)")
    .in("device_id", deviceIds)
    .order("read_at", { ascending: false });

  if (dateRange) {
    query = query.gte("read_at", dateRange.start).lte("read_at", dateRange.end);
  } else {
    // Padrão: últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte("read_at", thirtyDaysAgo.toISOString());
  }

  const { data, error } = await query.limit(5000);

  if (error) throw error;

  return { data: data || [], count: data?.length || 0 };
}

/**
 * Calcular métricas agregadas
 */
function calculateMetrics(data: any): Record<string, number> {
  const metrics: Record<string, number> = {};

  // Métricas de cirurgias
  if (data.cirurgias) {
    metrics.total_cirurgias = data.cirurgias.length;
    metrics.avg_materiais_por_cirurgia =
      data.cirurgias.reduce(
        (sum: number, c: any) => sum + (c.cirurgia_materiais?.length || 0),
        0,
      ) / (data.cirurgias.length || 1);
  }

  // Métricas de consignação
  if (data.consignacao) {
    metrics.total_materiais_consignacao = data.consignacao.length;
    metrics.valor_total_consignacao = data.consignacao.reduce(
      (sum: number, m: any) => sum + (m.valor_unitario * m.quantidade || 0),
      0,
    );
  }

  // Métricas de estoque
  if (data.estoque) {
    metrics.total_itens_estoque = data.estoque.length;
    metrics.valor_total_estoque = data.estoque.reduce(
      (sum: number, e: any) =>
        sum + (e.valor_unitario * e.quantidade || 0),
      0,
    );
    metrics.itens_baixo_estoque = data.estoque.filter(
      (e: any) => e.quantidade < e.estoque_minimo,
    ).length;
  }

  // Métricas IoT
  if (data.iot_readings) {
    metrics.total_leituras_iot = data.iot_readings.length;
    metrics.leituras_rfid = data.iot_readings.filter(
      (r: any) => r.reading_type === "rfid_tag_read",
    ).length;
  }

  return metrics;
}
