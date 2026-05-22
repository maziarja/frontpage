'use client'

import { useState } from 'react'
import { CheckIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAutoRefresh } from '@/components/dashboard/auto-refresh-provider'
import { updateRefreshInterval } from '@/app/_actions/preferences'

const INTERVAL_OPTIONS = [
  { label: 'Manual only', value: 0 },
  { label: 'Every 15 min', value: 15 },
  { label: 'Every 30 min', value: 30 },
  { label: 'Every hour', value: 60 },
] as const

export function NavRefreshButton() {
  const { isRefreshing, refreshInterval, triggerRefresh, setRefreshInterval } = useAutoRefresh()
  const [open, setOpen] = useState(false)

  async function handleRefreshNow() {
    setOpen(false)
    try {
      const count = await triggerRefresh()
      if (count === 0) {
        toast.success('Already up to date')
      } else {
        toast.success(`${count} new ${count === 1 ? 'item' : 'items'} found`)
      }
    } catch {
      toast.error('Failed to refresh feeds')
    }
  }

  async function handleSetInterval(minutes: number) {
    setOpen(false)
    setRefreshInterval(minutes)
    await updateRefreshInterval(minutes)
    const label = INTERVAL_OPTIONS.find((o) => o.value === minutes)?.label ?? 'Manual only'
    toast.success(`Auto-refresh: ${label}`)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Refresh feeds"
        title="Refresh feeds"
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors"
      >
        <RefreshCwIcon size={18} className={isRefreshing ? 'animate-spin' : ''} aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        <button
          onClick={handleRefreshNow}
          disabled={isRefreshing}
          className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <RefreshCwIcon size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing…' : 'Refresh now'}
        </button>

        <div className="my-1 h-px bg-border" />

        <p className="px-2.5 py-1 text-xs font-medium text-muted-foreground">Auto-refresh</p>

        {INTERVAL_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleSetInterval(value)}
            className={`flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm transition-colors ${
              refreshInterval === value
                ? 'bg-muted text-foreground font-medium'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <CheckIcon
              size={14}
              className={refreshInterval === value ? 'opacity-100' : 'opacity-0'}
              aria-hidden
            />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
