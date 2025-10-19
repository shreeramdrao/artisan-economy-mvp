'use client'

import { useEffect } from 'react'
import { usePersonalizedFeed } from '@/hooks/use-personalized-feed'
import ProductCard from '@/components/buyer/product-card'
import ProductCardSkeleton from '@/components/buyer/product-card-skeleton'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, Heart, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PersonalizedFeed() {
  const { products, loading, error, refresh } = usePersonalizedFeed()

  // ✅ Debug log for PersonalizedFeed rendering
  useEffect(() => {
    console.log("✅ [PersonalizedFeed] rendered")
  }, [])

  // ✅ Safe fallback for malformed products data
  const safeProducts = Array.isArray(products) ? products : []

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Personalized Feed</h2>
            <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Discovering products just for you...</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-red-200">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to load recommendations</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={refresh} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </Card>
    )
  }

  if (safeProducts.length === 0) {
    return (
      <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200">
        <div className="text-gray-400 text-8xl mb-6">🔍</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">No recommendations yet</h2>
        <p className="text-gray-600 text-lg mb-8">Start browsing products to get personalized recommendations!</p>
        <Button 
          onClick={() => window.location.href = '/buyer'}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold text-lg px-8 py-4"
        >
          ✨ Start Exploring
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="h-8 w-8 text-amber-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Personalized Feed</h2>
          <Sparkles className="h-8 w-8 text-amber-500" />
        </div>
        <p className="text-gray-600 text-lg mb-6">Products curated just for you based on your preferences</p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Based on your wishlist</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Your viewing history</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>AI recommendations</span>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {safeProducts.map((product, index) => (
          <motion.div
            key={product.productId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <div className="relative">
              <ProductCard
                productId={product.productId}
                title={product.title}
                sellerName={product.sellerName}
                location="India"
                price={product.price}
                imageUrl={
                  product.images?.polished ||
                  product.images?.enhanced ||
                  product.images?.original ||
                  '/images/fallback.svg'
                }
                rating={product.rating}
              />
              
              {/* Recommendation Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {Math.round(product.recommendationScore * 100)}% match
                </div>
              </div>
              
              {/* Recommendation Reason */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs p-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300">
                {product.reason}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Refresh Button */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button 
          onClick={refresh}
          variant="outline"
          className="bg-white/80 backdrop-blur-sm border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Recommendations
        </Button>
      </motion.div>
    </div>
  )
}
