'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ImageWithFallback from '@/components/ImageWithFallback'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useWishlist } from '@/hooks/use-wishlist'
import { analytics } from '@/lib/analytics'
import { formatPrice } from '@/lib/utils'
import { Eye } from 'lucide-react'

interface ProductCardProps {
  productId: string
  title: string
  sellerName?: string
  location?: string
  price: number
  imageUrl?: string
  rating?: number
  onLikeChange?: (productId: string, liked: boolean) => void
  onQuickView?: (productId: string) => void
  loading?: boolean
}

export default function ProductCard({
  productId,
  title,
  sellerName = 'Artisan',
  location = 'India',
  price,
  imageUrl = '/images/fallback.svg',
  rating = 4.5,
  onLikeChange,
  onQuickView,
  loading = false,
}: ProductCardProps) {
  const { toast } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [liked, setLiked] = useState(false)

  // ✅ Initialize liked state from wishlist
  useEffect(() => {
    setLiked(isInWishlist(productId))
  }, [productId, isInWishlist])

  // ✅ Heart click handler
  const handleToggleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault() // stop navigation
    e?.stopPropagation()

    try {
      await toggleWishlist(productId)
      const newLiked = !liked
      setLiked(newLiked)

      // Track analytics
      analytics.productLiked(productId, title, newLiked)

      if (onLikeChange) onLikeChange(productId, newLiked)

      toast({
        title: newLiked ? '❤️ Added to Wishlist' : '💔 Removed from Wishlist',
        description: newLiked
          ? `${title} has been added to your wishlist.`
          : `${title} removed from wishlist.`,
      })
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      })
    }
  }

  const renderStars = (r: number) => {
    const full = Math.floor(r)
    const stars = Array.from({ length: full }).map((_, i) => (
      <span key={i} aria-hidden>
        ★
      </span>
    ))
    return <div className="text-sm text-yellow-400">{stars}</div>
  }

  // ✅ Enhanced skeleton loader with perfect alignment
  if (loading) {
    return (
      <Card className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
        <div className="animate-pulse aspect-[4/3] bg-gray-200 dark:bg-gray-600" />
        <div className="p-4 flex flex-col justify-between flex-1 min-h-[140px]">
          {/* Title area - fixed height */}
          <div className="space-y-2 mb-3">
            <div className="animate-pulse h-5 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
          </div>
          {/* Seller info - fixed height */}
          <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-4" />
          {/* Bottom section - fixed height */}
          <div className="flex justify-between items-center">
            <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" />
            <div className="animate-pulse h-5 bg-gray-200 dark:bg-gray-600 rounded w-20" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden border-0 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 group bg-white/90 backdrop-blur-sm hover:-translate-y-2 hover:scale-[1.02]"
      aria-label={`${title} by ${sellerName} - ${formatPrice(price)}`}
      data-testid="product-card"
    >
      <Link href={`/buyer/product/${productId}`} className="flex flex-col h-full">
        {/* Image Container with fixed aspect ratio for perfect alignment */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 relative">
          <ImageWithFallback
            src={imageUrl || '/images/fallback.svg'}
            alt={`${title} by ${sellerName}`}
            fill
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            fallbackSrc="/images/fallback.svg"
          />

          {/* Gradient overlay for better text readability - decorative only */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-50">
            {/* ❤️ Heart button */}
            <button
              type="button"
              onClick={handleToggleLike}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleToggleLike()
                }
              }}
              aria-pressed={liked}
              aria-label={liked ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
              title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
              className="p-2.5 rounded-full shadow-xl bg-white/95 backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110 hover:shadow-lg pointer-events-auto"
              data-testid="heart-button"
            >
              <span className="text-xl transition-all duration-300 hover:scale-110" aria-hidden="true">
                {liked ? '❤️' : '🤍'}
              </span>
            </button>
            
            {/* 👀 Quick View button */}
            {onQuickView && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickView(productId)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onQuickView(productId)
                  }
                }}
                aria-label={`Quick view details for ${title}`}
                title="Quick view product details"
                className="p-2.5 rounded-full shadow-xl bg-white/95 backdrop-blur-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110 hover:shadow-lg opacity-0 group-hover:opacity-100 pointer-events-auto"
                data-testid="quick-view-button"
              >
                <Eye className="w-5 h-5 text-gray-600" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Premium badge overlay - decorative only */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
            Handcrafted
          </div>
        </div>

        {/* Content Container with perfect alignment and consistent spacing */}
        <div className="p-5 flex flex-col justify-between flex-1 min-h-[160px]">
          {/* Title area - fixed height for perfect alignment */}
          <div className="space-y-3 mb-4">
            <h3 className="text-lg font-bold line-clamp-2 text-gray-900 group-hover:text-amber-600 transition-colors duration-300 leading-tight min-h-[2.5rem] max-h-[2.5rem]">
              {title}
            </h3>
          </div>

          {/* Seller info - fixed height for alignment */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 truncate min-h-[1.25rem] font-medium">
              by {sellerName}
            </p>
            <p className="text-xs text-gray-500 truncate min-h-[1rem] flex items-center gap-1">
              <span className="text-gray-400">📍</span> {location}
            </p>
          </div>

          {/* Bottom Section - Rating and Price with consistent alignment */}
          <div className="flex items-center justify-between min-h-[2rem]">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
              <span className="text-sm text-gray-500">
                {rating?.toFixed(1)}
              </span>
            </div>

            <div className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent" data-testid="product-price">
              {formatPrice(price)}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
