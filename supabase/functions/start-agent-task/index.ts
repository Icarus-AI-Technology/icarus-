import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const workerUrl = Deno.env.get("AI_WORKER_URL") ?? "";
  const internalKey = Deno.env.get("INTERNAL_WEBHOOK_KEY") ?? "";

  if (!workerUrl || !internalKey) {
    return new Response(
      JSON.stringify({
        error: "Worker não configurado (AI_WORKER_URL/INTERNAL_WEBHOOK_KEY).",
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  try {
    const requester = createClient(supabaseUrl, supabaseAnon, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await requester.auth.getUser();
    if (userError || !user) {
      throw new Error("Usuário não autenticado.");
    }

    const body = await req.json();
    const taskId = body?.task_id as string | undefined;
    if (!taskId) {
      return new Response(JSON.stringify({ error: "task_id é obrigatório." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { data: task, error: taskError } = await adminClient
      .from("agent_tasks")
      .select("task_id, empresa_id, user_id, created_by")
      .eq("task_id", taskId)
      .single();

    if (taskError || !task) {
      throw new Error("Tarefa não encontrada.");
    }

    if (task.user_id && task.user_id !== user.id && task.created_by !== user.id) {
      return new Response(JSON.stringify({ error: "Acesso negado à task." }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    const workerResponse = await fetch(`${workerUrl}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Key": internalKey,
      },
      body: JSON.stringify({
        task_id: taskId,
        audit_scope: body?.audit_scope,
      }),
    });

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text();
      throw new Error(`Worker retornou erro: ${errorText}`);
    }

    return new Response(
      JSON.stringify({
        status: "accepted",
        task_id: taskId,
      }),
      { status: 202, headers: corsHeaders },
    );
  } catch (error) {
    console.error("start-agent-task error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders },
    );
  }
});

