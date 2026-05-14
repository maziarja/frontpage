export type FeedItemRow = {
  id: string
  url: string
  title: string
  description: string | null
  publishedAt: Date | null
  createdAt: Date
  isRead: boolean
  feed: { id: string; title: string; faviconUrl: string | null }
}

type FeedItemWithReadCount = {
  id: string
  url: string
  title: string
  description: string | null
  publishedAt: Date | null
  createdAt: Date
  feed: { id: string; title: string; faviconUrl: string | null }
  _count: { readStates: number }
}

export function mapFeedItem(item: FeedItemWithReadCount): FeedItemRow {
  return {
    id: item.id,
    url: item.url,
    title: item.title,
    description: item.description,
    publishedAt: item.publishedAt,
    createdAt: item.createdAt,
    isRead: item._count.readStates > 0,
    feed: item.feed,
  }
}
