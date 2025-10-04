// ✅ middleware.ts (Final Production-Safe Version)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ✅ Middleware runs in Edge Runtime → No Node.js modules allowed
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isSellerRoute = pathname.startsWith('/seller')
  const isBuyerRoute = pathname.startsWith('/buyer')
  const isAuthRoute =
    pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')

  const token = req.cookies.get('token')?.value
  const authCookie = req.cookies.get('authUser')?.value

  // ✅ If user already logged in → prevent accessing /auth/login or /auth/register
  if (isAuthRoute && token && authCookie) {
    try {
      const user = JSON.parse(authCookie)

      if (user?.role === 'seller') {
        return NextResponse.redirect(new URL('/seller', req.url))
      }
      if (user?.role === 'buyer') {
        return NextResponse.redirect(new URL('/buyer', req.url))
      }
    } catch {
      // Invalid cookie → just continue to auth page
    }
  }

  // ✅ Protect /seller and /buyer routes
  if (isSellerRoute || isBuyerRoute) {
    if (!token || !authCookie) {
      // ❌ Missing token or auth info → redirect to login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const user = JSON.parse(authCookie)

      // ❌ Role mismatch (e.g., buyer opening seller route)
      if (isSellerRoute && user.role !== 'seller') {
        return NextResponse.redirect(new URL('/buyer', req.url))
      }
      if (isBuyerRoute && user.role !== 'buyer') {
        return NextResponse.redirect(new URL('/seller', req.url))
      }

      // ✅ Allow access
      return NextResponse.next()
    } catch (err) {
      console.error('❌ Invalid auth cookie:', err)

      // Clear invalid cookies + force re-login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      const res = NextResponse.redirect(loginUrl)
      res.cookies.delete('token')
      res.cookies.delete('authUser')
      return res
    }
  }

  // ✅ Allow public routes
  return NextResponse.next()
}

// ✅ Apply only for protected and auth routes
export const config = {
  matcher: ['/seller/:path*', '/buyer/:path*', '/auth/login', '/auth/register'],
}