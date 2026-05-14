'use client'

import { formatDistanceToNow } from 'date-fns'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import type { FeedItemRow } from '@/app/_actions/feed-items'

type Props = {
  item: FeedItemRow
  showSource?: boolean
  onMarkRead?: (id: string) => void
}

export function FeedItemCard({ item, showSource = false, onMarkRead }: Props) {
  const date = item.publishedAt ?? item.createdAt

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (!item.isRead) onMarkRead?.(item.id)
      }}
      className="group flex flex-col gap-2 rounded-lg border-l-[3px] border-transparent py-4 pl-4 pr-3 transition-all duration-200 hover:border-primary hover:bg-muted/50"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
            item.isRead ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={
            item.isRead
              ? undefined
              : {
                  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                  boxShadow:
                    '0 0 0 2.5px rgba(167,139,250,0.18), 0 0 10px rgba(96,165,250,0.5)',
                }
          }
        />
        <p className="text-base font-semibold leading-snug tracking-tight">
          {item.title}
        </p>
      </div>

      {item.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>
      )}

      <span className="mt-0.5 text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        Read article →
      </span>
    </a>
  )
}
