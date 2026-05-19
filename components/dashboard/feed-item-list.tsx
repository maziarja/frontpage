'use client'

import { useState, useTransition, useEffect } from 'react'
import { Layout } from '@/lib/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import { FeedItemCard } from '@/components/dashboard/feed-item-card'
import { ReaderSheet } from '@/components/dashboard/reader-sheet'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { useLayout } from '@/components/dashboard/layout-context'
import { getMoreFeedItems } from '@/app/_actions/feed-items'
import {
  markItemRead,
  markItemUnread,
  markFeedRead,
  markCategoryRead,
} from '@/app/_actions/read-state'
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
  const { increment, decrement, reset } = useUnreadCounts()
  const { layout } = useLayout()
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id))
      const newItems = initialItems.filter((i) => !existingIds.has(i.id))
      if (newItems.length === 0) return prev
      return [...newItems, ...prev]
    })
  }, [initialItems])
  const [pending, startTransition] = useTransition()
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [readerItemId, setReaderItemId] = useState<string | null>(null)

  // Items that can be opened in the reader (no URL, has content or description)
  const readerItems = items.filter((i) => !i.url && (i.content || i.description))
  const readerIndex = readerItemId ? readerItems.findIndex((i) => i.id === readerItemId) : -1
  const readerItem = readerIndex >= 0 ? readerItems[readerIndex] : null
  function handleMarkRead(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item || item.isRead) return
    decrement(item.feed.id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)))
    startTransition(async () => {
      try {
        await markItemRead(id)
      } catch {
        increment(item.feed.id)
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: false } : i)))
      }
    })
  }

  function handleMarkUnread(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item || !item.isRead) return
    increment(item.feed.id)
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: false } : i)))
    startTransition(async () => {
      try {
        await markItemUnread(id)
      } catch {
        decrement(item.feed.id)
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)))
      }
    })
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

  function openReader(id: string) {
    setReaderItemId(id)
  }

  function navigateReader(direction: 'prev' | 'next') {
    if (readerIndex < 0) return
    const target =
      direction === 'prev' ? readerItems[readerIndex - 1] : readerItems[readerIndex + 1]
    if (!target) return
    setReaderItemId(target.id)
    if (!target.isRead) handleMarkRead(target.id)
  }

  const hasUnread = items.some((item) => !item.isRead)
  const isFiltered = Boolean(filter.feedId ?? filter.categoryId)

  if (items.length === 0) {
    return <p className="text-muted-foreground px-3 py-8 text-center text-sm">{emptyMessage}</p>
  }

  return (
    <>
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

        <div
          className={
            layout === Layout.CARD
              ? 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-0.5'
          }
        >
          {items.map((item) => (
            <FeedItemCard
              key={item.id}
              item={item}
              layout={layout}
              showSource={showSource}
              onMarkRead={handleMarkRead}
              onMarkUnread={handleMarkUnread}
              onOpenReader={openReader}
            />
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

      <ReaderSheet
        item={readerItem}
        open={readerItemId !== null}
        onOpenChange={(open) => {
          if (!open) setReaderItemId(null)
        }}
        onPrev={readerIndex > 0 ? () => navigateReader('prev') : null}
        onNext={readerIndex < readerItems.length - 1 ? () => navigateReader('next') : null}
      />
    </>
  )
}
