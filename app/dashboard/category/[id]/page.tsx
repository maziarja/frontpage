import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireDashboardSession } from '@/lib/dashboard-session'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { CategoryPageActions } from '@/components/dashboard/category-page-actions'
import { getCategoryPageData } from '@/app/_queries/category'

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { isGuest, userId } = await requireDashboardSession()
  if (!userId) notFound()

  const data = await getCategoryPageData(userId, id)
  if (!data) notFound()

  const { category, items, hasMore } = data

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <CategoryPageActions category={category} isGuest={isGuest} />
      <div className="mt-6 border-t pt-4">
        <Suspense fallback={<FeedItemSkeleton />}>
          <FeedItemList
            initialItems={items}
            initialHasMore={hasMore}
            filter={{ categoryId: id }}
            showSource
            emptyMessage="No articles in this category yet."
          />
        </Suspense>
      </div>
    </div>
  )
}
