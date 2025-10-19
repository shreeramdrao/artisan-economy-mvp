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
  
  // ✅ Single auth initialization effect with deterministic loading
  useEffect(() => {
    const loadUser = async () => {
      console.debug('🔄 AuthProvider: Starting auth load...')
      const startTime = Date.now()
      
      try {
        // Check if we have authUser cookie
        const cookieUser = getCookie('authUser')
        const tokenCookie = getCookie('token')
        
        console.debug(`🍪 AuthProvider: Cookies found - authUser=${!!cookieUser}, token=${!!tokenCookie}`)
        
        // If no cookies, user is not logged in - set loading false immediately
        if (!cookieUser || !tokenCookie) {
          console.debug('❌ AuthProvider: No cookies found, user not logged in')
          setUser(null)
          setLoading(false)
          return
        }
        
        // Parse user data with proper error handling
        let parsed: User
        try {
          parsed = JSON.parse(decodeURIComponent(cookieUser))
          console.debug('✅ AuthProvider: Successfully parsed user data:', parsed.role)
        } catch (parseErr) {
          console.error('❌ AuthProvider: JSON parse error:', parseErr)
          setUser(null)
          setLoading(false)
          return
        }
        
        setUser(parsed)

        // ✅ Non-blocking token verification - don't block initial state resolution
        // Let middleware handle server-side redirects for invalid tokens
        try {
          console.debug('🔍 AuthProvider: Verifying token...')
          const res = await authApi.verify(tokenCookie)
          if (!res.valid) {
            console.warn('⚠️ AuthProvider: JWT expired or invalid, clearing user state...')
            setUser(null)
          } else {
            console.debug('✅ AuthProvider: Token verification successful')
          }
        } catch (verifyErr) {
          console.warn('⚠️ AuthProvider: Token verification failed:', verifyErr)
          // Don't clear user state here - let middleware handle redirects
        }
      } catch (err) {
        console.error('❌ AuthProvider: Auth error during user load:', err)
        setUser(null)
      } finally {
        // ✅ Always set loading false - guarantee deterministic behavior
        const loadTime = Date.now() - startTime
        console.debug(`✅ AuthProvider: Auth load completed in ${loadTime}ms, setting loading=false`)
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

  // ✅ Save user → backend handles cookies, just update local state
  const login = (userData: User) => {
    try {
      if (typeof window !== 'undefined') {
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

  // ✅ Logout → backend handles cookie clearing via API call
  const logout = () => {
    if (typeof window !== 'undefined') {
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
      {children}
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