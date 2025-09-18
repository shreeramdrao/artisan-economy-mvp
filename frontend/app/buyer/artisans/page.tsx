'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/lib/api'
import Link from 'next/link'

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImg = '/images/placeholder.png'

  useEffect(() => {
    async function fetchArtisans() {
      try {
        const data = await buyerApi.getArtisans() // ✅ backend call
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Artisans</h1>

      {artisans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artisans.map((artisan) => (
            <Card
              key={artisan.id}
              className="p-4 hover:shadow-lg transition flex flex-col items-center text-center"
            >
              {/* Artisan Image */}
              <div className="w-24 h-24 mb-3 bg-gray-100 rounded-full overflow-hidden">
                <img
                  src={artisan.imageUrl || fallbackImg}
                  alt={artisan.name || 'Artisan'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Artisan Info */}
              <h2 className="font-semibold text-lg">{artisan.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {artisan.location || 'India'}
              </p>

              {/* CTA */}
              <Link href={`/buyer/artisans/${artisan.id}`} className="w-full mt-3">
                <Button variant="outline" className="w-full">
                  View Products
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">
          No artisans found. Check back soon!
        </p>
      )}
    </div>
  )
}