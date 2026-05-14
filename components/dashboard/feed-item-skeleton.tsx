export function FeedItemSkeleton() {
  return (
    <div className="flex flex-col gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border-l-[3px] border-transparent py-4 pl-4 pr-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 animate-pulse rounded-sm bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1 animate-pulse rounded bg-muted" />
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
