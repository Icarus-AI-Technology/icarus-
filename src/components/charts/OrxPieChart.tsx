import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface OrxPieChartDatum {
  id: string;
  label?: string;
  value: number;
  color?: string;
}

export interface OrxPieChartProps {
  data: OrxPieChartDatum[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
}

export const OrxPieChart: React.FC<OrxPieChartProps> = ({
  data,
  height = 280,
  colors = ['#2dd4bf', '#6366f1', '#10b981', '#f59e0b'],
  innerRadius = 0.5,
}) => {
  // Transform data for Recharts
  const chartData = data.map((item) => ({
    name: item.label || item.id,
    value: item.value,
  }));

  const actualInnerRadius = innerRadius * 100; // Convert to percentage

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={`${actualInnerRadius}%`}
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={data[index]?.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#15192b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
            }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
