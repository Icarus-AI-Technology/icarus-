import React, { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface RadialProgressProps {
  value: number;
  max?: number;
  size?: number; // SVG size in px
  strokeWidth?: number;
  label?: React.ReactNode;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
  gradientId?: string;
  gradientStops?: Array<{ offset: string; color: string; opacity?: number }>;
  critical?: boolean; // adds pulse when near thresholds
}

/**
 * OraclusX Design System - RadialProgress
 * SVG-based circular progress with optional gradient stroke and label
 */
export const RadialProgress: React.FC<RadialProgressProps> = ({
  value,
  max = 100,
  size = 96,
  strokeWidth = 8,
  label,
  className,
  trackClassName,
  progressClassName,
  gradientId,
  gradientStops,
  critical = false,
}) => {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const dashOffset = useMemo(
    () => circumference - (percent / 100) * circumference,
    [circumference, percent]
  );

  const circleRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDasharray = `${circumference}px`;
    circleRef.current.style.strokeDashoffset = `${dashOffset}px`;
  }, [circumference, dashOffset]);

  const gid = useMemo(
    () => gradientId || `orx-radial-${Math.random().toString(36).slice(2, 9)}`,
    [gradientId]
  );

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center relative',
        critical && 'animate-pulse',
        className
      )}
      role="img"
      aria-label={`Progresso: ${percent.toFixed(0)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        {gradientStops && gradientStops.length > 0 && (
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%">
              {gradientStops.map((s, i) => (
                <stop key={i} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity ?? 1} />
              ))}
            </linearGradient>
          </defs>
        )}

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn(
            'fill-none',
            trackClassName || 'stroke-[var(--border)] dark:stroke-gray-700 opacity-40'
          )}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn(
            'fill-none transition-all duration-300 ease-out',
            progressClassName || 'stroke-[var(--primary)]'
          )}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          stroke={gradientStops && gradientStops.length > 0 ? `url(#${gid})` : undefined}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>

      {label && (
        <div className="absolute text-center select-none">
          <div className="text-[var(--text-primary)] text-[0.813rem] orx-orx-font-medium">
            {label}
          </div>
        </div>
      )}
    </div>
  );
};

RadialProgress.displayName = 'OraclusXRadialProgress';

export default RadialProgress;
