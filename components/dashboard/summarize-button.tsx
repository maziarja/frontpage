'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon, LoaderIcon } from 'lucide-react'
import { generateSummary } from '@/app/_actions/summarize'
import { SUMMARY_DAILY_LIMIT } from '@/lib/const'

type State = 'idle' | 'loading' | 'done' | 'rate_limited' | 'error'

type Props = {
  feedItemId: string
  initialSummary: string | null
  initialTags?: string[]
  variant: 'card' | 'reader'
  onSummaryGenerated?: (id: string, summary: string, tags: string[]) => void
}

export function SummarizeButton({ feedItemId, initialSummary, initialTags = [], variant, onSummaryGenerated }: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>(initialSummary ? 'done' : 'idle')
  const [summary, setSummary] = useState(initialSummary)
  const [tags, setTags] = useState(initialTags)

  async function handleSummarize() {
    setState('loading')
    const result = await generateSummary(feedItemId)
    if ('error' in result) {
      setState(result.error === 'rate_limit' ? 'rate_limited' : 'error')
    } else {
      setSummary(result.summary)
      setTags(result.tags)
      setState('done')
      onSummaryGenerated?.(feedItemId, result.summary, result.tags)
      router.refresh()
    }
  }

  if (variant === 'reader') {
    if (state === 'done' && summary) {
      return (
        <div className="border-l-2 border-amber-300 pl-4 dark:border-amber-700/60">
          <div className="mb-2 flex items-center gap-1.5">
            <SparklesIcon size={11} className="shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />
            <span className="text-xs font-semibold tracking-widest text-amber-600 uppercase dark:text-amber-500">
              AI Summary
            </span>
          </div>
          <p className="text-foreground text-sm font-medium leading-relaxed">{summary}</p>
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500 dark:border-stone-700 dark:bg-stone-800/60 dark:text-stone-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (state === 'loading') {
      return (
        <div className="flex items-center gap-2">
          <LoaderIcon size={13} className="animate-spin text-amber-500 dark:text-amber-400" aria-hidden />
          <span className="text-muted-foreground text-sm">Generating summary…</span>
        </div>
      )
    }

    if (state === 'rate_limited') {
      return (
        <p className="text-muted-foreground text-xs">
          Daily limit reached ({SUMMARY_DAILY_LIMIT}/day)
        </p>
      )
    }

    if (state === 'error') {
      return <p className="text-muted-foreground text-xs">Summary unavailable</p>
    }

    return (
      <button
        onClick={handleSummarize}
        className="inline-flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-800 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <SparklesIcon size={14} className="text-amber-500 dark:text-amber-400" aria-hidden />
        Summarize
      </button>
    )
  }

  // variant === 'card' — retained for future use, currently not rendered in feed lists
  if (state === 'done' && summary) {
    return (
      <div className="mx-4 mb-3 mt-2 border-l-2 border-amber-300 pl-3 dark:border-amber-700/60">
        <p className="text-foreground text-xs font-medium leading-relaxed">{summary}</p>
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="mx-4 mb-3 mt-2 flex items-center gap-1.5">
        <LoaderIcon size={11} className="animate-spin text-amber-500" aria-hidden />
        <span className="text-muted-foreground text-xs">Summarizing…</span>
      </div>
    )
  }

  if (state === 'rate_limited' || state === 'error') return null

  return (
    <div className="mx-4 mb-3 mt-2">
      <button
        onClick={handleSummarize}
        className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700 dark:bg-stone-800/50 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <SparklesIcon size={11} className="text-amber-500" aria-hidden />
        Summarize
      </button>
    </div>
  )
}
