'use server'

import { cookies, headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { PAGE_SIZE } from '@/lib/const'
import { mapFeedItem } from '@/lib/feed-items'
import { getDemoUserId } from '@/lib/demo-user'

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
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'

  const demoUserId = isGuest ? await getDemoUserId() : null
  const userId = session?.user.id ?? demoUserId
  if (!userId) return []

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
