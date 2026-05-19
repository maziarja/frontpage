'use client'

import { ThemeProvider } from 'next-themes'
import { GuestProvider } from '@/components/dashboard/guest-context'
import { UnreadCountProvider } from '@/components/dashboard/unread-count-context'
import { LayoutProvider } from '@/components/dashboard/layout-context'
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
  children: React.ReactNode
}

export function DashboardProviders({
  isGuest,
  initialUnreadCounts,
  initialLayout,
  children,
}: DashboardProvidersProps) {
  return (
    <GuestProvider isGuest={isGuest}>
      <UnreadCountProvider initialCounts={initialUnreadCounts}>
        <LayoutProvider initialLayout={initialLayout}>
          {children}
        </LayoutProvider>
      </UnreadCountProvider>
    </GuestProvider>
  )
}
