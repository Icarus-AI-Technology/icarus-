import { Bar, BarChart, ResponsiveContainer } from 'recharts';

interface OperationalMetricProps {
  title: string;
  value: string | number;
  subtitle?: string;
  data?: Array<{ value: number }>;
  status?: 'critical' | 'warning' | 'success';
}

export function OperationalMetric({
  title,
  value,
  subtitle,
  data,
  status = 'success',
}: OperationalMetricProps) {
  const statusColors = {
    critical: { bg: 'bg-rose-100', text: 'text-rose-600', bar: '#f43f5e' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600', bar: '#f59e0b' },
    success: { bg: 'bg-emerald-100', text: 'text-emerald-600', bar: '#10b981' },
  };

  const colors = statusColors[status];

  return (
    <div className="modern-card p-6">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
        <h3 className={`text-4xl font-bold ${colors.text}`}>{value}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={data}>
            <Bar dataKey="value" fill={colors.bar} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

interface OperationalMetricsProps {
  metrics: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    data?: Array<{ value: number }>;
    status?: 'critical' | 'warning' | 'success';
  }>;
}

export function OperationalMetrics({ metrics }: OperationalMetricsProps) {
  return (
    <>
      {metrics.map((metric, index) => (
        <OperationalMetric key={index} {...metric} />
      ))}
    </>
  );
}
