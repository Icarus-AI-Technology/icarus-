/**
 * SKELETON LOADERS CUSTOMIZADOS
 *
 * Componentes de loading skeleton para diferentes layouts
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'pulse' | 'wave' | 'shimmer';
}

export function Skeleton({ className, variant = 'pulse' }: SkeletonProps) {
  const variants = {
    pulse: 'orx-animate-pulse',
    wave: 'orx-animate-wave',
    shimmer: 'orx-animate-shimmer',
  };

  return (
    <div className={cn('bg-[var(--orx-bg-muted)] rounded-md', variants[variant], className)} />
  );
}

/**
 * Skeleton para Card
 */
export function CardSkeleton() {
  return (
    <div className="neuro-flat p-6 rounded-lg space-y-4">
      <Skeleton className="h-6 w-3/4" variant="shimmer" />
      <Skeleton className="h-4 w-full" variant="shimmer" />
      <Skeleton className="h-4 w-5/6" variant="shimmer" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" variant="shimmer" />
        <Skeleton className="h-8 w-20" variant="shimmer" />
      </div>
    </div>
  );
}

/**
 * Skeleton para StatsGrid
 */
export function StatsGridSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="neuro-flat p-6 rounded-lg space-y-3">
          <Skeleton className="h-4 w-24" variant="shimmer" />
          <Skeleton className="h-8 w-32" variant="shimmer" />
          <Skeleton className="h-3 w-20" variant="shimmer" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para Tabela
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
  }, [columns]);

  const setGridTemplate = (el: HTMLDivElement | null) => {
    if (el) {
      el.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    }
  };
  return (
    <div className="neuro-flat rounded-lg overflow-hidden">
      {/* Header */}
      <div ref={headerRef} className="grid gap-4 p-4 border-b border-[var(--orx-border-muted)]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-4 w-full" variant="shimmer" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          ref={setGridTemplate}
          className="grid gap-4 p-4 border-b border-[var(--orx-border-muted)]"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 w-full"
              variant="shimmer"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para PageHeader
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" variant="shimmer" />
          <Skeleton className="h-4 w-96" variant="shimmer" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" variant="shimmer" />
          <Skeleton className="h-10 w-32" variant="shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para Form
 */
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="neuro-flat p-6 rounded-lg space-y-6">
      <Skeleton className="h-6 w-48" variant="shimmer" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" variant="shimmer" />
            <Skeleton className="h-10 w-full" variant="shimmer" />
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <Skeleton className="h-10 w-24" variant="shimmer" />
        <Skeleton className="h-10 w-32" variant="shimmer" />
      </div>
    </div>
  );
}

/**
 * Skeleton para Dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <StatsGridSkeleton columns={6} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}

/**
 * Skeleton para List
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="neuro-flat p-4 rounded-lg flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" variant="shimmer" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="shimmer" />
            <Skeleton className="h-3 w-1/2" variant="shimmer" />
          </div>
          <Skeleton className="h-8 w-20" variant="shimmer" />
        </div>
      ))}
    </div>
  );
}
