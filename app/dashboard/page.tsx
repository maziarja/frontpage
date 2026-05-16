import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { FeedHealthSummaryBanner } from '@/components/dashboard/feed-health-summary-banner'
import { getDashboardItems } from '@/app/_queries/dashboard'
import { getFeedHealthSummary } from '@/app/_queries/feed'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const [{ items, hasMore }, summary] = await Promise.all([
    getDashboardItems(session.user.id),
    getFeedHealthSummary(session.user.id),
  ])

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold">All Items</h1>
      {summary.erroring > 0 && (
        <FeedHealthSummaryBanner healthy={summary.healthy} erroring={summary.erroring} />
      )}
      <Suspense fallback={<FeedItemSkeleton />}>
        <FeedItemList
          initialItems={items}
          initialHasMore={hasMore}
          filter={{}}
          showSource
          emptyMessage="No articles yet — add a feed and refresh it."
        />
      </Suspense>
    </div>
  )
}
