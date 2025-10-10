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
    <div className="container mx-auto px-4 py-8">
      {/* Artisan Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
            <img
              src={artisan.avatarUrl || fallbackImg}
              alt={artisan.name || 'Artisan'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{artisan.name}</h1>
            <p className="text-gray-600">{artisan.bio || 'Traditional artisan'}</p>
            <p className="text-sm text-gray-500">📍 {artisan.location || 'India'}</p>
            <p className="text-sm text-gray-600 mt-1">
              ⭐ {artisan.rating?.toFixed(1) || '0.0'} · {products.length} products
            </p>
          </div>
        </div>
      </div>

      {/* Artisan Products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-stretch">
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
      ) : (
        <p className="text-center text-gray-600">
          This artisan has no products yet.
        </p>
      )}
    </div>
  )
}