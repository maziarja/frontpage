'use client'

import { formatDistanceToNow } from 'date-fns'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import type { FeedItemRow } from '@/app/_actions/feed-items'

type Props = {
  item: FeedItemRow
  showSource?: boolean
}

export function FeedItemCard({ item, showSource = false }: Props) {
  const date = item.publishedAt ?? item.createdAt

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
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

      <p className="text-base font-semibold leading-snug tracking-tight">
        {item.title}
      </p>

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
