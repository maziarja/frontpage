'use client'

import { useEffect, useState, useTransition } from 'react'
import { Layout } from '@/lib/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import { FeedItemCard } from '@/components/dashboard/feed-item-card'
import { ReaderSheet } from '@/components/dashboard/reader-sheet'
import { useLayout } from '@/components/dashboard/layout-context'
import { useGuest } from '@/components/dashboard/guest-context'
import { useFeedItems } from '@/components/dashboard/use-feed-items'
import { useSearch } from '@/components/dashboard/search-context'
import { useKeyboardNav } from '@/components/dashboard/use-keyboard-nav'
import { getMoreFeedItems } from '@/app/_actions/feed-items'
import { markFeedRead, markCategoryRead } from '@/app/_actions/read-state'
import type { FeedItemRow } from '@/app/_actions/feed-items'
import { PAGE_SIZE } from '@/lib/const'

type Filter = { feedId?: string; categoryId?: string }

type Props = {
  initialItems: FeedItemRow[]
  initialHasMore: boolean
  filter: Filter
  showSource?: boolean
  emptyMessage?: string
  hideUnbookmarked?: boolean
  onUnbookmark?: (id: string) => void
  searchQuery?: string
}

export function FeedItemList({
  initialItems,
  initialHasMore,
  filter,
  showSource = false,
  emptyMessage = 'No articles yet.',
  hideUnbookmarked = false,
  onUnbookmark,
  searchQuery = '',
}: Props) {
  const { layout } = useLayout()
  const isGuest = useGuest()
  const { open: isSearchOpen } = useSearch()
  const {
    items,
    setItems,
    handleMarkRead,
    handleMarkUnread,
    handleToggleBookmark,
    updateItemSummary,
    openReader,
    navigateReader,
    readerItem,
    readerIndex,
    readerItems,
    readerItemId,
    setReaderItemId,
    reset,
  } = useFeedItems(initialItems)

  const [hasMore, setHasMore] = useState(initialHasMore)
  const [pending, startTransition] = useTransition()
  const [markingAllRead, setMarkingAllRead] = useState(false)

  let visibleItems = hideUnbookmarked ? items.filter((i) => i.isBookmarked) : items
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    visibleItems = visibleItems.filter(
      (i) => i.title.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
    )
  }

  const isNavDisabled = readerItemId !== null || isSearchOpen

  function handleOpen(item: FeedItemRow) {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      if (!item.isRead) handleMarkRead(item.id)
    } else if (item.content || item.description) {
      openReader(item.id)
    }
  }

  const { focusedIndex, setFocusedIndex, setItemRef } = useKeyboardNav({
    items: visibleItems,
    isDisabled: isNavDisabled,
    onOpen: handleOpen,
    onMarkRead: handleMarkRead,
    onMarkUnread: handleMarkUnread,
    onToggleBookmark: handleToggleBookmark,
    onLoadMore: hasMore && !pending ? loadMore : undefined,
  })

  // Reset cursor when visible items change (search query or filter changes)
  useEffect(() => {
    setFocusedIndex(null)
  }, [searchQuery, filter.feedId, filter.categoryId, setFocusedIndex])

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
      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        return [...prev, ...next.filter((i) => !existingIds.has(i.id))]
      })
      setHasMore(next.length === PAGE_SIZE)
    })
  }

  function wrappedToggleBookmark(id: string) {
    if (hideUnbookmarked && onUnbookmark) {
      const item = items.find((i) => i.id === id)
      if (item?.isBookmarked) onUnbookmark(id)
    }
    handleToggleBookmark(id)
  }

  const hasUnread = items.some((item) => !item.isRead)
  const isFiltered = Boolean(filter.feedId ?? filter.categoryId)

  if (visibleItems.length === 0) {
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
          {visibleItems.map((item, index) => (
            <div key={item.id} ref={setItemRef(index)}>
              <FeedItemCard
                item={item}
                layout={layout}
                showSource={showSource}
                isFocused={focusedIndex === index}
                onMarkRead={handleMarkRead}
                onMarkUnread={handleMarkUnread}
                onOpenReader={openReader}
                onToggleBookmark={isGuest ? undefined : wrappedToggleBookmark}
              />
            </div>
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
        onSummaryGenerated={updateItemSummary}
        onToggleBookmark={isGuest ? undefined : wrappedToggleBookmark}
      />
    </>
  )
}
