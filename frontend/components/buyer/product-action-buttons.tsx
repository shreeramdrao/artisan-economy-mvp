'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface ProductActionButtonsProps {
  adding: boolean
  buying: boolean
  onAddToCart: () => void
  onBuyNow: () => void
}

export default function ProductActionButtons({
  adding,
  buying,
  onAddToCart,
  onBuyNow,
}: ProductActionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1"
      >
        <Button 
          size="lg" 
          className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 font-semibold rounded-lg" 
          onClick={onBuyNow} 
          disabled={buying}
        >
          {buying ? 'Redirecting...' : 'Buy Now'}
        </Button>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex-1"
      >
        <Button
          size="lg"
          variant="outline"
          className="w-full h-12 bg-white border-2 border-orange-300 hover:bg-orange-50 hover:border-orange-400 text-orange-700 shadow-md hover:shadow-lg transition-all duration-300 font-semibold rounded-lg"
          onClick={onAddToCart}
          disabled={adding}
        >
          {adding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </motion.div>
    </motion.div>
  )
}
