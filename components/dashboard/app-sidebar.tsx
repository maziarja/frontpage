'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookmarkIcon, FolderIcon, LayoutListIcon, RssIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { UserMenu } from '@/components/dashboard/user-menu'

type SidebarUser = { id: string; name: string; email: string } | null
type SidebarFeed = { id: string; title: string }
type SidebarCategory = { id: string; name: string; feeds: SidebarFeed[] }

type AppSidebarProps = {
  user: SidebarUser
  categoriesWithFeeds: SidebarCategory[]
  uncategorizedFeeds: SidebarFeed[]
}

const topNavItems = [
  { label: 'All Items', href: '/dashboard', icon: LayoutListIcon },
  { label: 'Saved', href: '/dashboard/saved', icon: BookmarkIcon },
]

export function AppSidebar({ user, categoriesWithFeeds, uncategorizedFeeds }: AppSidebarProps) {
  const pathname = usePathname()
  const hasContent = categoriesWithFeeds.length > 0 || uncategorizedFeeds.length > 0

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <Link
          href="/dashboard"
          className="text-sidebar-foreground text-lg font-semibold tracking-tight transition-opacity hover:opacity-70"
        >
          Frontpage
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Feeds</SidebarGroupLabel>
          <SidebarGroupContent>
            {!hasContent ? (
              <p className="text-muted-foreground px-2 py-1 text-sm">
                No feeds yet.{' '}
                <Link
                  href="/dashboard/feeds/new"
                  className="hover:text-foreground underline underline-offset-4"
                >
                  Add your first feed →
                </Link>
              </p>
            ) : (
              <SidebarMenu>
                {categoriesWithFeeds.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      render={<Link href={`/dashboard/category/${category.id}`} />}
                      isActive={pathname === `/dashboard/category/${category.id}`}
                      aria-current={
                        pathname === `/dashboard/category/${category.id}` ? 'page' : undefined
                      }
                    >
                      <FolderIcon />
                      <span>{category.name}</span>
                    </SidebarMenuButton>
                    {category.feeds.length > 0 && (
                      <SidebarMenuSub>
                        {category.feeds.map((feed) => (
                          <SidebarMenuSubItem key={feed.id}>
                            <SidebarMenuSubButton
                              render={<Link href={`/dashboard/feed/${feed.id}`} />}
                              isActive={pathname === `/dashboard/feed/${feed.id}`}
                              aria-current={
                                pathname === `/dashboard/feed/${feed.id}` ? 'page' : undefined
                              }
                            >
                              <span>{feed.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}

                {uncategorizedFeeds.length > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton disabled>
                      <RssIcon />
                      <span className="text-muted-foreground">Uncategorized</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      {uncategorizedFeeds.map((feed) => (
                        <SidebarMenuSubItem key={feed.id}>
                          <SidebarMenuSubButton
                            render={<Link href={`/dashboard/feed/${feed.id}`} />}
                            isActive={pathname === `/dashboard/feed/${feed.id}`}
                          >
                            <span>{feed.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <UserMenu user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
