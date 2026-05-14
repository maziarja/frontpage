'use client'

import { createContext, useContext, useState } from 'react'

type Counts = Record<string, number> // feedId → unread count

type ContextValue = {
  counts: Counts
  increment: (feedId: string, amount?: number) => void
  decrement: (feedId: string, amount?: number) => void
  reset: (feedId: string) => void
  resetAll: () => void
}

const UnreadCountContext = createContext<ContextValue | null>(null)

export function UnreadCountProvider({
  initialCounts,
  children,
}: {
  initialCounts: Counts
  children: React.ReactNode
}) {
  const [counts, setCounts] = useState(initialCounts)

  function increment(feedId: string, amount = 1) {
    setCounts((prev) => ({ ...prev, [feedId]: (prev[feedId] ?? 0) + amount }))
  }

  function decrement(feedId: string, amount = 1) {
    setCounts((prev) => ({ ...prev, [feedId]: Math.max(0, (prev[feedId] ?? 0) - amount) }))
  }

  function reset(feedId: string) {
    setCounts((prev) => ({ ...prev, [feedId]: 0 }))
  }

  function resetAll() {
    setCounts((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, 0])))
  }

  return (
    <UnreadCountContext.Provider value={{ counts, increment, decrement, reset, resetAll }}>
      {children}
    </UnreadCountContext.Provider>
  )
}

export function useUnreadCounts() {
  const ctx = useContext(UnreadCountContext)
  if (!ctx) throw new Error('useUnreadCounts must be used within UnreadCountProvider')
  return ctx
}
