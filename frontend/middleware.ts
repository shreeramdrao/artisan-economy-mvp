// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isSellerRoute = pathname.startsWith('/seller')
  const isBuyerRoute = pathname.startsWith('/buyer')

  if (isSellerRoute || isBuyerRoute) {
    const authCookie = req.cookies.get('authUser')?.value

    if (!authCookie) {
      // ❌ Not logged in → send to login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const user = JSON.parse(authCookie)

      // ❌ Role mismatch → redirect to correct portal
      if (isSellerRoute && user.role !== 'seller') {
        return NextResponse.redirect(new URL('/buyer', req.url))
      }
      if (isBuyerRoute && user.role !== 'buyer') {
        return NextResponse.redirect(new URL('/seller', req.url))
      }
    } catch (err) {
      console.error('❌ Invalid auth cookie:', err)
      // Clear invalid cookie + force re-login
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      const res = NextResponse.redirect(loginUrl)
      res.cookies.delete('authUser')
      return res
    }
  }

  return NextResponse.next()
}

// ✅ Apply only for these routes
export const config = {
  matcher: ['/seller/:path*', '/buyer/:path*'],
}