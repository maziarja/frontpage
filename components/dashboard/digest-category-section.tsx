'use client'

import { useState } from 'react'
import { Layout } from '@/lib/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import { FeedItemCard } from '@/components/dashboard/feed-item-card'
import { ReaderSheet } from '@/components/dashboard/reader-sheet'
import { useLayout } from '@/components/dashboard/layout-context'
import { useFeedItems } from '@/components/dashboard/use-feed-items'
import { markItemRead, markCategoryRead } from '@/app/_actions/read-state'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  categoryId: string | null
  categoryName: string
  initialItems: FeedItemRow[]
}

export function DigestCategorySection({ categoryId, categoryName, initialItems }: Props) {
  const { layout } = useLayout()
  const {
    items,
    setItems,
    handleMarkRead,
    handleMarkUnread,
    updateItemSummary,
    openReader,
    navigateReader,
    readerItem,
    readerIndex,
    readerItems,
    readerItemId,
    setReaderItemId,
    decrement,
    reset,
  } = useFeedItems(initialItems)

  const [markingAllRead, setMarkingAllRead] = useState(false)

  async function handleMarkAllRead() {
    setMarkingAllRead(true)
    const unreadItems = items.filter((i) => !i.isRead)

    if (categoryId !== null) {
      const feedIds = [...new Set(unreadItems.map((i) => i.feed.id))]
      feedIds.forEach((id) => reset(id))
      await markCategoryRead(categoryId)
    } else {
      for (const item of unreadItems) {
        decrement(item.feed.id)
        await markItemRead(item.id)
      }
    }

    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })))
    setMarkingAllRead(false)
  }

  const hasUnread = items.some((i) => !i.isRead)

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="text-muted-foreground text-xs"
          >
            {markingAllRead ? 'Marking…' : 'Mark all read'}
          </Button>
        )}
      </div>

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
            showSource
            onMarkRead={handleMarkRead}
            onMarkUnread={handleMarkUnread}
            onOpenReader={openReader}
          />
        ))}
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
      />
    </div>
  )
}
