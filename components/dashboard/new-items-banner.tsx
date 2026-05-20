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
      className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-sm"
      role="status"
      aria-live="polite"
    >
      <span className="text-muted-foreground">
        {newItemCount} new {newItemCount === 1 ? 'item' : 'items'} available
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleReload}
          className="font-medium underline-offset-4 hover:underline"
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
