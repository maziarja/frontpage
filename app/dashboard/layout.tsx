import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopNav } from '@/components/dashboard/top-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'

  if (!session && !isGuest) redirect('/sign-in')

  const userId = session?.user.id ?? null

  const [categoriesWithFeeds, uncategorizedFeeds] = userId
    ? await Promise.all([
        db.category.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            feeds: {
              select: { id: true, title: true },
              orderBy: { title: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        }),
        db.feed.findMany({
          where: { userId, categoryId: null },
          select: { id: true, title: true },
          orderBy: { title: 'asc' },
        }),
      ])
    : [[], []]

  const user = session
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }
    : null

  return (
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
  )
}
