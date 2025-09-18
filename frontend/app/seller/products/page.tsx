'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { sellerApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImg = '/placeholder.png'
  const { user, isAuthenticated } = useAuth() // ✅ get logged-in user

  useEffect(() => {
    async function fetchProducts() {
      if (!isAuthenticated) return // wait until user is logged in
      try {
        const data = await sellerApi.getProducts() // ✅ no sellerId arg needed
        setProducts(data || [])
      } catch (err) {
        console.error('❌ Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [isAuthenticated])

  if (loading) {
    return <p className="p-8 text-center">Loading products...</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/seller/upload">
          <Button>
            <span className="mr-2">➕</span>
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card
              key={product.productId}
              className="overflow-hidden hover:shadow-lg transition-shadow"
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

                <div className="flex justify-between text-sm text-gray-500 mb-3">
                  <span>👁 {product.views || 0} views</span>
                  <span>📦 {product.orders || 0} orders</span>
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

                  <div className="flex space-x-2">
                    {/* Edit Button → Seller edit page */}
                    <Link href={`/seller/products/${product.productId}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>

                    {/* View Button → Buyer product page */}
                    <Link href={`/buyer/product/${product.productId}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No products yet</h2>
          <p className="text-gray-600 mb-6">
            Start by uploading your first product
          </p>
          <Link href="/seller/upload">
            <Button>Upload Product</Button>
          </Link>
        </div>
      )}
    </div>
  )
}