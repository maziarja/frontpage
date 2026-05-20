'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { refreshAllFeeds } from '@/app/_actions/feed'

type AutoRefreshContextValue = {
  newItemCount: number
  isRefreshing: boolean
  refreshInterval: number
  triggerRefresh: () => Promise<number>
  clearBanner: () => void
  setRefreshInterval: (minutes: number) => void
}

const AutoRefreshContext = createContext<AutoRefreshContextValue>({
  newItemCount: 0,
  isRefreshing: false,
  refreshInterval: 30,
  triggerRefresh: async () => 0,
  clearBanner: () => {},
  setRefreshInterval: () => {},
})

export function useAutoRefresh() {
  return useContext(AutoRefreshContext)
}

type Props = {
  children: React.ReactNode
  initialRefreshInterval: number
  isGuest: boolean
}

export function AutoRefreshProvider({ children, initialRefreshInterval, isGuest }: Props) {
  const [newItemCount, setNewItemCount] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshInterval, setRefreshIntervalState] = useState(initialRefreshInterval)
  const isRefreshingRef = useRef(false)

  const runRefresh = useCallback(
    async (addToBanner: boolean): Promise<number> => {
      if (isRefreshingRef.current || isGuest) return 0
      isRefreshingRef.current = true
      setIsRefreshing(true)
      try {
        const { newItemCount: count } = await refreshAllFeeds()
        if (addToBanner && count > 0) setNewItemCount((prev) => prev + count)
        return count
      } finally {
        isRefreshingRef.current = false
        setIsRefreshing(false)
      }
    },
    [isGuest],
  )

  // Auto-refresh timer — adds to banner
  useEffect(() => {
    if (isGuest || refreshInterval === 0) return
    const ms = refreshInterval * 60 * 1000
    const id = setInterval(() => void runRefresh(true), ms)
    return () => clearInterval(id)
  }, [isGuest, refreshInterval, runRefresh])

  // Manual trigger — returns count for caller to show toast, does not add to banner
  const triggerRefresh = useCallback(() => runRefresh(false), [runRefresh])

  const clearBanner = useCallback(() => setNewItemCount(0), [])

  const setRefreshInterval = useCallback((minutes: number) => {
    setRefreshIntervalState(minutes)
  }, [])

  return (
    <AutoRefreshContext.Provider
      value={{ newItemCount, isRefreshing, refreshInterval, triggerRefresh, clearBanner, setRefreshInterval }}
    >
      {children}
    </AutoRefreshContext.Provider>
  )
}
