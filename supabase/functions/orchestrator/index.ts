import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrchestrationRequest {
  query_text: string;
  task_type?: string;
  organization_id: string;
  priority?: number;
  parameters?: Record<string, any>;
  steering_enabled?: boolean;
}

interface SubTask {
  task_type: string;
  agent_name: string;
  description: string;
  priority: number;
  dependencies?: string[];
  parameters?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const request: OrchestrationRequest = await req.json();

    console.log("Orchestrator received request:", {
      query: request.query_text,
      org_id: request.organization_id,
      user_id: user.id,
    });

    // 1. Criar a tarefa principal
    const { data: mainTask, error: taskError } = await supabaseClient
      .from("agent_tasks")
      .insert({
        query_text: request.query_text,
        task_type: request.task_type || "master_planning",
        organization_id: request.organization_id,
        priority: request.priority || 5,
        parameters: request.parameters || {},
        status: "in_progress",
        assigned_agent: "orchestrator-master",
        created_by: user.id,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    console.log("Main task created:", mainTask.task_id);

    // 2. Analisar a query e decompor em subtarefas usando LLM
    const masterPlan = await decomposeQuery(
      request.query_text,
      request.parameters,
    );

    console.log("Master plan generated:", {
      subtasks_count: masterPlan.subtasks.length,
      estimated_duration: masterPlan.estimated_duration_minutes,
    });

    // 3. Atualizar tarefa com o plano master
    await supabaseClient
      .from("agent_tasks")
      .update({
        master_plan: masterPlan,
        metadata: {
          ...mainTask.metadata,
          decomposed_at: new Date().toISOString(),
          subtasks_planned: masterPlan.subtasks.length,
        },
      })
      .eq("task_id", mainTask.task_id);

    // 4. Criar subtarefas
    const subtaskIds: string[] = [];
    for (const subtask of masterPlan.subtasks) {
      const { data: createdSubtask, error: subtaskError } = await supabaseClient
        .from("agent_tasks")
        .insert({
          parent_task_id: mainTask.task_id,
          query_text: request.query_text,
          task_description: subtask.description,
          task_type: subtask.task_type,
          organization_id: request.organization_id,
          priority: subtask.priority,
          assigned_agent: subtask.agent_name,
          parameters: subtask.parameters || {},
          status: "pending",
          created_by: user.id,
          metadata: {
            dependencies: subtask.dependencies || [],
          },
        })
        .select()
        .single();

      if (subtaskError) {
        console.error("Error creating subtask:", subtaskError);
        continue;
      }

      subtaskIds.push(createdSubtask.task_id);

      // Log de criação da subtarefa
      await supabaseClient.from("agent_logs").insert({
        task_id: createdSubtask.task_id,
        agent_name: "orchestrator-master",
        event_type: "task_started",
        action: `Subtask created: ${subtask.description}`,
        log_level: "info",
        details: {
          agent_assigned: subtask.agent_name,
          priority: subtask.priority,
        },
      });
    }

    // 5. Atualizar tarefa principal com IDs das subtarefas
    await supabaseClient
      .from("agent_tasks")
      .update({
        subtasks: subtaskIds,
      })
      .eq("task_id", mainTask.task_id);

    // 6. Disparar execução assíncrona dos agentes (via webhook ou fila)
    if (masterPlan.subtasks.length > 0) {
      await triggerAgentExecution(
        supabaseClient,
        subtaskIds,
        request.steering_enabled || false,
      );
    }

    // 7. Log de orquestração completa
    await supabaseClient.from("agent_logs").insert({
      task_id: mainTask.task_id,
      agent_name: "orchestrator-master",
      event_type: "task_progress",
      action: `Orchestration complete: ${subtaskIds.length} subtasks created`,
      log_level: "info",
      details: {
        subtasks: subtaskIds,
        master_plan: masterPlan,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        task_id: mainTask.task_id,
        subtasks: subtaskIds,
        master_plan: masterPlan,
        message: "Orchestration initiated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Orchestrator error:", error);
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
 * Decompõe a query do usuário em subtarefas usando LLM
 */
async function decomposeQuery(
  queryText: string,
  parameters?: Record<string, any>,
): Promise<{
  objective: string;
  subtasks: SubTask[];
  estimated_duration_minutes: number;
  requires_human_review: boolean;
}> {
  // Aqui você pode integrar com OpenAI/Anthropic/etc para análise inteligente
  // Por enquanto, vou retornar um exemplo baseado em padrões conhecidos

  const lowerQuery = queryText.toLowerCase();

  // Detecção de tipo de análise
  let subtasks: SubTask[] = [];

  if (lowerQuery.includes("consumo") || lowerQuery.includes("opme")) {
    // Análise de consumo OPME
    subtasks = [
      {
        task_type: "data_internal",
        agent_name: "agent-erp",
        description: "Buscar dados de consumo de materiais OPME no ERP",
        priority: 9,
        parameters: {
          source: "erp",
          tables: ["cirurgias", "consignacao_materiais", "estoque"],
        },
      },
      {
        task_type: "data_internal",
        agent_name: "agent-erp",
        description: "Buscar dados de IoT/RFID para rastreabilidade",
        priority: 8,
        dependencies: [],
        parameters: {
          source: "iot",
          tables: ["iot_readings"],
        },
      },
      {
        task_type: "benchmark",
        agent_name: "agent-benchmark",
        description: "Comparar consumo com médias de mercado",
        priority: 7,
        dependencies: [],
        parameters: {
          comparison_type: "market_average",
        },
      },
      {
        task_type: "compliance",
        agent_name: "agent-compliance",
        description: "Validar conformidade ANVISA e rastreabilidade",
        priority: 8,
        dependencies: [],
        parameters: {
          validations: ["anvisa_registration", "udi_validation", "rdc_925"],
        },
      },
      {
        task_type: "synthesis",
        agent_name: "agent-synthesis",
        description: "Gerar relatório consolidado de consumo OPME",
        priority: 10,
        dependencies: ["data_internal", "benchmark", "compliance"],
        parameters: {
          report_type: "consumo_opme",
          format: "markdown",
          include_charts: true,
        },
      },
    ];
  } else if (
    lowerQuery.includes("compliance") ||
    lowerQuery.includes("auditoria")
  ) {
    // Análise de compliance
    subtasks = [
      {
        task_type: "compliance",
        agent_name: "agent-compliance",
        description: "Validar registros ANVISA",
        priority: 10,
      },
      {
        task_type: "data_internal",
        agent_name: "agent-erp",
        description: "Buscar registros de rastreabilidade",
        priority: 9,
      },
      {
        task_type: "synthesis",
        agent_name: "agent-synthesis",
        description: "Gerar relatório de compliance",
        priority: 10,
        dependencies: ["compliance", "data_internal"],
        parameters: {
          report_type: "compliance_summary",
        },
      },
    ];
  } else if (
    lowerQuery.includes("previsão") ||
    lowerQuery.includes("demanda")
  ) {
    // Previsão de demanda
    subtasks = [
      {
        task_type: "data_internal",
        agent_name: "agent-erp",
        description: "Buscar histórico de consumo",
        priority: 9,
      },
      {
        task_type: "benchmark",
        agent_name: "agent-benchmark",
        description: "Analisar tendências de mercado",
        priority: 7,
      },
      {
        task_type: "synthesis",
        agent_name: "agent-synthesis",
        description: "Gerar previsão de demanda",
        priority: 10,
        dependencies: ["data_internal", "benchmark"],
        parameters: {
          report_type: "previsao_demanda",
          ml_model: "timeseries_forecast",
        },
      },
    ];
  } else {
    // Query genérica - análise padrão
    subtasks = [
      {
        task_type: "data_internal",
        agent_name: "agent-erp",
        description: "Buscar dados internos relevantes",
        priority: 8,
      },
      {
        task_type: "synthesis",
        agent_name: "agent-synthesis",
        description: "Gerar relatório personalizado",
        priority: 9,
        dependencies: ["data_internal"],
        parameters: {
          report_type: "custom",
        },
      },
    ];
  }

  return {
    objective: queryText,
    subtasks,
    estimated_duration_minutes: subtasks.length * 3, // Estimativa: 3 min por subtask
    requires_human_review: subtasks.length > 5,
  };
}

/**
 * Dispara execução dos agentes especializados
 */
async function triggerAgentExecution(
  supabaseClient: any,
  subtaskIds: string[],
  steeringEnabled: boolean,
): Promise<void> {
  // Aqui você pode:
  // 1. Chamar Edge Functions específicas para cada agente
  // 2. Adicionar mensagens em uma fila (Redis/RabbitMQ)
  // 3. Usar webhooks para sistemas externos

  console.log("Triggering agent execution for subtasks:", subtaskIds);

  // Por ora, apenas marcar as tarefas como prontas para execução
  // Os agentes podem ser workers que fazem polling dessa tabela

  for (const subtaskId of subtaskIds) {
    // Notificar via Realtime
    await supabaseClient
      .from("agent_tasks")
      .update({
        metadata: {
          ready_for_execution: true,
          notified_at: new Date().toISOString(),
        },
      })
      .eq("task_id", subtaskId);
  }

  console.log("Agent execution triggered successfully");
}
