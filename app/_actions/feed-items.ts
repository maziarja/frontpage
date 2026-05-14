'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { PAGE_SIZE } from '@/lib/const'
import { mapFeedItem } from '@/lib/feed-items'

export type { FeedItemRow } from '@/lib/feed-items'

type Filter = { feedId?: string; categoryId?: string }

function buildWhere(userId: string, filter: Filter) {
  if (filter.feedId) {
    return { feedId: filter.feedId, feed: { userId } }
  }
  if (filter.categoryId) {
    return { feed: { categoryId: filter.categoryId, userId } }
  }
  return { feed: { userId } }
}

export async function getMoreFeedItems(cursor: string, filter: Filter) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return []

  const userId = session.user.id

  const results = await db.feedItem.findMany({
    where: buildWhere(userId, filter),
    include: {
      feed: { select: { id: true, title: true, faviconUrl: true } },
      _count: { select: { readStates: { where: { userId } } } },
    },
    orderBy: { publishedAt: 'desc' },
    take: PAGE_SIZE + 1,
    cursor: { id: cursor },
    skip: 1,
  })

  return results.slice(0, PAGE_SIZE).map(mapFeedItem)
}
