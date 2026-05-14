'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session
}

export async function markItemRead(feedItemId: string): Promise<void> {
  const session = await getSession()
  await db.readState.upsert({
    where: { userId_feedItemId: { userId: session.user.id, feedItemId } },
    create: { userId: session.user.id, feedItemId },
    update: {},
  })
}

export async function markItemUnread(feedItemId: string): Promise<void> {
  const session = await getSession()
  await db.readState.delete({
    where: { userId_feedItemId: { userId: session.user.id, feedItemId } },
  })
}

export async function markFeedRead(feedId: string): Promise<void> {
  const session = await getSession()
  const feed = await db.feed.findFirst({
    where: { id: feedId, userId: session.user.id },
    select: { id: true },
  })
  if (!feed) return

  const items = await db.feedItem.findMany({
    where: { feedId },
    select: { id: true },
  })

  await db.readState.createMany({
    data: items.map((item) => ({ userId: session.user.id, feedItemId: item.id })),
    skipDuplicates: true,
  })
}

export async function markCategoryRead(categoryId: string): Promise<void> {
  const session = await getSession()
  const category = await db.category.findFirst({
    where: { id: categoryId, userId: session.user.id },
    select: { id: true },
  })
  if (!category) return

  const items = await db.feedItem.findMany({
    where: { feed: { categoryId, userId: session.user.id } },
    select: { id: true },
  })

  await db.readState.createMany({
    data: items.map((item) => ({ userId: session.user.id, feedItemId: item.id })),
    skipDuplicates: true,
  })
}

export async function markAllRead(): Promise<void> {
  const session = await getSession()

  const items = await db.feedItem.findMany({
    where: { feed: { userId: session.user.id } },
    select: { id: true },
  })

  await db.readState.createMany({
    data: items.map((item) => ({ userId: session.user.id, feedItemId: item.id })),
    skipDuplicates: true,
  })
}
