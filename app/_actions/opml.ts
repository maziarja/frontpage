'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { parseOpml } from '@/lib/opml-parser'
import { addFeedSilent } from '@/app/_actions/feed'

export type PreviewFeed = { title: string; xmlUrl: string; isDuplicate: boolean }
export type PreviewCategory = { name: string; feeds: PreviewFeed[] }
export type OpmlPreviewResult = {
  categories: PreviewCategory[]
  uncategorized: PreviewFeed[]
  totalFeeds: number
  newCount: number
  dupCount: number
}
export type ImportResult = { imported: number; skipped: number; failed: number }

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function parseOpmlPreview(
  content: string,
): Promise<{ error: string } | OpmlPreviewResult> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const { categories: parsedCats, uncategorized: parsedUncategorized } = parseOpml(content)

  const existingUrls = new Set(
    (await db.feed.findMany({ where: { userId: session.user.id }, select: { url: true } })).map(
      (f) => f.url,
    ),
  )

  function markDuplicates(feeds: { title: string; xmlUrl: string }[]): PreviewFeed[] {
    return feeds.map((f) => ({ ...f, isDuplicate: existingUrls.has(f.xmlUrl) }))
  }

  const categories: PreviewCategory[] = parsedCats.map((c) => ({
    name: c.name,
    feeds: markDuplicates(c.feeds),
  }))
  const uncategorized = markDuplicates(parsedUncategorized)

  const allFeeds = [...categories.flatMap((c) => c.feeds), ...uncategorized]
  const dupCount = allFeeds.filter((f) => f.isDuplicate).length

  return {
    categories,
    uncategorized,
    totalFeeds: allFeeds.length,
    newCount: allFeeds.length - dupCount,
    dupCount,
  }
}

export async function importOpml(
  content: string,
): Promise<{ error: string } | ImportResult> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  const userId = session.user.id
  const { categories: parsedCats, uncategorized: parsedUncategorized } = parseOpml(content)

  const existingUrls = new Set(
    (await db.feed.findMany({ where: { userId }, select: { url: true } })).map((f) => f.url),
  )

  // Get or create a category by name, returning its id
  async function getOrCreateCategory(name: string): Promise<string> {
    const existing = await db.category.findFirst({ where: { userId, name } })
    if (existing) return existing.id
    const maxOrder = await db.category.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const created = await db.category.create({
      data: { userId, name, order: (maxOrder?.order ?? -1) + 1 },
    })
    return created.id
  }

  type FeedJob = { xmlUrl: string; categoryId: string | null }
  const jobs: FeedJob[] = []
  let skipped = 0

  for (const cat of parsedCats) {
    let categoryId: string | null = null
    const newFeeds = cat.feeds.filter((f) => !existingUrls.has(f.xmlUrl))
    if (newFeeds.length > 0) {
      categoryId = await getOrCreateCategory(cat.name)
    }
    for (const feed of cat.feeds) {
      if (existingUrls.has(feed.xmlUrl)) { skipped++; continue }
      jobs.push({ xmlUrl: feed.xmlUrl, categoryId })
    }
  }

  for (const feed of parsedUncategorized) {
    if (existingUrls.has(feed.xmlUrl)) { skipped++; continue }
    jobs.push({ xmlUrl: feed.xmlUrl, categoryId: null })
  }

  const results = await Promise.allSettled(
    jobs.map((job) => addFeedSilent(job.xmlUrl, job.categoryId)),
  )

  let imported = 0
  let failed = 0
  for (const result of results) {
    if (result.status === 'fulfilled' && 'success' in result.value) imported++
    else failed++
  }

  revalidatePath('/dashboard', 'layout')
  return { imported, skipped, failed }
}
