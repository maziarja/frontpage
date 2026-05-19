import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'

export default function CategoryPageLoading() {
  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      {/* Category name + action buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="flex shrink-0 gap-1">
          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
          <div className="bg-muted h-8 w-8 animate-pulse rounded-md" />
        </div>
      </div>

      {/* Article list */}
      <div className="mt-6 border-t pt-4">
        <FeedItemSkeleton />
      </div>
    </div>
  )
}
