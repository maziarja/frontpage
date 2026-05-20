'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { Layout, Theme } from '@/lib/generated/prisma/enums'

export async function updateTheme(theme: Theme) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await db.userPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, theme },
    update: { theme },
  })
}

export async function updateLayout(layout: Layout) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await db.userPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, layout },
    update: { layout },
  })
}

const VALID_INTERVALS = [0, 15, 30, 60] as const
type RefreshInterval = (typeof VALID_INTERVALS)[number]

export async function updateRefreshInterval(
  intervalMinutes: number,
): Promise<{ error: string } | void> {
  if (!(VALID_INTERVALS as readonly number[]).includes(intervalMinutes)) {
    return { error: 'Invalid interval' }
  }
  const interval = intervalMinutes as RefreshInterval
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  await db.userPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, refreshInterval: interval },
    update: { refreshInterval: interval },
  })
}
