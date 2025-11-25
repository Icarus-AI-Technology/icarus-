/**
 * Webhooks Index
 *
 * Centraliza todos os handlers de webhooks
 */

export { default as twilioWebhookHandler } from './twilio-sms';
export { default as sendGridWebhookHandler } from './sendgrid-email';

// Re-exportar tipos se necessário
export type {} from './twilio-sms';
export type {} from './sendgrid-email';
