import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'

export default function FeedPageLoading() {
  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="bg-muted mt-1 h-8 w-8 shrink-0 animate-pulse rounded-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="bg-muted h-7 w-2/3 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
            </div>
            <div className="flex shrink-0 gap-1">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
              <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
        <div className="bg-muted h-4 w-32 animate-pulse rounded" />
      </div>

      {/* Article list */}
      <div className="mt-6 border-t pt-4">
        <FeedItemSkeleton />
      </div>
    </div>
  )
}
