'use client'

import { useEffect, useState } from 'react'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import FestivalBanner from '@/components/ui/festival-banner'
import ScrollToTop from '@/components/ui/scroll-to-top'
import ChatAssistant from '@/components/buyer/chat-assistant'

export default function BuyerLayoutClient({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    console.log('✅ buyer layout client hydrated')
    setMounted(true)
    if (process.env.NODE_ENV === 'development') {
      console.debug('BuyerLayoutClient component mounted')
    }
  }, [])

  const festival = {
    name: 'Diwali',
    date: '2024-11-01',
    color: 'from-orange-500 to-yellow-500',
    icon: '🪔',
    message: 'Celebrate the festival of lights with handcrafted treasures',
    discount: '20%',
  }

  if (!mounted) return null

  return (
    <ConfettiProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 overflow-hidden">
        <FestivalBanner festival={festival} />
        <main>{children}</main>
        <ScrollToTop />
        <ChatAssistant isOpen={false} onToggle={() => {}} />
      </div>
    </ConfettiProvider>
  )
}