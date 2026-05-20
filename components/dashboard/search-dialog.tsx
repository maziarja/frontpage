'use client'

import { useState, useEffect, useRef, useTransition, useCallback } from 'react'
import { SearchIcon, ClockIcon, Loader2Icon, XIcon } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ReaderSheet } from '@/components/dashboard/reader-sheet'
import { SearchResultItem } from '@/components/dashboard/search-result-item'
import { useGuest } from '@/components/dashboard/guest-context'
import { searchFeedItems } from '@/app/_actions/search'
import { saveItem, unsaveItem } from '@/app/_actions/bookmark'
import { MAX_RECENT_SEARCHES, RECENT_SEARCHES_KEY } from '@/lib/const'
import type { FeedItemRow } from '@/lib/feed-items'

type Since = 'week' | 'month' | undefined

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const current = loadRecentSearches()
  const updated = [query, ...current.filter((q) => q !== query)].slice(0, MAX_RECENT_SEARCHES)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
}

function deleteRecentSearch(query: string): string[] {
  const current = loadRecentSearches()
  const updated = current.filter((q) => q !== query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  return updated
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const isGuest = useGuest()
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [since, setSince] = useState<Since>(undefined)
  const [results, setResults] = useState<FeedItemRow[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reader state — lives independently of dialog open/close
  const [readerItem, setReaderItem] = useState<FeedItemRow | null>(null)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!isGuest) setRecentSearches(loadRecentSearches())
      const id = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(id)
    } else {
      setQuery('')
      setSince(undefined)
      setResults([])
      setHasSearched(false)
      // do NOT reset readerItem — reader may still be open after dialog closes
    }
  }, [open, isGuest])

  const runSearch = useCallback(
    (q: string, s: Since) => {
      if (!q.trim()) {
        setResults([])
        setHasSearched(false)
        return
      }
      startTransition(async () => {
        const items = await searchFeedItems({ query: q, since: s })
        setResults(items)
        setHasSearched(true)
        if (items.length > 0 && !isGuest) {
          saveRecentSearch(q.trim())
          setRecentSearches(loadRecentSearches())
        }
      })
    },
    [isGuest],
  )

  function handleQueryChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value, since), 300)
  }

  function handleSinceChange(value: Since) {
    setSince(value)
    if (query.trim()) runSearch(query, value)
  }

  function handleRecentClick(recent: string) {
    setQuery(recent)
    runSearch(recent, since)
  }

  function handleDeleteRecent(e: React.MouseEvent, recent: string) {
    e.stopPropagation()
    setRecentSearches(deleteRecentSearch(recent))
  }

  function handleOpenReader(id: string) {
    const item = results.find((i) => i.id === id)
    if (!item) return
    setReaderItem(item)
    onOpenChange(false)
  }

  function handleToggleBookmark(id: string) {
    setResults((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const wasBookmarked = item.isBookmarked
        startTransition(async () => {
          try {
            if (wasBookmarked) await unsaveItem(id)
            else await saveItem(id)
          } catch {
            setResults((r) =>
              r.map((i) => (i.id === id ? { ...i, isBookmarked: wasBookmarked } : i)),
            )
          }
        })
        return { ...item, isBookmarked: !wasBookmarked }
      }),
    )
  }

  function handleSummaryGenerated(id: string, summary: string, tags: string[]) {
    setResults((prev) => prev.map((i) => (i.id === id ? { ...i, summary, tags } : i)))
    setReaderItem((prev) => (prev?.id === id ? { ...prev, summary, tags } : prev))
  }

  const showRecent = !isGuest && !query.trim() && recentSearches.length > 0
  const showDateFilters = Boolean(query.trim())
  const showEmpty = hasSearched && results.length === 0 && !isPending

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex max-h-[80vh] w-[calc(100%-3rem)] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-xl lg:max-w-2xl"
          showCloseButton={false}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 border-b px-4 py-3.5">
            <SearchIcon size={16} className="text-muted-foreground shrink-0" aria-hidden />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search articles…"
              className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
              aria-label="Search articles"
              autoComplete="off"
            />
            {isPending && (
              <Loader2Icon
                size={14}
                className="text-muted-foreground shrink-0 animate-spin"
                aria-hidden
              />
            )}
          </div>

          {/* Date filter chips */}
          {showDateFilters && (
            <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
              {(
                [
                  { label: 'All time', value: undefined },
                  { label: 'Last 7 days', value: 'week' as const },
                  { label: 'Last 30 days', value: 'month' as const },
                ] as const
              ).map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => handleSinceChange(value)}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                    since === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Recent searches */}
            {showRecent && (
              <div className="p-4">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-medium">
                  <ClockIcon size={12} aria-hidden />
                  Recent searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((recent) => (
                    <span
                      key={recent}
                      className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full py-1 pr-1.5 pl-3 text-xs"
                    >
                      <button
                        onClick={() => handleRecentClick(recent)}
                        className="hover:text-foreground transition-colors"
                      >
                        {recent}
                      </button>
                      <button
                        onClick={(e) => handleDeleteRecent(e, recent)}
                        aria-label={`Remove "${recent}" from recent searches`}
                        className="hover:text-foreground rounded-full p-0.5 transition-colors"
                      >
                        <XIcon size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty query — no recent searches */}
            {!query.trim() && recentSearches.length === 0 && (
              <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                Start typing to search your articles.
              </p>
            )}

            {/* No results */}
            {showEmpty && (
              <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                No articles found for &ldquo;{query}&rdquo;.
              </p>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div role="listbox" aria-label="Search results" className="p-2">
                {results.map((item) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    query={query}
                    onSelect={() => onOpenChange(false)}
                    onOpenReader={handleOpenReader}
                    onToggleBookmark={isGuest ? undefined : handleToggleBookmark}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reader sheet — rendered outside the Dialog so it survives dialog close */}
      <ReaderSheet
        item={readerItem}
        open={readerItem !== null}
        onOpenChange={(o) => {
          if (!o) setReaderItem(null)
        }}
        onPrev={null}
        onNext={null}
        onSummaryGenerated={handleSummaryGenerated}
        onToggleBookmark={isGuest ? undefined : handleToggleBookmark}
      />
    </>
  )
}
