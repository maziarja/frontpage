import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'

export default function DigestLoading() {
  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <div className="mb-6 space-y-2">
        <div className="bg-muted h-8 w-56 animate-pulse rounded" />
        <div className="bg-muted h-4 w-72 animate-pulse rounded" />
      </div>

      {[0, 1].map((i) => (
        <div key={i} className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-muted h-6 w-32 animate-pulse rounded" />
            <div className="bg-muted h-7 w-24 animate-pulse rounded-md" />
          </div>
          <FeedItemSkeleton />
        </div>
      ))}
    </div>
  )
}
