import { db } from '@/db'
import { mapFeedItem } from '@/lib/feed-items'

export async function getSavedItems(userId: string | null) {
  if (!userId) return []

  const bookmarks = await db.bookmark.findMany({
    where: { userId },
    orderBy: { savedAt: 'desc' },
    include: {
      feedItem: {
        include: {
          feed: { select: { id: true, title: true, faviconUrl: true } },
          _count: { select: { readStates: { where: { userId } }, bookmarks: { where: { userId } } } },
        },
      },
    },
  })

  return bookmarks.map((b) => mapFeedItem(b.feedItem))
}
