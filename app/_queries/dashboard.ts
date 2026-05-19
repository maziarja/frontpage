import { db } from '@/db'
import { mapFeedItem } from '@/lib/feed-items'
import { PAGE_SIZE } from '@/lib/const'

export async function getDashboardItems(userId: string | null) {
  if (!userId) return { items: [], hasMore: false, totalFeedCount: 0 }

  const [raw, totalFeedCount] = await Promise.all([
    db.feedItem.findMany({
      where: { feed: { userId } },
      include: {
        feed: { select: { id: true, title: true, faviconUrl: true } },
        _count: { select: { readStates: { where: { userId } } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: PAGE_SIZE + 1,
    }),
    db.feed.count({ where: { userId } }),
  ])

  return {
    items: raw.slice(0, PAGE_SIZE).map(mapFeedItem),
    hasMore: raw.length > PAGE_SIZE,
    totalFeedCount,
  }
}
