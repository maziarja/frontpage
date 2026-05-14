import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'
import { FeedHealthBadge } from '@/components/dashboard/feed-health-badge'
import { RetryButton } from '@/components/dashboard/retry-button'
import { FeedPageActions } from '@/components/dashboard/feed-page-actions'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { getFeedPageData } from '@/app/_queries/feed'

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const data = await getFeedPageData(session.user.id, id)
  if (!data) notFound()

  const { feed, categories, items, hasMore, itemCount, showRetry } = data

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <FeedPageActions feed={feed} categories={categories}>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FeedHealthBadge status={feed.healthStatus} lastFetchedAt={feed.lastFetchedAt} />
          <span className="text-muted-foreground text-sm">
            {itemCount} article{items.length !== 1 ? 's' : ''}
          </span>
          {feed.lastFetchedAt && (
            <span className="text-muted-foreground text-sm">
              Last fetched {formatDistanceToNow(feed.lastFetchedAt, { addSuffix: true })}
            </span>
          )}
          {showRetry && <RetryButton feedId={feed.id} />}
        </div>

        {feed.errorMessage && (
          <div
            className="bg-destructive/10 text-destructive mt-4 rounded-md p-3 text-sm"
            role="alert"
            aria-label="Feed error"
          >
            {feed.errorMessage}
          </div>
        )}
      </FeedPageActions>
      <div className="mt-6 border-t pt-4">
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
