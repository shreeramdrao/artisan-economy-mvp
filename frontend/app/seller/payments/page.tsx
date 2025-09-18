'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { sellerApi } from '@/lib/api'
import type { SellerPaymentResponse } from '@/types/seller'
import { useAuth } from '@/context/auth-context'  // ✅ use auth context

export default function PaymentsPage() {
  const [payments, setPayments] = useState<SellerPaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isAuthenticated } = useAuth() // ✅ check if seller is logged in

  useEffect(() => {
    async function fetchPayments() {
      if (!isAuthenticated) return // wait until logged in
      try {
        const data = await sellerApi.getPayments() // ✅ no sellerId needed
        setPayments(data || [])
      } catch (err) {
        console.error('Failed to load payments:', err)
        setError('Failed to load payment data')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [isAuthenticated])

  if (loading) {
    return <p className="p-8 text-center">Loading payments...</p>
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">{error}</p>
  }

  if (payments.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">No Payments Found</h2>
        <p className="text-gray-600">
          You haven’t received any completed payments yet.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">💰 Completed Payments</h1>

      <div className="space-y-6">
        {payments.map((p) => (
          <Card key={`${p.orderId}-${p.productId}`} className="p-6">
            <div className="flex justify-between items-start">
              {/* Left section - payment details */}
              <div>
                <h2 className="text-xl font-semibold">{p.productTitle}</h2>
                <p className="text-gray-600">Order ID: {p.orderId}</p>
                <p className="text-gray-600">Quantity: {p.quantity}</p>
                <p className="text-gray-600">
                  Buyer: {p.buyerName}{' '}
                  {p.buyerContact ? `(${p.buyerContact})` : ''}
                </p>
                {p.shippingAddress && (
                  <p className="text-gray-600 text-sm mt-2">
                    Ship to: {p.shippingAddress.address},{' '}
                    {p.shippingAddress.city}, {p.shippingAddress.state} -{' '}
                    {p.shippingAddress.pincode}
                  </p>
                )}
              </div>

              {/* Right section - amount & status */}
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {formatPrice(p.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block">
                  {p.paymentStatus || 'completed'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}