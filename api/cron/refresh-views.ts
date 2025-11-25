import type { VercelRequest, VercelResponse } from '@vercel/node';
import { triggerSupabaseEdgeFunction, verifyCronSecret } from '../../serverless/cron/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  const auth = verifyCronSecret(req);
  if (!auth.ok) {
    return res.status(auth.status).json({
      ok: false,
      error: auth.message,
    });
  }

  try {
    const result = await triggerSupabaseEdgeFunction('refresh_views');

    return res.status(result.status).json({
      ok: result.ok,
      target: 'refresh_views',
      data: result.data,
    });
  } catch (error) {
    console.error('Failed to trigger refresh_views function', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Erro ao executar Edge Function',
    });
  }
}
