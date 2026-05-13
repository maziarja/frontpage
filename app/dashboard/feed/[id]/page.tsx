import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { FeedHealthBadge } from '@/components/dashboard/feed-health-badge'
import { RetryButton } from '@/components/dashboard/retry-button'
import { FeedPageActions } from '@/components/dashboard/feed-page-actions'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'
import { formatDistanceToNow, isAfter, subDays } from 'date-fns'

export default async function FeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [feed, categories] = await Promise.all([
    db.feed.findFirst({
      where: { id, userId: session.user.id },
      include: { category: { select: { id: true, name: true } } },
    }),
    db.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    }),
  ])

  if (!feed) notFound()

  const itemCount = await db.feedItem.count({ where: { feedId: feed.id } })

  const showRetry =
    feed.healthStatus === FeedHealthStatus.ERROR ||
    feed.healthStatus === FeedHealthStatus.STALE ||
    (feed.lastFetchedAt !== null && isAfter(subDays(new Date(), 30), feed.lastFetchedAt))

  return (
    <div className="mx-auto max-w-2xl p-6">
      <FeedPageActions feed={feed} categories={categories}>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <FeedHealthBadge status={feed.healthStatus} lastFetchedAt={feed.lastFetchedAt} />
          <span className="text-muted-foreground text-sm">
            {itemCount} article{itemCount !== 1 ? 's' : ''}
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
    </div>
  )
}
