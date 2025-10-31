'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Palette, ShoppingBag } from 'lucide-react'

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12 },
  },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

export function RoleSelector() {
  const router = useRouter()

  return (
    <motion.div
      className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      <motion.div variants={item}>
        <Card
          className="relative p-8 cursor-pointer border border-orange-200/60 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
          onClick={() => router.push('/seller')}
        >
          <div className="absolute inset-0 rounded-lg ring-1 ring-transparent group-hover:ring-orange-400/60" />
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/30">
              <Palette className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              I am a Seller
            </h2>
            <p className="text-gray-600 mb-5">
              List your handmade products, tell your story, and reach customers across India
            </p>
            <ul className="mx-auto max-w-sm text-left text-sm space-y-2 text-gray-700">
              <li>✓ AI-enhanced product photos</li>
              <li>✓ Multilingual story translation</li>
              <li>✓ Smart pricing suggestions</li>
              <li>✓ Direct payments to your account</li>
            </ul>
            <div className="mt-6">
              <Button className="bg-orange-500 hover:bg-orange-600 transition-colors">Enter Seller Portal</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card
          className="relative p-8 cursor-pointer border border-amber-200/60 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
          onClick={() => router.push('/buyer')}
        >
          <div className="absolute inset-0 rounded-lg ring-1 ring-transparent group-hover:ring-amber-400/60" />
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 text-white shadow-lg shadow-amber-500/30">
              <ShoppingBag className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              I am a Buyer
            </h2>
            <p className="text-gray-600 mb-5">
              Discover authentic Indian crafts directly from artisans across the country
            </p>
            <ul className="mx-auto max-w-sm text-left text-sm space-y-2 text-gray-700">
              <li>✓ Verified authentic products</li>
              <li>✓ Listen to artisan stories</li>
              <li>✓ Secure online payments</li>
              <li>✓ Support traditional crafts</li>
            </ul>
            <div className="mt-6">
              <Button className="bg-amber-500 hover:bg-amber-600 transition-colors">Enter Marketplace</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}