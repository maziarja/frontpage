import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDemoUserId } from '@/lib/demo-user'

export async function requireDashboardSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('guest-session')?.value === 'true'

  if (!session && !isGuest) redirect('/sign-in')

  const demoUserId = isGuest ? await getDemoUserId() : null
  const userId = session?.user.id ?? demoUserId

  return { session, cookieStore, isGuest, userId }
}
