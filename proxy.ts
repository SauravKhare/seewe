import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE, isAuthenticated } from '@/lib/auth/fake-auth'

export function proxy(request: NextRequest) {
  const authed = isAuthenticated(request.cookies.get(AUTH_COOKIE)?.value)

  if (!authed) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/onboarding/:path*',
    '/dashboard/:path*',
    '/jobs/:path*',
    '/editor/:path*',
    '/resume/:path*',
    '/companies/:path*',
    '/settings/:path*',
  ],
}
