'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'
import AuthErrorBoundary from '@/components/AuthErrorBoundary'
import Navbar from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthErrorBoundary>
        <CartProvider>
          <Navbar />
          {children}
          <Toaster />
        </CartProvider>
      </AuthErrorBoundary>
    </AuthProvider>
  )
}