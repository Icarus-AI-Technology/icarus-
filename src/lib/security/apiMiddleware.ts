/**
 * API Security Middleware
 * 
 * Middleware de segurança para APIs do Icarus
 * 
 * Funcionalidades:
 * - Rate limiting por IP
 * - Validação de origem (CORS restrito)
 * - Sanitização de inputs
 * - Headers de segurança
 * - Logging de requisições suspeitas
 */

import type { Request, Response, NextFunction } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ===== Rate Limiting =====

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;  // Janela de tempo em ms
  maxRequests: number;  // Máximo de requisições por janela
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minuto
  maxRequests: 60,  // 60 req/min
};

const STRICT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 10,  // 10 req/min para endpoints sensíveis
};

/**
 * Obtém IP do cliente considerando proxies
 */
function getClientIP(req: Request | VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return (req as Request).ip || 'unknown';
}

/**
 * Verifica rate limit
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt < now) {
    // Nova janela
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Middleware de rate limiting para Express
 */
export function rateLimitMiddleware(config?: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIP(req);
    const result = checkRateLimit(ip, config);

    res.setHeader('X-RateLimit-Limit', (config || DEFAULT_RATE_LIMIT).maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    res.setHeader('X-RateLimit-Reset', result.resetAt.toString());

    if (!result.allowed) {
      res.status(429).json({
        ok: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting para Vercel Functions
 */
export function vercelRateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config?: RateLimitConfig
): boolean {
  const ip = getClientIP(req);
  const result = checkRateLimit(ip, config);

  res.setHeader('X-RateLimit-Limit', (config || DEFAULT_RATE_LIMIT).maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toString());

  if (!result.allowed) {
    res.status(429).json({
      ok: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
    });
    return false;
  }

  return true;
}

// ===== CORS =====

const ALLOWED_ORIGINS = [
  'https://icarus-make.vercel.app',
  'https://icarus.icarusai.com.br',
  'https://app.icarusai.com.br',
  process.env.VITE_APP_URL,
].filter(Boolean) as string[];

// Em desenvolvimento, permitir localhost
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173');
}

/**
 * Verifica se a origem é permitida
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

/**
 * Configura headers CORS seguros
 */
export function setCORSHeaders(
  res: Response | VercelResponse,
  origin: string | undefined,
  methods: string[] = ['GET', 'POST', 'OPTIONS']
): void {
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : ALLOWED_ORIGINS[0];
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
}

// ===== Security Headers =====

/**
 * Adiciona headers de segurança
 */
export function setSecurityHeaders(res: Response | VercelResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy básico para APIs
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'"
  );
}

// ===== Input Sanitization =====

/**
 * Sanitiza string removendo caracteres perigosos
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove tags HTML básicas
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limita tamanho
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .toLowerCase()
    .substring(0, 254); // RFC 5321
}

/**
 * Valida e sanitiza telefone brasileiro
 */
export function sanitizePhone(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  
  const digits = input.replace(/\D/g, '');
  
  // Telefone brasileiro: 10-11 dígitos (com DDD)
  if (digits.length < 10 || digits.length > 11) return null;
  
  return digits;
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}

// ===== Logging =====

interface SecurityLogEntry {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  userAgent: string;
  reason: string;
}

/**
 * Loga tentativa suspeita
 */
export function logSuspiciousRequest(
  req: Request | VercelRequest,
  reason: string
): void {
  const entry: SecurityLogEntry = {
    timestamp: new Date().toISOString(),
    ip: getClientIP(req),
    method: req.method || 'UNKNOWN',
    path: req.url || 'UNKNOWN',
    userAgent: (req.headers['user-agent'] as string) || 'UNKNOWN',
    reason,
  };
  
  console.warn('🚨 [SECURITY] Suspicious request:', JSON.stringify(entry));
  
  // TODO: Em produção, enviar para serviço de monitoramento (Sentry, DataDog, etc.)
}

// ===== Webhook Signature Validation =====

import crypto from 'crypto';

/**
 * Valida assinatura HMAC SHA256
 */
export function validateHMACSHA256(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Comparação timing-safe para prevenir timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Valida assinatura com prefixo (ex: sha256=...)
 */
export function validatePrefixedSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  prefix: string = 'sha256='
): boolean {
  if (!signatureHeader.startsWith(prefix)) {
    return false;
  }
  
  const signature = signatureHeader.slice(prefix.length);
  return validateHMACSHA256(payload, signature, secret);
}

// ===== Combined Middleware =====

/**
 * Middleware combinado de segurança para Express
 */
export function securityMiddleware(options?: {
  rateLimit?: RateLimitConfig;
  allowedMethods?: string[];
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Security headers
    setSecurityHeaders(res);
    
    // CORS
    const origin = req.headers.origin as string | undefined;
    setCORSHeaders(res, origin, options?.allowedMethods);
    
    // Preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Rate limiting
    const ip = getClientIP(req);
    const rateResult = checkRateLimit(ip, options?.rateLimit);
    
    res.setHeader('X-RateLimit-Remaining', rateResult.remaining.toString());
    
    if (!rateResult.allowed) {
      logSuspiciousRequest(req, 'Rate limit exceeded');
      res.status(429).json({
        ok: false,
        error: 'Too many requests',
      });
      return;
    }
    
    next();
  };
}

/**
 * Aplica segurança para Vercel Functions
 */
export function applyVercelSecurity(
  req: VercelRequest,
  res: VercelResponse,
  options?: {
    rateLimit?: RateLimitConfig;
    allowedMethods?: string[];
    strictOrigin?: boolean;
  }
): boolean {
  // Security headers
  setSecurityHeaders(res);
  
  // CORS
  const origin = req.headers.origin as string | undefined;
  
  if (options?.strictOrigin && !isOriginAllowed(origin)) {
    logSuspiciousRequest(req, `Blocked origin: ${origin}`);
    res.status(403).json({ ok: false, error: 'Forbidden' });
    return false;
  }
  
  setCORSHeaders(res, origin, options?.allowedMethods);
  
  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }
  
  // Rate limiting
  if (!vercelRateLimit(req, res, options?.rateLimit)) {
    logSuspiciousRequest(req, 'Rate limit exceeded');
    return false;
  }
  
  return true;
}

export { STRICT_RATE_LIMIT, DEFAULT_RATE_LIMIT };

