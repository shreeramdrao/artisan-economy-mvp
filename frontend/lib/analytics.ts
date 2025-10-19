import { buyerApi } from './api'

export interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId: string
  timestamp: number
  properties: Record<string, any>
  page: string
  userAgent: string
}

class Analytics {
  public sessionId: string
  public userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadUserId()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private loadUserId(): void {
    if (typeof window !== 'undefined') {
      // Try to get user ID from localStorage or auth context
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId) {
        this.userId = storedUserId
      }
    }
  }

  setUserId(userId: string): void {
    this.userId = userId
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId)
    }
  }

  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Store in Firestore for logged-in users
      if (this.userId) {
        await buyerApi.trackEvent(event)
      }
      
      // Also store in localStorage for offline capability
      if (typeof window !== 'undefined') {
        const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
        events.push(event)
        
        // Keep only last 100 events to prevent localStorage bloat
        if (events.length > 100) {
          events.splice(0, events.length - 100)
        }
        
        localStorage.setItem('analytics_events', JSON.stringify(events))
      }
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  // Product interactions
  productViewed(productId: string, productTitle: string, category: string, price: number): void {
    this.trackEvent({
      event: 'product_viewed',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        productId,
        productTitle,
        category,
        price,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  productLiked(productId: string, productTitle: string, liked: boolean): void {
    this.trackEvent({
      event: 'product_liked',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        productId,
        productTitle,
        liked,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  productAddedToCart(productId: string, productTitle: string, price: number, quantity: number = 1): void {
    this.trackEvent({
      event: 'product_added_to_cart',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        productId,
        productTitle,
        price,
        quantity,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  productQuickViewed(productId: string, productTitle: string): void {
    this.trackEvent({
      event: 'product_quick_viewed',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        productId,
        productTitle,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  // Search and navigation
  searchPerformed(query: string, category: string, resultsCount: number): void {
    this.trackEvent({
      event: 'search_performed',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        query,
        category,
        resultsCount,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  categoryFiltered(category: string): void {
    this.trackEvent({
      event: 'category_filtered',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        category,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  // User engagement
  pageViewed(page: string, timeSpent?: number): void {
    this.trackEvent({
      event: 'page_viewed',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        page,
        timeSpent,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  scrollDepthReached(depth: number, page: string): void {
    this.trackEvent({
      event: 'scroll_depth_reached',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        depth,
        page,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  // E-commerce events
  checkoutStarted(totalAmount: number, itemCount: number): void {
    this.trackEvent({
      event: 'checkout_started',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        totalAmount,
        itemCount,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  orderCompleted(orderId: string, totalAmount: number, itemCount: number): void {
    this.trackEvent({
      event: 'order_completed',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        orderId,
        totalAmount,
        itemCount,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }

  // Error tracking
  errorOccurred(error: string, page: string, stack?: string): void {
    this.trackEvent({
      event: 'error_occurred',
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      properties: {
        error,
        stack,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    })
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Helper hook for React components
export function useAnalytics() {
  return analytics
}
