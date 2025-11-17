/**
 * Edge Function: EDR Stream
 * Real-time streaming of EDR research progress
 *
 * Endpoint: /functions/v1/edr-stream
 * Method: GET
 * Query: ?sessionId=xxx
 *
 * Returns: Server-Sent Events (SSE) stream
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Session ID required", { status: 400 });
  }

  // Verify session exists
  const { data: session, error } = await supabase
    .from("edr_research_sessions")
    .select("id, status")
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    return new Response("Session not found", { status: 404 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", sessionId })}\n\n`,
        ),
      );

      // Poll for updates every 2 seconds
      const intervalId = setInterval(async () => {
        try {
          // Get session status
          const { data: currentSession } = await supabase
            .from("edr_research_sessions")
            .select("status, current_loop, max_loops, final_report")
            .eq("id", sessionId)
            .single();

          if (!currentSession) {
            clearInterval(intervalId);
            controller.close();
            return;
          }

          // Get recent tasks
          const { data: tasks } = await supabase
            .from("edr_agent_tasks")
            .select("id, agent_type, status, task_description, completed_at")
            .eq("session_id", sessionId)
            .order("completed_at", { ascending: false, nullsFirst: false })
            .limit(5);

          // Get latest reflection
          const { data: reflections } = await supabase
            .from("edr_reflection_logs")
            .select("loop_number, quality_score, knowledge_gaps")
            .eq("session_id", sessionId)
            .order("loop_number", { ascending: false })
            .limit(1);

          // Send update
          const update = {
            type: "update",
            session: {
              status: currentSession.status,
              currentLoop: currentSession.current_loop,
              maxLoops: currentSession.max_loops,
              progress: Math.round(
                (currentSession.current_loop / currentSession.max_loops) * 100,
              ),
            },
            recentTasks: tasks || [],
            latestReflection: reflections?.[0] || null,
            hasReport: !!currentSession.final_report,
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(update)}\n\n`),
          );

          // Close stream if completed
          if (["completed", "failed"].includes(currentSession.status)) {
            clearInterval(intervalId);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
            );
            controller.close();
          }
        } catch (err) {
          console.error("Stream error:", err);
          clearInterval(intervalId);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: err.message })}\n\n`,
            ),
          );
          controller.close();
        }
      }, 2000);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
