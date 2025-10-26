/**
 * Stripe Payment Webhook
 * 
 * Processa eventos de pagamento do Stripe
 * 
 * Eventos suportados:
 * - payment_intent.succeeded
 * - payment_intent.failed
 * - charge.succeeded
 * - charge.failed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 */

import { Request, Response } from 'express';
import crypto from 'crypto';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Handler do webhook do Stripe
 */
export async function stripeWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'] as string;

  try {
    // Verificar assinatura
    const event = verifyStripeSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret
    );

    console.log(`💳 Stripe webhook recebido: ${event.type}`);

    // Processar evento
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'charge.succeeded':
        await handleChargeSuccess(event.data.object);
        break;

      case 'charge.failed':
        await handleChargeFailed(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`⚠️  Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('❌ Erro ao processar webhook Stripe:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}

/**
 * Verifica assinatura do webhook
 */
function verifyStripeSignature(payload: string, signature: string, secret: string): any {
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado');
  }

  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
  const sig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  if (!timestamp || !sig) {
    throw new Error('Invalid signature format');
  }

  // Calcular assinatura esperada
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Comparar assinaturas
  if (expectedSig !== sig) {
    throw new Error('Invalid signature');
  }

  return JSON.parse(payload);
}

// ===== Event Handlers =====

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('✅ Pagamento bem-sucedido:', paymentIntent.id);
  
  // TODO: Atualizar pedido no banco de dados
  // TODO: Enviar email de confirmação
  // TODO: Liberar acesso ao produto/serviço
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('❌ Pagamento falhou:', paymentIntent.id);
  
  // TODO: Notificar cliente
  // TODO: Atualizar status do pedido
}

async function handleChargeSuccess(charge: any) {
  console.log('✅ Cobrança bem-sucedida:', charge.id);
  
  // TODO: Registrar transação
}

async function handleChargeFailed(charge: any) {
  console.log('❌ Cobrança falhou:', charge.id);
  
  // TODO: Notificar administrador
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('🔄 Assinatura atualizada:', subscription.id);
  
  // TODO: Atualizar status da assinatura no banco
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('🗑️  Assinatura cancelada:', subscription.id);
  
  // TODO: Desativar acesso do usuário
}

export default stripeWebhookHandler;

