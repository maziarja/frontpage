'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { FeedItemCard } from '@/components/dashboard/feed-item-card'
import { getMoreFeedItems } from '@/app/_actions/feed-items'
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
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [pending, startTransition] = useTransition()

  function loadMore() {
    const cursor = items[items.length - 1]?.id
    if (!cursor) return

    startTransition(async () => {
      const next = await getMoreFeedItems(cursor, filter)
      setItems((prev) => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    })
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground px-3 py-8 text-center text-sm">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col divide-y">
        {items.map((item) => (
          <FeedItemCard key={item.id} item={item} showSource={showSource} />
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
