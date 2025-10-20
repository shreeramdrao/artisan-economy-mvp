'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  X,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export interface Notification {
  id: string
  type: 'low_stock' | 'order_delay' | 'review' | 'milestone' | 'recommendation' | 'alert'
  title: string
  message: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'medium' | 'high'
  action?: {
    label: string
    url: string
  }
  data?: any
}

interface NotificationSystemProps {
  context: any
  className?: string
}

export function NotificationSystem({ context, className = '' }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isEnabled, setIsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Initialize with some sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: 'Handmade Pottery Set is running low (3 units remaining)',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'high',
        action: {
          label: 'Restock Now',
          url: '/seller/products/inventory'
        }
      },
      {
        id: '2',
        type: 'milestone',
        title: 'Revenue Milestone',
        message: 'Congratulations! You\'ve reached ₹1,00,000 in total revenue',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        priority: 'medium'
      },
      {
        id: '3',
        type: 'review',
        title: 'New Customer Review',
        message: 'John Doe left a 5-star review for Wooden Sculpture',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        priority: 'low',
        action: {
          label: 'View Review',
          url: '/seller/products/1/reviews'
        }
      }
    ]
    
    setNotifications(sampleNotifications)
    setUnreadCount(sampleNotifications.filter(n => !n.read).length)
  }, [])

  useEffect(() => {
    if (isEnabled && context) {
      // Check for automated notifications based on context
      checkForNotifications()
    }
  }, [context, isEnabled])

  const checkForNotifications = () => {
    const newNotifications: Notification[] = []

    // Check for low stock
    if (context.products) {
      context.products.forEach((product: any) => {
        if (product.stock <= 5 && product.stock > 0) {
          const existingNotification = notifications.find(
            n => n.type === 'low_stock' && n.data?.productId === product.productId
          )
          
          if (!existingNotification) {
            newNotifications.push({
              id: `low_stock_${product.productId}`,
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${product.title} is running low (${product.stock} units remaining)`,
              timestamp: new Date(),
              read: false,
              priority: 'high',
              action: {
                label: 'Restock Now',
                url: '/seller/products/inventory'
              },
              data: { productId: product.productId }
            })
          }
        }
      })
    }

    // Check for revenue milestones
    if (context.totalRevenue) {
      const milestones = [50000, 100000, 250000, 500000, 1000000]
      const currentMilestone = milestones.find(m => 
        context.totalRevenue >= m && 
        !notifications.some(n => n.type === 'milestone' && n.data?.milestone === m)
      )
      
      if (currentMilestone) {
        newNotifications.push({
          id: `milestone_${currentMilestone}`,
          type: 'milestone',
          title: 'Revenue Milestone',
          message: `Congratulations! You've reached ₹${currentMilestone.toLocaleString()} in total revenue`,
          timestamp: new Date(),
          read: false,
          priority: 'medium',
          data: { milestone: currentMilestone }
        })
      }
    }

    // Check for order delays
    if (context.orders) {
      const delayedOrders = context.orders.filter((order: any) => {
        const orderDate = new Date(order.orderDate)
        const daysSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        return order.status === 'pending' && daysSinceOrder > 3
      })

      delayedOrders.forEach((order: any) => {
        const existingNotification = notifications.find(
          n => n.type === 'order_delay' && n.data?.orderId === order.id
        )
        
        if (!existingNotification) {
          newNotifications.push({
            id: `order_delay_${order.id}`,
            type: 'order_delay',
            title: 'Order Delay Alert',
            message: `Order #${order.id.split('-')[1]} has been pending for over 3 days`,
            timestamp: new Date(),
            read: false,
            priority: 'high',
            action: {
              label: 'Process Order',
              url: '/seller/orders'
            },
            data: { orderId: order.id }
          })
        }
      })
    }

    // Add new notifications
    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev])
      setUnreadCount(prev => prev + newNotifications.length)
      
      // Show toast notifications
      newNotifications.forEach(notification => {
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.priority === 'high' ? 'destructive' : 'default'
        })
      })

      // Play notification sound
      if (soundEnabled) {
        playNotificationSound()
      }
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {
        // Fallback to system beep
        console.log('\u0007') // ASCII bell character
      })
    } catch (error) {
      console.log('Could not play notification sound')
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="w-4 h-4" />
      case 'order_delay': return <ShoppingCart className="w-4 h-4" />
      case 'review': return <Star className="w-4 h-4" />
      case 'milestone': return <DollarSign className="w-4 h-4" />
      case 'recommendation': return <TrendingUp className="w-4 h-4" />
      case 'alert': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'low_stock': return 'text-red-600'
      case 'order_delay': return 'text-red-600'
      case 'review': return 'text-yellow-600'
      case 'milestone': return 'text-green-600'
      case 'recommendation': return 'text-blue-600'
      case 'alert': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {isEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 z-50 shadow-xl">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEnabled(!isEnabled)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark All Read
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h4>
                <p className="text-gray-600">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <div className={`mr-3 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <Badge className={`ml-2 ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                            <div className="flex items-center space-x-2">
                              {notification.action && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => {
                                    markAsRead(notification.id)
                                    // Navigate to action URL
                                    window.location.href = notification.action!.url
                                  }}
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-600">
                  {isEnabled ? 'Notifications enabled' : 'Notifications disabled'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Notification Widget for Dashboard
export function NotificationWidget({ context }: { context: any }) {
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Get recent notifications (last 3)
    const notifications = [
      {
        id: '1',
        type: 'low_stock' as const,
        title: 'Low Stock Alert',
        message: 'Handmade Pottery Set is running low',
        timestamp: new Date(),
        read: false,
        priority: 'high' as const
      },
      {
        id: '2',
        type: 'milestone' as const,
        title: 'Revenue Milestone',
        message: 'Reached ₹1,00,000 in revenue',
        timestamp: new Date(),
        read: true,
        priority: 'medium' as const
      }
    ]
    
    setRecentNotifications(notifications)
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [context])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <Package className="w-4 h-4" />
      case 'milestone': return <DollarSign className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Bell className="w-4 h-4 text-purple-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="ml-2 bg-red-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {recentNotifications.slice(0, 2).map((notification) => (
          <div
            key={notification.id}
            className={`p-2 rounded text-sm ${!notification.read ? 'bg-blue-50 border-l-2 border-blue-500' : 'bg-gray-50'}`}
          >
            <div className="flex items-center">
              <div className="text-gray-600 mr-2">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-xs">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-600">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recentNotifications.length > 2 && (
        <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
          View All Notifications
        </Button>
      )}
    </Card>
  )
}
