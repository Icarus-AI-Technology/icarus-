import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { OrxChartTheme } from './OrxChartTheme';

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
  colors = ['var(--orx-primary)', 'var(--orx-accent)', 'var(--orx-success)'],
  layout = 'vertical',
  groupMode = 'grouped'
}) => {
  return (
    <div style={{ height }}>
      <ResponsiveBar
        data={data}
        theme={OrxChartTheme}
        keys={keys as string[]}
        indexBy={indexBy}
        margin={{ top: 24, right: 28, bottom: 36, left: 44 }}
        padding={0.24}
        layout={layout}
        groupMode={groupMode}
        colors={colors}
        borderColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
        axisBottom={{ tickSize: 0, tickPadding: 8 }}
        axisLeft={{ tickSize: 0, tickPadding: 8 }}
        enableGridY={true}
        role="img"
        ariaLabel="Gráfico de barras"
      />
    </div>
  );
};
