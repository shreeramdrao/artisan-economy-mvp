'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { buyerApi } from '@/lib/api'
import ProductCard from '@/components/seller/product-card' // ⚠️ Consider moving to /components/product
import { formatPrice } from '@/lib/utils'

export default function BuyerCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await buyerApi.getProducts()
        setProducts(data || [])
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <p className="p-8 text-center">Loading products...</p>
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">{error}</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Discover Authentic Indian Crafts</h1>
        <p className="text-lg text-gray-700 mb-6">
          Support artisans directly. Every purchase preserves traditional craftsmanship.
        </p>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search products or artisans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:flex-1 bg-white"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-48 bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'Textiles', 'Pottery', 'Jewelry', 'Paintings', 'Woodwork'].map(
          (cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </Button>
          ),
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.productId}
              productId={product.productId}
              title={product.title || 'Untitled Product'}
              sellerName={product.sellerName || 'Artisan'}
              location={product.location || 'India'}
              price={product.price || 0}
              imageUrl={
                product.images?.polished ||
                product.images?.enhanced ||
                product.images?.original ||
                product.imageUrl || // fallback for older API
                '/placeholder.png'
              }
              rating={product.rating || 4.5}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}

      {/* Load More */}
      {products.length > filteredProducts.length && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              // Future pagination logic
              console.log('Load more clicked')
            }}
          >
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}