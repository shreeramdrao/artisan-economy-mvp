// frontend/context/auth-context.tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // ✅ Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('authUser')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('authUser')
      }
    }
  }, [])

  // ✅ Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authUser') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue))
          } catch {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // ✅ Save user → localStorage + cookie + redirect
  const login = (userData: User) => {
    if (typeof window !== 'undefined') {
      // Save to localStorage
      localStorage.setItem('authUser', JSON.stringify(userData))

      // Save to cookie (middleware reads this)
      document.cookie = `authUser=${encodeURIComponent(
        JSON.stringify(userData)
      )}; path=/`
    }
    setUser(userData)

    // 🔑 Redirect
    if (userData.role === 'seller') {
      router.push('/seller')
    } else {
      router.push('/buyer')
    }
  }

  // ✅ Clear user everywhere + redirect to login
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser')

      // Expire cookie
      document.cookie =
        'authUser=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    setUser(null)

    // 🔑 If user is on a protected page, redirect back after login
    if (pathname.startsWith('/seller')) {
      router.push('/auth/login?redirect=/seller')
    } else if (pathname.startsWith('/buyer')) {
      router.push('/auth/login?redirect=/buyer')
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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