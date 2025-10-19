'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ConfettiBurst from '@/components/ui/confetti-burst'

interface ConfettiContextType {
  triggerConfetti: () => void
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined)

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(false)

  // ✅ Debug log for ConfettiProvider rendering
  useEffect(() => {
    console.log("✅ [ConfettiProvider] rendered")
  }, [])

  const triggerConfetti = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2000)
  }

  return (
    <ConfettiContext.Provider value={{ triggerConfetti }}>
      {children}
      <ConfettiBurst trigger={showConfetti} />
    </ConfettiContext.Provider>
  )
}

export function useConfetti() {
  const context = useContext(ConfettiContext)
  if (!context) {
    throw new Error('useConfetti must be used within ConfettiProvider')
  }
  return context
}
