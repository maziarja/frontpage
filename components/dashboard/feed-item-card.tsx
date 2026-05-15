'use client'

import { formatDistanceToNow } from 'date-fns'
import { CheckIcon, RotateCcwIcon } from 'lucide-react'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import type { FeedItemRow } from '@/app/_actions/feed-items'

type Props = {
  item: FeedItemRow
  showSource?: boolean
  onMarkRead?: (id: string) => void
  onMarkUnread?: (id: string) => void
}

export function FeedItemCard({ item, showSource = false, onMarkRead, onMarkUnread }: Props) {
  const date = item.publishedAt ?? item.createdAt

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (item.isRead) {
      onMarkUnread?.(item.id)
    } else {
      onMarkRead?.(item.id)
    }
  }

  return (
    <div className="group relative">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (!item.isRead) onMarkRead?.(item.id)
        }}
        className="group-hover:border-primary group-hover:bg-muted/50 flex flex-col gap-2 rounded-lg border-l-[3px] border-transparent py-4 pr-8 pl-4 transition-all duration-200"
      >
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
          <p className="text-base leading-snug font-semibold tracking-tight">{item.title}</p>
        </div>

        {item.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {item.description}
          </p>
        )}

        <span className="text-muted-foreground mt-0.5 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Read article →
        </span>
      </a>

      <button
        onClick={handleToggle}
        title={item.isRead ? 'Mark as unread' : 'Mark as read'}
        aria-label={item.isRead ? 'Mark as unread' : 'Mark as read'}
        className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-4 right-2.5 rounded p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
      >
        {item.isRead ? <RotateCcwIcon size={13} /> : <CheckIcon size={13} />}
      </button>
    </div>
  )
}
