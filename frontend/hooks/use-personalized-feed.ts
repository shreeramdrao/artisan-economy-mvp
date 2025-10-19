import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { buyerApi, aiApi } from '@/lib/api'
import { analytics } from '@/lib/analytics'
import { useAuth } from '@/context/auth-context'

interface PersonalizedProduct {
  productId: string
  title: string
  sellerName: string
  category: string
  price: number
  images: {
    polished?: string
    enhanced?: string
    original?: string
  }
  rating: number
  recommendationScore: number
  reason: string
}

interface UserPreferences {
  categories: Record<string, number>
  priceRange: { min: number; max: number }
  wishlistItems: string[]
  viewedProducts: string[]
}

export function usePersonalizedFeed() {
  const { user } = useAuth()
  
  // Get user browsing history for AI recommendations
  const getUserHistory = useCallback(() => {
    if (typeof window === 'undefined') return []
    
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      return events
        .filter((event: any) => event.event === 'product_viewed')
        .map((event: any) => ({
          productId: event.properties?.productId,
          category: event.properties?.category,
          price: event.properties?.price,
          timestamp: event.timestamp
        }))
        .slice(-10) // Last 10 viewed products
    } catch (error) {
      console.error('Failed to parse analytics events:', error)
      return []
    }
  }, [])

  const history = getUserHistory()
  const userId = user?.userId || 'guest'
  
  // Use SWR for caching AI recommendations
  const { data: aiRecommendations, error, isLoading, mutate } = useSWR(
    userId ? ['ai-recommendations', userId, history] : null,
    async () => {
      const recommendations = await aiApi.recommendations({ userId, history })
      return recommendations
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 600000, // 10 minutes cache
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      fallbackData: { aiRecommendations: [] }, // ✅ Fallback to proper structure
    }
  )

  // ✅ Safely extract recommendations array and add console logging
  const recommendationsArray = aiRecommendations?.aiRecommendations || []
  console.log('[AI Feed] Loaded recommendations:', recommendationsArray.length)
  
  // ✅ Ensure recommendationsArray is always an array before mapping
  const products: PersonalizedProduct[] = Array.isArray(recommendationsArray) 
    ? recommendationsArray.map((rec: any) => ({
        productId: rec.id || rec.productId || `rec-${Math.random()}`,
        title: rec.name || rec.title || 'AI Recommended Product',
        sellerName: rec.sellerName || 'AI Recommended',
        category: rec.category || 'handicrafts',
        price: rec.price || 0,
        images: {
          original: rec.imageUrl || '/images/placeholder-product.jpg'
        },
        rating: rec.rating || 4.5, // Default high rating for AI recommendations
        recommendationScore: rec.recommendationScore || 0.9, // High score for AI recommendations
        reason: rec.reason || 'Recommended for you'
      }))
    : []

  return {
    products,
    loading: isLoading,
    error: error?.message || null,
    refresh: mutate
  }
}
