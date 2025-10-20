'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/context/auth-context'
import { sellerApi } from '@/lib/api'

// Get the API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

// Types for API responses
export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  avgRating: number
  viewsThisMonth: number
  sellerInfo?: {
    name: string
    email: string
  }
}

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  productTitle: string
  quantity: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  shippingAddress: string
  productId: string
}

export interface Product {
  productId: string
  title: string
  category: string
  price: number
  imageUrl: string
  status: 'published' | 'draft' | 'archived'
  views: number
  orders: number
  stock?: number
  description?: string
}

export interface InventoryItem {
  productId: string
  title: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  lastUpdated: string
}

export interface Payment {
  orderId: string
  productId: string
  productTitle: string
  quantity: number
  amount: number
  buyerName: string
  buyerContact?: string
  paymentStatus: string
  createdAt: string
  shippingAddress?: {
    address: string
    city: string
    state: string
    pincode: string
  }
}

export interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  conversionRate: number
  avgOrderValue: number
  revenueChange: number
  ordersChange: number
  conversionChange: number
  aovChange: number
  salesData: Array<{ month: string; sales: number }>
  revenueData: Array<{ month: string; revenue: number }>
  topProducts: Array<{
    name: string
    revenue: number
    orders: number
    growth: number
  }>
}

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}

// Custom hooks for data fetching
export function useDashboardStats() {
  const { isAuthenticated } = useAuth()
  
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    isAuthenticated ? `${API_BASE_URL}/seller/dashboard` : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
    }
  )

  return {
    stats: data,
    isLoading,
    error,
    mutate, // For manual refresh
  }
}

export function useOrders(filters?: {
  status?: string
  search?: string
  dateRange?: string
}) {
  const { isAuthenticated } = useAuth()
  
  const queryParams = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') {
    queryParams.append('status', filters.status)
  }
  if (filters?.search) {
    queryParams.append('search', filters.search)
  }
  if (filters?.dateRange && filters.dateRange !== 'all') {
    queryParams.append('dateRange', filters.dateRange)
  }
  
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_BASE_URL}/seller/orders?${queryString}`
    : `${API_BASE_URL}/seller/orders`

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    isAuthenticated ? url : null,
    fetcher,
    {
      refreshInterval: 15000, // Refresh every 15 seconds for orders
      revalidateOnFocus: true,
    }
  )

  return {
    orders: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useProducts(filters?: {
  status?: string
  search?: string
  category?: string
}) {
  const { isAuthenticated } = useAuth()
  
  const queryParams = new URLSearchParams()
  if (filters?.status && filters.status !== 'all') {
    queryParams.append('status', filters.status)
  }
  if (filters?.search) {
    queryParams.append('search', filters.search)
  }
  if (filters?.category && filters.category !== 'all') {
    queryParams.append('category', filters.category)
  }
  
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_BASE_URL}/seller/products?${queryString}`
    : `${API_BASE_URL}/seller/products`

  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    isAuthenticated ? url : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute for products
      revalidateOnFocus: true,
    }
  )

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function usePayments(filters?: {
  search?: string
  dateRange?: string
}) {
  const { isAuthenticated } = useAuth()
  
  const queryParams = new URLSearchParams()
  if (filters?.search) {
    queryParams.append('search', filters.search)
  }
  if (filters?.dateRange && filters.dateRange !== 'all') {
    queryParams.append('dateRange', filters.dateRange)
  }
  
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_BASE_URL}/seller/payments?${queryString}`
    : `${API_BASE_URL}/seller/payments`

  const { data, error, isLoading, mutate } = useSWR<Payment[]>(
    isAuthenticated ? url : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds for payments
      revalidateOnFocus: true,
    }
  )

  return {
    payments: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useAnalytics(timeRange: string = '30d') {
  const { isAuthenticated } = useAuth()
  
  const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
    isAuthenticated ? `${API_BASE_URL}/seller/analytics?range=${timeRange}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute for analytics
      revalidateOnFocus: true,
    }
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}

// Mutation functions for updating data
export function useOrderMutations() {
  const { mutate: mutateOrders } = useOrders()
  
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update order status')
      }
      
      // Revalidate orders data
      mutateOrders()
      
      return { success: true }
    } catch (error) {
      console.error('Error updating order status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  return {
    updateOrderStatus,
  }
}

export function useProductMutations() {
  const { mutate: mutateProducts } = useProducts()
  
  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product')
      }
      
      // Revalidate products data
      mutateProducts()
      
      return { success: true }
    } catch (error) {
      console.error('Error updating product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete product')
      }
      
      // Revalidate products data
      mutateProducts()
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  return {
    updateProduct,
    deleteProduct,
  }
}

export function useInventory(filters?: {
  search?: string
  stockStatus?: string
}) {
  const { isAuthenticated } = useAuth()
  
  const queryParams = new URLSearchParams()
  if (filters?.search) {
    queryParams.append('search', filters.search)
  }
  if (filters?.stockStatus && filters.stockStatus !== 'all') {
    queryParams.append('stockStatus', filters.stockStatus)
  }
  
  const queryString = queryParams.toString()
  const url = queryString 
    ? `${API_BASE_URL}/seller/inventory?${queryString}`
    : `${API_BASE_URL}/seller/inventory`

  const { data, error, isLoading, mutate } = useSWR<InventoryItem[]>(
    isAuthenticated ? url : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds for inventory
      revalidateOnFocus: true,
    }
  )

  return {
    inventory: data || [],
    isLoading,
    error,
    mutate,
  }
}

export function useInventoryMutations() {
  const { mutate: mutateInventory } = useInventory()
  
  const updateStock = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/inventory/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ stock: newStock }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update stock')
      }
      
      // Revalidate inventory data
      mutateInventory()
      
      return { success: true }
    } catch (error) {
      console.error('Error updating stock:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  return {
    updateStock,
  }
}

// Utility function for debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
