import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { feedFetchQuerySchema } from '@/schemas/feed'
import { parseFeed } from '@/lib/feed-parser'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = feedFetchQuerySchema.safeParse({ feedId: searchParams.get('feedId') })
  if (!parsed.success) {
    return Response.json({ error: 'feedId query parameter is required' }, { status: 400 })
  }

  const { feedId } = parsed.data

  const feed = await db.feed.findFirst({ where: { id: feedId, userId: session.user.id } })
  if (!feed) {
    return Response.json({ error: 'Feed not found' }, { status: 404 })
  }

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
      return Response.json({ newItemCount: 0, cached: true })
    }

    if (!response.ok) {
      await db.feed.update({
        where: { id: feed.id },
        data: {
          healthStatus: FeedHealthStatus.ERROR,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          lastFetchedAt: new Date(),
        },
      })
      return Response.json(
        { error: `Upstream feed returned HTTP ${response.status}` },
        { status: 502 },
      )
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
        },
      })
      return Response.json({ error: 'Failed to parse feed XML' }, { status: 422 })
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
        errorMessage: null,
        etag: response.headers.get('etag')?.trim() ?? undefined,
        lastModified: response.headers.get('last-modified')?.trim() ?? undefined,
        ...(response.url !== feed.url ? { url: response.url } : {}),
      },
    })

    return Response.json({ newItemCount: created.count, cached: false })
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    const errorMessage = isTimeout ? 'Request timed out after 10s' : 'Failed to fetch feed'

    await db.feed.update({
      where: { id: feed.id },
      data: {
        healthStatus: FeedHealthStatus.ERROR,
        errorMessage,
        lastFetchedAt: new Date(),
      },
    })

    return Response.json({ error: errorMessage }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
