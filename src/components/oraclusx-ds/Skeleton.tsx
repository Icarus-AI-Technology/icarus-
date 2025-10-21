/**
 * OraclusX Design System - Skeleton Component
 * Loading placeholder com variantes
 * 
 * HARD GATES:
 * ✅ Sem text/font classes (tipografia CSS)
 * ✅ Cores via CSS variables
 * ✅ Sombras neuromórficas
 * ✅ A11y AA (aria-busy, aria-label)
 * ✅ TypeScript strict
 */

import React from"react";
import { cn } from"@/lib/utils";

export interface SkeletonProps {
  variant?:"text" |"circular" |"rectangular" |"rounded";
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?:"pulse" |"wave" |"none";
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant ="text",
  width,
  height,
  className,
  animation ="pulse",
  count = 1
}) => {
  const getStyles = () => {
    const baseStyles: React.CSSProperties = {
      width: typeof width ==="number" ? `${width}px` : width,
      height: typeof height ==="number" ? `${height}px` : height
    };

    return baseStyles;
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      role="status"
      aria-busy="true"
      aria-label="Carregando..."
      style={getStyles()}
      className={cn("bg-surface-secondary dark:bg-muted",
        animation ==="pulse" &&"animate-pulse",
        animation ==="wave" &&"animate-wave",
        variant ==="text" &&"h-4 w-full rounded",
        variant ==="circular" &&"rounded-full",
        variant ==="rectangular" &&"rounded-none",
        variant ==="rounded" &&"rounded-lg",
        className
      )}
    />
  ));

  return count > 1 ? (
    <div className="space-y-2">{skeletons}</div>
  ) : (
    skeletons[0]
  );
};

// Predefined skeleton layouts
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn("p-4 rounded-lg","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]",
      className
    )}
    role="status"
    aria-busy="true"
    aria-label="Carregando card..."
  >
    <div className="flex items-center gap-3 mb-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
    <Skeleton count={3} />
  </div>
);

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div
    className={cn("rounded-lg overflow-hidden","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]",
      className
    )}
    role="status"
    aria-busy="true"
    aria-label="Carregando tabela..."
  >
    {/* Header */}
    <div className="flex gap-4 p-4 border-b border-gray-200 dark:border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} width="100%" height={20} />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800"
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} width="100%" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 3, className }) => (
  <div className={cn("space-y-3", className)} role="status" aria-busy="true" aria-label="Carregando lista...">
    {Array.from({ length: items }).map((_, i) => (
      <div
        key={i}
        className={cn("flex items-center gap-3 p-3 rounded-lg","bg-[var(--surface-light)] dark:bg-[var(--surface-dark)]","shadow-[var(--shadow-light-outer)] dark:shadow-[var(--shadow-dark-outer)]"
        )}
      >
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" />
          <Skeleton width="50%" />
        </div>
      </div>
    ))}
  </div>
);

