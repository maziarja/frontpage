import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { requireDashboardSession } from '@/lib/dashboard-session'
import { FeedHealthBadge } from '@/components/dashboard/feed-health-badge'
import { RetryButton } from '@/components/dashboard/retry-button'
import { FeedErrorDetails } from '@/components/dashboard/feed-error-details'
import { FeedPageActions } from '@/components/dashboard/feed-page-actions'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { getFeedPageData } from '@/app/_queries/feed'

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { isGuest, userId } = await requireDashboardSession()
  if (!userId) notFound()

  const data = await getFeedPageData(userId, id)
  if (!data) notFound()
  const { feed, categories, items, hasMore, itemCount } = data
  return (
    <div className="mx-auto max-w-[60rem] px-4 py-6">
      <FeedPageActions feed={feed} categories={categories} isGuest={isGuest}>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FeedHealthBadge status={feed.healthStatus} lastFetchedAt={feed.lastFetchedAt} />
          <span className="text-muted-foreground text-sm">
            {itemCount} article{items.length !== 1 ? 's' : ''}
          </span>
          {feed.lastSuccessfulFetchAt && feed.healthStatus !== 'ERROR' && (
            <span className="text-muted-foreground text-sm">
              Last fetched {formatDistanceToNow(feed.lastSuccessfulFetchAt, { addSuffix: true })}
            </span>
          )}
          {!isGuest && feed.healthStatus !== 'ERROR' && <RetryButton feedId={feed.id} />}
        </div>

        {feed.healthStatus === 'ERROR' && (
          <FeedErrorDetails
            feedId={feed.id}
            errorMessage={feed.errorMessage}
            lastSuccessfulFetchAt={feed.lastSuccessfulFetchAt}
            nextRetryAt={feed.nextRetryAt}
            retryCount={feed.retryCount}
          />
        )}
      </FeedPageActions>
      <div className="mt-8 border-t pt-6">
        <Suspense fallback={<FeedItemSkeleton />}>
          <FeedItemList
            initialItems={items}
            initialHasMore={hasMore}
            filter={{ feedId: id }}
            showSource={false}
            emptyMessage="No articles fetched yet — try refreshing the feed."
          />
        </Suspense>
      </div>
    </div>
  )
}
