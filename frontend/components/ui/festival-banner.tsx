'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Sparkles, Gift } from 'lucide-react'

interface FestivalBannerProps {
  festival: {
    name: string
    date: string
    color: string
    icon: string
    message: string
    discount?: string
  }
}

export default function FestivalBanner({ festival }: FestivalBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // ✅ Debug log for FestivalBanner rendering
  useEffect(() => {
    console.log("✅ [FestivalBanner] rendered")
  }, [])

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem(`festival_banner_${festival.name}_dismissed`)
    if (!dismissed) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [festival.name])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(`festival_banner_${festival.name}_dismissed`, 'true')
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-4 right-4 z-50 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className={`p-4 bg-gradient-to-r ${festival.color} text-white border-0 shadow-2xl backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{festival.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{festival.name} Special!</h3>
                  <p className="text-sm opacity-90">{festival.message}</p>
                  {festival.discount && (
                    <p className="text-xs bg-white/20 px-2 py-1 rounded-full mt-1 inline-block">
                      {festival.discount} off on selected items
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                  onClick={() => window.location.href = '/buyer?festival=true'}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Shop Now
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleDismiss}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
