'use client'

import { useEffect, useState, useCallback } from 'react'
import { buyerApi } from '@/lib/api'
import ProductCard from '@/components/seller/product-card'
import { Loader2 } from 'lucide-react'

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">❤️ Liked Products</h1>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-gray-500 text-center">
          No liked products yet. Click the ❤️ on a product to save it here!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                '/placeholder.png'
              }
              rating={product.rating || 4.5}
            />
          ))}
        </div>
      )}
    </div>
  )
}