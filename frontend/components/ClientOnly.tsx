'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'

const ScrollToTop = dynamic(() => import('@/components/ui/scroll-to-top'), { ssr: false })
const ChatAssistant = dynamic(() => import('@/components/buyer/chat-assistant'), { ssr: false })
const FestivalBanner = dynamic(() => import('@/components/ui/festival-banner'), { ssr: false })

export default function ClientOnly({ festival }: { festival: any }) {
  useEffect(() => {
    console.log('✅ ClientOnly mounted - Hydration bridge active')
  }, [])

  return (
    <>
      <FestivalBanner festival={festival} />
      <ScrollToTop />
      <ChatAssistant isOpen={false} onToggle={() => {}} />
    </>
  )
}