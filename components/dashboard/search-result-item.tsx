'use client'

import { formatDistanceToNow } from 'date-fns'
import { BookmarkCheckIcon, BookmarkIcon } from 'lucide-react'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { highlightText } from '@/lib/highlight'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  item: FeedItemRow
  query: string
  onSelect: () => void
  onOpenReader?: (id: string) => void
  onToggleBookmark?: (id: string) => void
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const segments = highlightText(text, query)
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-[2px] px-[1px]">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  )
}

export function SearchResultItem({ item, query, onSelect, onOpenReader, onToggleBookmark }: Props) {
  const date = item.publishedAt ?? item.createdAt
  const hasUrl = Boolean(item.url)
  const hasContent = !hasUrl && Boolean(item.content || item.description)

  function handleClick() {
    if (hasUrl) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
      onSelect()
    } else if (hasContent) {
      onOpenReader?.(item.id)
    }
  }

  function handleBookmark(e: React.MouseEvent) {
    e.stopPropagation()
    onToggleBookmark?.(item.id)
  }

  return (
    <div
      role="option"
      aria-selected="false"
      onClick={handleClick}
      className="group flex cursor-pointer flex-col gap-1.5 rounded-lg px-4 py-3 transition-colors hover:bg-muted"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
          <FeedFavicon src={item.feed.faviconUrl} size={13} />
          <span className="max-w-32 truncate">{item.feed.title}</span>
          <span aria-hidden>·</span>
          <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
        </div>

        {onToggleBookmark && (
          <button
            onClick={handleBookmark}
            title={item.isBookmarked ? 'Remove from saved' : 'Save article'}
            aria-label={item.isBookmarked ? 'Remove from saved' : 'Save article'}
            className="hover:text-foreground text-muted-foreground shrink-0 rounded p-1 opacity-0 transition-all group-hover:opacity-100"
          >
            {item.isBookmarked ? <BookmarkCheckIcon size={13} /> : <BookmarkIcon size={13} />}
          </button>
        )}
      </div>

      <p className="min-w-0 break-words text-sm font-semibold leading-snug">
        <Highlighted text={item.title} query={query} />
      </p>

      {item.description && (
        <p className="text-muted-foreground line-clamp-2 break-words text-xs leading-relaxed">
          <Highlighted text={item.description} query={query} />
        </p>
      )}
    </div>
  )
}
