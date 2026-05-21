import { useEffect, useRef, useState } from 'react'
import type { FeedItemRow } from '@/lib/feed-items'

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (['input', 'textarea', 'select'].includes(tag)) return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

type Options = {
  items: FeedItemRow[]
  isDisabled: boolean
  onOpen: (item: FeedItemRow) => void
  onMarkRead: (id: string) => void
  onMarkUnread: (id: string) => void
  onToggleBookmark: (id: string) => void
  onLoadMore?: () => void
}

export function useKeyboardNav({
  items,
  isDisabled,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onToggleBookmark,
  onLoadMore,
}: Options) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  // Stable refs so the keydown listener never needs to be re-registered
  const focusedIndexRef = useRef<number | null>(null)
  const itemsRef = useRef(items)
  const isDisabledRef = useRef(isDisabled)
  const onOpenRef = useRef(onOpen)
  const onMarkReadRef = useRef(onMarkRead)
  const onMarkUnreadRef = useRef(onMarkUnread)
  const onToggleBookmarkRef = useRef(onToggleBookmark)
  const onLoadMoreRef = useRef(onLoadMore)
  const itemRefsArr = useRef<(HTMLElement | null)[]>([])

  useEffect(() => { focusedIndexRef.current = focusedIndex }, [focusedIndex])
  useEffect(() => { itemsRef.current = items }, [items])
  useEffect(() => { isDisabledRef.current = isDisabled }, [isDisabled])
  useEffect(() => { onOpenRef.current = onOpen }, [onOpen])
  useEffect(() => { onMarkReadRef.current = onMarkRead }, [onMarkRead])
  useEffect(() => { onMarkUnreadRef.current = onMarkUnread }, [onMarkUnread])
  useEffect(() => { onToggleBookmarkRef.current = onToggleBookmark }, [onToggleBookmark])
  useEffect(() => { onLoadMoreRef.current = onLoadMore }, [onLoadMore])

  // Scroll focused item into view whenever index changes
  useEffect(() => {
    if (focusedIndex === null) return
    itemRefsArr.current[focusedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [focusedIndex])

  // Register a stable keydown listener once
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isDisabledRef.current) return
      if (isInputFocused()) return
      // Ignore modifier combos (Cmd+K etc. handled by global shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const currentItems = itemsRef.current
      const currentIndex = focusedIndexRef.current

      if (e.key === 'j') {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (prev === null) return currentItems.length > 0 ? 0 : null
          return Math.min(prev + 1, currentItems.length - 1)
        })
        return
      }

      if (e.key === 'k') {
        e.preventDefault()
        setFocusedIndex((prev) => {
          if (prev === null) return currentItems.length > 0 ? 0 : null
          return Math.max(prev - 1, 0)
        })
        return
      }

      if ((e.key === 'o' || e.key === 'Enter') && currentIndex !== null) {
        e.preventDefault()
        const item = currentItems[currentIndex]
        if (item) onOpenRef.current(item)
        return
      }

      if (e.key === 'm' && currentIndex !== null) {
        e.preventDefault()
        const item = currentItems[currentIndex]
        if (item) {
          if (item.isRead) onMarkUnreadRef.current(item.id)
          else onMarkReadRef.current(item.id)
        }
        return
      }

      if (e.key === 's' && currentIndex !== null) {
        e.preventDefault()
        const item = currentItems[currentIndex]
        if (item) onToggleBookmarkRef.current(item.id)
        return
      }

      if (e.key === 'l') {
        e.preventDefault()
        onLoadMoreRef.current?.()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // intentionally empty — all values accessed via refs

  function setItemRef(index: number) {
    return (el: HTMLElement | null) => {
      itemRefsArr.current[index] = el
    }
  }

  return { focusedIndex, setFocusedIndex, setItemRef }
}
