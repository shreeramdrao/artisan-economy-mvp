'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/auth-context'

// ✅ Helper to set cookies manually (client-side)
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=None; Secure`
}

function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'seller' | 'buyer'>('buyer')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await authApi.register({
        name,
        email,
        phone,
        password,
        role,
      })

      const { token, user } = res
      if (!token || !user) throw new Error('Invalid response from server')

      // ✅ Store JWT + user cookies
      setCookie('token', token, 7)
      setCookie('authUser', JSON.stringify(user), 7)

      // ✅ Update Auth Context
      login({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      toast({
        title: '✅ Registration Successful',
        description: `Welcome, ${user.name}!`,
      })

      // ✅ Redirect
      if (redirectParam) {
        router.replace(redirectParam)
      } else {
        router.replace(user.role === 'seller' ? '/seller' : '/buyer')
      }
    } catch (err: any) {
      console.error('❌ Registration failed:', err)
      toast({
        title: 'Registration Failed',
        description: err.response?.data?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl bg-white">
        <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Create an Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Lakshmi Crafts"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role">Register as</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'seller' | 'buyer')}
              className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <a
            href={`/auth/login${redirectParam ? `?redirect=${redirectParam}` : ''}`}
            className="text-orange-600 font-medium hover:underline"
          >
            Login
          </a>
        </p>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  )
}