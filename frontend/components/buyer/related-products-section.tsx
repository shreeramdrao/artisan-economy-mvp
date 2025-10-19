'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import ImageWithFallback from '@/components/ImageWithFallback'

interface RelatedProductsSectionProps {
  relatedProducts: any[]
  fallbackImg: string
}

export default function RelatedProductsSection({
  relatedProducts,
  fallbackImg,
}: RelatedProductsSectionProps) {
  if (relatedProducts.length === 0) return null

  return (
    <motion.div 
      className="border-t border-gray-200 pt-16"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 }}
    >
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          You Might Also Like
        </h2>
        <p className="text-gray-600">Discover more authentic crafts from our artisans</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {relatedProducts.map((item, index) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
          >
            <Link href={`/buyer/product/${item.productId}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border border-gray-200 rounded-xl group hover:-translate-y-1">
                <div className="aspect-square bg-gray-50 relative overflow-hidden" style={{ position: 'relative', contain: 'layout' }}>
                  <ImageWithFallback
                    src={item.imageUrl || fallbackImg}
                    alt={`${item.title} - Handcrafted artisan product`}
                    fill
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors duration-300">{item.title}</h3>
                  <div className="text-lg font-bold text-orange-600">
                    {formatPrice(item.price)}
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
