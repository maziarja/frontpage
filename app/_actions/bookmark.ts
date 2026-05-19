'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'

async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function saveItem(feedItemId: string): Promise<void> {
  const session = await getSession()
  if (!session) return
  await db.bookmark.upsert({
    where: { userId_feedItemId: { userId: session.user.id, feedItemId } },
    create: { userId: session.user.id, feedItemId },
    update: {},
  })
}

export async function unsaveItem(feedItemId: string): Promise<void> {
  const session = await getSession()
  if (!session) return
  await db.bookmark.delete({
    where: { userId_feedItemId: { userId: session.user.id, feedItemId } },
  })
}
