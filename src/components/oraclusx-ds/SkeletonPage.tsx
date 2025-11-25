function SkeletonCard({ height = 140 }: { height?: number }) {
  const minH = `min-h-[${height}px]`;
  return (
    <div
      className={`neumorphic-card p-6 rounded-2xl animate-pulse bg-[var(--orx-bg-light)] ${minH}`}
    >
      <div className="h-5 w-40 rounded mb-3 bg-[rgba(0,0,0,0.08)]" />
      <div className="h-4 w-24 rounded mb-2 bg-[rgba(0,0,0,0.06)]" />
      <div className="h-4 w-32 rounded bg-[rgba(0,0,0,0.06)]" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="p-4">
      {/* Header skeleton */}
      <div className="neumorphic-card p-6 rounded-2xl animate-pulse mb-4 bg-[var(--orx-bg-light)]">
        <div className="h-6 w-56 rounded mb-2 bg-[rgba(0,0,0,0.10)]" />
        <div className="h-4 w-80 rounded bg-[rgba(0,0,0,0.06)]" />
      </div>

      {/* KPIs skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
      </div>
    </div>
  );
}
