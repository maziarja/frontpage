import { db } from '@/db'
import { Layout } from '@/lib/generated/prisma/enums'

export async function getUserLayout(userId: string): Promise<Layout> {
  const pref = await db.userPreference.findUnique({ where: { userId } })
  return pref?.layout ?? Layout.STANDARD
}
