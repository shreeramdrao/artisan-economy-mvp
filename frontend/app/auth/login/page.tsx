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

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'seller' | 'buyer'>('buyer')
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 🔑 capture redirect query param
  const redirectParam = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await authApi.login({ email, password, role })

      // ✅ Save to context + localStorage
      login({
        userId: res.userId,
        name: res.name,
        email: res.email,
        role: res.role,
      })

      toast({
        title: '✅ Login successful',
        description: `Welcome back, ${res.name}!`,
      })

      // ✅ Redirect priority
      if (redirectParam) {
        router.replace(redirectParam)
      } else {
        router.replace(res.role === 'seller' ? '/seller' : '/buyer')
      }
    } catch (err: any) {
      console.error('Login failed:', err)
      toast({
        title: '❌ Login failed',
        description: err.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 px-4">
      <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl bg-white">
        <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">
          Artisan Economy Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
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

          {/* Role */}
          <div>
            <Label htmlFor="role">Login as</Label>
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{' '}
          <a
            href={`/auth/register${redirectParam ? `?redirect=${redirectParam}` : ''}`}
            className="text-orange-600 font-medium hover:underline"
          >
            Register
          </a>
        </p>
      </Card>
    </div>
  )
}

// ✅ Wrap in Suspense to fix Next.js build error
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  )
}