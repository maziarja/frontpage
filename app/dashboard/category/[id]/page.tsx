import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getDemoUserId } from '@/lib/demo-user'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { CategoryPageActions } from '@/components/dashboard/category-page-actions'
import { getCategoryPageData } from '@/app/_queries/category'

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'
  if (!session && !isGuest) redirect('/sign-in')

  const demoUserId = isGuest ? await getDemoUserId() : null
  const userId = session?.user.id ?? demoUserId
  if (!userId) redirect('/sign-in')

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
