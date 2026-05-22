'use client'

import { formatDistanceToNow } from 'date-fns'
import { BookmarkCheckIcon, BookmarkIcon, CheckIcon, RotateCcwIcon } from 'lucide-react'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  item: FeedItemRow
  showSource?: boolean
  isFocused?: boolean
  onMarkRead?: (id: string) => void
  onMarkUnread?: (id: string) => void
  onOpenReader?: (id: string) => void
  onToggleBookmark?: (id: string) => void
}

export function FeedItemCardCompact({ item, showSource = false, isFocused = false, onMarkRead, onMarkUnread, onOpenReader, onToggleBookmark }: Props) {
  const date = item.publishedAt ?? item.createdAt
  const hasUrl = Boolean(item.url)
  const hasContent = !item.url && Boolean(item.content || item.description)

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (item.isRead) onMarkUnread?.(item.id)
    else onMarkRead?.(item.id)
  }

  function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onToggleBookmark?.(item.id)
  }

  function handleOpen() {
    if (!item.isRead) onMarkRead?.(item.id)
    if (!hasUrl) onOpenReader?.(item.id)
  }

  const inner = (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-150 group-hover:bg-background group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] group-hover:-translate-y-px dark:group-hover:shadow-[0_2px_12px_rgba(0,0,0,0.3)] ${isFocused ? 'bg-background shadow-[0_2px_12px_rgba(0,0,0,0.07)] -translate-y-px' : ''}`}>
      <span
        aria-hidden="true"
        className={`block h-[5px] w-[5px] shrink-0 rounded-full transition-all duration-500 ease-out ${
          item.isRead ? 'scale-0 opacity-0' : 'unread-dot scale-100 opacity-100'
        }`}
      />
      <span className={`flex-1 truncate text-sm font-medium leading-tight ${item.isRead ? 'text-muted-foreground' : ''}`}>
        {item.title}
      </span>
      <div className="text-muted-foreground ml-2 flex shrink-0 items-center gap-1.5 text-xs">
        {showSource && (
          <>
            <FeedFavicon src={item.feed.faviconUrl} size={12} />
            <span className="max-w-24 truncate">{item.feed.title}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <span className="whitespace-nowrap">{formatDistanceToNow(date, { addSuffix: true })}</span>
      </div>
    </div>
  )

  return (
    <div className="group relative pr-14">
      {hasUrl ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleOpen}>
          {inner}
        </a>
      ) : hasContent ? (
        <button onClick={handleOpen} className="w-full text-left">{inner}</button>
      ) : (
        <div>{inner}</div>
      )}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        {onToggleBookmark && (
          <button
            onClick={handleBookmark}
            title={item.isBookmarked ? 'Remove from saved' : 'Save article'}
            aria-label={item.isBookmarked ? 'Remove from saved' : 'Save article'}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors duration-150"
          >
            {item.isBookmarked ? <BookmarkCheckIcon size={13} /> : <BookmarkIcon size={13} />}
          </button>
        )}
        <button
          onClick={handleToggle}
          title={item.isRead ? 'Mark as unread' : 'Mark as read'}
          aria-label={item.isRead ? 'Mark as unread' : 'Mark as read'}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1 transition-colors duration-150"
        >
          {item.isRead ? <RotateCcwIcon size={13} /> : <CheckIcon size={13} />}
        </button>
      </div>
    </div>
  )
}
