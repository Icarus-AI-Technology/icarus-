import type { Request, Response } from 'express';
import {
  circularSnapshot,
  dashboardLastUpdated,
  monthlyRevenue,
  progressSnapshot,
  specialtyDistribution,
  stateDistribution,
} from '../data/dashboardMetrics';

const metaPayload = <T,>(payload: T) => ({
  updatedAt: dashboardLastUpdated(),
  ...payload,
});

export function getDashboardKpis(_req: Request, res: Response) {
  return res.json(
    metaPayload({
      progress: progressSnapshot,
      circular: circularSnapshot,
    })
  );
}

export function getDistributionBySpecialty(_req: Request, res: Response) {
  return res.json(
    metaPayload({
      totalEspecialidades: specialtyDistribution.length,
      slices: specialtyDistribution,
    })
  );
}

export function getDistributionByState(_req: Request, res: Response) {
  return res.json(
    metaPayload({
      states: stateDistribution,
      sparklineLength: stateDistribution[0]?.series.length ?? 0,
    })
  );
}

export function getMonthlyRevenue(req: Request, res: Response) {
  const range = typeof req.query.range === 'string' ? req.query.range : '12m';
  const months = range === '3m' ? monthlyRevenue.slice(-3) : range === '6m' ? monthlyRevenue.slice(-6) : monthlyRevenue;

  const yearTotal = months.reduce((acc, item) => acc + item.faturamento, 0);
  const avgCapacity =
    months.reduce((acc, item) => acc + item.capacidadeOperacional, 0) / (months.length || 1);

  return res.json(
    metaPayload({
      range,
      series: months,
      resumo: {
        totalFaturamento: Number(yearTotal.toFixed(2)),
        capacidadeMedia: Number(avgCapacity.toFixed(1)),
      },
    })
  );
}
