'use client'

import { useState, useCallback } from 'react'
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
import ProductCard from '@/components/buyer/product-card'
import ProductCardSkeleton from '@/components/buyer/product-card-skeleton'
import QuickViewModal from '@/components/buyer/quick-view-modal'
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
import { useCart } from '@/context/cart-context'
import { useProductsInfinite } from '@/hooks/use-products'

export default function BuyerCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)
  
  // Debug state for V2 components
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)

  // Get cart items for suggestions
  const { cart } = useCart()

  // Use the new pagination hook
  const {
    products,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
  } = useProductsInfinite({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    limit: 12,
  })

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
    reset() // Reset pagination when category changes
  }, [reset])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // TODO: Implement search functionality
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === '' ||
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const currentFestival = {
    name: 'Diwali',
    date: '2024-11-01',
    color: 'from-orange-500 to-yellow-500',
    icon: '🪔',
    message: 'Celebrate the festival of lights with handcrafted treasures',
    discount: '20%',
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => reset()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <ConfettiProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Festival Banner */}
        <FestivalBanner festival={currentFestival} />

        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-48 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {pagination?.total || 0} Products
                </span>
                {pagination && (
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Personalized Feed */}
          <div className="mb-8">
            <PersonalizedFeed />
          </div>

          {/* AI Recommendations */}
          <div className="mb-8">
            <AIRecommendations 
              currentProduct={{
                productId: "sample-product",
                category: "pottery",
                price: 1500,
                sellerName: "Sample Artisan"
              }}
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  productId={product.productId}
                  title={product.title}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  sellerName={product.sellerName}
                  rating={product.rating}
                  onQuickView={setQuickViewProductId}
                />
              ))
            )}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mb-8">
              <Button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          )}

          {/* Cart Suggestions */}
          <div className="mb-8">
            <CartSuggestions cartItems={cart} />
          </div>
        </div>

        {/* Modals */}
        {quickViewProductId && (
          <QuickViewModal
            productId={quickViewProductId}
            isOpen={!!quickViewProductId}
            onClose={() => setQuickViewProductId(null)}
          />
        )}

        {zoomModalOpen && (
          <ProductZoomModal
            imageUrl="/images/sample-product.jpg"
            alt="Product zoom"
            isOpen={zoomModalOpen}
            onClose={() => setZoomModalOpen(false)}
          />
        )}

        {/* Floating Components */}
        <ScrollToTop />
        <ChatAssistant
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
        />
      </div>
    </ConfettiProvider>
  )
}