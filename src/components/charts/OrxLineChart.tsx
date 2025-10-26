import React from 'react';
import { ResponsiveLine, Serie } from '@nivo/line';
import { OrxChartTheme } from './OrxChartTheme';

export interface OrxLineChartProps {
  data: Serie[];
  height?: number;
  colors?: string[];
  curve?: 'linear' | 'monotoneX' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
  enablePoints?: boolean;
}

export const OrxLineChart: React.FC<OrxLineChartProps> = ({
  data,
  height = 300,
  colors = ['var(--orx-primary)', 'var(--orx-accent)', 'var(--orx-success)'],
  curve = 'monotoneX',
  enablePoints = false
}) => {
  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={data}
        theme={OrxChartTheme}
        colors={colors}
        margin={{ top: 24, right: 28, bottom: 36, left: 44 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', stacked: false, min: 'auto', max: 'auto' }}
        yFormat=" >-.2f"
        curve={curve}
        axisBottom={{ tickSize: 0, tickPadding: 8 }}
        axisLeft={{ tickSize: 0, tickPadding: 8 }}
        enableGridX={false}
        enableGridY={true}
        enablePoints={enablePoints}
        useMesh={true}
        motionConfig="gentle"
        role="img"
        ariaLabel="Gráfico de linhas"
      />
    </div>
  );
};
