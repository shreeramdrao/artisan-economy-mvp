'use client'
export const dynamic = 'force-dynamic' // force this layout to be part of the app router
export const runtime = 'edge' // optional, makes sure it runs in app router mode

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import ScrollToTop from '@/components/ui/scroll-to-top'
import ChatAssistant from '@/components/buyer/chat-assistant'
import FestivalBanner from '@/components/ui/festival-banner'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('BuyerLayout component mounted')
    }
    setMounted(true)
    setLoadingStartTime(Date.now())
  }, [])

  // ✅ Track loading time and provide timeout fallback
  useEffect(() => {
    if (loading && loadingStartTime) {
      const loadingTime = Date.now() - loadingStartTime
      console.debug(`BuyerLayout: Loading for ${loadingTime}ms`)
    }
  }, [loading, loadingStartTime])

  // ✅ Client-side authentication guard (prevents redirect loops)
  useEffect(() => {
    if (mounted && !loading && !isRedirecting) {
      // Don't redirect if already on auth route or if already redirecting
      if (pathname.startsWith('/auth/')) {
        console.debug('BuyerLayout: Already on auth route, skipping redirect')
        return
      }
      
      // If user is not authenticated or not a buyer, redirect to login
      if (!user || user.role !== 'buyer') {
        console.log('BuyerLayout: User not authenticated or not a buyer, redirecting to login')
        setIsRedirecting(true)
        router.replace('/auth/login?redirect=/buyer')
        return
      }
    }
  }, [mounted, loading, user, router, pathname, isRedirecting])

  // ✅ Show loading state while checking authentication
  if (!mounted || loading) {
    const loadingTime = loadingStartTime ? Date.now() - loadingStartTime : 0
    const isTimeout = loadingTime > 5000 // 5 second timeout
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Buyer Portal...</p>
          {isTimeout && (
            <div className="mt-4">
              <p className="text-sm text-red-600 mb-2">
                Loading is taking longer than expected ({Math.round(loadingTime / 1000)}s)
              </p>
              <button
                onClick={() => router.replace('/auth/login?redirect=/buyer')}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ Show loading if user is not authenticated (while redirect is happening)
  if (!user || user.role !== 'buyer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const currentFestival = {
    name: 'Diwali',
    date: '2024-11-01',
    color: 'from-orange-500 to-yellow-500',
    icon: '🪔',
    message: 'Celebrate the festival of lights with handcrafted treasures',
    discount: '20%',
  }

  return (
    <ErrorBoundary>
      <ConfettiProvider>
        <div className="relative min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 overflow-hidden">
          {/* Page content */}
          <main className="relative z-10">{children}</main>

          {/* Floating Components */}
          <FestivalBanner festival={currentFestival} />
          <ScrollToTop />
          <ChatAssistant
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
          />
        </div>
      </ConfettiProvider>
    </ErrorBoundary>
  )
}