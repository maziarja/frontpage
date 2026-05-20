import { db } from '@/db'
import { parseFeed } from '@/lib/feed-parser'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'
import { calculateNextRetryAt } from '@/lib/feed-retry'
import type { Feed } from '@/lib/generated/prisma/client'

export type FetchFeedResult =
  | { newItemCount: number; cached: boolean; error?: never }
  | { newItemCount: 0; cached: false; error: string }

export async function fetchAndStoreFeed(feed: Feed): Promise<FetchFeedResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const fetchHeaders: Record<string, string> = {}
    if (feed.etag) fetchHeaders['If-None-Match'] = feed.etag
    if (feed.lastModified) fetchHeaders['If-Modified-Since'] = feed.lastModified

    const response = await fetch(feed.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: fetchHeaders,
    })

    if (response.status === 304) {
      return { newItemCount: 0, cached: true }
    }

    if (!response.ok) {
      const errorMessage = `HTTP ${response.status}: ${response.statusText}`
      await db.feed.update({
        where: { id: feed.id },
        data: {
          healthStatus: FeedHealthStatus.ERROR,
          errorMessage,
          lastFetchedAt: new Date(),
          retryCount: (feed.retryCount ?? 0) + 1,
          nextRetryAt: calculateNextRetryAt(feed.retryCount ?? 0),
        },
      })
      return { newItemCount: 0, cached: false, error: `Upstream feed returned ${errorMessage}` }
    }

    const xml = await response.text()

    let items
    try {
      items = parseFeed(xml, feed.id)
    } catch {
      await db.feed.update({
        where: { id: feed.id },
        data: {
          healthStatus: FeedHealthStatus.ERROR,
          errorMessage: 'Failed to parse feed XML',
          lastFetchedAt: new Date(),
          retryCount: (feed.retryCount ?? 0) + 1,
          nextRetryAt: calculateNextRetryAt(feed.retryCount ?? 0),
        },
      })
      return { newItemCount: 0, cached: false, error: 'Failed to parse feed XML' }
    }

    const created = await db.feedItem.createMany({
      data: items.map((item) => ({ ...item, feedId: feed.id })),
      skipDuplicates: true,
    })

    await db.feed.update({
      where: { id: feed.id },
      data: {
        healthStatus: FeedHealthStatus.ACTIVE,
        lastFetchedAt: new Date(),
        lastSuccessfulFetchAt: new Date(),
        errorMessage: null,
        retryCount: 0,
        nextRetryAt: null,
        etag: response.headers.get('etag')?.trim() ?? undefined,
        lastModified: response.headers.get('last-modified')?.trim() ?? undefined,
        ...(response.url !== feed.url ? { url: response.url } : {}),
      },
    })

    return { newItemCount: created.count, cached: false }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    const errorMessage = isTimeout ? 'Request timed out after 10s' : 'Failed to fetch feed'

    await db.feed.update({
      where: { id: feed.id },
      data: {
        healthStatus: FeedHealthStatus.ERROR,
        errorMessage,
        lastFetchedAt: new Date(),
        retryCount: feed.retryCount + 1,
        nextRetryAt: calculateNextRetryAt(feed.retryCount),
      },
    })

    return { newItemCount: 0, cached: false, error: errorMessage }
  } finally {
    clearTimeout(timer)
  }
}
