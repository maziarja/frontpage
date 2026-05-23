'use client'

import { createContext, useContext, useState } from 'react'

type Value = { open: boolean; setOpen: (open: boolean) => void }

const ShortcutOverlayContext = createContext<Value>({ open: false, setOpen: () => {} })

export function ShortcutOverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <ShortcutOverlayContext.Provider value={{ open, setOpen }}>
      {children}
    </ShortcutOverlayContext.Provider>
  )
}

export function useShortcutOverlay() {
  return useContext(ShortcutOverlayContext)
}
