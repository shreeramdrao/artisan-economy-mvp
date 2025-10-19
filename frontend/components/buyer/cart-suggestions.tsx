'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/lib/api'
import { analytics } from '@/lib/analytics'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CartSuggestionsProps {
  cartItems: Array<{
    productId: string
    title: string
    price: number
    category?: string
  }>
}

export default function CartSuggestions({ cartItems }: CartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Debug log for CartSuggestions rendering
  useEffect(() => {
    console.log("✅ [CartSuggestions] rendered")
  }, [])

  useEffect(() => {
    async function fetchSuggestions() {
      if (cartItems.length === 0) {
        setSuggestions([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const allProducts = await buyerApi.getProducts()
        const safeProducts = Array.isArray(allProducts) ? allProducts : []
        
        // Generate suggestions based on cart items
        const suggestedProducts = safeProducts
          .filter((product: any) => {
            // Don't suggest items already in cart
            if (cartItems.some(item => item.productId === product.productId)) {
              return false
            }

            // Check if product matches any cart item's category and price range
            return cartItems.some(cartItem => {
              const categoryMatch = product.category === cartItem.category
              const priceMatch = product.price <= cartItem.price * 1.5 && product.price >= cartItem.price * 0.5
              return categoryMatch && priceMatch
            })
          })
          .sort((a: any, b: any) => {
            // Sort by rating and price similarity
            const aScore = (a.rating || 4.5) * 0.7 + (a.price / 1000) * 0.3
            const bScore = (b.rating || 4.5) * 0.7 + (b.price / 1000) * 0.3
            return bScore - aScore
          })
          .slice(0, 4) // Top 4 suggestions

        setSuggestions(suggestedProducts)
      } catch (error) {
        console.error('Failed to fetch cart suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [cartItems])

  const handleSuggestionClick = (product: any) => {
    // Track analytics
    analytics.trackEvent({
      event: 'cart_suggestion_clicked',
      userId: analytics.userId,
      sessionId: analytics.sessionId,
      timestamp: Date.now(),
      properties: {
        productId: product.productId,
        productTitle: product.title,
        price: product.price,
        category: product.category
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent
    })
  }

  if (loading) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h3 className="text-xl font-bold text-gray-900">Smart Suggestions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">You Might Also Like</h3>
            <p className="text-gray-600 text-sm">Based on your cart items</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suggestions.map((product, index) => (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/buyer/product/${product.productId}`}
                onClick={() => handleSuggestionClick(product)}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-0 rounded-xl group hover:-translate-y-1">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <Image
                      src={
                        product.images?.polished ||
                        product.images?.enhanced ||
                        product.images?.original ||
                        '/images/fallback.svg'
                      }
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* AI Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                      AI Pick
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {formatPrice(product.price)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-xs text-gray-500">{product.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">
            💡 These suggestions are powered by AI and based on your current cart items
          </p>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400 text-purple-700"
            onClick={() => window.location.href = '/buyer'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
