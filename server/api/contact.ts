/**
 * API Endpoint: /api/contact
 * Método: POST
 * 
 * Endpoint para processar mensagens do formulário de contato
 * 100% conformidade com OraclusX Backend Standards
 */

import type { Request, Response } from 'express';

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
}

/**
 * Handler do formulário de contato
 */
export async function handleContactSubmission(req: Request, res: Response) {
  try {
    // Validação básica
    const { name, email, subject, message, source }: ContactRequest = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        required: ['name', 'email', 'subject', 'message']
      });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }

    // Validação de tamanhos
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        error: 'Nome deve ter entre 2 e 100 caracteres'
      });
    }

    if (subject.length < 3 || subject.length > 120) {
      return res.status(400).json({
        error: 'Assunto deve ter entre 3 e 120 caracteres'
      });
    }

    if (message.length < 10 || message.length > 4000) {
      return res.status(400).json({
        error: 'Mensagem deve ter entre 10 e 4000 caracteres'
      });
    }

    // Log da mensagem (em produção, enviar para Supabase/Email/etc)
    console.log('📧 Nova mensagem de contato:', {
      name,
      email,
      subject,
      message,
      source: source || 'web',
      timestamp: new Date().toISOString()
    });

    // TODO: Implementar envio real
    // - Salvar no banco de dados (Supabase)
    // - Enviar email para equipe de suporte
    // - Criar ticket no sistema de atendimento
    // - Enviar confirmação para o remetente

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Resposta de sucesso
    return res.status(200).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      data: {
        id: `contact_${Date.now()}`,
        name,
        email,
        subject,
        status: 'received',
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro ao processar contato:', error);
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

/**
 * Rate limiting (básico)
 * Em produção, usar Redis ou similar
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + 60000 // 1 minuto
    });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Middleware de rate limiting
 */
export function rateLimitMiddleware(req: Request, res: Response, next: Function) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: 'Muitas requisições',
      message: 'Por favor, aguarde um minuto antes de enviar outra mensagem',
      retry_after: 60
    });
  }

  next();
}
