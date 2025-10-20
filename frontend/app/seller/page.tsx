'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { useDashboardStats, useOrders, useProducts } from '@/lib/hooks/useSellerData'
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Eye,
  Plus,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { AIInsightsWidget } from '@/components/ai/AIInsightsPanel'
import { NotificationWidget } from '@/components/ai/NotificationSystem'
import { AIAssistant } from '@/components/ai/AIAssistant'
import { useToast } from '@/components/ui/use-toast'

export default function SellerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Fetch dashboard data
  const { stats, isLoading: statsLoading, error: statsError, mutate: refreshStats } = useDashboardStats()
  const { orders: recentOrders, isLoading: ordersLoading } = useOrders({ 
    dateRange: '7d',
    // Limit to 5 most recent orders
  })
  const { products: topProducts, isLoading: productsLoading } = useProducts({
    status: 'published'
  })

  const handleRefresh = async () => {
    await refreshStats()
    toast({
      title: "Dashboard refreshed",
      description: "Latest data has been loaded",
    })
  }

  // Show loading state
  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // Show error state
  if (statsError && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Unable to load dashboard data</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your dashboard data. Please try again.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  // Use fallback data if API fails
  const dashboardData = stats || {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    avgRating: 0,
    viewsThisMonth: 0,
    sellerInfo: { name: user?.name || 'Seller', email: user?.email || '' }
  }

  // Get top 3 products by orders
  const topProductsByOrders = topProducts
    .sort((a, b) => (b.orders || 0) - (a.orders || 0))
    .slice(0, 3)

  // Get recent orders (last 5)
  const recentOrdersList = recentOrders.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {dashboardData.sellerInfo?.name || user?.name || 'Master Artisan'}! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Here&apos;s what&apos;s happening with your business today
                  </p>
          {statsError && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Using cached data - some information may be outdated
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/seller/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
          <Link href="/seller/upload">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.totalProducts}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <Package className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {dashboardData.totalOrders}
              </div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPrice(dashboardData.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {dashboardData.pendingOrders}
              </div>
              <div className="text-sm text-gray-600">Pending Orders</div>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                ⭐ {dashboardData.avgRating || 0}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {dashboardData.viewsThisMonth || 0}
              </div>
              <div className="text-sm text-gray-600">Views This Month</div>
            </div>
            <Eye className="w-8 h-8 text-indigo-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Orders */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/seller/orders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            {ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentOrdersList.length > 0 ? (
              <div className="space-y-3">
                {recentOrdersList.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.productTitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent orders</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - AI Widgets */}
        <div className="space-y-6">
          {/* AI Insights Widget */}
          <AIInsightsWidget data={dashboardData} />
          
          {/* Notification Widget */}
          <NotificationWidget context={dashboardData} />
          
                  {/* AI Assistant Widget */}
                  <AIAssistant context={dashboardData} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/seller/upload">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Plus className="w-6 h-6 mb-2" />
              Add Product
            </Button>
          </Link>
          <Link href="/seller/orders">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <ShoppingCart className="w-6 h-6 mb-2" />
              Manage Orders
            </Button>
          </Link>
          <Link href="/seller/analytics">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <BarChart3 className="w-6 h-6 mb-2" />
              View Analytics
            </Button>
          </Link>
          <Link href="/seller/settings">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
              <Users className="w-6 h-6 mb-2" />
              Settings
            </Button>
          </Link>
        </div>
      </Card>

      {/* AI Assistant */}
      <AIAssistant context={dashboardData} />
    </div>
  )
}