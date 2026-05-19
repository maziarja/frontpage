'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function dismissOnboarding() {
  const cookieStore = await cookies()
  cookieStore.set('onboarding-dismissed', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  revalidatePath('/dashboard')
}
