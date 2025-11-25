import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface TutorRequest {
  prompt?: string;
  context?: Record<string, unknown>;
  healthcheck?: boolean;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return json({ ok: true });
  }

  if (req.method !== "POST") {
    return json({ error: "Use POST /ai-tutor-financeiro" }, 405);
  }

  let payload: TutorRequest = {};
  try {
    payload = await req.json();
  } catch {
    return json({ error: "JSON invalido" }, 400);
  }

  if (payload.healthcheck) {
    return json({
      ok: true,
      anthropicKey: !!Deno.env.get("ANTHROPIC_API_KEY"),
      model: Deno.env.get("ANTHROPIC_FINANCE_MODEL") ?? null,
    });
  }

  const message = payload.prompt ?? "Sem prompt informado.";

  return json({
    ok: true,
    info: "Edge Function placeholder - conecte-se ao provedor Anthropic no proximo passo.",
    prompt: message,
    context: payload.context ?? {},
  });
});
