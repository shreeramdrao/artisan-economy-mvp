'use client'

import { useEffect, useState } from 'react'
import { buyerApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<string[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const candidates: string[] = []
      if (user.userId) candidates.push(user.userId)
      if (user.email) candidates.push(user.email)
      if ((user as any).id) candidates.push((user as any).id)

      console.log('🟢 Buyer Orders - trying IDs:', candidates)
      setDebug((prev) => [...prev, `Trying IDs: ${candidates.join(', ')}`])

      for (const id of candidates) {
        try {
          const data = await buyerApi.getOrders(id)
          console.log(`✅ Orders fetched for ${id}:`, data)
          setOrders(data || [])
          setLoading(false)
          return
        } catch (err: any) {
          console.error(`❌ Failed for ${id}:`, err)
          setDebug((prev) => [...prev, `Failed for ${id}: ${err.message}`])
        }
      }

      setError('No orders found for this account.')
      setLoading(false)
    }

    fetchOrders()
  }, [user])

  if (!user) return <p className="text-center mt-10">⚠️ Please log in to see your orders.</p>
  if (loading) return <p className="text-center mt-10">⏳ Loading orders...</p>

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
          <pre className="bg-gray-100 text-xs p-2 mt-2 rounded">
            {debug.join('\n')}
          </pre>
        </div>
      )}

      {!error && orders.length === 0 && (
        <p className="text-gray-600">🛒 No orders yet.</p>
      )}

      {orders.length > 0 && (
        <div className="grid gap-6">
          {orders.map((order: any) => (
            <Card key={order.orderId || order.id} className="p-6">
              <h2 className="font-semibold text-lg">
                Order #{order.orderId || order.id}
              </h2>
              <p className="text-sm text-gray-500">
                Status: {order.status || 'Confirmed'}
              </p>
              <p className="mt-2">
                Total: {formatPrice(order.totalAmount || order.total || 0)}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {(order.products || order.items || []).map((p: any, idx: number) => (
                  <li key={idx}>
                    {(p.quantity || 1)} × {p.productTitle || p.title || 'Product'} —{' '}
                    {formatPrice(p.price || 0)}
                  </li>
                ))}
              </ul>
              {order.shippingAddress && (
                <p className="mt-2 text-sm text-gray-500">
                  Shipping: {order.shippingAddress.name},{' '}
                  {order.shippingAddress.city}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}