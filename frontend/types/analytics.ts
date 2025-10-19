export interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId: string
  timestamp: number
  properties: Record<string, any>
  page: string
  userAgent: string
}

export interface UserPreferences {
  categories: Record<string, number>
  priceRange: { min: number; max: number }
  wishlistItems: string[]
  viewedProducts: string[]
}

export interface SearchAnalytics {
  query: string
  category?: string
  resultsCount: number
  filters?: Record<string, any>
  timestamp: number
}

export interface ProductInteraction {
  productId: string
  action: 'viewed' | 'liked' | 'added_to_cart' | 'purchased'
  timestamp: number
  sessionId: string
  userId?: string
}

export interface CartAnalytics {
  action: 'added' | 'removed' | 'updated' | 'cleared'
  productId?: string
  quantity?: number
  totalItems: number
  totalValue: number
  timestamp: number
  sessionId: string
  userId?: string
}

export interface PageAnalytics {
  page: string
  timeSpent: number
  scrollDepth: number
  timestamp: number
  sessionId: string
  userId?: string
}
