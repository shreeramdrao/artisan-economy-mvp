// frontend/hooks/use-products.ts

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { buyerApi } from '@/lib/api'

interface ProductFilters {
  category?: string
  tags?: string[]
  page?: number
  limit?: number
  sortBy?: string
  minPrice?: number
  maxPrice?: number
}

interface PaginatedProductsResponse {
  items: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const fetcher = (url: string, params: ProductFilters) => 
  buyerApi.getProducts(params)

export function useProducts(filters: ProductFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedProductsResponse>(
    ['products', filters],
    ([, params]) => fetcher('products', params as ProductFilters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // ✅ Defensive guards to prevent .map/.filter errors
  const products = Array.isArray(data?.items) ? data.items : []
  
  return {
    products,
    pagination: data ? {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 0,
      hasNext: data.hasNext || false,
      hasPrev: data.hasPrev || false,
    } : null,
    isLoading,
    error,
    mutate,
  }
}

export function useProductsInfinite(filters: ProductFilters = {}) {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<PaginatedProductsResponse>(
    ['products', { ...filters, page: currentPage }],
    ([, params]) => fetcher('products', params as ProductFilters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  )

  // Update all products when new data arrives
  useEffect(() => {
    if (data && Array.isArray(data.items)) {
      if (currentPage === 1) {
        setAllProducts(data.items)
      } else {
        setAllProducts(prev => [...prev, ...data.items])
      }
      setHasMore(data.hasNext || false)
    }
  }, [data, currentPage])

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true)
      setCurrentPage(prev => prev + 1)
    }
  }, [isLoadingMore, hasMore])

  const reset = useCallback(() => {
    setAllProducts([])
    setCurrentPage(1)
    setHasMore(true)
    setIsLoadingMore(false)
  }, [])

  return {
    products: Array.isArray(allProducts) ? allProducts : [],
    pagination: data ? {
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 10,
      totalPages: data.totalPages || 0,
      hasNext: data.hasNext || false,
      hasPrev: data.hasPrev || false,
    } : null,
    isLoading: isLoading && currentPage === 1,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    mutate,
  }
}
