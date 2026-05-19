import { db } from '@/db'
import { mapFeedItem } from '@/lib/feed-items'
import { PAGE_SIZE } from '@/lib/const'

export async function getCategoryPageData(userId: string, categoryId: string) {
  const [category, rawItems] = await Promise.all([
    db.category.findFirst({
      where: { id: categoryId, userId },
      select: { id: true, name: true },
    }),
    db.feedItem.findMany({
      where: { feed: { categoryId, userId } },
      include: {
        feed: { select: { id: true, title: true, faviconUrl: true } },
        _count: { select: { readStates: { where: { userId } }, bookmarks: { where: { userId } } } },
      },
      orderBy: { publishedAt: 'desc' },
      take: PAGE_SIZE + 1,
    }),
  ])

  if (!category) return null

  return {
    category,
    items: rawItems.slice(0, PAGE_SIZE).map(mapFeedItem),
    hasMore: rawItems.length > PAGE_SIZE,
  }
}
