import type { VercelRequest } from '@vercel/node';

const DEFAULT_PROJECT_REF = 'gvbkviozlhxorjoavmky';

type AuthResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export type SupabaseInvocationResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

const getHeaderValue = (value?: string | string[]): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export function verifyCronSecret(req: VercelRequest): AuthResult {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return {
      ok: false,
      status: 500,
      message: 'CRON_SECRET não configurada no ambiente do Vercel',
    };
  }

  const headerValue =
    getHeaderValue(req.headers.authorization) ??
    getHeaderValue(req.headers.Authorization as string | string[] | undefined);

  if (headerValue !== `Bearer ${cronSecret}`) {
    return {
      ok: false,
      status: 401,
      message: 'Unauthorized: token inválido',
    };
  }

  return { ok: true };
}

export async function triggerSupabaseEdgeFunction(
  functionName: string,
  payload: Record<string, unknown> = {},
): Promise<SupabaseInvocationResult> {
  const projectRef =
    process.env.SUPABASE_PROJECT_REF ?? DEFAULT_PROJECT_REF;
  const baseUrl =
    process.env.SUPABASE_FUNCTION_URL ??
    `https://${projectRef}.supabase.co/functions/v1`;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada');
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, '')}/${functionName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        triggeredBy: 'vercel-cron',
        invokedAt: new Date().toISOString(),
        ...payload,
      }),
    },
  );

  const raw = await response.text();
  let data: unknown = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = { raw };
    }
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

