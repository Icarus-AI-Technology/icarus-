import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  subject?: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<VercelResponse | void> {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const data = req.body as ContactFormData;

    // Validação básica
    if (!data.name || typeof data.name !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Nome é obrigatório",
      });
    }

    if (!data.email || typeof data.email !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Email é obrigatório",
      });
    }

    if (!data.message || typeof data.message !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Mensagem é obrigatória",
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        ok: false,
        error: "Email inválido",
      });
    }

    // Log da mensagem (em produção, você enviaria para SendGrid, Supabase, etc.)
    console.log("📧 Nova mensagem de contato:", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    // Simular delay de processamento
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Em produção, você poderia:
    // 1. Enviar email via SendGrid
    // 2. Salvar no Supabase
    // 3. Enviar notificação via Twilio
    // 4. Criar ticket no sistema CRM

    // Exemplo de integração com Supabase (descomente quando configurar):
    /*
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
      );
      
      await supabase.from('mensagens_contato').insert({
        nome: data.name,
        email: data.email,
        telefone: data.phone,
        assunto: data.subject,
        mensagem: data.message,
        status: 'novo',
      });
    }
    */

    return res.status(200).json({
      ok: true,
      message: "Mensagem enviada com sucesso!",
    });
  } catch (error) {
    console.error("❌ Erro ao processar mensagem de contato:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro interno do servidor",
    });
  }
}
