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

function extractImageUrl(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] ?? null
}

export function FeedItemCardCard({ item, showSource = false, isFocused = false, onMarkRead, onMarkUnread, onOpenReader, onToggleBookmark }: Props) {
  const date = item.publishedAt ?? item.createdAt
  const hasUrl = Boolean(item.url)
  const hasContent = !item.url && Boolean(item.content || item.description)

  const imageUrl =
    (item.description && extractImageUrl(item.description)) ??
    (item.content && extractImageUrl(item.content)) ??
    null

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

  return (
    <div className={`group relative flex flex-col rounded-xl border shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md ${isFocused ? 'border-primary' : ''} ${item.isRead ? 'opacity-70' : ''}`}>
      {/* Full-card clickable overlay — sits at z-0 so action buttons above it capture their own clicks */}
      {hasUrl ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpen}
          aria-label={item.title}
          className="absolute inset-0 z-0 rounded-lg"
        />
      ) : hasContent ? (
        <button
          onClick={handleOpen}
          aria-label={item.title}
          className="absolute inset-0 z-0 w-full rounded-lg"
        />
      ) : null}

      {/* Card content — pointer-events-none so overlay receives clicks everywhere except the action buttons */}
      <div className="relative z-10 flex flex-1 flex-col pointer-events-none">
        {imageUrl && (
          <div className="bg-muted aspect-video w-full overflow-hidden rounded-t-xl">
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {showSource && (
              <>
                <FeedFavicon src={item.feed.faviconUrl} size={13} />
                <span className="max-w-32 truncate">{item.feed.title}</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>{formatDistanceToNow(date, { addSuffix: true })}</span>

            {/* Action buttons — pointer-events-auto so they're clickable above the overlay */}
            <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100 [@media(hover:none)]:opacity-100 pointer-events-auto">
              {onToggleBookmark && (
                <button
                  onClick={handleBookmark}
                  title={item.isBookmarked ? 'Remove from saved' : 'Save article'}
                  aria-label={item.isBookmarked ? 'Remove from saved' : 'Save article'}
                  className="hover:bg-muted hover:text-foreground rounded p-1 transition-colors duration-150"
                >
                  {item.isBookmarked ? <BookmarkCheckIcon size={13} /> : <BookmarkIcon size={13} />}
                </button>
              )}
              <button
                onClick={handleToggle}
                title={item.isRead ? 'Mark as unread' : 'Mark as read'}
                aria-label={item.isRead ? 'Mark as unread' : 'Mark as read'}
                className="hover:bg-muted hover:text-foreground rounded p-1 transition-colors duration-150"
              >
                {item.isRead ? <RotateCcwIcon size={13} /> : <CheckIcon size={13} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span
              aria-hidden="true"
              className={`mt-[5px] block h-[6px] w-[6px] shrink-0 rounded-full transition-all duration-500 ease-out ${
                item.isRead ? 'scale-0 opacity-0' : 'unread-dot scale-100 opacity-100'
              }`}
            />
            <p className="min-w-0 break-words text-base font-semibold leading-snug tracking-tight">{item.title}</p>
          </div>

          {item.description && (
            <p className="text-muted-foreground line-clamp-3 break-words text-sm leading-relaxed">
              {item.description}
            </p>
          )}

          {(hasUrl || hasContent) && (
            <span className="text-muted-foreground mt-auto pt-2 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {hasUrl ? 'Read article →' : 'View content →'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
