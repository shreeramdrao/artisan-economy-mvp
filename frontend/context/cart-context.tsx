// frontend/context/cart-context.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { buyerApi } from '@/lib/api'

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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const buyerId = 'buyer123' // TODO: replace with real user ID when auth is ready

  useEffect(() => {
    refreshCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                '/placeholder.png',
            }
          } catch {
            return {
              productId: item.productId,
              quantity: item.quantity,
              title: 'Unknown Product',
              price: 0,
              imageUrl: '/placeholder.png',
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
      await buyerApi.addToCart(buyerId, productId, quantity)
      await refreshCart()
    } catch (err) {
      console.error('❌ Failed to add to cart', err)

      // fallback: optimistic local update
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
            '/placeholder.png',
        })
      }
      setCart(next)
      localStorage.setItem('cart', JSON.stringify(next))
    }
  }

  // alias for older code
  const addItem = addToCart

  // ----------------- Remove from Cart -----------------
  const removeFromCart = async (productId: string) => {
    try {
      await buyerApi.removeFromCart(buyerId, productId)
      await refreshCart()
    } catch (err) {
      console.error('❌ Failed to remove from cart', err)
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

  const value: CartContextType = {
    cart,
    addToCart,
    addItem,
    removeFromCart,
    clearCart,
    refreshCart,
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