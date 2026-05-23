'use client'

import { ThemeProvider } from 'next-themes'
import { GuestProvider } from '@/components/dashboard/guest-context'
import { UnreadCountProvider } from '@/components/dashboard/unread-count-context'
import { LayoutProvider } from '@/components/dashboard/layout-context'
import { AutoRefreshProvider } from '@/components/dashboard/auto-refresh-provider'
import { SearchProvider } from '@/components/dashboard/search-context'
import { ShortcutOverlayProvider } from '@/components/dashboard/shortcut-overlay-context'
import { Layout } from '@/lib/generated/prisma/enums'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}

type DashboardProvidersProps = {
  isGuest: boolean
  initialUnreadCounts: Record<string, number>
  initialLayout: Layout
  initialRefreshInterval: number
  children: React.ReactNode
}

export function DashboardProviders({
  isGuest,
  initialUnreadCounts,
  initialLayout,
  initialRefreshInterval,
  children,
}: DashboardProvidersProps) {
  return (
    <SearchProvider>
      <ShortcutOverlayProvider>
        <GuestProvider isGuest={isGuest}>
          <UnreadCountProvider initialCounts={initialUnreadCounts}>
            <LayoutProvider initialLayout={initialLayout}>
              <AutoRefreshProvider initialRefreshInterval={initialRefreshInterval} isGuest={isGuest}>
                {children}
              </AutoRefreshProvider>
            </LayoutProvider>
          </UnreadCountProvider>
        </GuestProvider>
      </ShortcutOverlayProvider>
    </SearchProvider>
  )
}
