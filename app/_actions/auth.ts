'use server'

import { auth } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signInAction(email: string, password: string) {
  try {
    await auth.api.signInEmail({ body: { email, password } })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Invalid email or password' }
  }
  redirect('/dashboard')
}

export async function signUpAction(name: string, email: string, password: string) {
  try {
    await auth.api.signUpEmail({ body: { name, email, password } })
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Sign up failed. Please try again.' }
  }
  redirect('/dashboard')
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() })
  const cookieStore = await cookies()
  cookieStore.delete('guest-session')
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
