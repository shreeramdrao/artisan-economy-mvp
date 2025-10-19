'use client'

import { useState, useEffect, useCallback } from 'react'
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
import ProductCard from '@/components/buyer/product-card'
import ProductCardSkeleton from '@/components/buyer/product-card-skeleton'
import QuickViewModal from '@/components/buyer/quick-view-modal'
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll'
import { formatPrice } from '@/lib/utils'
import { Search, Filter, Sparkles, Heart, Star } from 'lucide-react'
import PersonalizedFeed from '@/components/buyer/personalized-feed'
import ChatAssistant from '@/components/buyer/chat-assistant'
import CartSuggestions from '@/components/buyer/cart-suggestions'
import AIRecommendations from '@/components/buyer/ai-recommendations'
import ProductZoomModal from '@/components/buyer/product-zoom-modal'
import FestivalBanner from '@/components/ui/festival-banner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import { Card } from '@/components/ui/card'

export default function BuyerCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  
  // Debug state for V2 components
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      // Simulate pagination - in real implementation, you'd pass page/limit to API
      const data = await buyerApi.getProducts()
      const newProducts = data || []
      
      // For demo purposes, we'll simulate pagination by slicing the data
      const startIndex = (page - 1) * 12
      const endIndex = page * 12
      const paginatedProducts = newProducts.slice(startIndex, endIndex)
      
      if (paginatedProducts.length === 0) {
        setHasMore(false)
      } else {
        setProducts(prev => [...prev, ...paginatedProducts])
        setPage(prev => prev + 1)
      }
    } catch (err) {
      console.error('Failed to load more products:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await buyerApi.getProducts()
        const initialProducts = (data || []).slice(0, 12) // Load first 12 products
        setProducts(initialProducts)
        setHasMore((data || []).length > 12)
      } catch (err) {
        console.error('Failed to load products:', err)
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const { sentinelRef } = useInfiniteScroll(loadMore, {
    hasMore,
    isLoading: loadingMore,
  })

  // ✅ Defensive guard to prevent .filter errors
  const safeProducts = Array.isArray(products) ? products : []
  const filteredProducts = safeProducts.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
          {/* Premium Hero Section Skeleton */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 md:p-12 mb-12 shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
                <div className="h-12 bg-white/20 rounded animate-pulse w-64"></div>
              </div>
              <div className="h-8 bg-white/20 rounded animate-pulse w-96 mb-8"></div>
              <div className="flex flex-col lg:flex-row gap-4 max-w-4xl">
                <div className="relative flex-1">
                  <div className="h-14 bg-white/20 rounded-xl animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="h-14 w-full lg:w-64 bg-white/20 rounded-xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Quick Links Skeleton */}
          <div className="mb-12">
            <div className="h-8 bg-gray-200/50 rounded animate-pulse w-48 mb-6"></div>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200/50 rounded-lg animate-pulse w-24"></div>
              ))}
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-200/50 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200/50 rounded animate-pulse w-32"></div>
              <div className="h-6 bg-gray-200/50 rounded-full animate-pulse w-16"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-16">
          <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-red-200">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-gray-600">{error}</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ConfettiProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Premium Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 md:p-12 mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-8 w-8 text-yellow-200" />
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Artisan Economy
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-amber-100 mb-8 max-w-2xl leading-relaxed">
              Discover authentic Indian crafts. Every purchase preserves traditional craftsmanship and supports local artisans.
            </p>

            {/* Enhanced Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 max-w-4xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search products, artisans, or crafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-white/95 backdrop-blur-sm border-0 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white/50 rounded-xl shadow-lg"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-14 w-full lg:w-64 bg-white/95 backdrop-blur-sm border-0 text-gray-800 rounded-xl shadow-lg pl-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Category Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Explore Categories
          </h2>
          <div className="flex flex-wrap gap-3">
            {['all', 'Textiles', 'Pottery', 'Jewelry', 'Paintings', 'Woodwork'].map(
              (cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setSelectedCategory(cat)}
                  className={`transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105'
                      : 'bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {cat === 'all' ? '✨ All Crafts' : cat}
                </Button>
              ),
            )}
          </div>
        </div>

        {/* Products Grid with Enhanced Layout */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                </h2>
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6" data-testid="product-grid">
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
                product.imageUrl ||
                '/images/fallback.svg'
              }
              rating={product.rating || 4.5}
              onQuickView={setQuickViewProductId}
            />
          ))}
        </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div
                ref={sentinelRef}
                className="h-4 w-full"
                aria-hidden="true"
              />
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="col-span-full flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                  <span className="text-gray-600">Loading more products...</span>
                </div>
              </div>
            )}

            {/* End of Results */}
            {!hasMore && products.length > 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-500 text-lg">✨ You&apos;ve seen all our products!</div>
              </div>
            )}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No products found</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new artisan products!'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}

        {/* Personalized Feed Section */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-16">
            <PersonalizedFeed />
          </div>
        )}

        {/* Debug V2 Components Section - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-16 space-y-8">
            <ChatAssistant isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />
            <CartSuggestions cartItems={[]} />
            <AIRecommendations currentProduct={{
              productId: 'sample-product',
              category: 'Textiles',
              price: 1000,
              sellerName: 'Sample Artisan'
            }} />
            <FestivalBanner festival={{
              name: 'Diwali',
              date: '2024-11-01',
              color: 'from-orange-500 to-yellow-500',
              icon: '🪔',
              message: 'Celebrate the festival of lights with handcrafted treasures',
              discount: '20%'
            }} />
            <ScrollToTop />
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewProductId}
        isOpen={!!quickViewProductId}
        onClose={() => setQuickViewProductId(null)}
      />

      {/* ProductZoomModal - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <ProductZoomModal
          imageUrl="/images/fallback.svg"
          alt="Product Image"
          isOpen={zoomModalOpen}
          onClose={() => setZoomModalOpen(false)}
        />
      )}
    </div>
    </ConfettiProvider>
  )
}