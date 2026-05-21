import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { GuestBanner } from '@/components/dashboard/guest-banner'
import { NewItemsBanner } from '@/components/dashboard/new-items-banner'
import { GlobalShortcuts } from '@/components/dashboard/global-shortcuts'
import { DashboardProviders } from '@/components/providers'
import { Layout } from '@/lib/generated/prisma/enums'
import { getLayoutSidebarData } from '@/app/_queries/layout'
import { getUserPreferences } from '@/app/_queries/preferences'
import { requireDashboardSession } from '@/lib/dashboard-session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, isGuest, userId } = await requireDashboardSession()
  const user = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null

  const [{ categoriesWithFeeds, uncategorizedFeeds, initialUnreadCounts }, prefs] =
    await Promise.all([
      getLayoutSidebarData(userId),
      userId && !isGuest
        ? getUserPreferences(userId)
        : Promise.resolve({ layout: Layout.STANDARD, onboardingDismissed: false, refreshInterval: 0 }),
    ])

  return (
    <DashboardProviders
      isGuest={isGuest}
      initialUnreadCounts={initialUnreadCounts ?? {}}
      initialLayout={prefs.layout}
      initialRefreshInterval={prefs.refreshInterval}
    >
      <SidebarProvider>
        <AppSidebar
          user={user}
          categoriesWithFeeds={categoriesWithFeeds}
          uncategorizedFeeds={uncategorizedFeeds}
          isGuest={isGuest}
        />
        <SidebarInset>
          <TopNav />
          {isGuest && <GuestBanner />}
          <NewItemsBanner />
          <GlobalShortcuts />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardProviders>
  )
}
