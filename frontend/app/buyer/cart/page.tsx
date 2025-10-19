'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/cart-context'
import { useRouter } from 'next/navigation'
import CartSuggestions from '@/components/buyer/cart-suggestions'
import ChatAssistant from '@/components/buyer/chat-assistant'
import AIRecommendations from '@/components/buyer/ai-recommendations'
import QuickViewModal from '@/components/buyer/quick-view-modal'
import ProductZoomModal from '@/components/buyer/product-zoom-modal'
import FestivalBanner from '@/components/ui/festival-banner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import ImageWithFallback from '@/components/ImageWithFallback'

// Force dynamic rendering for client-dependent functionality
export const dynamic = 'force-dynamic'

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  
  // Debug state for V2 components
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [quickViewProductId, setQuickViewProductId] = useState<string | null>(null)
  const [zoomModalOpen, setZoomModalOpen] = useState(false)

  // ✅ Safely calculate total
  const total = cart.reduce(
    (sum, item) =>
      sum + ((item.price !== undefined ? item.price : 0) * (item.quantity || 1)),
    0
  )

  // ✅ Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return

    // For now, handle single product checkout
    const firstItem = cart[0]

    router.push(
      `/buyer/checkout?productId=${firstItem.productId}&quantity=${firstItem.quantity || 1}`
    )
  }

  return (
    <ConfettiProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span className="text-amber-500">🛒</span>
            Shopping Cart
            <span className="text-amber-500">🛒</span>
          </h1>
          <p className="text-gray-600 text-lg">Review your selected artisan crafts</p>
        </div>

        {cart.length > 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 mb-8">
              {cart.map((item) => (
                <Card
                  key={item.productId}
                  className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
                >
                  <div className="flex items-center space-x-6">
                    {/* Enhanced Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-lg">
                      <ImageWithFallback
                        src={item.imageUrl || '/images/fallback.svg'}
                        alt={item.title || 'Untitled'}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Enhanced Product Info */}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {item.title || 'Untitled'}
                      </h2>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {formatPrice(item.price || 0)}
                        </p>
                        <div className="flex items-center gap-2 bg-amber-100 px-3 py-1 rounded-full">
                          <span className="text-amber-600 font-medium">Qty:</span>
                          <span className="text-amber-800 font-bold">{item.quantity || 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Remove Button */}
                    <Button
                      variant="destructive"
                      onClick={() => removeFromCart(item.productId)}
                      className="bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      🗑️ Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Enhanced Cart Total + Actions */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Cart Total</h2>
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {formatPrice(total)}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold text-lg px-8 py-4"
                    onClick={handleProceedToCheckout}
                  >
                    🛒 Proceed to Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={clearCart}
                    className="bg-white/80 backdrop-blur-sm border-2 border-red-300 hover:bg-red-50 hover:border-red-400 text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold text-lg px-8 py-4"
                  >
                    🗑️ Clear Cart
                  </Button>
                </div>
              </div>
            </Card>

            {/* Smart Cart Suggestions */}
            <CartSuggestions cartItems={cart} />
          </div>
        ) : (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200 max-w-2xl mx-auto">
            <div className="text-gray-400 text-8xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 text-lg mb-8">Discover amazing artisan crafts and add them to your cart!</p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold text-lg px-8 py-4"
              onClick={() => router.push('/buyer')}
            >
              ✨ Start Shopping
            </Button>
          </Card>
        )}

        {/* Chat Assistant */}
        <ChatAssistant isOpen={isChatOpen} onToggle={() => setIsChatOpen(!isChatOpen)} />

        {/* AI Recommendations */}
        <AIRecommendations currentProduct={{
          productId: 'sample-cart-product',
          category: 'Pottery',
          price: 1500,
          sellerName: 'Sample Cart Artisan'
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