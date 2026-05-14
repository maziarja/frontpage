import { db } from '@/db'
import { mapFeedItem } from '@/lib/feed-items'
import { PAGE_SIZE } from '@/lib/const'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'
import { isAfter, subDays } from 'date-fns'

export async function getFeedPageData(userId: string, feedId: string) {
  const [feed, categories, rawItems] = await Promise.all([
    db.feed.findFirst({
      where: { id: feedId, userId },
      include: { category: { select: { id: true, name: true } } },
    }),
    db.category.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    }),
    db.feedItem.findMany({
      where: { feedId },
      include: {
        feed: { select: { id: true, title: true, faviconUrl: true } },
        _count: { select: { readStates: { where: { userId } } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: PAGE_SIZE + 1,
    }),
  ])

  if (!feed) return null

  const hasMore = rawItems.length > PAGE_SIZE
  const items = rawItems.slice(0, PAGE_SIZE).map(mapFeedItem)
  const itemCount = rawItems.length > PAGE_SIZE ? `${PAGE_SIZE}+` : String(rawItems.length)
  const showRetry =
    feed.healthStatus === FeedHealthStatus.ERROR ||
    feed.healthStatus === FeedHealthStatus.STALE ||
    (feed.lastFetchedAt !== null && isAfter(subDays(new Date(), 30), feed.lastFetchedAt))

  return { feed, categories, items, hasMore, itemCount, showRetry }
}
