'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  Download,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useAnalytics, useDebounce } from '@/lib/hooks/useSellerData'
import { AIInsightsPanel } from '@/components/ai/AIInsightsPanel'
import { PredictiveAnalytics } from '@/components/ai/PredictiveAnalytics'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('30d')
  
  // Fetch analytics data
  const { data: analytics, isLoading, error, mutate } = useAnalytics(timeRange)

  const handleRefresh = async () => {
    await mutate()
    toast({
      title: "Analytics refreshed",
      description: "Latest analytics data has been loaded",
    })
  }

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your analytics report is being prepared for download",
    })
  }

  // Mock data for demonstration when API fails
  const mockAnalytics = {
    totalRevenue: 125000,
    totalOrders: 156,
    conversionRate: 3.2,
    avgOrderValue: 801,
    revenueChange: 12.5,
    ordersChange: 8.3,
    conversionChange: -2.1,
    aovChange: 4.7,
    salesData: [
      { month: 'Jan', sales: 45 },
      { month: 'Feb', sales: 52 },
      { month: 'Mar', sales: 48 },
      { month: 'Apr', sales: 61 },
      { month: 'May', sales: 55 },
      { month: 'Jun', sales: 67 }
    ],
    revenueData: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 55000 },
      { month: 'Jun', revenue: 67000 }
    ],
    topProducts: [
      { name: 'Handmade Pottery Set', revenue: 25000, orders: 45, growth: 15.2 },
      { name: 'Wooden Sculpture', revenue: 18000, orders: 32, growth: 8.7 },
      { name: 'Textile Art Piece', revenue: 15000, orders: 28, growth: 22.1 },
      { name: 'Ceramic Vases', revenue: 12000, orders: 24, growth: -3.2 },
      { name: 'Metal Artwork', revenue: 10000, orders: 20, growth: 5.8 }
    ]
  }

  const data = analytics || mockAnalytics

  // Chart colors
  const COLORS = ['#f97316', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

  // Order status data for pie chart
  const orderStatusData = [
    { name: 'Delivered', value: 45, color: '#10b981' },
    { name: 'Shipped', value: 25, color: '#8b5cf6' },
    { name: 'Confirmed', value: 15, color: '#3b82f6' },
    { name: 'Pending', value: 10, color: '#f59e0b' },
    { name: 'Cancelled', value: 5, color: '#ef4444' }
  ]

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and growth</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Using demo data - backend connection failed
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(data.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(data.revenueChange)}
                <span className={`text-sm ml-1 ${getChangeColor(data.revenueChange)}`}>
                  {Math.abs(data.revenueChange)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalOrders}</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(data.ordersChange)}
                <span className={`text-sm ml-1 ${getChangeColor(data.ordersChange)}`}>
                  {Math.abs(data.ordersChange)}%
                </span>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.conversionRate}%</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(data.conversionChange)}
                <span className={`text-sm ml-1 ${getChangeColor(data.conversionChange)}`}>
                  {Math.abs(data.conversionChange)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(data.avgOrderValue)}</p>
              <div className="flex items-center mt-1">
                {getChangeIcon(data.aovChange)}
                <span className={`text-sm ml-1 ${getChangeColor(data.aovChange)}`}>
                  {Math.abs(data.aovChange)}%
                </span>
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel data={data} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <Badge variant="outline">Monthly</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [formatPrice(value as number), 'Revenue']} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Sales Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
            <Badge variant="outline">Monthly</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
            <Badge variant="outline">Revenue</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [formatPrice(value as number), 'Revenue']} />
              <Bar dataKey="revenue" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Order Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
            <Badge variant="outline">Distribution</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <PredictiveAnalytics historicalData={data.revenueData} />

      {/* Top Products Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Performance</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Orders</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((product, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{formatPrice(product.revenue)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600">{product.orders}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center ${getChangeColor(product.growth)}`}>
                      {getChangeIcon(product.growth)}
                      <span className="ml-1">{Math.abs(product.growth)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Revenue Growth</h4>
            <p className="text-sm text-gray-600">
              Your revenue has grown by {data.revenueChange}% this period. 
              {data.revenueChange > 0 ? ' Keep up the great work!' : ' Consider reviewing your pricing strategy.'}
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Order Volume</h4>
            <p className="text-sm text-gray-600">
              You&apos;ve received {data.totalOrders} orders with an average value of {formatPrice(data.avgOrderValue)}. 
              Focus on increasing order frequency.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Top Performer</h4>
            <p className="text-sm text-gray-600">
              {data.topProducts[0]?.name} is your best-selling product with {data.topProducts[0]?.growth}% growth. 
              Consider promoting similar items.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Conversion Rate</h4>
            <p className="text-sm text-gray-600">
              Your conversion rate is {data.conversionRate}%. 
              {data.conversionChange > 0 ? ' This is improving!' : ' Consider optimizing your product pages.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Analytics Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on customer segmentation, predictive analytics, 
            and automated insights to help you make data-driven decisions.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Customer Segments</Button>
            <Button variant="outline" size="sm">Predictive Analytics</Button>
            <Button variant="outline" size="sm">Automated Reports</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}