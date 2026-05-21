'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearch } from '@/components/dashboard/search-context'
import { useGlobalShortcuts } from '@/components/dashboard/use-global-shortcuts'
import { KeyboardShortcutOverlay } from '@/components/dashboard/keyboard-shortcut-overlay'

export function GlobalShortcuts() {
  const { setOpen: setSearchOpen } = useSearch()
  const [overlayOpen, setOverlayOpen] = useState(false)
  const router = useRouter()

  useGlobalShortcuts({
    onOpenSearch: () => setSearchOpen(true),
    onToggleOverlay: () => setOverlayOpen((prev) => !prev),
    router,
  })

  return <KeyboardShortcutOverlay open={overlayOpen} onOpenChange={setOverlayOpen} />
}
