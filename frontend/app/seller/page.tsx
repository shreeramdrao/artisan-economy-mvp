'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { sellerApi } from '@/lib/api'
import { useAuth } from '@/context/auth-context' // ✅ Import Auth context

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth() // ✅ Get logged-in user

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return // wait until user is loaded
      try {
        // ✅ no userId param anymore, backend uses cookie/auth
        const data = await sellerApi.getDashboard()
        setStats(data)
      } catch (err) {
        console.error('❌ Failed to load dashboard:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [user])

  if (loading) {
    return <p className="p-8 text-center">Loading dashboard...</p>
  }

  if (error || !stats) {
    return <p className="p-8 text-center text-red-600">{error || 'No data available'}</p>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {stats.sellerInfo?.name || user?.name || 'Master Artisan'}!
        </h1>
        <p className="text-gray-600">Here's an overview of your business</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-6">
          <div className="text-2xl font-bold text-orange-600">
            {stats.totalProducts}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalOrders}
          </div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </div>
          <div className="text-sm text-gray-600">Pending Orders</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-purple-600">
            ⭐ {stats.avgRating || 0}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </Card>
        <Card className="p-6">
          <div className="text-2xl font-bold text-indigo-600">
            {stats.viewsThisMonth || 0}
          </div>
          <div className="text-sm text-gray-600">Views This Month</div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/seller/upload" className="block">
              <Button className="w-full justify-start">
                <span className="mr-2">📸</span>
                Upload New Product
              </Button>
            </Link>
            <Link href="/seller/products" className="block">
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2">📦</span>
                Manage Products
              </Button>
            </Link>
            <Link href="/seller/payments" className="block">
              <Button variant="outline" className="w-full justify-start">
                <span className="mr-2">💰</span>
                View Payments
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">📊</span>
              Download Reports
            </Button>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

          {/* Pending Orders */}
          <h3 className="font-semibold mb-2 text-yellow-700">⏳ Pending</h3>
          <div className="space-y-3 mb-4">
            {stats.recentOrders?.pending?.length > 0 ? (
              stats.recentOrders.pending.map((order: any) => (
                <div key={order.orderId} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{order.products?.[0]?.productTitle}</div>
                      <div className="text-sm text-gray-600">by {order.buyerName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(order.amount)}</div>
                      <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Pending
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No pending orders</p>
            )}
          </div>

          {/* Confirmed Orders */}
          <h3 className="font-semibold mb-2 text-green-700">✅ Confirmed</h3>
          <div className="space-y-3">
            {stats.recentOrders?.confirmed?.length > 0 ? (
              stats.recentOrders.confirmed.map((order: any) => (
                <div key={order.orderId} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{order.products?.[0]?.productTitle}</div>
                      <div className="text-sm text-gray-600">by {order.buyerName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Ship to: {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
                        {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                      </div>
                      <div className="text-xs text-gray-500">
                        Contact: {order.buyerContact}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatPrice(order.amount)}</div>
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Confirmed
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No confirmed orders</p>
            )}
          </div>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50">
        <h2 className="text-xl font-bold mb-4">💡 Tips to Increase Sales</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">📸 Better Photos</h3>
            <p className="text-sm text-gray-600">
              Upload clear photos with good lighting. Our AI will enhance them further!
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📝 Tell Your Story</h3>
            <p className="text-sm text-gray-600">
              Share the heritage and craftsmanship behind your products. Buyers love authenticity!
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🎯 Fair Pricing</h3>
            <p className="text-sm text-gray-600">
              Use our AI price suggestions to find the sweet spot between value and profit.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}