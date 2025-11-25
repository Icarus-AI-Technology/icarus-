export interface DashboardTrend {
  value: number;
  direction: 'up' | 'down';
  window: string;
}

export interface DashboardProgressItem {
  id: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  trend?: DashboardTrend;
}

export interface DashboardCircularItem {
  id: string;
  label: string;
  value: number;
  subLabel: string;
  unit?: string;
}

export interface DashboardKpiResponse {
  updatedAt: string;
  progress: DashboardProgressItem[];
  circular: DashboardCircularItem[];
}

export interface SpecialtySlice {
  name: string;
  value: number;
  color?: string;
}

export interface SpecialtyDistributionResponse {
  updatedAt: string;
  totalEspecialidades: number;
  slices: SpecialtySlice[];
}

export interface StateSparklineEntry {
  state: string;
  series: number[];
}

export interface StateDistributionResponse {
  updatedAt: string;
  states: StateSparklineEntry[];
  sparklineLength: number;
}

export interface MonthlyRevenuePoint {
  month: string;
  faturamento: number;
  pedidosUrgentes: number;
  capacidadeOperacional: number;
}

export interface MonthlyRevenueResponse {
  updatedAt: string;
  range: string;
  series: MonthlyRevenuePoint[];
  resumo: {
    totalFaturamento: number;
    capacidadeMedia: number;
  };
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    throw new Error(`Erro ao consultar ${res.url}: ${res.status}`);
  }
  return (await res.json()) as T;
};

export const fetchDashboardKpis = () =>
  fetch('/api/dashboard/kpis', { headers: { Accept: 'application/json' } }).then((res) =>
    handleResponse<DashboardKpiResponse>(res)
  );

export const fetchDashboardSpecialties = () =>
  fetch('/api/dashboard/distribuicao-especialidades', {
    headers: { Accept: 'application/json' },
  }).then((res) => handleResponse<SpecialtyDistributionResponse>(res));

export const fetchDashboardStates = () =>
  fetch('/api/dashboard/distribuicao-estados', {
    headers: { Accept: 'application/json' },
  }).then((res) => handleResponse<StateDistributionResponse>(res));

export const fetchDashboardMonthlyRevenue = (range: '3m' | '6m' | '12m' = '12m') =>
  fetch(`/api/dashboard/faturamento-mensal?range=${range}`, {
    headers: { Accept: 'application/json' },
  }).then((res) => handleResponse<MonthlyRevenueResponse>(res));
