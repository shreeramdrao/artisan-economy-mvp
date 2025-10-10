'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi } from '@/lib/api'

type Role = 'seller' | 'buyer'

type User = {
  userId: string
  name: string
  email: string
  role: Role
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ Auto-load from cookies (authUser) on first mount with error handling
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have authUser cookie
        const cookieUser = getCookie('authUser')
        if (cookieUser) {
          const parsed = JSON.parse(decodeURIComponent(cookieUser))
          setUser(parsed)
        }

        // Verify token via backend (ensures JWT still valid)
        const tokenCookie = getCookie('token')
        if (!tokenCookie) {
          // No token found, logout user
          logout()
          return
        }

        const res = await authApi.verify(tokenCookie)
        if (!res.valid) {
          console.warn('JWT expired or invalid, forcing logout...')
          logout()
        }
      } catch (err) {
        console.error('Auth error during user load:', err)
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // ✅ Utility to get a cookie by name
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? match[2] : null
  }

  // ✅ Save user → cookie only (no localStorage for security, no JWT token storage)
  const login = (userData: User) => {
    try {
      if (typeof window !== 'undefined') {
        // Only store user data (email, role, name, userId) - NEVER store JWT token
        const safeUserData = {
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        }
        
        // Set the authUser cookie (non-sensitive data only)
        document.cookie = `authUser=${encodeURIComponent(
          JSON.stringify(safeUserData)
        )}; path=/; SameSite=Lax; Secure; max-age=${7 * 24 * 60 * 60}` // 7 days
        
        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(new CustomEvent('authChanged'))
      }
      
      setUser(userData)

      // Redirect based on role
      if (userData.role === 'seller') {
        router.push('/seller')
      } else {
        router.push('/buyer')
      }
    } catch (err) {
      console.error('Auth error during login:', err)
      logout()
    }
  }

  // ✅ Logout → clear all cookies securely (no localStorage)
  const logout = () => {
    if (typeof window !== 'undefined') {
      // Clear authUser cookie securely
      document.cookie = 'authUser=; Max-Age=0; path=/; Secure; SameSite=Lax'
      // Clear token cookie securely (though it's httpOnly, this ensures cleanup)
      document.cookie = 'token=; Max-Age=0; path=/; Secure; SameSite=Lax'
      
      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new CustomEvent('authChanged'))
    }

    setUser(null)

    // Redirect based on where the user was
    if (pathname.startsWith('/seller')) {
      router.push('/auth/login?redirect=/seller')
    } else if (pathname.startsWith('/buyer')) {
      router.push('/auth/login?redirect=/buyer')
    } else {
      router.push('/auth/login')
    }
  }

  // ✅ Sync user changes across tabs via custom events (no localStorage)
  useEffect(() => {
    const handleAuthChange = () => {
      // Reload user from cookies when auth changes in other tabs
      const cookieUser = getCookie('authUser')
      if (cookieUser) {
        const parsed = JSON.parse(decodeURIComponent(cookieUser))
        setUser(parsed)
      } else {
        setUser(null)
      }
    }

    // Listen for custom auth events
    window.addEventListener('authChanged', handleAuthChange)
    return () => window.removeEventListener('authChanged', handleAuthChange)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}