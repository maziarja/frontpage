'use client'

import { useState } from 'react'
import { BookmarkIcon } from 'lucide-react'
import { FeedItemList } from '@/components/dashboard/feed-item-list'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  initialItems: FeedItemRow[]
}

export function SavedItemsView({ initialItems }: Props) {
  const [unbookmarkedIds, setUnbookmarkedIds] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  const effectiveItems = initialItems.filter((i) => !unbookmarkedIds.has(i.id))

  const filtered = query.trim()
    ? effectiveItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : effectiveItems

  function handleUnbookmark(id: string) {
    setUnbookmarkedIds((prev) => new Set([...prev, id]))
  }

  if (effectiveItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <BookmarkIcon size={32} className="text-muted-foreground opacity-40" />
        <p className="text-muted-foreground text-sm">
          No saved articles yet. Bookmark articles from your feeds to find them here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <input
          type="search"
          placeholder="Filter saved articles…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-56 rounded-md border px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
          aria-label="Filter saved articles"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">No articles match your search.</p>
      ) : (
        <FeedItemList
          initialItems={filtered}
          initialHasMore={false}
          filter={{}}
          showSource
          emptyMessage="No saved articles."
          hideUnbookmarked
          onUnbookmark={handleUnbookmark}
        />
      )}
    </div>
  )
}
