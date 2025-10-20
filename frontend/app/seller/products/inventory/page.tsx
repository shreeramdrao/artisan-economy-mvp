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
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Save, 
  X,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useProducts, useProductMutations, useDebounce } from '@/lib/hooks/useSellerData'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils'

export default function InventoryPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingStock, setEditingStock] = useState<string | null>(null)
  const [stockValue, setStockValue] = useState<number>(0)
  const [updatingStock, setUpdatingStock] = useState<string | null>(null)

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch products for inventory
  const { products, isLoading, error, mutate } = useProducts({
    search: debouncedSearch,
    status: 'published' // Only show published products in inventory
  })

  // Product mutations
  const { updateProduct } = useProductMutations()

  const handleEditStock = (productId: string, currentStock: number) => {
    setEditingStock(productId)
    setStockValue(currentStock)
  }

  const handleCancelEdit = () => {
    setEditingStock(null)
    setStockValue(0)
  }

  const handleSaveStock = async (productId: string) => {
    setUpdatingStock(productId)
    try {
      const result = await updateProduct(productId, { stock: stockValue })
      if (result.success) {
        toast({
          title: "Stock updated",
          description: `Stock updated to ${stockValue} units`,
        })
        setEditingStock(null)
        // Refresh products data
        mutate()
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update stock",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating stock",
        variant: "destructive"
      })
    } finally {
      setUpdatingStock(null)
    }
  }

  const handleRefresh = async () => {
    await mutate()
    toast({
      title: "Inventory refreshed",
      description: "Latest inventory data has been loaded",
    })
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
    if (stock <= 5) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    return { status: 'good', color: 'bg-green-100 text-green-800', icon: CheckCircle }
  }

  // Calculate inventory stats
  const inventoryStats = {
    totalProducts: products.length,
    outOfStock: products.filter(p => (p.stock || 0) === 0).length,
    lowStock: products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length,
    inStock: products.filter(p => (p.stock || 0) > 5).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Inventory Management</h1>
          <p className="text-gray-600">Track and manage your product stock levels</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Unable to load inventory - using cached data
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <Package className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{inventoryStats.totalProducts}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
            <div className="text-sm text-gray-600">Out of Stock</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStock}</div>
            <div className="text-sm text-gray-600">Low Stock</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{inventoryStats.inStock}</div>
            <div className="text-sm text-gray-600">In Stock</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPrice(inventoryStats.totalValue)}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Low Stock Alert
          </Button>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => {
                  const stockStatus = getStockStatus(product.stock || 0)
                  const StatusIcon = stockStatus.icon
                  
                  return (
                    <TableRow key={product.productId} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <img
                            src={product.imageUrl || '/images/placeholder-product.jpg'}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.title}</div>
                            <div className="text-sm text-gray-600">ID: {product.productId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>
                        {editingStock === product.productId ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={stockValue}
                              onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveStock(product.productId)}
                              disabled={updatingStock === product.productId}
                            >
                              {updatingStock === product.productId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{product.stock || 0}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditStock(product.productId, product.stock || 0)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stockStatus.status === 'out' ? 'Out of Stock' :
                           stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(product.price * (product.stock || 0))}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <TrendingUp className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Package className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📦</div>
                      <h2 className="text-2xl font-semibold mb-2">No products found</h2>
                      <p className="text-gray-600 mb-6">
                        {searchQuery
                          ? 'Try adjusting your search criteria'
                          : 'You haven\'t created any products yet'
                        }
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Low Stock Alerts */}
      {products.filter(p => (p.stock || 0) <= 5).length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">⚠️ Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => (p.stock || 0) <= 5).map((product) => (
              <div key={product.productId} className="p-4 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{product.title}</h4>
                    <p className="text-sm text-gray-600">Only {product.stock || 0} units left</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {products.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {products.length} products in inventory
              </span>
              <Button variant="outline" size="sm">
                Bulk Restock
              </Button>
              <Button variant="outline" size="sm">
                Export Inventory
              </Button>
              <Button variant="outline" size="sm">
                Set Reorder Points
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Inventory Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on automated reorder points, supplier management, 
            and inventory forecasting.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Auto Reorder</Button>
            <Button variant="outline" size="sm">Supplier Management</Button>
            <Button variant="outline" size="sm">Forecasting</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}