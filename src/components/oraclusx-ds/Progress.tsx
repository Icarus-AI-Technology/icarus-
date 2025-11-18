/**
 * OraclusX Design System - Progress Component
 * Barra de progresso neuromórfica
 */

import React from"react";
import { cn } from"@/lib/utils";

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?:"sm" |"md" |"lg";
  variant?:"default" |"primary" |"success" |"warning" |"error";
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  size ="md",
  variant ="primary",
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const fillRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${percentage}%`;
    }
  }, [percentage]);

  const sizeClasses = {
    sm:"h-1",
    md:"h-2",
    lg:"h-3",
  };

  const variantClasses = {
    default:"bg-gray-400",
    primary:"bg-primary",
    success:"bg-success/50",
    warning:"bg-warning/50",
    error:"bg-destructive/50",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-body-sm text-secondary dark:text-muted orx-font-medium">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-body-sm text-secondary dark:text-muted orx-font-medium">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full orx-card-pressed overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-300",
            variantClasses[variant],
          )}
          ref={fillRef}
        />
      </div>
    </div>
  );
};

Progress.displayName ="OraclusXProgress";

export default Progress;

