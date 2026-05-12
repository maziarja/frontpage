'use client'

import { AuthProvider } from '@better-auth-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <AuthProvider
      authClient={authClient}
      Link={NextLink}
      navigate={({ to, replace }) => (replace ? router.replace(to) : router.push(to))}
      basePaths={{ auth: '' }}
      viewPaths={{ auth: { forgotPassword: 'reset-password' } }}
      redirectTo="/dashboard"
    >
      {children}
    </AuthProvider>
  )
}
