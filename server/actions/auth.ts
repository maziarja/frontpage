'use server'

import { auth } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOut() {
  await auth.api.signOut({ headers: await headers() })
  redirect('/sign-in')
}

export async function startGuestSession() {
  const cookieStore = await cookies()
  cookieStore.set('guest-session', 'true', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  redirect('/dashboard')
}
