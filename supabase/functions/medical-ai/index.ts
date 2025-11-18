import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface MedicalAiRequest {
  prompt?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
  userId?: string;
  module?: string;
  ping?: boolean;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST /medical-ai" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: MedicalAiRequest;

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
    const openaiKeyPresent = !!Deno.env.get("OPENAI_API_KEY");
    const modelPresent = !!Deno.env.get("OPENAI_MEDICAL_MODEL");

    return new Response(
      JSON.stringify({
        ok: openaiKeyPresent && modelPresent,
        provider: "openai-medical",
        openaiKeyPresent,
        modelPresent
      }),
      {
        status: openaiKeyPresent && modelPresent ? 200 : 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  const model = Deno.env.get("OPENAI_MEDICAL_MODEL");

  if (!apiKey || !model) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY ou OPENAI_MEDICAL_MODEL não configurados"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const messages = body.messages && body.messages.length
    ? body.messages
    : [
        {
          role: "system",
          content:
            "Você é uma IA médica especializada em OPME, ortopedia, traumatologia e contexto hospitalar brasileiro. Responda de forma técnica, clara e com foco em apoio à decisão clínica/operacional. NÃO substitua um médico."
        },
        {
          role: "user",
          content: body.prompt || "Nenhum prompt fornecido."
        }
      ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();

      return new Response(
        JSON.stringify({
          error: "Falha na chamada ao OpenAI",
          status: response.status,
          detail: errText
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    return new Response(
      JSON.stringify({
        ok: true,
        provider: "openai-medical",
        model,
        result: choice?.message?.content ?? "",
        usage: data.usage ?? null
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Erro na função medical-ai", detail: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
