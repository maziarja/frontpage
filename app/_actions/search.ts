'use server'

import { headers, cookies } from 'next/headers'
import { subDays } from 'date-fns'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { getDemoUserId } from '@/lib/demo-user'
import { mapFeedItem } from '@/lib/feed-items'
import type { FeedItemRow } from '@/lib/feed-items'

type SearchFilters = {
  query: string
  since?: 'week' | 'month'
}

async function resolveUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) return session.user.id
  const cookieStore = await cookies()
  if (cookieStore.get('guest-session')?.value === 'true') return getDemoUserId()
  return null
}

export async function searchFeedItems(filters: SearchFilters): Promise<FeedItemRow[]> {
  const { query, since } = filters
  if (!query.trim()) return []

  const userId = await resolveUserId()
  if (!userId) return []

  const sinceDate =
    since === 'week'
      ? subDays(new Date(), 7)
      : since === 'month'
        ? subDays(new Date(), 30)
        : undefined

  const raw = await db.feedItem.findMany({
    where: {
      feed: { userId },
      ...(sinceDate ? { publishedAt: { gte: sinceDate } } : {}),
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      feed: { select: { id: true, title: true, faviconUrl: true } },
      _count: { select: { readStates: { where: { userId } }, bookmarks: { where: { userId } } } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  // DB description field is raw HTML — post-filter on stripped plain text to avoid false matches
  const q = query.toLowerCase()
  return raw
    .map(mapFeedItem)
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) || (item.description ?? '').toLowerCase().includes(q),
    )
}
