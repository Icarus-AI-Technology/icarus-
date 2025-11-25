import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface FinancialChartProps {
  title: string;
  value: string;
  data: Array<{ value: number }>;
  color?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export function FinancialChart({
  title,
  value,
  data,
  color = '#7c3aed',
  change,
}: FinancialChartProps) {
  return (
    <div className="modern-card p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
          {change && (
            <span
              className={`text-sm font-semibold ${
                change.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {change.isPositive ? '+' : ''}
              {change.value}%
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
