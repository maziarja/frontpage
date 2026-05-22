'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/dashboard/theme-toggle'
import { LayoutSwitcher } from '@/components/dashboard/layout-switcher'
import { MarkAllReadButton } from '@/components/dashboard/mark-all-read-button'
import { NavSearchButton } from '@/components/dashboard/nav-search-button'
import { NavRefreshButton } from '@/components/dashboard/nav-refresh-button'
import { NavAddFeedButton } from '@/components/dashboard/nav-add-feed-button'

type Category = { id: string; name: string }

export function TopNav({ categories }: { categories: Category[] }) {
  return (
    <header className="text-foreground flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger aria-label="Toggle sidebar" className="-ml-1" />
      <NavAddFeedButton categories={categories} />

      <div className="ml-auto flex items-center gap-1">
        <NavSearchButton />
        <NavRefreshButton />
        <MarkAllReadButton />
        <LayoutSwitcher />
        <Separator orientation="vertical" className="mx-1 my-auto h-4" />
        <ThemeToggle />
      </div>
    </header>
  )
}
