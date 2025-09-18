'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'

export function RoleSelector() {
  const router = useRouter()

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <Card
        className="p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-orange-400"
        onClick={() => router.push('/seller')}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold mb-3 text-orange-600">I am a Seller</h2>
          <p className="text-gray-600 mb-4">
            List your handmade products, tell your story, and reach customers across India
          </p>
          <ul className="text-left text-sm space-y-2">
            <li>✓ AI-enhanced product photos</li>
            <li>✓ Multilingual story translation</li>
            <li>✓ Smart pricing suggestions</li>
            <li>✓ Direct payments to your account</li>
          </ul>
        </div>
      </Card>

      <Card
        className="p-8 cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-2 hover:border-amber-400"
        onClick={() => router.push('/buyer')}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold mb-3 text-amber-600">I am a Buyer</h2>
          <p className="text-gray-600 mb-4">
            Discover authentic Indian crafts directly from artisans across the country
          </p>
          <ul className="text-left text-sm space-y-2">
            <li>✓ Verified authentic products</li>
            <li>✓ Listen to artisan stories</li>
            <li>✓ Secure online payments</li>
            <li>✓ Support traditional crafts</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}