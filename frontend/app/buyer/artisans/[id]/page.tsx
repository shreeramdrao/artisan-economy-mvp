'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// Force dynamic rendering for client-dependent functionality
export const dynamic = 'force-dynamic'
import { buyerApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/buyer/product-card'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function ArtisanProductsPage() {
  const { id: rawId } = useParams()
  const sellerId = decodeURIComponent(rawId as string) // ✅ clearer variable name

  const [artisan, setArtisan] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImg = '/images/default-avatar.svg'

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ 1. Fetch all artisans and find this seller
        const artisans = await buyerApi.getArtisans()
        const found = artisans.find((a: any) => a.id === sellerId)
        setArtisan(found || null)

        // ✅ 2. Fetch this artisan's products from correct API route
        if (sellerId) {
          const productsData = await buyerApi.getArtisanProducts(sellerId)
          setProducts(productsData || [])
        }
      } catch (err) {
        console.error('❌ Failed to load artisan/products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sellerId])

  if (loading) return <p className="p-8 text-center">Loading artisan...</p>
  if (!artisan) return <p className="p-8 text-center">Artisan not found</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Artisan Header */}
        <Card className="p-8 mb-12 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-2xl">
                <img
                  src={artisan.avatarUrl || fallbackImg}
                  alt={artisan.name || 'Artisan'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{artisan.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{artisan.bio || 'Traditional artisan'}</p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-gray-500">
                <p className="flex items-center gap-1">
                  <span className="text-gray-400">📍</span> {artisan.location || 'India'}
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-gray-400">⭐</span> {artisan.rating?.toFixed(1) || '0.0'} rating
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-gray-400">🛍️</span> {products.length} products
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Artisan Products */}
        {products.length > 0 ? (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <span className="text-amber-500">🛍️</span>
                {artisan.name}&apos;s Products
                <span className="text-amber-500">🛍️</span>
              </h2>
              <p className="text-gray-600 text-lg">Discover the authentic crafts from this talented artisan</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  productId={product.productId}
                  title={product.title || 'Untitled Product'}
                  sellerName={artisan.name || 'Artisan'}
                  location={artisan.location || 'India'}
                  price={product.price || 0}
                  imageUrl={
                    product.images?.polished ||
                    product.images?.enhanced ||
                    product.images?.original ||
                    product.imageUrl ||
                    '/images/fallback.svg'
                  }
                  rating={product.rating || 4.5}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200 max-w-2xl mx-auto">
            <div className="text-gray-400 text-8xl mb-6">🛍️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No products yet</h2>
            <p className="text-gray-600 text-lg">This artisan is preparing their crafts. Check back soon!</p>
          </Card>
        )}
      </div>
    </div>
  )
}