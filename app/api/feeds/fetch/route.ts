import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { feedFetchQuerySchema } from '@/schemas/feed'
import { fetchAndStoreFeed } from '@/lib/fetch-feed-core'

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

  const result = await fetchAndStoreFeed(feed)
  if (result.error) {
    return Response.json({ error: result.error }, { status: 502 })
  }
  return Response.json({ newItemCount: result.newItemCount, cached: result.cached })
}
