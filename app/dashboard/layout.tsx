import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { GuestBanner } from '@/components/dashboard/guest-banner'
import { UnreadCountProvider } from '@/components/dashboard/unread-count-context'
import { LayoutProvider } from '@/components/dashboard/layout-context'
import { Layout } from '@/lib/generated/prisma/enums'
import { getLayoutSidebarData } from '@/app/_queries/layout'
import { getUserLayout } from '@/app/_queries/preferences'
import { requireDashboardSession } from '@/lib/dashboard-session'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, isGuest, userId } = await requireDashboardSession()
  const user = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null

  const [{ categoriesWithFeeds, uncategorizedFeeds, initialUnreadCounts }, initialLayout] =
    await Promise.all([
      getLayoutSidebarData(userId),
      userId && !isGuest ? getUserLayout(userId) : Promise.resolve(Layout.STANDARD),
    ])

  return (
    <UnreadCountProvider initialCounts={initialUnreadCounts ?? {}}>
      <LayoutProvider initialLayout={initialLayout}>
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
            <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </UnreadCountProvider>
  )
}
