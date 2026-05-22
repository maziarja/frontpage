'use client'

import { XIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAutoRefresh } from '@/components/dashboard/auto-refresh-provider'

export function NewItemsBanner() {
  const { newItemCount, clearBanner } = useAutoRefresh()
  const router = useRouter()

  if (newItemCount === 0) return null

  function handleReload() {
    router.refresh()
    clearBanner()
  }

  return (
    <div
      className="flex items-center justify-between gap-4 border-b bg-primary/5 px-4 py-2.5 text-sm"
      role="status"
      aria-live="polite"
    >
      <span className="font-medium text-foreground/80">
        {newItemCount} new {newItemCount === 1 ? 'item' : 'items'} available
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleReload}
          className="shrink-0 font-semibold text-primary underline-offset-4 hover:underline"
        >
          Reload to view
        </button>
        <button
          onClick={clearBanner}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>
    </div>
  )
}
