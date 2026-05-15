import { db } from '@/db'

export async function getLayoutSidebarData(userId: string | null) {
  if (!userId) return { categoriesWithFeeds: [], uncategorizedFeeds: [] }

  const [categoriesWithFeeds, uncategorizedFeeds] = await Promise.all([
    db.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        feeds: {
          select: {
            id: true,
            title: true,
            healthStatus: true,
            faviconUrl: true,
            _count: {
              select: { items: { where: { readStates: { none: { userId } } } } },
            },
          },
          orderBy: { title: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    }),
    db.feed.findMany({
      where: { userId, categoryId: null },
      select: {
        id: true,
        title: true,
        healthStatus: true,
        faviconUrl: true,
        _count: {
          select: { items: { where: { readStates: { none: { userId } } } } },
        },
      },
      orderBy: { title: 'asc' },
    }),
  ])

  const normalizeFeed = (feed: {
    id: string
    title: string
    healthStatus: string
    faviconUrl: string | null
    _count: { items: number }
  }) => ({
    id: feed.id,
    title: feed.title,
    healthStatus: feed.healthStatus,
    faviconUrl: feed.faviconUrl,
    unreadCount: feed._count.items,
  })

  const normalizedCategories = categoriesWithFeeds.map((cat) => ({
    id: cat.id,
    name: cat.name,
    feeds: cat.feeds.map(normalizeFeed),
  }))

  const normalizedUncategorized = uncategorizedFeeds.map(normalizeFeed)

  const allFeeds = [...normalizedCategories.flatMap((c) => c.feeds), ...normalizedUncategorized]

  return {
    categoriesWithFeeds: normalizedCategories,
    uncategorizedFeeds: normalizedUncategorized,
    initialUnreadCounts: Object.fromEntries(allFeeds.map((f) => [f.id, f.unreadCount])),
  }
}
