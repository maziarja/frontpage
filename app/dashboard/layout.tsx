import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'
import { UnreadCountProvider } from '@/components/dashboard/unread-count-context'
import { getLayoutSidebarData } from '@/app/_queries/layout'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'

  if (!session && !isGuest) redirect('/sign-in')

  const userId = session?.user.id ?? null
  const user = session
    ? { id: session.user.id, name: session.user.name, email: session.user.email }
    : null

  const { categoriesWithFeeds, uncategorizedFeeds, initialUnreadCounts } =
    await getLayoutSidebarData(userId)
  return (
    <UnreadCountProvider initialCounts={initialUnreadCounts ?? {}}>
      <SidebarProvider>
        <AppSidebar
          user={user}
          categoriesWithFeeds={categoriesWithFeeds}
          uncategorizedFeeds={uncategorizedFeeds}
        />
        <SidebarInset>
          <TopNav />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </UnreadCountProvider>
  )
}
