'use client'

import { useEffect, useState, useCallback } from 'react'
import { buyerApi } from '@/lib/api'
import ProductCard from '@/components/buyer/product-card'
import { Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  title: string
  sellerName: string
  category: string
  price: number
  images: { polished?: string; enhanced?: string; original?: string }
  rating?: number
}

export default function LikedProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Function to fetch liked products
  const fetchLikedProducts = useCallback(async () => {
    setLoading(true)
    try {
      const likedIds: string[] = JSON.parse(localStorage.getItem('likedProducts') || '[]')

      if (likedIds.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      const productData = await Promise.all(
        likedIds.map(async (id) => {
          try {
            const res = await buyerApi.getProduct(id)
            return { ...res, id }
          } catch {
            return null
          }
        })
      )

      setProducts(productData.filter((p): p is Product => p !== null))
    } catch (error) {
      console.error('Error fetching liked products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Load initially + refresh on "likedProductsChanged"
  useEffect(() => {
    fetchLikedProducts()

    const handleChange = () => fetchLikedProducts()
    window.addEventListener('likedProductsChanged', handleChange)

    return () => {
      window.removeEventListener('likedProductsChanged', handleChange)
    }
  }, [fetchLikedProducts])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span className="text-red-500">❤️</span>
            Your Favorites
            <span className="text-red-500">❤️</span>
          </h1>
          <p className="text-gray-600 text-lg">Your collection of favorite artisan crafts</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-amber-600" />
                <p className="text-lg text-gray-600 font-medium">Loading your favorites...</p>
              </div>
            </Card>
          </div>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200 max-w-2xl mx-auto">
            <div className="text-red-400 text-8xl mb-6">❤️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No liked products yet</h2>
            <p className="text-gray-600 text-lg mb-8">Click the ❤️ on a product to save it here!</p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold text-lg px-8 py-4"
              onClick={() => window.location.href = '/buyer'}
            >
              ✨ Start Exploring
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-3">
              <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-bold">
                {products.length} {products.length === 1 ? 'favorite' : 'favorites'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  title={product.title}
                  sellerName={product.sellerName || 'Artisan'}
                  location="India"
                  price={product.price}
                  imageUrl={
                    product.images?.polished ||
                    product.images?.enhanced ||
                    product.images?.original ||
                    '/images/fallback.svg'
                  }
                  rating={product.rating || 4.5}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}