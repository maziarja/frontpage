import { db } from '@/db'
import { Layout } from '@/lib/generated/prisma/enums'

export async function getUserPreferences(userId: string) {
  const pref = await db.userPreference.findUnique({ where: { userId } })
  return {
    layout: pref?.layout ?? Layout.STANDARD,
    onboardingDismissed: pref?.onboardingDismissed ?? false,
    refreshInterval: pref?.refreshInterval ?? 30,
  }
}

export async function getUserLayout(userId: string): Promise<Layout> {
  const pref = await db.userPreference.findUnique({ where: { userId } })
  return pref?.layout ?? Layout.STANDARD
}
