import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { FeedHealthSummaryBanner } from '@/components/dashboard/feed-health-summary-banner'
import { OnboardingEmptyState } from '@/components/dashboard/onboarding-empty-state'
import { getDashboardItems } from '@/app/_queries/dashboard'
import { getFeedHealthSummary } from '@/app/_queries/feed'
import { getDemoUserId } from '@/lib/demo-user'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'

  if (!session && !isGuest) redirect('/sign-in')

  const demoUserId = isGuest ? await getDemoUserId() : null
  const userId = session?.user.id ?? demoUserId

  const [{ items, hasMore, totalFeedCount }, summary] = await Promise.all([
    getDashboardItems(userId),
    getFeedHealthSummary(userId),
  ])

  if (totalFeedCount === 0) {
    return <OnboardingEmptyState isGuest={isGuest} />
  }

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
