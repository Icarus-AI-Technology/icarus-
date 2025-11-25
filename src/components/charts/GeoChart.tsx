import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'São Paulo', value: 102, color: '#8b5cf6' },
  { name: 'Rio de Janeiro', value: 45, color: '#ec4899' },
  { name: 'Outros', value: 28, color: '#6366f1' },
];

export const GeoChart: React.FC = () => {
  return (
    <div className="h-40 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#11131f',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Texto centralizado no Donut */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <span className="block text-2xl font-bold text-white">175</span>
          <span className="text-[10px] text-gray-500 uppercase">Total</span>
        </div>
      </div>
    </div>
  );
};
