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
      className="group flex flex-col gap-1 rounded-md px-3 py-3 transition-colors hover:bg-muted/50"
    >
      {showSource && (
        <div className="flex items-center gap-1.5">
          <FeedFavicon src={item.feed.faviconUrl} size={14} />
          <span className="text-muted-foreground truncate text-xs">{item.feed.title}</span>
        </div>
      )}
      <p className="text-sm font-medium leading-snug group-hover:underline">{item.title}</p>
      {item.description && (
        <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
          {item.description}
        </p>
      )}
      <p className="text-muted-foreground mt-0.5 text-xs">
        {formatDistanceToNow(date, { addSuffix: true })}
      </p>
    </a>
  )
}
