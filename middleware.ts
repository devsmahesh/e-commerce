import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  // Admin routes - require authentication (admin role check happens client-side)
  if (pathname.startsWith('/admin')) {
    if (!accessToken) {
      // No token, redirect to home immediately
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    // Token exists, let client-side handle admin role verification
    return NextResponse.next()
  }

  // Protected routes - require authentication
  const protectedRoutes = ['/profile', '/orders', '/wishlist', '/checkout']
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  if (isProtectedRoute && !accessToken) {
    // No token, redirect to home immediately
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

