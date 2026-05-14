export function FeedItemSkeleton() {
  return (
    <div className="flex flex-col divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <div className="bg-muted h-3.5 w-3.5 animate-pulse rounded-sm" />
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          </div>
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted h-3 w-full animate-pulse rounded" />
          <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
          <div className="bg-muted h-3 w-16 animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}
