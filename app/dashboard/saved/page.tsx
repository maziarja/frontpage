import { Suspense } from 'react'
import { SavedItemsView } from '@/components/dashboard/saved-items-view'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { getSavedItems } from '@/app/_queries/saved'
import { requireDashboardSession } from '@/lib/dashboard-session'

export default async function SavedPage() {
  const { userId } = await requireDashboardSession()
  const items = await getSavedItems(userId)

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-6">
      <div className="mb-6 border-b pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
      </div>
      <Suspense fallback={<FeedItemSkeleton />}>
        <SavedItemsView initialItems={items} />
      </Suspense>
    </div>
  )
}
