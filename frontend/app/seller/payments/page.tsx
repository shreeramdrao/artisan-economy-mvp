'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { usePayments, useDebounce } from '@/lib/hooks/useSellerData'
import { useAuth } from '@/context/auth-context'
import { sellerApi } from '@/lib/api'
import type { SellerPaymentResponse } from '@/types/seller'
import { 
  CreditCard, 
  Download, 
  Filter, 
  Search,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react'

// Mock payments data for demonstration
const mockPayments = [
  {
    orderId: 'ORD-001',
    productId: 'PROD-001',
    productTitle: 'Handmade Pottery Set',
    quantity: 2,
    amount: 5000,
    buyerName: 'John Doe',
    buyerContact: '+91 98765 43210',
    paymentStatus: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
    shippingAddress: {
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    }
  },
  {
    orderId: 'ORD-002',
    productId: 'PROD-002',
    productTitle: 'Wooden Sculpture',
    quantity: 1,
    amount: 1800,
    buyerName: 'Jane Smith',
    buyerContact: '+91 98765 43211',
    paymentStatus: 'completed',
    createdAt: '2024-01-14T15:45:00Z',
    shippingAddress: {
      address: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001'
    }
  },
  {
    orderId: 'ORD-003',
    productId: 'PROD-003',
    productTitle: 'Textile Art Piece',
    quantity: 1,
    amount: 3200,
    buyerName: 'Mike Johnson',
    buyerContact: '+91 98765 43212',
    paymentStatus: 'completed',
    createdAt: '2024-01-13T09:15:00Z',
    shippingAddress: {
      address: '789 Garden Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  }
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<SellerPaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    async function fetchPayments() {
      if (!isAuthenticated) return
      try {
        const data = await sellerApi.getPayments()
        setPayments(data || [])
      } catch (err) {
        console.error('Failed to load payments:', err)
        // Use mock data as fallback
        setPayments(mockPayments as any)
        setError('Using demo data - backend connection failed')
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [isAuthenticated])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchQuery === '' || 
      payment.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const paymentDate = new Date(payment.createdAt)
    const now = new Date()
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === '7d' && paymentDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === '30d' && paymentDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
    
    return matchesSearch && matchesDate
  })

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const thisMonthRevenue = payments
    .filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + payment.amount, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">💰 Payment Management</h1>
          <p className="text-gray-600">Track your completed payments and revenue</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ {error}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{thisMonthRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-purple-600">{payments.length}</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Payment</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString() : '0'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              />
            </div>
          </div>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </Card>

      {/* Payments List */}
      {filteredPayments.length > 0 ? (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={`${payment.orderId}-${payment.productId}`} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                {/* Left section - payment details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{payment.productTitle}</h2>
                      <p className="text-gray-600">Order ID: {payment.orderId}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {payment.paymentStatus || 'completed'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Buyer:</span> {payment.buyerName}
                        {payment.buyerContact && ` (${payment.buyerContact})`}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Quantity:</span> {payment.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium">Date:</span> {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      {payment.shippingAddress && (
                        <p className="text-gray-600">
                          <span className="font-medium">Ship to:</span> {payment.shippingAddress.city}, {payment.shippingAddress.state}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {payment.shippingAddress && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Full Address:</span> {payment.shippingAddress.address}, {payment.shippingAddress.city}, {payment.shippingAddress.state} - {payment.shippingAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right section - amount */}
                <div className="text-right ml-6">
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    {formatPrice(payment.amount)}
                  </p>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-semibold mb-2">No payments found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery || dateFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t received any completed payments yet'
            }
          </p>
          <Button variant="outline">Clear Filters</Button>
        </Card>
      )}

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Payment Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on payment analytics, automated invoicing, 
            and integration with accounting software.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Payment Analytics</Button>
            <Button variant="outline" size="sm">Auto Invoicing</Button>
            <Button variant="outline" size="sm">Accounting Integration</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}