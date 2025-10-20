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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Filter,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useOrders, useOrderMutations, useDebounce } from '@/lib/hooks/useSellerData'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils'

export default function OrdersPage() {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch orders with filters
  const { orders, isLoading, error, mutate } = useOrders({
    status: selectedStatus,
    search: debouncedSearch,
    dateRange: dateFilter
  })

  // Order mutations
  const { updateOrderStatus } = useOrderMutations()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <Package className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed'
      case 'confirmed': return 'shipped'
      case 'shipped': return 'delivered'
      default: return null
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      const result = await updateOrderStatus(orderId, newStatus)
      if (result.success) {
        toast({
          title: "Order updated",
          description: `Order status changed to ${newStatus}`,
        })
        // Refresh orders data
        mutate()
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update order status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating the order",
        variant: "destructive"
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleRefresh = async () => {
    await mutate()
    toast({
      title: "Orders refreshed",
      description: "Latest order data has been loaded",
    })
  }

  // Calculate order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Order Management</h1>
          <p className="text-gray-600">Track and manage all your customer orders</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Unable to load orders - using cached data
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{orderStats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{orderStats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
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
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              />
            </div>
          </div>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading orders...
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      #{order.id.split('-')[1]}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-600">{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {order.productTitle}
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            disabled={updatingOrder === order.id}
                          >
                            {updatingOrder === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {getNextStatus(order.status) && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Mark as {getNextStatus(order.status)}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Truck className="mr-2 h-4 w-4" />
                            Track Shipment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h2 className="text-2xl font-semibold mb-2">No orders found</h2>
                      <p className="text-gray-600 mb-6">
                        {searchQuery || selectedStatus !== 'all' || dateFilter !== 'all'
                          ? 'Try adjusting your search or filter criteria'
                          : 'You haven\'t received any orders yet'
                        }
                      </p>
                      <Button variant="outline" onClick={() => {
                        setSearchQuery('')
                        setSelectedStatus('all')
                        setDateFilter('all')
                      }}>
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bulk Actions */}
      {orders.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {orders.length} orders selected
              </span>
              <Button variant="outline" size="sm">
                Bulk Update Status
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </Card>
      )}

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Order Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on bulk order processing, automated status updates, 
            and integrated shipping labels.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Bulk Actions</Button>
            <Button variant="outline" size="sm">Auto Updates</Button>
            <Button variant="outline" size="sm">Shipping Labels</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
