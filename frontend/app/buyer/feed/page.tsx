'use client'

import PersonalizedFeed from '@/components/buyer/personalized-feed'
import ChatAssistant from '@/components/buyer/chat-assistant'
import CartSuggestions from '@/components/buyer/cart-suggestions'
import AIRecommendations from '@/components/buyer/ai-recommendations'
import QuickViewModal from '@/components/buyer/quick-view-modal'
import ProductZoomModal from '@/components/buyer/product-zoom-modal'
import FestivalBanner from '@/components/ui/festival-banner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, Heart, Eye } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function PersonalizedFeedPage() {
  // Debug state for V2 components
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)

  return (
    <ConfettiProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/buyer">
              <Button variant="outline" size="sm" className="bg-white/80 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalog
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <span className="text-amber-500">✨</span>
              Personalized Feed
              <span className="text-amber-500">✨</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover handcrafted treasures curated specifically for your taste and preferences
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Viewing History</h3>
                <p className="text-gray-600">Based on products you&apos;ve explored</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Wishlist Analysis</h3>
                <p className="text-gray-600">Matching your saved favorites</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">AI Insights</h3>
                <p className="text-gray-600">Smart recommendations powered by AI</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Personalized Feed */}
        <PersonalizedFeed />

        {/* Chat Assistant */}
        <ChatAssistant isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

        {/* Cart Suggestions */}
        <CartSuggestions cartItems={[]} />

        {/* AI Recommendations */}
        <AIRecommendations currentProduct={{
          productId: 'sample-feed-product',
          category: 'Jewelry',
          price: 2000,
          sellerName: 'Sample Feed Artisan'
        }} />

        {/* Festival Banner */}
        <FestivalBanner festival={{
          name: 'Diwali',
          date: '2024-11-01',
          color: 'from-orange-500 to-yellow-500',
          icon: '🪔',
          message: 'Celebrate the festival of lights with handcrafted treasures',
          discount: '20%'
        }} />

        {/* Scroll to Top */}
        <ScrollToTop />
      </div>
    </div>

    {/* Quick View Modal */}
    <QuickViewModal
      productId={quickViewProductId}
      isOpen={!!quickViewProductId}
      onClose={() => setQuickViewProductId(null)}
    />

    {/* Product Zoom Modal */}
    <ProductZoomModal
      imageUrl="/images/fallback.svg"
      alt="Product Image"
      isOpen={zoomModalOpen}
      onClose={() => setZoomModalOpen(false)}
    />
    </ConfettiProvider>
  )
}
