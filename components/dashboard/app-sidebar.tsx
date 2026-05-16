'use client'

import { useState } from 'react'
import { FeedFavicon } from '@/components/dashboard/feed-favicon'
import { useUnreadCounts } from '@/components/dashboard/unread-count-context'
import { SortableCategoryList } from '@/components/dashboard/sortable-category-list'
import { CreateCategoryModal } from '@/components/dashboard/create-category-modal'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlertCircleIcon,
  BookmarkIcon,
  ChevronRightIcon,
  FolderPlusIcon,
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
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [uncategorizedOpen, setUncategorizedOpen] = useState(true)

  const allFeeds = [...categoriesWithFeeds.flatMap((c) => c.feeds), ...uncategorizedFeeds]
  const erroringCount = allFeeds.filter((f) => f.healthStatus === 'ERROR').length

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
          <SidebarGroupLabel>
            My Feeds
            {erroringCount > 0 && (
              <span
                className="ml-1 flex items-center gap-0.5 text-xs text-destructive"
                aria-label={`${erroringCount} feed${erroringCount !== 1 ? 's' : ''} with errors`}
              >
                <AlertCircleIcon size={11} aria-hidden="true" />
                {erroringCount}
              </span>
            )}
          </SidebarGroupLabel>
          <SidebarGroupAction onClick={() => setAddFeedOpen(true)} aria-label="Add feed">
            <PlusIcon />
          </SidebarGroupAction>
          <AddFeedModal
            open={addFeedOpen}
            onOpenChange={setAddFeedOpen}
            categories={categoriesWithFeeds}
          />
          <SidebarGroupContent>
            {!hasContent ? (
              <p className="text-muted-foreground px-2 py-1 text-sm">
                No feeds yet. Click <PlusIcon size={12} className="inline" aria-hidden /> to add one.
              </p>
            ) : (
              <>
                <SortableCategoryList initialCategories={categoriesWithFeeds} />

                {uncategorizedFeeds.length > 0 && (
                  <SidebarMenu>
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
                                  <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-500" aria-label="Feed error" />
                                ) : (
                                  <UnreadBadge count={counts[feed.id] ?? 0} />
                                )}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  </SidebarMenu>
                )}

                {/* New category button */}
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setAddCategoryOpen(true)}
                      className="text-muted-foreground/70 hover:text-muted-foreground"
                    >
                      <FolderPlusIcon />
                      <span>New category</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <CreateCategoryModal open={addCategoryOpen} onOpenChange={setAddCategoryOpen} />
              </>
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
