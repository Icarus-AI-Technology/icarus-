import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface FinanceAiRequest {
  prompt?: string;
  messages?: { role: "user" | "assistant" | "system"; content: string }[];
  userId?: string;
  module?: string;
  ping?: boolean;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST /finance-ai" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: FinanceAiRequest;

  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Ping para o ia-validator
  if (body.ping === true) {
    const anthropicKeyPresent = !!Deno.env.get("ANTHROPIC_API_KEY");
    const modelPresent = !!Deno.env.get("ANTHROPIC_FINANCE_MODEL");

    return new Response(
      JSON.stringify({
        ok: anthropicKeyPresent && modelPresent,
        provider: "anthropic-finance",
        anthropicKeyPresent,
        modelPresent
      }),
      {
        status: anthropicKeyPresent && modelPresent ? 200 : 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  const model = Deno.env.get("ANTHROPIC_FINANCE_MODEL");

  if (!apiKey || !model) {
    return new Response(
      JSON.stringify({
        error: "ANTHROPIC_API_KEY ou ANTHROPIC_FINANCE_MODEL não configurados"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const userPrompt = body.prompt || "Nenhum prompt fornecido.";

  const messages = body.messages && body.messages.length
    ? body.messages
    : [
        {
          role: "user",
          content:
            "Atue como um especialista financeiro/operacional em ERPs OPME no Brasil. Analise DRE, fluxo de caixa, margens, glosas e cenários de negócios. Prompt: " +
            userPrompt
        }
      ];

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: messages.map((m) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errText = await response.text();

      return new Response(
        JSON.stringify({
          error: "Falha na chamada ao Anthropic",
          status: response.status,
          detail: errText
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({
        ok: true,
        provider: "anthropic-finance",
        model,
        result: content
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Erro na função finance-ai", detail: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
