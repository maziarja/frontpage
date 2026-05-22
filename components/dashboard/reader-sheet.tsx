'use client'

import { format, formatDistanceToNow } from 'date-fns'
import { BookmarkCheckIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, XIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { SummarizeButton } from '@/components/dashboard/summarize-button'
import type { FeedItemRow } from '@/lib/feed-items'

type Props = {
  item: FeedItemRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrev: (() => void) | null
  onNext: (() => void) | null
  onSummaryGenerated?: (id: string, summary: string, tags: string[]) => void
  onToggleBookmark?: (id: string) => void
}

export function ReaderSheet({ item, open, onOpenChange, onPrev, onNext, onSummaryGenerated, onToggleBookmark }: Props) {
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
            {onToggleBookmark && (
              <button
                onClick={() => onToggleBookmark(item.id)}
                aria-label={item.isBookmarked ? 'Remove from saved' : 'Save article'}
                title={item.isBookmarked ? 'Remove from saved' : 'Save article'}
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5 transition-colors"
              >
                {item.isBookmarked ? <BookmarkCheckIcon size={16} /> : <BookmarkIcon size={16} />}
              </button>
            )}
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
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <SheetTitle className="mb-5 text-2xl font-bold leading-snug tracking-tight">
            {item.title}
          </SheetTitle>

          {/* Metadata */}
          <div className="mb-8 flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
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

          {/* AI Summary */}
          {(item.content || item.description) && (
            <div className="mb-8">
              <SummarizeButton
                key={item.id}
                feedItemId={item.id}
                initialSummary={item.summary}
                initialTags={item.tags}
                variant="reader"
                onSummaryGenerated={onSummaryGenerated}
              />
            </div>
          )}

          {/* Article content */}
          {item.content ? (
            <div className="reader-content" dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : item.sanitizedDescription ? (
            <div className="reader-content" dangerouslySetInnerHTML={{ __html: item.sanitizedDescription }} />
          ) : null}
        </div>

        {/* Footer */}
        {item.url && (
          <div className="border-t px-8 py-4">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
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
