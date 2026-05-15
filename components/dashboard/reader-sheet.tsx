'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, XIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  item: FeedItemRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrev: (() => void) | null
  onNext: (() => void) | null
}

export function ReaderSheet({ item, open, onOpenChange, onPrev, onNext }: Props) {
  if (!item) return null

  const date = item.publishedAt ?? item.createdAt

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col gap-0 p-0 w-full! sm:max-w-2xl! lg:max-w-4xl! xl:max-w-5xl!"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev ?? undefined}
              disabled={!onPrev}
              aria-label="Previous article"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeftIcon size={16} />
            </button>
            <button
              onClick={onNext ?? undefined}
              disabled={!onNext}
              aria-label="Next article"
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close reader"
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <SheetTitle className="mb-4 text-xl leading-snug font-semibold tracking-tight">
            {item.title}
          </SheetTitle>

          {/* Metadata */}
          <div className="text-muted-foreground mb-8 flex flex-wrap items-center gap-1.5 text-xs">
            <FeedFavicon src={item.feed.faviconUrl} size={13} />
            <span>{item.feed.title}</span>
            {item.author && (
              <>
                <span aria-hidden>·</span>
                <span>{item.author}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <time dateTime={date.toISOString()} title={format(date, 'PPP')}>
              {formatDistanceToNow(date, { addSuffix: true })}
            </time>
          </div>

          {/* Article content */}
          {item.content ? (
            <div className="reader-content" dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : (
            <p className="text-muted-foreground text-sm">{item.description}</p>
          )}
        </div>

        {/* Footer */}
        {item.url && (
          <div className="border-t px-6 py-4">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              View original article
              <ExternalLinkIcon size={13} />
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
