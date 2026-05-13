import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up', '/reset-password', '/api/auth']
const AUTH_PAGES = ['/sign-in', '/sign-up', '/reset-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const guestCookie = request.cookies.get('guest-session')

  const isAuthenticated = !!sessionCookie
  const isGuest = guestCookie?.value === 'true'
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (isAuthenticated && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublic && !isAuthenticated && !isGuest) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
}
