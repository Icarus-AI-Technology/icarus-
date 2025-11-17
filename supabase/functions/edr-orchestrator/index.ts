/**
 * Edge Function: EDR Orchestrator
 * Main orchestration for Enterprise Deep Research
 *
 * Endpoint: /functions/v1/edr-orchestrator
 * Method: POST
 *
 * Body: {
 *   action: 'start' | 'status' | 'stop',
 *   sessionId?: string,
 *   query?: string,
 *   config?: EDRConfig
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

interface EDRConfig {
  llmProvider?: string;
  llmModel?: string;
  maxLoops?: number;
  steeringEnabled?: boolean;
  searchProvider?: string;
}

interface EDRRequest {
  action: "start" | "status" | "stop" | "steering";
  sessionId?: string;
  query?: string;
  config?: EDRConfig;
  steeringCommand?: {
    type: string;
    text?: string;
    parameters?: Record<string, any>;
  };
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, sessionId, query, config, steeringCommand }: EDRRequest =
      await req.json();

    // Validate action
    if (!["start", "status", "stop", "steering"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get auth user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle actions
    switch (action) {
      case "start":
        return await handleStart(query!, config, user.id, corsHeaders);

      case "status":
        return await handleStatus(sessionId!, corsHeaders);

      case "stop":
        return await handleStop(sessionId!, corsHeaders);

      case "steering":
        return await handleSteering(sessionId!, steeringCommand!, corsHeaders);

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("EDR Orchestrator Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

/**
 * Start new EDR research session
 */
async function handleStart(
  query: string,
  config: EDRConfig = {},
  userId: string,
  corsHeaders: Record<string, string>,
) {
  // Get user's organization
  const { data: userOrg } = await supabase
    .from("user_organizations")
    .select("organization_id")
    .eq("user_id", userId)
    .single();

  if (!userOrg) {
    return new Response(
      JSON.stringify({ error: "User not associated with organization" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Create session
  const { data: session, error: sessionError } = await supabase
    .from("edr_research_sessions")
    .insert({
      organization_id: userOrg.organization_id,
      user_id: userId,
      query,
      llm_provider: config.llmProvider || "openai",
      llm_model: config.llmModel,
      max_loops: config.maxLoops || 10,
      steering_enabled: config.steeringEnabled || false,
      search_provider: config.searchProvider || "tavily",
      status: "pending",
      metadata: {},
    })
    .select()
    .single();

  if (sessionError) {
    console.error("Session creation error:", sessionError);
    return new Response(JSON.stringify({ error: "Failed to create session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Start orchestration asynchronously (non-blocking)
  startOrchestration(session.id, query, config);

  return new Response(
    JSON.stringify({
      success: true,
      sessionId: session.id,
      status: "started",
      message: "Research session initiated",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Get session status
 */
async function handleStatus(
  sessionId: string,
  corsHeaders: Record<string, string>,
) {
  const { data: session, error } = await supabase
    .from("edr_research_sessions")
    .select(
      `
      *,
      edr_agent_tasks (count),
      edr_reflection_logs (count),
      edr_visualizations (count)
    `,
    )
    .eq("id", sessionId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: "Session not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Get task breakdown
  const { data: tasks } = await supabase
    .from("edr_agent_tasks")
    .select("status, agent_type")
    .eq("session_id", sessionId);

  const taskBreakdown = {
    total: tasks?.length || 0,
    pending: tasks?.filter((t) => t.status === "pending").length || 0,
    running: tasks?.filter((t) => t.status === "running").length || 0,
    completed: tasks?.filter((t) => t.status === "completed").length || 0,
    failed: tasks?.filter((t) => t.status === "failed").length || 0,
  };

  return new Response(
    JSON.stringify({
      session: {
        id: session.id,
        query: session.query,
        status: session.status,
        currentLoop: session.current_loop,
        maxLoops: session.max_loops,
        progress: Math.round((session.current_loop / session.max_loops) * 100),
        createdAt: session.created_at,
        startedAt: session.started_at,
        completedAt: session.completed_at,
      },
      tasks: taskBreakdown,
      hasReport: !!session.final_report,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Stop/cancel session
 */
async function handleStop(
  sessionId: string,
  corsHeaders: Record<string, string>,
) {
  const { error } = await supabase
    .from("edr_research_sessions")
    .update({
      status: "paused",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    return new Response(JSON.stringify({ error: "Failed to stop session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Session paused" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Add steering command
 */
async function handleSteering(
  sessionId: string,
  steeringCommand: {
    type: string;
    text?: string;
    parameters?: Record<string, any>;
  },
  corsHeaders: Record<string, string>,
) {
  const { data, error } = await supabase
    .from("edr_steering_commands")
    .insert({
      session_id: sessionId,
      command_type: steeringCommand.type,
      command_text: steeringCommand.text,
      parameters: steeringCommand.parameters || {},
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to add steering command" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      commandId: data.id,
      message: "Steering command added",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

/**
 * Start orchestration (async, non-blocking)
 */
async function startOrchestration(
  sessionId: string,
  query: string,
  config: EDRConfig,
) {
  try {
    // Update status to running
    await supabase
      .from("edr_research_sessions")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    // Create Master Planning task
    const { data: masterTask } = await supabase
      .from("edr_agent_tasks")
      .insert({
        session_id: sessionId,
        agent_type: "master",
        task_description: "Decompose research query into specialized sub-tasks",
        task_query: query,
        status: "running",
        priority: 10,
        depth_level: 0,
      })
      .select()
      .single();

    console.log(`✅ Master task created: ${masterTask?.id}`);

    // Simulate task decomposition (in production, call actual LLM)
    const subTasks = [
      { type: "general", query: `General research: ${query}`, priority: 8 },
      { type: "academic", query: `Academic papers on: ${query}`, priority: 7 },
      {
        type: "github",
        query: `GitHub repositories related to: ${query}`,
        priority: 6,
      },
    ];

    // Create sub-tasks
    for (const [index, subTask] of subTasks.entries()) {
      await supabase.from("edr_agent_tasks").insert({
        session_id: sessionId,
        parent_task_id: masterTask?.id,
        agent_type: subTask.type,
        task_description: `Research sub-task: ${subTask.type}`,
        task_query: subTask.query,
        task_order: index,
        priority: subTask.priority,
        depth_level: 1,
        status: "pending",
      });
    }

    // Create initial reflection
    await supabase.from("edr_reflection_logs").insert({
      session_id: sessionId,
      loop_number: 0,
      reflection_type: "gap_detection",
      knowledge_gaps: ["Initial research decomposition"],
      suggested_actions: ["Execute specialized search agents"],
      quality_score: 0,
    });

    console.log(`✅ EDR Orchestration started for session: ${sessionId}`);

    // In production: Continue with agent execution loop
    // For now, mark as completed for demo
    setTimeout(async () => {
      await supabase
        .from("edr_research_sessions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          current_loop: config.maxLoops || 10,
          final_report: `# Research Report: ${query}\n\n## Summary\n\nThis is a demo report. In production, this would contain comprehensive research findings from multiple agents.\n\n## Key Findings\n\n1. Finding from General Agent\n2. Finding from Academic Agent\n3. Finding from GitHub Agent\n\n## Conclusion\n\nDetailed analysis and recommendations.`,
        })
        .eq("id", sessionId);

      console.log(`✅ EDR Session completed: ${sessionId}`);
    }, 5000);
  } catch (error) {
    console.error("Orchestration error:", error);
    await supabase
      .from("edr_research_sessions")
      .update({ status: "failed" })
      .eq("id", sessionId);
  }
}
