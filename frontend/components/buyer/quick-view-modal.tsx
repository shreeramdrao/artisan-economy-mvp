'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '@/context/cart-context'
import { buyerApi } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { Heart, ShoppingCart, MapPin, Star } from 'lucide-react'

interface QuickViewModalProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
}

export default function QuickViewModal({ productId, isOpen, onClose }: QuickViewModalProps) {
  const { toast } = useToast()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (productId && isOpen) {
      setLoading(true)
      buyerApi.getProduct(productId)
        .then((data) => {
          setProduct(data)
          // Check if product is liked
          if (typeof window !== 'undefined') {
            try {
              const stored = JSON.parse(localStorage.getItem('likedProducts') || '[]')
              setLiked(Array.isArray(stored) && stored.includes(productId))
            } catch (err) {
              setLiked(false)
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load product:', err)
          toast({
            title: 'Error',
            description: 'Failed to load product details',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [productId, isOpen, toast])

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const next = !liked
    setLiked(next)

    // Update localStorage
    try {
      const raw = localStorage.getItem('likedProducts') || '[]'
      const arr: string[] = JSON.parse(raw)
      let nextArr: string[]

      if (next) {
        nextArr = arr.includes(productId!) ? arr : [...arr, productId!]
      } else {
        nextArr = arr.filter((id) => id !== productId)
      }

      localStorage.setItem('likedProducts', JSON.stringify(nextArr))
      window.dispatchEvent(new Event('likedProductsChanged'))

      toast({
        title: next ? '❤️ Added to Liked' : '💔 Removed from Liked',
        description: next
          ? `${product?.title} has been added to your liked products.`
          : `${product?.title} removed from liked products.`,
      })
    } catch (err) {
      console.error('Failed to update likedProducts in localStorage', err)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setAdding(true)
      await addToCart(product.productId, 1)
      toast({
        title: '✅ Added to Cart',
        description: `${product.title} has been added to your cart`,
      })
    } catch (err) {
      console.error('Failed to add to cart:', err)
      toast({
        title: 'Error',
        description: 'Could not add product to cart',
        variant: 'destructive',
      })
    } finally {
      setAdding(false)
    }
  }

  const renderStars = (rating: number) => {
    const full = Math.floor(rating)
    const hasHalf = rating % 1 !== 0
    const empty = 5 - full - (hasHalf ? 1 : 0)

    return (
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalf && <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    )
  }

  if (!product && !loading) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl" data-testid="quick-view-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2" data-testid="product-title">
            <span className="text-amber-500">👀</span>
            Quick View
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-xl relative group" style={{ position: 'relative', contain: 'layout' }}>
                <Image
                  src={product.images?.polished || product.images?.original || '/images/fallback.svg'}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Heart button */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  aria-pressed={liked}
                  aria-label={liked ? `Unlike ${product.title}` : `Like ${product.title}`}
                  className="absolute top-4 right-4 p-2.5 rounded-full shadow-xl bg-white/95 backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
                >
                  <Heart className={`w-5 h-5 transition-colors duration-300 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Seller Info */}
              <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={product.sellerInfo?.avatarUrl || '/images/default-avatar.png'}
                      alt={product.sellerInfo?.name || 'Artisan'}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✨</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{product.sellerInfo?.name}</h3>
                    <p className="text-gray-600 flex items-center gap-1 text-sm">
                      <MapPin className="w-3 h-3" />
                      {product.sellerInfo?.location || 'India'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Rating */}
              <div className="flex items-center gap-2">
                {renderStars(product.rating || 4.5)}
                <span className="text-sm text-gray-500">({product.rating?.toFixed(1) || '4.5'})</span>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description.length > 200 
                      ? `${product.description.slice(0, 200)}...` 
                      : product.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-bold"
                  onClick={handleAddToCart}
                  disabled={adding}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-white/80 backdrop-blur-sm border-2 border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold"
                  onClick={() => window.open(`/buyer/product/${product.productId}`, '_blank')}
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
