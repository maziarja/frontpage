import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import { FeedItemSkeleton } from '@/components/dashboard/feed-item-skeleton'
import { PAGE_SIZE } from '@/lib/const'
import { mapFeedItem } from '@/lib/feed-items'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/sign-in')

  const userId = session.user.id

  const raw = await db.feedItem.findMany({
    where: { feed: { userId } },
    include: {
      feed: { select: { id: true, title: true, faviconUrl: true } },
      _count: { select: { readStates: { where: { userId } } } },
    },
    orderBy: { publishedAt: 'desc' },
    take: PAGE_SIZE + 1,
  })

  const hasMore = raw.length > PAGE_SIZE
  const items = raw.slice(0, PAGE_SIZE).map(mapFeedItem)

  return (
    <div className="mx-auto max-w-[60rem] px-4 py-4">
      <h1 className="mb-4 text-2xl font-semibold">All Items</h1>
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
