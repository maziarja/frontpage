import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { PAGE_SIZE } from '@/lib/const'

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const category = await db.category.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, name: true },
  })

  if (!category) notFound()

  const raw = await db.feedItem.findMany({
    where: { feed: { categoryId: id, userId: session.user.id } },
    include: { feed: { select: { id: true, title: true, faviconUrl: true } } },
    orderBy: { publishedAt: 'desc' },
    take: PAGE_SIZE + 1,
  })

  const hasMore = raw.length > PAGE_SIZE
  const items = raw.slice(0, PAGE_SIZE)

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
