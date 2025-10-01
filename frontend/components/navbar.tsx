'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { useCart } from '@/context/cart-context'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { cart } = useCart()

  const [likedCount, setLikedCount] = useState(0)

  // ✅ Sync liked count from localStorage
  useEffect(() => {
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
          onClick={() => router.push('/')}
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
                onClick={() => router.push('/buyer/artisans')}
              >
                Artisans
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/buyer/orders')}
              >
                My Orders
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.push('/buyer/liked')}
              >
                ❤️ Liked ({likedCount})
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/buyer/cart')}
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
                onClick={() => router.push('/seller')}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/seller/upload')}
              >
                Upload Product
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/seller/products')}
              >
                My Products
              </Button>

              {/* Quick access for seller payments */}
              <Button
                variant="ghost"
                onClick={() => router.push('/seller/payments')}
              >
                💰 Payments
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/seller/profile')}
              >
                👤 Profile
              </Button>
            </>
          )}

          {/* Auth actions */}
          {!user ? (
            <>
              <Button onClick={() => router.push('/auth/login')}>Login</Button>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/register')}
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