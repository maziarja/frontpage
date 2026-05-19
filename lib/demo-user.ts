import { db } from '@/db'
import { DEMO_USER_EMAIL } from '@/lib/const'

let cachedId: string | null | undefined = undefined

export async function getDemoUserId(): Promise<string | null> {
  if (cachedId !== undefined) return cachedId
  const user = await db.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  })
  cachedId = user?.id ?? null
  return cachedId
}
