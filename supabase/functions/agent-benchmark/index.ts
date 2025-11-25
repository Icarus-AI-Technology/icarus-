import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgentBenchmarkRequest {
  task_id: string;
  parameters?: {
    comparison_type?: string;
    metrics?: string[];
    suppliers?: string[];
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

    const request: AgentBenchmarkRequest = await req.json();

    console.log("[Agent-Benchmark] Processing task:", request.task_id);

    // 1. Buscar informações da tarefa
    const { data: task, error: taskError } = await supabaseClient
      .from("agent_tasks")
      .select("*, empresa_id, metadata")
      .eq("id", request.task_id)
      .single();

    if (taskError) throw taskError;

    // 2. Atualizar status
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
      agent_name: "agent-benchmark",
      agent_type: "benchmark",
      event_type: "task_started",
      action: "Starting benchmark analysis",
      log_level: "info",
    });

    const startTime = Date.now();

    // 4. Buscar dados internos (da tarefa irmã de dados internos)
    let internalData: any = null;
    const parentTaskId = task.metadata?.parent_task_id;
    if (parentTaskId) {
      const { data: siblings } = await supabaseClient
        .from("agent_tasks")
        .select("metadata")
        .eq("status", "completed");

      // Filtrar tarefas irmãs com mesmo parent e tipo data_internal
      const siblingTask = (siblings || []).find(
        (s: any) => 
          s.metadata?.parent_task_id === parentTaskId &&
          s.metadata?.task_type === "data_internal"
      );

      if (siblingTask) {
        internalData = siblingTask.metadata?.result_data;
      }
    }

    // 5. Executar diferentes tipos de benchmark
    const comparisonType =
      request.parameters?.comparison_type || "market_average";

    let benchmarkResults: any = {};

    switch (comparisonType) {
      case "market_average":
        benchmarkResults = await compareToMarketAverage(
          supabaseClient,
          task.empresa_id,
          internalData,
        );
        break;
      case "supplier_comparison":
        benchmarkResults = await compareSuppliers(
          supabaseClient,
          task.empresa_id,
          request.parameters?.suppliers,
        );
        break;
      case "historical_trend":
        benchmarkResults = await analyzeHistoricalTrends(
          supabaseClient,
          task.empresa_id,
          internalData,
        );
        break;
      case "best_practices":
        benchmarkResults = await compareToBestPractices(
          supabaseClient,
          task.empresa_id,
          internalData,
        );
        break;
      default:
        benchmarkResults = await compareToMarketAverage(
          supabaseClient,
          task.empresa_id,
          internalData,
        );
    }

    const executionTime = Date.now() - startTime;

    // 6. Registrar fontes utilizadas
    for (const source of benchmarkResults.sources || []) {
      await supabaseClient.from("agent_sources").insert({
        task_id: request.task_id,
        source_type: source.type,
        source_name: source.name,
        source_url: source.url,
        confidence_score: source.confidence || 0.8,
        accessed_at: new Date().toISOString(),
      });
    }

    // 7. Registrar métricas
    for (const [metricName, metricValue] of Object.entries(
      benchmarkResults.metrics || {},
    )) {
      await supabaseClient.from("agent_metrics").insert({
        task_id: request.task_id,
        agent_name: "agent-benchmark",
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
        result_data: benchmarkResults,
        },
      })
      .eq("id", request.task_id);

    // 9. Log de conclusão
    await supabaseClient.from("agent_logs").insert({
      task_id: request.task_id,
      agent_name: "agent-benchmark",
      agent_type: "benchmark",
      event_type: "task_completed",
      action: `Benchmark completed: ${comparisonType}`,
      log_level: "info",
      duration_ms: executionTime,
      details: {
        comparison_type: comparisonType,
        sources_used: benchmarkResults.sources?.length || 0,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: request.task_id,
        execution_time_ms: executionTime,
        comparison_type: comparisonType,
        results: benchmarkResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[Agent-Benchmark] Error:", error);

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
 * Comparar com média de mercado
 */
async function compareToMarketAverage(
  client: any,
  organizationId: string,
  internalData: any,
): Promise<any> {
  console.log("[Agent-Benchmark] Comparing to market average...");

  // Dados internos
  const internalMetrics = internalData?.metrics || {};

  // Simular dados de mercado (na produção, viria de APIs externas ou base de dados)
  const marketData = {
    avg_materials_per_surgery: 8.5,
    avg_utilization_rate: 87.3,
    avg_cost_per_surgery: 12500,
    avg_compliance_score: 94.2,
  };

  const comparison = {
    materials_per_surgery: {
      internal: internalMetrics.avg_materiais_por_cirurgia || 0,
      market: marketData.avg_materials_per_surgery,
      variance: calculateVariance(
        internalMetrics.avg_materiais_por_cirurgia,
        marketData.avg_materials_per_surgery,
      ),
      status: determineStatus(
        internalMetrics.avg_materiais_por_cirurgia,
        marketData.avg_materials_per_surgery,
        "lower_is_better",
      ),
    },
    utilization_rate: {
      internal: calculateUtilizationRate(internalData),
      market: marketData.avg_utilization_rate,
      variance: null,
      status: "on_par",
    },
    cost_per_surgery: {
      internal: calculateAvgCostPerSurgery(internalData),
      market: marketData.avg_cost_per_surgery,
      variance: null,
      status: "below_average",
    },
  };

  // Calcular score geral de performance
  const performanceScore = calculatePerformanceScore(comparison);

  return {
    comparison_type: "market_average",
    performance_score: performanceScore,
    comparison: comparison,
    insights: generateInsights(comparison),
    recommendations: generateRecommendations(comparison),
    sources: [
      {
        type: "database_internal",
        name: "Internal ERP Data",
        confidence: 1.0,
      },
      {
        type: "web",
        name: "Market Research Database (Simulated)",
        url: "https://example.com/market-data",
        confidence: 0.75,
      },
    ],
    metrics: {
      performance_score: performanceScore,
      areas_above_market: countStatus(comparison, "above_average"),
      areas_below_market: countStatus(comparison, "below_average"),
      areas_on_par: countStatus(comparison, "on_par"),
    },
  };
}

/**
 * Comparar fornecedores
 */
async function compareSuppliers(
  client: any,
  organizationId: string,
  supplierIds?: string[],
): Promise<any> {
  console.log("[Agent-Benchmark] Comparing suppliers...");

  // Buscar fornecedores da organização
  let query = client
    .from("fornecedores")
    .select("*")
    .eq("empresa_id", organizationId)
    .eq("ativo", true);

  if (supplierIds && supplierIds.length > 0) {
    query = query.in("id", supplierIds);
  }

  const { data: suppliers } = await query;

  if (!suppliers || suppliers.length === 0) {
    return {
      comparison_type: "supplier_comparison",
      message: "No suppliers found for comparison",
      suppliers: [],
    };
  }

  // Comparar métricas de cada fornecedor
  const supplierComparison = [];

  for (const supplier of suppliers) {
    // Buscar dados de pedidos de compra deste fornecedor
    const { data: purchases } = await client
      .from("pedidos_compra")
      .select("*, itens_pedido_compra(*)")
      .eq("fornecedor_id", supplier.id)
      .gte(
        "data_pedido",
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      ); // 6 meses

    const metrics = {
      total_purchases: purchases?.length || 0,
      total_value:
        purchases?.reduce(
          (sum: number, p: any) => sum + (p.valor_total || 0),
          0,
        ) || 0,
      avg_delivery_days: calculateAvgDeliveryDays(purchases || []),
      on_time_delivery_rate: calculateOnTimeRate(purchases || []),
      quality_score: calculateQualityScore(supplier, purchases || []),
    };

    supplierComparison.push({
      supplier_id: supplier.id,
      supplier_name: supplier.nome,
      metrics: metrics,
      rank: 0, // Will be calculated after all suppliers
    });
  }

  // Ranquear fornecedores
  supplierComparison.sort((a, b) => {
    const scoreA = calculateSupplierScore(a.metrics);
    const scoreB = calculateSupplierScore(b.metrics);
    return scoreB - scoreA;
  });

  supplierComparison.forEach((s, index) => {
    s.rank = index + 1;
  });

  return {
    comparison_type: "supplier_comparison",
    suppliers_compared: supplierComparison.length,
    comparison: supplierComparison,
    top_supplier: supplierComparison[0],
    insights: [
      `Top performer: ${supplierComparison[0]?.supplier_name}`,
      `Average delivery time: ${calculateOverallAvgDelivery(supplierComparison)} days`,
    ],
    sources: [
      {
        type: "database_internal",
        name: "Purchase Orders Database",
        confidence: 1.0,
      },
    ],
    metrics: {
      suppliers_analyzed: supplierComparison.length,
      best_delivery_rate: Math.max(
        ...supplierComparison.map((s) => s.metrics.on_time_delivery_rate),
      ),
      avg_quality_score:
        supplierComparison.reduce(
          (sum, s) => sum + s.metrics.quality_score,
          0,
        ) / supplierComparison.length,
    },
  };
}

/**
 * Analisar tendências históricas
 */
async function analyzeHistoricalTrends(
  client: any,
  organizationId: string,
  currentData: any,
): Promise<any> {
  console.log("[Agent-Benchmark] Analyzing historical trends...");

  // Buscar dados históricos (últimos 12 meses)
  const monthlyData = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const { data: cirurgias } = await client
      .from("cirurgias")
      .select("*, cirurgia_materiais(*)")
      .eq("empresa_id", organizationId)
      .gte("data_cirurgia", monthStart.toISOString())
      .lte("data_cirurgia", monthEnd.toISOString());

    const metrics = {
      month: monthStart.toISOString().substring(0, 7),
      surgeries_count: cirurgias?.length || 0,
      materials_used:
        cirurgias?.reduce(
          (sum: number, c: any) => sum + (c.cirurgia_materiais?.length || 0),
          0,
        ) || 0,
      avg_materials_per_surgery:
        cirurgias?.length > 0
          ? cirurgias.reduce(
              (sum: number, c: any) =>
                sum + (c.cirurgia_materiais?.length || 0),
              0,
            ) / cirurgias.length
          : 0,
    };

    monthlyData.push(metrics);
  }

  // Calcular tendências
  const trends = {
    surgeries: calculateTrend(monthlyData.map((m) => m.surgeries_count)),
    materials: calculateTrend(monthlyData.map((m) => m.materials_used)),
    efficiency: calculateTrend(
      monthlyData.map((m) => m.avg_materials_per_surgery),
    ),
  };

  return {
    comparison_type: "historical_trend",
    period: "12 months",
    monthly_data: monthlyData,
    trends: trends,
    insights: [
      `Surgeries ${trends.surgeries.direction}: ${trends.surgeries.change_percent}%`,
      `Materials usage ${trends.materials.direction}: ${trends.materials.change_percent}%`,
      `Efficiency ${trends.efficiency.direction}: ${trends.efficiency.change_percent}%`,
    ],
    sources: [
      {
        type: "database_internal",
        name: "Historical Surgery Records",
        confidence: 1.0,
      },
    ],
    metrics: {
      months_analyzed: monthlyData.length,
      avg_monthly_surgeries:
        monthlyData.reduce((sum, m) => sum + m.surgeries_count, 0) /
        monthlyData.length,
      growth_rate: trends.surgeries.change_percent,
    },
  };
}

/**
 * Comparar com melhores práticas
 */
async function compareToBestPractices(
  client: any,
  organizationId: string,
  internalData: any,
): Promise<any> {
  console.log("[Agent-Benchmark] Comparing to best practices...");

  const bestPractices = {
    utilization_rate: { target: 90, weight: 0.25 },
    compliance_score: { target: 98, weight: 0.3 },
    waste_percentage: { target: 5, weight: 0.2 },
    traceability_coverage: { target: 100, weight: 0.25 },
  };

  const currentMetrics = {
    utilization_rate: calculateUtilizationRate(internalData),
    compliance_score: 95, // Would come from compliance agent
    waste_percentage: 8,
    traceability_coverage: 92,
  };

  const gaps = {};
  let totalScore = 0;

  for (const [key, practice] of Object.entries(bestPractices)) {
    const current = currentMetrics[key as keyof typeof currentMetrics];
    const target = practice.target;
    const achievement = (current / target) * 100;
    const weightedScore = Math.min(achievement, 100) * practice.weight;

    gaps[key] = {
      current: current,
      target: target,
      gap: target - current,
      achievement_percent: achievement.toFixed(2),
      status:
        achievement >= 95
          ? "excellent"
          : achievement >= 80
            ? "good"
            : "needs_improvement",
    };

    totalScore += weightedScore;
  }

  return {
    comparison_type: "best_practices",
    overall_score: totalScore.toFixed(2),
    gaps: gaps,
    insights: generateBestPracticeInsights(gaps),
    recommendations: generateBestPracticeRecommendations(gaps),
    sources: [
      {
        type: "web",
        name: "Industry Best Practices Database",
        url: "https://example.com/best-practices",
        confidence: 0.85,
      },
    ],
    metrics: {
      overall_score: totalScore,
      excellent_areas: Object.values(gaps).filter(
        (g: any) => g.status === "excellent",
      ).length,
      improvement_areas: Object.values(gaps).filter(
        (g: any) => g.status === "needs_improvement",
      ).length,
    },
  };
}

// Helper functions
function calculateVariance(internal: number, market: number): string {
  if (!internal || !market) return "N/A";
  const variance = ((internal - market) / market) * 100;
  return `${variance >= 0 ? "+" : ""}${variance.toFixed(2)}%`;
}

function determineStatus(
  internal: number,
  market: number,
  preference: string,
): string {
  if (!internal || !market) return "unknown";
  const ratio = internal / market;
  if (preference === "lower_is_better") {
    return ratio < 0.95
      ? "above_average"
      : ratio > 1.05
        ? "below_average"
        : "on_par";
  } else {
    return ratio > 1.05
      ? "above_average"
      : ratio < 0.95
        ? "below_average"
        : "on_par";
  }
}

function calculateUtilizationRate(data: any): number {
  // Simulated
  return 82.5;
}

function calculateAvgCostPerSurgery(data: any): number {
  // Simulated
  return 11200;
}

function calculatePerformanceScore(comparison: any): number {
  const scores = Object.values(comparison).map((item: any) => {
    if (item.status === "above_average") return 100;
    if (item.status === "on_par") return 80;
    if (item.status === "below_average") return 60;
    return 0;
  });
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function generateInsights(comparison: any): string[] {
  const insights: string[] = [];
  for (const [key, value] of Object.entries(comparison)) {
    const item = value as any;
    if (item.status === "above_average") {
      insights.push(`${key}: Performance is above market average`);
    } else if (item.status === "below_average") {
      insights.push(
        `${key}: Performance is below market average - improvement opportunity`,
      );
    }
  }
  return insights;
}

function generateRecommendations(comparison: any): string[] {
  const recommendations: string[] = [];
  for (const [key, value] of Object.entries(comparison)) {
    const item = value as any;
    if (item.status === "below_average") {
      recommendations.push(`Improve ${key} to reach market average`);
    }
  }
  return recommendations;
}

function countStatus(comparison: any, status: string): number {
  return Object.values(comparison).filter((item: any) => item.status === status)
    .length;
}

function calculateAvgDeliveryDays(purchases: any[]): number {
  if (purchases.length === 0) return 0;
  const validDeliveries = purchases.filter(
    (p) => p.data_entrega && p.data_pedido,
  );
  if (validDeliveries.length === 0) return 0;

  const totalDays = validDeliveries.reduce((sum, p) => {
    const orderDate = new Date(p.data_pedido);
    const deliveryDate = new Date(p.data_entrega);
    const days =
      (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return totalDays / validDeliveries.length;
}

function calculateOnTimeRate(purchases: any[]): number {
  if (purchases.length === 0) return 0;
  const onTime = purchases.filter(
    (p) =>
      p.data_entrega &&
      p.data_pedido &&
      new Date(p.data_entrega) <= new Date(p.prazo_entrega),
  ).length;
  return (onTime / purchases.length) * 100;
}

function calculateQualityScore(supplier: any, purchases: any[]): number {
  // Simulated quality score based on various factors
  return 85 + Math.random() * 10;
}

function calculateSupplierScore(metrics: any): number {
  return (
    metrics.on_time_delivery_rate * 0.4 +
    metrics.quality_score * 0.4 +
    (100 - metrics.avg_delivery_days) * 0.2
  );
}

function calculateOverallAvgDelivery(suppliers: any[]): number {
  if (suppliers.length === 0) return 0;
  const total = suppliers.reduce(
    (sum, s) => sum + s.metrics.avg_delivery_days,
    0,
  );
  return (total / suppliers.length).toFixed(1);
}

function calculateTrend(values: number[]): any {
  if (values.length < 2) return { direction: "stable", change_percent: 0 };

  const first = values[0];
  const last = values[values.length - 1];
  const change = ((last - first) / first) * 100;

  return {
    direction:
      change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable",
    change_percent: change.toFixed(2),
    first_value: first,
    last_value: last,
  };
}

function generateBestPracticeInsights(gaps: any): string[] {
  const insights: string[] = [];
  for (const [key, value] of Object.entries(gaps)) {
    const gap = value as any;
    if (gap.status === "needs_improvement") {
      insights.push(
        `${key}: ${gap.gap} points below target (${gap.achievement_percent}% achievement)`,
      );
    }
  }
  return insights;
}

function generateBestPracticeRecommendations(gaps: any): string[] {
  const recommendations: string[] = [];
  for (const [key, value] of Object.entries(gaps)) {
    const gap = value as any;
    if (gap.status === "needs_improvement") {
      recommendations.push(
        `Implement improvement plan for ${key} to close ${gap.gap} points gap`,
      );
    }
  }
  return recommendations;
}
