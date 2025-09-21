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

  // 🔑 capture redirect param
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

      // ✅ Auto-login
      login({
        userId: res.userId,
        name,
        email,
        role: res.role, // trust backend role
      })

      toast({
        title: '✅ Registration successful',
        description: `Welcome, ${name}!`,
      })

      // ✅ redirect logic
      if (redirectParam) {
        router.replace(redirectParam)
      } else {
        router.replace(res.role === 'seller' ? '/seller' : '/buyer')
      }
    } catch (err: any) {
      console.error('Registration failed:', err)
      toast({
        title: '❌ Registration failed',
        description: err.response?.data?.message || 'Please try again',
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

// ✅ Wrap in Suspense to avoid Next.js prerender error
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  )
}