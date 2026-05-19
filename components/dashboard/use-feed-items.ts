import { useState, useTransition, useEffect } from 'react'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { markItemRead, markItemUnread } from '@/app/_actions/read-state'
import { saveItem, unsaveItem } from '@/app/_actions/bookmark'
import type { FeedItemRow } from '@/lib/feed-items'

export function useFeedItems(initialItems: FeedItemRow[]) {
  const { increment, decrement, reset } = useUnreadCounts()
  const [items, setItems] = useState(initialItems)
  const [, startTransition] = useTransition()
  const [readerItemId, setReaderItemId] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems((prev) => {
      const existingIds = new Set(prev.map((i) => i.id))
      const newItems = initialItems.filter((i) => !existingIds.has(i.id))
      if (newItems.length === 0) return prev
      return [...newItems, ...prev]
    })
  }, [initialItems])

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

  function handleToggleBookmark(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const wasBookmarked = item.isBookmarked
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isBookmarked: !wasBookmarked } : i)))
    startTransition(async () => {
      try {
        if (wasBookmarked) await unsaveItem(id)
        else await saveItem(id)
      } catch {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isBookmarked: wasBookmarked } : i)))
      }
    })
  }

  function updateItemSummary(id: string, summary: string, tags: string[]) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, summary, tags } : i)))
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

  return {
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
    // exposed for bulk mark-all-read operations in consuming components
    decrement,
    reset,
  }
}
