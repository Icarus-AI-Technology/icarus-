import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export type IndexableRecord = Record<string, string | number>;

export interface OrxBarChartProps<T extends IndexableRecord = IndexableRecord> {
  data: T[];
  keys: Array<keyof T & string>;
  indexBy: keyof T & string;
  height?: number;
  colors?: string[];
  layout?: 'vertical' | 'horizontal';
  groupMode?: 'stacked' | 'grouped';
}

export const OrxBarChart: React.FC<OrxBarChartProps> = ({
  data,
  keys,
  indexBy,
  height = 300,
  colors = ['#2dd4bf', '#6366f1', '#10b981'],
  layout = 'vertical',
}) => {
  const canUseResponsive =
    typeof window !== 'undefined' && typeof window.ResizeObserver !== 'undefined';

  const renderChart = (chartWidth?: number, chartHeight?: number) => (
    <BarChart
      data={data}
      layout={layout === 'horizontal' ? 'horizontal' : 'vertical'}
      margin={{ top: 24, right: 28, bottom: 36, left: 44 }}
      width={chartWidth}
      height={chartHeight}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
      <XAxis
        dataKey={layout === 'vertical' ? indexBy : undefined}
        type={layout === 'vertical' ? 'category' : 'number'}
        stroke="#94a3b8"
        fontSize={12}
      />
      <YAxis
        type={layout === 'vertical' ? 'number' : 'category'}
        dataKey={layout === 'horizontal' ? indexBy : undefined}
        stroke="#94a3b8"
        fontSize={12}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: '#15192b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
        }}
        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
      />
      <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
      {keys.map((key, index) => (
        <Bar
          key={String(key)}
          dataKey={String(key)}
          fill={colors[index % colors.length]}
          radius={[4, 4, 0, 0]}
        />
      ))}
    </BarChart>
  );

  return (
    <div
      style={{
        height: `${height}px`,
        minHeight: `${height}px`,
        width: '100%',
        minWidth: '320px',
      }}
    >
      {canUseResponsive ? (
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      ) : (
        renderChart(640, height)
      )}
    </div>
  );
};
