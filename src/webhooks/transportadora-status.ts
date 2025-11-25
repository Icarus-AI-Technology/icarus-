/**
 * Transportadora Webhook - Status de Entregas
 *
 * Processa atualizações de status de rastreamento das transportadoras
 *
 * SEGURANÇA:
 * - Validação de assinatura HMAC SHA256 obrigatória em produção
 * - Rate limiting por transportadora
 * - Validação de payload
 * - Logging de eventos suspeitos
 */

import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import {
  validateHMACSHA256,
  setSecurityHeaders,
  logSuspiciousRequest,
  checkRateLimit,
  sanitizeString,
} from '../lib/security/apiMiddleware';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Rate limit específico por transportadora (mais permissivo)
const TRANSPORTADORA_RATE_LIMIT = {
  windowMs: 60 * 1000,
  maxRequests: 100, // 100 req/min por transportadora
};

interface TransportadoraWebhookPayload {
  transportadora: string;
  codigoRastreio: string;
  status: string;
  evento: {
    data: string;
    hora: string;
    local: string;
    descricao: string;
    tipo: 'POSTADO' | 'TRANSITO' | 'ENTREGUE' | 'DEVOLUCAO' | 'EXTRAVIADO';
  };
  timestamp: string;
  signature?: string;
}

type EnvioRecord = {
  id: string;
  usuario_id: string;
  [key: string]: unknown;
};

// Transportadoras conhecidas e seus IPs permitidos (whitelist)
const TRANSPORTADORAS_WHITELIST: Record<string, string[]> = {
  correios: ['200.252.0.0/16', '189.9.0.0/16'],
  jadlog: ['177.10.0.0/16'],
  tnt: ['200.155.0.0/16'],
  // Adicionar mais conforme necessário
};

/**
 * Verifica se o IP está na whitelist da transportadora
 */
function isIPAllowed(ip: string, transportadora: string): boolean {
  if (!IS_PRODUCTION) return true;

  const allowedIPs = TRANSPORTADORAS_WHITELIST[transportadora.toLowerCase()];
  if (!allowedIPs) {
    console.warn(`⚠️ Transportadora ${transportadora} não tem whitelist configurada`);
    return true; // Permitir se não configurado
  }

  // Verificação simplificada - em produção usar biblioteca de CIDR
  return allowedIPs.some((range) => {
    const [network] = range.split('/');
    return ip.startsWith(network.split('.').slice(0, 2).join('.'));
  });
}

/**
 * Webhook para receber atualizações de status das transportadoras
 */
export async function handleTransportadoraStatus(req: Request, res: Response): Promise<void> {
  // Security headers
  setSecurityHeaders(res);

  try {
    console.log('📦 Webhook transportadora-status recebido');

    const payload: TransportadoraWebhookPayload = req.body;

    // Validar payload básico antes de qualquer processamento
    if (!payload || typeof payload !== 'object') {
      logSuspiciousRequest(req, 'Invalid payload structure');
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    // Sanitizar e validar campos obrigatórios
    const transportadora = sanitizeString(payload.transportadora);
    const codigoRastreio = sanitizeString(payload.codigoRastreio);

    if (!transportadora || !codigoRastreio || !payload.evento) {
      logSuspiciousRequest(req, 'Missing required fields');
      res.status(400).json({ error: 'Invalid payload: missing required fields' });
      return;
    }

    // Rate limiting por transportadora
    const rateLimitKey = `transportadora:${transportadora}`;
    const rateResult = checkRateLimit(rateLimitKey, TRANSPORTADORA_RATE_LIMIT);

    res.setHeader('X-RateLimit-Remaining', rateResult.remaining.toString());

    if (!rateResult.allowed) {
      logSuspiciousRequest(req, `Rate limit exceeded for ${transportadora}`);
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return;
    }

    // Verificar IP (whitelist)
    const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '';
    if (!isIPAllowed(clientIP, transportadora)) {
      logSuspiciousRequest(req, `IP ${clientIP} not in whitelist for ${transportadora}`);
      res.status(403).json({ error: 'Forbidden: IP not allowed' });
      return;
    }

    // Validar assinatura do webhook
    const isValid = await validateWebhookSignature(req, transportadora);
    if (!isValid) {
      logSuspiciousRequest(req, `Invalid signature for ${transportadora}`);
      res.status(401).json({ error: 'Invalid signature' });
      return;
    }

    // Validar código de rastreio (formato)
    if (!isValidTrackingCode(codigoRastreio, transportadora)) {
      logSuspiciousRequest(req, `Invalid tracking code format: ${codigoRastreio}`);
      res.status(400).json({ error: 'Invalid tracking code format' });
      return;
    }

    // Processar atualização
    await processarAtualizacaoStatus({
      ...payload,
      transportadora,
      codigoRastreio,
    });

    // Retornar sucesso
    res.status(200).json({
      success: true,
      message: 'Status atualizado com sucesso',
    });
  } catch (error: unknown) {
    console.error('❌ Erro ao processar webhook:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal server error',
      message: IS_PRODUCTION ? 'An error occurred' : message,
    });
  }
}

/**
 * Valida formato do código de rastreio por transportadora
 */
function isValidTrackingCode(code: string, transportadora: string): boolean {
  const patterns: Record<string, RegExp> = {
    correios: /^[A-Z]{2}\d{9}[A-Z]{2}$/, // Ex: AB123456789BR
    jadlog: /^\d{14}$/, // 14 dígitos
    tnt: /^\d{9}$/, // 9 dígitos
    default: /^[A-Z0-9]{6,20}$/, // Genérico
  };

  const pattern = patterns[transportadora.toLowerCase()] || patterns.default;
  return pattern.test(code);
}

/**
 * Valida assinatura do webhook
 */
async function validateWebhookSignature(req: Request, transportadora: string): Promise<boolean> {
  try {
    const signature = req.headers['x-webhook-signature'] as string;

    if (!signature) {
      if (IS_PRODUCTION) {
      return false;
      }
      console.warn(`⚠️ Webhook sem assinatura para ${transportadora}`);
      return true; // Permitir em dev
    }

    // Obter secret da transportadora do banco de dados
    const { data: config, error } = await supabase
      .from('transportadora_config')
      .select('webhook_secret')
      .eq('nome', transportadora)
      .single();

    if (error || !config?.webhook_secret) {
      console.warn(`⚠️ Secret não configurado para ${transportadora}`);
      return !IS_PRODUCTION;
    }

    // Verificar assinatura HMAC SHA256
    const bodyString = JSON.stringify(req.body);
    return validateHMACSHA256(bodyString, signature, config.webhook_secret);
  } catch (error) {
    console.error('❌ Erro ao validar assinatura:', error);
    return false;
  }
}

/**
 * Processa atualização de status
 */
async function processarAtualizacaoStatus(payload: TransportadoraWebhookPayload): Promise<void> {
  try {
    // Buscar envio no banco de dados
    const { data: envio, error: envioError } = await supabase
      .from('envios')
      .select('*')
      .eq('codigo_rastreio', payload.codigoRastreio)
      .single();

    if (envioError || !envio) {
      console.warn(`⚠️ Envio não encontrado: ${payload.codigoRastreio}`);
      return;
    }

    const envioRecord = envio as EnvioRecord;

    // Atualizar status do envio
    const { error: updateError } = await supabase
      .from('envios')
      .update({
        status: payload.status,
        ultimo_evento: payload.evento,
        updated_at: new Date().toISOString(),
      })
      .eq('id', envioRecord.id);

    if (updateError) {
      throw updateError;
    }

    // Registrar evento no histórico
    const { error: historicoError } = await supabase.from('envios_historico').insert({
      envio_id: envioRecord.id,
      evento_tipo: payload.evento.tipo,
      evento_data: `${payload.evento.data} ${payload.evento.hora}`,
      evento_local: sanitizeString(payload.evento.local),
      evento_descricao: sanitizeString(payload.evento.descricao),
      created_at: new Date().toISOString(),
    });

    if (historicoError) {
      console.error('❌ Erro ao registrar histórico:', historicoError);
    }

    // Notificar usuário se for evento importante
    if (['ENTREGUE', 'EXTRAVIADO', 'DEVOLUCAO'].includes(payload.evento.tipo)) {
      await notificarUsuario(envioRecord, payload);
    }

    console.log(`✅ Status atualizado: ${payload.codigoRastreio} -> ${payload.status}`);
  } catch (error) {
    console.error('❌ Erro ao processar atualização:', error);
    throw error;
  }
}

/**
 * Notifica usuário sobre evento importante
 */
async function notificarUsuario(
  envio: EnvioRecord,
  payload: TransportadoraWebhookPayload
): Promise<void> {
  try {
    // Buscar contato do usuário
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('email, telefone')
      .eq('id', envio.usuario_id)
      .single();

    if (!usuario) {
      return;
    }

    // Preparar mensagem
    const mensagem = gerarMensagemNotificacao(payload);

    // Enviar email (via SendGrid)
    if (usuario.email) {
      await enviarEmail(usuario.email, mensagem);
    }

    // Enviar SMS (via Twilio) para eventos críticos
    if (usuario.telefone && ['EXTRAVIADO', 'DEVOLUCAO'].includes(payload.evento.tipo)) {
      await enviarSMS(usuario.telefone, mensagem);
    }
  } catch (error) {
    console.error('❌ Erro ao notificar usuário:', error);
  }
}

/**
 * Gera mensagem de notificação
 */
function gerarMensagemNotificacao(payload: TransportadoraWebhookPayload): string {
  const emoji: Record<string, string> = {
      POSTADO: '📦',
      TRANSITO: '🚚',
      ENTREGUE: '✅',
      DEVOLUCAO: '↩️',
      EXTRAVIADO: '⚠️',
  };

  return `${emoji[payload.evento.tipo] || '📦'} ${payload.evento.tipo}: Seu pedido (${payload.codigoRastreio}) ${payload.evento.descricao}. Local: ${payload.evento.local}.`;
}

/**
 * Envia email via SendGrid
 */
async function enviarEmail(email: string, mensagem: string): Promise<void> {
  // TODO: Implementação usando SendGrid service
  console.log(`📧 Email enviado para ${email}: ${mensagem}`);
}

/**
 * Envia SMS via Twilio
 */
async function enviarSMS(telefone: string, mensagem: string): Promise<void> {
  // TODO: Implementação usando Twilio service
  console.log(`📱 SMS enviado para ${telefone}: ${mensagem}`);
}

export default handleTransportadoraStatus;
