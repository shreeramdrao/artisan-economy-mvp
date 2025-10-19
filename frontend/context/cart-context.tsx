// frontend/context/cart-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { buyerApi, handleApiError, retryRequest } from '@/lib/api'
import { analytics } from '@/lib/analytics'
import { useAuth } from './auth-context'
import { useToast } from '@/components/ui/use-toast'
import { announceLiveRegion } from '@/lib/aria-utils'
import { queueCartAction, isOffline } from '@/lib/background-sync'

export type CartItem = {
  productId: string
  quantity: number
  title: string
  price: number
  imageUrl: string
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (productId: string, quantity?: number) => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void> // alias
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
  migrateGuestCart: () => Promise<void>
  showConfetti: boolean
  triggerConfetti: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const { user } = useAuth()
  const { toastSuccess, toastError } = useToast()
  
  // Use authenticated user email or fallback to guest
  const buyerId = user?.email || 'guest'

  useEffect(() => {
    refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]) // Refresh cart when user changes

  // Migrate guest cart when user logs in
  useEffect(() => {
    if (user?.email && user?.role === 'buyer') {
      // Check if there's a guest cart to migrate
      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (guestCart.length > 0) {
        migrateGuestCart()
      }
    }
  }, [user?.email, user?.role]) // Trigger when user changes from guest to authenticated

  // ----------------- Refresh Cart -----------------
  const refreshCart = async () => {
    try {
      const items = await buyerApi.getCart(buyerId)

      // 🔹 Enrich cart items with product details
      const enriched = await Promise.all(
        (items || []).map(async (item: any) => {
          try {
            const product = await buyerApi.getProduct(item.productId)
            return {
              productId: item.productId,
              quantity: item.quantity,
              title: product.title || 'Untitled',
              price: product.price || 0,
              imageUrl:
                product.images?.polished ||
                product.images?.enhanced ||
                product.images?.original ||
                '/images/fallback.svg',
            }
          } catch {
            return {
              productId: item.productId,
              quantity: item.quantity,
              title: 'Unknown Product',
              price: 0,
              imageUrl: '/images/fallback.svg',
            }
          }
        })
      )

      setCart(enriched)
      localStorage.setItem('cart', JSON.stringify(enriched))
    } catch (err) {
      console.error('❌ Failed to fetch cart, falling back to localStorage', err)
      const saved = localStorage.getItem('cart')
      if (saved) setCart(JSON.parse(saved))
    }
  }

  // ----------------- Add to Cart -----------------
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      // Check if offline and queue action for background sync
      if (isOffline()) {
        await queueCartAction({
          id: `add-${productId}-${Date.now()}`,
          type: 'add',
          data: { productId, quantity },
          timestamp: Date.now(),
          retryCount: 0
        })
        
        // Optimistic update for offline mode
        const product = await buyerApi.getProduct(productId)
        const next = [...cart]
        const existing = next.find((i) => i.productId === productId)
        if (existing) {
          existing.quantity += quantity
        } else {
          next.push({
            productId,
            quantity,
            title: product.title || 'Untitled',
            price: product.price || 0,
            imageUrl:
              product.images?.polished ||
              product.images?.enhanced ||
              product.images?.original ||
              '/images/fallback.svg',
          })
        }
        setCart(next)
        localStorage.setItem('cart', JSON.stringify(next))
        
        toastSuccess('Added to cart! (Will sync when online)', 'Success')
        announceLiveRegion(`${product.title} added to cart (offline)`)
        triggerConfetti()
        return
      }

      if (buyerId === 'guest') {
        // Use guest cart API with retry
        await retryRequest(() => buyerApi.guest.add({ productId, quantity }))
        const updatedCart = await retryRequest(() => buyerApi.guest.get())
        setCart(updatedCart)
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      } else {
        // Use authenticated cart API with retry
        await retryRequest(() => buyerApi.addToCart(buyerId, productId, quantity))
        await refreshCart()
      }
      
      // Track analytics
      const product = await buyerApi.getProduct(productId)
      analytics.productAddedToCart(productId, product.title, product.price, quantity)
      
      // Show success toast
      toastSuccess('Added to cart!', 'Success')
      
      // Announce to screen readers
      announceLiveRegion(`${product.title} added to cart`)
      
      // Trigger confetti
      triggerConfetti()
    } catch (err) {
      const apiError = handleApiError(err)
      console.error('❌ Failed to add to cart', apiError)

      // Show error toast
      toastError(apiError.message, 'Failed to add to cart')

      // fallback: optimistic local update
      try {
        const product = await buyerApi.getProduct(productId)
        const next = [...cart]
        const existing = next.find((i) => i.productId === productId)
        if (existing) {
          existing.quantity += quantity
        } else {
          next.push({
            productId,
            quantity,
            title: product.title || 'Untitled',
            price: product.price || 0,
            imageUrl:
              product.images?.polished ||
              product.images?.enhanced ||
              product.images?.original ||
              '/images/fallback.svg',
          })
        }
        setCart(next)
        localStorage.setItem('cart', JSON.stringify(next))
        
        // Track analytics and trigger confetti even for fallback
        analytics.productAddedToCart(productId, product.title, product.price, quantity)
        triggerConfetti()
        
        // Show success toast for fallback
        toastSuccess('Added to cart! (offline)', 'Success')
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed', fallbackErr)
      }
    }
  }

  // alias for older code
  const addItem = addToCart

  // ----------------- Remove from Cart -----------------
  const removeFromCart = async (productId: string) => {
    try {
      if (buyerId === 'guest') {
        // Use guest cart API with retry
        await retryRequest(() => buyerApi.guest.remove(productId))
        const updatedCart = await retryRequest(() => buyerApi.guest.get())
        setCart(updatedCart)
        localStorage.setItem('cart', JSON.stringify(updatedCart))
      } else {
        // Use authenticated cart API with retry
        await retryRequest(() => buyerApi.removeFromCart(buyerId, productId))
        await refreshCart()
      }
      
      // Show success toast
      toastSuccess('Removed from cart', 'Success')
      
      // Announce to screen readers
      const item = cart.find(i => i.productId === productId)
      if (item) {
        announceLiveRegion(`${item.title} removed from cart`)
      }
    } catch (err) {
      const apiError = handleApiError(err)
      console.error('❌ Failed to remove from cart', apiError)
      
      // Show error toast
      toastError(apiError.message, 'Failed to remove item')
      
      // Fallback: optimistic local update
      const next = cart.filter((i) => i.productId !== productId)
      setCart(next)
      localStorage.setItem('cart', JSON.stringify(next))
    }
  }

  // ----------------- Clear Cart -----------------
  const clearCart = async () => {
    try {
      for (const item of cart) {
        await buyerApi.removeFromCart(buyerId, item.productId)
      }
      setCart([])
      localStorage.removeItem('cart')
    } catch (err) {
      console.error('❌ Failed to clear cart', err)
      setCart([])
      localStorage.removeItem('cart')
    }
  }

  // ----------------- Confetti -----------------
  // ----------------- Migrate Guest Cart -----------------
  const migrateGuestCart = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (guestCart.length > 0) {
        await buyerApi.guest.migrate({ guestCart })
        localStorage.removeItem('cart')
        await refreshCart()
        console.log('✅ Guest cart migrated successfully')
      }
    } catch (err) {
      console.error('❌ Failed to migrate guest cart', err)
    }
  }

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  const value: CartContextType = {
    cart,
    addToCart,
    addItem,
    removeFromCart,
    clearCart,
    refreshCart,
    migrateGuestCart,
    showConfetti,
    triggerConfetti,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}