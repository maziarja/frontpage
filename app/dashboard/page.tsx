import { Suspense } from 'react'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { FeedHealthSummaryBanner } from '@/components/dashboard/feed-health-summary-banner'
import { OnboardingEmptyState } from '@/components/dashboard/onboarding-empty-state'
import { getDashboardItems } from '@/app/_queries/dashboard'
import { getFeedHealthSummary } from '@/app/_queries/feed'
import { getUserPreferences } from '@/app/_queries/preferences'
import { requireDashboardSession } from '@/lib/dashboard-session'

export default async function DashboardPage() {
  const { isGuest, userId } = await requireDashboardSession()

  const [{ items, hasMore, totalFeedCount }, summary, prefs] = await Promise.all([
    getDashboardItems(userId),
    getFeedHealthSummary(userId),
    userId && !isGuest ? getUserPreferences(userId) : Promise.resolve(null),
  ])

  const showOnboarding = !isGuest && !(prefs?.onboardingDismissed ?? false)

  if (showOnboarding && totalFeedCount === 0) {
    return <OnboardingEmptyState isGuest={false} />
  }

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-6">
      {showOnboarding && (
        <div className="mb-8 border-b pb-8">
          <OnboardingEmptyState isGuest={false} hasFeedsAlready />
        </div>
      )}
      <div className="mb-6 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">All Items</h1>
      </div>
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
