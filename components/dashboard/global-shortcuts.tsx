'use client'

import { useRouter } from 'next/navigation'
import { useSearch } from '@/components/dashboard/search-context'
import { useShortcutOverlay } from '@/components/dashboard/shortcut-overlay-context'
import { useGlobalShortcuts } from '@/components/dashboard/use-global-shortcuts'

export function GlobalShortcuts() {
  const { setOpen: setSearchOpen } = useSearch()
  const { open, setOpen } = useShortcutOverlay()
  const router = useRouter()

  useGlobalShortcuts({
    onOpenSearch: () => setSearchOpen(true),
    onToggleOverlay: () => setOpen(!open),
    router,
  })

  return null
}
