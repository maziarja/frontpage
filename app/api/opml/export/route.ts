import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response('Unauthorized', { status: 401 })

  const feeds = await db.feed.findMany({
    where: { userId: session.user.id },
    select: {
      url: true,
      title: true,
      category: { select: { name: true } },
    },
    orderBy: [{ category: { name: 'asc' } }, { title: 'asc' }],
  })

  // Group by category
  const categoryMap = new Map<string | null, typeof feeds>()
  for (const feed of feeds) {
    const key = feed.category?.name ?? null
    if (!categoryMap.has(key)) categoryMap.set(key, [])
    categoryMap.get(key)!.push(feed)
  }

  function feedOutline(feed: { title: string; url: string }): string {
    return `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.url)}" />`
  }

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<opml version="2.0">',
    '  <head>',
    `    <title>My Feeds — Frontpage</title>`,
    `    <dateCreated>${new Date().toISOString()}</dateCreated>`,
    '  </head>',
    '  <body>',
  ]

  for (const [categoryName, categoryFeeds] of categoryMap) {
    if (categoryName !== null) {
      lines.push(`    <outline text="${escapeXml(categoryName)}" title="${escapeXml(categoryName)}">`)
      for (const feed of categoryFeeds) lines.push(feedOutline(feed))
      lines.push('    </outline>')
    }
  }

  // Uncategorized feeds directly in body
  const uncategorized = categoryMap.get(null) ?? []
  for (const feed of uncategorized) lines.push(`  ${feedOutline(feed).trimStart()}`)

  lines.push('  </body>', '</opml>')

  const xml = lines.join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'text/x-opml; charset=UTF-8',
      'Content-Disposition': 'attachment; filename="frontpage-feeds.opml"',
    },
  })
}
