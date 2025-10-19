'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ConfettiBurstProps {
  trigger: boolean
  onComplete?: () => void
}

export default function ConfettiBurst({ trigger, onComplete }: ConfettiBurstProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (trigger) {
      setIsActive(true)
      const timer = setTimeout(() => {
        setIsActive(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!isActive) return null

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotation: Math.random() * 360,
    color: ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#118AB2', '#073B4C'][Math.floor(Math.random() * 6)]
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: `${piece.y}%`,
          }}
          initial={{ 
            opacity: 0, 
            scale: 0,
            y: 0,
            rotate: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            y: -100,
            rotate: piece.rotation
          }}
          transition={{
            delay: piece.delay,
            duration: piece.duration,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Success Message */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-xl border-2 border-green-500">
          <div className="flex items-center gap-2 text-green-600 font-bold">
            <span className="text-2xl">🎉</span>
            <span>Added to Cart!</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
