import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

const PROTECTED = ['/dashboard']
const AUTH_PAGES = ['/sign-in', '/sign-up', '/reset-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)
  const guestCookie = request.cookies.get('guest-session')

  const isAuthenticated = !!sessionCookie
  const hasAccess = isAuthenticated || !!guestCookie

  if (isAuthenticated && AUTH_PAGES.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!hasAccess && PROTECTED.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/reset-password'],
}
