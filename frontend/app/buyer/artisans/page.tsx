'use client'

import { useEffect, useState } from 'react'

// Force dynamic rendering for client-dependent functionality
export const dynamic = 'force-dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/lib/api'
import Link from 'next/link'

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImg = '/images/default-avatar.svg'

  useEffect(() => {
    async function fetchArtisans() {
      try {
        const data = await buyerApi.getArtisans()
        setArtisans(data || [])
      } catch (err) {
        console.error('❌ Failed to load artisans:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArtisans()
  }, [])

  if (loading) return <p className="p-8 text-center">Loading artisans...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span className="text-amber-500">👨‍🎨</span>
            Artisans
            <span className="text-amber-500">👩‍🎨</span>
          </h1>
          <p className="text-gray-600 text-lg">Meet the talented craftspeople behind our authentic products</p>
        </div>

        {artisans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artisans.map((artisan) => (
              <Card
                key={artisan.id}
                className="p-6 hover:shadow-2xl hover:shadow-amber-200/50 transition-all duration-500 flex flex-col items-center text-center bg-white/90 backdrop-blur-sm border-0 rounded-2xl group hover:-translate-y-2 hover:scale-[1.02]"
              >
                {/* Enhanced Artisan Avatar */}
                <div className="relative mb-4">
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full overflow-hidden shadow-xl">
                    <img
                      src={artisan.avatarUrl || fallbackImg}
                      alt={artisan.name || 'Artisan'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">✨</span>
                  </div>
                </div>

                {/* Enhanced Artisan Info */}
                <div className="space-y-2 mb-6">
                  <h2 className="font-bold text-xl text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                    {artisan.name}
                  </h2>
                  <p className="text-gray-600 flex items-center justify-center gap-1">
                    <span className="text-gray-400">📍</span> {artisan.location || 'India'}
                  </p>
                  {artisan.bio && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {artisan.bio}
                    </p>
                  )}
                </div>

                {/* Enhanced View Products Button */}
                <Link
                  href={`/buyer/artisans/${encodeURIComponent(artisan.id)}`}
                  className="w-full"
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-bold"
                  >
                    👀 View Products
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-200 max-w-2xl mx-auto">
            <div className="text-gray-400 text-8xl mb-6">👨‍🎨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No artisans found</h2>
            <p className="text-gray-600 text-lg">Check back soon for new artisan profiles!</p>
          </Card>
        )}
      </div>
    </div>
  )
}