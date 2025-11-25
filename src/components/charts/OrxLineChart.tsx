import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface LineDataPoint {
  x: string | number;
  y: number;
}

export interface LineSerie {
  id: string;
  data: LineDataPoint[];
}

export interface OrxLineChartProps {
  data: LineSerie[];
  height?: number;
  colors?: string[];
  curve?: 'linear' | 'monotone' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  enablePoints?: boolean;
}

export const OrxLineChart: React.FC<OrxLineChartProps> = ({
  data,
  height = 300,
  colors = ['#2dd4bf', '#6366f1', '#10b981'],
  curve = 'monotone',
  enablePoints = false,
}) => {
  // Transform data from Nivo format to Recharts format
  const chartData = data.length > 0 && data[0].data.length > 0
    ? data[0].data.map((_, index) => {
        const point: Record<string, string | number> = { name: data[0].data[index].x };
        data.forEach((serie) => {
          point[serie.id] = serie.data[index]?.y || 0;
        });
        return point;
      })
    : [];

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 24, right: 28, bottom: 36, left: 44 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#15192b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#ffffff',
            }}
            cursor={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
          {data.map((serie, index) => (
            <Line
              key={serie.id}
              type={curve === 'monotone' ? 'monotone' : curve === 'linear' ? 'linear' : 'monotone'}
              dataKey={serie.id}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={enablePoints}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
