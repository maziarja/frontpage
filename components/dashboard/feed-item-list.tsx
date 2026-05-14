'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { FeedItemCard } from '@/components/dashboard/feed-item-card'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { getMoreFeedItems } from '@/app/_actions/feed-items'
import { markItemRead, markFeedRead, markCategoryRead } from '@/app/_actions/read-state'
import type { FeedItemRow } from '@/app/_actions/feed-items'
import { PAGE_SIZE } from '@/lib/const'

type Filter = { feedId?: string; categoryId?: string }

type Props = {
  initialItems: FeedItemRow[]
  initialHasMore: boolean
  filter: Filter
  showSource?: boolean
  emptyMessage?: string
}

export function FeedItemList({
  initialItems,
  initialHasMore,
  filter,
  showSource = false,
  emptyMessage = 'No articles yet.',
}: Props) {
  const { decrement, reset } = useUnreadCounts()
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [pending, startTransition] = useTransition()
  const [markingAllRead, setMarkingAllRead] = useState(false)

  function handleMarkRead(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item || item.isRead) return
    decrement(item.feed.id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)))
    startTransition(() => markItemRead(id))
  }

  async function handleMarkAllRead() {
    setMarkingAllRead(true)

    const unreadItems = items.filter((i) => !i.isRead)
    if (filter.feedId) {
      reset(filter.feedId)
      await markFeedRead(filter.feedId)
    } else if (filter.categoryId) {
      const feedIds = [...new Set(unreadItems.map((i) => i.feed.id))]
      feedIds.forEach((id) => reset(id))
      await markCategoryRead(filter.categoryId)
    }

    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })))
    setMarkingAllRead(false)
  }

  function loadMore() {
    const cursor = items[items.length - 1]?.id
    if (!cursor) return

    startTransition(async () => {
      const next = await getMoreFeedItems(cursor, filter)
      setItems((prev) => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    })
  }

  const hasUnread = items.some((item) => !item.isRead)
  const isFiltered = Boolean(filter.feedId ?? filter.categoryId)

  if (items.length === 0) {
    return <p className="text-muted-foreground px-3 py-8 text-center text-sm">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col">
      {isFiltered && hasUnread && (
        <div className="mb-2 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="text-muted-foreground text-xs"
          >
            {markingAllRead
              ? 'Marking…'
              : filter.feedId
                ? 'Mark feed as read'
                : 'Mark category as read'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <FeedItemCard key={item.id} item={item} showSource={showSource} onMarkRead={handleMarkRead} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={pending}>
            {pending ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
