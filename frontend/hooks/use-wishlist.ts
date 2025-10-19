import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/auth-context'
import { buyerApi } from '@/lib/api'

export function useWishlist() {
  const { user } = useAuth()
  const [likedProducts, setLikedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Load wishlist from localStorage or Firestore
  const loadWishlist = useCallback(async () => {
    setLoading(true)
    try {
      if (user) {
        // For logged-in users, try to load from Firestore first
        try {
          const firestoreWishlist = await buyerApi.getWishlist(user.userId || user.email)
          setLikedProducts(firestoreWishlist || [])
          
          // Sync localStorage to Firestore if needed
          const localWishlist = JSON.parse(localStorage.getItem('likedProducts') || '[]')
          if (localWishlist.length > 0) {
            const mergedWishlist = [...new Set([...firestoreWishlist, ...localWishlist])]
            await buyerApi.updateWishlist(user.userId || user.email, mergedWishlist)
            setLikedProducts(mergedWishlist)
            localStorage.setItem('likedProducts', JSON.stringify(mergedWishlist))
          }
        } catch (error) {
          console.error('Failed to load Firestore wishlist, falling back to localStorage:', error)
          // Fallback to localStorage
          const localWishlist = JSON.parse(localStorage.getItem('likedProducts') || '[]')
          setLikedProducts(localWishlist)
        }
      } else {
        // For guests, use localStorage only
        const localWishlist = JSON.parse(localStorage.getItem('likedProducts') || '[]')
        setLikedProducts(localWishlist)
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
      setLikedProducts([])
    } finally {
      setLoading(false)
    }
  }, [user])

  // Add product to wishlist
  const addToWishlist = useCallback(async (productId: string) => {
    if (likedProducts.includes(productId)) return

    const newWishlist = [...likedProducts, productId]
    setLikedProducts(newWishlist)
    localStorage.setItem('likedProducts', JSON.stringify(newWishlist))

    // Sync to Firestore if user is logged in
    if (user) {
      try {
        await buyerApi.updateWishlist(user.userId || user.email, newWishlist)
      } catch (error) {
        console.error('Failed to sync wishlist to Firestore:', error)
      }
    }

    window.dispatchEvent(new Event('likedProductsChanged'))
  }, [likedProducts, user])

  // Remove product from wishlist
  const removeFromWishlist = useCallback(async (productId: string) => {
    const newWishlist = likedProducts.filter(id => id !== productId)
    setLikedProducts(newWishlist)
    localStorage.setItem('likedProducts', JSON.stringify(newWishlist))

    // Sync to Firestore if user is logged in
    if (user) {
      try {
        await buyerApi.updateWishlist(user.userId || user.email, newWishlist)
      } catch (error) {
        console.error('Failed to sync wishlist to Firestore:', error)
      }
    }

    window.dispatchEvent(new Event('likedProductsChanged'))
  }, [likedProducts, user])

  // Toggle product in wishlist
  const toggleWishlist = useCallback(async (productId: string) => {
    if (likedProducts.includes(productId)) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }, [likedProducts, addToWishlist, removeFromWishlist])

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId: string) => {
    return likedProducts.includes(productId)
  }, [likedProducts])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  return {
    likedProducts,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    refreshWishlist: loadWishlist,
  }
}
