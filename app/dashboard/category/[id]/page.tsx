import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { getCategoryPageData } from '@/app/_queries/category'

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const data = await getCategoryPageData(session.user.id, id)
  if (!data) notFound()

  const { category, items, hasMore } = data

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold">{category.name}</h1>
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
  )
}
