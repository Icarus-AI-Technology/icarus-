import { SVGProps, useId } from 'react';
import { cn } from '@/lib/utils';

type IcarusBrainProps = SVGProps<SVGSVGElement> & {
  glow?: boolean;
  size?: number | string;
};

export function IcarusBrain({
  className,
  glow = true,
  size = 64,
  ...rest
}: IcarusBrainProps) {
  const { width, height, ...svgProps } = rest;
  const leftGradientId = useId();
  const rightGradientId = useId();
  const nodeGradientId = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ícone Icarus Brain Circuit"
      width={width ?? size}
      height={height ?? size}
      className={cn(
        glow && 'drop-shadow-[0_0_18px_rgba(99,102,241,0.35)]',
        'text-white',
        className
      )}
      {...svgProps}
    >
      <defs>
        <linearGradient id={leftGradientId} x1="12" y1="4" x2="30" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="60%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id={rightGradientId} x1="34" y1="4" x2="54" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={nodeGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#d3f9f4" />
        </linearGradient>
      </defs>

      {/* Brain shells */}
      <path
        d="M32 6h-2c-7.18 0-13 5.82-13 13v26c0 7.18 5.82 13 13 13h2V6Z"
        fill={`url(#${leftGradientId})`}
        stroke="#a78bfa"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path
        d="M32 6h2c7.18 0 13 5.82 13 13v26c0 7.18-5.82 13-13 13h-2V6Z"
        fill={`url(#${rightGradientId})`}
        stroke="#2dd4bf"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />

      {/* Left circuits */}
      <path
        d="M24 14v9l-6 6v15"
        stroke={`url(#${leftGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 30h-6"
        stroke={`url(#${leftGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 42h-6"
        stroke={`url(#${leftGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right circuits */}
      <path
        d="M40 14v9l6 6v15"
        stroke={`url(#${rightGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 30h6"
        stroke={`url(#${rightGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 42h6"
        stroke={`url(#${rightGradientId})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodes */}
      {[{ cx: 24, cy: 14 }, { cx: 18, cy: 30 }, { cx: 18, cy: 42 }].map((node) => (
        <circle
          key={`left-${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={2.8}
          fill={`url(#${nodeGradientId})`}
          stroke="#8b5cf6"
          strokeWidth={1}
        />
      ))}
      {[{ cx: 40, cy: 14 }, { cx: 46, cy: 30 }, { cx: 46, cy: 42 }].map((node) => (
        <circle
          key={`right-${node.cx}-${node.cy}`}
          cx={node.cx}
          cy={node.cy}
          r={2.8}
          fill={`url(#${nodeGradientId})`}
          stroke="#2dd4bf"
          strokeWidth={1}
        />
      ))}

      {/* Center spine */}
      <path
        d="M32 10v44"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

export default IcarusBrain;

