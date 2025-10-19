// Background sync utilities for offline cart management
import { buyerApi } from './api'

export interface CartAction {
  id: string
  type: 'add' | 'remove' | 'update' | 'clear'
  data: any
  timestamp: number
  retryCount: number
}

export interface QueuedCartAction extends CartAction {
  endpoint: string
  method: string
  body?: any
  token?: string
}

class BackgroundSyncManager {
  private queue: QueuedCartAction[] = []
  private isOnline: boolean = true
  private syncInProgress: boolean = false

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      this.loadQueue()
      this.setupEventListeners()
    }
  }

  private setupEventListeners() {
    // Only set up event listeners on client side
    if (typeof window === 'undefined') return

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      console.log('Background Sync: Online - starting sync')
      this.syncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      console.log('Background Sync: Offline - queuing actions')
    })

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          this.syncInProgress = false
        }
      })
    }
  }

  private loadQueue() {
    // Only load from localStorage on client side
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('cartQueue')
      if (stored) {
        this.queue = JSON.parse(stored)
        console.log('Background Sync: Loaded', this.queue.length, 'queued actions')
      }
    } catch (error) {
      console.error('Background Sync: Failed to load queue:', error)
      this.queue = []
    }
  }

  private saveQueue() {
    // Only save to localStorage on client side
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('cartQueue', JSON.stringify(this.queue))
    } catch (error) {
      console.error('Background Sync: Failed to save queue:', error)
    }
  }

  // Queue a cart action for background sync
  async queueCartAction(action: CartAction): Promise<void> {
    const queuedAction: QueuedCartAction = {
      ...action,
      endpoint: this.getEndpoint(action),
      method: this.getMethod(action),
      body: this.getBody(action),
      token: this.getAuthToken(),
      retryCount: 0
    }

    this.queue.push(queuedAction)
    this.saveQueue()

    console.log('Background Sync: Queued action:', action.type)

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      await this.syncQueue()
    }
  }

  private getEndpoint(action: CartAction): string {
    switch (action.type) {
      case 'add':
        return ''
      case 'remove':
        return `/${action.data.productId}`
      case 'update':
        return `/${action.data.productId}`
      case 'clear':
        return ''
      default:
        return ''
    }
  }

  private getMethod(action: CartAction): string {
    switch (action.type) {
      case 'add':
        return 'POST'
      case 'remove':
        return 'DELETE'
      case 'update':
        return 'PATCH'
      case 'clear':
        return 'DELETE'
      default:
        return 'POST'
    }
  }

  private getBody(action: CartAction): any {
    switch (action.type) {
      case 'add':
        return {
          productId: action.data.productId,
          quantity: action.data.quantity || 1
        }
      case 'update':
        return {
          quantity: action.data.quantity
        }
      case 'clear':
        return {}
      default:
        return action.data
    }
  }

  private getAuthToken(): string | undefined {
    // Get token from cookies or localStorage
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]
      return token
    }
    return undefined
  }

  // Sync all queued actions
  async syncQueue(): Promise<void> {
    // Only sync on client side
    if (typeof window === 'undefined') return
    
    if (this.syncInProgress || !this.isOnline || this.queue.length === 0) {
      return
    }

    this.syncInProgress = true
    console.log('Background Sync: Starting sync of', this.queue.length, 'actions')

    const actionsToProcess = [...this.queue]
    const successfulActions: string[] = []

    for (const action of actionsToProcess) {
      try {
        await this.processAction(action)
        successfulActions.push(action.id)
        console.log('Background Sync: Successfully synced action:', action.type)
      } catch (error) {
        console.error('Background Sync: Failed to sync action:', action.type, error)
        
        // Increment retry count
        action.retryCount++
        
        // Remove action if it has failed too many times
        if (action.retryCount >= 3) {
          console.log('Background Sync: Removing failed action after 3 retries:', action.type)
          successfulActions.push(action.id)
        }
        
        // Stop processing on first failure to maintain order
        break
      }
    }

    // Remove successfully processed actions
    this.queue = this.queue.filter(action => !successfulActions.includes(action.id))
    this.saveQueue()

    this.syncInProgress = false

    // Trigger service worker sync if available
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        if ('sync' in registration) {
          await (registration as any).sync.register('cart-sync')
        }
      } catch (error) {
        console.log('Background Sync: Service worker sync not available:', error)
      }
    }

    console.log('Background Sync: Sync complete. Remaining actions:', this.queue.length)
  }

  private async processAction(action: QueuedCartAction): Promise<void> {
    const url = `/api/buyer/cart${action.endpoint}`
    
    const response = await fetch(url, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        ...(action.token && { 'Authorization': `Bearer ${action.token}` })
      },
      body: action.body ? JSON.stringify(action.body) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // Get current queue status
  getQueueStatus(): { count: number; actions: QueuedCartAction[] } {
    return {
      count: this.queue.length,
      actions: [...this.queue]
    }
  }

  // Clear all queued actions
  clearQueue(): void {
    this.queue = []
    this.saveQueue()
    console.log('Background Sync: Queue cleared')
  }

  // Check if there are pending actions
  hasPendingActions(): boolean {
    return this.queue.length > 0
  }

  // Get offline status
  isOffline(): boolean {
    return !this.isOnline
  }
}

// Create singleton instance
export const backgroundSync = new BackgroundSyncManager()

// Export convenience functions
export const queueCartAction = (action: CartAction) => backgroundSync.queueCartAction(action)
export const syncCartActions = () => backgroundSync.syncQueue()
export const getQueueStatus = () => backgroundSync.getQueueStatus()
export const clearCartQueue = () => backgroundSync.clearQueue()
export const hasPendingActions = () => backgroundSync.hasPendingActions()
export const isOffline = () => backgroundSync.isOffline()

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => {
      syncCartActions()
    }, 1000) // Small delay to ensure connection is stable
  })
}
