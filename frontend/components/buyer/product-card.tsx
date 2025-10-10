'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  productId: string
  title: string
  sellerName?: string
  location?: string
  price: number
  imageUrl?: string
  rating?: number
  onLikeChange?: (productId: string, liked: boolean) => void
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
  loading = false,
}: ProductCardProps) {
  const { toast } = useToast()
  const [liked, setLiked] = useState(false)

  // ✅ Initialize liked state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = JSON.parse(localStorage.getItem('likedProducts') || '[]')
      setLiked(Array.isArray(stored) && stored.includes(productId))
    } catch (err) {
      console.error('Failed to read likedProducts from localStorage', err)
      setLiked(false)
    }
  }, [productId])

  // ✅ Update localStorage when like toggles
  const updateLocalStorage = (nextLiked: boolean) => {
    try {
      const raw = localStorage.getItem('likedProducts') || '[]'
      const arr: string[] = JSON.parse(raw)
      let next: string[]

      if (nextLiked) {
        next = arr.includes(productId) ? arr : [...arr, productId]
      } else {
        next = arr.filter((id) => id !== productId)
      }

      localStorage.setItem('likedProducts', JSON.stringify(next))
      window.dispatchEvent(new Event('likedProductsChanged')) // notify others
    } catch (err) {
      console.error('Failed to update likedProducts in localStorage', err)
    }
  }

  // ✅ Heart click handler
  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault() // stop navigation
    e.stopPropagation()

    const next = !liked
    setLiked(next)
    updateLocalStorage(next)

    if (onLikeChange) onLikeChange(productId, next)

    toast({
      title: next ? '❤️ Added to Liked' : '💔 Removed from Liked',
      description: next
        ? `${title} has been added to your liked products.`
        : `${title} removed from liked products.`,
    })
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
      className="h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 group bg-white dark:bg-gray-800 hover:-translate-y-1"
      aria-label={`${title} by ${sellerName} - ${formatPrice(price)}`}
    >
      <Link href={`/buyer/product/${productId}`} className="flex flex-col h-full">
        {/* Image Container with fixed aspect ratio for perfect alignment */}
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
          <Image
            src={imageUrl || '/images/fallback.svg'}
            alt={`${title} by ${sellerName}`}
            fill
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* ❤️ Heart button with enhanced styling */}
          <button
            type="button"
            onClick={handleToggleLike}
            aria-pressed={liked}
            aria-label={liked ? `Unlike ${title}` : `Like ${title}`}
            className="absolute top-3 right-3 p-2 rounded-full shadow-lg bg-white/95 dark:bg-gray-800/95 hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 hover:scale-110"
          >
            <span className="text-xl transition-transform duration-200">{liked ? '❤️' : '🤍'}</span>
          </button>
        </div>

        {/* Content Container with perfect alignment and consistent spacing */}
        <div className="p-4 flex flex-col justify-between flex-1 min-h-[140px]">
          {/* Title area - fixed height for perfect alignment */}
          <div className="space-y-2 mb-3">
            <h3 className="text-lg font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight min-h-[2.5rem] max-h-[2.5rem]">
              {title}
            </h3>
          </div>

          {/* Seller info - fixed height for alignment */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate min-h-[1.25rem]">
              {sellerName} • {location}
            </p>
          </div>

          {/* Bottom Section - Rating and Price with consistent alignment */}
          <div className="flex items-center justify-between min-h-[2rem]">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {rating?.toFixed(1)}
              </span>
            </div>

            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatPrice(price)}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
