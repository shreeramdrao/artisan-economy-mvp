'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/api'

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

  // ✅ Auto-load from cookies (authUser) on first mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have authUser cookie
        const cookieUser = getCookie('authUser')
        if (cookieUser) {
          const parsed = JSON.parse(decodeURIComponent(cookieUser))
          setUser(parsed)
        }

        // Optional: verify token via backend (ensures JWT still valid)
        const tokenCookie = getCookie('token')
        if (tokenCookie) {
          const res = await api.post('/auth/verify', { token: tokenCookie })
          if (!res.data.valid) {
            console.warn('JWT expired, forcing logout...')
            logout()
          }
        }
      } catch (err) {
        console.error('Failed to load user from cookie:', err)
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

  // ✅ Save user → cookie + localStorage
  const login = (userData: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authUser', JSON.stringify(userData))
      document.cookie = `authUser=${encodeURIComponent(
        JSON.stringify(userData)
      )}; path=/; SameSite=None; Secure`
    }
    setUser(userData)

    // Redirect based on role
    if (userData.role === 'seller') {
      router.push('/seller')
    } else {
      router.push('/buyer')
    }
  }

  // ✅ Logout → clear all data
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser')
      document.cookie = 'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure'
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure'
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

  // ✅ Sync user changes across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authUser') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue))
        } else {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
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