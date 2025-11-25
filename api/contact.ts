import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  applyVercelSecurity,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  logSuspiciousRequest,
  STRICT_RATE_LIMIT,
} from '../src/lib/security/apiMiddleware';

interface ContactFormData {
  nome: string;
  email: string;
  mensagem: string;
  telefone?: string;
  assunto?: string;
}

// Honeypot field para detectar bots
const HONEYPOT_FIELD = 'website';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  // Aplicar middleware de segurança (CORS, rate limit, headers)
  const securityPassed = applyVercelSecurity(req, res, {
    rateLimit: STRICT_RATE_LIMIT, // 10 req/min para formulário de contato
    allowedMethods: ['POST', 'OPTIONS'],
    strictOrigin: process.env.NODE_ENV === 'production',
  });

  if (!securityPassed) {
    return; // Resposta já enviada pelo middleware
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    });
  }

  try {
    const rawData = req.body as ContactFormData & { [HONEYPOT_FIELD]?: string };

    // Honeypot check - se preenchido, é provavelmente um bot
    if (rawData[HONEYPOT_FIELD]) {
      logSuspiciousRequest(req, 'Honeypot field filled - likely bot');
      // Retornar sucesso falso para não alertar o bot
      return res.status(200).json({
        ok: true,
        message: 'Mensagem enviada com sucesso!',
      });
    }

    // Sanitizar inputs
    const nome = sanitizeString(rawData.nome);
    const email = sanitizeEmail(rawData.email);
    const mensagem = sanitizeString(rawData.mensagem);
    const assunto = rawData.assunto ? sanitizeString(rawData.assunto) : undefined;
    const telefone = rawData.telefone ? sanitizePhone(rawData.telefone) : undefined;

    // Validações
    if (!nome || nome.length < 2) {
      return res.status(400).json({
        ok: false,
        error: 'Nome é obrigatório (mínimo 2 caracteres)',
      });
    }

    if (nome.length > 100) {
      return res.status(400).json({
        ok: false,
        error: 'Nome muito longo (máximo 100 caracteres)',
      });
    }

    if (!email) {
      return res.status(400).json({
        ok: false,
        error: 'Email é obrigatório',
      });
    }

    // Validação de email mais robusta
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Email inválido',
      });
    }

    if (!mensagem || mensagem.length < 10) {
      return res.status(400).json({
        ok: false,
        error: 'Mensagem é obrigatória (mínimo 10 caracteres)',
      });
    }

    if (mensagem.length > 5000) {
      return res.status(400).json({
        ok: false,
        error: 'Mensagem muito longa (máximo 5000 caracteres)',
      });
    }

    // Detectar spam patterns
    const spamPatterns = [
      /\b(viagra|cialis|casino|lottery|winner|congratulations)\b/i,
      /\b(click here|free money|act now|limited time)\b/i,
      /(http[s]?:\/\/){3,}/i, // Muitos URLs
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(mensagem) || pattern.test(nome)) {
        logSuspiciousRequest(req, `Spam pattern detected: ${pattern}`);
        // Retornar sucesso falso
        return res.status(200).json({
          ok: true,
          message: 'Mensagem enviada com sucesso!',
      });
      }
    }

    // Save to Supabase
    if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
      );
      
      const { error: insertError } = await supabase.from('contact_messages').insert({
        nome,
        email,
        telefone: telefone ?? null,
        assunto: assunto ?? null,
        mensagem,
        status: 'novo',
        ip_address: req.headers['x-forwarded-for'] || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
      });

      if (insertError) {
        console.error('❌ Erro ao salvar mensagem no Supabase:', insertError);
        throw new Error('Erro ao salvar mensagem');
      }

      console.log('✅ Mensagem salva no Supabase com sucesso');
    } else {
      console.warn('⚠️ Supabase não configurado - mensagem não salva no banco');
      console.log('📧 Nova mensagem de contato:', {
        nome,
        email,
        telefone,
        assunto,
        mensagem: mensagem.substring(0, 100) + '...', // Truncar para log
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Mensagem enviada com sucesso!',
    });
  } catch (error) {
    console.error('❌ Erro ao processar mensagem de contato:', error);
    return res.status(500).json({
      ok: false,
      error: 'Erro interno do servidor',
    });
  }
}
