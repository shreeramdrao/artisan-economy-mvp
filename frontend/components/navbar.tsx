'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useCart } from '@/context/cart-context'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const { cart } = useCart()

  const [likedCount, setLikedCount] = useState(0)
  const [isRouterReady, setIsRouterReady] = useState(false)

  // ✅ Ensure router is ready and sync liked count from localStorage
  useEffect(() => {
    // Mark router as ready after component mounts
    setIsRouterReady(true)
    
    const updateLikedCount = () => {
      try {
        const likedIds: string[] = JSON.parse(
          localStorage.getItem('likedProducts') || '[]'
        )
        setLikedCount(likedIds.length)
      } catch {
        setLikedCount(0)
      }
    }

    updateLikedCount()
    window.addEventListener('likedProductsChanged', updateLikedCount)
    return () => {
      window.removeEventListener('likedProductsChanged', updateLikedCount)
    }
  }, [])


  // ✅ Safe navigation helper
  const safeNavigate = (path: string) => {
    if (isRouterReady && router) {
      try {
        router.push(path as any)
      } catch (error) {
        console.error('Navigation error:', error)
        // Fallback to window.location if router fails
        window.location.href = path
      }
    }
  }

  // ✅ Decide portal label
  let portalLabel = 'Marketplace'
  if (pathname.startsWith('/buyer')) {
    portalLabel = 'Buyer Portal'
  } else if (pathname.startsWith('/seller')) {
    portalLabel = 'Seller Portal'
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + Dynamic Portal Label */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => safeNavigate('/')}
        >
          <span className="text-2xl">🪔</span>
          <span className="text-xl font-bold text-orange-600">
            Artisan Economy
          </span>
          <span className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded">
            {portalLabel}
          </span>
        </div>

        {/* ✅ Dynamic Links */}
        <div className="flex items-center space-x-4">
          {/* Landing page links */}
          {pathname === '/' && (
            <>
              <a href="#about">
                <Button variant="ghost">About</Button>
              </a>
              <a href="#contact">
                <Button variant="ghost">Contact</Button>
              </a>
            </>
          )}

          {/* Buyer portal links */}
          {pathname.startsWith('/buyer') && user?.role === 'buyer' && (
            <>
              <Button
                variant="ghost"
                onClick={() => safeNavigate('/buyer/artisans')}
              >
                Artisans
              </Button>

              <Button
                variant="ghost"
                onClick={() => safeNavigate('/buyer/orders')}
              >
                My Orders
              </Button>

              <Button
                variant="ghost"
                onClick={() => safeNavigate('/buyer/liked')}
              >
                ❤️ Liked ({likedCount})
              </Button>
              <Button
                variant="outline"
                onClick={() => safeNavigate('/buyer/cart')}
              >
                🛒 Cart ({cart?.length || 0})
              </Button>
            </>
          )}

          {/* Seller portal links */}
          {pathname.startsWith('/seller') && user?.role === 'seller' && (
            <>
              <Button
                variant="ghost"
                onClick={() => safeNavigate('/seller')}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => safeNavigate('/seller/upload')}
              >
                Upload Product
              </Button>
              <Button
                variant="ghost"
                onClick={() => safeNavigate('/seller/products')}
              >
                My Products
              </Button>

              {/* Quick access for seller payments */}
              <Button
                variant="ghost"
                onClick={() => safeNavigate('/seller/payments')}
              >
                💰 Payments
              </Button>

              <Button
                variant="outline"
                onClick={() => safeNavigate('/seller/profile')}
              >
                👤 Profile
              </Button>
            </>
          )}

          {/* Auth actions */}
          {loading && !isRouterReady ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : !user ? (
            <>
              <Button 
                onClick={() => safeNavigate('/auth/login')}
                disabled={!isRouterReady}
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => safeNavigate('/auth/register')}
                disabled={!isRouterReady}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600">
                Hi, {user.name || 'User'}
              </span>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}