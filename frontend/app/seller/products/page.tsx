'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  Package,
  TrendingUp,
  Eye as EyeIcon
} from 'lucide-react'
import { useProducts, useProductMutations, useDebounce } from '@/lib/hooks/useSellerData'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default function ProductsPage() {
  const { toast } = useToast()
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null)

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Fetch products with filters
  const { products, isLoading, error, mutate } = useProducts({
    status: selectedStatus,
    search: debouncedSearch,
    category: categoryFilter
  })

  // Product mutations
  const { updateProduct, deleteProduct } = useProductMutations()

  const handleDeleteProduct = async (productId: string) => {
    setDeletingProduct(productId)
    try {
      const result = await deleteProduct(productId)
      if (result.success) {
        toast({
          title: "Product deleted",
          description: "Product has been successfully deleted",
        })
        // Refresh products data
        mutate()
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Failed to delete product",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the product",
        variant: "destructive"
      })
    } finally {
      setDeletingProduct(null)
    }
  }

  const handleStatusUpdate = async (productId: string, newStatus: string) => {
    try {
      const result = await updateProduct(productId, { status: newStatus as any })
      if (result.success) {
        toast({
          title: "Product updated",
          description: `Product status changed to ${newStatus}`,
        })
        // Refresh products data
        mutate()
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Failed to update product",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "An error occurred while updating the product",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = async () => {
    await mutate()
    toast({
      title: "Products refreshed",
      description: "Latest product data has been loaded",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate product stats
  const productStats = {
    total: products.length,
    published: products.filter(p => p.status === 'published').length,
    draft: products.filter(p => p.status === 'draft').length,
    archived: products.filter(p => p.status === 'archived').length,
    totalViews: products.reduce((sum, p) => sum + (p.views || 0), 0),
    totalOrders: products.reduce((sum, p) => sum + (p.orders || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Product Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
          {error && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ Unable to load products - using cached data
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
          <Link href="/seller/upload">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{productStats.total}</div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{productStats.published}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{productStats.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{productStats.archived}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{productStats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{productStats.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
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
                placeholder="Search products..."
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
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            <option value="pottery">Pottery</option>
            <option value="woodwork">Woodwork</option>
            <option value="textiles">Textiles</option>
            <option value="metalwork">Metalwork</option>
            <option value="jewelry">Jewelry</option>
          </select>
        </div>
      </Card>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-8"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.productId} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.imageUrl || '/images/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <Badge className={`absolute top-2 right-2 ${getStatusColor(product.status)}`}>
                  {product.status}
                </Badge>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 capitalize">{product.category}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {product.views || 0}
                    </div>
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {product.orders || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link href={`/seller/products/${product.productId}/edit`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/seller/products/${product.productId}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        disabled={deletingProduct === product.productId}
                      >
                        {deletingProduct === product.productId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {product.status !== 'published' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(product.productId, 'published')}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {product.status !== 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(product.productId, 'draft')}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Move to Draft
                        </DropdownMenuItem>
                      )}
                      {product.status !== 'archived' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(product.productId, 'archived')}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProduct(product.productId)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedStatus !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t created any products yet'
            }
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => {
              setSearchQuery('')
              setSelectedStatus('all')
              setCategoryFilter('all')
            }}>
              Clear Filters
            </Button>
            <Link href="/seller/upload">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Product
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Bulk Actions */}
      {products.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {products.length} products selected
              </span>
              <Button variant="outline" size="sm">
                Bulk Publish
              </Button>
              <Button variant="outline" size="sm">
                Bulk Archive
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
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Advanced Product Features Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on bulk editing, product variants, 
            and automated inventory management.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">Bulk Edit</Button>
            <Button variant="outline" size="sm">Product Variants</Button>
            <Button variant="outline" size="sm">Auto Inventory</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}