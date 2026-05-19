'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { FeedHealthStatus } from '@/lib/generated/prisma/client'
import { addFeedSchema, editFeedSchema } from '@/schemas/feed'
import { parseFeedMeta, parseFeed } from '@/lib/feed-parser'

function getFaviconUrl(feedUrl: string): string | undefined {
  try {
    const { hostname } = new URL(feedUrl)
    return `/api/favicon?domain=${encodeURIComponent(hostname)}`
  } catch {
    return undefined
  }
}

export async function addFeed(
  url: string,
  categoryId?: string | null,
): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const parsed = addFeedSchema.safeParse({ url, categoryId })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid URL' }

  const { url: validatedUrl } = parsed.data

  const existing = await db.feed.findFirst({
    where: { userId: session.user.id, url: validatedUrl },
  })
  if (existing) return { error: 'You are already subscribed to this feed' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  let xml: string
  let finalUrl: string
  try {
    const response = await fetch(validatedUrl, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) return { error: `Feed returned HTTP ${response.status}` }
    xml = await response.text()
    finalUrl = response.url
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return { error: isTimeout ? 'Request timed out' : 'Could not reach that URL' }
  } finally {
    clearTimeout(timer)
  }

  let meta
  try {
    meta = parseFeedMeta(xml)
  } catch {
    return { error: 'That URL does not appear to be a valid RSS or Atom feed' }
  }

  const feed = await db.feed.create({
    data: {
      userId: session.user.id,
      url: finalUrl,
      title: meta.title,
      description: meta.description,
      faviconUrl: getFaviconUrl(finalUrl),
      healthStatus: FeedHealthStatus.ACTIVE,
      lastFetchedAt: new Date(),
      categoryId: parsed.data.categoryId ?? null,
    },
  })

  try {
    const items = parseFeed(xml, feed.id)
    if (items.length > 0) {
      await db.feedItem.createMany({
        data: items.map((item) => ({ ...item, feedId: feed.id })),
        skipDuplicates: true,
      })
    }
  } catch {
    // Items failed to parse but feed was created — not fatal, user can retry
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/feed/${feed.id}`)
}

export async function addFeedSilent(
  url: string,
  categoryId?: string | null,
): Promise<{ success: true; feedId: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const parsed = addFeedSchema.safeParse({ url, categoryId })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid URL' }

  const { url: validatedUrl } = parsed.data

  const existing = await db.feed.findFirst({
    where: { userId: session.user.id, url: validatedUrl },
  })
  if (existing) return { error: 'You are already subscribed to this feed' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  let xml: string
  let finalUrl: string
  try {
    const response = await fetch(validatedUrl, { signal: controller.signal, redirect: 'follow' })
    if (!response.ok) return { error: `Feed returned HTTP ${response.status}` }
    xml = await response.text()
    finalUrl = response.url
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return { error: isTimeout ? 'Request timed out' : 'Could not reach that URL' }
  } finally {
    clearTimeout(timer)
  }

  let meta
  try {
    meta = parseFeedMeta(xml)
  } catch {
    return { error: 'That URL does not appear to be a valid RSS or Atom feed' }
  }

  const feed = await db.feed.create({
    data: {
      userId: session.user.id,
      url: finalUrl,
      title: meta.title,
      description: meta.description,
      faviconUrl: getFaviconUrl(finalUrl),
      healthStatus: FeedHealthStatus.ACTIVE,
      lastFetchedAt: new Date(),
      categoryId: parsed.data.categoryId ?? null,
    },
  })

  try {
    const items = parseFeed(xml, feed.id)
    if (items.length > 0) {
      await db.feedItem.createMany({
        data: items.map((item) => ({ ...item, feedId: feed.id })),
        skipDuplicates: true,
      })
    }
  } catch {
    // Items failed to parse — not fatal
  }

  revalidatePath('/dashboard')
  return { success: true, feedId: feed.id }
}

export async function editFeed({
  feedId,
  title,
  categoryId,
}: {
  feedId: string
  title: string
  categoryId?: string | null
}): Promise<{ error: string } | { success: true }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const parsed = editFeedSchema.safeParse({ feedId, title, categoryId })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const feed = await db.feed.findFirst({ where: { id: feedId, userId: session.user.id } })
  if (!feed) return { error: 'Feed not found' }

  await db.feed.update({
    where: { id: feedId },
    data: { title: parsed.data.title, categoryId: parsed.data.categoryId ?? null },
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/feed/${feedId}`)
  return { success: true }
}

export async function deleteFeed(feedId: string): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: 'Unauthorized' }

  const feed = await db.feed.findFirst({ where: { id: feedId, userId: session.user.id } })
  if (!feed) return { error: 'Feed not found' }

  await db.feed.delete({ where: { id: feedId } })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
