'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { buyerApi } from '@/lib/api'

export default function OrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        // TODO: replace "buyer123" with logged-in userId
        const res = await buyerApi.getOrders('buyer123')
        setOrders(res || [])
      } catch (err) {
        console.error('❌ Failed to fetch orders:', err)
        toast({
          title: 'Error',
          description: 'Could not load your orders',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) return <p className="p-8 text-center">Loading your orders...</p>

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">No Orders Yet</h2>
        <Link href="/buyer">
          <Button>Shop Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.orderId} className="p-6">
            {/* Order Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">
                  Order ID: {order.orderId}
                </h2>
                <p className="text-gray-600">
                  Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600">
                  {formatPrice(order.totalAmount)}
                </p>
                <p
                  className={`mt-1 font-medium ${
                    order.status === 'confirmed'
                      ? 'text-green-600'
                      : order.status === 'pending'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}
                >
                  {order.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Products in this order */}
            <div className="mt-4 space-y-3">
              {order.products?.map((p: any) => (
                <div
                  key={p.productId}
                  className="flex justify-between items-center border-t pt-3"
                >
                  <div>
                    <h3 className="font-medium">{p.productTitle}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {p.quantity} × {formatPrice(p.price)}
                    </p>
                  </div>
                  <Link href={`/buyer/product/${p.productId}`}>
                    <Button variant="outline" size="sm">
                      View Product
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            <div className="mt-4 border-t pt-4 text-sm text-gray-500">
              <p>
                {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p>Contact: {order.shippingAddress?.phone}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}