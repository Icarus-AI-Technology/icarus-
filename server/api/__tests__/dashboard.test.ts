import { describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import {
  getDashboardKpis,
  getDistributionBySpecialty,
  getDistributionByState,
  getMonthlyRevenue,
} from '../dashboard';

type PayloadResponse = Response & { payload?: unknown };

const createMockRes = (): PayloadResponse => {
  const res: Partial<Response> & { payload?: unknown } = {
    json(payload: unknown) {
      this.payload = payload;
      return this as Response;
    },
  };
  return res as PayloadResponse;
};

describe('Dashboard API handlers', () => {
  it('returns KPI snapshot', () => {
    const res = createMockRes();
    getDashboardKpis({} as Request, res);

    expect(res.payload).toBeDefined();
    expect(res.payload.progress).toHaveLength(6);
    expect(res.payload.circular).toHaveLength(3);
  });

  it('returns specialty distribution', () => {
    const res = createMockRes();
    getDistributionBySpecialty({} as Request, res);

    expect(res.payload.slices).toHaveLength(3);
    expect(res.payload.totalEspecialidades).toBe(3);
  });

  it('returns state sparklines', () => {
    const res = createMockRes();
    getDistributionByState({} as Request, res);

    expect(res.payload.states).toHaveLength(4);
    expect(res.payload.sparklineLength).toBeGreaterThan(0);
  });

  it('respects the range query for monthly revenue', () => {
    const res = createMockRes();
    const req = { query: { range: '3m' } } as unknown as Request;
    getMonthlyRevenue(req, res);

    expect(res.payload.range).toBe('3m');
    expect(res.payload.series).toHaveLength(3);
    expect(typeof res.payload.resumo.totalFaturamento).toBe('number');
  });
});
