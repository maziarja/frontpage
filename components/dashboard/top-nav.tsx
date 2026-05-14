'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheckIcon, LayoutListIcon, RefreshCwIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { markAllRead } from '@/app/_actions/read-state'

export function TopNav() {
  const router = useRouter()
  const { resetAll } = useUnreadCounts()
  const [pending, startTransition] = useTransition()

  function handleMarkAllRead() {
    resetAll()
    startTransition(async () => {
      await markAllRead()
      router.refresh()
    })
  }

  return (
    <header className="text-foreground flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger aria-label="Toggle sidebar" className="-ml-1" />
      <Separator orientation="vertical" className="my-auto h-4" />
      <span className="text-foreground text-sm font-medium">Frontpage</span>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          disabled
          title="Search — coming soon"
        >
          <SearchIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh feeds"
          disabled
          title="Refresh — coming soon"
        >
          <RefreshCwIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Mark all as read"
          onClick={handleMarkAllRead}
          disabled={pending}
          title="Mark all as read"
        >
          <CheckCheckIcon size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Switch layout"
          disabled
          title="Layout — coming soon"
        >
          <LayoutListIcon size={18} />
        </Button>
        <Separator orientation="vertical" className="mx-1 my-auto h-4" />
        <ThemeToggle />
      </div>
    </header>
  )
}
