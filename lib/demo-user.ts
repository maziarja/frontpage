import { db } from '@/db'

const DEMO_EMAIL = 'demo@frontpage.internal'

let cachedId: string | null | undefined = undefined

export async function getDemoUserId(): Promise<string | null> {
  if (cachedId !== undefined) return cachedId
  const user = await db.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true },
  })
  cachedId = user?.id ?? null
  return cachedId
}
