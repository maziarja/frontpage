'use client'

import { RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NavRefreshButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Refresh feeds"
      disabled
      title="Refresh — coming soon"
      className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
    >
      <RefreshCwIcon size={18} />
    </Button>
  )
}
