'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { buyerApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { Sparkles, Star } from 'lucide-react'

interface AIRecommendationsProps {
  currentProduct: {
    productId: string
    category: string
    price: number
    sellerName?: string
  }
}

export default function AIRecommendations({ currentProduct }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Debug log for AIRecommendations rendering
  useEffect(() => {
    console.log("✅ [AIRecommendations] rendered")
  }, [])

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // Get all products with defensive guard
        const allProducts = await buyerApi.getProducts()
        const safeProducts = Array.isArray(allProducts) ? allProducts : []
        
        // Filter out current product and create recommendations
        const otherProducts = safeProducts.filter(
          (p: any) => p.productId !== currentProduct.productId
        )

        // AI-based recommendation logic
        const scoredProducts = otherProducts.map((product: any) => {
          let score = 0

          // Category match (highest weight)
          if (product.category === currentProduct.category) {
            score += 50
          }

          // Price range similarity (within 30% of current price)
          const priceDiff = Math.abs(product.price - currentProduct.price)
          const priceSimilarity = 1 - (priceDiff / currentProduct.price)
          if (priceSimilarity > 0.7) {
            score += 30
          } else if (priceSimilarity > 0.5) {
            score += 15
          }

          // Same seller (bonus)
          if (product.sellerName === currentProduct.sellerName) {
            score += 20
          }

          // Rating bonus
          if (product.rating && product.rating >= 4.5) {
            score += 10
          } else if (product.rating && product.rating >= 4.0) {
            score += 5
          }

          return { ...product, recommendationScore: score }
        })

        // Sort by score and take top 4
        const topRecommendations = scoredProducts
                  .sort((a: any, b: any) => b.recommendationScore - a.recommendationScore)
          .slice(0, 4)

        setRecommendations(topRecommendations)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentProduct])

  if (loading) {
    return (
      <div className="border-t border-gray-200 pt-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">AI Recommendations</h2>
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Finding similar products...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 bg-white/80 backdrop-blur-sm border-0 rounded-2xl animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 pt-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">AI Recommendations</h2>
          <Sparkles className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-gray-600 text-lg">Based on your interest in {currentProduct.category}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <Link key={product.productId} href={`/buyer/product/${product.productId}`}>
            <Card className="overflow-hidden hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 cursor-pointer bg-white/90 backdrop-blur-sm border-0 rounded-2xl group hover:-translate-y-2 hover:scale-[1.02]">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <Image
                  src={
                    product.images?.polished ||
                    product.images?.enhanced ||
                    product.images?.original ||
                    product.imageUrl ||
                    '/images/fallback.svg'
                  }
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* AI Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                  AI Pick
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors duration-300">
                  {product.title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {formatPrice(product.price)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-500">{product.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
