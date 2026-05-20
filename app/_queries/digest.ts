import { db } from '@/db'
import { mapFeedItem } from '@/lib/feed-items'
import { subDays } from 'date-fns'
import type { FeedItemRow } from '@/lib/feed-items'

export type DigestGroup = {
  categoryId: string | null
  categoryName: string
  items: FeedItemRow[]
}

export type DigestData = {
  since: Date
  groups: DigestGroup[]
  totalCount: number
}

export async function getDigestData(userId: string, isGuest: boolean): Promise<DigestData> {
  let since: Date

  if (isGuest) {
    since = subDays(new Date(), 1)
  } else {
    const pref = await db.userPreference.findUnique({
      where: { userId },
      select: { lastVisitedAt: true },
    })
    since = pref?.lastVisitedAt ?? subDays(new Date(), 7)

    await db.userPreference.upsert({
      where: { userId },
      update: { lastVisitedAt: new Date() },
      create: { userId, lastVisitedAt: new Date() },
    })
  }

  const rawItems = await db.feedItem.findMany({
    where: {
      feed: { userId },
      createdAt: { gte: since },
    },
    include: {
      feed: {
        select: {
          id: true,
          title: true,
          faviconUrl: true,
          category: { select: { id: true, name: true } },
        },
      },
      _count: { select: { readStates: { where: { userId } }, bookmarks: { where: { userId } } } },
    },
    orderBy: { publishedAt: 'desc' },
  })

  const groupMap = new Map<string | null, DigestGroup>()

  for (const raw of rawItems) {
    const { category, ...feedWithoutCategory } = raw.feed
    const categoryId = category?.id ?? null
    const categoryName = category?.name ?? 'Uncategorized'

    if (!groupMap.has(categoryId)) {
      groupMap.set(categoryId, { categoryId, categoryName, items: [] })
    }

    groupMap.get(categoryId)!.items.push(mapFeedItem({ ...raw, feed: feedWithoutCategory }))
  }

  const groups = [...groupMap.values()].sort((a, b) => {
    if (a.categoryId === null) return 1
    if (b.categoryId === null) return -1
    return b.items.length - a.items.length
  })

  return { since, groups, totalCount: rawItems.length }
}
