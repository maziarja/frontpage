'use client'

import { createContext, useContext, useState } from 'react'
import { Layout } from '@/lib/generated/prisma/enums'
import { updateLayout } from '@/app/_actions/preferences'

type LayoutContextValue = {
  layout: Layout
  setLayout: (layout: Layout) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({
  initialLayout,
  children,
}: {
  initialLayout: Layout
  children: React.ReactNode
}) {
  const [layout, setLayoutState] = useState(initialLayout)

  function setLayout(next: Layout) {
    setLayoutState(next)
    updateLayout(next)
  }

  return <LayoutContext.Provider value={{ layout, setLayout }}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
