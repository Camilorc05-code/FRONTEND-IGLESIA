// Skeleton.jsx — placeholders de carga tipo "pulso" en vez de texto plano "Cargando…"

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-line bg-white overflow-hidden ${className}`}>
      <div className="h-40 skeleton-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-24 rounded skeleton-pulse" />
        <div className="h-5 w-3/4 rounded skeleton-pulse" />
        <div className="h-3 w-1/2 rounded skeleton-pulse" />
      </div>
    </div>
  );
}

export function SkeletonLine({ className = '' }) {
  return <div className={`rounded skeleton-pulse ${className}`} />;
}

export function SkeletonGrid({ count = 6, cols = 'sm:grid-cols-2 md:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
