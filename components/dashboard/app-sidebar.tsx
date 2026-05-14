'use client'

import { useState } from 'react'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookmarkIcon,
  ChevronRightIcon,
  FolderIcon,
  LayoutListIcon,
  PlusIcon,
  RssIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
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
import { AddFeedModal } from '@/components/dashboard/add-feed-modal'

type SidebarUser = { id: string; name: string; email: string } | null
type SidebarFeed = {
  id: string
  title: string
  healthStatus: string
  faviconUrl: string | null
}
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

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="text-muted-foreground ml-auto shrink-0 text-xs">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function AppSidebar({ user, categoriesWithFeeds, uncategorizedFeeds }: AppSidebarProps) {
  const pathname = usePathname()
  const { counts } = useUnreadCounts()
  const hasContent = categoriesWithFeeds.length > 0 || uncategorizedFeeds.length > 0
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [uncategorizedOpen, setUncategorizedOpen] = useState(true)

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
          <SidebarGroupAction onClick={() => setAddFeedOpen(true)} aria-label="Add feed">
            <PlusIcon />
          </SidebarGroupAction>
          <AddFeedModal open={addFeedOpen} onOpenChange={setAddFeedOpen} />
          <SidebarGroupContent>
            {!hasContent ? (
              <p className="text-muted-foreground px-2 py-1 text-sm">
                No feeds yet. Click <PlusIcon size={12} className="inline" aria-hidden /> to add
                one.
              </p>
            ) : (
              <SidebarMenu>
                {categoriesWithFeeds.map((category) => {
                  const categoryUnread = category.feeds.reduce(
                    (sum, f) => sum + (counts[f.id] ?? 0),
                    0,
                  )
                  return (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        render={<Link href={`/dashboard/category/${category.id}`} />}
                        isActive={pathname === `/dashboard/category/${category.id}`}
                        aria-current={
                          pathname === `/dashboard/category/${category.id}` ? 'page' : undefined
                        }
                      >
                        <FolderIcon />
                        <span className="flex-1 truncate">{category.name}</span>
                        <UnreadBadge count={categoryUnread} />
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
                                <FeedFavicon src={feed.faviconUrl} />
                                <span className="flex-1 truncate">{feed.title}</span>
                                {feed.healthStatus === 'ERROR' ? (
                                  <span
                                    className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-500"
                                    aria-label="Feed error"
                                  />
                                ) : (
                                  <UnreadBadge count={counts[feed.id] ?? 0} />
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  )
                })}

                {uncategorizedFeeds.length > 0 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setUncategorizedOpen((v) => !v)}>
                      <RssIcon />
                      <span className="flex-1 truncate">Uncategorized</span>
                      <UnreadBadge
                        count={uncategorizedFeeds.reduce((sum, f) => sum + (counts[f.id] ?? 0), 0)}
                      />
                      <ChevronRightIcon
                        size={14}
                        className={`shrink-0 transition-transform duration-200 ${uncategorizedOpen ? 'rotate-90' : ''}`}
                        aria-hidden="true"
                      />
                    </SidebarMenuButton>
                    {uncategorizedOpen && (
                      <SidebarMenuSub>
                        {uncategorizedFeeds.map((feed) => (
                          <SidebarMenuSubItem key={feed.id}>
                            <SidebarMenuSubButton
                              render={<Link href={`/dashboard/feed/${feed.id}`} />}
                              isActive={pathname === `/dashboard/feed/${feed.id}`}
                            >
                              <FeedFavicon src={feed.faviconUrl} />
                              <span className="flex-1 truncate">{feed.title}</span>
                              {feed.healthStatus === 'ERROR' ? (
                                <span
                                  className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-500"
                                  aria-label="Feed error"
                                />
                              ) : (
                                <UnreadBadge count={counts[feed.id] ?? 0} />
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
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
