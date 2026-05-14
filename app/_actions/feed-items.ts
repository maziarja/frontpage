'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { PAGE_SIZE } from '@/lib/const'

export type FeedItemRow = {
  id: string
  url: string
  title: string
  description: string | null
  publishedAt: Date | null
  createdAt: Date
  feed: { id: string; title: string; faviconUrl: string | null }
}

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

export async function getMoreFeedItems(cursor: string, filter: Filter): Promise<FeedItemRow[]> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return []

  const results = await db.feedItem.findMany({
    where: buildWhere(session.user.id, filter),
    include: { feed: { select: { id: true, title: true, faviconUrl: true } } },
    orderBy: { publishedAt: 'desc' },
    take: PAGE_SIZE + 1,
    cursor: { id: cursor },
    skip: 1,
  })

  return results.slice(0, PAGE_SIZE)
}
