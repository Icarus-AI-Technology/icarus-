import type { VercelRequest, VercelResponse } from '@vercel/node';
import stripeWebhookHandler from '../src/webhooks/stripe-payment';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel edge functions/Node functions pass the raw body differently.
  // Ensure body is available as string for signature verification middleware.
  // Our handler already handles string vs object payload.
  // @ts-expect-error Express types vs Vercel types mismatch handled at runtime
  return stripeWebhookHandler(req, res);
}


