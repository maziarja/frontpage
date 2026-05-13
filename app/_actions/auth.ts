'use server'

import { auth } from '@/lib/auth'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signInSchema, signUpSchema } from '@/schemas/auth'

export async function signInAction(email: string, password: string) {
  const parsed = signInSchema.safeParse({ email, password })
  if (!parsed.success) return { error: 'Invalid email or password' }

  try {
    await auth.api.signInEmail({ body: parsed.data })
  } catch {
    return { error: 'Invalid email or password' }
  }
  redirect('/dashboard')
}

export async function signUpAction(name: string, email: string, password: string) {
  const parsed = signUpSchema.safeParse({ name, email, password })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  try {
    await auth.api.signUpEmail({ body: parsed.data })
  } catch {
    return { error: 'Sign up failed. Please try again.' }
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
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  redirect('/dashboard')
}
