'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { SellerSidebar } from '@/components/seller/SellerSidebar'
import { SellerHeader } from '@/components/seller/SellerHeader'
import { SellerBreadcrumbs } from '@/components/seller/SellerBreadcrumbs'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('SellerLayout component mounted')
    }
    setMounted(true)
    setLoadingStartTime(Date.now())
  }, [])

  // Track loading time and provide timeout fallback
  useEffect(() => {
    if (loading && loadingStartTime) {
      const loadingTime = Date.now() - loadingStartTime
      console.debug(`SellerLayout: Loading for ${loadingTime}ms`)
    }
  }, [loading, loadingStartTime])

  // Client-side authentication guard (prevents redirect loops)
  useEffect(() => {
    if (mounted && !loading && !isRedirecting) {
      // Don't redirect if already on auth route or if already redirecting
      if (pathname.startsWith('/auth/')) {
        console.debug('SellerLayout: Already on auth route, skipping redirect')
        return
      }
      
      // If user is not authenticated or not a seller, redirect to login
      if (!user || user.role !== 'seller') {
        console.log('SellerLayout: User not authenticated or not a seller, redirecting to login')
        setIsRedirecting(true)
        router.replace('/auth/login?redirect=/seller')
        return
      }
    }
  }, [mounted, loading, user, router, pathname, isRedirecting])

  // Show loading state while checking authentication
  if (!mounted || loading) {
    const loadingTime = loadingStartTime ? Date.now() - loadingStartTime : 0
    const isTimeout = loadingTime > 5000 // 5 second timeout
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Seller Portal...</p>
          {isTimeout && (
            <div className="mt-4">
              <p className="text-sm text-red-600 mb-2">
                Loading is taking longer than expected ({Math.round(loadingTime / 1000)}s)
              </p>
              <button
                onClick={() => router.replace('/auth/login?redirect=/seller')}
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

  // Show loading if user is not authenticated (while redirect is happening)
  if (!user || user.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SellerSidebar 
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        sidebarOpen ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : 'ml-0'
      }`}>
        {/* Header */}
        <SellerHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        {/* Breadcrumbs */}
        <SellerBreadcrumbs />
        
        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}