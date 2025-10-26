import { describe, expect, it, vi } from 'vitest';
import handler from '../vector-search';
import type { VercelRequest, VercelResponse } from '@vercel/node';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
  })),
}));

describe('vector-search API', () => {
  it('rejects when feature flag is off', async () => {
    process.env.FF_AI_TUTOR_CIRURGIAS = '';

    const req = { method: 'POST', body: { query: [0.1, 0.2] } } as unknown as VercelRequest;

    const res = {
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: unknown) {
        this.payload = payload;
        return this;
      },
      setHeader() {
        return this;
      },
    } as unknown as VercelResponse & { statusCode?: number; payload?: unknown };

    await handler(req, res);

    expect(res.statusCode).toBe(403);
  });
});
