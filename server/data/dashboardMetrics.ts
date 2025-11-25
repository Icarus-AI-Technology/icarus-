export type ProgressSnapshot = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  target?: number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    window: string;
  };
};

export type CircularSnapshot = {
  id: string;
  label: string;
  value: number;
  subLabel: string;
  unit?: string;
};

export type SpecialtySlice = {
  name: string;
  value: number;
  color: string;
};

export type StateSparkline = {
  state: string;
  series: number[];
};

export type MonthlyRevenuePoint = {
  month: string;
  faturamento: number;
  pedidosUrgentes: number;
  capacidadeOperacional: number;
};

export const progressSnapshot: ProgressSnapshot[] = [
  {
    id: 'sales',
    label: 'Vendas',
    value: 87,
    target: 92,
    trend: { value: 3.2, direction: 'up', window: '30d' },
  },
  {
    id: 'delivery',
    label: 'Entregas',
    value: 91,
    target: 95,
    trend: { value: 1.4, direction: 'up', window: '7d' },
  },
  {
    id: 'inventory',
    label: 'Estoque',
    value: 63,
    target: 70,
    trend: { value: 2.1, direction: 'down', window: '14d' },
  },
  {
    id: 'returns',
    label: 'Devoluções',
    value: 12,
    unit: '%',
    target: 8,
    trend: { value: 0.6, direction: 'down', window: '30d' },
  },
  {
    id: 'clients',
    label: 'Clientes ativos',
    value: 89,
    target: 100,
    trend: { value: 4.4, direction: 'up', window: '30d' },
  },
  {
    id: 'contracts',
    label: 'Contratos',
    value: 48,
    target: 60,
    trend: { value: 1.2, direction: 'up', window: '90d' },
  },
];

export const circularSnapshot: CircularSnapshot[] = [
  { id: 'orders', label: 'Pedidos', value: 57, subLabel: 'Em aberto' },
  { id: 'logistics', label: 'Logística', value: 43, subLabel: 'Em trânsito' },
  { id: 'revenue', label: 'Faturamento', value: 36, subLabel: 'Meta mensal', unit: '%' },
];

export const specialtyDistribution: SpecialtySlice[] = [
  { name: 'Ortopedia', value: 68, color: '#2dd4bf' },
  { name: 'Cardiologia', value: 37, color: '#6366f1' },
  { name: 'Neurologia', value: 49, color: '#10b981' },
];

export const stateDistribution: StateSparkline[] = [
  { state: 'SP', series: [12, 15, 14, 18, 21, 19, 22] },
  { state: 'RJ', series: [8, 9, 7, 11, 13, 12, 14] },
  { state: 'MG', series: [5, 6, 7, 6, 8, 7, 9] },
  { state: 'RS', series: [4, 5, 4, 6, 7, 6, 8] },
];

export const monthlyRevenue: MonthlyRevenuePoint[] = [
  { month: 'Jan', faturamento: 3.8, pedidosUrgentes: 102, capacidadeOperacional: 78 },
  { month: 'Fev', faturamento: 4.1, pedidosUrgentes: 98, capacidadeOperacional: 80 },
  { month: 'Mar', faturamento: 4.6, pedidosUrgentes: 120, capacidadeOperacional: 82 },
  { month: 'Abr', faturamento: 4.3, pedidosUrgentes: 110, capacidadeOperacional: 84 },
  { month: 'Mai', faturamento: 4.9, pedidosUrgentes: 135, capacidadeOperacional: 86 },
  { month: 'Jun', faturamento: 5.2, pedidosUrgentes: 142, capacidadeOperacional: 88 },
  { month: 'Jul', faturamento: 5.4, pedidosUrgentes: 147, capacidadeOperacional: 89 },
  { month: 'Ago', faturamento: 5.6, pedidosUrgentes: 150, capacidadeOperacional: 90 },
  { month: 'Set', faturamento: 5.9, pedidosUrgentes: 153, capacidadeOperacional: 91 },
  { month: 'Out', faturamento: 6.1, pedidosUrgentes: 160, capacidadeOperacional: 92 },
  { month: 'Nov', faturamento: 6.3, pedidosUrgentes: 167, capacidadeOperacional: 93 },
  { month: 'Dez', faturamento: 6.8, pedidosUrgentes: 175, capacidadeOperacional: 95 },
];

export const dashboardLastUpdated = () => new Date().toISOString();
