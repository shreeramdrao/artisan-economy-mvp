'use client'

import { ReactNode, useEffect } from 'react'
import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'
import { ConfettiProvider } from '@/components/providers/confetti-provider'
import AuthErrorBoundary from '@/components/AuthErrorBoundary'
import Navbar from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import OfflineListener from '@/components/OfflineListener'
import { connectSocket } from '@/lib/socket'
import { requestNotificationPermission } from '@/lib/notifications'

export function Providers({ children }: { children: ReactNode }) {
  // Initialize PWA features
  useEffect(() => {
    // Initialize WebSocket connection
    const initSocket = async () => {
      try {
        await connectSocket()
        console.log('PWA: WebSocket connected')
      } catch (error) {
        console.error('PWA: WebSocket connection failed:', error)
      }
    }

    // Initialize notifications
    const initNotifications = async () => {
      try {
        await requestNotificationPermission()
        console.log('PWA: Notifications initialized')
      } catch (error) {
        console.error('PWA: Notification initialization failed:', error)
      }
    }

    // Initialize PWA features
    initSocket()
    initNotifications()

    // Setup offline/online event listeners
    const handleOnline = () => {
      console.log('PWA: Back online - syncing data')
      // Trigger background sync
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          // Check if sync is available
          if ('sync' in registration) {
            (registration as any).sync.register('cart-sync')
          }
        })
      }
    }

    const handleOffline = () => {
      console.log('PWA: Gone offline - queuing actions')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AuthProvider>
      <AuthErrorBoundary>
        <CartProvider>
          <ConfettiProvider>
            <OfflineListener />
            <Navbar />
            {children}
            <Toaster />
            
            {/* Global ARIA Live Regions */}
            <div
              id="aria-live-region"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              aria-label="Screen reader announcements"
            />
            <div
              id="aria-live-urgent"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="sr-only"
              aria-label="Urgent screen reader announcements"
            />
          </ConfettiProvider>
        </CartProvider>
      </AuthErrorBoundary>
    </AuthProvider>
  )
}