'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { buyerApi, sellerApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function ArtisanProductsPage() {
  const { id } = useParams() // artisan ID from URL
  const [artisan, setArtisan] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImg = '/images/placeholder.png'

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Get artisan details
        const artisans = await buyerApi.getArtisans()
        const found = artisans.find((a: any) => a.id === id)
        setArtisan(found || null)

        // ✅ Get artisan’s products
        if (id) {
          const productsData = await sellerApi.getProducts(id as string)
          setProducts(productsData || [])
        }
      } catch (err) {
        console.error('❌ Failed to load artisan/products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <p className="p-8 text-center">Loading artisan...</p>
  if (!artisan) return <p className="p-8 text-center">Artisan not found</p>

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Artisan Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
            <img
              src={artisan.imageUrl || fallbackImg}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.productId}
              className="overflow-hidden hover:shadow-lg transition"
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.imageUrl || fallbackImg}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <div className="text-xl font-bold text-orange-600 mb-3">
                  {formatPrice(product.price)}
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      product.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.status}
                  </span>

                  <Link href={`/buyer/product/${product.productId}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
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