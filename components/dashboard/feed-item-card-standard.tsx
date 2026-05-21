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

export function FeedItemCardStandard({ item, showSource = false, isFocused = false, onMarkRead, onMarkUnread, onOpenReader, onToggleBookmark }: Props) {
  const date = item.publishedAt ?? item.createdAt
  const hasUrl = Boolean(item.url)
  const hasContent = !item.url && Boolean(item.content || item.description)
  const bodyClassName = `group-hover:border-primary group-hover:bg-muted/50 flex min-w-0 flex-col gap-2 overflow-hidden rounded-lg border-l-[3px] py-4 pr-14 pl-4 transition-all duration-200 ${isFocused ? 'border-primary bg-muted/50' : 'border-transparent'}`

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
    <>
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        {showSource && (
          <>
            <FeedFavicon src={item.feed.faviconUrl} size={13} />
            <span className="max-w-40 truncate">{item.feed.title}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
      </div>

      <div className="flex items-start gap-2">
        <span
          aria-hidden="true"
          className={`mt-[5px] block h-[6px] w-[6px] shrink-0 rounded-full transition-all duration-500 ease-out ${
            item.isRead ? 'scale-0 opacity-0' : 'unread-dot scale-100 opacity-100'
          }`}
        />
        <p className="min-w-0 text-base font-semibold leading-snug tracking-tight [overflow-wrap:anywhere]">{item.title}</p>
      </div>

      {item.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed [overflow-wrap:anywhere]">
          {item.description}
        </p>
      )}

      {(hasUrl || hasContent) && (
        <span className="text-muted-foreground mt-0.5 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {hasUrl ? 'Read article →' : 'View content →'}
        </span>
      )}
    </>
  )

  return (
    <div className="group relative min-w-0">
      {hasUrl ? (
        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleOpen} className={bodyClassName}>
          {inner}
        </a>
      ) : hasContent ? (
        <button onClick={handleOpen} className={`w-full text-left ${bodyClassName}`}>
          {inner}
        </button>
      ) : (
        <div className={bodyClassName}>{inner}</div>
      )}
      <div className="absolute top-3 right-2 flex items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
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
