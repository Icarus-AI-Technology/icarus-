import React, { useEffect, useRef } from 'react';
import { ResponsivePie } from '@nivo/pie';
import { OrxChartTheme } from './OrxChartTheme';

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
  colors = ['var(--orx-primary)', 'var(--orx-accent)', 'var(--orx-success)', 'var(--orx-warning)'],
  innerRadius = 0.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = `${height}px`;
    }
  }, [height]);

  return (
    <div ref={containerRef} className="h-[280px]">
      <ResponsivePie
        data={data}
        theme={OrxChartTheme}
        margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
        innerRadius={innerRadius}
        padAngle={0.7}
        cornerRadius={8}
        activeOuterRadiusOffset={6}
        colors={colors}
        borderWidth={1}
        borderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
        enableArcLabels={false}
        enableArcLinkLabels={false}
        role="img"
        ariaLabel="Gráfico de pizza"
      />
    </div>
  );
};
