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
