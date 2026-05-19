'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/db'

export async function dismissOnboarding() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return

  await db.userPreference.upsert({
    where: { userId: session.user.id },
    update: { onboardingDismissed: true },
    create: { userId: session.user.id, onboardingDismissed: true },
  })

  revalidatePath('/dashboard')
}
