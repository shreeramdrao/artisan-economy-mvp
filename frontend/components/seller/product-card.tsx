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

  // ✅ Add skeleton loader for product cards
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="animate-pulse h-64 bg-gray-200 rounded-lg" />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition relative">
      <Link href={`/buyer/product/${productId}`} className="block">
        <div className="aspect-square bg-gray-100 relative">
          <Image
            src={imageUrl || '/images/fallback.svg'}
            alt={title}
            width={300}
            height={300}
            className="object-cover rounded-lg"
            onError={(e) => (e.currentTarget.src = '/images/fallback.svg')}
          />

          {/* ❤️ Heart button */}
          <button
            type="button"
            onClick={handleToggleLike}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike product' : 'Like product'}
            className="absolute top-3 right-3 p-2 rounded-full shadow-sm bg-white/90 hover:bg-white focus:outline-none"
          >
            <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-md mb-1 line-clamp-2">{title}</h3>
          <p className="text-xs text-gray-600 mb-2">
            {sellerName} • {location}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {renderStars(rating)}
              <span className="text-xs text-gray-500 ml-1">
                {rating?.toFixed(1)}
              </span>
            </div>

            <div className="text-lg font-bold text-amber-600">
              {formatPrice(price)}
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}