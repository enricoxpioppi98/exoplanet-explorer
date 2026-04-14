export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-4 w-28 rounded" />
            </div>
            <div className="skeleton h-9 w-9 rounded-full" />
          </div>
          <div className="mb-3">
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="space-y-1">
                <div className="skeleton h-3 w-12 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-3 w-10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
