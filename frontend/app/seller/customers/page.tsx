'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Users, 
  ShoppingCart, 
  Star, 
  Mail, 
  Phone, 
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  MessageCircle
} from 'lucide-react'

// Mock customers data
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    totalOrders: 5,
    totalSpent: 12500,
    lastOrder: '2024-01-15T10:30:00Z',
    avgRating: 4.8,
    status: 'active'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98765 43211',
    location: 'Delhi, Delhi',
    totalOrders: 3,
    totalSpent: 8400,
    lastOrder: '2024-01-14T15:45:00Z',
    avgRating: 4.5,
    status: 'active'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 98765 43212',
    location: 'Bangalore, Karnataka',
    totalOrders: 8,
    totalSpent: 25600,
    lastOrder: '2024-01-13T09:15:00Z',
    avgRating: 4.9,
    status: 'vip'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+91 98765 43213',
    location: 'Chennai, Tamil Nadu',
    totalOrders: 2,
    totalSpent: 4800,
    lastOrder: '2024-01-12T14:20:00Z',
    avgRating: 4.2,
    status: 'active'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+91 98765 43214',
    location: 'Pune, Maharashtra',
    totalOrders: 1,
    totalSpent: 4500,
    lastOrder: '2024-01-11T11:00:00Z',
    avgRating: 4.0,
    status: 'inactive'
  }
]

const customerStats = {
  total: mockCustomers.length,
  active: mockCustomers.filter(c => c.status === 'active').length,
  vip: mockCustomers.filter(c => c.status === 'vip').length,
  inactive: mockCustomers.filter(c => c.status === 'inactive').length,
  totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
  avgOrderValue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0)
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Customer Management</h1>
          <p className="text-gray-600">Manage your customer relationships and track their activity</p>
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

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{customerStats.total}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{customerStats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{customerStats.vip}</div>
            <div className="text-sm text-gray-600">VIP</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{customerStats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">₹{customerStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">₹{Math.round(customerStats.avgOrderValue).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Avg Order Value</div>
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
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              />
            </div>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Customers</option>
            <option value="active">Active</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Customers Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">ID: {customer.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {customer.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-1 text-gray-400" />
                      {customer.totalOrders}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{customer.totalSpent.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{customer.avgRating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(customer.lastOrder).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(customer.status)}>
                      {customer.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Empty State */}
      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold mb-2">No customers found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t had any customers yet'
            }
          </p>
          <Button variant="outline">Clear Filters</Button>
        </Card>
      )}

      {/* Top Customers */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {mockCustomers
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 3)
            .map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {customer.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.totalOrders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{customer.avgRating}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Customer Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on customer segmentation, loyalty programs, 
            and automated marketing campaigns.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Segmentation</Button>
            <Button variant="outline" size="sm">Loyalty Program</Button>
            <Button variant="outline" size="sm">Marketing Campaigns</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
